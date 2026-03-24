"""
Web search fallback using DuckDuckGo HTML endpoint.

When a library isn't found in any known registry (or has no docs URL),
this module searches DuckDuckGo for "{library} documentation" and returns
the first organic result URL for the crawling pipeline to consume.

No API key needed — uses the public HTML endpoint.
"""

import logging
import re
from urllib.parse import unquote

import httpx

logger = logging.getLogger(__name__)

_TIMEOUT = 20
_USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


async def find_docs_url(query: str) -> str | None:
    """
    Search DuckDuckGo for '{query} documentation' and return the first result URL.
    Returns None if nothing useful is found.
    """
    search_query = f"{query} documentation"
    from urllib.parse import quote_plus
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(search_query)}"

    logger.info("Web search fallback: searching for '%s'", query)

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(
                url,
                headers={
                    "User-Agent": _USER_AGENT,
                    "Accept": "text/html,application/xhtml+xml",
                },
                follow_redirects=True,
            )
            if not resp.is_success:
                logger.warning("DuckDuckGo search returned %s", resp.status_code)
                return None
            html = resp.text
    except Exception as exc:
        logger.warning("DuckDuckGo search failed: %s", exc)
        return None

    # DuckDuckGo HTML results encode actual URLs as uddg= query param:
    # href="//duckduckgo.com/l/?uddg=https%3A%2F%2Freact.dev%2F&rut=..."
    matches = re.findall(r"uddg=([^&\"'>\s]+)", html)
    for encoded in matches:
        try:
            decoded = unquote(encoded)
        except Exception:
            decoded = encoded

        if decoded.startswith("http") and "duckduckgo.com" not in decoded:
            logger.info("Web search found docs URL: %s", decoded)
            return decoded

    logger.warning("No usable docs URL found via web search for '%s'", query)
    return None
