/**
 * docforge.updateContext — re-fetch context for an existing .context.md.
 *
 * Reads the existing .context.md to extract the library/version header,
 * then re-runs the pipeline to get fresh documentation.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { runGeneration } from "./generateContext";
import { runInputFlow } from "../ui/inputFlow";

export async function updateContext(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "DF: No workspace open."
    );
    return;
  }

  const config = vscode.workspace.getConfiguration("docforge");
  const outputPath = config.get<string>("outputPath", ".context.md");
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const fullPath = path.join(workspaceRoot, outputPath);

  // Try to extract the library@version from the existing file's header line
  let existingPackage: string | undefined;
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    // Header format: "# react-bits@2.1.4 — DocForge Context File"
    const match = content.match(/^# ([^\s]+) —/m);
    if (match) {
      existingPackage = match[1];
    }
  }

  if (existingPackage) {
    const action = await vscode.window.showInformationMessage(
      `DF: Update context for ${existingPackage}?`,
      "Update",
      "Choose Different Package"
    );

    if (!action) return;

    if (action === "Update") {
      await runGeneration({
        input: existingPackage,
        input_type: "npm",
        output_format: "context_md",
      });
      return;
    }
  }

  // Fall back to manual input flow
  const request = await runInputFlow();
  if (request) {
    await runGeneration(request);
  }
}