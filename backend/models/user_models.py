from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Request / Response models ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    gemini_key: Optional[str] = None
    groq_key: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class UpdateKeysRequest(BaseModel):
    gemini_key: Optional[str] = None
    groq_key: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


class UserProfile(BaseModel):
    user_id: str
    email: str
    has_gemini_key: bool
    has_groq_key: bool


# ── Device flow models (for CLI / extension auth) ─────────────────────────────

class DeviceInitResponse(BaseModel):
    device_code: str          # opaque, sent by CLI to poll
    user_code: str            # human-readable code shown in terminal
    verification_uri: str     # URL user opens in browser
    expires_in: int = 900     # seconds
    interval: int = 5         # polling interval seconds


class DeviceVerifyRequest(BaseModel):
    user_code: str            # code the user types on the website


class DevicePollResponse(BaseModel):
    status: str               # "pending" | "complete" | "expired"
    access_token: Optional[str] = None
    email: Optional[str] = None
