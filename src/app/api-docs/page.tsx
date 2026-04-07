import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "AllKit REST API documentation. Programmatic access to developer tools: hash generation, Base64, URL encoding, JSON formatting, UUID, timestamps, and more.",
  alternates: {
    canonical: "https://allkit.dev/api-docs",
  },
};

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/hash",
    description: "Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-384, SHA-512)",
    body: '{ "text": "hello world" }',
    optional: 'algorithm: "sha256" (default: all)',
  },
  {
    method: "POST",
    path: "/api/v1/base64",
    description: "Encode or decode Base64 strings",
    body: '{ "text": "hello", "mode": "encode" }',
    optional: 'mode: "encode" | "decode" (default: encode)',
  },
  {
    method: "POST",
    path: "/api/v1/url-encode",
    description: "URL encode or decode strings",
    body: '{ "text": "hello world", "mode": "encode" }',
    optional: 'mode: "encode"|"decode", type: "component"|"full"',
  },
  {
    method: "POST",
    path: "/api/v1/json-format",
    description: "Format, validate, or minify JSON",
    body: '{ "json": "{\\"key\\":\\"value\\"}" }',
    optional: "indent: 2 (number), minify: true",
  },
  {
    method: "GET",
    path: "/api/v1/uuid",
    description: "Generate cryptographically secure UUIDs (v4)",
    body: null,
    optional: "?count=5 (max 100)",
  },
  {
    method: "GET",
    path: "/api/v1/password",
    description: "Generate secure random passwords",
    body: null,
    optional: "?length=20&count=5&symbols=false",
  },
  {
    method: "POST",
    path: "/api/v1/timestamp",
    description: "Convert Unix timestamps to dates and vice versa",
    body: '{ "timestamp": 1700000000 }',
    optional: 'Or: { "date": "2024-01-15T10:30:00Z" }. GET for current time.',
  },
  {
    method: "POST",
    path: "/api/v1/word-count",
    description: "Count words, characters, sentences, reading time",
    body: '{ "text": "Your text here..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/jwt-decode",
    description: "Decode and inspect JSON Web Tokens",
    body: '{ "token": "eyJhbGciOi..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/csv-json",
    description: "Convert between CSV and JSON formats",
    body: '{ "csv": "name,age\\nJohn,30" }',
    optional: 'Or: { "json": [...] }. delimiter: ","',
  },
];

