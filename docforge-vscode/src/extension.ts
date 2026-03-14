/**
 * DocForge VS Code Extension — Entry Point
 *
 * Registers all commands, creates the status bar item,
 * and wires up the auto-detect from package.json command.
 */

import * as vscode from "vscode";
import { generateContext, runGeneration } from "./commands/generateContext";
import { updateContext } from "./commands/updateContext";
import { runInputFlowFromSelection } from "./ui/inputFlow";
import { createStatusBar, dispose as disposeStatusBar } from "./ui/statusBar";
import { pickPackagesFromWorkspace } from "./utils/packageDetector";

export function activate(context: vscode.ExtensionContext): void {
  // Create the persistent status bar item
  const statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  // ── docforge.generateContext ─────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand("docforge.generateContext", generateContext)
  );

  // ── docforge.generateFromSelection ───────────────────────────────────
  // Triggered by right-clicking selected text in the editor
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "docforge.generateFromSelection",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("DF: No active editor.");
          return;
        }

        const selection = editor.document.getText(editor.selection).trim();
        if (!selection) {
          vscode.window.showWarningMessage(
            "DF: No text selected. Select a package name and try again."
          );
          return;
        }

        const request = await runInputFlowFromSelection(selection);
        if (request) {
          await runGeneration(request);
        }
      }
    )
  );

  // ── docforge.updateContext ────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand("docforge.updateContext", updateContext)
  );

  // ── docforge.detectDependencies ───────────────────────────────────────
  // Reads package.json and presents a multi-select QuickPick
  context.subscriptions.push(
    vscode.commands.registerCommand("docforge.detectDependencies", async () => {
      const selected = await pickPackagesFromWorkspace();
      if (selected.length === 0) return;

      // Run all selected packages sequentially, appending each to the context file
      for (let i = 0; i < selected.length; i++) {
        await runGeneration(
          { input: selected[i], input_type: "npm", output_format: "context_md" },
          /* append= */ i > 0  // first package overwrites, rest append
        );
      }
    })
  );

  vscode.window.showInformationMessage(
    "DocForge is ready! Press Ctrl+Shift+P and type DF: to get started."
  );
}

export function deactivate(): void {
  disposeStatusBar();
}