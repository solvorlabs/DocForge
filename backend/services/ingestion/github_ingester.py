"""
GitHub repository ingester.

Primary path  — GitHub Contents API (no clone, no disk I/O, fast):
  Fetches README, docs/, and .d.ts files via authenticated HTTPS API calls.
  Works for repos of any size; no git toolchain required.

Fallback path — shallow git clone:
  Used only when the repo is not on github.com (e.g. GitLab, self-hosted).
  120 s timeout kept for compatibility.
"""

import base64
import logging
import os
import re
import subprocess
import tempfile
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
_GH_API = "https://api.github.com"


def _gh_headers() -> dict[str, str]:
    h = {"User-Agent": "docforge/1.0", "Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return h


def _parse_owner_repo(url: str) -> tuple[str, str] | None:
    """Extract (owner, repo) from any github.com URL variant."""
    m = re.search(r"github\.com[/:]([^/]+)/([^/.]+)", url)
    if m:
        return m.group(1), m.group(2)
    return None


async def _api_file_content(client: httpx.AsyncClient, owner: str, repo: str, path: str, ref: str | None) -> str | None:
    """Fetch a single file from the GitHub contents API. Returns decoded text or None."""
    url = f"{_GH_API}/repos/{owner}/{repo}/contents/{path}"
    params = {"ref": ref} if ref else {}
    try:
        r = await client.get(url, headers=_gh_headers(), params=params, timeout=15)
        if r.status_code != 200:
            return None
        data = r.json()
        if isinstance(data, list):
            return None  # it's a directory
        encoded = data.get("content", "")
        return base64.b64decode(encoded).decode("utf-8", errors="ignore")
    except Exception as exc:
        logger.debug("API fetch failed for %s/%s/%s: %s", owner, repo, path, exc)
        return None


async def _api_list_dir(client: httpx.AsyncClient, owner: str, repo: str, path: str, ref: str | None) -> list[dict] | None:
    """List directory contents via the GitHub contents API."""
    url = f"{_GH_API}/repos/{owner}/{repo}/contents/{path}"
    params = {"ref": ref} if ref else {}
    try:
        r = await client.get(url, headers=_gh_headers(), params=params, timeout=15)
        if r.status_code != 200:
            return None
        data = r.json()
        return data if isinstance(data, list) else None
    except Exception:
        return None


async def _api_readme(client: httpx.AsyncClient, owner: str, repo: str, ref: str | None) -> str | None:
    """Fetch the repo README via the dedicated GitHub endpoint (handles any casing/extension)."""
    url = f"{_GH_API}/repos/{owner}/{repo}/readme"
    params = {"ref": ref} if ref else {}
    try:
        r = await client.get(url, headers=_gh_headers(), params=params, timeout=15)
        if r.status_code != 200:
            return None
        encoded = r.json().get("content", "")
        return base64.b64decode(encoded).decode("utf-8", errors="ignore")
    except Exception:
        return None


async def _api_ingest(owner: str, repo: str, ref: str | None) -> str:
    """
    Fetch documentation from GitHub using the Contents API — no git clone.
    Retrieves README, docs/ folder (up to 30 .md/.mdx files),
    top-level .d.ts files, and package.json.
    """
    content_parts: list[str] = []

    async with httpx.AsyncClient(timeout=20) as client:
        # 1. README
        readme = await _api_readme(client, owner, repo, ref)
        if readme:
            content_parts.append(f"# README\n\n{readme}")
            logger.debug("API ingest: README fetched (%d chars)", len(readme))

        # 2. docs/ folder
        for docs_dir in ["docs", "documentation", "doc"]:
            entries = await _api_list_dir(client, owner, repo, docs_dir, ref)
            if entries is None:
                continue
            # Collect .md / .mdx files recursively (one level for now)
            md_entries = [e for e in entries if e.get("type") == "file"
                          and e.get("name", "").endswith((".md", ".mdx"))][:30]
            for entry in md_entries:
                text = await _api_file_content(client, owner, repo, entry["path"], ref)
                if text:
                    content_parts.append(f"\n\n<!-- FILE: {entry['path']} -->\n{text}")
            if md_entries:
                logger.debug("API ingest: %d doc files from %s/", len(md_entries), docs_dir)
            break

        # 3. Top-level .d.ts files (type definitions)
        root_entries = await _api_list_dir(client, owner, repo, "", ref)
        if root_entries:
            dts_entries = [e for e in root_entries if e.get("type") == "file"
                           and e.get("name", "").endswith(".d.ts")][:20]
            dts_parts: list[str] = []
            for entry in dts_entries:
                text = await _api_file_content(client, owner, repo, entry["path"], ref)
                if text:
                    dts_parts.append(f"// FILE: {entry['path']}\n{text}")
            if dts_parts:
                content_parts.append(
                    "\n\n## TypeScript Type Definitions\n\n```typescript\n"
                    + "\n\n".join(dts_parts) + "\n```"
                )

            # 4. package.json
            pkg_entry = next((e for e in root_entries if e.get("name") == "package.json"), None)
            if pkg_entry:
                pkg_text = await _api_file_content(client, owner, repo, "package.json", ref)
                if pkg_text:
                    content_parts.append(f"\n\n## package.json\n\n```json\n{pkg_text}\n```")

    combined = "\n".join(content_parts)
    logger.info("GitHub API ingest done for %s/%s@%s: %d chars", owner, repo, ref or "default", len(combined))
    return combined


async def ingest_github_repo(repo_url: str, version_tag: str | None = None) -> str:
    """
    Ingest documentation from a GitHub repository.

    For github.com repos: uses the GitHub Contents API (fast, no clone).
    For other hosts: falls back to shallow git clone (120 s timeout).
    """
    parsed = _parse_owner_repo(repo_url)

    if parsed:
        owner, repo = parsed
        ref: str | None = None

        # Try version tag refs in order: v1.2.3, then 1.2.3
        if version_tag:
            async with httpx.AsyncClient(timeout=10) as client:
                for candidate in [f"v{version_tag}", version_tag]:
                    tag_resp = await client.get(
                        f"{_GH_API}/repos/{owner}/{repo}/git/ref/tags/{candidate}",
                        headers=_gh_headers(),
                    )
                    if tag_resp.status_code == 200:
                        ref = candidate
                        logger.info("Using tag %s for %s/%s", candidate, owner, repo)
                        break
                else:
                    logger.warning("Tag %s not found in %s/%s — using default branch", version_tag, owner, repo)

        return await _api_ingest(owner, repo, ref)

    # ── Fallback: non-GitHub host — shallow clone ──────────────────────────
    clone_url = _normalize_clone_url(repo_url)
    return _clone_and_extract(clone_url, version_tag)


def _clone_and_extract(repo_url: str, version_tag: str | None) -> str:
    """Shallow clone fallback for non-GitHub hosts."""
    with tempfile.TemporaryDirectory() as tmpdir:
        result = None

        if version_tag:
            for tag in [f"v{version_tag}", version_tag]:
                logger.info("Cloning %s at tag %s", repo_url, tag)
                result = subprocess.run(
                    ["git", "clone", "--depth=1", "--quiet", "--branch", tag, repo_url, tmpdir],
                    capture_output=True, text=True, timeout=120,
                )
                if result.returncode == 0:
                    break
            else:
                result = None

        if result is None or result.returncode != 0:
            logger.info("Cloning %s (default branch)", repo_url)
            result = subprocess.run(
                ["git", "clone", "--depth=1", "--quiet", repo_url, tmpdir],
                capture_output=True, text=True, timeout=120,
            )

        if result.returncode != 0:
            raise RuntimeError(f"git clone failed: {result.stderr}")

        content_parts: list[str] = []
        repo_path = Path(tmpdir)

        for readme_name in ["README.md", "README.mdx", "readme.md"]:
            readme = repo_path / readme_name
            if readme.exists():
                content_parts.append(f"# README\n\n{readme.read_text(errors='ignore')}")
                break

        for docs_dir_name in ["docs", "documentation", "doc"]:
            docs_dir = repo_path / docs_dir_name
            if docs_dir.is_dir():
                md_files = sorted(docs_dir.rglob("*.md")) + sorted(docs_dir.rglob("*.mdx"))
                for md_file in md_files[:30]:
                    try:
                        text = md_file.read_text(errors="ignore")
                        rel = md_file.relative_to(repo_path)
                        content_parts.append(f"\n\n<!-- FILE: {rel} -->\n{text}")
                    except Exception as exc:
                        logger.debug("Skipping %s: %s", md_file, exc)
                break

        dts_files = list(repo_path.rglob("*.d.ts"))[:20]
        dts_parts = []
        for dts in dts_files:
            try:
                text = dts.read_text(errors="ignore")
                rel = dts.relative_to(repo_path)
                dts_parts.append(f"// FILE: {rel}\n{text}")
            except Exception:
                pass
        if dts_parts:
            content_parts.append(
                "\n\n## TypeScript Type Definitions\n\n```typescript\n"
                + "\n\n".join(dts_parts) + "\n```"
            )

        pkg_json = repo_path / "package.json"
        if pkg_json.exists():
            content_parts.append(f"\n\n## package.json\n\n```json\n{pkg_json.read_text()}\n```")

        combined = "\n".join(content_parts)
        logger.info("Clone ingest done: %d chars", len(combined))
        return combined


def _normalize_clone_url(url: str) -> str:
    """Convert various URL formats to a cloneable HTTPS URL."""
    url = re.sub(r"^git\+", "", url)
    url = re.sub(r"^git://", "https://", url)
    url = url.split("#")[0]
    url = re.sub(r"(github\.com/[^/]+/[^/]+)/(tree|blob)/.*", r"\1", url)
    url = url.rstrip("/")
    if not url.endswith(".git"):
        url += ".git"
    return url