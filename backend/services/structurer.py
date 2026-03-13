"""
Gemini 1.5 Flash structuring engine.

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

import httpx

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

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

Return ONLY valid JSON (no markdown code fences, no explanation) in EXACTLY this schema:
{schema}

If the documentation mentions multiple components or modules, include each as a separate entry in "components".
If there is only one main export, use a single component entry with the library name as the component name.
Set last_verified to today's date: {today}.

Raw documentation:
{raw_docs}"""


async def structure_with_gemini(library: str, version: str, raw_docs: str) -> dict:
    """
    Call Gemini 1.5 Flash to structure raw documentation into our JSON schema.

    Uses a truncated version of raw_docs if it exceeds the safe context limit
    (~800k chars) to avoid token limit errors.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, using mock structurer")
        return _mock_structure(library, version)

    # Truncate to ~300k chars — Gemini 1.5 Flash has a 1M token context but
    # quality degrades with very long docs; keep the most relevant first pages.
    max_doc_chars = 300_000
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
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                GEMINI_ENDPOINT,
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.1,  # Low temperature for deterministic extraction
                        "maxOutputTokens": 8192,
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()

        elapsed = time.time() - t0
        logger.info("Gemini structuring took %.1fs for %s@%s", elapsed, library, version)

        raw_output = data["candidates"][0]["content"]["parts"][0]["text"]
        return _parse_gemini_json(raw_output, library, version)

    except Exception as exc:
        logger.error("Gemini structuring failed for %s@%s: %s", library, version, exc)
        raise


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