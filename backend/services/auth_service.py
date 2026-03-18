"""
Auth service: JWT creation/validation, password hashing, device-flow management,
and encrypted API key storage.

Storage strategy mirrors cache.py:
  - Supabase when SUPABASE_URL + SUPABASE_KEY are set  (production)
  - In-memory dict otherwise                            (dev / CI)

Tables required in Supabase:
  users        (id uuid PK, email text UNIQUE, password_hash text, created_at timestamptz)
  user_api_keys(user_id uuid FK->users.id, gemini_key_enc text, groq_key_enc text)
  device_codes (code text PK, user_code text UNIQUE, user_id uuid nullable,
                expires_at timestamptz, verified bool default false)
"""

import os
import uuid
import string
import random
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import base64

# ── Config ─────────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_" + "x" * 32)
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 30   # 30 days

# Key for encrypting stored API keys (Fernet requires 32-byte URL-safe base64)
_raw_enc_key = os.getenv("ENCRYPTION_KEY", "")
if _raw_enc_key:
    FERNET_KEY = _raw_enc_key.encode()
else:
    # Derive a stable key from SECRET_KEY so dev works without .env
    import hashlib
    _derived = hashlib.sha256(SECRET_KEY.encode()).digest()
    FERNET_KEY = base64.urlsafe_b64encode(_derived)

_fernet = Fernet(FERNET_KEY)
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Supabase helpers ──────────────────────────────────────────────────────────

def _get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if url and key:
        from supabase import create_client
        return create_client(url, key)
    return None

# ── In-memory fallback ────────────────────────────────────────────────────────
# { email → { id, email, password_hash } }
_mem_users: dict = {}
# { user_id → { gemini_key_enc, groq_key_enc } }
_mem_keys: dict = {}
# { device_code → { user_code, user_id, expires_at, verified } }
_mem_devices: dict = {}

# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return _pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_ctx.verify(plain, hashed)

# ── Encryption helpers ────────────────────────────────────────────────────────

