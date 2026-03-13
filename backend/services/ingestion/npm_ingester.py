"""
npm/PyPI package ingester.

Resolves a package name + version to its documentation URL,
then fetches and returns raw Markdown content.

Phase 1: httpx-based static crawl (fast, works for most docs).
Phase 2 (Playwright) is in url_ingester.py for JS-rendered sites.
"""

import logging
import re
from urllib.parse import urljoin, urlparse

import httpx

logger = logging.getLogger(__name__)

NPM_REGISTRY = "https://registry.npmjs.org"
PYPI_REGISTRY = "https://pypi.org/pypi"


async def resolve_npm_package(package_input: str) -> dict:
    """
    Parse 'react-bits@2.1.4' or '@tanstack/react-query@5.0.0' and
    fetch metadata from the npm registry.
    """
    name, version = _parse_npm_input(package_input)

    async with httpx.AsyncClient(timeout=30) as client:
        url = f"{NPM_REGISTRY}/{name}/{version}"
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    homepage = data.get("homepage") or _extract_github_pages(data)
    repository_url = (data.get("repository") or {}).get("url", "")

    return {
        "name": data["name"],
        "version": data["version"],
        "description": data.get("description"),
        "homepage": homepage,
        "repository": repository_url,
        "keywords": data.get("keywords", []),
    }


async def resolve_pypi_package(package_input: str) -> dict:
    """
    Parse 'fastapi' or 'fastapi==0.110.0' and fetch metadata from PyPI.
    """
    if "==" in package_input:
        name, version = package_input.split("==", 1)
    else:
        name, version = package_input, None

    async with httpx.AsyncClient(timeout=30) as client:
        if version:
            url = f"{PYPI_REGISTRY}/{name}/{version}/json"
        else:
            url = f"{PYPI_REGISTRY}/{name}/json"
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    info = data["info"]
    homepage = info.get("home_page") or info.get("project_urls", {}).get("Documentation")
    resolved_version = info["version"]

    return {
        "name": info["name"],
        "version": resolved_version,
        "description": info.get("summary"),
        "homepage": homepage,
        "repository": info.get("project_urls", {}).get("Source"),
    }


async def crawl_static_docs(url: str, max_pages: int = 10) -> str:
    """
    Crawl a documentation site using httpx (fast, works for static HTML).
    Returns concatenated Markdown-ish text extracted from the HTML.
    Falls back to url_ingester's Playwright crawler for JS-rendered sites.
    """
    logger.info("Static crawl starting at %s", url)
    visited: set[str] = set()
    pages: list[str] = []

    base = urlparse(url)
    base_origin = f"{base.scheme}://{base.netloc}"

    to_visit = [url]

    async with httpx.AsyncClient(
        timeout=30,
        headers={"User-Agent": "DocForge/1.0 (documentation indexer)"},
        follow_redirects=True,
    ) as client:
        while to_visit and len(pages) < max_pages:
            current_url = to_visit.pop(0)
            if current_url in visited:
                continue
            visited.add(current_url)

            try:
                resp = await client.get(current_url)
                if resp.status_code != 200:
                    continue
                ct = resp.headers.get("content-type", "")
                if "html" not in ct:
                    continue

                text = _html_to_text(resp.text)
                pages.append(f"\n\n<!-- SOURCE: {current_url} -->\n{text}")
                logger.debug("Crawled %s (%d chars)", current_url, len(text))

                # Discover links on the same origin that look like doc pages
                new_links = _extract_doc_links(resp.text, base_origin, current_url)
                for link in new_links:
                    if link not in visited:
                        to_visit.append(link)

            except Exception as exc:
                logger.warning("Failed to fetch %s: %s", current_url, exc)

    combined = "\n".join(pages)
    logger.info("Static crawl done: %d pages, %d chars total", len(pages), len(combined))
    return combined


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_npm_input(package_input: str) -> tuple[str, str]:
    """Handle both 'pkg@version' and '@scope/pkg@version' forms.

    Strips surrounding quotes/whitespace and semver range prefixes so raw
    package.json values like '@emotion/styled": "^11.14.0' are handled cleanly.
    """
    package_input = package_input.strip().strip("\"'")

    if package_input.startswith("@"):
        # Scoped package: extract @scope/name, then optionally @version
        m = re.match(r'^(@[A-Za-z0-9._-]+/[A-Za-z0-9._-]+)(?:@([^\s"\':]*))?', package_input)
        if m:
            name = m.group(1)
            raw_version = m.group(2) or ""
        else:
            # Fallback: split on last '@' if there are two or more
            at_count = package_input.count("@")
            if at_count >= 2:
                last_at = package_input.rfind("@")
                name = package_input[:last_at]
                raw_version = package_input[last_at + 1:]
            else:
                name = package_input
                raw_version = ""
    else:
        if "@" in package_input:
            name, raw_version = package_input.rsplit("@", 1)
        else:
            name = package_input
            raw_version = ""

    # Strip semver range prefixes (^, ~, >=, <=, >, <, =) from version
    version = re.sub(r"^[^0-9]*", "", raw_version.strip().strip("\"'"))

    # If still no version, scan the original input for any semver-like number
    # (handles raw package.json values like '@scope/pkg": "^6.4.8"')
    if not version:
        fallback = re.search(r'(\d+\.\d+[\.\d]*)', package_input)
        version = fallback.group(1) if fallback else "latest"

    return name.strip(), version


def _extract_github_pages(data: dict) -> str | None:
    """Try to derive a docs URL from the GitHub repository URL."""
    repo = (data.get("repository") or {}).get("url", "")
    if "github.com" in repo:
        # Convert git+https://github.com/user/repo.git → https://user.github.io/repo
        match = re.search(r"github\.com[:/]([^/]+)/([^/.]+)", repo)
        if match:
            user, repo_name = match.group(1), match.group(2)
            return f"https://{user}.github.io/{repo_name}"
    return None


def _html_to_text(html: str) -> str:
    """
    Very lightweight HTML → text converter.
    We strip tags and normalize whitespace so Gemini can process the content.
    For production, Docling by IBM does a much better job with complex layouts.
    """
    # Remove scripts and styles completely
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.DOTALL | re.IGNORECASE)
    # Replace block-level tags with newlines
    html = re.sub(r"<(h[1-6]|p|div|section|article|li|tr|br)[^>]*>", "\n", html, flags=re.IGNORECASE)
    # Remove remaining tags
    html = re.sub(r"<[^>]+>", "", html)
    # Decode basic HTML entities
    html = html.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&nbsp;", " ").replace("&#39;", "'").replace("&quot;", '"')
    # Collapse excessive whitespace
    html = re.sub(r"\n{3,}", "\n\n", html)
    html = re.sub(r" {2,}", " ", html)
    return html.strip()


def _extract_doc_links(html: str, base_origin: str, current_url: str) -> list[str]:
    """Extract same-origin links that look like documentation pages."""
    hrefs = re.findall(r'href=["\']([^"\'#?]+)["\']', html)
    links = []
    for href in hrefs:
        if href.startswith("http"):
            full = href
        elif href.startswith("/"):
            full = base_origin + href
        else:
            full = urljoin(current_url, href)

        parsed = urlparse(full)
        if parsed.netloc != urlparse(base_origin).netloc:
            continue
        # Skip obviously non-doc paths
        if any(ext in parsed.path for ext in [".png", ".jpg", ".css", ".js", ".svg", ".ico", ".woff"]):
            continue
        links.append(full)
    return links[:20]  # Safety cap per page