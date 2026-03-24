.PHONY: dev-backend dev-backend-with-env dev-extension dev-web dev-mcp \
        install-backend install-extension install-mcp install-web \
        install-playwright install compile-extension package-extension \
        test-backend test-extension test-mcp \
        build-web build-cli \
        publish-extension publish-cli \
        deploy-backend deploy-web \
        clean help

# ── Configuration ─────────────────────────────────────────────────────────────
VENV   := .venv
PYTHON := $(VENV)/bin/python3
PIP    := $(VENV)/bin/pip
NODE   := node
NPM    := npm

# ── Help ──────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-28s\033[0m %s\n", $$1, $$2}'

# ── Backend ───────────────────────────────────────────────────────────────────
install-backend: ## Install Python backend dependencies into .venv
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r backend/requirements.txt

install-playwright: ## Install Playwright browser binaries (run after install-backend)
	$(PYTHON) -m playwright install chromium --with-deps

dev-backend: ## Run the FastAPI backend in dev mode with hot reload
	@echo "Starting DocForge backend on http://localhost:8000"
	@echo "API docs: http://localhost:8000/docs"
	DEV_MODE=true $(VENV)/bin/uvicorn backend.main:app --reload --port 8000

dev-backend-with-env: ## Run backend loading backend/.env file
	@if [ ! -f backend/.env ]; then \
	  cp backend/.env.example backend/.env; \
	  echo "Created backend/.env from .env.example — fill in your API keys"; \
	fi
	$(VENV)/bin/uvicorn backend.main:app --reload --port 8000 --env-file backend/.env

test-backend: ## Test the backend end-to-end with react-bits@2.1.4
	@echo "Testing backend with react-bits@2.1.4..."
	curl -s -X POST http://localhost:8000/api/context \
	  -H "Content-Type: application/json" \
	  -d '{"input":"react-bits@2.1.4","input_type":"npm","output_format":"context_md"}' \
	  | $(PYTHON) -c "import sys,json; d=json.load(sys.stdin); print(f'Job ID: {d[\"job_id\"]}\nStatus: {d[\"status\"]}')"

# ── VS Code Extension ─────────────────────────────────────────────────────────
install-extension: ## Install VS Code extension npm dependencies
	cd docforge-vscode && $(NPM) install

dev-extension: install-extension ## Compile extension in watch mode (use F5 in VS Code to launch)
	cd docforge-vscode && $(NPM) run watch

compile-extension: install-extension ## Compile extension TypeScript once
	cd docforge-vscode && $(NPM) run compile

package-extension: compile-extension ## Package the extension as a .vsix file
	cd docforge-vscode && npx vsce package

publish-extension: compile-extension ## Publish the extension to VS Marketplace (requires vsce login)
	@echo "Publishing DocForge extension to Visual Studio Marketplace..."
	@echo "Run 'vsce login docforge' first if you haven't already."
	cd docforge-vscode && npx vsce publish

test-extension: compile-extension ## Run extension tests
	cd docforge-vscode && $(NPM) test

# ── CLI ───────────────────────────────────────────────────────────────────────
build-cli: ## Build the Rust CLI binary for the current platform
	@echo "Building docforge-cli Rust binary..."
	cd docforge-cli && cargo build --release
	@echo "Binary: docforge-cli/target/release/dcf"
	@echo "Run: ln -sf \$$(pwd)/docforge-cli/target/release/dcf ~/.local/bin/dcf"

publish-cli: ## Publish CLI to npm (platform packages first, then wrapper)
	@echo "Publishing @docforge/cli platform packages..."
	@for platform in linux-x64 linux-arm64 darwin-x64 darwin-arm64 win32-x64; do \
	  echo "  Publishing @docforge/cli-$$platform..."; \
	  cd docforge-cli/npm/$$platform && npm publish --access public; cd ../../..; \
	done
	@echo "Publishing docforge-cli wrapper..."
	cd docforge-cli && npm publish --access public

# ── Web Frontend ──────────────────────────────────────────────────────────────
install-web: ## Install web frontend dependencies
	cd docforge-web && npm install

dev-web: ## Start the Next.js frontend on http://localhost:3000
	cd docforge-web && npm run dev

build-web: ## Build the web frontend for production
	cd docforge-web && npm run build

# ── MCP Server ────────────────────────────────────────────────────────────────
install-mcp: ## Install MCP server dependencies
	$(PIP) install -r docforge-mcp/requirements.txt

dev-mcp: ## Run the MCP server (connects via stdio — use MCP inspector for testing)
	$(PYTHON) docforge-mcp/server.py

test-mcp: ## Test MCP server with the MCP inspector
	@echo "Starting MCP inspector for DocForge server..."
	npx @modelcontextprotocol/inspector $(PYTHON) docforge-mcp/server.py

# ── Deploy ────────────────────────────────────────────────────────────────────
deploy-backend: ## Deploy backend to Fly.io (requires flyctl and fly.toml)
	@echo "Deploying DocForge backend to Fly.io..."
	flyctl deploy

deploy-web: ## Deploy web UI to Cloudflare Pages (requires wrangler login)
	@echo "Deploying DocForge web UI to Cloudflare Pages..."
	cd docforge-web && npm run build
	wrangler pages deploy .next --project-name=docforge-web

# ── Install everything ────────────────────────────────────────────────────────
install: install-backend install-extension install-mcp install-web ## Install all dependencies
	@echo ""
	@echo "All dependencies installed."
	@echo "Next steps:"
	@echo "  1. cp backend/.env.example backend/.env"
	@echo "  2. Add GEMINI_API_KEY to backend/.env"
	@echo "  3. Run: make dev-backend"

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts
	rm -rf docforge-vscode/out
	rm -rf docforge-vscode/*.vsix
	rm -rf docforge-cli/target/release/dcf
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true
