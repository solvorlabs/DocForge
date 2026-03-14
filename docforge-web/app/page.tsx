import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Lock, Brain, Code2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="w-6 h-6 text-blue-500" />
          DocForge
        </div>
        <div className="flex items-center gap-4">
          <Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Generate
          </Link>
          <Button asChild size="sm">
            <Link href="/generate">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <Badge variant="outline" className="mb-4">Version-Aware AI Context</Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Stop letting AI guess<br />your library&apos;s API
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          DocForge turns any library&apos;s documentation into a prompt-ready context file,
          pinned to the exact version you&apos;re using. No more hallucinated APIs.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/generate">
              Generate Context File <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: 'Version Pinned', desc: 'Pinned to react-bits@2.1.4, not whatever the AI was trained on in 2023.' },
            { icon: Brain, title: 'Gotcha Extraction', desc: 'Hunts for "use client" requirements, deprecated APIs, and breaking changes between versions.' },
            { icon: Zap, title: 'Works Everywhere', desc: 'Output to .context.md, MCP server, or VS Code extension — drop it into Cursor or Claude.' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <Icon className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Input', desc: 'Enter a package name, URL, GitHub repo, or paste docs' },
              { step: '2', title: 'Crawl', desc: 'Playwright crawls the documentation site intelligently' },
              { step: '3', title: 'Structure', desc: 'AI extracts components, props, gotchas, and install commands' },
              { step: '4', title: 'Context', desc: 'Get a .context.md file ready for Cursor, Claude, or Copilot' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center mx-auto mb-3">{step}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to fix your AI context?</h2>
          <p className="text-muted-foreground mb-8">Takes 30–90 seconds. Free to use.</p>
          <Button asChild size="lg">
            <Link href="/generate">Generate your first context file <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        DocForge — Version-aware AI context for developers
      </footer>
    </main>
  );
}
