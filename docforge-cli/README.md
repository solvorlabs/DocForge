# DocForge CLI (`dcf`)

Generate prompt-ready context files for any library — pinned to your exact version.

## Install

```bash
npm install -g @docforge-cli/cli
```

Works on Linux (x64, arm64), macOS (Intel, Apple Silicon), and Windows (x64). The correct native binary is selected automatically.

## Usage

```bash
# Generate a context file for a specific package
dcf generate react@18.2.0

# Generate for the latest version
dcf generate fastapi

# Detect packages from package.json and generate context files
dcf detect

# Log in (required for generation)
dcf auth login

# Log out
dcf auth logout
```

## What it does

DocForge fetches documentation for the exact library version you specify and generates a `.context.md` file — a structured, AI-ready reference covering:

- Install commands
- Core imports
- Key props and types
- Usage examples
- Version-specific gotchas

Drop the `.context.md` into your project and reference it in Cursor, GitHub Copilot, Claude, or any AI assistant.

## Backend

The CLI connects to the DocForge backend at `https://solvorlabs-docforge-api.hf.space` by default. You can point it at a local backend:

```bash
DCF_BACKEND=http://localhost:8000 dcf generate react@18
```

## Auth

```bash
dcf auth login    # opens browser OAuth flow, saves token to ~/.config/docforge/config.toml
dcf auth logout
```

## Links

- [GitHub](https://github.com/solvorlabs/DocForge)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=solvorlabs.docforge)
- [Issues](https://github.com/solvorlabs/DocForge/issues)

## License

MIT
