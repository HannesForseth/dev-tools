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

const toolComponents: Record<string, React.ComponentType> = {
  "json-formatter": JsonFormatter,
  "uuid-generator": UuidGenerator,
  "base64": Base64Tool,
  "regex-tester": RegexTester,
  "background-remover": BackgroundRemover,
  "image-to-text": ImageToText,
  "privacy-policy-generator": PrivacyPolicyGenerator,
  "ai-image-generator": AiImageGenerator,
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
      title: `Free ${tool.name} Online | DevTools`,
      description: tool.description,
      type: "website",
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
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
