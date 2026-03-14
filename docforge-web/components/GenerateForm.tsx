'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createJob } from '@/lib/api';
import { Package, Globe, Github, FileText, Box, Loader2 } from 'lucide-react';

interface Props {
  onJobCreated: (jobId: string, library: string) => void;
}

export function GenerateForm({ onJobCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('npm');
  const [inputs, setInputs] = useState({ npm: '', pypi: '', url: '', github: '', paste: '' });

  const setInput = (tab: string, value: string) =>
    setInputs(prev => ({ ...prev, [tab]: value }));

  const handleSubmit = async () => {
    const input = inputs[activeTab as keyof typeof inputs].trim();
    if (!input) { setError('Please enter a value'); return; }
    setLoading(true);
    setError('');
    try {
      const { job_id } = await createJob(input, activeTab);
      onJobCreated(job_id, input);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="npm" className="flex items-center gap-1"><Package className="w-3 h-3" />npm</TabsTrigger>
          <TabsTrigger value="pypi" className="flex items-center gap-1"><Box className="w-3 h-3" />PyPI</TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-1"><Globe className="w-3 h-3" />URL</TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-1"><Github className="w-3 h-3" />GitHub</TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-1"><FileText className="w-3 h-3" />Paste</TabsTrigger>
        </TabsList>
        <TabsContent value="npm">
          <Input placeholder="react-bits@2.1.4  or  @tanstack/react-query@5.0.0" value={inputs.npm}
            onChange={e => setInput('npm', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </TabsContent>
        <TabsContent value="pypi">
          <Input placeholder="fastapi==0.110.0  or  langchain" value={inputs.pypi}
            onChange={e => setInput('pypi', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </TabsContent>
        <TabsContent value="url">
          <Input placeholder="https://docs.example.com" value={inputs.url}
            onChange={e => setInput('url', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </TabsContent>
        <TabsContent value="github">
          <Input placeholder="https://github.com/owner/repo" value={inputs.github}
            onChange={e => setInput('github', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </TabsContent>
        <TabsContent value="paste">
          <Textarea placeholder="Paste raw HTML, Markdown, or documentation text here..."
            value={inputs.paste} onChange={e => setInput('paste', e.target.value)}
            className="h-40" />
        </TabsContent>
      </Tabs>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4" size="lg">
        {loading
          ? <><Loader2 className="animate-spin w-4 h-4 mr-2" />Starting...</>
          : 'Generate Context File'}
      </Button>
    </div>
  );
}
