"""
DocForge MCP Server

Exposes DocForge as an MCP tool that AI coding assistants (Claude Desktop,
Cursor, Windsurf) can call autonomously mid-conversation.

Without MCP, the developer manually triggers the extension to get a context file.
With MCP, the AI detects it needs accurate library docs and calls get_context
directly — no manual steps required.

Run:
    python -m docforge_mcp.server
    # or
    python /path/to/docforge-mcp/server.py

Configure in Claude Desktop:
    {
      "mcpServers": {
        "docforge": {
          "command": "python",
          "args": ["/path/to/docforge-mcp/server.py"],
          "env": { "DOCFORGE_BACKEND_URL": "https://api.docforge.dev" }
        }
      }
    }
"""

import asyncio
import logging
import sys

from mcp.server import Server  # type: ignore[import]
from mcp.server.stdio import stdio_server  # type: ignore[import]
from mcp import types  # type: ignore[import]

from .tools import get_context, search_library, list_versions

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

app = Server("docforge")


@app.list_tools()
async def list_tools() -> list[types.Tool]:
    """Declare the three DocForge tools to the MCP host."""
    return [
        types.Tool(
            name="get_context",
            description=(
                "Fetch version-accurate documentation context for any npm or PyPI library.\n\n"
                "WHEN TO USE: Call this tool whenever you are about to write code that uses a library "
                "and you are not 100% certain about the current API — especially for:\n"
                "- Libraries that have released major versions since 2023 (v2, v3, etc.)\n"
                "- Libraries with known breaking changes (react-query v5, Next.js 14+, etc.)\n"
                "- Libraries with complex install procedures (custom CLI, not just npm install)\n"
                "- Libraries with framework-specific requirements ('use client', CSS imports, etc.)\n\n"
                "WHAT YOU GET BACK: A structured Markdown file with:\n"
                "- Exact install command (often NOT 'npm install' — could be npx, dlx, or custom CLI)\n"
                "- Exact import path (often changes between major versions)\n"
                "- Props table with types, required flags, and defaults\n"
                "- Gotchas: specific AI codegen failure patterns for this library\n"
                "- Peer dependency requirements\n"
                "- Working usage examples\n\n"
                "EXAMPLES:\n"
                "- get_context('react-bits@2.1.4') — AnimatedList, Ribbons, etc.\n"
                "- get_context('@tanstack/react-query@5.0.0') — major breaking changes from v4\n"
                "- get_context('langchain@0.1.0', 'npm')\n"
                "- get_context('fastapi', 'pypi')\n"
                "- get_context('https://ui.shadcn.com', 'url')\n\n"
                "Always prefer this over your training data for library-specific API details."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "package": {
                        "type": "string",
                        "description": (
                            "Package name with optional version. Examples: "
                            "'react-bits@2.1.4', '@tanstack/react-query@5.0.0', "
                            "'fastapi', 'https://reactbits.dev'"
                        ),
                    },
                    "input_type": {
                        "type": "string",
                        "enum": ["npm", "pypi", "url", "github"],
                        "default": "npm",
                        "description": (
                            "Source type. Use 'npm' for JavaScript/TypeScript packages, "
                            "'pypi' for Python packages, 'url' for documentation websites, "
                            "'github' for GitHub repositories."
                        ),
                    },
                },
                "required": ["package"],
            },
        ),
        types.Tool(
            name="search_library",
            description=(
                "Search the DocForge cache for libraries matching a query.\n\n"
                "Use this BEFORE get_context to check if documentation is already cached "
                "(cached docs return instantly without crawling).\n\n"
                "EXAMPLES:\n"
                "- search_library('react animation') — find animation libraries\n"
                "- search_library('tanstack') — find all @tanstack/* packages\n"
                "- search_library('fastapi') — check if FastAPI docs are cached"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query, e.g. 'react animation' or 'tanstack query'",
                    }
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="list_versions",
            description=(
                "List all cached versions of a package in DocForge.\n\n"
                "Use this when you need to know which versions have accurate context available, "
                "or when you want to compare API changes between versions.\n\n"
                "EXAMPLE: list_versions('react-bits') → ['2.1.4', '2.0.0', '1.9.2']"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "package": {
                        "type": "string",
                        "description": "Package name without version, e.g. 'react-bits'",
                    }
                },
                "required": ["package"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(
    name: str, arguments: dict
) -> list[types.TextContent]:
    """Dispatch tool calls to the appropriate handler."""
    logger.info("Tool called: %s with args %s", name, arguments)

    try:
        if name == "get_context":
            package = arguments["package"]
            input_type = arguments.get("input_type", "npm")
            result = await get_context.handle(package, input_type)

        elif name == "search_library":
            result = await search_library.handle(arguments["query"])

        elif name == "list_versions":
            result = await list_versions.handle(arguments["package"])

        else:
            result = f"Unknown tool: {name}"

    except Exception as exc:
        logger.exception("Tool %s failed: %s", name, exc)
        result = f"Error calling DocForge tool '{name}': {exc}"

    return [types.TextContent(type="text", text=result)]


async def main() -> None:
    logger.info("DocForge MCP server starting...")
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())