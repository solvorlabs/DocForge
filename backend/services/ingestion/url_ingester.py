"""
URL ingester using Playwright for JS-rendered documentation sites.

Many modern doc sites (React-based, Next.js, VitePress, etc.) render content
client-side, so httpx alone returns empty shells. Playwright runs a real browser
to get the fully rendered DOM.

Falls back to static crawl if Playwright is not installed.
"""

import asyncio
import logging
import os
import random
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

PLAYWRIGHT_TIMEOUT = int(os.getenv("PLAYWRIGHT_TIMEOUT", "60000"))  # ms

# Realistic Chrome user agent — rotated per session to avoid fingerprinting
_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
]


async def crawl_with_playwright(url: str, max_pages: int = 15) -> str:
    """
    Use Playwright Chromium to crawl a JS-rendered documentation site.
    Returns concatenated text content from all discovered pages.
    """
    try:
        from playwright.async_api import async_playwright  # type: ignore[import]
    except ImportError:
        logger.warning("Playwright not installed, falling back to static crawl")
        from .npm_ingester import crawl_static_docs
        return await crawl_static_docs(url, max_pages)

    logger.info("Playwright crawl starting at %s", url)
    pages_text: list[str] = []
    visited: set[str] = set()
    to_visit = [url]

    base = urlparse(url)
    base_origin = f"{base.scheme}://{base.netloc}"

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )
        context = await browser.new_context(
            user_agent=random.choice(_USER_AGENTS),
            viewport={"width": 1280, "height": 800},
            locale="en-US",
            timezone_id="America/New_York",
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
        )
        # Remove the webdriver property that sites use to detect Playwright
        await context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        page = await context.new_page()
        page.set_default_timeout(PLAYWRIGHT_TIMEOUT)

        while to_visit and len(pages_text) < max_pages:
            current_url = to_visit.pop(0)
            if current_url in visited:
                continue
            visited.add(current_url)

            try:
                await page.goto(current_url, wait_until="domcontentloaded", timeout=15000)
                # Human-like random delay between pages (1–2.5s)
                await asyncio.sleep(random.uniform(1.0, 2.5))

                text = await page.evaluate("""() => {
                    // Remove nav, footer, scripts and extract meaningful text
                    const remove = ['script', 'style', 'nav', 'footer', 'header', '.sidebar', '.navigation'];
                    remove.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
                    return document.body ? document.body.innerText : '';
                }""")

                if text.strip():
                    pages_text.append(f"\n\n<!-- SOURCE: {current_url} -->\n{text}")
                    logger.debug("Playwright crawled %s (%d chars)", current_url, len(text))

                # Collect doc links
                links = await page.evaluate(f"""() => {{
                    return Array.from(document.querySelectorAll('a[href]'))
                        .map(a => a.href)
                        .filter(href => href.startsWith('{base_origin}'));
                }}""")

                for link in links[:20]:
                    clean = link.split("#")[0].split("?")[0]
                    if clean not in visited and _is_doc_link(clean):
                        to_visit.append(clean)

            except Exception as exc:
                logger.warning("Playwright failed on %s: %s", current_url, exc)

        await browser.close()

    combined = "\n".join(pages_text)
    logger.info("Playwright crawl done: %d pages, %d chars total", len(pages_text), len(combined))
    return combined


async def crawl_url(url: str, max_pages: int = 15) -> str:
    """
    Entry point: try Playwright first (handles JS sites), fall back to static.
    """
    return await crawl_with_playwright(url, max_pages)


def _is_doc_link(url: str) -> bool:
    """Filter out non-documentation links."""
    bad_exts = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
                ".css", ".js", ".woff", ".woff2", ".ttf", ".map")
    bad_paths = ("/api/", "/cdn-cgi/", "/_next/", "/__vite", "/assets/")
    path = urlparse(url).path.lower()
    return (
        not any(path.endswith(ext) for ext in bad_exts)
        and not any(bad in path for bad in bad_paths)
    )