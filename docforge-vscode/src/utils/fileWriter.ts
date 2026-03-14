/**
 * File writer utility for DocForge.
 *
 * Writes the generated .context.md to the workspace root,
 * optionally showing a diff if the file already exists.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { injectIntoCursor } from "./cursorInjector";

/**
 * Write context content to the configured output path in the workspace.
 *
 * @returns The URI of the written file, or undefined if no workspace is open.
 */
export async function writeContextFile(
  content: string,
  library?: string
): Promise<vscode.Uri | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "DocForge: No workspace folder is open. Please open a project first."
    );
    return undefined;
  }

  const config = vscode.workspace.getConfiguration("docforge");
  const outputPath = config.get<string>("outputPath", ".context.md");
  const autoOpen = config.get<boolean>("autoOpenFile", true);

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const fullPath = path.join(workspaceRoot, outputPath);
  const fileUri = vscode.Uri.file(fullPath);

  const alreadyExists = fs.existsSync(fullPath);

  // Write the file
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));

  // Auto-inject into Cursor if the project has .cursor/ and setting is enabled
  const autoInjectCursor = config.get<boolean>("autoInjectCursor", true);
  if (autoInjectCursor && library) {
    await injectIntoCursor(workspaceRoot, library, content);
  }

  // Show success notification with actions
  const message = alreadyExists
    ? `DocForge: Updated ${outputPath}`
    : `DocForge: Created ${outputPath}`;

  const action = await vscode.window.showInformationMessage(
    message,
    "Open File",
    "Show Diff"
  );

  if (action === "Open File" || (action === undefined && autoOpen)) {
    await vscode.window.showTextDocument(fileUri);
  } else if (action === "Show Diff" && alreadyExists) {
    // Show diff between old and new content
    // We already overwrote, so this shows the current file vs a blank title
    await vscode.commands.executeCommand(
      "vscode.diff",
      vscode.Uri.parse("untitled:Previous"),
      fileUri,
      `DocForge: ${outputPath} (updated)`
    );
  }

  return fileUri;
}