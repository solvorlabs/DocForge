# DocForge — Deployment Guide

This guide reflects the actual production setup as deployed.

| Component | Platform | URL |
|-----------|----------|-----|
| Backend | HuggingFace Spaces (Docker) | `https://solvorlabs-docforge-api.hf.space` |
| Web UI | Cloudflare Pages | `https://docforge.solvor.co.in` |
| VS Code Extension | VS Marketplace | (pending) |
| CLI | npm registry | (pending) |

---

## 1. Backend — HuggingFace Spaces

The backend runs as a Docker container on HuggingFace Spaces (free tier). HF Spaces requires port 7860 and a specific README.md format.

### 1a. Add HuggingFace as a git remote

```bash
git remote add hf https://huggingface.co/spaces/solvorlabs/docforge-api
```

### 1b. Dockerfile

The root `Dockerfile` must follow this exact order — Playwright requires root to install, so all system-level operations must happen **before** `USER user`:

```dockerfile
FROM python:3.12-slim

RUN useradd -m -u 1000 user
ENV PATH="/home/user/.local/bin:$PATH"
ENV PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget curl gnupg \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /home/user/.cache/ms-playwright && \
    chown -R user:user /home/user/.cache && \
    playwright install chromium --with-deps

COPY --chown=user backend/ ./backend/

USER user

ENV DEV_MODE=false
ENV PORT=7860

EXPOSE 7860

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

> **Critical gotchas:**
> - `USER user` must come **after** `playwright install chromium --with-deps` — playwright needs root to install system deps
> - Set `PLAYWRIGHT_BROWSERS_PATH` to `/home/user/.cache/ms-playwright` so the browser installed by root is found when the app runs as `user`
> - Create and chown the cache dir before playwright install so the user can read it at runtime

### 1c. Push to HuggingFace

HuggingFace rejects pushes that include binary or large files from the git history. Use an orphan branch to push only the current state:

```bash
# Make sure your changes are committed to main first
git add -A && git commit -m "your message"

# Create a clean orphan branch and push to HF
git checkout --orphan hf-deploy
git rm -rf --cached .

# Write the HF README with required YAML frontmatter
cat > README.md << 'EOF'
---
title: DocForge API
emoji: 📄
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# DocForge API
FastAPI backend for DocForge — generates context files from library documentation.
EOF

git add .
git commit -m "deploy to HF"
git push hf hf-deploy:main --force

# Return to main branch and clean up
git checkout main
git branch -D hf-deploy
```

> **Why orphan branch?** HF rejects pushes with binary files in git history (e.g. compiled assets, lock file blobs). An orphan branch has no history — only the current snapshot is pushed.

> **Why force push?** HF Spaces `main` and your repo `main` have diverged histories. `--force` is required.

> **VSCode linter warning:** A hadolint hook may revert the Dockerfile to a broken version (putting `USER user` before playwright). If this happens, write the Dockerfile content via bash heredoc in the same command block as the git operations so the linter doesn't trigger.

### 1d. Set HuggingFace Space secrets

In the HF Space → **Settings** → **Variables and secrets**, add these as **Secrets** (not Variables):

| Secret | Value |
|--------|-------|
| `SECRET_KEY` | 64-char hex string: `python3 -c 'import secrets; print(secrets.token_hex(32))'` |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/service key |
| `BACKEND_URL` | `https://solvorlabs-docforge-api.hf.space` |
| `FRONTEND_URL` | `https://docforge.solvor.co.in` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GITHUB_CLIENT_ID` | From GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | From GitHub Developer Settings |

> **Do NOT add `GEMINI_API_KEY` or `GROQ_API_KEY`** — DocForge uses a BYOK (Bring Your Own Key) model. Users supply their own API keys via the Settings page. The backend fetches them from the database using the user's auth token.

> **Trailing newline warning:** When setting secrets, always type values manually — do not paste from a terminal. Paste operations often include a trailing `\n` which makes OAuth redirect URIs malformed (e.g. `https://...hf.space\n/api/auth/...`). If OAuth fails with "malformed request", delete and retype the `BACKEND_URL` and `FRONTEND_URL` secrets. Then restart the Space to reload the values.

### 1e. Set OAuth redirect URIs

**Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)) → OAuth 2.0 Credentials → your client → Authorized redirect URIs:
```
https://solvorlabs-docforge-api.hf.space/api/auth/oauth/google/callback
```

