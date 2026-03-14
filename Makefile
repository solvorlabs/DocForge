.PHONY: dev-backend dev-extension dev-web install-backend install-extension install-mcp install-web \
        install-playwright test-backend test-extension clean help

# ── Configuration ─────────────────────────────────────────────────────────────
PYTHON := python3
PIP    := pip3
NODE   := node
NPM    := npm

# ── Help ──────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

# ── Backend ───────────────────────────────────────────────────────────────────
install-backend: ## Install Python backend dependencies
	cd backend && $(PIP) install -r requirements.txt

install-playwright: ## Install Playwright browser binaries (run after install-backend)
	playwright install chromium

dev-backend: ## Run the FastAPI backend in dev mode with hot reload
	@echo "Starting DocForge backend on http://localhost:8000"
	@echo "API docs: http://localhost:8000/docs"
	DEV_MODE=true uvicorn backend.main:app --reload --port 8000

dev-backend-with-env: ## Run backend loading .env file
	@if [ ! -f backend/.env ]; then \
	  cp backend/.env.example backend/.env; \
	  echo "Created backend/.env from .env.example — fill in your API keys"; \
	fi
	DEV_MODE=true uvicorn backend.main:app --reload --port 8000 --env-file backend/.env

test-backend: ## Test the backend end-to-end with react-bits@2.1.4
	@echo "Testing backend with react-bits@2.1.4..."
	curl -s -X POST http://localhost:8000/api/context \
	  -H "Content-Type: application/json" \
	  -d '{"input":"react-bits@2.1.4","input_type":"npm","output_format":"context_md"}' \
	  | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Job ID: {d[\"job_id\"]}\nStatus: {d[\"status\"]}')"

# ── VS Code Extension ─────────────────────────────────────────────────────────
install-extension: ## Install VS Code extension npm dependencies
	cd docforge-vscode && $(NPM) install

dev-extension: install-extension ## Compile extension in watch mode
	cd docforge-vscode && $(NPM) run watch

compile-extension: install-extension ## Compile extension once
	cd docforge-vscode && $(NPM) run compile

package-extension: compile-extension ## Package the extension as a .vsix file
	cd docforge-vscode && npx vsce package

test-extension: compile-extension ## Run extension tests
	cd docforge-vscode && $(NPM) test

# ── Web Frontend ──────────────────────────────────────────────────────────────
install-web: ## Install web frontend dependencies
	cd docforge-web && npm install

dev-web: ## Start the Next.js frontend on http://localhost:3000
	cd docforge-web && npm run dev

build-web: ## Build the web frontend for production
	cd docforge-web && npm run build

# ── MCP Server ────────────────────────────────────────────────────────────────
install-mcp: ## Install MCP server dependencies
	cd docforge-mcp && $(PIP) install -r requirements.txt

dev-mcp: ## Run the MCP server (connects via stdio — use MCP inspector for testing)
	cd docforge-mcp && $(PYTHON) server.py

test-mcp: ## Test MCP server with the MCP inspector
	@echo "Starting MCP inspector for DocForge server..."
	npx @modelcontextprotocol/inspector $(PYTHON) docforge-mcp/server.py

# ── Install everything ────────────────────────────────────────────────────────
install: install-backend install-extension install-mcp ## Install all dependencies
	@echo "All dependencies installed."
	@echo "Next: Copy backend/.env.example to backend/.env and add your GEMINI_API_KEY"

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts
	rm -rf docforge-vscode/out
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true