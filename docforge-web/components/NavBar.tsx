'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-sm tracking-wide">
          DocForge
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/#install" className="text-white/60 hover:text-white transition-colors">
            Install
          </Link>
          <Link href="/generate" className="text-white/60 hover:text-white transition-colors">
            Generate
          </Link>

          {loading ? null : user ? (
            <>
              <Link href="/settings" className="text-white/60 hover:text-white transition-colors">
                Settings
              </Link>
              <button
                onClick={logout}
                className="text-white/40 hover:text-white/70 transition-colors text-xs"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-white/60 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-medium"
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
