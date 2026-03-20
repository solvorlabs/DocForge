# DocForge — Local Development Setup

This guide covers running every component of DocForge locally: backend, VS Code extension, CLI, web UI, and MCP server.

For production deployment, see [DEPLOY.md](DEPLOY.md).

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Python | 3.12 | `python3 --version` |
| Node.js | 20 | `node --version` |
| npm | 10 | `npm --version` |
| Rust + Cargo | stable | `cargo --version` |
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
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
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

# JWT signing key — required for auth (generate with: python3 -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your_secret_key_here

# OAuth — Google (optional for local dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth — GitHub (optional for local dev)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Used in OAuth redirect URIs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

> **Note:** `DEV_MODE=true` uses an in-memory cache so you can run the full stack without any database. Cache is lost on restart. Auth still works — users are stored in memory too.

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

The CLI is a Rust binary distributed via npm. It requires the backend to be running for generating context.

### Build from source

```bash
cd docforge-cli
cargo build --release
# Binary lands at target/release/dcf

# Symlink so 'dcf' works from anywhere
ln -sf $(pwd)/target/release/dcf ~/.local/bin/dcf
```

Then open a new terminal or run `hash -r` to clear the shell's command cache.

### Login

```bash
dcf login
# Opens your browser to the web UI login page
# After sign-in, the JWT token is saved to ~/.config/docforge/config.toml
```

### Usage — interactive mode (recommended)

```bash
dcf
```

Starts a persistent REPL session. Just type what you need:

```
→ react@18                        # npm package
→ @tanstack/react-query@5         # scoped npm package
→ fastapi==0.115                  # PyPI package
→ github.com/vercel/next.js       # GitHub repo
→ https://docs.stripe.com         # any docs URL
→ @package.json                   # scan ALL deps in current project
→ @path/to/package.json           # scan deps from any path
→ help                            # show all options
→ exit                            # quit
```

The `.context.md` file is written to whichever directory you ran `dcf` from.

### Usage — one-shot commands

```bash
dcf generate react@18
dcf generate fastapi==0.115
dcf generate github.com/vercel/next.js
dcf detect                        # reads package.json in current directory
dcf config                        # show current config and session status
dcf login                         # sign in via browser
dcf logout                        # sign out
```

### Config file

Stored at `~/.config/docforge/config.toml`. Written after successful `dcf login` and shared with the VS Code extension.

```bash
# Optional: set local API keys (no account needed, bypasses backend)
dcf config --gemini-key YOUR_KEY
dcf config --groq-key YOUR_KEY
```

---

## 4. VS Code Extension Setup

### Install from .vsix (recommended for testing)

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
5. Click the DocForge shield icon in the Activity Bar to open the sidebar
6. Sign in with Google, GitHub, or email/password

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
| `docforge.apiKey` | `""` | Legacy API key (JWT from login is preferred) |

### Auth in the extension

The sidebar panel lets you:
- Sign in with Google or GitHub (opens the browser, returns the JWT via `vscode://` URI handler)
- Sign in with email + password
- Register a new account
- Set your Gemini/Groq API keys directly in the panel

After sign-in, the JWT is written to `~/.config/docforge/config.toml` (same file the CLI uses). You stay signed in across VS Code restarts.

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

**Claude Desktop**

_Linux:_
```bash
mkdir -p ~/.config/Claude
nano ~/.config/Claude/claude_desktop_config.json
```

_macOS:_
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

_Windows:_ open `%APPDATA%\Claude\claude_desktop_config.json` in Notepad.

Paste this (replace the path with your actual clone location):

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/home/YOUR_USERNAME/path/to/docforge/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

> **Tip (Linux/macOS):** run `pwd` inside the `docforge-mcp/` folder to get the exact path.

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

**Windsurf**

| OS | Config file path |
|---|---|
| Linux | `~/.codeium/windsurf/mcp_config.json` |
| macOS | `~/.codeium/windsurf/mcp_config.json` |
| Windows | `%APPDATA%\Codeium\windsurf\mcp_config.json` |

Use the same JSON format as above.

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
| `SECRET_KEY` | backend | — | JWT signing secret (required for auth) |
| `SUPABASE_URL` | backend | — | Supabase project URL |
| `SUPABASE_KEY` | backend | — | Supabase anon key |
| `DEV_MODE` | backend | `true` | Use in-memory cache and storage, skip external services |
| `BACKEND_URL` | backend | `http://localhost:8000` | Used in OAuth redirect URIs |
| `FRONTEND_URL` | backend | `http://localhost:3000` | Used in OAuth redirect URIs |
| `GOOGLE_CLIENT_ID` | backend | — | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | backend | — | Google OAuth app client secret |
| `GITHUB_CLIENT_ID` | backend | — | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | backend | — | GitHub OAuth app client secret |
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
| `make install-backend` | Install Python dependencies into `.venv` |
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

**OAuth sign-in opens browser but VS Code sidebar doesn't update**
Make sure `BACKEND_URL=http://localhost:8000` and `FRONTEND_URL=http://localhost:3000` are set in `backend/.env`. The backend uses these to construct redirect URIs. The extension catches the token via the `vscode://docforge.docforge/callback` URI handler.

**Gemini returns 429 / quota exceeded**
The backend automatically falls back to Groq. Add `GROQ_API_KEY` to `backend/.env` to enable it. Groq's free tier allows 14,400 requests/day.

**Gemini returns empty / garbled JSON**
Your `GEMINI_API_KEY` may be missing. With `DEV_MODE=true` and no key, look for `"Gemini API key not configured"` in the backend output.

**Playwright fails to launch**
Run `playwright install chromium --with-deps`. On Linux the `--with-deps` flag installs required system libraries.

**npm package gives 404**
The specific version may not exist on npm. The backend automatically falls back to `latest`.

**GitHub URL clone fails**
URLs like `https://github.com/org/repo/tree/master/subdir` are automatically stripped to the repo root. The full repo is shallow-cloned; only the relevant files are read.

**MCP tools not appearing in Claude Desktop**
The `args` path must be absolute. Restart Claude Desktop after editing the config file.

**Web UI compiles slowly**
The web UI uses Turbopack (`next dev --turbo`). First compile is slow due to Three.js; subsequent hot reloads are near-instant.

**Extension shows "Checking..." permanently**
The sidebar health check has a 5-second timeout. If the backend is not running, it resolves to "Offline" automatically. If it stays stuck, check the VS Code Output panel (Ctrl+Shift+U) and select "DocForge" from the dropdown.
