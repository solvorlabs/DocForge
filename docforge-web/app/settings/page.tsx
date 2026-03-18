'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateKeys, getMe } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const router = useRouter();
  const { token, user, setAuth, logout } = useAuth();
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token || !user) {
    router.replace('/auth/login');
    return null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!geminiKey && !groqKey) {
      setError('Enter at least one key to update.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateKeys(token!, geminiKey || undefined, groqKey || undefined);
      const profile = await getMe(token!);
      setAuth(token!, profile);
      setSaved(true);
      setGeminiKey('');
      setGroqKey('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save keys');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-16">
      <div className="max-w-lg mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-white/50 text-sm">{user.email}</p>
        </div>

        {/* API Key status */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-medium">API Keys</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Gemini API Key</span>
              <span className={user.has_gemini_key ? 'text-green-400' : 'text-white/30'}>
                {user.has_gemini_key ? '✓ Set' : '✗ Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Groq API Key</span>
              <span className={user.has_groq_key ? 'text-green-400' : 'text-white/30'}>
                {user.has_groq_key ? '✓ Set' : '✗ Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Update keys */}
        <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-medium">Update API Keys</h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {saved && (
            <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              Keys saved successfully.
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Gemini API Key</label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">Get free key →</a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-sm font-mono"
              placeholder="Leave blank to keep current key"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Groq API Key</label>
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">Get free key →</a>
            </div>
            <input
              type="password"
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-sm font-mono"
              placeholder="Leave blank to keep current key"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Saving…' : 'Save keys'}
          </button>
        </form>

        {/* Danger zone */}
        <div className="border border-red-500/20 rounded-xl p-6 space-y-3">
          <h2 className="text-white font-medium">Sign out</h2>
          <p className="text-white/40 text-sm">Signs out of this browser session. Your account and keys are preserved.</p>
          <button
            onClick={logout}
            className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 rounded-lg px-4 py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
