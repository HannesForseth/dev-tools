import Link from "next/link";
import { tools, categoryLabels, type ToolCategory } from "@/lib/tools/registry";
import { Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles,
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
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Free Developer & AI Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Fast, beautiful, and AI-powered tools for developers and creators.
          No signup required. Your data stays in your browser.
        </p>
      </section>

      {/* Tool categories */}
      {categoryOrder.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat);
        if (catTools.length === 0) return null;
        return (
          <section key={cat} className="mb-12">
            <h2 className="text-xl font-semibold mb-6">{categoryLabels[cat]}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
