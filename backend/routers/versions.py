"""GET /api/versions/{package} — list cached versions for a package."""

from fastapi import APIRouter

from ..models.schemas import VersionsResponse
from ..services.cache import list_cached_versions

router = APIRouter(prefix="/api/versions", tags=["versions"])


@router.get("/{package:path}", response_model=VersionsResponse)
async def get_versions(package: str) -> VersionsResponse:
    """List all cached versions of a package in the DocForge cache."""
    versions = await list_cached_versions(package)
    return VersionsResponse(package=package, versions=versions)