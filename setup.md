# DocForge — Setup Guide

This guide covers every way to run DocForge: the backend alone, the VS Code extension pointed at a local backend, and the MCP server.

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Python | 3.12 | `python3 --version` |
| Node.js | 20 | `node --version` |
| npm | 10 | `npm --version` |
| Git | any | `git --version` |

You will also need a **Google Gemini API key** for the structuring engine. Get one free at [aistudio.google.com](https://aistudio.google.com).

---

## 1. Clone the repository

```bash
git clone https://github.com/docforge/docforge
cd docforge
```

---

## 2. Backend Setup

The backend is required. The extension and MCP server are thin clients that call it.

### Install dependencies

```bash
make install-backend
```

Or manually:

```bash
cd backend
pip install -r requirements.txt
```

### Install Playwright browser (needed for JS-rendered doc sites)

```bash
make install-playwright
# or:
playwright install chromium
```

### Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
# Required — get a free key at https://aistudio.google.com
GEMINI_API_KEY=your_key_here

# Optional — uses in-memory fallback if not set
REDIS_URL=redis://localhost:6379

# Optional — for user library storage
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Keep true for local dev (no Redis/Supabase needed)
DEV_MODE=true
```

> **Note:** `DEV_MODE=true` uses an in-memory cache so you can run the full stack without Redis or Supabase.

### Start the backend

```bash
make dev-backend
```

The backend starts at **http://localhost:8000**.

- API docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

### Test it works

```bash
make test-backend
```

This submits a job for `react-bits@2.1.4` and prints the job ID. Then poll:

```bash
curl http://localhost:8000/api/context/<job_id>
```

When `"status": "complete"`, the `output` field contains the generated `.context.md`.

---

## 3. VS Code Extension Setup

### Install for development

```bash
make install-extension
# or:
cd docforge-vscode && npm install
```

### Compile

```bash
make compile-extension
# or in watch mode (recompiles on save):
make dev-extension
```

### Run in VS Code

1. Open the `docforge-vscode/` folder in VS Code
2. Press **F5** — this opens an Extension Development Host window
3. In that window, open any project folder
4. Change the backend URL to your local instance:
   - `Ctrl+,` → search `docforge.backendUrl`
   - Set to `http://localhost:8000`
5. Press `Ctrl+Shift+P` → **DocForge: Generate Context File**

### Package as `.vsix` (optional)

```bash
make package-extension
# Outputs: docforge-vscode/docforge-1.0.0.vsix
```

Install locally:

```bash
code --install-extension docforge-vscode/docforge-1.0.0.vsix
```

---

## 4. MCP Server Setup

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

**Windsurf** — edit `~/.codeium/windsurf/mcp_config.json`:

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

Restart your AI tool after saving the config.

### Test the MCP server

```bash
make test-mcp
# Opens the MCP inspector at http://localhost:5173
```

---

## 5. Install Everything at Once

```bash
make install
```

This runs `install-backend`, `install-extension`, and `install-mcp` in sequence.

---

## Environment Variables Reference

| Variable | Component | Default | Description |
|----------|-----------|---------|-------------|
| `GEMINI_API_KEY` | backend | — | Google Gemini API key (required) |
| `REDIS_URL` | backend | in-memory | Redis connection string |
| `SUPABASE_URL` | backend | — | Supabase project URL |
| `SUPABASE_KEY` | backend | — | Supabase anon key |
| `PLAYWRIGHT_TIMEOUT` | backend | `60000` | Browser timeout in ms |
| `DEV_MODE` | backend | `true` | Use in-memory fallbacks |
| `DOCFORGE_BACKEND_URL` | MCP server | `https://api.docforge.dev` | Backend URL for MCP |

---

## Makefile Reference

| Command | What it does |
|---------|-------------|
| `make dev-backend` | Start backend with hot reload |
| `make dev-extension` | Start TypeScript compiler in watch mode |
| `make dev-mcp` | Start MCP server (stdio mode) |
| `make install` | Install all dependencies |
| `make install-backend` | Install Python dependencies |
| `make install-extension` | Install npm dependencies |
| `make install-mcp` | Install MCP Python dependencies |
| `make install-playwright` | Install Chromium for Playwright |
| `make test-backend` | Submit a test job to the running backend |
| `make test-mcp` | Open MCP inspector |
| `make package-extension` | Build `.vsix` for distribution |
| `make clean` | Remove build artifacts |

---

## Troubleshooting

**Backend unreachable from extension**
Make sure `make dev-backend` is running, then set `"docforge.backendUrl": "http://localhost:8000"` in VS Code settings.

**Gemini returns empty / garbled JSON**
Your `GEMINI_API_KEY` may be missing or have quota issues. The backend falls back to a mock response in `DEV_MODE=true` without a key — look for `"⚠️ Gemini API key not configured"` in the output.

**Playwright fails to launch**
Run `playwright install chromium --with-deps`. On Linux you may need `--with-deps` to install system libraries.

**MCP tools not appearing in Claude Desktop**
Check the `args` path in your config is absolute. Restart Claude Desktop after editing the config.