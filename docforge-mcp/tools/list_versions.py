"""
list_versions MCP tool.

List all cached versions of a package to decide which version's context to fetch.
Useful when you need version-specific API differences.
"""

from ..client import list_versions


async def handle(package: str) -> str:
    """
    List all cached versions of a package in DocForge.

    Args:
        package: Package name, e.g. 'react-bits'

    Returns:
        List of available cached versions, newest first.
    """
    versions = await list_versions(package)

    if not versions:
        return (
            f"No cached versions found for '{package}'.\n"
            "Use get_context('{package}@<version>') to fetch and cache a specific version."
        )

    lines = [f"Cached versions for '{package}':\n"]
    for v in versions:
        lines.append(f"- {package}@{v}")
    lines.append(f"\nUse get_context('{package}@<version>') to retrieve context for a specific version.")
    return "\n".join(lines)