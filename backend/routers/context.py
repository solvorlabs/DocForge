"""
/api/context routes — the core DocForge pipeline endpoint.

POST /api/context   → queues a job, returns job_id immediately
GET  /api/context/{job_id} → returns job status and result when done
"""

import logging
import time
import uuid
from datetime import date
from urllib.parse import urlparse

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

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
from ..services.ingestion.registries_ingester import (
    resolve_crates,
    resolve_cran,
    resolve_hex,
    resolve_maven,
    resolve_nuget,
    resolve_pubdev,
    resolve_rubygems,
)
from ..services.ingestion.search_ingester import find_docs_url
from ..services.ingestion.url_ingester import crawl_url
from ..services.structurer import structure_with_gemini

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/context", tags=["context"])


@router.post("", response_model=JobCreatedResponse)
async def create_context_job(
    request: ContextRequest,
    background_tasks: BackgroundTasks,
    http_request: Request,
) -> JobCreatedResponse:
    """
    Queue a documentation context generation job.
    Returns immediately with a job_id for polling.

    If a valid Bearer token is provided the user's stored API keys are used for
    the AI step; otherwise falls back to env-var keys (dev / open access).
    """
    # ── Auth: prefer stored keys from Bearer token, fall back to request body ─
    gemini_key: str | None = None
    groq_key:   str | None = None

    auth_header = http_request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        from ..services.auth_service import decode_token, get_api_keys
        payload = decode_token(auth_header.split(" ", 1)[1])
        if payload:
            keys = await get_api_keys(payload["sub"])
            gemini_key = keys.get("gemini_key")
            groq_key   = keys.get("groq_key")

    # CLI local-key mode: keys sent directly in the request body
    if not gemini_key and not groq_key:
        gemini_key = request.gemini_key or None
        groq_key   = request.groq_key or None

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
        gemini_key=gemini_key,
        groq_key=groq_key,
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

