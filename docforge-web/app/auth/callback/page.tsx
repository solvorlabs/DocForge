'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMe } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      router.replace(`/auth/login?error=${encodeURIComponent(error)}`);
      return;
    }
    if (!token) {
      router.replace('/auth/login?error=Missing+token');
      return;
    }

    getMe(token)
      .then(profile => {
        setAuth(token, profile);
        router.replace('/generate');
      })
      .catch(() => {
        router.replace('/auth/login?error=Session+setup+failed');
      });
  }, [params, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <p className="text-white/40 text-sm animate-pulse">Completing sign-in…</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white/40 text-sm animate-pulse">Loading…</p>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
