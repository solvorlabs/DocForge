export interface ContextRequest {
  input: string;
  input_type: 'npm' | 'pypi' | 'url' | 'github' | 'paste';
  output_format: 'context_md' | 'json';
}

export interface JobCreatedResponse {
  job_id: string;
  status: string;
  cached: boolean;
}

export interface JobResult {
  job_id: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  output?: string;
  error?: string;
  library?: string;
  version?: string;
}

export interface CorrectionRequest {
  library: string;
  version: string;
  component_name: string;
  field: string;
  correction: string;
  reporter_email?: string;
}

export interface SearchResult {
  library: string;
  version: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  has_gemini_key: boolean;
  has_groq_key: boolean;
}

export interface DeviceInitResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DevicePollResponse {
  status: 'pending' | 'complete' | 'expired';
  access_token?: string;
  email?: string;
}
