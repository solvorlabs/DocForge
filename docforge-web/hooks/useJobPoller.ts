'use client';
import { useState, useEffect, useRef } from 'react';
import { getJob } from '@/lib/api';
import type { JobResult } from '@/lib/types';

export function useJobPoller(jobId: string | null) {
  const [result, setResult] = useState<JobResult | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setResult(null);

    const poll = async () => {
      try {
        const data = await getJob(jobId);
        setResult(data);
        if (data.status === 'complete' || data.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId]);

  return result;
}
