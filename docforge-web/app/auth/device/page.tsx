'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deviceVerify } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function DevicePage() {
  const { token, user } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      await deviceVerify(token, code.toUpperCase().trim());
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center space-y-4">
          <p className="text-white/60">You need to be signed in to confirm a device.</p>
          <Link
            href={`/auth/login?next=/auth/device`}
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">✓</div>
          <h1 className="text-2xl font-bold text-white">Device connected!</h1>
          <p className="text-white/50 text-sm">You can close this tab and return to your terminal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Confirm device</h1>
          <p className="mt-2 text-white/50 text-sm">
            Signed in as <span className="text-white/80">{user.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-8">
          {status === 'error' && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-white/70">Enter the code shown in your terminal</label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-center text-xl font-mono tracking-widest uppercase"
              placeholder="XXXX-XXXX"
              maxLength={9}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 9}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Confirming…' : 'Confirm device'}
          </button>
        </form>
      </div>
    </div>
  );
}
