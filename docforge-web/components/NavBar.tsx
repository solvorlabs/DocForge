'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#040a13]/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-sm tracking-[0.18em] uppercase">
          DocForge
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <Link href="/#install" className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors">
            Install
          </Link>
          <Link href="/generate" className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors">
            Generate
          </Link>

          {loading ? null : user ? (
            <>
              <Link href="/settings" className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors">
                Settings
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg text-white/45 hover:text-white/80 hover:bg-white/[0.08] transition-colors text-xs"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rb-button bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl transition-colors text-xs font-medium shadow-[0_10px_28px_rgba(42,153,255,0.35)]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
