import { notFound } from "next/navigation";
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

  return {
    title: `Free ${tool.name} Online`,
    description: tool.longDescription,
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

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <span>Tools</span>
        <span className="mx-2">/</span>
        <span>{categoryLabels[tool.category as ToolCategory]}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{tool.name}</h1>
        <p className="text-muted-foreground">{tool.description}</p>
      </div>

      {/* Tool */}
      <ToolComponent />

      {/* SEO content */}
      <section className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
        <h2>About {tool.name}</h2>
        <p>{tool.longDescription}</p>
      </section>
    </div>
  );
}
