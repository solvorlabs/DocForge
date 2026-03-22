# DocForge — Future Scope

This document tracks ideas and features intentionally deferred to keep the current implementation focused and clean.

**Already implemented (not listed here):**
- Google + GitHub OAuth in backend, VS Code extension sidebar, and web UI
- Email/password registration and login
- JWT auth shared between the VS Code extension and CLI via `~/.config/docforge/config.toml`
- VS Code sidebar panel with auth, health check, and API key management
- Rust CLI with npm distribution and per-platform binary packages
- Gemini 2.0 Flash → Groq LLaMA 3.3 70B fallback chain

---

## 1. No-API Local Parsing (Zero API Key Mode)

Most popular packages ship with typed declarations. We can extract full API structure without calling any AI API at all.

**How it works:**
- **npm / TypeScript** — download the package, parse `.d.ts` declaration files directly (exported types, props, function signatures — 100% accurate)
- **Python** — parse source with the `ast` module + docstring extraction
- **Rust crates** — consume `rustdoc` JSON output (built into `cargo doc --output-format json`)
- **.NET / NuGet** — parse XML doc comments
- **Java / Maven** — parse Javadoc HTML

**Why deferred:** This is a full AST pipeline in a separate language. High value, but it's a separate product decision (do we want to be deterministic + zero-cost, or AI-flexible + supports untyped packages). Both can coexist — try AST first, fall back to AI if no types found.

**Where this changes the architecture:** The Rust CLI wins this race. CPU-bound parsing, no network wait, no API quota. Could be the core engine with the Python backend as orchestrator.

---

## 2. Frontend Design Overhaul

- Dashboard: grid view of all generated contexts with search + filter
- Per-library detail page: interactive component explorer, props table, usage examples inline
- History timeline: see how a library's API changed across versions
- Team workspace: share context files with teammates, see who generated what

---

## 3. CLI Improvements

- `dcf diff react@17 react@18` — show what changed between two versions
- `dcf update` — re-generate all packages in `.context.md` that have newer versions
- `dcf bundle` — combine multiple `.context.md` files into one mega-context for a project
- `dcf share` — upload `.context.md` to DocForge and get a shareable link
- Shell completions (`dcf completions bash/zsh/fish`)
- Progress persistence: if a batch job is interrupted, resume from where it stopped
- `dcf watch package.json` — auto-regenerate when deps change

---

## 4. VS Code Extension Improvements

- Inline hover docs: hover over an import and see the DocForge context inline
- Auto-detect `package.json` changes and offer to regenerate
- Snippet injection: right-click a component → "Insert usage example"
- Works without a backend (offline mode via local parsing, see item 1)

---

## 5. MCP Server Improvements

- Streaming responses so Claude sees partial output while still processing
- Multi-package tool: `get_context(["react@18", "zustand@4"])` in one call
- Semantic search across all your cached contexts

---

## 6. Caching & Performance

- Global shared cache: if anyone already generated `react@18`, everyone benefits (opt-in)
- Redis-backed cache with TTL per package (popular packages cached longer)
- Pre-baked contexts for the top 500 npm packages — instant response, no crawling
- Crawl depth/breadth controls: currently hard-capped at 15 pages — large libraries like antd (60+ components) need 100+ pages to get meaningful coverage
- Smarter page prioritization: rank crawled pages by relevance (component API pages > blog posts > changelogs) so the 80k token budget goes to the right content

---

## 7. Registry Auto-Detection Improvements

- Ambiguous package names (e.g. `phoenix` — is it Elixir Hex or an npm package?): show a picker
- `dcf search rails` — show all registries that have a package with that name
- Lockfile parsing: read `Cargo.lock`, `Gemfile.lock`, `pubspec.lock`, `packages.lock.json` (not just `package.json`)
- JSR (JavaScript Registry) ingester for Deno/modern packages

---

## 8. AI / Structuring Improvements

- Use local Ollama (Llama 3.x, Mistral) as a free AI backend — no API key needed
- Multi-model consensus: run Gemini + GPT-4o on the same docs, merge the best output
- Fine-tuned model specifically for API doc extraction (much cheaper than general LLM)
- Confidence scores per component: flag components where AI was uncertain
- Chunked structuring for large libraries: instead of truncating to 80k chars, split docs into N chunks → extract components from each → merge into one context file (antd, MUI, etc. need this)
- GitHub source crawl as primary ingestion for JS-heavy doc sites (e.g. ant.design is React-rendered — Playwright gets generic pages, not per-component API docs; the GitHub repo's `docs/` or TypeScript `.d.ts` files are far richer)
- Output quality scoring: auto-detect when a generated context is too sparse (e.g. fewer than 5 components for a known large library) and trigger a deeper re-crawl automatically

---

## 9. Monetization / Team Features

- Team plan: shared API key pool, shared context cache, audit log
- CLI usage analytics dashboard (opt-in)
- Private registry support (GitHub Packages, JFrog Artifactory, private npm)
- SOC 2 / GDPR compliance for enterprise
- GitHub Action: auto-generate `.context.md` on every `package.json` change in CI

---

## 10. Corrections & Community

- `dcf correct react@18 Button` — flag an incorrect extraction, submit fix
- Community-verified contexts (crowdsourced corrections merged into shared cache)
- Public corrections web UI — browse and submit doc corrections without CLI
