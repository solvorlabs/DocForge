"""
Structuring engine: Gemini 2.0 Flash (primary) → Groq LLaMA (fallback).

Takes raw Markdown documentation and produces a structured JSON representation
with components, props, gotchas, and version-specific details.

The prompt is engineered to hunt specifically for AI codegen failure patterns
(gotchas) that training data tends to get wrong.
"""

import json
import logging
import os
import re
import time
from datetime import date

import asyncio

import httpx

logger = logging.getLogger(__name__)


class _QuotaError(Exception):
    """Raised internally when an LLM provider returns 429."""

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
# Groq's context window is 128k tokens; keep well under to avoid truncation errors
GROQ_MAX_DOC_CHARS = 40_000

STRUCTURED_SCHEMA = """{
  "library": "string",
  "version": "string",
  "description": "string",
  "components": [
    {
      "name": "string",
      "import_path": "string (exact import statement, e.g. import X from '@/components/X')",
      "install_command": "string (exact command from docs, NOT generic 'npm install')",
      "props": [
        {
          "name": "string",
          "type": "string",
          "required": "boolean",
          "default": "string or null"
        }
      ],
      "gotchas": ["string (specific AI codegen failure patterns)"],
      "peer_dependencies": ["string"],
      "usage_example": "string (complete, runnable code snippet)",
      "last_verified": "string (ISO date)"
    }
  ]
}"""

STRUCTURING_PROMPT = """You are a documentation structuring engine for DocForge. Your job is to extract \
precise, developer-critical information from raw library documentation.

Given the following raw documentation for {library}@{version}, extract structured information.

CRITICAL — You must specifically hunt for:
1. GOTCHAS: Things that commonly break AI code generation. Examples:
   - Required directives ("use client", "use server" in Next.js App Router)
   - Deprecated props or methods from previous versions
   - Breaking changes between major versions (e.g. v4 → v5 API changes)
   - Required peer dependencies that must be installed separately
   - Common misuse patterns (wrong import path, wrong prop name)
   - Framework-specific requirements (Next.js App Router vs Pages Router)
   - CSS imports that must be added manually
   - Configuration file changes required

2. EXACT install commands — NOT generic "npm install {library}". Look for npx, dlx, or custom CLI commands.
3. EXACT import paths — these change between major versions and are the #1 AI codegen failure point.
4. All props with their TypeScript types, whether they are required, and default values.
5. Version-specific API differences if mentioned in the docs.

Return ONLY valid JSON (no markdown code fences, no explanation, no extra whitespace) in EXACTLY this schema:
{schema}

If the documentation mentions multiple components or modules, include each as a separate entry in "components".
If there is only one main export, use a single component entry with the library name as the component name.
Set last_verified to today's date: {today}.

Raw documentation:
{raw_docs}"""


async def structure_with_gemini(
    library: str,
    version: str,
    raw_docs: str,
    gemini_key: str | None = None,
    groq_key: str | None = None,
) -> dict:
    """
    Call Gemini 2.0 Flash to structure raw documentation into our JSON schema.

    gemini_key / groq_key — per-user keys that override environment variables.
    Falls back to env vars when not provided.
    """
    effective_gemini = gemini_key or GEMINI_API_KEY
    effective_groq   = groq_key   or GROQ_API_KEY

    if not effective_gemini:
        logger.warning("GEMINI_API_KEY not set, using mock structurer")
        return _mock_structure(library, version)

    # Truncate to ~80k chars — keeps Gemini token usage around 20k per request,
    # which is much friendlier to the free tier daily quota (1M tokens/day).
    # Quality is maintained: the most relevant documentation is always first.
    max_doc_chars = 80_000
    truncated = raw_docs[:max_doc_chars]
    if len(raw_docs) > max_doc_chars:
        logger.info("Truncated docs from %d to %d chars for Gemini", len(raw_docs), max_doc_chars)

    prompt = STRUCTURING_PROMPT.format(
        library=library,
        version=version,
        schema=STRUCTURED_SCHEMA,
        today=date.today().isoformat(),
        raw_docs=truncated,
    )

    t0 = time.time()
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                GEMINI_ENDPOINT,
                params={"key": effective_gemini},
                json=payload,
            )
            if resp.status_code == 429:
                raise _QuotaError("Gemini")
            resp.raise_for_status()
            data = resp.json()

        elapsed = time.time() - t0
        logger.info("Gemini structuring took %.1fs for %s@%s", elapsed, library, version)
        raw_output = data["candidates"][0]["content"]["parts"][0]["text"]
        return _parse_gemini_json(raw_output, library, version)

    except _QuotaError:
        logger.warning("Gemini quota hit for %s@%s — falling back to Groq", library, version)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            logger.warning("Gemini quota hit for %s@%s — falling back to Groq", library, version)
        else:
            logger.error("Gemini failed for %s@%s: %s", library, version, exc)
            raise
    except Exception as exc:
        logger.error("Gemini failed for %s@%s: %s", library, version, exc)
        raise

    # ── Groq fallback ────────────────────────────────────────────────────────
    return await _structure_with_groq(library, version, raw_docs, t0, groq_key=effective_groq)


