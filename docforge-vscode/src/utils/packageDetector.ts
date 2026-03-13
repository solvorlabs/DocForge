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

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const pkgJsonPath = path.join(workspaceRoot, "package.json");

  if (!fs.existsSync(pkgJsonPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(pkgJsonPath, "utf-8");
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const packages: DetectedPackage[] = [];

    for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
      packages.push({
        name,
        version: cleanVersion(version),
        devDependency: false,
      });
    }

    for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
      packages.push({
        name,
        version: cleanVersion(version),
        devDependency: true,
      });
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