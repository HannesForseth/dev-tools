"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, PanelLeftOpen, X } from "lucide-react";
import {
  tools,
  categoryLabels,
  type ToolCategory,
  type ToolDefinition,
} from "@/lib/tools/registry";

const categoryOrder: ToolCategory[] = ["dev", "media", "ai"];

function CategorySection({
  category,
  categoryTools,
  currentSlug,
  defaultOpen,
  onNavigate,
}: {
  category: ToolCategory;
  categoryTools: ToolDefinition[];
  currentSlug: string;
  defaultOpen: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{categoryLabels[category]}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <ul className="space-y-0.5 pb-2">
          {categoryTools.map((tool) => {
            const isActive = tool.slug === currentSlug;
            const isAI =
              tool.costTier === "claude" || tool.costTier === "huggingface";
            return (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.category}/${tool.slug}`}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="truncate flex-1">{tool.name}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    {tool.isNew && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                        New
                      </span>
                    )}
                    {isAI && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        AI
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ToolSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract current slug from pathname like /tools/dev/json-formatter
  const segments = pathname.split("/");
  const currentSlug = segments[3] || "";
  const currentCategory = (segments[2] || "") as ToolCategory;

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toolsByCategory = categoryOrder.map((cat) => ({
    category: cat,
    tools: tools.filter((t) => t.category === cat),
  }));

  const sidebarContent = (
    <nav className="space-y-1">
      <div className="px-3 py-2 mb-1">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
      {toolsByCategory.map(({ category, tools: catTools }) => (
        <CategorySection
          key={category}
          category={category}
          categoryTools={catTools}
          currentSlug={currentSlug}
          defaultOpen={category === currentCategory}
          onNavigate={() => setMobileOpen(false)}
        />
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[250px] shrink-0">
        <div className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto border-r border-border py-4 pr-2">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open tool navigation"
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          {/* Mobile slide-over panel */}
          <div
            className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border shadow-xl overflow-y-auto"
            style={{ animation: "slideInLeft 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm">All Tools</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-2">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
