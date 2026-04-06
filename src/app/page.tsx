import Link from "next/link";
import { tools } from "@/lib/tools/registry";
import { Lock, Zap, Globe, Sparkles } from "lucide-react";
import { ToolGrid } from "@/components/home/tool-grid";

export default function Home() {
  const toolCount = tools.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <section className="mb-10 text-center">
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
      </section>

      {/* Search + Filter + Tool Grid (Client Component) */}
      <ToolGrid />

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
