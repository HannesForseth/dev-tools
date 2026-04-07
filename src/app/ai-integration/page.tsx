import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Zap, Code, Shield, ArrowRight, Sparkles, Globe, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Integration API — Connect LLMs & AI Agents to 37 Tools",
  description:
    "The only tool API built for AI agents. Let Claude, ChatGPT, and custom LLMs use 23 endpoints — hash, Base64, OCR, background removal, speech-to-text, image generation and more. 3 free requests/day, no signup.",
  alternates: { canonical: "https://allkit.dev/ai-integration" },
  openGraph: {
    title: "AllKit AI Integration — API for LLMs & AI Agents",
    description:
      "23 REST API endpoints designed for AI tool-use. Background removal, OCR, speech-to-text, image generation — all callable by your AI agent.",
    url: "https://allkit.dev/ai-integration",
  },
};

const useCases = [
  {
    icon: Bot,
    title: "Claude Code & MCP",
    description:
      "Claude Code can call AllKit endpoints via tool-use. Hash a file, decode a JWT, remove a background — all inside your coding session.",
    code: `curl -X POST https://allkit.dev/api/v1/hash \\
  -H "Content-Type: application/json" \\
  -d '{"text": "verify this content"}'`,
  },
  {
    icon: Sparkles,
    title: "ChatGPT & Custom GPTs",
    description:
      "Build a Custom GPT that calls AllKit to process images, transcribe audio, or generate QR codes for users — no backend needed.",
    code: `// OpenAI function calling schema
{
  "name": "remove_background",
  "url": "https://allkit.dev/api/v1/ai/remove-background",
  "method": "POST",
  "body": { "image": "<base64>" }
}`,
  },
  {
    icon: Code,
    title: "AI Agent Frameworks",
    description:
      "LangChain, CrewAI, AutoGen, Vercel AI SDK — any agent framework that supports HTTP tools can use AllKit in seconds.",
    code: `# Python — any HTTP client works
import requests

r = requests.post(
    "https://allkit.dev/api/v1/ai/speech-to-text",
    json={"audio": base64_audio, "task": "transcribe"}
)
print(r.json()["result"])`,
  },
  {
    icon: Globe,
    title: "Perplexity, Copilot & Others",
    description:
      "Any LLM that discovers tools via /llms.txt can find AllKit automatically and call endpoints on behalf of users.",
    code: `# AllKit is discoverable at:
https://allkit.dev/llms.txt

# Machine-readable inventory of all 37 tools
# with exact API calls and parameters`,
  },
];