async def _structure_with_groq(
    library: str, version: str, raw_docs: str, t0: float, groq_key: str | None = None
) -> dict:
    """Call Groq (LLaMA 3.3 70B) as a fallback when Gemini quota is exhausted."""
    effective_groq = groq_key or GROQ_API_KEY
    if not effective_groq:
        raise RuntimeError(
            "Gemini quota exceeded and no Groq key available. "
            "Add a Groq key in your DocForge settings (free at console.groq.com)."
        )

    truncated = raw_docs[:GROQ_MAX_DOC_CHARS]
    if len(raw_docs) > GROQ_MAX_DOC_CHARS:
        logger.info("Truncated docs from %d to %d chars for Groq", len(raw_docs), GROQ_MAX_DOC_CHARS)

    prompt = STRUCTURING_PROMPT.format(
        library=library,
        version=version,
        schema=STRUCTURED_SCHEMA,
        today=date.today().isoformat(),
        raw_docs=truncated,
    )

    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 32768,
    }

    # Retry up to 3 times on 429 with exponential backoff
    retry_delays = [10, 30, 60]
    for attempt, delay in enumerate(retry_delays):
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                GROQ_ENDPOINT,
                headers={"Authorization": f"Bearer {effective_groq}"},
                json=payload,
            )

        if resp.status_code == 429:
            if attempt < len(retry_delays) - 1:
                logger.warning(
                    "Groq rate limited for %s@%s — waiting %ds before retry %d/3",
                    library, version, delay, attempt + 1,
                )
                await asyncio.sleep(delay)
                continue
            raise RuntimeError(
                f"Groq rate limit exceeded for {library}@{version}. "
                "Both Gemini and Groq are rate-limited. Wait a minute and try again, "
                "or add a fresh API key in DocForge settings."
            )

        resp.raise_for_status()
        data = resp.json()
        break

    elapsed = time.time() - t0
    logger.info("Groq structuring took %.1fs for %s@%s", elapsed, library, version)
    raw_output = data["choices"][0]["message"]["content"]
    return _parse_gemini_json(raw_output, library, version)


def _parse_gemini_json(raw: str, library: str, version: str) -> dict:
    """
    Parse Gemini's response, handling common formatting issues.
    Gemini sometimes wraps JSON in markdown code fences even when asked not to.
    """
    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    raw = re.sub(r"\s*```$", "", raw.strip(), flags=re.MULTILINE)
    raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Gemini JSON output: %s\nRaw: %s...", exc, raw[:500])
        # Return a minimal valid structure rather than crashing
        return _mock_structure(library, version)

    # Ensure required top-level fields
    result.setdefault("library", library)
    result.setdefault("version", version)
    result.setdefault("components", [])

    # Normalize component fields
    today = date.today().isoformat()
    for comp in result.get("components", []):
        comp.setdefault("gotchas", [])
        comp.setdefault("props", [])
        comp.setdefault("peer_dependencies", [])
        comp.setdefault("last_verified", today)

    return result


def _mock_structure(library: str, version: str) -> dict:
    """
    Fallback when Gemini API key is not configured.
    Returns a minimal but valid structure for local testing.
    """
    return {
        "library": library,
        "version": version,
        "description": f"Documentation for {library}@{version}",
        "components": [
            {
                "name": library,
                "import_path": f"import {{ {library} }} from '{library}'",
                "install_command": f"npm install {library}",
                "props": [],
                "gotchas": [
                    "⚠️  Gemini API key not configured — run with GEMINI_API_KEY set for real extraction"
                ],
                "peer_dependencies": [],
                "usage_example": f"<{library} />",
                "last_verified": date.today().isoformat(),
            }
        ],
    }