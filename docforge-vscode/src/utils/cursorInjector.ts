/**
 * Cursor auto-inject utility for DocForge.
 *
 * After generating a .context.md file, this writes it to .cursor/rules/
 * so Cursor picks it up automatically without manual @file referencing.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Injects the generated context into .cursor/rules/{library}.mdc
 * Only runs if .cursor/ directory exists (i.e. the project uses Cursor).
 */
export async function injectIntoCursor(
  workspaceRoot: string,
  library: string,
  content: string
): Promise<boolean> {
  const cursorDir = path.join(workspaceRoot, ".cursor");
  if (!fs.existsSync(cursorDir)) {
    return false; // Not a Cursor project — skip silently
  }

  const rulesDir = path.join(cursorDir, "rules");
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }

  // Sanitize library name for use as filename
  const safeName = library.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const mdcPath = path.join(rulesDir, `docforge-${safeName}.mdc`);

  const frontmatter = `---
description: DocForge context for ${library} — version-pinned API documentation
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---

`;

  fs.writeFileSync(mdcPath, frontmatter + content, "utf8");
  return true;
}
