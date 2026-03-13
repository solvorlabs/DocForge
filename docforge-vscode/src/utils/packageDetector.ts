/**
 * Auto-detect npm packages from the workspace's package.json.
 *
 * Used by the "Detect from package.json" command to present a QuickPick
 * of all installed packages for batch context generation.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export interface DetectedPackage {
  name: string;
  version: string;
  devDependency: boolean;
}

/**
 * Find and parse the nearest package.json in the workspace.
 * Returns an array of detected packages for the user to select from.
 */
export async function detectPackagesFromWorkspace(): Promise<
  DetectedPackage[]
> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return [];
  }

  const pkgJsonPath = await _findPackageJson(workspaceFolders[0].uri.fsPath);
  if (!pkgJsonPath) {
    return [];
  }

  return _parsePackageJson(pkgJsonPath);
}

/**
 * Find the most relevant package.json:
 * 1. Workspace root (single-package repo)
 * 2. If none at root, ask the user to pick from immediate subdirectories (monorepo)
 */
async function _findPackageJson(root: string): Promise<string | undefined> {
  const rootPkg = path.join(root, "package.json");
  if (fs.existsSync(rootPkg)) {
    return rootPkg;
  }

  // Scan immediate subdirectories for package.json files
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return undefined;
  }

  const candidates = entries
    .filter((e) => e.isDirectory() && e.name !== "node_modules" && !e.name.startsWith("."))
    .map((e) => path.join(root, e.name, "package.json"))
    .filter((p) => fs.existsSync(p));

  if (candidates.length === 0) {
    return undefined;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  // Multiple package.json files found — let the user pick
  const items = candidates.map((p) => ({
    label: path.relative(root, path.dirname(p)),
    detail: p,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: "DocForge: Multiple package.json files found — pick one",
    placeHolder: "Select which package to read dependencies from",
  });

  return selected?.detail;
}

function _parsePackageJson(pkgJsonPath: string): DetectedPackage[] {
  try {
    const raw = fs.readFileSync(pkgJsonPath, "utf-8");
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const packages: DetectedPackage[] = [];

    for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
      packages.push({ name, version: cleanVersion(version), devDependency: false });
    }

    for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
      packages.push({ name, version: cleanVersion(version), devDependency: true });
    }

    return packages.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/**
 * Show a QuickPick for the user to select packages from package.json.
 * Returns the selected packages as ContextRequest-ready strings (name@version).
 */
export async function pickPackagesFromWorkspace(): Promise<string[]> {
  const packages = await detectPackagesFromWorkspace();

  if (packages.length === 0) {
    vscode.window.showWarningMessage(
      "DocForge: No package.json found in workspace, or it has no dependencies."
    );
    return [];
  }

  const items = packages.map((pkg) => ({
    label: `$(package) ${pkg.name}`,
    description: `v${pkg.version}${pkg.devDependency ? " (dev)" : ""}`,
    detail: `${pkg.name}@${pkg.version}`,
    picked: false,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: "DocForge: Select packages to generate context for",
    placeHolder: "Search packages... (Space to select multiple)",
    canPickMany: true,
    matchOnDescription: true,
  });

  if (!selected || selected.length === 0) {
    return [];
  }

  return selected.map((item) => item.detail);
}

/** Strip semver range prefixes like ^, ~, >=, etc. */
function cleanVersion(version: string): string {
  return version.replace(/^[^0-9]*/, "") || "latest";
}