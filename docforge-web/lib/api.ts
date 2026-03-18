import type { AuthResponse, DeviceInitResponse, DevicePollResponse, JobCreatedResponse, JobResult, CorrectionRequest, UserProfile } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
               : { 'Content-Type': 'application/json' };
}

// ── Context ───────────────────────────────────────────────────────────────────

export async function createJob(input: string, inputType: string, token?: string | null): Promise<JobCreatedResponse> {
  const res = await fetch(`${BACKEND}/api/context`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ input, input_type: inputType, output_format: 'context_md' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJob(jobId: string): Promise<JobResult> {
  const res = await fetch(`${BACKEND}/api/context/${jobId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchLibraries(q: string): Promise<{ results: { library: string; version: string }[] }> {
  const res = await fetch(`${BACKEND}/api/search?q=${encodeURIComponent(q)}&limit=10`);
  if (!res.ok) return { results: [] };
  return res.json();
}

export async function submitCorrection(req: CorrectionRequest): Promise<void> {
  await fetch(`${BACKEND}/api/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string, geminiKey?: string, groqKey?: string): Promise<AuthResponse> {
  const res = await fetch(`${BACKEND}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, gemini_key: geminiKey || null, groq_key: groqKey || null }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${BACKEND}/api/auth/me`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateKeys(token: string, geminiKey?: string, groqKey?: string): Promise<void> {
  const res = await fetch(`${BACKEND}/api/auth/keys`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ gemini_key: geminiKey || null, groq_key: groqKey || null }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deviceInit(): Promise<DeviceInitResponse> {
  const res = await fetch(`${BACKEND}/api/auth/device/init`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deviceVerify(token: string, userCode: string): Promise<void> {
  const res = await fetch(`${BACKEND}/api/auth/device/verify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ user_code: userCode }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function devicePoll(deviceCode: string): Promise<DevicePollResponse> {
  const res = await fetch(`${BACKEND}/api/auth/device/poll?device_code=${encodeURIComponent(deviceCode)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
