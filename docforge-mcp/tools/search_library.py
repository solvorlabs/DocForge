"""
search_library MCP tool.

Check the DocForge cache before fetching fresh docs — if context is already
cached, get_context will return it instantly without crawling.
"""

from ..client import search_libraries


async def handle(query: str) -> str:
    """
    Search DocForge cache for available libraries matching a query.

    Args:
        query: Search term, e.g. 'react animation' or 'tanstack'

    Returns:
        List of cached libraries matching the query, or a 'not found' message.
    """
    results = await search_libraries(query)

    if not results:
        return (
            f"No cached libraries found matching '{query}'.\n"
            "Use get_context() to fetch and cache documentation for a specific package."
        )

    lines = [f"Cached libraries matching '{query}':\n"]
    for lib in results:
        lines.append(
            f"- {lib['name']}@{lib['version']} (cached {lib.get('cached_at', 'unknown')})"
        )
    lines.append("\nUse get_context(package) to retrieve the full context for any of these.")
    return "\n".join(lines)