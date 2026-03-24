"""
get_context MCP tool — the primary DocForge tool.

Fetches version-accurate documentation context for any library across all
major package registries. The AI should call this whenever it needs current
API details for a library rather than relying on potentially outdated training data.
"""

from client import fetch_context


async def handle(package: str, input_type: str = "npm") -> str:
    """
    Fetch version-accurate docs context for a library.

    Args:
        package:    Package identifier with optional version. Examples:
                      npm        →  'react@18'  '@tanstack/react-query@5'
                      pypi       →  'fastapi==0.115'
                      crates.io  →  'crates:serde@1.0'
                      RubyGems   →  'gem:rails@7.1'
                      pub.dev    →  'pub:flutter_bloc@8'
                      NuGet      →  'nuget:Newtonsoft.Json@13'
                      Maven      →  'mvn:com.google.guava:guava@32'
                      Hex        →  'hex:phoenix@1.7'
                      CRAN       →  'cran:ggplot2'
                      GitHub     →  'github.com/vercel/next.js'
                      URL        →  'https://docs.stripe.com'

        input_type: Registry hint — auto-detected from package format if omitted.
                    One of: 'npm' | 'pypi' | 'crates' | 'rubygems' | 'pubdev' |
                            'nuget' | 'maven' | 'hex' | 'cran' | 'github' | 'url'

    Returns:
        Structured .context.md string with install commands, import paths,
        props/types, usage examples, and common AI codegen gotchas.
    """
    return await fetch_context(package, input_type)