def encrypt_key(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()

def decrypt_key(enc: str) -> str:
    return _fernet.decrypt(enc.encode()).decode()

# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# ── User CRUD ─────────────────────────────────────────────────────────────────

async def create_user(email: str, password_hash: str) -> Optional[str]:
    """Create a user, return their UUID. Returns None if email exists."""
    sb = _get_supabase()
    if sb:
        existing = sb.table("users").select("id").eq("email", email).execute()
        if existing.data:
            return None
        uid = str(uuid.uuid4())
        sb.table("users").insert({"id": uid, "email": email, "password_hash": password_hash}).execute()
        return uid
    else:
        if email in _mem_users:
            return None
        uid = str(uuid.uuid4())
        _mem_users[email] = {"id": uid, "email": email, "password_hash": password_hash}
        return uid

async def get_user_by_email(email: str) -> Optional[dict]:
    sb = _get_supabase()
    if sb:
        res = sb.table("users").select("id, email, password_hash").eq("email", email).execute()
        return res.data[0] if res.data else None
    return _mem_users.get(email)

async def get_or_create_oauth_user(email: str) -> dict:
    """Find user by email or create one without a password (OAuth users)."""
    existing = await get_user_by_email(email)
    if existing:
        return existing
    uid = str(uuid.uuid4())
    sb = _get_supabase()
    if sb:
        sb.table("users").insert({"id": uid, "email": email, "password_hash": ""}).execute()
    else:
        _mem_users[email] = {"id": uid, "email": email, "password_hash": ""}
    return {"id": uid, "email": email}


async def get_user_by_id(user_id: str) -> Optional[dict]:
    sb = _get_supabase()
    if sb:
        res = sb.table("users").select("id, email").eq("id", user_id).execute()
        return res.data[0] if res.data else None
    for u in _mem_users.values():
        if u["id"] == user_id:
            return u
    return None

# ── API Key CRUD ──────────────────────────────────────────────────────────────

async def save_api_keys(user_id: str, gemini_key: Optional[str], groq_key: Optional[str]):
    sb = _get_supabase()
    row: dict = {"user_id": user_id}
    if gemini_key is not None:
        row["gemini_key_enc"] = encrypt_key(gemini_key)
    if groq_key is not None:
        row["groq_key_enc"] = encrypt_key(groq_key)

    if sb:
        existing = sb.table("user_api_keys").select("user_id").eq("user_id", user_id).execute()
        if existing.data:
            sb.table("user_api_keys").update(row).eq("user_id", user_id).execute()
        else:
            sb.table("user_api_keys").insert(row).execute()
    else:
        if user_id not in _mem_keys:
            _mem_keys[user_id] = {}
        _mem_keys[user_id].update(row)

async def get_api_keys(user_id: str) -> dict:
    """Returns { gemini_key: str|None, groq_key: str|None }"""
    sb = _get_supabase()
    if sb:
        res = sb.table("user_api_keys").select("gemini_key_enc, groq_key_enc").eq("user_id", user_id).execute()
        row = res.data[0] if res.data else {}
    else:
        row = _mem_keys.get(user_id, {})

    def _dec(enc):
        try:
            return decrypt_key(enc) if enc else None
        except Exception:
            return None

    return {
        "gemini_key": _dec(row.get("gemini_key_enc")),
        "groq_key":   _dec(row.get("groq_key_enc")),
    }

# ── Device flow ───────────────────────────────────────────────────────────────

def _random_code(length=8, chars=string.ascii_uppercase + string.digits) -> str:
    return "".join(random.choices(chars, k=length))

def _user_code_format(code: str) -> str:
    return f"{code[:4]}-{code[4:]}"

async def create_device_code() -> dict:
    device_code = str(uuid.uuid4())
    raw = _random_code(8)
    user_code = _user_code_format(raw)
    expires_at = time.time() + 900  # 15 min

    sb = _get_supabase()
    if sb:
        sb.table("device_codes").insert({
            "code": device_code,
            "user_code": user_code,
            "user_id": None,
            "expires_at": datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat(),
            "verified": False,
        }).execute()
    else:
        _mem_devices[device_code] = {
            "code": device_code,
            "user_code": user_code,
            "user_id": None,
            "expires_at": expires_at,
            "verified": False,
        }

    return {"device_code": device_code, "user_code": user_code}

async def verify_device_code(user_code: str, user_id: str) -> bool:
    """Called from the web UI when user confirms the code. Returns True on success."""
    sb = _get_supabase()
    if sb:
        res = sb.table("device_codes").select("code, expires_at, verified") \
                .eq("user_code", user_code).execute()
        if not res.data:
            return False
        row = res.data[0]
        exp = datetime.fromisoformat(row["expires_at"]).timestamp()
        if row["verified"] or time.time() > exp:
            return False
        sb.table("device_codes").update({"user_id": user_id, "verified": True}) \
          .eq("user_code", user_code).execute()
        return True
    else:
        for entry in _mem_devices.values():
            if entry["user_code"] == user_code:
                if entry["verified"] or time.time() > entry["expires_at"]:
                    return False
                entry["user_id"] = user_id
                entry["verified"] = True
                return True
        return False

async def poll_device_code(device_code: str) -> dict:
    """Called by CLI to poll status. Returns status + token when verified."""
    sb = _get_supabase()
    if sb:
        res = sb.table("device_codes").select("user_id, expires_at, verified") \
                .eq("code", device_code).execute()
        if not res.data:
            return {"status": "expired"}
        row = res.data[0]
        exp = datetime.fromisoformat(row["expires_at"]).timestamp()
        if time.time() > exp:
            return {"status": "expired"}
        if not row["verified"] or not row["user_id"]:
            return {"status": "pending"}
        user = await get_user_by_id(row["user_id"])
    else:
        entry = _mem_devices.get(device_code)
        if not entry or time.time() > entry["expires_at"]:
            return {"status": "expired"}
        if not entry["verified"] or not entry["user_id"]:
            return {"status": "pending"}
        user = await get_user_by_id(entry["user_id"])

    if not user:
        return {"status": "expired"}

    token = create_access_token(user["id"], user["email"])
    return {"status": "complete", "access_token": token, "email": user["email"]}
