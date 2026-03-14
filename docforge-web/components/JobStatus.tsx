'use client';
import { useJobPoller } from '@/hooks/useJobPoller';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { XCircle, Loader2 } from 'lucide-react';
import { ResultViewer } from './ResultViewer';

const STEPS = ['Queued', 'Crawling docs', 'Structuring with AI', 'Complete'];

export function JobStatus({ jobId, library }: { jobId: string; library: string }) {
  const result = useJobPoller(jobId);

  if (!result) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin w-4 h-4" /> Connecting...
      </div>
    );
  }

  if (result.status === 'failed') {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="w-5 h-5" />
        <span className="text-sm">{result.error || 'Generation failed'}</span>
      </div>
    );
  }

  if (result.status === 'complete' && result.output) {
    return (
      <ResultViewer
        output={result.output}
        library={result.library || library}
        version={result.version || ''}
      />
    );
  }

  const stepIndex = result.status === 'processing' ? 2 : result.status === 'queued' ? 0 : 1;
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium">{STEPS[stepIndex]}</span>
        <Badge variant="outline">{result.status}</Badge>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        {STEPS.map((step, i) => (
          <span key={step} className={i <= stepIndex ? 'text-blue-500 font-medium' : ''}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
