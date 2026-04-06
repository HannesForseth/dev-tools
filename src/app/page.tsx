import Link from "next/link";
import { tools, categoryLabels, type ToolCategory } from "@/lib/tools/registry";
import {
  Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles,
  Clock, Hash, Palette, Type, Volume2, QrCode, GitCompareArrows, KeyRound,
  FileText, ImageDown, ShieldCheck, Link as LinkIcon, FileSpreadsheet,
  FileCode, FileJson, Code, Paintbrush, Zap, Lock, Globe, Search,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles,
  Clock, Hash, Palette, Type, Volume2, QrCode, GitCompareArrows, KeyRound,
  FileText, ImageDown, ShieldCheck, Link: LinkIcon, FileSpreadsheet,
  FileCode, FileJson, Code, Paintbrush,
};

const categoryOrder: ToolCategory[] = ["dev", "media", "ai"];

function ToolCard({ tool }: { tool: typeof tools[number] }) {
  const Icon = iconMap[tool.icon];
  const tierBadge = tool.costTier === "claude" || tool.costTier === "huggingface" ? "AI" : null;

  return (
    <Link
      href={`/tools/${tool.category}/${tool.slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
        </div>
        {tool.isNew && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success">
            New
          </span>
        )}
        {tierBadge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {tierBadge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
    </Link>
  );
}

export default function Home() {
  const toolCount = tools.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          {toolCount} Free Developer & AI Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Fast, beautiful, and AI-powered tools for developers and creators.
          No signup. No ads. No data collection. Your data stays in your browser.
        </p>

        {/* Value props */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-green-500" />
            <span>100% Private</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Instant Results</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-blue-500" />
            <span>Works Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>AI-Powered</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/tools/dev/json-formatter" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">JSON Formatter</Link>
          <Link href="/tools/media/background-remover" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Background Remover</Link>
          <Link href="/tools/dev/base64" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Base64 Decode</Link>
          <Link href="/tools/dev/hash-generator" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Hash Generator</Link>
          <Link href="/tools/media/ai-image-generator" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">AI Image Generator</Link>
        </div>
      </section>

      {/* Tool categories */}
      {categoryOrder.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat);
        if (catTools.length === 0) return null;
        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{categoryLabels[cat]}</h2>
              <Link href={`/tools/${cat}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Pro CTA */}
      <section className="mt-8 mb-12 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Unlock Unlimited AI Power</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Free users get 3 AI requests per day. Upgrade to Pro for unlimited AI tools,
          HD media output, API access, and priority processing.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Upgrade to Pro — $9/mo
          </Link>
          <Link
            href="/api-docs"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            API Documentation
          </Link>
        </div>
      </section>

      {/* SEO content */}
      <section className="prose prose-zinc dark:prose-invert max-w-none">
        <h2>What is AllKit?</h2>
        <p>
          AllKit is a free collection of {toolCount} online tools for developers, designers, and creators.
          Every tool is designed to be fast, private, and easy to use. Most tools run entirely in your browser —
          your data is never uploaded to any server.
        </p>
        <p>
          Unlike other tool sites, AllKit has no ads, no tracking cookies, and no annoying popups.
          Just clean, fast tools that get the job done. Our AI-powered tools use state-of-the-art models
          to deliver results that previously required expensive software or manual work.
        </p>
        <h3>Developer Tools</h3>
        <p>
          Format JSON, generate UUIDs, encode Base64, test regex patterns, decode JWTs, convert timestamps,
          generate secure passwords, and more. All client-side, all free, all instant.
        </p>
        <h3>AI Media Tools</h3>
        <p>
          Remove image backgrounds, extract text from images with OCR, generate AI images from text prompts,
          convert text to natural speech, and compress images — all powered by open-source AI models
          running on Hugging Face.
        </p>
        <h3>REST API</h3>
        <p>
          Every tool is also available via our <Link href="/api-docs">REST API</Link> for programmatic access.
          Perfect for automation, CI/CD pipelines, and integration with AI agents. 3 free requests per day,
          unlimited with <Link href="/pricing">Pro</Link>.
        </p>
      </section>
    </div>
  );
}
