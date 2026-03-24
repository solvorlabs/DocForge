/**
 * DocForge Sidebar WebviewView Provider
 *
 * Renders a full-featured panel in the VS Code Activity Bar sidebar:
 *   - Account section: API key management + login link to the web app
 *   - Source type tabs (npm / URL / GitHub / PyPI / Paste)
 *   - Input field / textarea
 *   - Output format pills
 *   - Generate + Detect buttons
 *   - Live progress log + completion state
 *
 * When generation completes the result file opens in the main editor beside
 * the sidebar, giving a natural "split screen" layout.
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as http from "http";
import * as os from "os";
import * as path from "path";
import { checkHealth, submitAndPoll, loginWithPassword, registerUser } from "../api/docforgeClient";
import type { ContextRequest } from "../api/docforgeClient";
import { writeContextFile } from "../utils/fileWriter";
import { pickPackagesFromWorkspace } from "../utils/packageDetector";
import { setError, setRunning, setSuccess } from "./statusBar";

/** Read token + email from ~/.config/docforge/config.toml (written by the CLI after login) */
function readCliAuth(): { token: string; email: string } | null {
  try {
    const configPath = path.join(os.homedir(), ".config", "docforge", "config.toml");
    const raw = fs.readFileSync(configPath, "utf-8");
    const token = raw.match(/^token\s*=\s*"([^"]+)"/m)?.[1] ?? "";
    const email = raw.match(/^email\s*=\s*"([^"]+)"/m)?.[1] ?? "";
    if (!token) return null;
    // Check JWT expiry
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    } catch { /* non-JWT token, let it through */ }
    return { token, email };
  } catch {
    return null;
  }
}

/** Write token + email to ~/.config/docforge/config.toml */
function writeCliAuth(token: string, email: string): void {
  try {
    const configDir = path.join(os.homedir(), ".config", "docforge");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "config.toml"),
      `token = "${token}"\nemail = "${email}"\n`,
      "utf-8"
    );
  } catch { /* ignore */ }
}

/** Remove token from config (logout) */
function clearCliAuth(): void {
  try {
    fs.writeFileSync(
      path.join(os.homedir(), ".config", "docforge", "config.toml"),
      "",
      "utf-8"
    );
  } catch { /* ignore */ }
}

