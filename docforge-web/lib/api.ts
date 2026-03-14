import type { JobCreatedResponse, JobResult, CorrectionRequest } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function createJob(input: string, inputType: string): Promise<JobCreatedResponse> {
  const res = await fetch(`${BACKEND}/api/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
