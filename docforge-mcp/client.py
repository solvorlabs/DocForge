"""
Thin HTTP client for the DocForge FastAPI backend.

Used by all MCP tool handlers to submit jobs, poll for results,
and query the search/versions endpoints.
"""

import asyncio
import logging
import os

import httpx

logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv("DOCFORGE_BACKEND_URL", "https://api.docforge.dev")
POLL_INTERVAL = 2  # seconds between status checks
MAX_WAIT = 180  # 3 minutes max


async def fetch_context(package: str, input_type: str = "npm") -> str:
    """
    Submit a context generation job and poll until complete.
    Returns the .context.md string or an error message.
    """
    async with httpx.AsyncClient(timeout=30) as client:
        # Submit job
        resp = await client.post(
            f"{BACKEND_URL}/api/context",
            json={
                "input": package,
                "input_type": input_type,
                "output_format": "context_md",
            },
        )
        resp.raise_for_status()
        job = resp.json()
        job_id = job["job_id"]
        logger.info("Submitted job %s for %s (%s)", job_id, package, input_type)

    # Poll with a fresh client (long-running)
    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(MAX_WAIT // POLL_INTERVAL):
            await asyncio.sleep(POLL_INTERVAL)

            try:
                status_resp = await client.get(f"{BACKEND_URL}/api/context/{job_id}")
                result = status_resp.json()
            except Exception as exc:
                logger.warning("Poll attempt %d failed: %s", attempt, exc)
                continue

            status = result.get("status")
            if status == "complete":
                logger.info("Job %s complete after %ds", job_id, attempt * POLL_INTERVAL)
                return result.get("output", "")
            elif status == "failed":
                error = result.get("error", "Unknown error")
                logger.error("Job %s failed: %s", job_id, error)
                return f"Error: {error}"

        return "Error: Timeout — documentation crawling took too long. Try again."


async def search_libraries(query: str) -> list[dict]:
    """Search cached libraries matching a query string."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{BACKEND_URL}/api/search",
            params={"q": query},
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("results", [])


async def list_versions(package: str) -> list[str]:
    """List all cached versions for a package."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{BACKEND_URL}/api/versions/{package}")
        resp.raise_for_status()
        data = resp.json()
        return data.get("versions", [])


async def check_health() -> bool:
    """Check if the backend is reachable."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{BACKEND_URL}/api/health")
            return resp.status_code == 200
    except Exception:
        return False