const aiEndpoints = [
  {
    method: "POST",
    path: "/api/v1/ai/remove-background",
    description: "Remove image backgrounds with AI. Returns transparent PNG as base64 data URL.",
    body: '{ "image": "data:image/png;base64,..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/ocr",
    description: "Extract text from images using AI OCR (DeepSeek).",
    body: '{ "image": "data:image/png;base64,..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/generate-image",
    description: "Generate images from text prompts using FLUX.1 Schnell.",
    body: '{ "prompt": "a sunset over mountains" }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/tts",
    description: "Convert text to natural speech audio. Returns WAV as base64 data URL.",
    body: '{ "text": "Hello world" }',
    optional: "exaggeration: 0.5 (0-1, voice expressiveness)",
  },
  {
    method: "POST",
    path: "/api/v1/ai/upscale",
    description: "Upscale and enhance images with AI. Returns higher-resolution image.",
    body: '{ "image": "data:image/png;base64,..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/face-swap",
    description: "Swap faces between two photos. Requires consent for all people in photos.",
    body: '{ "target": "data:image/png;base64,...", "source": "data:image/png;base64,..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/speech-to-text",
    description: "Transcribe or translate audio to text using Whisper AI.",
    body: '{ "audio": "data:audio/wav;base64,..." }',
    optional: 'task: "transcribe" (default) | "translate" (to English)',
  },
  {
    method: "POST",
    path: "/api/v1/ai/voice-clone",
    description: "Clone a voice from a reference audio sample and generate speech.",
    body: '{ "text": "Hello world", "audio": "data:audio/wav;base64,..." }',
    optional: "audio: 5-15 second voice sample recommended",
  },
  {
    method: "POST",
    path: "/api/v1/ai/live-portrait",
    description: "Animate a portrait photo using a driving video. Returns MP4 video.",
    body: '{ "image": "data:image/png;base64,...", "video": "data:video/mp4;base64,..." }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/image-to-video",
    description: "Generate a video from a still image and motion prompt.",
    body: '{ "image": "data:image/png;base64,...", "prompt": "clouds moving slowly" }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/regex",
    description: "Describe a pattern in English, get a working regex with explanation.",
    body: '{ "description": "match email addresses" }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/cron",
    description: "Describe a schedule in English, get a cron expression.",
    body: '{ "description": "every Monday at 9am" }',
    optional: null,
  },
  {
    method: "POST",
    path: "/api/v1/ai/privacy-policy",
    description: "Generate a privacy policy for your app or website.",
    body: '{ "appName": "MyApp", "dataCollected": ["email", "name"] }',
    optional: null,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Programmatic access to AllKit&apos;s developer tools. Simple JSON API with no signup required.
        </p>
      </div>

      {/* Quick start */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm overflow-x-auto">
          <pre>{`curl -X POST https://allkit.dev/api/v1/hash \\
  -H "Content-Type: application/json" \\
  -d '{"text": "hello world"}'`}</pre>
        </div>
      </section>

      {/* Rate limits */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rate Limits</h2>
        <div className="rounded-lg border border-border divide-y divide-border">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm font-medium">Free (no key)</span>
            <span className="text-sm text-muted-foreground">3 requests/day per IP</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm font-medium">Pro ($9/month)</span>
            <span className="text-sm text-muted-foreground">1,000 requests/month</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm font-medium">Business ($19/month)</span>
            <span className="text-sm text-muted-foreground">10,000 requests/month</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Rate limit headers (<code className="text-xs bg-muted px-1 py-0.5 rounded">X-RateLimit-Remaining</code>) are included in every response.
          Pro users: include your API key as <code className="text-xs bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code>.
        </p>
      </section>

      {/* Base URL */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base URL</h2>
        <code className="rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-mono inline-block">
          https://allkit.dev/api/v1
        </code>
        <p className="mt-3 text-sm text-muted-foreground">
          All endpoints accept and return JSON. Set <code className="text-xs bg-muted px-1 py-0.5 rounded">Content-Type: application/json</code> for POST requests.
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-6">Endpoints</h2>
        <div className="space-y-6">
          {endpoints.map((ep) => (
            <div key={ep.path} className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  ep.method === "GET" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono">{ep.path}</code>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-sm">{ep.description}</p>
                {ep.body && (
                  <div>
                    <span className="text-xs text-muted-foreground">Body:</span>
                    <pre className="mt-1 rounded bg-muted/50 px-3 py-2 text-xs font-mono overflow-x-auto">{ep.body}</pre>
                  </div>
                )}
                {ep.optional && (
                  <p className="text-xs text-muted-foreground">Options: {ep.optional}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Endpoints */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">AI Endpoints</h2>
        <p className="text-sm text-muted-foreground mb-6">
          AI-powered tools for image, audio, and text processing. Image and audio inputs should be sent as base64 data URLs.
          These endpoints are ideal for LLM tool-use — let your AI agent process media on behalf of users.
        </p>
        <div className="space-y-6">
          {aiEndpoints.map((ep) => (
            <div key={ep.path} className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-600">
                  {ep.method}
                </span>
                <code className="text-sm font-mono">{ep.path}</code>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-sm">{ep.description}</p>
                {ep.body && (
                  <div>
                    <span className="text-xs text-muted-foreground">Body:</span>
                    <pre className="mt-1 rounded bg-muted/50 px-3 py-2 text-xs font-mono overflow-x-auto">{ep.body}</pre>
                  </div>
                )}
                {ep.optional && (
                  <p className="text-xs text-muted-foreground">Options: {ep.optional}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Error handling */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Error Handling</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Errors return JSON with an <code className="text-xs bg-muted px-1 py-0.5 rounded">error</code> field. Rate limit exceeded (429) includes an upgrade URL.
        </p>
        <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
          <pre>{`// 429 Rate Limit Response
{
  "error": "rate_limit_exceeded",
  "message": "Free API limit reached. Upgrade to AllKit Pro for unlimited access.",
  "upgrade_url": "https://allkit.dev/pricing"
}`}</pre>
        </div>
      </section>

      {/* LLM integration */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">LLM & AI Agent Integration</h2>
        <p className="text-sm text-muted-foreground mb-3">
          AllKit&apos;s API is designed for use by AI assistants and LLM tool-use. See{" "}
          <a href="/llms.txt" className="text-primary hover:underline">/llms.txt</a>{" "}
          for a machine-readable tool inventory.
        </p>
        <p className="text-sm text-muted-foreground">
          Each endpoint accepts simple JSON and returns structured results — perfect for function calling.
          No authentication needed for the free tier.
        </p>
      </section>
    </div>
  );
}
