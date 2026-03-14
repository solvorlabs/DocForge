/**
 * docforge.generateContext — main command.
 *
 * Flow:
 *   1. Check backend health
 *   2. Show input flow (QuickPick → InputBox)
 *   3. POST to backend with progress notification + spinner
 *   4. Poll until complete, updating progress messages
 *   5. Write .context.md to workspace
 *   6. Show success notification with "Open File" action
 */

import * as vscode from "vscode";
import { checkHealth, submitAndPoll } from "../api/docforgeClient";
import type { ContextRequest } from "../api/docforgeClient";
import { runInputFlow } from "../ui/inputFlow";
import { setError, setIdle, setRunning, setSuccess } from "../ui/statusBar";
import { writeContextFile } from "../utils/fileWriter";

export async function generateContext(): Promise<void> {
  // ── Prerequisite: workspace must be open ──────────────────────────────
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    vscode.window.showErrorMessage(
      "DF: Please open a project folder before generating context."
    );
    return;
  }

  // ── Step 1: Quick health check ────────────────────────────────────────
  const backendUrl = vscode.workspace
    .getConfiguration("docforge")
    .get<string>("backendUrl", "https://api.docforge.dev");

  const healthy = await checkHealth();
  if (!healthy) {
    const action = await vscode.window.showErrorMessage(
      `DF: Cannot reach backend at ${backendUrl}.\n` +
        "Is the DocForge backend running?",
      "Use Local Backend",
      "Dismiss"
    );
    if (action === "Use Local Backend") {
      await vscode.workspace
        .getConfiguration()
        .update(
          "docforge.backendUrl",
          "http://localhost:8000",
          vscode.ConfigurationTarget.Workspace
        );
      vscode.window.showInformationMessage(
        "DF: Backend URL updated to http://localhost:8000"
      );
    }
    return;
  }

  // ── Step 2: Input flow ────────────────────────────────────────────────
  const request = await runInputFlow();
  if (!request) {
    return; // User cancelled
  }

  await runGeneration(request);
}

/**
 * Shared generation logic used by multiple commands.
 * Accepts a pre-built ContextRequest and runs the full pipeline.
 *
 * @param append - When true, appends result to existing context file instead of overwriting.
 */
export async function runGeneration(request: ContextRequest, append = false): Promise<void> {
  setRunning("Starting...");

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `DF: Generating context for ${request.input}`,
      cancellable: false,
    },
    async (progress) => {
      let lastMessage = "";

      try {
        const result = await submitAndPoll(request, (message) => {
          if (message !== lastMessage) {
            progress.report({ message });
            setRunning(message);
            lastMessage = message;
          }
        });

        if (!result.output) {
          throw new Error("Backend returned no output");
        }

        const extension = request.output_format === "json" ? ".json" : ".md";
        const outputExt = request.output_format === "context_md" ? undefined : extension;

        await writeContextFile(result.output, {
          append,
          extension: outputExt,
          library: result.library ?? request.input,
        });
        setSuccess();
      } catch (err) {
        setError();
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`DF: ${message}`);
      }
    }
  );
}