**GitHub Developer Settings** ([github.com/settings/developers](https://github.com/settings/developers)) → your OAuth app → Authorization callback URL:
```
https://solvorlabs-docforge-api.hf.space/api/auth/oauth/github/callback
```

### 1f. Verify

```bash
curl https://solvorlabs-docforge-api.hf.space/api/health
# → {"status":"ok","service":"docforge-api","version":"1.0.0","dev_mode":false}
```

> **HF custom domain note:** HuggingFace requires a PRO account for custom domains. The direct HF URL must be used for the backend. A Cloudflare CNAME pointing at HF will fail (404) because Cloudflare's proxy sends a different `Host` header than HF expects.

---

## 2. Web UI — Cloudflare Pages

The frontend is a Next.js static export deployed to Cloudflare Pages.

### 2a. Configure Next.js for static export

In [docforge-web/next.config.mjs](docforge-web/next.config.mjs), `output: 'export'` must be set:

```js
const nextConfig = {
  output: 'export',
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // ...
};
```

This makes `npm run build` output to the `out/` directory instead of `.next/`.

### 2b. Connect the repo to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your `DocForge` repo
3. Configure the build:

| Setting | Value |
|---------|-------|
| Framework preset | None (or Next.js — but override the output dir) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `docforge-web` |

> **Why `out` not `.next`?** Static export (`output: 'export'`) puts files in `out/`. Cloudflare Pages cannot serve `.next/` directly — it needs the static files in `out/`.

### 2c. Set environment variables

In the Pages project → **Settings** → **Environment Variables** → **Production**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://solvorlabs-docforge-api.hf.space` |

### 2d. Add a custom domain

1. Pages project → **Custom domains** → **Set up a custom domain** → enter `docforge.solvor.co.in`
2. In the Cloudflare DNS panel for `solvor.co.in`, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `docforge` | `<your-pages-project>.pages.dev` | Proxied (orange cloud) |

Cloudflare Pages may add this record automatically when you set the custom domain.

### 2e. Deploy

Cloudflare Pages auto-deploys on every push to `main`. To trigger manually:
- Pages project → **Deployments** → **Retry deployment**

### 2f. Verify

```bash
curl https://docforge.solvor.co.in
# → HTML (the Next.js landing page)
```

---

## 3. Supabase Setup

Run this SQL in your Supabase project SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Encrypted API keys (separate from users for security)
CREATE TABLE user_api_keys (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gemini_key_enc TEXT,
  groq_key_enc TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Job + context cache (replaces Redis on free tier)
CREATE TABLE cache_entries (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON cache_entries (expires_at);
```

> API keys are encrypted with Fernet using `SECRET_KEY` before storage. Never store them in plaintext.

---

## 4. VS Code Extension — Visual Studio Marketplace

### 4a. Create a publisher account

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Sign in with a Microsoft account
3. Create a publisher with ID `docforge`

### 4b. Get a Personal Access Token (PAT)

1. Go to [dev.azure.com](https://dev.azure.com) → **User Settings** → **Personal Access Tokens**
2. Create a new token:
   - **Organization:** All accessible organizations
   - **Scopes:** Marketplace → **Manage**
3. Copy the token — you won't see it again

### 4c. Ensure the production backend URL is set

In [docforge-vscode/package.json](docforge-vscode/package.json), the default `backendUrl` should be:
```json
"docforge.backendUrl": {
  "default": "https://solvorlabs-docforge-api.hf.space"
}
```

### 4d. Compile and package

```bash
npm install -g @vscode/vsce
make compile-extension
cd docforge-vscode
vsce package
# → docforge-1.0.0.vsix
```

### 4e. Publish

```bash
cd docforge-vscode
vsce login docforge
vsce publish
```

---

## 5. CLI — npm Registry

### 5a. Build the Rust binary (linux-x64)

```bash
cd docforge-cli
cargo build --release
mkdir -p npm/linux-x64/bin
cp target/release/dcf npm/linux-x64/bin/dcf
chmod +x npm/linux-x64/bin/dcf
```

> **Dependency note:** `reqwest` must use `rustls-tls` (not the default native-tls) to avoid requiring system OpenSSL. In `Cargo.toml`:
> ```toml
> reqwest = { version = "0.12", default-features = false, features = ["json", "rustls-tls"] }
> ```

> **NixOS note:** Rust on NixOS is managed by the system config — `rustup` is not available and cross-compilation targets cannot be added with `rustup target add`. Build linux-x64 natively and use GitHub Actions for other platforms (see Section 6).

### 5b. Test locally

```bash
./target/release/dcf --help

# To install system-wide:
cargo install --path .
export PATH="$HOME/.cargo/bin:$PATH"
dcf --help
```

### 5c. Publish linux-x64 first, then the main wrapper

The other platform packages (`linux-arm64`, `darwin-*`, `win32-x64`) are `optionalDependencies` — npm skips them silently if not published yet. Publish linux-x64 now; add other platforms later via GitHub Actions.

```bash
cd docforge-cli
npm login

cd npm/linux-x64 && npm publish --access public && cd ../..
npm publish --access public
```

> **Package name note:** `docforge-cli` was taken on npm by an unrelated project. The published packages are:
> - Main: `@docforge-cli/cli`
> - Platform binary: `@docforge-cli/cli-linux-x64` (others added via GitHub Actions)

### 5d. Verify

```bash
npm install -g @docforge-cli/cli
dcf --help
```

---

## 6. GitHub Actions CI/CD

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
        with:
          fetch-depth: 0
      - name: Push orphan branch to HuggingFace
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          git config user.email "ci@docforge.dev"
          git config user.name "DocForge CI"
          git remote add hf https://user:${HF_TOKEN}@huggingface.co/spaces/solvorlabs/docforge-api
          git checkout --orphan hf-deploy
          git rm -rf --cached .
          cat > README.md << 'EOF'
          ---
          title: DocForge API
          emoji: 📄
          colorFrom: blue
          colorTo: indigo
          sdk: docker
          pinned: false
          ---
          EOF
          git add .
          git commit -m "deploy ${{ github.ref_name }}"
          git push hf hf-deploy:main --force

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
          NEXT_PUBLIC_BACKEND_URL: https://solvorlabs-docforge-api.hf.space
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy docforge-web/out --project-name=docforge-web --commit-dirty=true
```

### Required GitHub Secrets

| Secret | Where to get it |
|--------|----------------|
| `HF_TOKEN` | HuggingFace → Settings → Access Tokens (write access) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Edit Cloudflare Workers template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |
| `NPM_TOKEN` | npm → Access Tokens → Generate new (Automation type) |
| `VSCE_PAT` | Azure DevOps PAT with Marketplace Manage scope |

---

## 7. Environment Variables Reference

### Backend (HuggingFace Space secrets)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | JWT signing + Fernet encryption key — 64 hex chars |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon or service key |
| `BACKEND_URL` | Yes | `https://solvorlabs-docforge-api.hf.space` |
| `FRONTEND_URL` | Yes | `https://docforge.solvor.co.in` |
| `GOOGLE_CLIENT_ID` | OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | OAuth | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | OAuth | GitHub OAuth client secret |
| `DEV_MODE` | — | `false` in production (set as Variable, not Secret) |

> `GEMINI_API_KEY` and `GROQ_API_KEY` are **not** set at the server level. Users bring their own keys (BYOK).

### Web UI (Cloudflare Pages)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | `https://solvorlabs-docforge-api.hf.space` |

---

## 8. DNS Summary

| Type | Name | Content | Proxy | Purpose |
|------|------|---------|-------|---------|
| CNAME | `docforge` | `<project>.pages.dev` | Proxied | Frontend → Cloudflare Pages |

> The backend has no custom domain — HuggingFace requires a PRO subscription for custom domains. Use the direct HF URL everywhere. A Cloudflare CNAME pointing at HF does not work because Cloudflare's proxy rewrites the `Host` header, causing HF to return 404.

---

## 9. Troubleshooting

**HF build fails: "playwright install" exits with code 1**
`USER user` is appearing before `playwright install` in the Dockerfile — playwright needs root. Make sure all `RUN` commands for apt/pip/playwright happen before `USER user`. VSCode's hadolint linter may revert the file — write the Dockerfile via bash heredoc to bypass the linter.

**HF Space: "Executable doesn't exist" / Chromium not found at runtime**
`PLAYWRIGHT_BROWSERS_PATH` is not set, so the browser installed by root goes to `/root/.cache/...` but the app runs as `user` and looks in `/home/user/.cache/...`. Fix: set `ENV PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright` and `mkdir + chown` that directory before running `playwright install`.

**HF build fails: "Missing configuration in README"**
The `README.md` is missing the HF YAML frontmatter block. The frontmatter must be the very first thing in the file, starting with `---`.

**OAuth: "redirect_uri mismatch" or "malformed request"**
`BACKEND_URL` or `FRONTEND_URL` has a trailing newline character. Delete the secret in HF Space settings and retype it manually (do not paste). Then restart the Space — `GOOGLE_REDIRECT_URI` is built at startup from `BACKEND_URL`, so a restart is required after changing it.

**OAuth: "invalid_client" (401)**
`GOOGLE_CLIENT_ID` is wrong or has a trailing newline. Re-enter it from Google Cloud Console by typing, not pasting.

**Cloudflare Pages: 404 after successful build**
Build output directory is set to `.next` but Next.js static export puts files in `out/`. Change the build output directory setting to `out` in Cloudflare Pages → Settings → Builds & deployments.

**Cloudflare Pages: build file exceeds 25 MB limit**
Add `&& rm -rf .next/cache` to the build command. The `.next/cache` directory can be very large and is not needed for deployment.

**Generate page: "Gemini API key required" even after saving key**
The key was saved in the wrong format — e.g. `GEMINI_API_KEY=AIza...` instead of just `AIza...`. Go to Settings and re-save with only the bare key value.

**Generate page accessible without login**
The auth guard in `generate/page.tsx` redirects to `/auth/login` if no token, and to `/settings` if `user.has_gemini_key` is false. If this is not happening, the `useAuth()` context may not be hydrated yet — the guard fires at render time and needs the auth context to be initialized.