const endpoints = [
  { category: "Developer Tools", color: "text-green-500", items: [
    { method: "POST", path: "/api/v1/hash", desc: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes" },
    { method: "POST", path: "/api/v1/base64", desc: "Encode/decode Base64" },
    { method: "POST", path: "/api/v1/json-format", desc: "Format, validate, minify JSON" },
    { method: "GET", path: "/api/v1/uuid", desc: "Generate UUIDs (v4)" },
    { method: "POST", path: "/api/v1/jwt-decode", desc: "Decode JWT tokens" },
    { method: "POST", path: "/api/v1/url-encode", desc: "URL encode/decode" },
    { method: "POST", path: "/api/v1/timestamp", desc: "Unix timestamp conversion" },
    { method: "POST", path: "/api/v1/csv-json", desc: "CSV to JSON conversion" },
    { method: "GET", path: "/api/v1/password", desc: "Generate secure passwords" },
    { method: "POST", path: "/api/v1/word-count", desc: "Count words, chars, sentences" },
  ]},
  { category: "AI Media & Processing", color: "text-purple-500", items: [
    { method: "POST", path: "/api/v1/ai/remove-background", desc: "Remove image backgrounds" },
    { method: "POST", path: "/api/v1/ai/ocr", desc: "Extract text from images (OCR)" },
    { method: "POST", path: "/api/v1/ai/generate-image", desc: "Generate images from prompts" },
    { method: "POST", path: "/api/v1/ai/upscale", desc: "AI image upscaling & enhancement" },
    { method: "POST", path: "/api/v1/ai/face-swap", desc: "Swap faces between photos" },
    { method: "POST", path: "/api/v1/ai/tts", desc: "Text to speech (natural voice)" },
    { method: "POST", path: "/api/v1/ai/speech-to-text", desc: "Transcribe audio (Whisper)" },
    { method: "POST", path: "/api/v1/ai/voice-clone", desc: "Clone a voice from sample" },
    { method: "POST", path: "/api/v1/ai/live-portrait", desc: "Animate photos with video" },
    { method: "POST", path: "/api/v1/ai/image-to-video", desc: "Generate video from image" },
  ]},
  { category: "AI Smart Tools", color: "text-blue-500", items: [
    { method: "POST", path: "/api/v1/ai/regex", desc: "Natural language to regex" },
    { method: "POST", path: "/api/v1/ai/cron", desc: "Natural language to cron expression" },
    { method: "POST", path: "/api/v1/ai/privacy-policy", desc: "Generate privacy policies" },
  ]},
];

export default function AiIntegrationPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
          <Bot className="h-4 w-4" />
          Built for AI agents
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          The API that gives your AI superpowers
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          23 REST endpoints your LLM can call right now. Hash data, decode JWTs, remove backgrounds,
          transcribe audio, generate images — all with a single HTTP request. No SDK, no signup, no API key required for free tier.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            API Documentation
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/llms.txt"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Bot className="h-4 w-4" />
            View /llms.txt
          </a>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Pricing — $9/mo unlimited
          </Link>
        </div>
      </section>

      {/* Why this matters */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Why AI agents need a tool API</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-6 space-y-3">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h3 className="font-semibold">LLMs can&apos;t process media</h3>
            <p className="text-sm text-muted-foreground">
              Your AI can&apos;t hash a string, decode a JWT, or remove an image background natively.
              AllKit gives it those capabilities via simple API calls.
            </p>
          </div>
          <div className="rounded-xl border border-border p-6 space-y-3">
            <Shield className="h-8 w-8 text-green-500" />
            <h3 className="font-semibold">Zero infrastructure</h3>
            <p className="text-sm text-muted-foreground">
              No servers to deploy, no GPU to rent, no models to host. Just HTTP POST with JSON.
              Works from any language, any framework, any platform.
            </p>
          </div>
          <div className="rounded-xl border border-border p-6 space-y-3">
            <Lock className="h-8 w-8 text-blue-500" />
            <h3 className="font-semibold">Discoverable by design</h3>
            <p className="text-sm text-muted-foreground">
              Our <code className="text-xs bg-muted px-1 py-0.5 rounded">/llms.txt</code> file lets AI agents
              discover all 37 tools automatically. No manual configuration needed.
            </p>
          </div>
        </div>
      </section>

      {/* Use cases with code */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Works with every AI platform</h2>
        <div className="space-y-8">
          {useCases.map((uc) => (
            <div key={uc.title} className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30">
                <uc.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{uc.title}</h3>
              </div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">{uc.description}</p>
                </div>
                <div className="p-4 bg-muted/20">
                  <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">{uc.code}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All endpoints */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-2 text-center">23 endpoints, one base URL</h2>
        <p className="text-center text-muted-foreground mb-8">
          <code className="text-sm bg-muted px-2 py-1 rounded">https://allkit.dev/api/v1</code>
        </p>
        <div className="space-y-8">
          {endpoints.map((group) => (
            <div key={group.category}>
              <h3 className={`font-semibold mb-3 ${group.color}`}>{group.category}</h3>
              <div className="rounded-lg border border-border divide-y divide-border">
                {group.items.map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === "GET" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"
                    }`}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-xs flex-1">{ep.path}</code>
                    <span className="text-muted-foreground text-xs hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center mb-16">
        <h2 className="text-2xl font-bold mb-2">Start free, scale when ready</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          3 API requests per day — free, no signup, no API key. When your agent needs more,
          upgrade to Pro for unlimited access at $9/month.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get unlimited API access — $9/mo
          </Link>
          <Link
            href="/api-docs"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Read the docs
          </Link>
        </div>
      </section>

      {/* SEO content */}
      <section className="prose prose-zinc dark:prose-invert max-w-none">
        <h2>What is an AI Tool-Use API?</h2>
        <p>
          AI tool-use (also called function calling) is how modern LLMs interact with the real world.
          When ChatGPT, Claude, or any AI assistant needs to perform a task it can&apos;t do natively — like
          generating a hash, removing an image background, or transcribing audio — it calls an external
          API. AllKit provides that API.
        </p>
        <p>
          Unlike traditional APIs that are designed for human developers to integrate into applications,
          AllKit&apos;s API is specifically designed for machine consumption. Every endpoint follows
          consistent patterns: JSON in, JSON out. Every response includes clear error messages that
          an LLM can interpret and communicate to the user. And our{" "}
          <a href="/llms.txt">/llms.txt</a> file provides a machine-readable inventory of every tool
          and endpoint, so AI agents can discover capabilities automatically.
        </p>

        <h2>How LLMs Discover and Use AllKit</h2>
        <p>
          The <a href="/llms.txt">/llms.txt</a> standard is an emerging convention (similar to robots.txt)
          that tells AI agents what a website can do for them. When an LLM encounters a task it needs
          help with, it can check /llms.txt to find relevant tools. AllKit&apos;s llms.txt lists all 37 tools
          with exact API endpoints, request formats, and descriptions — everything an AI needs to
          make the right call.
        </p>
        <p>
          This is particularly powerful for AI coding assistants like Claude Code. When a developer asks
          &quot;hash this string with SHA-256&quot; or &quot;decode this JWT&quot;, the assistant can call AllKit&apos;s API
          directly instead of writing code to do it. For image tasks like background removal or OCR,
          the value is even clearer — these require ML models that no coding assistant has built in.
        </p>

        <h2>Supported AI Platforms</h2>
        <p>
          AllKit works with any system that can make HTTP requests. This includes OpenAI&apos;s function
          calling (Custom GPTs, Assistants API), Anthropic&apos;s tool use (Claude, Claude Code),
          Google&apos;s Gemini tools, and every agent framework: LangChain, CrewAI, AutoGen, Semantic
          Kernel, Vercel AI SDK, and more. If your agent can call a URL, it can use AllKit.
        </p>

        <h2>Why AllKit vs. Building Your Own</h2>
        <p>
          You could deploy your own hash function, your own OCR model, your own background remover.
          But that means managing servers, GPU instances, model updates, scaling, and monitoring.
          AllKit handles all of that. One API, 23 endpoints, zero infrastructure. Your agent calls
          the endpoint, gets the result, moves on.
        </p>
        <p>
          For AI media tools specifically (background removal, image generation, speech-to-text,
          voice cloning), the infrastructure cost of running GPU models is significant. AllKit
          absorbs that cost in the free tier and offers unlimited access at $9/month — a fraction
          of what it would cost to run these models yourself.
        </p>

        <h3>No Other Tool Site Offers This</h3>
        <p>
          We checked every major competitor: iLovePDF, TinyWow, FreeConvert, IT-Tools, SmallDev.tools,
          Transform.tools. None of them have a public API designed for LLM tool-use. None have
          /llms.txt. None have endpoints that an AI agent can call. AllKit is the only tool platform
          built from the ground up for the AI-native era.
        </p>
      </section>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebAPI",
            name: "AllKit API",
            description: "REST API with 23 endpoints for developer tools and AI media processing. Designed for LLM tool-use and AI agent integration.",
            url: "https://allkit.dev/ai-integration",
            documentation: "https://allkit.dev/api-docs",
            provider: {
              "@type": "Organization",
              name: "AllKit",
              url: "https://allkit.dev",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "3 free API requests per day, no signup required",
            },
          }),
        }}
      />
    </div>
  );
}
