"""
DocForge FastAPI Backend

Thin client / fat backend architecture:
- All heavy lifting (crawling, structuring, caching) happens here
- VS Code extension and MCP server are thin HTTP clients to this API

Run locally:
    uvicorn backend.main:app --reload --port 8000

Or via Makefile:
    make dev-backend
"""

import logging
import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Request

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import context, corrections, search, versions

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── App initialization ────────────────────────────────────────────────────────
app = FastAPI(
    title="DocForge API",
    description=(
        "Turn any library's documentation into a prompt-ready .context.md file, "
        "pinned to the exact version you're using."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow VS Code extension and MCP server to call from any origin during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def log_request_time(request: Request, call_next):
    t0 = time.time()
    response = await call_next(request)
    elapsed_ms = (time.time() - t0) * 1000
    logger.info("%s %s → %d (%.0fms)", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(context.router)
app.include_router(corrections.router)
app.include_router(search.router)
app.include_router(versions.router)


@app.get("/api/health", tags=["health"])
async def health_check() -> dict:
    """Health check endpoint — used by VS Code extension to verify backend connectivity."""
    return {
        "status": "ok",
        "service": "docforge-api",
        "version": "1.0.0",
        "dev_mode": os.getenv("DEV_MODE", "true").lower() == "true",
    }


@app.get("/", tags=["root"])
async def root() -> dict:
    return {
        "message": "DocForge API is running",
        "docs": "/docs",
        "health": "/api/health",
    }


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s: %s", request.url, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )