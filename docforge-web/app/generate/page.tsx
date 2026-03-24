'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2 } from 'lucide-react';
import { GenerateForm } from '@/components/GenerateForm';
import { JobStatus } from '@/components/JobStatus';
import { useAuth } from '@/lib/auth-context';
import { InteractiveCard } from '@/components/effects/InteractiveCard';

export default function GeneratePage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [jobId, setJobId] = useState<string | null>(null);
  const [library, setLibrary] = useState('');

  useEffect(() => {
    if (!token || !user) {
      router.replace('/auth/login');
      return;
    }

    if (!user.has_gemini_key) {
      router.replace('/settings');
    }
  }, [token, user, router]);

  if (!token || !user || !user.has_gemini_key) return null;

  const handleJobCreated = (id: string, lib: string) => {
    setJobId(id);
    setLibrary(lib);
  };

  return (
    <main className="rb-shell min-h-screen bg-transparent pt-10">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-2 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Code2 className="w-6 h-6 text-blue-500" />
          DocForge
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center">
          <h1 className="rb-heading text-3xl font-bold mb-3">Generate Context File</h1>
          <p className="text-muted-foreground text-white/70">
            Enter a library name, URL, GitHub repo, or paste documentation
          </p>
        </div>

        <InteractiveCard>
          <section className="rb-glass p-6 rounded-2xl">
            <GenerateForm onJobCreated={handleJobCreated} />
          </section>
        </InteractiveCard>

        {jobId && (
          <InteractiveCard>
            <div className="rb-glass border rounded-2xl p-6">
              <JobStatus jobId={jobId} library={library} />
            </div>
          </InteractiveCard>
        )}
      </div>
    </main>
  );
}
