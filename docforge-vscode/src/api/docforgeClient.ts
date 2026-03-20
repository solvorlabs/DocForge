/**
 * HTTP client for the DocForge backend API.
 *
 * Handles job submission, polling with progress messages, and error normalization.
 * All timeouts and retry logic lives here so commands stay clean.
 */

import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

export interface ContextRequest {
  input: string;
  input_type: "npm" | "pypi" | "url" | "github" | "paste";
  components?: string[];
  output_format?: "context_md" | "json";
  content?: string;
}

export interface JobCreatedResponse {
  job_id: string;
  status: string;
}

export interface ContextResult {
  status: "queued" | "processing" | "complete" | "failed";
  job_id: string;
  library?: string;
  version?: string;
  output?: string;
  components?: object[];
  error?: string;
}

// Progress messages shown in the VS Code notification while polling.
// They cycle through during the 30–90s crawl + structure process.
const PROGRESS_MESSAGES = [
  "Fetching package metadata...",
  "Crawling documentation...",
  "Converting HTML to Markdown...",
  "Structuring with AI...",
  "Extracting gotchas...",
  "Formatting context file...",
  "Almost done...",
];

function getBackendUrl(): string {
  const config = vscode.workspace.getConfiguration("docforge");
  return config.get<string>("backendUrl", "https://api.docforge.dev");
}

function getCliToken(): string {
  try {
    const raw = fs.readFileSync(path.join(os.homedir(), ".config", "docforge", "config.toml"), "utf-8");
    return raw.match(/^token\s*=\s*"([^"]+)"/m)?.[1] ?? "";
  } catch { return ""; }
}

/** Returns Authorization header value: Bearer <jwt> from CLI, or empty string. */
function getAuthHeader(): Record<string, string> {
  // Prefer CLI JWT token (written after login) over legacy stored API key
  const token = getCliToken();
  if (token) return { "Authorization": `Bearer ${token}` };
  const stored = vscode.workspace.getConfiguration("docforge").get<string>("apiKey", "");
  if (stored) return { "X-API-Key": stored };
  return {};
}

/**
 * Login with email + password. Returns access_token and email.
 */
export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ access_token: string; email: string }> {
  const url = `${getBackendUrl()}/api/auth/login`;
  const body = JSON.stringify({ email, password });
  const data = await httpPostPublic(url, body);
  return data as { access_token: string; email: string };
}

/**
 * Register a new account. Returns access_token and email.
 */
export async function registerUser(
  email: string,
  password: string,
  geminiKey?: string,
  groqKey?: string
): Promise<{ access_token: string; email: string }> {
  const url = `${getBackendUrl()}/api/auth/register`;
  const body = JSON.stringify({
    email,
    password,
    gemini_key: geminiKey || null,
    groq_key: groqKey || null,
  });
  const data = await httpPostPublic(url, body);
  return data as { access_token: string; email: string };
}

/**
 * Submit a context generation job to the backend.
 * Returns immediately with a job_id for polling.
 */
export async function submitContextJob(
  request: ContextRequest
): Promise<JobCreatedResponse> {
  const url = `${getBackendUrl()}/api/context`;
  const body = JSON.stringify(request);

  const data = await httpPost(url, body);
  return data as JobCreatedResponse;
}

/**
 * Get the current status of a job.
 */
export async function getJobStatus(jobId: string): Promise<ContextResult> {
  const url = `${getBackendUrl()}/api/context/${jobId}`;
  const data = await httpGet(url);
  return data as ContextResult;
}

/**
 * Submit a job and poll until complete, calling onProgress with status messages.
 *
 * Polling interval: 2s
 * Max wait: 3 minutes (180s)
 */
export async function submitAndPoll(
  request: ContextRequest,
  onProgress: (message: string) => void
): Promise<ContextResult> {
  const job = await submitContextJob(request);
  return pollJobStatus(job.job_id, onProgress);
}

export async function pollJobStatus(
  jobId: string,
  onProgress: (message: string) => void
): Promise<ContextResult> {
  const POLL_INTERVAL_MS = 2000;
  const TIMEOUT_MS = 420_000; // 7 minutes (crawl ~4min + Gemini ~1min + buffer)

  let messageIndex = 0;
  let elapsed = 0;

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        // Cycle through progress messages so the user sees activity
        if (messageIndex < PROGRESS_MESSAGES.length) {
          onProgress(PROGRESS_MESSAGES[messageIndex++]);
        }

        const result = await getJobStatus(jobId);

        if (result.status === "complete") {
          clearInterval(interval);
          resolve(result);
        } else if (result.status === "failed") {
          clearInterval(interval);
          reject(new Error(result.error ?? "Unknown pipeline error"));
        }
        // status === "queued" or "processing" → keep polling
      } catch (err) {
        // Network error during polling — don't give up immediately,
        // the backend might still be processing
        onProgress("Waiting for backend...");
      }
    }, POLL_INTERVAL_MS);

    // Hard timeout: give up after 3 minutes
    setTimeout(() => {
      clearInterval(interval);
      reject(
        new Error(
          "Timeout: Documentation crawling took too long. Try again or use a smaller scope."
        )
      );
    }, TIMEOUT_MS);
  });
}

/**
 * Check if the DocForge backend is reachable.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const data = await httpGet(`${getBackendUrl()}/api/health`);
    return (data as { status?: string }).status === "ok";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Minimal HTTP helpers (no external deps — VS Code extensions can't easily
// use node_modules fetch in older Node versions)
// ---------------------------------------------------------------------------

function httpPost(url: string, body: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        ...getAuthHeader(),
      },
    };

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.detail ?? data}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(30_000, () => {
      req.destroy();
      reject(new Error("Request timeout (30s)"));
    });
    req.write(body);
    req.end();
  });
}

/** httpPostPublic — like httpPost but never adds auth headers (for login/register). */
function httpPostPublic(url: string, body: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${(parsed as { detail?: string }).detail ?? data}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(30_000, () => {
      req.destroy();
      reject(new Error("Request timeout (30s)"));
    });
    req.write(body);
    req.end();
  });
}

function httpGet(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        ...getAuthHeader(),
      },
    };

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${(parsed as { detail?: string }).detail ?? data}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(15_000, () => {
      req.destroy();
      reject(new Error("Request timeout (15s)"));
    });
    req.end();
  });
}