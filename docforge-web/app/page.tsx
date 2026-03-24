import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InteractiveCard } from '@/components/effects/InteractiveCard';
import { MarqueeRow } from '@/components/effects/MarqueeRow';
import {
  Zap, Lock, Brain, ArrowRight, Terminal, Cpu, Globe, Code2,
  CheckCircle2, Package, BookOpen, Puzzle, Sparkles,
} from 'lucide-react';

const Beams = dynamic(() => import('@/components/Beams'), { ssr: false });

// ── Inline code block ─────────────────────────────────────────────────────────
function CodeBlock({ children, lang = '' }: { children: string; lang?: string }) {
  return (
    <div className="relative rounded-lg bg-white/5 border border-white/10 text-sm font-mono overflow-x-auto">
      {lang && (
        <span className="absolute top-2 right-3 text-[10px] text-white/30 uppercase tracking-widest select-none">
          {lang}
        </span>
      )}
      <pre className="p-4 text-white/80 whitespace-pre leading-relaxed">{children.trim()}</pre>
    </div>
  );
}

export default function Home() {
  const registries = [
    'npm', 'PyPI', 'crates.io', 'RubyGems', 'pub.dev',
    'NuGet', 'Maven', 'Hex (Elixir)', 'CRAN (R)',
    'GitHub repo', 'Any URL',
  ];

  return (
    <main className="rb-shell min-h-screen bg-transparent text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <Beams
            beamWidth={0.3}
            beamHeight={25}
            beamNumber={20}
            lightColor="#4f8ef7"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-cyan-200/25 text-cyan-100/80 bg-cyan-300/10 backdrop-blur-md">
            <Sparkles className="mr-2 h-3 w-3" /> Version-Aware AI Context for Developers
          </Badge>
          <h1 className="rb-heading text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.06]">
            Stop letting AI guess<br />your library&apos;s API
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            DocForge turns any library&apos;s documentation into a prompt-ready <code className="text-blue-400 font-mono text-base">.context.md</code> file,
            pinned to the exact version you&apos;re using. No more hallucinated APIs.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8">
              <Link href="/generate">
                Try it in the browser <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-8">
              <Link href="#install">Install the CLI</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Three pillars ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: 'Version Pinned',
              desc: 'Pinned to react-bits@2.1.4, not whatever the AI was trained on in 2023.',
            },
            {
              icon: Brain,
              title: 'Gotcha Extraction',
              desc: 'Surfaces "use client" requirements, deprecated APIs, and breaking changes.',
            },
            {
              icon: Zap,
              title: 'Works Everywhere',
              desc: 'Web app, CLI, MCP server, or VS Code extension — drop the result into Cursor or Claude.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <InteractiveCard key={title}>
              <Card className="rb-glass text-white h-full">
                <CardContent className="pt-6">
                  <Icon className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-white/60">{desc}</p>
                </CardContent>
              </Card>
            </InteractiveCard>
          ))}
        </div>
      </section>

      {/* ── Supported registries ──────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-14">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-6">
            Works with any registry or source
          </p>
          <MarqueeRow items={registries} />
        </div>
      </section>

      {/* ── Install / Products ────────────────────────────────────────────── */}
      <section id="install" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="rb-heading text-3xl font-bold text-center mb-3">Get DocForge</h2>
        <p className="text-center text-white/40 mb-14 text-sm">
          Four ways to use DocForge — pick whichever fits your workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Web */}
          <InteractiveCard>
          <Card className="rb-glass text-white flex flex-col h-full">
            <CardContent className="pt-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Web App</h3>
                  <p className="text-xs text-white/40">No install required</p>
                </div>
              </div>
              <p className="text-sm text-white/50">
                Open DocForge in your browser, enter any package name or URL, and download
                the <code className="text-blue-400 font-mono">.context.md</code> instantly.
              </p>
              <div className="mt-auto">
                <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                  <Link href="/generate">Open Web App <ArrowRight className="ml-2 w-3 h-3" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          </InteractiveCard>

          {/* CLI */}
          <InteractiveCard>
          <Card className="rb-glass text-white flex flex-col h-full">
            <CardContent className="pt-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">CLI — <code className="font-mono text-green-400">dcf</code></h3>
                  <p className="text-xs text-white/40">npm · Node ≥ 18</p>
                </div>
              </div>
              <p className="text-sm text-white/50">
                Run <code className="text-green-400 font-mono">dcf</code> from your project directory.
                Appends the context file directly to your repo so every AI tool picks it up automatically.
              </p>
              <CodeBlock lang="bash">{`npm install -g docforge-cli

# then, inside any project:
dcf react@18
dcf fastapi==0.115
dcf https://reactbits.dev/`}</CodeBlock>
              <div className="mt-auto">
                <a
                  href="https://www.npmjs.com/package/docforge-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <Package className="w-3 h-3" /> npmjs.com/package/docforge-cli
                </a>
              </div>
            </CardContent>
          </Card>
          </InteractiveCard>

          {/* MCP */}
          <InteractiveCard>
          <Card className="rb-glass text-white flex flex-col h-full">
            <CardContent className="pt-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">MCP Server</h3>
                  <p className="text-xs text-white/40">Claude Desktop · Cursor · Windsurf</p>
                </div>
              </div>
              <p className="text-sm text-white/50">
                Let the AI call DocForge <em>automatically</em> mid-conversation. No manual trigger — the
                assistant detects it needs fresh docs and fetches them on its own.
              </p>
              <CodeBlock lang="json">{`// ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "docforge": {
      "command": "python",
      "args": ["/path/to/docforge-mcp/server.py"],
      "env": {
        "DOCFORGE_BACKEND_URL": "https://api.docforge.dev"
      }
    }
  }
}`}</CodeBlock>
              <div className="mt-auto">
                <a
                  href="https://github.com/solvorlabs/docforge/tree/main/docforge-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <BookOpen className="w-3 h-3" /> MCP setup guide on GitHub
                </a>
              </div>
            </CardContent>
          </Card>
          </InteractiveCard>

          {/* VS Code */}
          <InteractiveCard>
          <Card className="rb-glass text-white flex flex-col h-full">
            <CardContent className="pt-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold">VS Code Extension</h3>
                  <p className="text-xs text-white/40">Works with Cursor too</p>
                </div>
              </div>
              <p className="text-sm text-white/50">
                Generate context files without leaving your editor. Right-click any file or use
                the command palette — the <code className="text-cyan-400 font-mono">.context.md</code> drops
                straight into your workspace.
              </p>
              <CodeBlock lang="bash">{`# Install from the VS Code Marketplace
ext install docforge

# Or install the .vsix directly:
code --install-extension docforge-1.0.0.vsix`}</CodeBlock>
              <div className="mt-auto">
                <a
                  href="https://github.com/solvorlabs/docforge/tree/main/docforge-vscode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <Puzzle className="w-3 h-3" /> Extension source on GitHub
                </a>
              </div>
            </CardContent>
          </Card>
          </InteractiveCard>

        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="rb-heading text-3xl font-bold text-center mb-3">How it works</h2>
          <p className="text-center text-white/40 mb-14 text-sm">From URL to usable context in under 90 seconds</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Input anything',
                desc: 'Package name, version, GitHub URL, docs URL, or paste raw docs.',
              },
              {
                step: '2',
                title: 'Smart crawl',
                desc: 'Playwright fetches JS-rendered sites. GitHub repos are ingested directly. Copy-paste libraries (shadcn, react-bits) are detected automatically.',
              },
              {
                step: '3',
                title: 'AI structuring',
                desc: 'Gemini extracts install commands, imports, props, usage examples, and common gotchas.',
              },
              {
                step: '4',
                title: 'Ready to use',
                desc: 'A .context.md file ready to drop into Cursor, Claude, Copilot, or any AI coding tool.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm">
                  {step}
                </div>
                <h3 className="font-semibold mb-2 text-sm">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Usage examples ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="rb-heading text-3xl font-bold text-center mb-3">Works with everything</h2>
        <p className="text-center text-white/40 mb-12 text-sm">
          DocForge resolves the right documentation regardless of input format
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="bash">{`# npm packages
dcf react@18
dcf @tanstack/react-query@5
dcf @radix-ui/react-dialog

# PyPI
dcf fastapi==0.115
dcf pandas==2.2

# Other registries
dcf crates:serde@1.0
dcf gem:rails@7.1
dcf pub:flutter_bloc@8
dcf nuget:Newtonsoft.Json@13
dcf mvn:com.google.guava:guava@32`}</CodeBlock>

          <CodeBlock lang="bash">{`# GitHub repos (fetches README + docs)
dcf github.com/vercel/next.js
dcf github.com/shadcn-ui/ui

# Any docs URL
dcf https://docs.stripe.com
dcf https://reactbits.dev/

# Copy-paste / shadcn-style libraries
# (auto-detected — no npm package needed)
dcf react-bits
dcf magicui
dcf shadcn/ui`}</CodeBlock>
        </div>
      </section>

      {/* ── Why DocForge ──────────────────────────────────────────────────── */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="rb-heading text-3xl font-bold text-center mb-12">Why developers use it</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'AI tools like Cursor and Claude have a training cutoff — they don\'t know about library updates from the past year.',
              'Pasting entire documentation pages into the context window is wasteful and unreliable.',
              'DocForge distils only what matters: install command, imports, props, usage, and breaking changes.',
              'Copy-paste libraries (shadcn, react-bits, magicui) aren\'t on npm — DocForge detects and handles them automatically.',
              'One `.context.md` file in your repo means every AI session has accurate, version-pinned knowledge.',
              'Works with 11 package registries and any URL — so no library is left behind.',
            ].map((point, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-sm text-white/60 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="rb-heading text-3xl font-bold mb-4">Ready to fix your AI context?</h2>
          <p className="text-white/40 mb-3 text-sm">
            Takes 30–90 seconds. Bring your own Gemini or Groq key.
          </p>
          <p className="text-white/25 mb-10 text-xs font-mono">
            npm install -g docforge-cli
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Link href="/generate">
                Try in browser <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/20 text-white hover:bg-white/10 bg-white/5">
              <a href="https://github.com/solvorlabs/docforge" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <span>DocForge — Version-aware AI context for developers</span>
          <div className="flex gap-6">
            <a href="https://github.com/solvorlabs/docforge" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/docforge-cli" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">npm</a>
            <Link href="/generate" className="hover:text-white/50 transition-colors">Web App</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
