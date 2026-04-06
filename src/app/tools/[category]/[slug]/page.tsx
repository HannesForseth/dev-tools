import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { tools, getToolBySlug, categoryLabels, type ToolCategory } from "@/lib/tools/registry";

// Tool components
import { JsonFormatter } from "@/components/tools/json-formatter";
import { UuidGenerator } from "@/components/tools/uuid-generator";
import { Base64Tool } from "@/components/tools/base64";
import { RegexTester } from "@/components/tools/regex-tester";
import { BackgroundRemover } from "@/components/tools/background-remover";
import { ImageToText } from "@/components/tools/image-to-text";
import { PrivacyPolicyGenerator } from "@/components/tools/privacy-policy-generator";
import { AiImageGenerator } from "@/components/tools/ai-image-generator";
import { CronGenerator } from "@/components/tools/cron-generator";
import { HashGenerator } from "@/components/tools/hash-generator";
import { ColorPalette } from "@/components/tools/color-palette";
import { LoremIpsum } from "@/components/tools/lorem-ipsum";
import { TextToSpeech } from "@/components/tools/text-to-speech";
import { QrCodeGenerator } from "@/components/tools/qr-code-generator";
import { DiffChecker } from "@/components/tools/diff-checker";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { WordCounter } from "@/components/tools/word-counter";
import { ImageCompressor } from "@/components/tools/image-compressor";
import { JwtDecoder } from "@/components/tools/jwt-decoder";
import { UnixTimestamp } from "@/components/tools/unix-timestamp";
import { UrlEncoder } from "@/components/tools/url-encoder";
import { CsvJsonConverter } from "@/components/tools/csv-json";
import { MarkdownPreview } from "@/components/tools/markdown-preview";
import { YamlJsonConverter } from "@/components/tools/yaml-json";
import { HtmlEntities } from "@/components/tools/html-entities";
import { CssMinifier } from "@/components/tools/css-minifier";
import { ImageResizer } from "@/components/tools/image-resizer";

