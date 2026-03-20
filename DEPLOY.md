# DocForge — Deployment Guide

This guide covers deploying every component of DocForge to production.

| Component | Platform | Notes |
|-----------|----------|-------|
| Backend | Fly.io + Cloudflare proxy | FastAPI + Playwright needs a real server |
| Web UI | Cloudflare Pages | Native Next.js SSR support |
| VS Code Extension | VS Marketplace | Published via `vsce` |
| CLI | npm registry | Rust binary + npm wrapper |

> **Why Cloudflare Pages for frontend and Fly.io for backend?**
>
> The backend runs Playwright (a real Chromium browser) inside a Python process. This requires a full OS environment with persistent memory and long-running CPU time (30–90s per job). Cloudflare Workers and Pages Functions are sandboxed edge runtimes with strict CPU limits — they cannot run Playwright or Python. The frontend (Next.js) works perfectly on Cloudflare Pages. The backend runs on Fly.io (Docker containers), and Cloudflare is used as the DNS/proxy/CDN layer in front of it for `api.docforge.dev`.

---

## Prerequisites

- A [Cloudflare](https://cloudflare.com) account with your domain added
- A [Fly.io](https://fly.io) account (backend)
- A [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage) publisher account
- An [npm](https://www.npmjs.com) account
- A [Supabase](https://supabase.com) project (production database + cache)
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))
- GitHub OAuth credentials ([github.com/settings/developers](https://github.com/settings/developers))
- A Gemini API key ([aistudio.google.com](https://aistudio.google.com))

---

## 1. Backend — Fly.io + Cloudflare Proxy

### 1a. Install flyctl

```bash
curl -L https://fly.io/install.sh | sh
flyctl auth login
```

### 1b. Add a Dockerfile

Create `Dockerfile` at the repo root:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system deps for Playwright / Chromium
RUN apt-get update && apt-get install -y \
    wget curl gnupg libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Chromium for Playwright
RUN playwright install chromium --with-deps

COPY backend/ ./backend/

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 1c. Create the Fly app

```bash
cd /path/to/docforge
flyctl launch --no-deploy --name docforge-api --region iad
```

This creates `fly.toml`. Edit it to match:

```toml
app = "docforge-api"
primary_region = "iad"

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "requests"
    hard_limit = 25
    soft_limit = 20

[[vm]]
  memory = "2gb"
  cpu_kind = "shared"
  cpus = 2
```

> **Memory note:** Playwright + Chromium needs at least 1 GB. 2 GB is recommended for stable operation under concurrent jobs.

### 1d. Set secrets

```bash
flyctl secrets set \
  GEMINI_API_KEY="your_gemini_key" \
  SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')" \
  GROQ_API_KEY="your_groq_key" \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_KEY="your_supabase_anon_key" \
  DEV_MODE="false" \
  BACKEND_URL="https://api.docforge.dev" \
  FRONTEND_URL="https://docforge.dev" \
  GOOGLE_CLIENT_ID="your_google_client_id" \
  GOOGLE_CLIENT_SECRET="your_google_client_secret" \
  GITHUB_CLIENT_ID="your_github_client_id" \
  GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### 1e. Deploy

```bash
flyctl deploy
```

After the first deploy, Fly gives you a `.fly.dev` URL like `docforge-api.fly.dev`. Keep this — you'll need it for Cloudflare.

### 1f. Point Cloudflare at Fly.io

1. In the Cloudflare dashboard, go to your domain → **DNS**
2. Add a CNAME record:
   - **Name:** `api`
   - **Target:** `docforge-api.fly.dev`
   - **Proxy status:** Proxied (orange cloud)
3. This routes `api.docforge.dev` → Fly.io through Cloudflare's CDN/DDoS protection

### 1g. Set OAuth redirect URIs

**Google Cloud Console** — add to Authorized redirect URIs:
```
https://api.docforge.dev/api/auth/oauth/google/callback
```

**GitHub Developer Settings** — Authorization callback URL:
```
https://api.docforge.dev/api/auth/oauth/github/callback
```

### 1h. Verify

```bash
curl https://api.docforge.dev/api/health
# → {"status":"ok","service":"docforge-api","version":"1.0.0","dev_mode":false}
```

---

## 2. Web UI — Cloudflare Pages

Cloudflare Pages has native Next.js support. The build runs on Cloudflare's infrastructure and the output is deployed globally to Cloudflare's edge network.

### 2a. Connect the repo

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your `docforge` repo
3. Configure the build:

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Build command | `npm run build` |
| Build output directory | `.next` |
| Root directory | `docforge-web` |

### 2b. Set environment variables

In the Pages project → **Settings** → **Environment Variables** → **Production**:

```
NEXT_PUBLIC_BACKEND_URL = https://api.docforge.dev
```

Add the same for the **Preview** environment if you want PR previews to work:
```
NEXT_PUBLIC_BACKEND_URL = https://api.docforge.dev
```

### 2c. Add a custom domain

1. Pages project → **Custom domains** → Add `docforge.dev`
2. Cloudflare automatically configures DNS since your domain is already on Cloudflare

### 2d. Deploy

Cloudflare Pages deploys automatically on every push to `main`. To trigger a manual deploy:

1. Go to the Pages project → **Deployments** → **Retry deployment**

Or via Wrangler CLI:

```bash
npm install -g wrangler
wrangler pages deploy docforge-web/.next --project-name docforge-web
```

### 2e. Verify

```bash
curl https://docforge.dev
# → HTML response (the Next.js landing page)
```

---

## 3. VS Code Extension — Visual Studio Marketplace

### 3a. Create a publisher account

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Sign in with a Microsoft account
3. Create a publisher with ID `docforge`

### 3b. Get a Personal Access Token (PAT)

1. Go to [dev.azure.com](https://dev.azure.com) → **User Settings** → **Personal Access Tokens**
2. Create a new token:
   - **Organization:** All accessible organizations
   - **Scopes:** Marketplace → **Manage**
3. Copy the token — you won't see it again

### 3c. Ensure the production backend URL is set

In [docforge-vscode/package.json](docforge-vscode/package.json), the default `backendUrl` should already be:
```json
"docforge.backendUrl": {
  "default": "https://api.docforge.dev"
}
```

### 3d. Compile and package

```bash
# Install vsce (one-time)
npm install -g @vscode/vsce

# Compile TypeScript
make compile-extension

# Package
cd docforge-vscode
vsce package
# → docforge-1.0.0.vsix
```

### 3e. Publish

```bash
cd docforge-vscode
vsce login docforge        # prompts for PAT (one-time)
vsce publish
```

Or without storing the PAT:
```bash
vsce publish --pat YOUR_PAT_HERE
```

### 3f. Bump the version

```bash
cd docforge-vscode
# Edit "version" in package.json, then:
vsce publish patch   # auto-bumps patch version and publishes in one step
# or
vsce publish minor
```

### 3g. Verify

After 2–5 minutes:
```
https://marketplace.visualstudio.com/items?itemName=docforge.docforge
```

Users install with:
```bash
code --install-extension docforge.docforge
```

---

## 4. CLI — npm Registry

The CLI is a Rust binary wrapped in an npm package. You must build platform-specific binaries first, publish them as scoped packages, then publish the main wrapper.

### 4a. Build the Rust binary

```bash
cd docforge-cli

# Native build (on Linux x64)
cargo build --release
cp target/release/dcf npm/linux-x64/bin/dcf
chmod +x npm/linux-x64/bin/dcf
```

For cross-compilation to other platforms, use `cross`:

```bash
cargo install cross

# Linux ARM64
cross build --release --target aarch64-unknown-linux-gnu
cp target/aarch64-unknown-linux-gnu/release/dcf npm/linux-arm64/bin/dcf

# macOS x64
cross build --release --target x86_64-apple-darwin
cp target/x86_64-apple-darwin/release/dcf npm/darwin-x64/bin/dcf

# macOS ARM64 (Apple Silicon)
cross build --release --target aarch64-apple-darwin
cp target/aarch64-apple-darwin/release/dcf npm/darwin-arm64/bin/dcf

# Windows x64
cross build --release --target x86_64-pc-windows-gnu
cp target/x86_64-pc-windows-gnu/release/dcf.exe npm/win32-x64/bin/dcf.exe
```

### 4b. Login to npm

```bash
npm login
```

### 4c. Publish platform packages first

```bash
cd docforge-cli

for platform in linux-x64 linux-arm64 darwin-x64 darwin-arm64 win32-x64; do
  cd npm/$platform
  npm publish --access public
  cd ../..
done
```

### 4d. Publish the main wrapper

```bash
cd docforge-cli
npm publish --access public
```

### 4e. Verify

```bash
npm install -g docforge-cli
dcf --version
dcf login
```

---

## 5. GitHub Actions CI/CD

Create `.github/workflows/deploy.yml` to automate releases on every version tag:

```yaml
name: Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  # ── Backend ──────────────────────────────────────────────────────────────
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  # ── Web UI ────────────────────────────────────────────────────────────────
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: docforge-web
      - run: npm run build
        working-directory: docforge-web
        env:
          NEXT_PUBLIC_BACKEND_URL: https://api.docforge.dev
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy docforge-web/.next --project-name=docforge-web --commit-dirty=true

  # ── CLI platform binaries ─────────────────────────────────────────────────
  build-cli:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            artifact: dcf
            platform: linux-x64
          - os: ubuntu-latest
            target: aarch64-unknown-linux-gnu
            artifact: dcf
            platform: linux-arm64
          - os: macos-latest
            target: x86_64-apple-darwin
            artifact: dcf
            platform: darwin-x64
          - os: macos-latest
            target: aarch64-apple-darwin
            artifact: dcf
            platform: darwin-arm64
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            artifact: dcf.exe
            platform: win32-x64
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
      - name: Build
        run: cargo build --release --target ${{ matrix.target }}
        working-directory: docforge-cli
      - uses: actions/upload-artifact@v4
        with:
          name: dcf-${{ matrix.platform }}
          path: docforge-cli/target/${{ matrix.target }}/release/${{ matrix.artifact }}

  # ── Publish CLI ────────────────────────────────────────────────────────────
  publish-cli:
    needs: build-cli
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - uses: actions/download-artifact@v4
      - name: Place binaries and set permissions
        run: |
          cp dcf-linux-x64/dcf   docforge-cli/npm/linux-x64/bin/dcf
          cp dcf-linux-arm64/dcf docforge-cli/npm/linux-arm64/bin/dcf
          cp dcf-darwin-x64/dcf  docforge-cli/npm/darwin-x64/bin/dcf
          cp dcf-darwin-arm64/dcf docforge-cli/npm/darwin-arm64/bin/dcf
          cp dcf-win32-x64/dcf.exe docforge-cli/npm/win32-x64/bin/dcf.exe
          chmod +x docforge-cli/npm/linux-x64/bin/dcf
          chmod +x docforge-cli/npm/linux-arm64/bin/dcf
          chmod +x docforge-cli/npm/darwin-x64/bin/dcf
          chmod +x docforge-cli/npm/darwin-arm64/bin/dcf
      - name: Publish platform packages
        run: |
          for platform in linux-x64 linux-arm64 darwin-x64 darwin-arm64 win32-x64; do
            cd docforge-cli/npm/$platform && npm publish --access public && cd ../../..
          done
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Publish main package
        run: npm publish --access public
        working-directory: docforge-cli
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  # ── Publish Extension ──────────────────────────────────────────────────────
  publish-extension:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: make compile-extension
      - run: npm install -g @vscode/vsce
      - run: vsce publish --pat ${{ secrets.VSCE_PAT }}
        working-directory: docforge-vscode
```

### Required GitHub Secrets

| Secret | Where to get it |
|--------|----------------|
| `FLY_API_TOKEN` | `flyctl auth token` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token (use "Edit Cloudflare Workers" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |
| `NPM_TOKEN` | npm → Access Tokens → Generate new (Automation type) |
| `VSCE_PAT` | Azure DevOps PAT with Marketplace Manage scope |

---

## 6. Environment Variables Reference

### Backend (Fly.io secrets)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `SECRET_KEY` | Yes | JWT signing secret — 32+ random hex chars |
| `GROQ_API_KEY` | Recommended | Fallback AI when Gemini hits quota |
| `SUPABASE_URL` | Production | Supabase project URL |
| `SUPABASE_KEY` | Production | Supabase anon key |
| `DEV_MODE` | — | `false` in production |
| `BACKEND_URL` | Yes | `https://api.docforge.dev` |
| `FRONTEND_URL` | Yes | `https://docforge.dev` |
| `GOOGLE_CLIENT_ID` | OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | OAuth | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | OAuth | GitHub OAuth client secret |

### Web UI (Cloudflare Pages)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | `https://api.docforge.dev` |

---

## 7. Supabase Setup

Run this SQL in your Supabase project's SQL editor to create the required tables:

```sql
-- Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT,
  gemini_key TEXT,
  groq_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Context cache
CREATE TABLE context_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  output TEXT NOT NULL,
  components JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON context_cache (cache_key);
```

---

## 8. Cloudflare DNS Summary

After deploying, your DNS records should look like this:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api` | `docforge-api.fly.dev` | Proxied |
| CNAME | `@` or `www` | Managed by Cloudflare Pages | Proxied |

The Cloudflare Pages custom domain setup adds the root domain record automatically.

---

## 9. Troubleshooting

**Fly.io: Playwright crashes with "No usable sandbox"**
Add `--no-sandbox` to your Playwright launch options, or set:
```python
browser = await playwright.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
```
Fly.io's VMs don't allow kernel-level sandboxing by default.

**Fly.io: App runs out of memory**
Increase VM memory in `fly.toml`:
```toml
[[vm]]
  memory = "4gb"
```

**Cloudflare Pages: Build fails with "Module not found"**
Ensure **Root Directory** is set to `docforge-web`, not the repo root.

**Cloudflare Pages: Next.js SSR routes return 404**
Cloudflare Pages requires the Next.js build to be in `.next`. Verify the Build output directory is `.next` (not `out` — that's for static export).

**OAuth: "redirect_uri_mismatch"**
The exact callback URL registered in Google/GitHub must match `BACKEND_URL/api/auth/oauth/{provider}/callback`. After deploying to `api.docforge.dev`, update the URIs in both developer consoles.

**npm publish: E403 Forbidden**
Confirm `@docforge/cli-linux-x64` (and other scoped packages) aren't already published by a different account. Check [npmjs.com](https://npmjs.com) first.

**vsce publish: Publisher "docforge" not found**
Create the publisher at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage) before running `vsce publish`.
