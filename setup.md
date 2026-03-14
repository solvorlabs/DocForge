# DocForge — Setup Guide

This guide covers every way to run DocForge: backend, VS Code extension, CLI, web UI, and MCP server.

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Python | 3.12 | `python3 --version` |
| Node.js | 20 | `node --version` |
| npm | 10 | `npm --version` |
| Git | any | `git --version` |

You will also need a **Google Gemini API key** for the primary structuring engine. Get one free at [aistudio.google.com](https://aistudio.google.com).

Optionally, add a **Groq API key** as a fallback when Gemini hits its daily quota. Get one free at [console.groq.com](https://console.groq.com).

---

## 1. Clone the repository

```bash
git clone https://github.com/docforge/docforge
cd docforge
```

---

## 2. Backend Setup

The backend is required by all other components. The extension, CLI, MCP server, and web UI are thin clients that call it.

### Install dependencies

```bash
make install-backend
# or manually:
cd backend && pip install -r requirements.txt
```

### Install Playwright browser (needed for JS-rendered doc sites)

```bash
make install-playwright
# or:
playwright install chromium --with-deps
```

### Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
# Required — get a free key at https://aistudio.google.com
GEMINI_API_KEY=your_gemini_key_here

# Optional but recommended — fallback when Gemini hits daily quota
# Get a free key at https://console.groq.com
GROQ_API_KEY=your_groq_key_here

# Optional — Supabase for persistent cache across restarts
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Keep true for local dev (no Supabase needed, uses in-memory cache)
DEV_MODE=true
```

> **Note:** `DEV_MODE=true` uses an in-memory cache so you can run the full stack without any database. Cache is lost on restart.

### Start the backend

```bash
make dev-backend
```

The backend starts at **http://localhost:8000**.

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

### Test it works

```bash
make test-backend
```

This submits a test job and prints the `job_id`. Poll for the result:

```bash
curl http://localhost:8000/api/context/<job_id>
```

When `"status": "complete"`, the `output` field contains the generated context.

---

## 3. CLI Setup

The CLI is a zero-dependency Node.js tool. Install it globally from the repo:

```bash
cd docforge-cli
npm install -g .
```

Once the CLI is on npm, you'll be able to install it with:

```bash
npm install -g docforge-cli
```

### Usage

```bash
# Generate context for a single package
docforge generate react-bits@2.1.4

# PyPI package
docforge generate fastapi==0.110.0 --type pypi

# From a URL (GitHub URLs are auto-detected)
docforge generate https://github.com/DavidHDev/react-bits

# Read package.json and generate context for all dependencies
docforge detect

# Append multiple packages into one file
docforge detect --append --output .context.md

# Output as JSON instead of markdown
docforge generate react@18.2.0 --format json --output react.json

# Point at a remote backend
docforge generate react-bits@2.1.4 --backend https://api.docforge.dev
# or via env var:
DOCFORGE_BACKEND=https://api.docforge.dev docforge generate react-bits@2.1.4
```

Run `docforge --help` for the full reference.

---

## 4. VS Code Extension Setup

### Install from .vsix (recommended)

```bash
make package-extension
code --install-extension docforge-vscode/docforge-1.0.0.vsix
```

### Install for development

```bash
make install-extension   # installs npm deps
make compile-extension   # compiles TypeScript once
make dev-extension       # TypeScript watch mode (recompiles on save)
```

### Run in VS Code

1. Open the `docforge-vscode/` folder in VS Code
2. Press **F5** — opens an Extension Development Host window
3. In that window, open any project folder
4. Set the backend URL: `Ctrl+,` → search `docforge.backendUrl` → set to `http://localhost:8000`
5. Press `Ctrl+Shift+P` → type **DF:** to see all commands

### Available Commands (Ctrl+Shift+P → type DF:)

| Command | What it does |
|---------|-------------|
| `DF: Generate Context File` | Full flow: pick source type → value → output format |
| `DF: Detect from package.json` | Multi-select packages, runs all sequentially, appends to one file |
| `DF: Generate Context for Selected Package` | Right-click selected text in editor |
| `DF: Update Existing Context` | Re-fetch docs for library already in `.context.md` |

### Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `docforge.backendUrl` | `https://api.docforge.dev` | Backend URL |
| `docforge.outputPath` | `.context.md` | Output file path (relative to workspace root) |
| `docforge.autoOpenFile` | `true` | Auto-open the file after generation |
| `docforge.autoInjectCursor` | `true` | Auto-write to `.cursor/rules/` if the project uses Cursor |
| `docforge.apiKey` | `""` | API key for enterprise features |

---

## 5. Web UI Setup

```bash
make install-web    # installs npm deps
make dev-web        # starts at http://localhost:3000
make build-web      # production build
```

The web UI requires the backend to be running. Set `NEXT_PUBLIC_BACKEND_URL` in `docforge-web/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 6. MCP Server Setup

The MCP server lets AI assistants (Claude Desktop, Cursor, Windsurf) call DocForge autonomously.

### Install dependencies

```bash
make install-mcp
# or:
cd docforge-mcp && pip install -r requirements.txt
```

### Configure your AI tool

**Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/absolute/path/to/docforge/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

**Cursor** — create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/absolute/path/to/docforge/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

**Windsurf** — edit `~/.codeium/windsurf/mcp_config.json` with the same format.

Restart your AI tool after saving the config.

### Test the MCP server

```bash
make test-mcp
# Opens the MCP inspector at http://localhost:5173
```

---

## 7. Install Everything at Once

```bash
make install
```

Runs `install-backend`, `install-extension`, `install-mcp`, and `install-web` in sequence.

---

## Environment Variables Reference

| Variable | Component | Default | Description |
|----------|-----------|---------|-------------|
| `GEMINI_API_KEY` | backend | — | Google Gemini API key (required) |
| `GROQ_API_KEY` | backend | — | Groq API key (fallback when Gemini quota hit) |
| `SUPABASE_URL` | backend | — | Supabase project URL |
| `SUPABASE_KEY` | backend | — | Supabase anon key |
| `DEV_MODE` | backend | `true` | Use in-memory cache, skip external services |
| `PLAYWRIGHT_TIMEOUT` | backend | `60000` | Browser timeout in ms |
| `DOCFORGE_BACKEND_URL` | MCP server | `https://api.docforge.dev` | Backend URL for MCP |
| `NEXT_PUBLIC_BACKEND_URL` | web UI | `http://localhost:8000` | Backend URL for web UI |
| `DOCFORGE_BACKEND` | CLI | `http://localhost:8000` | Backend URL for CLI |

---

## Makefile Reference

| Command | What it does |
|---------|-------------|
| `make dev-backend` | Start backend with hot reload |
| `make dev-extension` | TypeScript watch mode |
| `make dev-web` | Start Next.js dev server |
| `make dev-mcp` | Start MCP server (stdio mode) |
| `make install` | Install all dependencies |
| `make install-backend` | Install Python dependencies |
| `make install-extension` | Install VS Code extension npm deps |
| `make install-web` | Install web UI npm deps |
| `make install-mcp` | Install MCP Python dependencies |
| `make install-playwright` | Install Chromium for Playwright |
| `make compile-extension` | Compile TypeScript once |
| `make test-backend` | Submit a test job to the running backend |
| `make test-mcp` | Open MCP inspector |
| `make package-extension` | Build `.vsix` for distribution |
| `make build-web` | Production build of web UI |
| `make clean` | Remove build artifacts |

---

## Troubleshooting

**Backend unreachable from extension or CLI**
Make sure `make dev-backend` is running. Set `docforge.backendUrl` to `http://localhost:8000` in VS Code settings, or pass `--backend http://localhost:8000` to the CLI.

**Gemini returns 429 / quota exceeded**
The backend automatically falls back to Groq. Add `GROQ_API_KEY` to `backend/.env` to enable it. Groq's free tier allows 14,400 requests/day.

**Gemini returns empty / garbled JSON**
Your `GEMINI_API_KEY` may be missing. With `DEV_MODE=true` and no key, look for `"⚠️ Gemini API key not configured"` in the backend output.

**Playwright fails to launch**
Run `playwright install chromium --with-deps`. On Linux the `--with-deps` flag installs required system libraries.

**npm package gives 404**
The specific version may not exist on npm. The backend automatically falls back to `latest`. If a scoped package like `@react-bits` has no slash in the name, it's treated as a plain package.

**GitHub URL clone fails**
URLs like `https://github.com/org/repo/tree/master/subdir` are automatically stripped to the repo root (`https://github.com/org/repo`). The full repo is shallow-cloned; only the relevant files are read.

**MCP tools not appearing in Claude Desktop**
The `args` path must be absolute. Restart Claude Desktop after editing the config file.

**Web UI compiles slowly**
The web UI uses Turbopack (`next dev --turbo`). First compile is slow due to Three.js; subsequent hot reloads are near-instant.
