import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { tools, categoryLabels, type ToolCategory } from "@/lib/tools/registry";
import { Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles, Paintbrush, ImageUpscale, Repeat, Scaling, AudioLines, Mic, Video, Film } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles, Paintbrush, ImageUpscale, Repeat, Scaling, AudioLines, Mic, Video, Film,
};

const validCategories: ToolCategory[] = ["dev", "media", "ai"];

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return validCategories.map((c) => ({ category: c }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!validCategories.includes(category as ToolCategory)) return {};
  const label = categoryLabels[category as ToolCategory];
  return {
    title: `Free ${label} Online`,
    description: `Browse our collection of free ${label.toLowerCase()}. No signup required.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!validCategories.includes(category as ToolCategory)) notFound();

  const catTools = tools.filter((t) => t.category === category);
  const label = categoryLabels[category as ToolCategory];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{label}</h1>
      <p className="text-muted-foreground mb-8">
        Free, fast, and AI-powered. No signup required.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catTools.map((tool) => {
          const Icon = iconMap[tool.icon];
          const tierBadge = tool.costTier === "claude" || tool.costTier === "huggingface" ? "AI" : null;
          return (
            <Link
              key={tool.slug}
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
                {tierBadge && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {tierBadge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
