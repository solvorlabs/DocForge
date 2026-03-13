"""
get_context MCP tool — the primary DocForge tool.

Fetches version-accurate documentation context for any npm/PyPI library.
The AI should call this whenever it needs current API details for a library
rather than relying on potentially outdated training data.
"""

from ..client import fetch_context


async def handle(package: str, input_type: str = "npm") -> str:
    """
    Fetch version-accurate docs context for a library.

    Args:
        package: Package name with optional version, e.g. 'react-bits@2.1.4'
        input_type: One of 'npm', 'pypi', 'url', 'github'

    Returns:
        Structured .context.md string with install commands, import paths,
        props, and common AI codegen gotchas.
    """
    return await fetch_context(package, input_type)