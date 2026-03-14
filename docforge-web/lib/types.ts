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
