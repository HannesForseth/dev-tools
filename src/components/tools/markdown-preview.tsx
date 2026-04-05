"use client";

import { useState } from "react";
import { Copy, Check, Eye, Code } from "lucide-react";

// Simple markdown to HTML converter (no dependencies)
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (``` ... ```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 my-4 text-muted-foreground italic">$1</blockquote>')
    // Unordered lists
    .replace(/^[\-\*] (.+)$/gm, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="my-2">$1</p>');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul class="my-3 space-y-1 list-disc">$1</ul>');

  return html;
}

const SAMPLE = `# Markdown Preview

Write **Markdown** on the left, see the *rendered* output on the right.

## Features

- **Bold**, *italic*, and ~~strikethrough~~
- [Links](https://allkit.dev) and images
- Code blocks with syntax highlighting
- Lists, blockquotes, and more

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote — great for callouts.

---

Try editing this text to see the preview update in real-time!`;

export function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE);
  const [view, setView] = useState<"split" | "preview" | "source">("split");
  const [copied, setCopied] = useState(false);

  const html = markdownToHtml(input);

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView("split")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${view === "split" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Split
          </button>
          <button
            onClick={() => setView("source")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-l border-border ${view === "source" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <Code className="h-3.5 w-3.5 inline mr-1" />Source
          </button>
          <button
            onClick={() => setView("preview")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-l border-border ${view === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <Eye className="h-3.5 w-3.5 inline mr-1" />Preview
          </button>
        </div>

        <button
          onClick={copyHtml}
          className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied HTML!" : "Copy HTML"}
        </button>

        <button
          onClick={() => setInput("")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Editor + Preview */}
      <div className={`grid gap-4 ${view === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {(view === "split" || view === "source") && (
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Markdown</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your Markdown here..."
              className="w-full h-96 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              spellCheck={false}
            />
          </div>
        )}
        {(view === "split" || view === "preview") && (
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Preview</label>
            <div
              className="w-full h-96 rounded-lg border border-border bg-muted/50 p-4 overflow-y-auto prose prose-zinc dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{input.length} characters</span>
        <span>{input.split(/\s+/).filter(Boolean).length} words</span>
        <span>{input.split("\n").length} lines</span>
      </div>
    </div>
  );
}
