"""
OAuth router — Google and GitHub sign-in / sign-up

GET /api/auth/oauth/google           → redirect to Google consent page
GET /api/auth/oauth/google/callback  → exchange code, create/find user, redirect to frontend
GET /api/auth/oauth/github           → redirect to GitHub consent page
GET /api/auth/oauth/github/callback  → exchange code, create/find user, redirect to frontend

After successful auth the user is sent to:
  FRONTEND_URL/auth/callback?token=<jwt>&email=<email>
On failure they land at:
  FRONTEND_URL/auth/login?error=<message>
"""

import os
import httpx
from urllib.parse import urlencode

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from backend.services import auth_service

router = APIRouter(prefix="/api/auth/oauth", tags=["oauth"])

FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL          = os.getenv("BACKEND_URL",  "http://localhost:8000")
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/oauth/google/callback"
GITHUB_REDIRECT_URI = f"{BACKEND_URL}/api/auth/oauth/github/callback"


def _error_redirect(msg: str) -> RedirectResponse:
    return RedirectResponse(f"{FRONTEND_URL}/auth/login?error={msg.replace(' ', '+')}")


# ── Google ────────────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login(source: str = "web", callback_port: str = ""):
    if not GOOGLE_CLIENT_ID:
        return _error_redirect("Google OAuth not configured")
    state = f"vscode_local:{callback_port}" if source == "vscode_local" and callback_port else source
    params = urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
    })
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/google/callback")
async def google_callback(code: str = "", error: str = "", state: str = "web"):
    if error or not code:
        return _error_redirect("Google sign-in cancelled")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if not token_res.is_success:
            return _error_redirect("Google token exchange failed")

        access_token = token_res.json().get("access_token")
        if not access_token:
            return _error_redirect("No access token from Google")

        info_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if not info_res.is_success:
            return _error_redirect("Could not fetch Google profile")

        email = info_res.json().get("email")

    if not email:
        return _error_redirect("No email in Google profile")

    user  = await auth_service.get_or_create_oauth_user(email)
    token = auth_service.create_access_token(user["id"], user["email"])
    if state.startswith("vscode_local:"):
        port = state.split(":", 1)[1]
        return RedirectResponse(f"http://localhost:{port}/?token={token}&email={email}")
    if state == "vscode":
        return RedirectResponse(
            f"vscode://docforge.docforge/callback?token={token}&email={email}"
        )
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/callback?token={token}&email={email}"
    )


# ── GitHub ────────────────────────────────────────────────────────────────────

@router.get("/github")
async def github_login(source: str = "web", callback_port: str = ""):
    if not GITHUB_CLIENT_ID:
        return _error_redirect("GitHub OAuth not configured")
    state = f"vscode_local:{callback_port}" if source == "vscode_local" and callback_port else source
    params = urlencode({
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "scope": "user:email",
        "state": state,
    })
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")


@router.get("/github/callback")
async def github_callback(code: str = "", error: str = "", state: str = "web"):
    if error or not code:
        return _error_redirect("GitHub sign-in cancelled")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
        )
        if not token_res.is_success:
            return _error_redirect("GitHub token exchange failed")

        gh_token = token_res.json().get("access_token")
        if not gh_token:
            return _error_redirect("No access token from GitHub")

        # Prefer verified primary email from /user/emails
        emails_res = await client.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {gh_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        email = None
        if emails_res.is_success:
            for entry in emails_res.json():
                if entry.get("primary") and entry.get("verified"):
                    email = entry["email"]
                    break

        # Fallback to public profile email
        if not email:
            user_res = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {gh_token}"},
            )
            if user_res.is_success:
                email = user_res.json().get("email")

    if not email:
        return _error_redirect("No verified email on GitHub account")

    user  = await auth_service.get_or_create_oauth_user(email)
    token = auth_service.create_access_token(user["id"], user["email"])
    if state.startswith("vscode_local:"):
        port = state.split(":", 1)[1]
        return RedirectResponse(f"http://localhost:{port}/?token={token}&email={email}")
    if state == "vscode":
        return RedirectResponse(
            f"vscode://docforge.docforge/callback?token={token}&email={email}"
        )
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/callback?token={token}&email={email}"
    )
