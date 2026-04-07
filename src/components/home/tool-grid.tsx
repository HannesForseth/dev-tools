"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  tools,
  categoryLabels,
  type ToolCategory,
  type ToolDefinition,
} from "@/lib/tools/registry";
import {
  Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles,
  Clock, Hash, Palette, Type, Volume2, QrCode, GitCompareArrows, KeyRound,
  FileText, ImageDown, ShieldCheck, Link as LinkIcon, FileSpreadsheet,
  FileCode, FileJson, Code, Paintbrush, ImageUpscale, Repeat, Scaling, AudioLines, Mic, Video, Film,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Binary, Fingerprint, Regex, ImageMinus, ScanText, Shield, Sparkles,
  Clock, Hash, Palette, Type, Volume2, QrCode, GitCompareArrows, KeyRound,
  FileText, ImageDown, ShieldCheck, Link: LinkIcon, FileSpreadsheet,
  FileCode, FileJson, Code, Paintbrush, ImageUpscale, Repeat, Scaling, AudioLines, Mic, Video, Film,
};

const categoryOrder: ToolCategory[] = ["dev", "media", "ai"];

const categoryTabs: { key: ToolCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "dev", label: "Developer" },
  { key: "media", label: "Media" },
  { key: "ai", label: "AI Tools" },
];

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = iconMap[tool.icon];
  const tierBadge =
    tool.costTier === "claude" || tool.costTier === "huggingface" ? "AI" : null;

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
      <p className="text-sm text-muted-foreground leading-relaxed">
        {tool.description}
      </p>
    </Link>
  );
}

export function ToolGrid() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tools.filter((t) => {
      // Category filter
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      // Search filter
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  // Group by category for display (when showing "all" without a search query)
  const showGrouped = activeCategory === "all" && !query.trim();

  // Counts per category (respects current search)
  const counts = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matchesSearch = (t: ToolDefinition) => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    };
    return {
      all: tools.filter(matchesSearch).length,
      dev: tools.filter((t) => t.category === "dev" && matchesSearch(t)).length,
      media: tools.filter((t) => t.category === "media" && matchesSearch(t)).length,
      ai: tools.filter((t) => t.category === "ai" && matchesSearch(t)).length,
    };
  }, [query]);

  return (
    <>
      {/* Search bar */}
      <div className="relative max-w-xl mx-auto mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools... (e.g. JSON, Base64, image)"
          className="w-full rounded-xl border border-border bg-card pl-12 pr-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({counts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Tool grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No tools found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try a different search term or category
          </p>
        </div>
      ) : showGrouped ? (
        // Grouped by category
        categoryOrder.map((cat) => {
          const catTools = filtered.filter((t) => t.category === cat);
          if (catTools.length === 0) return null;
          return (
            <section key={cat} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {categoryLabels[cat]}
                </h2>
                <Link
                  href={`/tools/${cat}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
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
        })
      ) : (
        // Flat grid (filtered / specific category)
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </>
  );
}
