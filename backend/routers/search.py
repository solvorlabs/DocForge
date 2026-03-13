"""GET /api/search?q={query} — search cached libraries."""

from fastapi import APIRouter, Query

from ..models.schemas import SearchResponse, SearchResult
from ..services.cache import search_cached_libraries

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def search_libraries(q: str = Query(..., description="Search query")) -> SearchResponse:
    """Search the DocForge cache for libraries matching a query string."""
    raw_results = await search_cached_libraries(q)
    results = [SearchResult(**r) for r in raw_results]
    return SearchResponse(results=results)