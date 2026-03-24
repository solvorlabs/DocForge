# Contributing to DocForge

Thanks for wanting to contribute. This document covers how to get your environment running, where things live, how to submit changes, and what the project's conventions are.

---

## Before You Start

- Read [README.md](README.md) for the local quickstart
- Check the [open issues](https://github.com/docforge/docforge/issues) before starting work on a new feature — someone may already be on it
- For large changes, open an issue first to discuss the approach before writing code

---

## Repository Layout

```
docforge/
├── backend/                     # FastAPI backend (Python)
│   ├── main.py                  # App entry point, router registration, CORS, middleware
│   ├── routers/
│   │   ├── auth.py              # POST /api/auth/login, /register
│   │   ├── oauth.py             # GET /api/auth/oauth/google, /github + callbacks
│   │   ├── context.py           # POST /api/context, GET /api/context/{id}
│   │   ├── search.py            # GET /api/search
│   │   ├── versions.py          # GET /api/versions/{library}
│   │   └── corrections.py       # POST/GET /api/corrections
│   ├── services/
│   │   ├── auth_service.py      # JWT creation, password hashing, OAuth user upsert
│   │   ├── ingestion/
│   │   │   ├── npm_ingester.py  # npm registry → metadata + homepage
│   │   │   ├── url_ingester.py  # Playwright stealth crawler
│   │   │   ├── github_ingester.py # Shallow clone → README + /docs + .d.ts
│   │   │   └── paste_ingester.py  # Raw text passthrough
│   │   ├── structurer.py        # Gemini 2.0 Flash + Groq fallback
│   │   ├── formatter.py         # Structured JSON → .context.md
│   │   └── cache.py             # Supabase (prod) or in-memory (DEV_MODE)
│   └── models/schemas.py        # Pydantic request/response models
│
├── docforge-vscode/             # VS Code extension (TypeScript)
│   └── src/
│       ├── extension.ts         # Entry point, command registration, OAuth URI handler
│       ├── commands/
│       │   ├── generateContext.ts  # DF: Generate Context File
│       │   └── updateContext.ts    # DF: Update Existing Context
│       ├── api/docforgeClient.ts   # HTTP client + polling + auth helpers
│       ├── ui/
│       │   ├── webviewPanel.ts  # Sidebar panel: auth, generation, state management
│       │   ├── inputFlow.ts     # 3-step QuickPick: source → value → format
│       │   └── statusBar.ts     # Status bar item
│       └── utils/
│           ├── fileWriter.ts    # Write/append context file
│           ├── packageDetector.ts  # Read package.json, filter URL deps
│           └── cursorInjector.ts   # Auto-write to .cursor/rules/*.mdc
│
├── docforge-cli/                # CLI tool (Rust)
│   ├── src/main.rs              # Rust entry point
│   ├── Cargo.toml               # Rust dependencies
│   ├── package.json             # npm wrapper (main package)
│   └── npm/                     # Per-platform binary packages
│       ├── linux-x64/
│       ├── linux-arm64/
│       ├── darwin-x64/
│       ├── darwin-arm64/
│       └── win32-x64/
│
├── docforge-web/                # Web UI (Next.js 14 + Three.js + Radix UI)
│   ├── app/
│   │   ├── page.tsx             # Landing page with Beams background
│   │   └── generate/page.tsx    # Generate page with live job polling
│   ├── components/
│   │   ├── Beams.tsx            # Three.js animated background
│   │   ├── GenerateForm.tsx     # Tabbed input form
│   │   ├── JobStatus.tsx        # Live progress stepper
│   │   └── ResultViewer.tsx     # Copy/download + markdown preview
│   └── lib/
│       ├── api.ts               # Typed fetch wrappers
│       └── types.ts             # TypeScript interfaces
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
git checkout -b feat/jsr-ingester
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

For web UI changes:

```bash
make dev-web         # Next.js with Turbopack at http://localhost:3000
```

### 4. Test your changes

**Backend** — test the full pipeline with real packages:

```bash
make test-backend
curl http://localhost:8000/api/context/<job_id>
```

Validate against these test targets — all must produce correct output:

| Package | What to verify |
|---------|---------------|
| `react-bits@2.1.4` | `'use client'` gotcha, `npx jsrepo add` install command, `framer-motion` peer dep |
| `@tanstack/react-query@5.0.0` | v4 → v5 breaking changes mentioned in gotchas |
| `fastapi` (no version) | Resolves to latest, PyPI metadata correct |
| `https://github.com/DavidHDev/react-bits` | GitHub ingester: README + /docs extracted |

**Auth** — test the auth endpoints:

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**CLI** — test from a project directory with a `package.json`:

```bash
cd /tmp/test-project
dcf generate react@18.2.0
dcf detect
```

**Extension** — TypeScript must compile clean:

```bash
make compile-extension
```

### 5. Commit

Write commit messages in the imperative present tense:

```
feat: add JSR (JavaScript Registry) ingester
fix: handle npm 404 for scoped packages without slash
docs: update setup.md with Groq fallback instructions
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

Crawling takes 30–90 seconds. A background job model (submit → poll) lets the VS Code extension and CLI show a progress spinner without blocking. It also means every client — extension, CLI, MCP server, web UI — shares the same pipeline with no code duplication.

### Why Playwright for crawling?

Most modern doc sites are React or Next.js apps that render content client-side. `httpx` alone returns empty HTML shells. Playwright runs real Chromium to get the fully hydrated DOM. We rotate realistic Chrome user agents and strip the `navigator.webdriver` flag to avoid bot detection.

### Why Gemini 2.0 Flash as primary + Groq as fallback?

Gemini's 1M token context window handles large documentation sites in one shot. The Flash variant is fast enough for interactive use (5–15s structuring). When Gemini returns 429 (daily quota exceeded), the pipeline immediately retries with Groq LLaMA 3.3 70B — no user action needed. Groq's free tier is 14,400 requests/day.

### Why JWT auth instead of session cookies?

JWTs work across all clients — the VS Code extension, the CLI, the web UI, and the MCP server — without any session store. The token is written to `~/.config/docforge/config.toml` after login and is read by both the CLI and the VS Code extension. This means you sign in once and all tools work.

### Why a local HTTP server for VS Code OAuth?

The VS Code extension spawns a temporary `http.createServer` on a random port to receive the OAuth token after the user completes sign-in in the browser. This is the most reliable method — it doesn't require the user to copy-paste a code, and it works even when the `vscode://` URI handler isn't available (e.g., remote SSH sessions).

### Why DEV_MODE in-memory cache?

Supabase is operationally complex to set up locally. The in-memory fallback means `make dev-backend` is the only command needed to run the full stack. In production, Supabase is used for persistent caching across restarts and multiple backend instances.

### Why append mode instead of overwrite for multiple packages?

When a project uses 30 dependencies, generating 30 separate `.context.md` files is unworkable. Appending all results into one file with `---` separators gives AI tools a single point of truth for the whole project's dependencies.

### Why no external npm deps in the VS Code extension?

VS Code extensions bundle their `node_modules` into the `.vsix`. Keeping the extension dependency-free (Node.js built-ins only) keeps the bundle small and eliminates version conflicts.

### Why Rust for the CLI?

The CLI is distributed as a native binary via npm's optional platform packages. Rust compiles to a single statically-linked binary per platform — no runtime needed, instant startup, no `node_modules` at install time.

---

## Code Conventions

### Python (backend + MCP server)

- **Type hints** on all public functions
- **Docstrings** explain *why* something exists, not what the code does line by line
- **Logging** at meaningful points: crawl start/end with char counts, cache hits, AI timing
- Follow PEP 8
- `async`/`await` throughout — no blocking I/O on the event loop

### TypeScript (VS Code extension + web UI)

- `strict: true` in `tsconfig.json` — no implicit `any`
- `async`/`await` only — no callbacks or `.then()` chains
- Use the VS Code [disposable pattern](https://code.visualstudio.com/api/references/vscode-api#Disposable) for all subscriptions
- Keep commands thin — business logic goes in `api/` and `utils/`, not in `commands/`
- Template literals in webview HTML: double-escape backslashes in regex patterns (`<\\/span>` → `<\/span>` in output). Single escape is consumed by the template literal engine and causes JS syntax errors in the webview.

### Rust (CLI)

- Use `tokio` for async I/O
- Error handling with `anyhow` — no `.unwrap()` in production paths
- All output to `stdout` / `stderr` — no hidden side effects

---

## What's In Scope

Good areas to contribute:

- **New ingester** — e.g. a dedicated JSR (JavaScript Registry) ingester for Deno packages
- **Better HTML → Markdown conversion** — improving the html2text pipeline
- **Gotcha extraction improvements** — prompt engineering for specific library types
- **Backend tests** — pytest unit tests for ingesters and the formatter
- **CI/CD** — GitHub Actions for linting and running the test targets (see DEPLOY.md)
- **Community corrections UI** — frontend page for submitting doc corrections

### Out of scope (for now)

- Changing the `.context.md` output format in a breaking way
- Adding new runtime dependencies to the VS Code extension (Node.js built-ins only)
- Switching away from Gemini/Groq without a discussion in an issue first
- Adding external npm packages to the CLI

---

## Filing a Bug Report

Include:

1. The exact input (package name, URL, or GitHub repo)
2. The full error message from the backend logs (`make dev-backend` terminal output)
3. Which step failed: resolving metadata, crawling, AI structuring, or formatting
4. The `DEV_MODE` value and whether `GEMINI_API_KEY` / `GROQ_API_KEY` are set
5. For extension bugs: the VS Code Output panel → "DocForge" channel content

---

## Questions

Open a [GitHub Discussion](https://github.com/docforge/docforge/discussions) for anything that is not a bug or a concrete feature request.
