"""
/api/context routes — the core DocForge pipeline endpoint.

POST /api/context   → queues a job, returns job_id immediately
GET  /api/context/{job_id} → returns job status and result when done
"""

import logging
import time
import uuid
from datetime import date

from fastapi import APIRouter, BackgroundTasks, HTTPException

from ..models.schemas import (
    ContextJobResult,
    ContextRequest,
    InputType,
    JobCreatedResponse,
    JobStatus,
    OutputFormat,
)
from ..services import cache
from ..services.formatter import format_context_md
from ..services.ingestion.npm_ingester import (
    resolve_npm_package,
    resolve_pypi_package,
)
from ..services.ingestion.paste_ingester import ingest_paste
from ..services.ingestion.url_ingester import crawl_url
from ..services.structurer import structure_with_gemini

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/context", tags=["context"])


@router.post("", response_model=JobCreatedResponse)
async def create_context_job(
    request: ContextRequest,
    background_tasks: BackgroundTasks,
) -> JobCreatedResponse:
    """
    Queue a documentation context generation job.
    Returns immediately with a job_id for polling.
    """
    job_id = str(uuid.uuid4())

    # Store initial job state
    await cache.set_job(job_id, {
        "status": JobStatus.queued,
        "job_id": job_id,
        "input": request.input,
        "input_type": request.input_type,
    })

    # Run the heavy pipeline work in the background so the HTTP response
    # returns instantly (crawling takes 30–90s)
    background_tasks.add_task(
        _run_pipeline,
        job_id=job_id,
        request=request,
    )

    logger.info("Queued job %s for input=%s type=%s", job_id, request.input, request.input_type)
    return JobCreatedResponse(job_id=job_id, status=JobStatus.queued)


@router.get("/{job_id}", response_model=ContextJobResult)
async def get_context_job(job_id: str) -> ContextJobResult:
    """Poll job status. Returns output when status == 'complete'."""
    job = await cache.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return ContextJobResult(**job)


# ---------------------------------------------------------------------------
# Background pipeline
# ---------------------------------------------------------------------------

async def _run_pipeline(job_id: str, request: ContextRequest) -> None:
    """
    Full DocForge pipeline:
    1. Resolve package / fetch URL / clone repo
    2. Crawl documentation
    3. Structure with Gemini
    4. Format as .context.md
    5. Cache result
    """
    t_start = time.time()

    async def update_status(status: str, **extra: object) -> None:
        job = await cache.get_job(job_id) or {}
        job.update({"status": status, "job_id": job_id, **extra})
        await cache.set_job(job_id, job)

    try:
        await update_status(JobStatus.processing)

        # ── Step 1: Resolve metadata ──────────────────────────────────────
        library = request.input
        version = "latest"
        docs_url: str | None = None

        if request.input_type == InputType.npm:
            meta = await resolve_npm_package(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved npm: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.pypi:
            meta = await resolve_pypi_package(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved PyPI: %s@%s docs=%s", library, version, docs_url)

        # ── Step 2: Check cache (skip expensive crawl if already done) ────
        cached = await cache.get_cached_context(library, version)
        if cached:
            output = format_context_md(cached) if request.output_format == OutputFormat.context_md else str(cached)
            await update_status(
                JobStatus.complete,
                library=library,
                version=version,
                output=output,
                components=cached.get("components", []),
            )
            logger.info("Cache hit for %s@%s, job %s done in %.1fs", library, version, job_id, time.time() - t_start)
            return

        # ── Step 3: Crawl documentation ───────────────────────────────────
        raw_docs = ""

        if request.input_type == InputType.paste:
            raw_docs = await ingest_paste(request.content or request.input)

        elif request.input_type == InputType.github:
            from ..services.ingestion.github_ingester import ingest_github_repo
            raw_docs = await ingest_github_repo(request.input)

        elif request.input_type == InputType.url:
            raw_docs = await crawl_url(request.input)

        else:
            # npm or pypi: crawl the resolved docs URL
            if docs_url:
                if "github.com" in docs_url:
                    # GitHub repo URLs → use the GitHub ingester (README + /docs)
                    from ..services.ingestion.github_ingester import ingest_github_repo
                    raw_docs = await ingest_github_repo(docs_url)
                else:
                    raw_docs = await crawl_url(docs_url)
            else:
                # No homepage found
                logger.warning("No docs URL found for %s, using npm README only", library)
                raw_docs = f"Library: {library}\nVersion: {version}\nNo documentation URL found."

        logger.info("Crawl done for %s@%s: %d chars in %.1fs", library, version, len(raw_docs), time.time() - t_start)

        # ── Step 4: Structure with Gemini ─────────────────────────────────
        structured = await structure_with_gemini(library, version, raw_docs)

        # Filter to requested components if specified
        if request.components:
            requested = {c.lower() for c in request.components}
            structured["components"] = [
                c for c in structured.get("components", [])
                if c.get("name", "").lower() in requested
            ]

        # ── Step 5: Format output ─────────────────────────────────────────
        if request.output_format == OutputFormat.context_md:
            output = format_context_md(structured)
        else:
            import json
            output = json.dumps(structured, indent=2)

        # ── Step 6: Cache and complete ────────────────────────────────────
        structured["cached_at"] = date.today().isoformat()
        await cache.set_cached_context(library, version, structured)

        total = time.time() - t_start
        logger.info("Pipeline complete for %s@%s in %.1fs", library, version, total)

        await update_status(
            JobStatus.complete,
            library=library,
            version=version,
            output=output,
            components=structured.get("components", []),
        )

    except Exception as exc:
        logger.exception("Pipeline failed for job %s: %s", job_id, exc)
        await update_status(JobStatus.failed, error=str(exc))