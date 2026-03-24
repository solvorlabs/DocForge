"""
Multi-registry package resolver.

Supports: crates.io, RubyGems, pub.dev, NuGet, Maven Central, Hex (Elixir), CRAN (R).
Each resolver returns a dict with keys: name, version, homepage, repository.
"""

import logging
import re

import httpx

logger = logging.getLogger(__name__)

_HEADERS = {"User-Agent": "docforge/1.0 (documentation indexer)"}
_TIMEOUT = 15


def _parse_at(input_str: str) -> tuple[str, str]:
    """
    Parse 'name@version' or just 'name'. Strip any 'prefix:' first.
    Returns (name, version) where version defaults to 'latest'.
    """
    if ":" in input_str:
        input_str = input_str.split(":", 1)[1]
    input_str = input_str.strip().strip("\"'")
    if "@" in input_str:
        name, ver = input_str.rsplit("@", 1)
        return name.strip(), ver.strip() or "latest"
    return input_str.strip(), "latest"


# ── crates.io ─────────────────────────────────────────────────────────────────

async def resolve_crates(input_str: str) -> dict:
    name, version = _parse_at(input_str)
    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        if version == "latest":
            url = f"https://crates.io/api/v1/crates/{name}"
        else:
            url = f"https://crates.io/api/v1/crates/{name}/{version}"

        resp = await client.get(url)
        if not resp.is_success:
            raise ValueError(f"crates.io: '{name}' not found")

        data = resp.json()

    if version == "latest":
        krate = data.get("crate", {})
        resolved = krate.get("newest_version", "latest")
        homepage = krate.get("homepage") or krate.get("repository")
        repository = krate.get("repository")
    else:
        ver_obj = data.get("version", {})
        resolved = ver_obj.get("num", version)
        # Fetch crate root for homepage/repo
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
                root = await client.get(f"https://crates.io/api/v1/crates/{name}")
                root_data = root.json() if root.is_success else {}
        except Exception:
            root_data = {}
        krate = root_data.get("crate", {})
        homepage = krate.get("homepage") or krate.get("repository")
        repository = krate.get("repository")

    # docs.rs is the canonical Rust docs site
    docs_url = homepage or f"https://docs.rs/{name}/{resolved}"
    return {"name": name, "version": resolved, "homepage": docs_url, "repository": repository}


# ── RubyGems ──────────────────────────────────────────────────────────────────

async def resolve_rubygems(input_str: str) -> dict:
    name, version = _parse_at(input_str)
    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        resp = await client.get(f"https://rubygems.org/api/v1/gems/{name}.json")
        if not resp.is_success:
            raise ValueError(f"RubyGems: '{name}' not found")
        data = resp.json()

    resolved = version if version != "latest" else data.get("version", "latest")
    homepage = (
        data.get("homepage_uri")
        or data.get("documentation_uri")
        or data.get("project_uri")
    )
    repository = data.get("source_code_uri")
    return {"name": data.get("name", name), "version": resolved, "homepage": homepage, "repository": repository}


# ── pub.dev (Dart / Flutter) ──────────────────────────────────────────────────

async def resolve_pubdev(input_str: str) -> dict:
    name, version = _parse_at(input_str)
    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        resp = await client.get(f"https://pub.dev/api/packages/{name}")
        if not resp.is_success:
            raise ValueError(f"pub.dev: '{name}' not found")
        data = resp.json()

    resolved = version if version != "latest" else data.get("latest", {}).get("version", "latest")
    pubspec = data.get("latest", {}).get("pubspec", {})
    homepage = (
        pubspec.get("homepage")
        or pubspec.get("documentation")
        or f"https://pub.dev/packages/{name}"
    )
    repository = pubspec.get("repository")
    return {"name": name, "version": resolved, "homepage": homepage, "repository": repository}


# ── NuGet (.NET) ──────────────────────────────────────────────────────────────

