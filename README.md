---
title: DocForge API
emoji: 🔨
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# DocForge

> Stop letting AI hallucinate your dependencies. DocForge turns any library's docs into a version-pinned context file your AI coding tool can actually use.

AI assistants like Cursor, Copilot, and Claude are trained on data that's months or years old. When you're using `react@18`, `fastapi@0.115`, or any library that's shipped breaking changes since the model's cutoff — your assistant is guessing. It confidently suggests import paths that no longer exist, props that were renamed, and patterns that were deprecated two major versions ago.

DocForge fixes this. Give it a package name and version, it crawls the live documentation, structures it with AI, and writes a `.context.md` file containing exactly what your assistant needs: install commands, core imports, key props, real examples, and version-specific gotchas.

---

## How it works

```
you: dcf generate @tanstack/react-query@5.0.0

DocForge:
  1. Resolves npm metadata → finds docs URL
  2. Playwright crawls the live docs site (JS-rendered)
  3. Gemini 2.0 Flash structures: imports, props, examples, gotchas
  4. Writes .context.md to your project
```

Drop the file into your AI tool's context. Your assistant now knows what actually changed in v5.

---

## Use it four ways

### CLI (fastest)

```bash
npm install -g @docforge-cli/cli
dcf generate react@18.2.0
dcf detect          # scans package.json and generates for all deps
```

Works on Linux, macOS, Windows. Native Rust binary, no Node.js runtime required.

### VS Code Extension

Install **DocForge** from the VS Code Marketplace. Open the sidebar panel, sign in, type a package name — context file appears in your project root.

Also auto-injects into `.cursor/rules/` for Cursor users.

### Web App

Go to the web app, paste a package name, URL, GitHub link, or raw docs text. Download the generated `.context.md`.

### MCP Server (Claude Desktop / Cursor / Windsurf)

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/path/to/docforge-mcp/server.py"]
    }
  }
}
```

The AI calls DocForge mid-conversation when it detects it needs accurate library docs. No manual steps.

---

## Supported input types

| Input | Example |
|---|---|
| npm package | `react@18.2.0`, `@tanstack/react-query@5` |
| PyPI package | `fastapi`, `fastapi==0.115.0` |
| GitHub repo | `https://github.com/DavidHDev/react-bits` |
| Docs URL | `https://ui.shadcn.com/docs` |
| Pasted text | raw docs, changelogs, READMEs |

---

## What's in a `.context.md`

```markdown
# react@18.2.0

## Install
npm install react@18.2.0 react-dom@18.2.0

## Core Imports
import { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

## Key Changes (v18)
- createRoot replaces ReactDOM.render — old API still works but logs a warning
- Automatic batching: state updates inside setTimeout/fetch now batch by default
- useId hook for stable SSR-safe IDs

## Gotchas
- StrictMode double-invokes effects in dev — this is intentional, not a bug
- flushSync required if you need synchronous DOM updates after a state change
```

---

## Auth model

Sign up free. Use the shared Gemini/Groq keys (rate-limited) or bring your own:

- Gemini API key (primary, 1M context window)
- Groq API key (fallback, LLaMA 3.3 70B, 14,400 req/day free)

BYOK users get priority processing with no shared quota limits.

---

## Running locally

Requires Python 3.12+, Node.js 18+.

```bash
git clone https://github.com/solvorlabs/DocForge
cd DocForge

# Backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
playwright install chromium --with-deps
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
SECRET_KEY=any_random_string_32_chars
DEV_MODE=true
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
# Health check: http://localhost:8000/api/health
```

For the full local dev setup (web UI, CLI, extension, MCP) see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Project structure

```
DocForge/
├── backend/          FastAPI — crawling, AI structuring, auth, caching
├── docforge-web/     Next.js web app
├── docforge-cli/     Rust CLI, distributed via npm optional dependencies
├── docforge-vscode/  VS Code extension (zero npm dependencies)
└── docforge-mcp/     MCP server for Claude Desktop, Cursor, Windsurf
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first areas: new ingesters (JSR/Deno), better HTML→Markdown conversion, backend tests.

## License

MIT — built by [Solvor Private Limited](https://github.com/solvorlabs).
