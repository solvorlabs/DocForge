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
import { DocForgeViewProvider } from "./ui/webviewPanel";
import { pickPackagesFromWorkspace } from "./utils/packageDetector";

export function activate(context: vscode.ExtensionContext): void {
  // Create the persistent status bar item
  const statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  // ── DocForge Sidebar Panel (Activity Bar) ─────────────────────────────
  const viewProvider = new DocForgeViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      DocForgeViewProvider.viewType,
      viewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // ── OAuth callback URI handler ─────────────────────────────────────────
  // Receives vscode://docforge.docforge/callback?token=...&email=... after
  // the user completes Google/GitHub sign-in in the browser.
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri(uri: vscode.Uri): void {
        if (uri.path === "/callback") {
          const params = new URLSearchParams(uri.query);
          const token = params.get("token") ?? "";
          const email = params.get("email") ?? "";
          if (token) {
            viewProvider.handleAuthCallback(token, email);
          }
        }
      },
    })
  );

  // Command to focus/open the sidebar panel
  context.subscriptions.push(
    vscode.commands.registerCommand("docforge.openPanel", () => {
      vscode.commands.executeCommand("workbench.view.extension.docforge-sidebar");
    })
  );

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
    "DocForge is ready! Click the shield icon in the Activity Bar to open the panel."
  );
}

export function deactivate(): void {
  disposeStatusBar();
}