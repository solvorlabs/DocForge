/**
 * DocForge status bar item.
 *
 * Shows persistent status at the bottom of the VS Code window:
 *   Default:   $(book) DocForge
 *   Running:   $(sync~spin) DocForge: Fetching...
 *   Done:      $(check) DocForge: Ready
 *   Error:     $(warning) DocForge: Failed
 */

import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem | undefined;

export function createStatusBar(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = "docforge.generateContext";
  statusBarItem.tooltip = "DocForge: Click to generate a context file";
  setIdle();
  statusBarItem.show();
  return statusBarItem;
}

export function setIdle(): void {
  if (!statusBarItem) return;
  statusBarItem.text = "$(book) DocForge";
  statusBarItem.tooltip = "DocForge: Click to generate a context file";
  statusBarItem.backgroundColor = undefined;
}

export function setRunning(message = "Fetching..."): void {
  if (!statusBarItem) return;
  statusBarItem.text = `$(sync~spin) DocForge: ${message}`;
  statusBarItem.tooltip = "DocForge is processing...";
  statusBarItem.backgroundColor = undefined;
}

export function setSuccess(): void {
  if (!statusBarItem) return;
  statusBarItem.text = "$(check) DocForge: Ready";
  statusBarItem.tooltip = "DocForge: Context file generated successfully";
  statusBarItem.backgroundColor = new vscode.ThemeColor(
    "statusBarItem.activeBackground"
  );
  // Reset to idle after 3 seconds
  setTimeout(setIdle, 3000);
}

export function setError(): void {
  if (!statusBarItem) return;
  statusBarItem.text = "$(warning) DocForge: Failed";
  statusBarItem.tooltip = "DocForge: An error occurred. Click to try again.";
  statusBarItem.backgroundColor = new vscode.ThemeColor(
    "statusBarItem.errorBackground"
  );
  // Reset to idle after 5 seconds
  setTimeout(setIdle, 5000);
}

export function dispose(): void {
  statusBarItem?.dispose();
}