async def _run_pipeline(
    job_id: str,
    request: ContextRequest,
    gemini_key: str | None = None,
    groq_key: str | None = None,
) -> None:
    """
    Full DocForge pipeline:
    1. Resolve package / fetch URL / clone repo
    2. Crawl documentation
    3. Structure with Gemini (using user's stored key if authenticated)
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
        version_tag: str | None = None
        copypaste_docs: str | None = None  # pre-fetched docs for copy-paste libs
        pre_structured: dict | None = None  # pre-built structured dict (skips LLM)

        if request.input_type == InputType.npm:
            # If the user somehow passed a URL as an npm package, treat it as a URL crawl
            if request.input.startswith(("http://", "https://")):
                logger.warning("npm input looks like a URL — switching to URL crawl: %s", request.input)
                raw_docs = await crawl_url(request.input)
                structured = await structure_with_gemini(library, version, raw_docs, gemini_key=gemini_key, groq_key=groq_key)
                output = format_context_md(structured) if request.output_format == OutputFormat.context_md else __import__("json").dumps(structured, indent=2)
                structured["cached_at"] = date.today().isoformat()
                await cache.set_cached_context(library, version, structured)
                await update_status(JobStatus.complete, library=library, version=version, output=output, components=structured.get("components", []))
                return
            meta = await resolve_npm_package(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            version_tag = meta.get("_version_tag")  # set when version not on npm but GitHub exists
            # Copy-paste library: docs already fetched during resolution
            if meta.get("_is_copypaste"):
                copypaste_docs = meta.get("_raw_docs", "")
                pre_structured = meta.get("_structured") or None
                logger.info(
                    "Copy-paste library '%s' detected via %s — skipping crawl (%d chars pre-fetched)",
                    library, meta.get("_copypaste_method"), len(copypaste_docs),
                )
            else:
                logger.info("Resolved npm: %s@%s docs=%s tag=%s", library, version, docs_url, version_tag)

        elif request.input_type == InputType.pypi:
            meta = await resolve_pypi_package(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved PyPI: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.crates:
            meta = await resolve_crates(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved crates.io: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.rubygems:
            meta = await resolve_rubygems(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved RubyGems: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.pubdev:
            meta = await resolve_pubdev(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved pub.dev: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.nuget:
            meta = await resolve_nuget(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved NuGet: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.maven:
            meta = await resolve_maven(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved Maven: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.hex:
            meta = await resolve_hex(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved Hex: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.cran:
            meta = await resolve_cran(request.input)
            library = meta["name"]
            version = meta["version"]
            docs_url = meta.get("homepage")
            logger.info("Resolved CRAN: %s@%s docs=%s", library, version, docs_url)

        elif request.input_type == InputType.url:
            # Derive a clean library name from the domain so the cache key is
            # human-readable ("reactbits") rather than the raw URL.
            # GitHub URLs keep their repo name; plain URLs use the domain stem.
            if "github.com" in request.input:
                # e.g. https://github.com/DavidHDev/react-bits → react-bits
                parts = [p for p in urlparse(request.input).path.split("/") if p]
                library = parts[1] if len(parts) >= 2 else request.input
            else:
                domain = urlparse(request.input).netloc.removeprefix("www.")
                library = domain.split(".")[0]  # "reactbits" from "reactbits.dev"
            logger.info("URL input '%s' → library name '%s' for cache/structuring", request.input, library)

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

        # Copy-paste library — docs were fetched during resolution, skip crawl
        if copypaste_docs is not None:
            raw_docs = copypaste_docs

        elif request.input_type == InputType.paste:
            raw_docs = await ingest_paste(request.content or request.input)

        elif request.input_type == InputType.github:
            from ..services.ingestion.github_ingester import ingest_github_repo
            raw_docs = await ingest_github_repo(request.input)

        elif request.input_type == InputType.url:
            if "github.com" in request.input:
                from ..services.ingestion.github_ingester import ingest_github_repo
                raw_docs = await ingest_github_repo(request.input)
            else:
                import asyncio as _asyncio
                from ..services.ingestion.url_ingester import extract_github_url
                from ..services.ingestion.copypaste_ingester import (
                    check_jsrepo, check_shadcn_registry, detect_and_ingest,
                )

                # library is already set to the clean name_hint in Step 1
                # ── Parallel: all three lightweight checks at once ─────────────
                # check_shadcn_registry hits /r/registry.json etc. — it does NOT
                # need a GitHub URL, so it runs alongside the other two.
                github_url, jsrepo_name_docs, shadcn_result = await _asyncio.gather(
                    extract_github_url(request.input),
                    check_jsrepo(library, None),
                    check_shadcn_registry(request.input, library),
                )

                # shadcn registry returns a pre-built structured dict — skip LLM entirely
                if shadcn_result is not None:
                    pre_structured = shadcn_result
                    logger.info(
                        "URL '%s' → shadcn registry match for '%s' (%d components, skipping LLM)",
                        request.input, library, len(pre_structured.get("components", [])),
                    )

                else:
                    # Prefer jsrepo registry hits for the raw-docs path
                    quick_docs = jsrepo_name_docs

                    # If we also have a GitHub URL, do a targeted jsrepo check
                    # (raw GitHub paths + jsrepo/{owner}/{repo}).
                    jsrepo_targeted: str | None = None
                    if github_url and not quick_docs:
                        jsrepo_targeted = await check_jsrepo(library, github_url)

                    cp_docs = jsrepo_targeted or quick_docs

                    if cp_docs:
                        raw_docs = cp_docs
                        logger.info("URL '%s' → registry match for '%s' (%d chars)", request.input, library, len(raw_docs))

                    elif github_url:
                        logger.info("URL '%s' → GitHub repo found: %s", request.input, github_url)
                        # copy-paste detection with full github_url context
                        cp_result = await detect_and_ingest(
                            name=library,
                            github_url=github_url,
                            homepage=request.input,
                        )
                        if cp_result:
                            raw_docs = cp_result.get("_raw_docs", "")
                            logger.info(
                                "URL '%s' → copy-paste lib (method=%s) %d chars",
                                request.input, cp_result.get("_copypaste_method"), len(raw_docs),
                            )
                        else:
                            # Not copy-paste — GitHub ingester still beats Playwright
                            from ..services.ingestion.github_ingester import ingest_github_repo
                            raw_docs = await ingest_github_repo(github_url)
                            logger.info("URL '%s' → GitHub ingestion (%d chars)", request.input, len(raw_docs))

                    else:
                        # No GitHub found — fall back to Playwright
                        raw_docs = await crawl_url(request.input)
                        logger.info("URL '%s' → Playwright crawl (%d chars)", request.input, len(raw_docs))

                        # Sparse content — try GitHub search by domain name.
                        # Only accept a fallback repo whose homepage points back to the
                        # same domain we started from (prevents picking up unrelated
                        # packages like MCP wrappers that happen to mention the name).
                        if len(raw_docs) < 20_000:
                            import httpx
                            input_domain = urlparse(request.input).netloc.removeprefix("www.")
                            async with httpx.AsyncClient(timeout=10) as _client:
                                from ..services.ingestion.npm_ingester import _github_search
                                fallback = await _github_search(_client, library)
                                if fallback:
                                    # Quick check: does the GitHub repo's homepage match?
                                    try:
                                        meta_resp = await _client.get(
                                            f"https://api.github.com/repos/{fallback.removeprefix('https://github.com/')}",
                                            headers={"User-Agent": "docforge/1.0", "Accept": "application/vnd.github+json"},
                                            timeout=5,
                                        )
                                        if meta_resp.is_success:
                                            repo_homepage = meta_resp.json().get("homepage") or ""
                                            if input_domain not in repo_homepage:
                                                logger.info(
                                                    "GitHub fallback '%s' homepage '%s' doesn't match domain '%s' — skipping",
                                                    fallback, repo_homepage, input_domain,
                                                )
                                                fallback = None
                                    except Exception:
                                        fallback = None  # if we can't verify, skip it

                            if fallback:
                                logger.info(
                                    "Sparse Playwright content (%d chars) for '%s' — trying GitHub: %s",
                                    len(raw_docs), request.input, fallback,
                                )
                                from ..services.ingestion.github_ingester import ingest_github_repo
                                github_docs = await ingest_github_repo(fallback)
                                if len(github_docs) > len(raw_docs):
                                    raw_docs = github_docs

        else:
            # npm or pypi: crawl the resolved docs URL
            if version_tag and not docs_url:
                # Version not on npm but GitHub repo known — use git tag directly
                from ..services.ingestion.github_ingester import ingest_github_repo
                repo_url = meta.get("repository", "")
                import re as _re
                repo_url = _re.sub(r"^git\+", "", repo_url)
                logger.info("Using GitHub tag %s for %s", version_tag, repo_url)
                raw_docs = await ingest_github_repo(repo_url, version_tag=version_tag)
            elif docs_url:
                if "github.com" in docs_url:
                    from ..services.ingestion.github_ingester import ingest_github_repo
                    raw_docs = await ingest_github_repo(docs_url, version_tag=version_tag)
                else:
                    raw_docs = await crawl_url(docs_url)
            else:
                # Web search fallback: query DuckDuckGo for docs
                found_url = await find_docs_url(f"{library} {version}")
                if found_url:
                    logger.info("Web search found docs for %s: %s", library, found_url)
                    if "github.com" in found_url:
                        from ..services.ingestion.github_ingester import ingest_github_repo
                        raw_docs = await ingest_github_repo(found_url)
                    else:
                        raw_docs = await crawl_url(found_url)
                else:
                    logger.warning("No docs URL found for %s, sending minimal stub", library)
                    raw_docs = f"Library: {library}\nVersion: {version}\nNo documentation URL found."

        logger.info("Crawl done for %s@%s: %d chars in %.1fs", library, version, len(raw_docs), time.time() - t_start)

        # ── Step 4: Structure with Gemini ─────────────────────────────────
        # Skip LLM for copy-paste libraries with pre-built structured data
        if pre_structured is not None:
            structured = pre_structured
            structured.setdefault("library", library)
            structured.setdefault("version", version)
            logger.info("Using pre-built structure for %s@%s (%d components)", library, version, len(structured.get("components", [])))
        else:
            structured = await structure_with_gemini(library, version, raw_docs, gemini_key=gemini_key, groq_key=groq_key)

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