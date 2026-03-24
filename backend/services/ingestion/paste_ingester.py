"""
Paste/upload ingester.

Accepts raw HTML, PDF (via Docling), or plain Markdown from the user
and converts it to clean Markdown suitable for Gemini structuring.
"""

import logging
import re

logger = logging.getLogger(__name__)


async def ingest_paste(content: str, content_type: str = "auto") -> str:
    """
    Process pasted or uploaded content into clean Markdown.

    content_type: "html" | "markdown" | "pdf_base64" | "auto"
    """
    if content_type == "auto":
        content_type = _detect_content_type(content)

    logger.info("Processing paste content as %s (%d chars)", content_type, len(content))

    if content_type == "html":
        return _html_to_markdown(content)
    elif content_type == "pdf_base64":
        return await _pdf_to_markdown(content)
    else:
        # Already Markdown or plain text — pass through with minimal cleanup
        return _clean_markdown(content)


def _detect_content_type(content: str) -> str:
    """Heuristic detection of content format."""
    stripped = content.strip()
    if stripped.startswith("<!DOCTYPE") or stripped.startswith("<html") or stripped.count("<div") > 3:
        return "html"
    # Base64-encoded PDF starts with JVBERi0
    if stripped.startswith("JVBERi0"):
        return "pdf_base64"
    return "markdown"


def _html_to_markdown(html: str) -> str:
    """
    Convert HTML to Markdown.
    Uses html2text if available, otherwise falls back to regex stripping.
    """
    try:
        import html2text  # type: ignore[import]
        h = html2text.HTML2Text()
        h.ignore_links = False
        h.ignore_images = True
        h.body_width = 0  # Don't wrap lines
        return h.handle(html)
    except ImportError:
        logger.debug("html2text not installed, using regex fallback")
        return _regex_html_strip(html)


def _regex_html_strip(html: str) -> str:
    """Minimal HTML → text via regex (fallback when html2text unavailable)."""
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.DOTALL | re.IGNORECASE)
    # Convert headings
    for i in range(6, 0, -1):
        html = re.sub(rf"<h{i}[^>]*>(.*?)</h{i}>", rf"{'#' * i} \1\n", html, flags=re.IGNORECASE | re.DOTALL)
    # Code blocks
    html = re.sub(r"<pre[^>]*>(.*?)</pre>", r"```\n\1\n```", html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r"<code[^>]*>(.*?)</code>", r"`\1`", html, flags=re.IGNORECASE | re.DOTALL)
    # Lists
    html = re.sub(r"<li[^>]*>(.*?)</li>", r"- \1", html, flags=re.IGNORECASE | re.DOTALL)
    # Paragraphs and divs
    html = re.sub(r"<(p|div|br)[^>]*>", "\n", html, flags=re.IGNORECASE)
    # Strip remaining tags
    html = re.sub(r"<[^>]+>", "", html)
    # Decode entities
    html = html.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&nbsp;", " ")
    return re.sub(r"\n{3,}", "\n\n", html).strip()


async def _pdf_to_markdown(pdf_base64: str) -> str:
    """
    Convert base64-encoded PDF to Markdown using Docling by IBM.
    Falls back to a message if Docling is not installed.
    """
    try:
        import base64
        import io

        from docling.document_converter import DocumentConverter  # type: ignore[import]

        pdf_bytes = base64.b64decode(pdf_base64)
        converter = DocumentConverter()
        # Docling expects a file path or URL; write to temp file
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(pdf_bytes)
            tmp_path = f.name

        result = converter.convert(tmp_path)
        return result.document.export_to_markdown()
    except ImportError:
        logger.warning("Docling not installed, cannot convert PDF")
        return "[PDF conversion requires Docling: pip install docling]"
    except Exception as exc:
        logger.error("PDF conversion failed: %s", exc)
        return f"[PDF conversion failed: {exc}]"


def _clean_markdown(text: str) -> str:
    """Remove excessive blank lines and leading/trailing whitespace."""
    return re.sub(r"\n{4,}", "\n\n\n", text).strip()