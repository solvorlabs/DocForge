"""POST /api/corrections — submit a correction for a library's extracted docs."""

import os
import uuid
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/corrections", tags=["corrections"])

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# In-memory store for DEV_MODE
_corrections: dict[str, dict] = {}


class CorrectionRequest(BaseModel):
    library: str
    version: str
    component_name: str
    field: str  # "gotcha" | "prop" | "usage_example" | "import_path"
    correction: str
    reporter_email: Optional[str] = None


class CorrectionResponse(BaseModel):
    correction_id: str
    status: str


@router.post("", response_model=CorrectionResponse)
async def submit_correction(req: CorrectionRequest) -> CorrectionResponse:
    """Submit a correction for a library's extracted documentation."""
    correction_id = str(uuid.uuid4())

    if DEV_MODE or not (SUPABASE_URL and SUPABASE_KEY):
        _corrections[correction_id] = {
            "id": correction_id,
            "library": req.library,
            "version": req.version,
            "component_name": req.component_name,
            "field": req.field,
            "correction": req.correction,
            "reporter_email": req.reporter_email,
            "status": "pending",
        }
    else:
        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/corrections",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json={
                    "id": correction_id,
                    "library": req.library,
                    "version": req.version,
                    "component_name": req.component_name,
                    "field": req.field,
                    "correction": req.correction,
                    "reporter_email": req.reporter_email,
                    "status": "pending",
                },
            )

    return CorrectionResponse(correction_id=correction_id, status="pending")


@router.get("/{library}")
async def get_corrections(library: str, version: Optional[str] = None) -> dict:
    """Get approved corrections for a library."""
    if DEV_MODE or not (SUPABASE_URL and SUPABASE_KEY):
        results = [
            c for c in _corrections.values()
            if c["library"] == library and c["status"] == "approved"
            and (version is None or c["version"] == version)
        ]
        return {"corrections": results}

    import httpx
    params = f"library=eq.{library}&status=eq.approved"
    if version:
        params += f"&version=eq.{version}"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/corrections?{params}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        )
    return {"corrections": resp.json() if resp.status_code == 200 else []}
