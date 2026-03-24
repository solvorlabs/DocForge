# DocForge

DocForge is an open-source developer tool that converts package docs into version-aware context files for AI coding tools.

Built by Solvor Private Limited.

License: MIT.

## Use Case

AI coding tools often hallucinate outdated APIs. DocForge fetches docs for the exact version you use and generates context files so your assistant has accurate, up-to-date references.

## Key Features

- 🚀 Version-pinned context generation
- 🌐 Multi-source input: npm, PyPI, GitHub, docs URLs, pasted docs
- 🧠 AI structuring for imports, props, examples, and gotchas
- 🧩 Works across Web app, CLI, VS Code extension, and MCP server
- 🔐 Auth + BYOK model (Gemini/Groq keys per user)

## Quick Start (Web App)

1. Move to the web app folder.
2. Install dependencies.
3. Add frontend env.
4. Start dev server.

```bash
cd docforge-web
npm install
```

Create docforge-web/.env.local with:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

Web app runs at http://localhost:3000.

## Minimal Backend Setup (Required by Web/CLI/Extension)

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

Create backend/.env with at least:

```env
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_random_secret
DEV_MODE=true
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

Start backend:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: http://localhost:8000/api/health

## Project Structure

- backend: FastAPI API and ingestion/structuring pipeline
- docforge-web: Next.js web app
- docforge-cli: Rust CLI with npm distribution
- docforge-vscode: VS Code extension
- docforge-mcp: MCP server for AI clients

## Relevant Docs

- CONTRIBUTING.md
- DEPLOY.md
