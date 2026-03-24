"""
Detector and ingester for "copy-paste" style component libraries.

These libraries are NOT published as installable npm packages.
Developers copy component source code into their project via a CLI tool
(shadcn, jsrepo) or manually from the library's website.

Detection cascade (in priority order):
  1. jsrepo.dev  — standard registry for Svelte/TS copy-paste libs
  2. shadcn registry format — homepage exposes /registry.json or /r/*.json
  3. GitHub README heuristics — README contains copy-paste CLI phrases
  4. npm package has no dist exports — source-only repo misidentified as package

If any pattern matches, ingest() returns pre-built documentation so the
pipeline can skip the normal URL crawl step entirely.
"""

import logging
import re
from datetime import date
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

_TIMEOUT = 15
_HEADERS = {"User-Agent": "docforge/1.0 (documentation indexer)"}
_GH_HEADERS = {**_HEADERS, "Accept": "application/vnd.github+json"}

# Regex patterns that appear in README files of copy-paste libraries
_README_SIGNALS = [
    r"npx\s+shadcn",
    r"npx\s+@shadcn",
    r"pnpm\s+dlx\s+shadcn",
    r"bunx\s+shadcn",
    r"npx\s+jsrepo",
    r"jsrepo\s+add",
    r"not\s+published\s+to\s+npm",
    r"not\s+available\s+on\s+npm",
    r"no\s+npm\s+package",
    r"copy\s+and\s+paste",
    r"copy-paste\s+component",
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def detect_and_ingest(
    name: str,
    github_url: str | None = None,
    homepage: str | None = None,
    npm_data: dict | None = None,
) -> dict | None:
    """
    Run all detection patterns against the given signals.

    Returns a metadata dict with _is_copypaste=True and _raw_docs set
    if the library is identified as copy-paste style, otherwise None.
    """
    # ── Pattern 1: jsrepo.dev ─────────────────────────────────────────────────
    docs = await check_jsrepo(name, github_url)
    if docs:
        logger.info("[copypaste] jsrepo match for '%s'", name)
        return _make_result(name, github_url, docs, "jsrepo")

    # ── Pattern 2: shadcn registry format ────────────────────────────────────
    if homepage:
        shadcn_result = await _check_shadcn_registry(homepage, name)
        if shadcn_result is not None:
            logger.info("[copypaste] shadcn registry match for '%s'", name)
            result = _make_result(name, github_url, "", "shadcn")
            result["_structured"] = shadcn_result
            return result

    # ── Pattern 3: npm package has no dist exports ───────────────────────────
    # (fall through — if npm_data has no exports, README check below will
    #  confirm whether it's a copy-paste lib or just a poorly configured package)
    no_dist = npm_data is not None and _has_no_dist_exports(npm_data)

    # ── Pattern 4: GitHub README heuristics ──────────────────────────────────
    if github_url:
        docs = await _check_readme(github_url, name, require_signal=not no_dist)
        if docs:
            logger.info("[copypaste] README match for '%s'", name)
            return _make_result(name, github_url, docs, "readme")

    return None


# ---------------------------------------------------------------------------
# Pattern 1 — jsrepo.dev
# ---------------------------------------------------------------------------

async def check_jsrepo(name: str, github_url: str | None) -> str | None:
    """
    Check jsrepo.dev and raw GitHub paths for a blocks/registry JSON.
    jsrepo registries are GitHub repos that publish a blocks.json or registry.json.
    """
    clean = name.lstrip("@").replace("/", "-")
    candidates: list[str] = []
    owner: str | None = None
    repo: str | None = None

    # Derive candidates from the known GitHub repo
    if github_url:
        m = re.search(r"github\.com[:/]([^/]+)/([^/.#]+)", github_url)
        if m:
            owner, repo = m.group(1), m.group(2)
            for branch in ("main", "master"):
                candidates += [
                    f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/blocks.json",
                    f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/registry.json",
                    f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/src/registry.json",
                ]
            candidates += [
                f"https://jsrepo.dev/api/registries/{owner}/{repo}",
            ]

    # Generic jsrepo search by package name
    candidates.append(f"https://jsrepo.dev/api/registries?q={clean}")

    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        for url in candidates:
            try:
                resp = await client.get(url)
                if not resp.is_success:
                    continue
                if "json" not in resp.headers.get("content-type", ""):
                    continue

                data = resp.json()
                docs = _parse_blocks_json(data, name, owner=owner, repo=repo)
                if docs:
                    return docs
            except Exception as exc:
                logger.debug("jsrepo check failed at %s: %s", url, exc)

    return None


# ---------------------------------------------------------------------------
# Pattern 2 — shadcn registry format
# ---------------------------------------------------------------------------

async def check_shadcn_registry(homepage: str, name: str) -> "dict | None":
    """Public alias — same as _check_shadcn_registry, called from context.py."""
    return await _check_shadcn_registry(homepage, name)


async def _check_shadcn_registry(homepage: str, name: str) -> "dict | None":
    """
    Check if the homepage exposes a shadcn-compatible component registry.

    React Bits (and similar) expose their registry at /r/registry.json using the
    shadcn registry schema ({$schema, name, items:[]}). The jsrepo CLI treats the
    /r path as its registry root: `npx jsrepo add https://site.dev/r ComponentName`.
    """
    parsed = urlparse(homepage)
    base = f"{parsed.scheme}://{parsed.netloc}"

    candidates = [
        # /r/registry.json — the pattern used by react-bits and jsrepo-compatible sites
        f"{base}/r/registry.json",
        f"{base}/r/blocks.json",
        f"{base}/r/index.json",
        # root-level registry
        f"{base}/registry.json",
        f"{homepage.rstrip('/')}/registry.json",
        f"{base}/api/registry.json",
    ]

    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        for url in candidates:
            try:
                resp = await client.get(url)
                if not resp.is_success:
                    continue
                if "json" not in resp.headers.get("content-type", ""):
                    continue

                data = resp.json()
                items = None
                if isinstance(data, list):
                    items = data
                elif isinstance(data, dict):
                    items = (
                        data.get("items")
                        or data.get("components")
                        or data.get("registry")
                    )

                if items and isinstance(items, list) and len(items) > 0:
                    logger.info("shadcn registry found at %s (%d items)", url, len(items))
                    version = (data.get("version") if isinstance(data, dict) else None) or "latest"
                    return await _format_shadcn_registry(items, name, url, version)

            except Exception as exc:
                logger.debug("shadcn registry check failed at %s: %s", url, exc)

    return None


# ---------------------------------------------------------------------------
# Pattern 3 — npm package with no dist exports (checked in detect_and_ingest)
# ---------------------------------------------------------------------------

def _has_no_dist_exports(npm_data: dict) -> bool:
    """
    Return True if the npm package.json has no built distribution artefacts.
    A package with no main/module/exports and no dist/ in files[] is likely
    a source-only repo published for reference rather than installation.
    """
    has_entry = bool(
        npm_data.get("main")
        or npm_data.get("module")
        or npm_data.get("exports")
    )
    has_dist_files = any(
        "dist/" in str(f) or "build/" in str(f)
        for f in (npm_data.get("files") or [])
    )
    return not has_entry and not has_dist_files


# ---------------------------------------------------------------------------
# Pattern 4 — GitHub README heuristics
# ---------------------------------------------------------------------------

async def _check_readme(
    github_url: str,
    name: str,
    require_signal: bool = True,
) -> str | None:
    """
    Fetch the GitHub README.
    If require_signal=True, only return content when a copy-paste phrase is found.
    If require_signal=False (npm_data had no exports), return content regardless
    since we already have a structural signal — just confirm it's not a normal lib.
    """
    m = re.search(r"github\.com[:/]([^/]+)/([^/.#]+)", github_url)
    if not m:
        return None

    owner, repo = m.group(1), m.group(2)
    readme_content: str | None = None

    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        for branch in ("main", "master"):
            for filename in ("README.md", "readme.md", "Readme.md"):
                url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{filename}"
                try:
                    resp = await client.get(url)
                    if resp.is_success and resp.text.strip():
                        readme_content = resp.text
                        break
                except Exception:
                    continue
            if readme_content:
                break

        if not readme_content:
            return None

        readme_lower = readme_content.lower()
        has_signal = any(
            re.search(pattern, readme_lower)
            for pattern in _README_SIGNALS
        )

        if require_signal and not has_signal:
            return None

        # Enrich with component listing from the repo tree
        component_list = await _fetch_component_listing(client, owner, repo)

    m2 = re.search(r"github\.com[:/]([^/]+)/([^/.#]+)", github_url)
    gh_slug = f"{m2.group(1)}/{m2.group(2)}" if m2 else None

    lines = [
        f"# {name} — Copy-Paste Component Library\n\n",
        "⚠️  IMPORTANT FOR AI CODE GENERATION:\n",
        f"This library ({name}) is a COPY-PASTE component library — it is NOT published as an npm package.\n",
        "DO NOT generate 'npm install {name}' or any npm/yarn/pnpm install command for this library.\n",
        "Components must be copied into the project manually or via a CLI tool.\n\n",
        "## How to install components\n\n",
    ]
    if gh_slug:
        lines.append(
            f"```bash\n# Option A — jsrepo CLI\nnpx jsrepo add {gh_slug}/<ComponentName>\n\n"
            f"# Option B — shadcn CLI (if the project uses shadcn)\nnpx shadcn@latest add <ComponentName>\n```\n\n"
            "After adding, import from your local components directory:\n"
            "`import { ComponentName } from '@/components/ComponentName'`\n\n"
        )
    lines.append("## README\n\n")
    lines.append(readme_content[:10_000])  # README covers install + overview

    if component_list:
        lines.append(f"\n\n## Available Components\n\n{component_list}")

    return "".join(lines)


async def _fetch_component_listing(
    client: httpx.AsyncClient,
    owner: str,
    repo: str,
) -> str | None:
    """Try common component directory paths to list available components."""
    paths = [
        f"https://api.github.com/repos/{owner}/{repo}/contents/src/components",
        f"https://api.github.com/repos/{owner}/{repo}/contents/components",
        f"https://api.github.com/repos/{owner}/{repo}/contents/src/lib/components",
        f"https://api.github.com/repos/{owner}/{repo}/contents/packages",
        f"https://api.github.com/repos/{owner}/{repo}/contents/src",
    ]

    for url in paths:
        try:
            resp = await client.get(url, headers=_GH_HEADERS)
            if not resp.is_success:
                continue
            items = resp.json()
            if not isinstance(items, list):
                continue

            names = [
                re.sub(r"\.(svelte|tsx|vue|jsx|ts|js)$", "", item["name"])
                for item in items
                if item.get("type") in ("file", "dir")
                and not item["name"].startswith(".")
                and item["name"][0].isupper()  # components are usually PascalCase
            ]
            if len(names) >= 3:
                return "\n".join(f"- {n}" for n in names[:60])
        except Exception:
            continue

    return None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_result(
    name: str,
    github_url: str | None,
    raw_docs: str,
    method: str,
) -> dict:
    return {
        "name": name,
        "version": "latest",
        "description": f"Copy-paste component library (detected via {method})",
        "homepage": github_url,
        "repository": github_url,
        "_is_copypaste": True,
        "_copypaste_method": method,
        "_raw_docs": raw_docs,
    }


def _parse_blocks_json(
    data: object,
    name: str,
    owner: str | None = None,
    repo: str | None = None,
) -> str | None:
    """Parse a blocks.json / registry.json payload into readable docs."""
    items: list | None = None

    if isinstance(data, list) and data:
        items = data
    elif isinstance(data, dict):
        items = (
            data.get("blocks")
            or data.get("components")
            or data.get("items")
            or data.get("registry")
        )
        # jsrepo search results wrapper
        if not items and "results" in data and data["results"]:
            items = data["results"]

    if not items or not isinstance(items, list) or len(items) == 0:
        return None

    gh_slug = f"{owner}/{repo}" if owner and repo else None

    lines = [
        f"# {name} — Copy-Paste Component Library\n\n",
        "⚠️  IMPORTANT FOR AI CODE GENERATION:\n",
        f"This library ({name}) is a COPY-PASTE component library — it is NOT published as an npm package.\n",
        "DO NOT generate 'npm install {name}' or any npm/yarn/pnpm install command for this library.\n",
        "Components are added to a project via the jsrepo CLI, NOT by installing a package.\n\n",
        "## How to install components\n\n",
    ]

    if gh_slug:
        lines.append(f"Use the jsrepo CLI to add individual components:\n")
        lines.append(f"```bash\n# Install jsrepo CLI (one-time)\nnpm install -g jsrepo\n\n")
        lines.append(f"# Add a specific component (example)\nnpx jsrepo add {gh_slug}/<type>/<ComponentName>\n```\n\n")
    else:
        lines.append(f"Use the jsrepo CLI: `npx jsrepo add <registry>/<type>/<ComponentName>`\n\n")

    lines.append(
        "After adding, components live in your local project directory.\n"
        "Import them from your local path, e.g. `import {{ ComponentName }} from '@/components/ComponentName'`\n\n"
        f"Total components available: {len(items)}\n"
    )

    for block in items:
        if not isinstance(block, dict):
            continue
        bname = block.get("name") or block.get("title") or ""
        if not bname:
            continue

        desc = block.get("description") or ""
        category = block.get("type") or block.get("category") or ""

        entry = f"\n## {bname}"
        if category:
            entry += f" ({category})"
        entry += "\n"
        if desc:
            entry += f"{desc}\n"

        # jsrepo add command per component
        if gh_slug and category:
            entry += f"Install: `npx jsrepo add {gh_slug}/{category}/{bname}`\n"
        elif gh_slug:
            entry += f"Install: `npx jsrepo add {gh_slug}/{bname}`\n"

        deps = block.get("dependencies") or block.get("registryDependencies") or []
        if deps:
            entry += f"npm peer dependencies (install these): {', '.join(str(d) for d in deps)}\n"

        lines.append(entry)

    return "".join(lines)


def _parse_ts_props(snippet: str) -> list[dict]:
    """Parse a TypeScript interface/type snippet into a list of prop dicts."""
    brace_start = snippet.find("{")
    if brace_start == -1:
        return []

    props: list[dict] = []
    depth = 0
    i = brace_start
    buf = ""

    while i < len(snippet):
        ch = snippet[i]
        if ch == "{":
            depth += 1
            if depth > 1:
                buf += ch
        elif ch == "}":
            depth -= 1
            if depth == 0:
                break
            buf += ch
        elif ch == ";" and depth == 1:
            prop = _parse_prop_line(buf)
            if prop:
                props.append(prop)
            buf = ""
        elif ch == "\n" and depth == 1 and buf.strip():
            prop = _parse_prop_line(buf)
            if prop:
                props.append(prop)
            buf = ""
        else:
            buf += ch
        i += 1

    if buf.strip():
        prop = _parse_prop_line(buf)
        if prop:
            props.append(prop)

    return props


def _parse_prop_line(line: str) -> "dict | None":
    """Parse a single TypeScript property declaration."""
    line = line.strip().rstrip(";").strip()
    if not line or line.startswith("//") or line.startswith("*") or line.startswith("["):
        return None
    m = re.match(r"^(\w+)(\?)?\s*:\s*(.+)$", line)
    if not m:
        return None
    prop_type = m.group(3).strip()
    if len(prop_type) > 80:
        prop_type = prop_type[:77] + "..."
    return {
        "name": m.group(1),
        "type": prop_type,
        "required": m.group(2) != "?",
        "default": None,
    }


def _example_value(prop: dict) -> str:
    """Return a realistic example value for a prop based on its name and type."""
    name = prop["name"].lower()
    t = prop["type"].lower()

    # Name-driven heuristics (more specific than type alone)
    if any(k in name for k in ("text", "label", "title", "sentence", "placeholder")):
        return '"Hello World"'
    if any(k in name for k in ("src", "url", "href", "path", "image", "logo")):
        return '"/path/to/file"'
    if "color" in name:
        return '"#3b82f6"'
    if name in ("classname", "class"):
        return '"your-class"'
    if any(k in name for k in ("duration", "delay", "speed", "time")):
        return "{1.5}" if "duration" in name else "{300}"
    if any(k in name for k in ("count", "max", "min", "size", "radius", "width", "height")):
        return "{100}"
    if "items" in name or "logos" in name or "images" in name:
        return "{[]}"
    if name in ("to", "target"):
        return "{1000}"
    if name in ("from"):
        return "{0}"

    # Type-driven fallback
    if "string" in t:
        return '"value"'
    if "number" in t:
        return "{0}"
    if "boolean" in t:
        return "{true}"
    if "reactnode" in t or "element" in t:
        return "{<div>content</div>}"
    if "[]" in t or t.startswith("array"):
        return "{[]}"
    if "=>" in t or "function" in t:
        return "{() => {}}"
    return "{/* value */}"


# Props to skip in commented optional list — too generic to be useful examples
_BORING_PROPS = frozenset({"classname", "style", "id", "ref", "key", "tabindex", "role"})


def _generate_usage(title: str, props: list[dict]) -> str:
    """
    Generate a proper runnable usage example with import + function wrapper.
    Required props are shown with realistic values.
    A selection of interesting optional props are shown commented out.
    """
    import_line = f"import {{ {title} }} from '@/components/{title}';"

    required = [p for p in props if p.get("required") and p["name"] != "children"]
    has_children = any(p["name"] == "children" for p in props)
    needs_children = any(p["name"] == "children" and p.get("required") for p in props)

    # Pick up to 5 interesting optional props to show commented (skip boring ones)
    optional_shown = [
        p for p in props
        if not p.get("required")
        and p["name"].lower() not in _BORING_PROPS
        and p["name"] != "children"
    ][:5]

    indent = "      "  # 6 spaces inside return ( <Component )
    attr_lines: list[str] = []

    for p in required:
        attr_lines.append(f"{indent}{p['name']}={_example_value(p)}")

    for p in optional_shown:
        attr_lines.append(f"{indent}// {p['name']}={_example_value(p)}")

    attrs = "\n".join(attr_lines)
    open_tag = f"<{title}"
    if attrs:
        open_tag += f"\n{attrs}\n    "

    if needs_children or (has_children and not required):
        if attrs:
            jsx = f"<{title}\n{attrs}\n    >\n      {{/* content */}}\n    </{title}>"
        else:
            jsx = f"<{title}>\n      {{/* content */}}\n    </{title}>"
    else:
        jsx = f"<{title}\n{attrs}\n    />" if attrs else f"<{title} />"

    return (
        f"{import_line}\n\n"
        f"export default function Example() {{\n"
        f"  return (\n"
        f"    {jsx}\n"
        f"  );\n"
        f"}}"
    )


async def _format_shadcn_registry(
    items: list, name: str, registry_url: str, version: str = "latest"
) -> dict:
    """
    Build a pre-structured JSON dict from a shadcn/jsrepo registry.
    Returns a dict matching the schema expected by format_context_md(),
    bypassing the LLM structurer entirely.
    """
    from urllib.parse import urlparse as _urlparse
    _p = _urlparse(registry_url)
    registry_base = f"{_p.scheme}://{_p.netloc}{_p.path.rsplit('/', 1)[0]}"

    # Deduplicate by title — registries like react-bits expose 4 variants per
    # component (JS/TS × CSS/TW). Prefer the TypeScript variant because its
    # source file has proper interface declarations we can extract for props.
    seen_titles: dict[str, dict] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        title = item.get("title") or item.get("name") or ""
        if not title:
            continue
        item_name = item.get("name") or ""
        is_ts = "-TS-" in item_name or item_name.endswith("-TS")
        if title not in seen_titles:
            seen_titles[title] = dict(item)
        else:
            existing = seen_titles[title]
            existing_name = existing.get("name") or ""
            if is_ts and "-TS-" not in existing_name and not existing_name.endswith("-TS"):
                merged_deps = sorted(
                    set(existing.get("dependencies") or [])
                    | set(item.get("dependencies") or [])
                )
                seen_titles[title] = {**item, "dependencies": merged_deps}
            else:
                existing_deps = set(existing.get("dependencies") or [])
                existing_deps.update(item.get("dependencies") or [])
                existing["dependencies"] = sorted(existing_deps)

    unique_items = list(seen_titles.values())

    # Fetch individual component JSON files in parallel to extract prop types
    props_map = await _fetch_all_component_props(registry_base, unique_items)

    today = date.today().isoformat()
    components = []

    for item in unique_items:
        title = item.get("title") or item.get("name") or ""
        if not title:
            continue

        deps = item.get("dependencies") or []
        prop_snippet = props_map.get(title)
        props = _parse_ts_props(prop_snippet) if prop_snippet else []
        usage = _generate_usage(title, props)

        gotchas = [
            f"Install with `npx jsrepo add {registry_base} {title}` — do NOT use npm install",
            f"Import from your local project: `import {{ {title} }} from '@/components/{title}'`",
        ]
        if deps:
            gotchas.append(f"Peer dependencies must be installed separately: {', '.join(deps)}")

        components.append({
            "name": title,
            "install_command": f"npx jsrepo add {registry_base} {title}",
            "import_path": f"import {{ {title} }} from '@/components/{title}'",
            "props": props,
            "peer_dependencies": deps,
            "gotchas": gotchas,
            "usage_example": usage,
            "last_verified": today,
        })

    return {
        "library": name,
        "version": version,
        "description": f"Copy-Paste Component Library (jsrepo/shadcn registry) — {len(components)} components",
        "components": components,
    }


async def _fetch_all_component_props(
    registry_base: str,
    items: list,
    max_concurrent: int = 15,
) -> dict[str, str]:
    """
    Fetch individual component JSON endpoints in parallel and extract TypeScript
    prop interfaces from the embedded file content.

    Individual component JSONs live at {registry_base}/{item_name}.json and
    include a `files[]` array with the full source `content` field.
    """
    import asyncio

    sem = asyncio.Semaphore(max_concurrent)

    async def fetch_one(
        client: httpx.AsyncClient, item: dict
    ) -> tuple[str, str | None]:
        title = item.get("title") or item.get("name") or ""
        item_name = item.get("name") or title
        if not title:
            return title, None

        # Build candidate URLs — prefer TypeScript variants (have proper interfaces)
        ts_name = item_name.replace("-JS-", "-TS-") if "-JS-" in item_name else item_name
        candidate_urls = []
        if ts_name != item_name:
            candidate_urls.append(f"{registry_base}/{ts_name}.json")
        candidate_urls += [
            f"{registry_base}/{item_name}.json",
            f"{registry_base}/{title}-TS-CSS.json",
            f"{registry_base}/{title}-TS-TW.json",
            f"{registry_base}/{title}.json",
        ]

        async with sem:
            for url in candidate_urls:
                try:
                    resp = await client.get(url, timeout=6)
                    if not resp.is_success:
                        continue
                    if "json" not in resp.headers.get("content-type", ""):
                        continue
                    data = resp.json()
                    # The individual JSON may wrap items[] or be the item directly
                    files = data.get("files") or []
                    if not files and isinstance(data.get("items"), list):
                        files = data["items"][0].get("files") or []
                    for f in files:
                        content = f.get("content") or ""
                        if content:
                            snippet = _extract_ts_interface(content)
                            if snippet:
                                return title, snippet
                except Exception:
                    pass
        return title, None

    async with httpx.AsyncClient(
        timeout=8, headers=_HEADERS, follow_redirects=True
    ) as client:
        results = await asyncio.gather(
            *[fetch_one(client, item) for item in items],
            return_exceptions=False,
        )

    return {t: p for t, p in results if p}


def _extract_ts_interface(content: str) -> str | None:
    """
    Extract TypeScript prop types from source code.
    Handles:
      - interface AnimatedContentProps { ... }       (named interface)
      - type AnimatedContentProps = { ... }          (named type alias)
      - function Foo({ a, b }: { a: string; b?: number }) (inline params)

    Uses brace balancing so nested types like `config?: { tension: number }`
    are captured correctly.
    """
    # ── Pattern A: named interface or type alias ──────────────────────────────
    header = re.search(
        r'(?:interface|type)\s+\w*[Pp]rops?\w*\s*(?:=\s*)?(?:<[^>]*>)?\s*\{',
        content,
    )
    if header:
        snippet = _extract_balanced_braces(content, header.start())
        if snippet:
            return _trim(snippet)

    # ── Pattern B: inline destructured params  ────────────────────────────────
    # Matches:  ComponentName({ propA, propB }: { propA: type; propB?: type })
    inline = re.search(
        r'(?:function\s+\w+|const\s+\w+\s*=\s*(?:React\.)?(?:forwardRef\()?(?:async\s+)?function\s*\w*|\(\s*)\(\s*\{[^}]*\}\s*:\s*\{',
        content,
    )
    if inline:
        # Find the opening brace of the type annotation
        brace_pos = content.find(': {', inline.start())
        if brace_pos != -1:
            snippet = _extract_balanced_braces(content, brace_pos + 2)
            if snippet:
                return _trim(snippet)

    return None


def _extract_balanced_braces(content: str, start: int) -> str | None:
    """Return the substring from `start` through the matching closing brace."""
    brace_start = content.find('{', start)
    if brace_start == -1:
        return None
    depth = 0
    for i in range(brace_start, min(brace_start + 2000, len(content))):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                return content[start: i + 1]
    return None


def _trim(snippet: str, max_len: int = 700) -> str:
    snippet = snippet.strip()
    if len(snippet) > max_len:
        snippet = snippet[:max_len - 3] + "..."
    return snippet