const toolComponents: Record<string, React.ComponentType> = {
  "json-formatter": JsonFormatter,
  "uuid-generator": UuidGenerator,
  "base64": Base64Tool,
  "regex-tester": RegexTester,
  "background-remover": BackgroundRemover,
  "image-to-text": ImageToText,
  "privacy-policy-generator": PrivacyPolicyGenerator,
  "ai-image-generator": AiImageGenerator,
  "cron-generator": CronGenerator,
  "hash-generator": HashGenerator,
  "color-palette": ColorPalette,
  "lorem-ipsum": LoremIpsum,
  "text-to-speech": TextToSpeech,
  "qr-code-generator": QrCodeGenerator,
  "diff-checker": DiffChecker,
  "password-generator": PasswordGenerator,
  "word-counter": WordCounter,
  "image-compressor": ImageCompressor,
  "jwt-decoder": JwtDecoder,
  "unix-timestamp": UnixTimestamp,
  "url-encoder": UrlEncoder,
  "csv-json": CsvJsonConverter,
  "markdown-preview": MarkdownPreview,
  "yaml-json": YamlJsonConverter,
  "html-entities": HtmlEntities,
  "css-minifier": CssMinifier,
  "image-resizer": ImageResizer,
};

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  return tools.map((t) => ({
    category: t.category,
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  // Trim meta description to 155 chars for SERP display
  const metaDesc = tool.longDescription.length > 155
    ? tool.longDescription.slice(0, 152).replace(/\s+\S*$/, "") + "..."
    : tool.longDescription;

  return {
    title: `Free ${tool.name} Online`,
    description: metaDesc,
    keywords: tool.keywords,
    openGraph: {
      title: `Free ${tool.name} Online | AllKit`,
      description: tool.description,
      type: "website",
      url: `https://allkit.dev/tools/${tool.category}/${tool.slug}`,
      siteName: "AllKit",
    },
    twitter: {
      card: "summary_large_image",
      title: `Free ${tool.name} Online | AllKit`,
      description: tool.description,
    },
    alternates: {
      canonical: `https://allkit.dev/tools/${tool.category}/${tool.slug}`,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.category !== category) {
    notFound();
  }

  const ToolComponent = toolComponents[slug];
  if (!ToolComponent) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.longDescription,
    url: `https://allkit.dev/tools/${tool.category}/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqLd = tool.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  } : null;

  const relatedTools = (tool.relatedSlugs || [])
    .map((s) => getToolBySlug(s))
    .filter(Boolean);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://allkit.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabels[tool.category as ToolCategory],
        item: `https://allkit.dev/tools/${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://allkit.dev/tools/${tool.category}/${tool.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Breadcrumb — clickable links */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/tools/${tool.category}`} className="hover:text-foreground transition-colors">
          {categoryLabels[tool.category as ToolCategory]}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      {/* Title + privacy badge */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{tool.name}</h1>
        <p className="text-muted-foreground">{tool.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {tool.costTier === "free" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 px-2.5 py-1 font-medium">
              100% Client-Side — Your data never leaves your browser
            </span>
          )}
          <span>Free — No signup required</span>
        </div>
      </div>

      {/* Tool */}
      <ToolComponent />

      {/* Pro upgrade CTA */}
      {tool.costTier === "free" && (
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Need API access to {tool.name}?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Integrate this tool into your workflow with our REST API. 3 free requests/day, unlimited with Pro.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View API Plans
          </Link>
        </div>
      )}
      {(tool.costTier === "claude" || tool.costTier === "huggingface") && (
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Unlock unlimited AI requests</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Free users get 3 AI requests per day. Upgrade to Pro for unlimited access, HD output, and API access.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Upgrade to Pro — $9/mo
          </Link>
        </div>
      )}

      {/* SEO content */}
      <section className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
        <h2>What is {tool.name}?</h2>
        {tool.detailedDescription ? (
          tool.detailedDescription.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <>
            <p>{tool.longDescription}</p>
            <p>
              AllKit&apos;s {tool.name} is completely free with no signup required.
              {tool.costTier === "free"
                ? " All processing happens directly in your browser — your data is never sent to any server, making it safe for sensitive information."
                : " Powered by state-of-the-art AI models, it delivers professional-quality results in seconds."}
            </p>
          </>
        )}

        <h3>Why use AllKit?</h3>
        <ul>
          <li><strong>No ads, no distractions</strong> — a clean interface that lets you focus on the task</li>
          <li><strong>Privacy-first</strong> — {tool.costTier === "free" ? "100% client-side processing, nothing is uploaded" : "minimal data processing, results delivered instantly"}</li>
          <li><strong>Free forever</strong> — core tools are free with no usage limits</li>
          <li><strong>API available</strong> — integrate into your workflow via our <Link href="/api-docs" className="text-primary">REST API</Link></li>
        </ul>

        {/* How to Use section */}
        {tool.howToUse && tool.howToUse.length > 0 && (
          <>
            <h2>How to Use {tool.name}</h2>
            <ol>
              {tool.howToUse.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </>
        )}

        {/* Common Use Cases section */}
        {tool.useCases && tool.useCases.length > 0 && (
          <>
            <h2>Common Use Cases</h2>
            {tool.useCases.map((uc, i) => (
              <div key={i}>
                <h3>{uc.title}</h3>
                <p>{uc.description}</p>
              </div>
            ))}
          </>
        )}

        {/* Technical Details section */}
        {tool.technicalDetails && tool.technicalDetails.length > 0 && (
          <>
            <h2>Technical Details</h2>
            {tool.technicalDetails.map((detail, i) => (
              <p key={i}>{detail}</p>
            ))}
          </>
        )}
      </section>

      {/* FAQ */}
      {tool.faq && tool.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {tool.faq.map((f, i) => (
              <details key={i} className="group rounded-lg border border-border">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                  {f.question}
                  <span className="ml-2 text-muted-foreground transition-transform group-open:rotate-180">▾</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedTools.map((rt) => rt && (
              <Link
                key={rt.slug}
                href={`/tools/${rt.category}/${rt.slug}`}
                className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <h3 className="text-sm font-medium mb-1">{rt.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{rt.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
