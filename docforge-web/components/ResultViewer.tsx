'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  output: string;
  library: string;
  version: string;
}

export function ResultViewer({ output, library, version }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${library}-${version}.context.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-semibold">{library}</span>
          {version && <Badge variant="secondary">{version}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied
              ? <><CheckCircle className="w-4 h-4 mr-1 text-green-500" />Copied!</>
              : <><Copy className="w-4 h-4 mr-1" />Copy</>}
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="w-4 h-4 mr-1" />Download
          </Button>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-muted/30 max-h-[500px] overflow-auto prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
      </div>
    </div>
  );
}