async def resolve_nuget(input_str: str) -> dict:
    name, version = _parse_at(input_str)
    lower = name.lower()
    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        resp = await client.get(f"https://api.nuget.org/v3/registration5/{lower}/index.json")
        if not resp.is_success:
            raise ValueError(f"NuGet: '{name}' not found")
        data = resp.json()

    # Flatten pages → items → catalogEntry
    pages = data.get("items", [])
    last_entry = None
    resolved = version
    if pages:
        last_page = pages[-1]
        items = last_page.get("items", [])
        if items:
            last_item = items[-1]
            last_entry = last_item.get("catalogEntry", {})
            if version == "latest":
                resolved = last_entry.get("version", "latest")

    homepage = (last_entry or {}).get("projectUrl") or f"https://www.nuget.org/packages/{name}"
    return {"name": name, "version": resolved, "homepage": homepage, "repository": None}


# ── Maven Central ─────────────────────────────────────────────────────────────
# Input format (after prefix strip): "com.google.guava:guava@32.1.3"

async def resolve_maven(input_str: str) -> dict:
    # Strip "mvn:" prefix if present
    stripped = input_str[4:] if input_str.startswith("mvn:") else input_str

    if "@" in stripped:
        ga, version = stripped.rsplit("@", 1)
        version = version.strip()
    else:
        ga, version = stripped, "latest"

    if ":" not in ga:
        raise ValueError(
            f"Maven input must be groupId:artifactId[@version], e.g. com.google.guava:guava. Got: {input_str!r}"
        )

    group_id, artifact_id = ga.split(":", 1)
    group_id = group_id.strip()
    artifact_id = artifact_id.strip()

    from urllib.parse import quote
    if version == "latest":
        query = f"g:{group_id} AND a:{artifact_id}"
        search_url = (
            f"https://search.maven.org/solrsearch/select"
            f"?q={quote(query)}&core=gav&rows=1&wt=json"
        )
    else:
        query = f"g:{group_id} AND a:{artifact_id} AND v:{version}"
        search_url = (
            f"https://search.maven.org/solrsearch/select"
            f"?q={quote(query)}&core=gav&rows=1&wt=json"
        )

    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        resp = await client.get(search_url)
        if not resp.is_success:
            raise ValueError(f"Maven Central: '{group_id}:{artifact_id}' not found")
        data = resp.json()

    docs = data.get("response", {}).get("docs", [])
    if not docs:
        raise ValueError(f"Maven Central: '{group_id}:{artifact_id}' not found")

    resolved = docs[0].get("v", version)
    name = f"{group_id}:{artifact_id}"
    homepage = f"https://mvnrepository.com/artifact/{group_id}/{artifact_id}/{resolved}"
    return {"name": name, "version": resolved, "homepage": homepage, "repository": None}


# ── Hex (Elixir) ──────────────────────────────────────────────────────────────

async def resolve_hex(input_str: str) -> dict:
    name, version = _parse_at(input_str)
    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        resp = await client.get(
            f"https://hex.pm/api/packages/{name}",
            headers={**_HEADERS, "Accept": "application/json"},
        )
        if not resp.is_success:
            raise ValueError(f"Hex: '{name}' not found")
        data = resp.json()

    resolved = version if version != "latest" else (
        data.get("latest_stable_version") or data.get("latest_version", "latest")
    )
    meta = data.get("meta", {})
    links = meta.get("links", {})
    homepage = (
        links.get("Website")
        or links.get("Documentation")
        or f"https://hexdocs.pm/{name}/{resolved}"
    )
    repository = links.get("GitHub") or links.get("Repository")
    return {"name": data.get("name", name), "version": resolved, "homepage": homepage, "repository": repository}


# ── CRAN (R) ──────────────────────────────────────────────────────────────────

async def resolve_cran(input_str: str) -> dict:
    name, _ = _parse_at(input_str)
    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        resp = await client.get(f"https://crandb.r-pkg.org/{name}")
        if not resp.is_success:
            raise ValueError(f"CRAN: '{name}' not found")
        data = resp.json()

    resolved = data.get("Version", "latest")
    raw_url = data.get("URL", "")
    homepage = raw_url.split(",")[0].strip() if raw_url else f"https://cran.r-project.org/package={name}"
    bug_reports = data.get("BugReports", "")
    repository = re.sub(r"/issues.*", "", bug_reports) if "github.com" in bug_reports else None
    return {"name": data.get("Package", name), "version": resolved, "homepage": homepage, "repository": repository}
