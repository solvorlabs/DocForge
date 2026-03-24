# DocForge MCP Server

Expose DocForge as an MCP tool so AI coding assistants can autonomously fetch version-accurate library documentation mid-conversation.

**Without MCP:** Developer manually triggers extension → gets file → drags into AI context.

**With MCP:** AI detects it needs docs → calls `get_context` directly → accurate API → correct code on first try.

## Tools

| Tool | Description |
|------|-------------|
| `get_context` | Fetch version-accurate docs for any npm/PyPI library |
| `search_library` | Search the DocForge cache for matching libraries |
| `list_versions` | List all cached versions of a package |

## Setup

### 1. Install dependencies

```bash
cd docforge-mcp
pip install -r requirements.txt
```

### 2. Configure your AI tool

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/absolute/path/to/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "https://api.docforge.dev"
      }
    }
  }
}
```

For local backend development:
```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/absolute/path/to/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

#### Cursor

Create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/absolute/path/to/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "https://api.docforge.dev"
      }
    }
  }
}
```

#### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/absolute/path/to/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "https://api.docforge.dev"
      }
    }
  }
}
```

#### Using `uv` or `uvx` (recommended for isolation)

```json
{
  "mcpServers": {
    "docforge": {
      "command": "uvx",
      "args": ["--from", "/absolute/path/to/docforge-mcp", "python", "server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "https://api.docforge.dev"
      }
    }
  }
}
```

## Example Usage in Claude

Once configured, Claude will automatically use DocForge when you ask it to work with libraries:

> "Add the AnimatedList component from react-bits@2.1.4 to my Next.js app"

Claude will call `get_context("react-bits@2.1.4")` and get:
- The exact `npx jsrepo add ...` install command (not `npm install`)
- The correct import path
- The `'use client'` gotcha for Next.js App Router
- The `framer-motion` peer dependency requirement

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCFORGE_BACKEND_URL` | `https://api.docforge.dev` | DocForge backend URL |

## Testing

```bash
# Test the server directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | python server.py

# Or use the MCP inspector
npx @modelcontextprotocol/inspector python server.py
```