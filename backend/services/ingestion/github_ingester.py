"""
GitHub repository ingester.

Clones the repository (shallow), extracts:
- /docs folder
- README.md
- TypeScript type definitions from .d.ts files
"""

import logging
import os
import re
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


async def ingest_github_repo(repo_url: str) -> str:
    """
    Shallow clone the repo and extract documentation content.
    Returns combined Markdown string.
    """
    repo_url = _normalize_github_url(repo_url)
    logger.info("Cloning GitHub repo: %s", repo_url)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Shallow clone — we only need docs, not full history
        result = subprocess.run(
            ["git", "clone", "--depth=1", "--quiet", repo_url, tmpdir],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(f"git clone failed: {result.stderr}")

        content_parts: list[str] = []
        repo_path = Path(tmpdir)

        # 1. README
        for readme_name in ["README.md", "README.mdx", "readme.md"]:
            readme = repo_path / readme_name
            if readme.exists():
                content_parts.append(f"# README\n\n{readme.read_text(errors='ignore')}")
                break

        # 2. /docs folder (recursively read .md, .mdx files)
        for docs_dir_name in ["docs", "documentation", "doc"]:
            docs_dir = repo_path / docs_dir_name
            if docs_dir.is_dir():
                md_files = sorted(docs_dir.rglob("*.md")) + sorted(docs_dir.rglob("*.mdx"))
                for md_file in md_files[:30]:  # cap at 30 doc files
                    try:
                        text = md_file.read_text(errors="ignore")
                        rel = md_file.relative_to(repo_path)
                        content_parts.append(f"\n\n<!-- FILE: {rel} -->\n{text}")
                    except Exception as exc:
                        logger.debug("Skipping %s: %s", md_file, exc)
                break

        # 3. TypeScript type definitions — invaluable for AI codegen accuracy
        dts_files = list(repo_path.rglob("*.d.ts"))[:20]
        if dts_files:
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
                    + "\n\n".join(dts_parts)
                    + "\n```"
                )

        # 4. package.json for peer deps + version info
        pkg_json = repo_path / "package.json"
        if pkg_json.exists():
            content_parts.append(f"\n\n## package.json\n\n```json\n{pkg_json.read_text()}\n```")

        combined = "\n".join(content_parts)
        logger.info("GitHub ingest done: %d chars", len(combined))
        return combined


def _normalize_github_url(url: str) -> str:
    """Convert various GitHub URL formats to a cloneable HTTPS URL."""
    # Handle git+https://... format
    url = re.sub(r"^git\+", "", url)
    # Handle git:// protocol
    url = re.sub(r"^git://", "https://", url)
    # Strip URL fragments (e.g. #readme, #main)
    url = url.split("#")[0]
    # Strip /tree/... and /blob/... subdirectory paths — only repo root is cloneable
    # e.g. https://github.com/owner/repo/tree/master/types/node → https://github.com/owner/repo
    url = re.sub(r"(github\.com/[^/]+/[^/]+)/(tree|blob)/.*", r"\1", url)
    # Remove trailing .git if present, then re-add for clone
    url = url.rstrip("/")
    if not url.endswith(".git"):
        url += ".git"
    return url