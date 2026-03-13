# Contributing to DocForge

Thanks for wanting to contribute. This document covers how to get your environment running, where things live, how to submit changes, and what the project's conventions are.

---

## Before You Start

- Read [setup.md](setup.md) to get the project running locally
- Check the [open issues](https://github.com/docforge/docforge/issues) before starting work on a new feature — someone may already be on it
- For large changes, open an issue first to discuss the approach before writing code

---

## Repository Layout

```
docforge/
├── backend/                     # FastAPI backend (Python)
│   ├── main.py                  # App entry point
│   ├── routers/                 # Route handlers
│   ├── services/
│   │   ├── ingestion/           # Four input methods (npm, url, github, paste)
│   │   ├── structurer.py        # Gemini 1.5 Flash integration
│   │   ├── formatter.py         # JSON → .context.md
│   │   └── cache.py             # In-memory (dev) or Redis (prod)
│   └── models/schemas.py        # Pydantic request/response models
│
├── docforge-vscode/             # VS Code extension (TypeScript)
│   └── src/
│       ├── extension.ts         # Entry point, command registration
│       ├── commands/            # generateContext, updateContext
│       ├── api/docforgeClient.ts# HTTP client + polling
│       ├── ui/                  # inputFlow, statusBar
│       └── utils/               # fileWriter, packageDetector
│
└── docforge-mcp/                # MCP server (Python)
    ├── server.py                # MCP entry point
    ├── tools/                   # get_context, search_library, list_versions
    └── client.py                # HTTP client → backend
```

---

## Development Workflow

### 1. Fork and clone

```bash
git clone https://github.com/your-username/docforge
cd docforge
make install
```

### 2. Create a branch

```bash
git checkout -b fix/crawler-timeout
# or
git checkout -b feat/pypi-version-pinning
```

Branch naming: `fix/`, `feat/`, `docs/`, `refactor/` prefixes.

### 3. Make your changes

Run the backend while you work:

```bash
make dev-backend
```

For extension changes:

```bash
make dev-extension   # TypeScript watch mode
# Press F5 in VS Code to launch Extension Development Host
```

### 4. Test your changes

**Backend** — test the full pipeline with a real package:

```bash
make test-backend
curl http://localhost:8000/api/context/<job_id>
```

Validate against these test targets — all four must produce correct output:

| Package | What to verify |
|---------|---------------|
| `react-bits@2.1.4` | `'use client'` gotcha, `npx jsrepo add` install command, `framer-motion` peer dep |
| `@tanstack/react-query@5.0.0` | v4 → v5 breaking changes mentioned in gotchas |
| `langchain@0.1.0` | Python-style import path, correct version |
| `fastapi` (no version) | Resolves to latest, PyPI metadata correct |

**Extension** — compile must pass with no TypeScript errors:

```bash
make compile-extension
```

### 5. Commit

Write commit messages in the imperative present tense:

```
feat: add PyPI version pinning for scoped packages
fix: handle npm registry 404 for private packages
docs: add troubleshooting section to setup.md
refactor: extract polling logic from generateContext command
```

One logical change per commit. Do not bundle unrelated fixes.

### 6. Open a pull request

- Target the `main` branch
- Title follows the same format as commit messages
- Description should include:
  - What problem this solves or what it adds
  - How to test it (specific curl commands or VS Code steps)
  - Screenshots for any UI changes

---

## Architecture Decisions

Understanding these helps you make changes that fit the existing design.

### Why a separate FastAPI backend?

Crawling takes 30–90 seconds. A background job model (submit → poll) lets the VS Code extension show a progress spinner without blocking. It also means the MCP server and extension share the same pipeline with no code duplication.

### Why Playwright for crawling?

Most modern doc sites are React or Next.js apps that render content client-side. `httpx` alone returns empty HTML shells. Playwright runs real Chromium to get the fully hydrated DOM. We fall back to httpx static crawl when Playwright is not installed, so the tool degrades gracefully.

### Why Gemini 1.5 Flash?

Its 1M token context window handles large documentation sites in one shot. The Flash variant is fast enough for interactive use (5–15s structuring). The prompt is specifically engineered to hunt for "gotchas" — this is the core value proposition of the tool.

### Why DEV_MODE in-memory cache?

Redis is operationally complex to run locally. The in-memory fallback means `make dev-backend` is the only command needed to run the full stack. In production, Redis is swapped in for distributed caching across multiple backend instances.

### Why no external npm deps in the VS Code extension?

VS Code extensions bundle their `node_modules` into the `.vsix`. Keeping the extension dependency-free (Node.js built-ins only) keeps the bundle small and eliminates version conflicts. The `https`/`http` modules handle all API communication.

---

## Code Conventions

### Python (backend + MCP server)

- **Type hints** on all public functions
- **Docstrings** explain *why* something exists, not what the code does line by line
- **Logging** at meaningful points: crawl start/end with char counts, cache hits, Gemini timing
- Follow PEP 8; use `ruff` for formatting if available
- `async`/`await` throughout — no blocking I/O on the event loop

### TypeScript (VS Code extension)

- `strict: true` is enforced in `tsconfig.json` — no implicit `any`
- `async`/`await` only — no callbacks or `.then()` chains
- Use the VS Code [disposable pattern](https://code.visualstudio.com/api/references/vscode-api#Disposable) for all subscriptions
- Keep commands thin — business logic goes in `api/` and `utils/`, not in `commands/`

---

## What's In Scope

Good areas to contribute:

- **New ingester** — e.g. a dedicated JSR (JavaScript Registry) ingester
- **Better HTML → Markdown conversion** — improving the Docling/html2text pipeline
- **Gotcha extraction improvements** — prompt engineering for specific library types
- **Extension batch generation** — generate context for multiple packages at once
- **Backend tests** — pytest unit tests for ingesters and the formatter
- **CI/CD** — GitHub Actions for linting and running the test targets

### Out of scope (for now)

- Changing the `.context.md` output format in a breaking way
- Adding new runtime dependencies to the VS Code extension
- Switching away from Gemini without a discussion in an issue first

---

## Filing a Bug Report

Include:

1. The exact input (package name, URL, or GitHub repo)
2. The full error message from the backend logs (`make dev-backend` terminal output)
3. Which step failed: resolving metadata, crawling, Gemini structuring, or formatting
4. The `DEV_MODE` value and whether `GEMINI_API_KEY` is set

---

## Questions

Open a [GitHub Discussion](https://github.com/docforge/docforge/discussions) for anything that is not a bug or a concrete feature request.