export class DocForgeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "docforge.sidebarView";

  private _view?: vscode.WebviewView;
  private _lastFileUri?: vscode.Uri;
  private _callbackPort = 0;
  private _callbackServer?: http.Server;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._view = webviewView;

    // Start the OAuth callback server before building HTML so the port is
    // known when we embed the OAuth <a href> links.
    await this._startCallbackServer();

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, "media"),
      ],
    };

    webviewView.webview.html = this._buildHtml(webviewView.webview);

    // Re-send auth/health state whenever the panel becomes visible again
    // (e.g. user returns from browser after OAuth)
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this._sendInitialState();
      }
    });

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case "ready":
          await this._sendInitialState();
          break;
        case "generate":
          await this._handleGenerate(msg);
          break;
        case "detect":
          await this._handleDetect();
          break;
        case "openFile":
          await this._handleOpenFile();
          break;
        case "saveApiKey":
          await this._handleSaveApiKey(msg.key);
          break;
        case "saveProviderKey":
          await vscode.workspace.getConfiguration()
            .update("docforge.providerApiKey", msg.key?.trim(), vscode.ConfigurationTarget.Global);
          break;
        case "openWeb":
          await this._handleOpenWeb(msg.path ?? "/settings");
          break;
        case "login":
          await this._handleLogin(msg.email, msg.password);
          break;
        case "register":
          await this._handleRegister(msg.email, msg.password, msg.geminiKey, msg.groqKey);
          break;
        case "logout":
          this._handleLogout();
          break;
      }
    });
  }

  // ── Message handlers ──────────────────────────────────────────────────────

  private async _sendInitialState(): Promise<void> {
    const config = vscode.workspace.getConfiguration("docforge");
    const storedKey = config.get<string>("apiKey", "");
    const cliAuth = readCliAuth();

    // CLI login takes priority over manually stored key
    const isConnected = !!(cliAuth?.token || storedKey);
    const email = cliAuth?.email ?? "";

    // Send UI state immediately — don't block on health check
    this._post({
      type: "init",
      healthy: null,
      isConnected,
      email,
    });

    // Health check runs in background and updates separately
    Promise.race([
      checkHealth(),
      new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000)),
    ]).then(healthy => {
      this._post({ type: "healthStatus", healthy });
    }).catch(() => {
      this._post({ type: "healthStatus", healthy: false });
    });
  }

  private async _handleGenerate(msg: {
    input: string;
    inputType: ContextRequest["input_type"];
    format: string;
  }): Promise<void> {
    if (!vscode.workspace.workspaceFolders?.length) {
      this._post({
        type: "error",
        message: "Please open a project folder first.",
      });
      return;
    }

    const outputFormat: ContextRequest["output_format"] =
      msg.format === "json" ? "json" : "context_md";

    const request: ContextRequest = {
      input: msg.input.trim(),
      input_type: msg.inputType,
      output_format: outputFormat,
    };

    if (msg.inputType === "paste") {
      request.content = msg.input.trim();
    }

    setRunning("Starting...");
    this._post({ type: "generationStart" });

    try {
      const result = await submitAndPoll(request, (message) => {
        this._post({ type: "progress", message });
        setRunning(message);
      });

      if (!result.output) {
        throw new Error("Backend returned no output");
      }

      const outputExt = outputFormat === "json" ? ".json" : undefined;

      const fileUri = await writeContextFile(result.output, {
        append: false,
        extension: outputExt,
        library: result.library ?? request.input,
      });

      setSuccess();
      this._lastFileUri = fileUri;

      this._post({
        type: "complete",
        library: result.library ?? request.input,
        fileName: fileUri
          ? fileUri.fsPath.split(/[\\/]/).pop()
          : (result.library ?? request.input) + ".context.md",
      });

      // Open in main editor — creates the split-screen effect
      if (fileUri) {
        await vscode.window.showTextDocument(fileUri, {
          viewColumn: vscode.ViewColumn.One,
          preview: false,
          preserveFocus: true,
        });
      }
    } catch (err) {
      setError();
      const message = err instanceof Error ? err.message : String(err);
      this._post({ type: "error", message });
    }
  }

  private async _handleDetect(): Promise<void> {
    const selected = await pickPackagesFromWorkspace();
    if (selected.length > 0) {
      this._post({ type: "detectResult", packages: selected });
    }
  }

  private async _handleOpenFile(): Promise<void> {
    if (!this._lastFileUri) {
      return;
    }
    await vscode.window.showTextDocument(this._lastFileUri, {
      viewColumn: vscode.ViewColumn.One,
      preview: false,
    });
  }

  private async _handleSaveApiKey(key: string): Promise<void> {
    const trimmed = key.trim();
    await vscode.workspace
      .getConfiguration()
      .update("docforge.apiKey", trimmed, vscode.ConfigurationTarget.Global);

    this._post({
      type: "apiKeySaved",
      hasApiKey: trimmed.length > 0,
      apiKeyPreview: trimmed.length > 0
        ? trimmed.slice(0, 4) + "••••••••" + trimmed.slice(-4)
        : "",
    });
  }

  private async _handleOpenWeb(path: string): Promise<void> {
    const config = vscode.workspace.getConfiguration("docforge");
    const webUrl = config.get<string>("webUrl", "http://localhost:3000");
    const fullUrl = webUrl.replace(/\/$/, "") + path;
    const uri = vscode.Uri.parse(fullUrl);
    try {
      await vscode.commands.executeCommand("vscode.open", uri);
    } catch {
      vscode.window.showInformationMessage(
        `DocForge: Open this in your browser → ${fullUrl}`
      );
    }
  }

  private async _handleLogin(email: string, password: string): Promise<void> {
    this._post({ type: "authLoading", loading: true });
    try {
      const result = await loginWithPassword(email, password);
      writeCliAuth(result.access_token, result.email);
      this._post({ type: "loginResult", success: true, email: result.email });
    } catch (err) {
      this._post({
        type: "loginResult",
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async _handleRegister(
    email: string,
    password: string,
    geminiKey?: string,
    groqKey?: string
  ): Promise<void> {
    this._post({ type: "authLoading", loading: true });
    try {
      const result = await registerUser(email, password, geminiKey, groqKey);
      writeCliAuth(result.access_token, result.email);
      this._post({ type: "loginResult", success: true, email: result.email });
    } catch (err) {
      this._post({
        type: "loginResult",
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /** Start a persistent local HTTP server for OAuth callbacks. Idempotent. */
  private async _startCallbackServer(): Promise<void> {
    if (this._callbackServer) return;
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url ?? "/", "http://localhost");
        const token = url.searchParams.get("token") ?? "";
        const email = url.searchParams.get("email") ?? "";
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<html><head><style>body{font-family:sans-serif;display:flex;align-items:center;` +
          `justify-content:center;height:100vh;margin:0;background:#0d1117;color:#e6edf3}</style></head>` +
          `<body><h2>&#10003; Signed in! You can close this tab.</h2></body></html>`
        );
        if (token) {
          writeCliAuth(token, email);
          vscode.window.showInformationMessage(`DocForge: Signed in as ${email}`);
          // Send loginResult after a short delay to let the event loop settle.
          // onDidChangeVisibility also re-sends state when user returns to sidebar.
          setTimeout(() => {
            this._post({ type: "loginResult", success: true, email });
          }, 300);
        }
      } catch { /* ignore bad requests */ }
    });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    this._callbackPort = (server.address() as { port: number }).port;
    this._callbackServer = server;
  }

  private _handleLogout(): void {
    clearCliAuth();
    vscode.workspace.getConfiguration()
      .update("docforge.apiKey", "", vscode.ConfigurationTarget.Global);
    this._post({ type: "loggedOut" });
  }

  /** Called by the URI handler in extension.ts after OAuth callback. */
  public handleAuthCallback(token: string, email: string): void {
    writeCliAuth(token, email);
    this._post({ type: "loginResult", success: true, email });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _post(message: Record<string, unknown>): void {
    this._view?.webview.postMessage(message);
  }

  private _buildHtml(webview: vscode.Webview): string {
    const nonce = _nonce();
    const logoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "image.png")
    );
    const backendUrl = vscode.workspace.getConfiguration("docforge")
      .get<string>("backendUrl", "https://api.docforge.dev").replace(/\/$/, "");
    const port = this._callbackPort;
    const githubOAuthUrl = `${backendUrl}/api/auth/oauth/github?source=vscode_local&callback_port=${port}`;
    const googleOAuthUrl = `${backendUrl}/api/auth/oauth/google?source=vscode_local&callback_port=${port}`;
    const csp = [
      `default-src 'none'`,
      `style-src 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
      `img-src ${webview.cspSource}`,
    ].join("; ");

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>DocForge</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    padding: 0 12px 24px;
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    overflow-x: hidden;
  }

  /* ── Header ─────────────────────────────────────── */
  .df-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(128,128,128,.2));
    margin-bottom: 14px;
  }

  .df-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Gear logo inline SVG */
  .df-logo-icon {
    width: 36px; height: 36px;
    flex-shrink: 0;
    object-fit: contain;
    filter: var(--df-logo-filter, none);
  }

  .df-logo-text {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -.2px;
    color: var(--vscode-textLink-foreground, #4f9ef8);
  }

  .df-health {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }

  .df-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--vscode-descriptionForeground);
    flex-shrink: 0;
    transition: background .3s;
  }
  .df-dot.online  { background: #22c55e; }
  .df-dot.offline { background: #ef4444; }

  /* ── Account / Auth section ─────────────────────── */
  .df-account {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.25));
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
  }

  /* OAuth buttons (GitHub / Google) */
  .df-oauth-btn {
    width: 100%;
    padding: 7px 10px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--vscode-font-family);
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.35));
    background: var(--vscode-button-secondaryBackground, rgba(128,128,128,.1));
    color: var(--vscode-foreground);
    transition: background .12s;
    text-decoration: none;
  }
  .df-oauth-btn:hover {
    background: var(--vscode-button-secondaryHoverBackground, rgba(128,128,128,.2));
  }

  /* "or" divider */
  .df-or-divider {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 0 10px;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }
  .df-or-divider::before, .df-or-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--vscode-input-border, rgba(128,128,128,.25));
  }

  /* Sign In / Sign Up tab switcher */
  .df-auth-tabs {
    display: flex;
    border-bottom: 1px solid var(--vscode-input-border, rgba(128,128,128,.2));
    margin-bottom: 10px;
  }
  .df-auth-tab {
    padding: 4px 14px;
    font-size: 12px;
    font-family: var(--vscode-font-family);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    color: var(--vscode-descriptionForeground);
    transition: color .12s, border-color .12s;
  }
  .df-auth-tab.active {
    color: var(--vscode-textLink-foreground, #4f9ef8);
    border-bottom-color: var(--vscode-textLink-foreground, #4f9ef8);
  }

  .df-auth-field { margin-bottom: 6px; }

  .df-auth-error {
    font-size: 11px;
    color: #ef4444;
    margin-top: 6px;
    word-break: break-word;
  }

  /* Logged-in connected bar */
  .df-account-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .df-account-email {
    font-size: 12px;
    color: #22c55e;
    font-weight: 600;
  }
  .df-account-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .df-link-btn {
    font-size: 11px;
    color: var(--vscode-textLink-foreground, #4f9ef8);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--vscode-font-family);
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;
    opacity: .9;
  }
  .df-link-btn:hover { opacity: 1; }

  /* collapsible provider-key panel */
  .df-settings-panel {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--vscode-input-border, rgba(128,128,128,.2));
  }
  .df-settings-row {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
  }
  .df-settings-row input { flex: 1; min-width: 0; }
  .df-settings-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 5px;
    display: block;
  }
  .df-key-toast {
    font-size: 11px;
    color: #22c55e;
    min-height: 14px;
    margin-top: 3px;
  }

  /* ── Section labels ──────────────────────────────── */
  .df-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 6px;
  }

  .df-section { margin-bottom: 14px; }

  /* ── Source type tabs ────────────────────────────── */
  .df-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .df-tab {
    padding: 4px 9px;
    font-size: 12px;
    font-family: var(--vscode-font-family);
    background: transparent;
    color: var(--vscode-foreground);
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.35));
    border-radius: 4px;
    cursor: pointer;
    transition: background .12s, border-color .12s;
    line-height: 1.4;
  }

  .df-tab:hover:not(.active) {
    background: var(--vscode-list-hoverBackground, rgba(128,128,128,.1));
  }

  .df-tab.active {
    background: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #fff);
    border-color: transparent;
  }

  /* ── Inputs ──────────────────────────────────────── */
  input[type="text"], input[type="password"], textarea {
    width: 100%;
    padding: 6px 8px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.35));
    border-radius: 3px;
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    outline: none;
    line-height: 1.4;
  }

  input[type="text"]:focus, input[type="password"]:focus, textarea:focus {
    border-color: var(--vscode-focusBorder, #007fd4);
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    font-size: 12px;
  }

  /* ── Format pills ────────────────────────────────── */
  .df-pills {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .df-pill {
    padding: 3px 11px;
    font-size: 11px;
    font-family: var(--vscode-font-family);
    background: transparent;
    color: var(--vscode-foreground);
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.35));
    border-radius: 20px;
    cursor: pointer;
    transition: all .12s;
  }

  .df-pill:hover:not(.active) {
    border-color: var(--vscode-textLink-foreground, #4f9ef8);
    color: var(--vscode-textLink-foreground, #4f9ef8);
  }

  .df-pill.active {
    background: var(--vscode-badge-background, #0e639c);
    color: var(--vscode-badge-foreground, #fff);
    border-color: transparent;
  }

  /* ── Buttons ─────────────────────────────────────── */
  .df-btn-primary, .df-btn-secondary, .df-btn-sm, .df-btn-save {
    font-family: var(--vscode-font-family);
    border-radius: 3px;
    cursor: pointer;
    transition: opacity .12s, background .12s;
    border: none;
  }

  .df-btn-primary {
    width: 100%;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #fff);
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .df-btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground, #1177bb);
  }

  .df-btn-secondary {
    width: 100%;
    padding: 7px 14px;
    background: var(--vscode-button-secondaryBackground, rgba(128,128,128,.15));
    color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.3));
    font-size: 12px;
  }

  .df-btn-secondary:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, rgba(128,128,128,.25));
  }

  .df-btn-primary:disabled, .df-btn-secondary:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .df-btn-save {
    padding: 5px 10px;
    font-size: 11px;
    background: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #fff);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .df-btn-save:hover { background: var(--vscode-button-hoverBackground, #1177bb); }

  .df-btn-sm {
    padding: 3px 10px;
    font-size: 11px;
    background: transparent;
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.35));
    color: var(--vscode-foreground);
  }

  .df-btn-sm:hover {
    background: var(--vscode-list-hoverBackground, rgba(128,128,128,.1));
  }

  /* ── Divider ─────────────────────────────────────── */
  .df-divider {
    height: 1px;
    background: var(--vscode-panel-border, rgba(128,128,128,.2));
    margin: 14px 0;
  }

  /* ── Output area ─────────────────────────────────── */
  .df-output-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  #df-output {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-input-border, rgba(128,128,128,.2));
    border-radius: 4px;
    padding: 10px 12px;
    min-height: 90px;
    max-height: 340px;
    overflow-y: auto;
    font-family: var(--vscode-editor-font-family, 'Menlo', 'Consolas', monospace);
    font-size: 12px;
    line-height: 1.55;
  }

  .df-empty {
    color: var(--vscode-descriptionForeground);
    text-align: center;
    padding: 18px 0;
    font-style: italic;
    font-family: var(--vscode-font-family);
    font-size: 12px;
  }

  .df-log-line {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    padding: 1px 0;
    color: var(--vscode-descriptionForeground);
  }

  .df-log-line.current { color: var(--vscode-foreground); }
  .df-log-icon { flex-shrink: 0; width: 14px; }

  .df-complete {
    margin-top: 10px;
    padding: 10px 12px;
    background: rgba(34,197,94,.08);
    border: 1px solid rgba(34,197,94,.25);
    border-radius: 4px;
    font-family: var(--vscode-font-family);
  }

  .df-complete-title { font-weight: 700; color: #22c55e; margin-bottom: 3px; font-size: 12px; }
  .df-complete-file  { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; word-break: break-all; }
  .df-complete-actions { display: flex; gap: 6px; }

  .df-error {
    margin-top: 10px;
    padding: 10px 12px;
    background: rgba(239,68,68,.08);
    border: 1px solid rgba(239,68,68,.25);
    border-radius: 4px;
    color: #ef4444;
    font-size: 12px;
    font-family: var(--vscode-font-family);
    word-break: break-word;
    white-space: pre-wrap;
  }


  /* Spinner */
  .df-spinner {
    display: inline-block;
    width: 11px; height: 11px;
    border: 2px solid rgba(128,128,128,.3);
    border-top-color: var(--vscode-textLink-foreground, #4f9ef8);
    border-radius: 50%;
    animation: df-spin .75s linear infinite;
    flex-shrink: 0;
  }

  @keyframes df-spin { to { transform: rotate(360deg); } }

  .hidden { display: none !important; }
</style>
</head>
<body>

<!-- ── Header ─────────────────────────────────────────────────────────── -->
<div class="df-header">
  <div class="df-header-left">
    <img class="df-logo-icon" src="${logoUri}" alt="DocForge" />
    <span class="df-logo-text">DocForge</span>
  </div>
  <div class="df-health">
    <span id="df-dot" class="df-dot"></span>
    <span id="df-health-text">Checking...</span>
  </div>
</div>

<!-- ── Account ─────────────────────────────────────────────────────────── -->
<div class="df-account">

  <!-- ── NOT logged in: auth form ───────────────────────────────────── -->
  <div id="df-auth-section">
    <!-- OAuth buttons: plain <a href> so Flatpak VSCode opens them in the system browser -->
    <a href="${githubOAuthUrl}" class="df-oauth-btn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      Continue with GitHub
    </a>
    <a href="${googleOAuthUrl}" class="df-oauth-btn">
      <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Continue with Google
    </a>

    <div class="df-or-divider">or</div>

    <!-- Email / Password -->
    <div class="df-auth-tabs">
      <button class="df-auth-tab active" data-mode="login">Sign In</button>
      <button class="df-auth-tab" data-mode="signup">Sign Up</button>
    </div>

    <div class="df-auth-field">
      <input type="email" id="df-auth-email" placeholder="Email" autocomplete="email" spellcheck="false" />
    </div>
    <div class="df-auth-field">
      <input type="password" id="df-auth-password" placeholder="Password" autocomplete="current-password" />
    </div>
    <!-- Sign-up extras (hidden by default) -->
    <div id="df-signup-extras" class="hidden">
      <div class="df-auth-field">
        <input type="password" id="df-gemini-key" placeholder="Gemini API key (optional)" autocomplete="off" />
      </div>
      <div class="df-auth-field">
        <input type="password" id="df-groq-key" placeholder="Groq API key (optional)" autocomplete="off" />
      </div>
    </div>

    <button class="df-btn-primary" id="df-auth-submit" style="margin-top:4px">Sign In</button>
    <div id="df-auth-error" class="df-auth-error hidden"></div>
  </div>

  <!-- ── Logged in: connected bar ────────────────────────────────────── -->
  <div id="df-connected-section" class="hidden">
    <div class="df-account-top">
      <span id="df-account-email" class="df-account-email"></span>
      <div class="df-account-actions">
        <button class="df-link-btn" id="df-logout-btn">Logout</button>
        <button class="df-link-btn" id="df-settings-toggle" style="margin-left:6px">⚙</button>
      </div>
    </div>

    <!-- Collapsible: AI provider key -->
    <div id="df-settings-panel" class="df-settings-panel hidden">
      <span class="df-settings-label">AI Provider Key (Gemini / Grok — when quota runs out)</span>
      <div class="df-settings-row">
        <input type="password" id="df-provider-key-input" placeholder="e.g. AIza... or gsk_..." autocomplete="off" spellcheck="false" />
        <button class="df-btn-save" id="df-save-provider-btn">Save</button>
      </div>
      <div id="df-key-toast" class="df-key-toast"></div>
    </div>
  </div>

</div>

<!-- ── Source type ─────────────────────────────────────────────────────── -->
<div class="df-section">
  <span class="df-label">Source</span>
  <div class="df-tabs" id="df-tabs">
    <button class="df-tab active" data-type="npm">npm</button>
    <button class="df-tab" data-type="url">URL</button>
    <button class="df-tab" data-type="github">GitHub</button>
    <button class="df-tab" data-type="pypi">PyPI</button>
    <button class="df-tab" data-type="paste">Paste</button>
  </div>
</div>

<!-- ── Input ───────────────────────────────────────────────────────────── -->
<div class="df-section">
  <span class="df-label" id="df-input-label">Package</span>
  <input type="text" id="df-input" placeholder="e.g. react-bits@2.1.4" autocomplete="off" spellcheck="false" />
  <textarea id="df-paste" class="hidden" placeholder="Paste HTML, Markdown, or text documentation here..."></textarea>
</div>

<!-- ── Output format ──────────────────────────────────────────────────── -->
<div class="df-section">
  <span class="df-label">Output Format</span>
  <div class="df-pills">
    <button class="df-pill active" data-format="context_md">.context.md</button>
    <button class="df-pill" data-format="markdown">.md</button>
    <button class="df-pill" data-format="json">.json</button>
  </div>
</div>

<!-- ── Actions ────────────────────────────────────────────────────────── -->
<button id="df-generate" class="df-btn-primary">Generate Context</button>
<button id="df-detect"   class="df-btn-secondary">Detect from package.json</button>

<div class="df-divider"></div>

<!-- ── Output ─────────────────────────────────────────────────────────── -->
<div class="df-section">
  <div class="df-output-header">
    <span class="df-label" style="margin-bottom:0">Output</span>
  </div>
  <div id="df-output">
    <div class="df-empty">Configure a source above and click Generate.</div>
  </div>
</div>

<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();

  let activeType   = 'npm';
  let activeFormat = 'context_md';
  let isRunning    = false;
  let logLines     = [];

  const PLACEHOLDERS = {
    npm:    'e.g. react-bits@2.1.4 or @tanstack/react-query@5',
    url:    'e.g. https://reactbits.dev/docs',
    github: 'e.g. https://github.com/DavidHDev/react-bits',
    pypi:   'e.g. fastapi or fastapi==0.110.0',
    paste:  'Paste HTML, Markdown, or text documentation here...',
  };

  const LABELS = {
    npm: 'Package', url: 'Documentation URL',
    github: 'GitHub Repository', pypi: 'PyPI Package', paste: 'Content',
  };

  // ── Source type tabs ─────────────────────────────────────────────────
  document.querySelectorAll('.df-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.dataset.type;

      const inp  = document.getElementById('df-input');
      const area = document.getElementById('df-paste');
      const lbl  = document.getElementById('df-input-label');

      lbl.textContent = LABELS[activeType];

      if (activeType === 'paste') {
        inp.classList.add('hidden');
        area.classList.remove('hidden');
      } else {
        area.classList.add('hidden');
        inp.classList.remove('hidden');
        inp.placeholder = PLACEHOLDERS[activeType];
      }
    });
  });

  // ── Format pills ─────────────────────────────────────────────────────
  document.querySelectorAll('.df-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.df-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      activeFormat = btn.dataset.format;
    });
  });

  // ── Auth form: Sign In / Sign Up tab toggle ──────────────────────────
  let authMode = 'login';
  document.querySelectorAll('.df-auth-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.df-auth-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      authMode = btn.dataset.mode;
      document.getElementById('df-auth-submit').textContent =
        authMode === 'login' ? 'Sign In' : 'Create Account';
      document.getElementById('df-signup-extras').classList.toggle('hidden', authMode !== 'signup');
      document.getElementById('df-auth-error').classList.add('hidden');
    });
  });

  // ── Auth form: submit ────────────────────────────────────────────────
  document.getElementById('df-auth-submit').addEventListener('click', () => {
    const email    = document.getElementById('df-auth-email').value.trim();
    const password = document.getElementById('df-auth-password').value;
    if (!email || !password) {
      showAuthError('Please enter your email and password.');
      return;
    }
    if (authMode === 'login') {
      vscode.postMessage({ type: 'login', email, password });
    } else {
      const geminiKey = document.getElementById('df-gemini-key').value.trim();
      const groqKey   = document.getElementById('df-groq-key').value.trim();
      vscode.postMessage({ type: 'register', email, password, geminiKey, groqKey });
    }
  });

  // Enter key in password → submit
  document.getElementById('df-auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('df-auth-submit').click();
  });

  // ── Logout ───────────────────────────────────────────────────────────
  document.getElementById('df-logout-btn').addEventListener('click', () => {
    vscode.postMessage({ type: 'logout' });
  });

  // ── Settings toggle (provider key) ───────────────────────────────────
  document.getElementById('df-settings-toggle').addEventListener('click', () => {
    document.getElementById('df-settings-panel').classList.toggle('hidden');
  });

  // ── Provider key save ─────────────────────────────────────────────────
  document.getElementById('df-save-provider-btn').addEventListener('click', () => {
    const key = document.getElementById('df-provider-key-input').value.trim();
    vscode.postMessage({ type: 'saveProviderKey', key });
    document.getElementById('df-provider-key-input').value = '';
    const toast = document.getElementById('df-key-toast');
    toast.textContent = key ? '✓ Provider key saved' : 'Provider key cleared';
    setTimeout(() => { toast.textContent = ''; }, 3000);
  });

  // ── Generate ─────────────────────────────────────────────────────────
  document.getElementById('df-generate').addEventListener('click', () => {
    if (isRunning) return;
    const val = activeType === 'paste'
      ? document.getElementById('df-paste').value.trim()
      : document.getElementById('df-input').value.trim();

    if (!val) {
      showOutput('<div class="df-error">Please enter a ' + LABELS[activeType].toLowerCase() + '.</div>');
      return;
    }

    vscode.postMessage({ type: 'generate', input: val, inputType: activeType, format: activeFormat });
  });

  // ── Detect ───────────────────────────────────────────────────────────
  document.getElementById('df-detect').addEventListener('click', () => {
    if (isRunning) return;
    vscode.postMessage({ type: 'detect' });
  });

  // Enter key in text input → generate
  document.getElementById('df-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('df-generate').click();
  });

  // ── Messages from extension host ─────────────────────────────────────
  window.addEventListener('message', ({ data: msg }) => {
    switch (msg.type) {
      case 'init':
        updateHealth(msg.healthy);
        if (msg.isConnected) showConnected(msg.email); else showAuthForm();
        break;
      case 'healthStatus':
        updateHealth(msg.healthy);
        break;
      case 'authLoading':
        document.getElementById('df-auth-submit').disabled = true;
        document.getElementById('df-auth-submit').textContent = 'Please wait...';
        document.getElementById('df-auth-error').classList.add('hidden');
        break;
      case 'loginResult':
        // Only used by email/password flow — OAuth uses init via HTML rebuild
        document.getElementById('df-auth-submit').disabled = false;
        document.getElementById('df-auth-submit').textContent =
          authMode === 'login' ? 'Sign In' : 'Create Account';
        if (msg.success) {
          showConnected(msg.email);
        } else {
          showAuthError(msg.error || 'Authentication failed.');
        }
        break;
      case 'loggedOut':
        showAuthForm();
        break;
      case 'generationStart':
        onGenerationStart();
        break;
      case 'progress':
        appendLog(msg.message);
        break;
      case 'complete':
        onComplete(msg.library, msg.fileName);
        break;
      case 'error':
        onError(msg.message);
        break;
      case 'detectResult':
        onDetect(msg.packages);
        break;
      case 'apiKeySaved':
        onApiKeySaved(msg.hasApiKey);
        break;
    }
  });

  // ── UI update helpers ─────────────────────────────────────────────────

  function updateHealth(healthy) {
    const dot  = document.getElementById('df-dot');
    const text = document.getElementById('df-health-text');
    if (healthy === null) {
      dot.className = 'df-dot';
      text.textContent = 'Checking...';
    } else {
      dot.className  = 'df-dot ' + (healthy ? 'online' : 'offline');
      text.textContent = healthy ? 'Online' : 'Offline';
    }
  }

  function showConnected(email) {
    document.getElementById('df-auth-section').classList.add('hidden');
    document.getElementById('df-connected-section').classList.remove('hidden');
    document.getElementById('df-account-email').textContent = '✓ ' + (email || 'Connected');
  }

  function showAuthForm() {
    document.getElementById('df-connected-section').classList.add('hidden');
    document.getElementById('df-auth-section').classList.remove('hidden');
    document.getElementById('df-settings-panel').classList.add('hidden');
  }

  function showAuthError(msg) {
    const el = document.getElementById('df-auth-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function onApiKeySaved(hasKey) {
    // legacy handler kept for compatibility
    const toast = document.getElementById('df-key-toast');
    if (toast) {
      toast.textContent = hasKey ? '✓ API key saved' : 'API key cleared';
      setTimeout(() => { toast.textContent = ''; }, 3000);
    }
  }

  function setRunning(running) {
    isRunning = running;
    const gen = document.getElementById('df-generate');
    const det = document.getElementById('df-detect');
    gen.disabled = running;
    det.disabled = running;
    gen.innerHTML = running
      ? '<span class="df-spinner"></span> Generating...'
      : 'Generate Context';
  }

  function showOutput(html) {
    document.getElementById('df-output').innerHTML = html;
  }

  function onGenerationStart() {
    logLines = [];
    setRunning(true);
    showOutput('<div id="df-log"></div>');
  }

  function appendLog(message) {
    logLines.push(message);
    const log = document.getElementById('df-log');
    if (!log) return;
    log.innerHTML = logLines.map((line, i) => {
      const isCurrent = i === logLines.length - 1;
      return \`<div class="df-log-line \${isCurrent ? 'current' : ''}">
        <span class="df-log-icon">\${isCurrent ? '<span class="df-spinner"></span>' : '✓'}</span>
        <span>\${line}</span>
      </div>\`;
    }).join('');
    const area = document.getElementById('df-output');
    area.scrollTop = area.scrollHeight;
  }

  function onComplete(library, fileName) {
    setRunning(false);
    const logEl = document.getElementById('df-log');
    const finalLog = logEl
      ? logEl.innerHTML
          .replace(/df-log-line current/g, 'df-log-line')
          .replace(/<span class="df-spinner"><\\/span>/g, '✓')
      : '';

    showOutput(\`<div id="df-log">\${finalLog}</div>
      <div class="df-complete">
        <div class="df-complete-title">Done!</div>
        <div class="df-complete-file">\${fileName || library + '.context.md'}</div>
        <div class="df-complete-actions">
          <button class="df-btn-sm" onclick="vscode.postMessage({type:'openFile'})">Open File</button>
        </div>
      </div>\`);
  }

  function onError(message) {
    setRunning(false);
    const logEl = document.getElementById('df-log');
    const logHtml = logEl ? '<div id="df-log">' + logEl.innerHTML + '</div>' : '';
    showOutput(logHtml + '<div class="df-error">' + message + '</div>');
  }

  function onDetect(packages) {
    if (!packages.length) return;
    document.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-type="npm"]').classList.add('active');
    activeType = 'npm';
    document.getElementById('df-input').classList.remove('hidden');
    document.getElementById('df-paste').classList.add('hidden');
    document.getElementById('df-input-label').textContent = LABELS['npm'];
    document.getElementById('df-input').value = packages[0];
    document.getElementById('df-input').placeholder = PLACEHOLDERS['npm'];
  }

  // Signal ready → extension sends initial state
  vscode.postMessage({ type: 'ready' });
</script>
</body>
</html>`;
  }
}

function _nonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}
