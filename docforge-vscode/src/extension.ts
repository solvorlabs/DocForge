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
          vscode.window.showErrorMessage("DocForge: No active editor.");
          return;
        }

        const selection = editor.document.getText(editor.selection).trim();
        if (!selection) {
          vscode.window.showWarningMessage(
            "DocForge: No text selected. Select a package name and try again."
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

      if (selected.length === 1) {
        // Single package: run directly
        await runGeneration({
          input: selected[0],
          input_type: "npm",
          output_format: "context_md",
        });
      } else {
        // Multiple packages: ask which one to generate (batch is a future feature)
        const choice = await vscode.window.showQuickPick(
          selected.map((pkg) => ({ label: `$(package) ${pkg}`, detail: pkg })),
          {
            title: "DocForge: Choose a package to generate context for",
            placeHolder:
              "Multiple packages selected — choose one to start with",
          }
        );
        if (choice) {
          await runGeneration({
            input: choice.detail,
            input_type: "npm",
            output_format: "context_md",
          });
        }
      }
    })
  );

  vscode.window.showInformationMessage(
    "DocForge is ready! Use the command palette to generate a context file."
  );
}

export function deactivate(): void {
  disposeStatusBar();
}