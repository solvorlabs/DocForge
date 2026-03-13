/**
 * Multi-step input flow for DocForge commands.
 *
 * Uses VS Code's QuickPick + InputBox to guide the user through:
 *   1. Select input type (npm / URL / GitHub / Paste)
 *   2. Enter the specific input value
 *   3. (Optional) Specify components to extract
 */

import * as vscode from "vscode";
import type { ContextRequest } from "../api/docforgeClient";

type InputType = "npm" | "pypi" | "url" | "github" | "paste";

interface InputTypeOption {
  label: string;
  description: string;
  detail: string;
  type: InputType;
  placeholder: string;
}

const INPUT_TYPE_OPTIONS: InputTypeOption[] = [
  {
    label: "$(package) npm Package",
    description: "npm registry",
    detail: "Resolve docs from an npm package with optional version pinning",
    type: "npm",
    placeholder: "e.g. react-bits@2.1.4 or @tanstack/react-query@5.0.0",
  },
  {
    label: "$(globe) Documentation URL",
    description: "any URL",
    detail: "Crawl a documentation website directly",
    type: "url",
    placeholder: "e.g. https://reactbits.dev",
  },
  {
    label: "$(github) GitHub Repository",
    description: "GitHub repo",
    detail: "Extract docs from /docs, README, and TypeScript definitions",
    type: "github",
    placeholder: "e.g. https://github.com/DavidHDev/react-bits",
  },
  {
    label: "$(file-code) PyPI Package",
    description: "Python registry",
    detail: "Resolve docs from a PyPI package",
    type: "pypi",
    placeholder: "e.g. fastapi or fastapi==0.110.0",
  },
  {
    label: "$(clippy) Paste Content",
    description: "HTML / Markdown / PDF",
    detail: "Paste raw documentation content for processing",
    type: "paste",
    placeholder: "Paste your documentation content here...",
  },
];

/**
 * Run the multi-step input flow and return a ContextRequest,
 * or undefined if the user cancelled.
 */
export async function runInputFlow(): Promise<ContextRequest | undefined> {
  // Step 1: Choose input type
  const selected = await vscode.window.showQuickPick(INPUT_TYPE_OPTIONS, {
    title: "DocForge: Generate Context File (1/2)",
    placeHolder: "How do you want to specify the library?",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!selected) {
    return undefined;
  }

  // Step 2: Get the specific input value
  let inputValue: string | undefined;

  if (selected.type === "paste") {
    // For paste, open an input box that accepts multi-line content
    inputValue = await vscode.window.showInputBox({
      title: "DocForge: Paste Documentation Content (2/2)",
      prompt: "Paste your HTML, Markdown, or text documentation",
      placeHolder: selected.placeholder,
      ignoreFocusOut: true, // Keep open if user clicks away
    });
  } else {
    inputValue = await vscode.window.showInputBox({
      title: `DocForge: Enter ${selected.description} (2/2)`,
      prompt: `Enter the ${selected.description} to generate context for`,
      placeHolder: selected.placeholder,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value.trim()) {
          return "Please enter a value";
        }
        return null;
      },
    });
  }

  if (!inputValue) {
    return undefined;
  }

  const request: ContextRequest = {
    input: inputValue.trim(),
    input_type: selected.type,
    output_format: "context_md",
  };

  if (selected.type === "paste") {
    request.content = inputValue.trim();
  }

  return request;
}

/**
 * Run input flow pre-populated with the text currently selected in the editor.
 * Assumes the selection is a package name (e.g. user right-clicked "react-bits@2.1.4").
 */
export async function runInputFlowFromSelection(
  selectedText: string
): Promise<ContextRequest | undefined> {
  // Extract a valid npm package name from the selection.
  // Handles plain selections like 'react-bits@2.1.4' or '@tanstack/react-query@5.0.0'
  // but also raw package.json values like '"@emotion/styled": "^11.14.0"'.
  const scopedMatch = selectedText.match(/(@[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+)(?:@([\d][^\s"']*))?\s*/);
  const plainMatch = selectedText.match(/^([a-z0-9][a-z0-9._-]*)(?:@([\d][^\s"']*))?$/);

  let packageInput: string | undefined;
  if (scopedMatch) {
    packageInput = scopedMatch[2]
      ? `${scopedMatch[1]}@${scopedMatch[2]}`
      : scopedMatch[1];
  } else if (plainMatch) {
    packageInput = plainMatch[2]
      ? `${plainMatch[1]}@${plainMatch[2]}`
      : plainMatch[1];
  }

  if (packageInput) {
    return {
      input: packageInput,
      input_type: "npm",
      output_format: "context_md",
    };
  }

  // Fall back to full flow
  return runInputFlow();
}