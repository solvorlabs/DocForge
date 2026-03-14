'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Code2 } from 'lucide-react';
import { GenerateForm } from '@/components/GenerateForm';
import { JobStatus } from '@/components/JobStatus';

export default function GeneratePage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [library, setLibrary] = useState('');

  const handleJobCreated = (id: string, lib: string) => {
    setJobId(id);
    setLibrary(lib);
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex items-center gap-2 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Code2 className="w-6 h-6 text-blue-500" />
          DocForge
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Generate Context File</h1>
          <p className="text-muted-foreground">
            Enter a library name, URL, GitHub repo, or paste documentation
          </p>
        </div>

        <GenerateForm onJobCreated={handleJobCreated} />

        {jobId && (
          <div className="border rounded-xl p-6">
            <JobStatus jobId={jobId} library={library} />
          </div>
        )}
      </div>
    </main>
  );
}
