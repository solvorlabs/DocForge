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

export interface WriteOptions {
  /** When true, appends to the file instead of overwriting. Default: false */
  append?: boolean;
  /** File extension override e.g. ".json". Defaults to configured outputPath. */
  extension?: string;
  /** Library name for Cursor injection */
  library?: string;
}

/**
 * Write (or append) context content to the configured output path in the workspace.
 *
 * @returns The URI of the written file, or undefined if no workspace is open.
 */
export async function writeContextFile(
  content: string,
  options: WriteOptions = {}
): Promise<vscode.Uri | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "DF: No workspace folder is open. Please open a project first."
    );
    return undefined;
  }

  const config = vscode.workspace.getConfiguration("docforge");
  let outputPath = config.get<string>("outputPath", ".context.md");
  const autoOpen = config.get<boolean>("autoOpenFile", true);

  // Override extension if requested (e.g. ".json")
  if (options.extension) {
    const base = outputPath.replace(/\.[^.]+$/, "");
    outputPath = `${base}${options.extension}`;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const fullPath = path.join(workspaceRoot, outputPath);
  const fileUri = vscode.Uri.file(fullPath);

  const alreadyExists = fs.existsSync(fullPath);

  let finalContent = content;
  if (options.append && alreadyExists) {
    const existing = fs.readFileSync(fullPath, "utf-8");
    finalContent = existing.trimEnd() + "\n\n---\n\n" + content;
  }

  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(fileUri, encoder.encode(finalContent));

  // Auto-inject into Cursor if the project has .cursor/ and setting is enabled
  const autoInjectCursor = config.get<boolean>("autoInjectCursor", true);
  if (autoInjectCursor && options.library) {
    await injectIntoCursor(workspaceRoot, options.library, content);
  }

  const verb = options.append && alreadyExists ? "Appended to" : alreadyExists ? "Updated" : "Created";
  const message = `DF: ${verb} ${outputPath}`;

  const action = await vscode.window.showInformationMessage(
    message,
    "Open File",
    "Show Diff"
  );

  if (action === "Open File" || (action === undefined && autoOpen)) {
    await vscode.window.showTextDocument(fileUri);
  } else if (action === "Show Diff" && alreadyExists) {
    await vscode.commands.executeCommand(
      "vscode.diff",
      vscode.Uri.parse("untitled:Previous"),
      fileUri,
      `DF: ${outputPath} (updated)`
    );
  }

  return fileUri;
}