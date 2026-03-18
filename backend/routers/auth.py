"""
Auth router — all endpoints under /api/auth

Public:
  POST /api/auth/register         create account (+ optional API keys)
  POST /api/auth/login            email + password → JWT
  POST /api/auth/device/init      CLI / extension requests a device code
  GET  /api/auth/device/poll      CLI polls until user verifies on web
  POST /api/auth/device/verify    web UI posts user_code to mark verified

Protected (requires Bearer token):
  GET  /api/auth/me               current user profile
  PUT  /api/auth/keys             save / update API keys
  POST /api/auth/logout           (client-side: just discard the token)
"""

import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.models.user_models import (
    RegisterRequest, LoginRequest, UpdateKeysRequest,
    AuthResponse, UserProfile,
    DeviceInitResponse, DeviceVerifyRequest, DevicePollResponse,
)
from backend.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])
_bearer = HTTPBearer(auto_error=False)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ── Auth dependency ───────────────────────────────────────────────────────────

async def current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = auth_service.decode_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await auth_service.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── Public endpoints ──────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    hashed = auth_service.hash_password(body.password)
    user_id = await auth_service.create_user(body.email, hashed)
    if not user_id:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Optionally save API keys during registration
    if body.gemini_key or body.groq_key:
        await auth_service.save_api_keys(user_id, body.gemini_key, body.groq_key)

    token = auth_service.create_access_token(user_id, body.email)
    return AuthResponse(access_token=token, user_id=user_id, email=body.email)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = await auth_service.get_user_by_email(body.email)
    if not user or not auth_service.verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth_service.create_access_token(user["id"], user["email"])
    return AuthResponse(access_token=token, user_id=user["id"], email=user["email"])


# ── Device flow ───────────────────────────────────────────────────────────────

@router.post("/device/init", response_model=DeviceInitResponse)
async def device_init():
    """CLI / extension calls this to get a device code."""
    result = await auth_service.create_device_code()
    return DeviceInitResponse(
        device_code=result["device_code"],
        user_code=result["user_code"],
        verification_uri=f"{FRONTEND_URL}/auth/device",
    )


@router.get("/device/poll", response_model=DevicePollResponse)
async def device_poll(device_code: str):
    """CLI polls this every 5 s until status == 'complete'."""
    result = await auth_service.poll_device_code(device_code)
    return DevicePollResponse(**result)


@router.post("/device/verify")
async def device_verify(
    body: DeviceVerifyRequest,
    user: dict = Depends(current_user),
):
    """Web UI posts this after the logged-in user enters their user_code."""
    ok = await auth_service.verify_device_code(body.user_code, user["id"])
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return {"ok": True}


# ── Protected endpoints ───────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfile)
async def me(user: dict = Depends(current_user)):
    keys = await auth_service.get_api_keys(user["id"])
    return UserProfile(
        user_id=user["id"],
        email=user["email"],
        has_gemini_key=bool(keys.get("gemini_key")),
        has_groq_key=bool(keys.get("groq_key")),
    )


@router.put("/keys")
async def update_keys(
    body: UpdateKeysRequest,
    user: dict = Depends(current_user),
):
    if not body.gemini_key and not body.groq_key:
        raise HTTPException(status_code=400, detail="Provide at least one key")
    await auth_service.save_api_keys(user["id"], body.gemini_key, body.groq_key)
    return {"ok": True, "message": "API keys saved"}
