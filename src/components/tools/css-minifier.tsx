"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Minimize2, Maximize2, Trash2 } from "lucide-react";

function minifyCss(css: string): string {
  if (!css.trim()) return "";

  let result = css;

  // Remove comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove newlines, tabs, carriage returns
  result = result.replace(/[\n\r\t]/g, "");

  // Collapse multiple spaces to one
  result = result.replace(/\s{2,}/g, " ");

  // Remove spaces around { } : ; , > ~ +
  result = result.replace(/\s*\{\s*/g, "{");
  result = result.replace(/\s*\}\s*/g, "}");
  result = result.replace(/\s*;\s*/g, ";");
  result = result.replace(/\s*:\s*/g, ":");
  result = result.replace(/\s*,\s*/g, ",");
  result = result.replace(/\s*>\s*/g, ">");
  result = result.replace(/\s*~\s*/g, "~");
  result = result.replace(/\s*\+\s*/g, "+");

  // Remove last semicolon before closing brace
  result = result.replace(/;}/g, "}");

  // Shorten hex colors: #ffffff -> #fff, #aabbcc -> #abc
  result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, "#$1$2$3");

  // Shorten 0px, 0em, 0rem, 0% etc to 0 (but not inside things like 0.5px)
  result = result.replace(/\b0(px|em|rem|%|vh|vw|vmin|vmax|ex|ch|cm|mm|in|pt|pc)\b/g, "0");

  // Remove leading zeros: 0.5 -> .5
  result = result.replace(/(:|,|\s)0\.(\d)/g, "$1.$2");

  // Trim
  result = result.trim();

  return result;
}

function beautifyCss(css: string): string {
  if (!css.trim()) return "";

  let result = css;

  // First pass: extract comments to preserve them
  const comments: string[] = [];
  result = css.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    comments.push(match);
    return `__COMMENT_${comments.length - 1}__`;
  });

  // Normalize whitespace
  result = result.replace(/[\n\r\t]/g, " ");
  result = result.replace(/\s{2,}/g, " ");
  result = result.trim();

  // Add newlines after { and ;
  result = result.replace(/\{/g, " {\n");
  result = result.replace(/\}/g, "\n}\n");
  result = result.replace(/;/g, ";\n");

  // Indent contents inside braces
  const lines = result.split("\n");
  const formatted: string[] = [];
  let indentLevel = 0;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Decrease indent for closing brace
    if (line.startsWith("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indent = "  ".repeat(indentLevel);
    formatted.push(indent + line);

    // Increase indent after opening brace
    if (line.endsWith("{")) {
      indentLevel++;
    }
  }

  result = formatted.join("\n");

  // Add blank line between rule blocks (between } and next selector)
  result = result.replace(/\}\n(\s*[^\s}@])/g, "}\n\n$1");
  result = result.replace(/\}\n(\s*@)/g, "}\n\n$1");

  // Add space after colons in declarations
  result = result.replace(/([a-zA-Z-]):\s*/g, "$1: ");
  // Fix double spaces after colon
  result = result.replace(/:\s{2,}/g, ": ");

  // Restore comments
  comments.forEach((comment, i) => {
    result = result.replace(`__COMMENT_${i}__`, comment);
  });

  return result.trim();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(2) + " KB";
}

export function CssMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"minify" | "beautify">("minify");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processInput = useCallback((text: string, m: "minify" | "beautify") => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const result = m === "minify" ? minifyCss(text) : beautifyCss(text);
      setOutput(result);
      setError(null);
    } catch {
      setError("Failed to process CSS. Check your input for syntax errors.");
      setOutput("");
    }
  }, []);

  const handleInput = (val: string) => {
    setInput(val);
    if (val.trim()) {
      processInput(val, mode);
    } else {
      setOutput("");
      setError(null);
    }
  };

  const handleMinify = () => {
    setMode("minify");
    processInput(input, "minify");
  };

  const handleBeautify = () => {
    setMode("beautify");
    processInput(input, "beautify");
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const loadSample = () => {
    const sample = `/* Main layout styles */
.container {
  max-width: 1200px;
  margin: 0px auto;
  padding: 0px 16px;
  background-color: #ffffff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0px;
  border-bottom: 1px solid #dddddd;
}

.header .logo {
  font-size: 24px;
  font-weight: 700;
  color: #333333;
}

.nav-links {
  display: flex;
  gap: 24px;
  list-style: none;
}

.nav-links a {
  color: #666666;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #0066ff;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0px 8px;
  }

  .header {
    flex-direction: column;
    gap: 12px;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* CSS Variables */
:root {
  --primary: #0066ff;
  --secondary: #ff6600;
  --text: #333333;
  --bg: #ffffff;
  --radius: 8px;
}`;
    setInput(sample);
    processInput(sample, mode);
  };

  const originalSize = new TextEncoder().encode(input).length;
  const outputSize = new TextEncoder().encode(output).length;
  const savings = originalSize > 0 && outputSize > 0
    ? ((1 - outputSize / originalSize) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleMinify}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            mode === "minify"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted"
          }`}
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Minify
        </button>
        <button
          onClick={handleBeautify}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            mode === "beautify"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted"
          }`}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Beautify
        </button>
        <button
          onClick={loadSample}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Load sample
        </button>
        <button
          onClick={clearAll}
          className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Input CSS
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={`Paste your CSS here...\n\n.example {\n  color: #ffffff;\n  margin: 0px;\n}`}
            className="w-full h-72 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
          {originalSize > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Size: {formatBytes(originalSize)}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {mode === "minify" ? "Minified Output" : "Beautified Output"}
            </label>
            {output && (
              <button
                onClick={copyOutput}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="w-full h-72 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none"
            spellCheck={false}
          />
          {outputSize > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Size: {formatBytes(outputSize)}
              {savings && mode === "minify" && (
                <span className={Number(savings) > 0 ? "text-green-600 ml-2 font-medium" : "ml-2"}>
                  {Number(savings) > 0 ? `${savings}% smaller` : `${Math.abs(Number(savings)).toFixed(1)}% larger`}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Size comparison card */}
      {output && mode === "minify" && originalSize > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium mb-3">Compression Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{formatBytes(originalSize)}</p>
              <p className="text-xs text-muted-foreground">Original</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{formatBytes(outputSize)}</p>
              <p className="text-xs text-muted-foreground">Minified</p>
            </div>
            <div>
              <p className={`text-lg font-semibold ${Number(savings) > 0 ? "text-green-600" : ""}`}>
                {savings ? `${savings}%` : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.max(5, 100 - (Number(savings) || 0))}%` }}
            />
          </div>
        </div>
      )}

      {/* What minification does */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">What This Tool Does</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: "Remove comments", desc: "Strips /* ... */ comment blocks" },
            { label: "Remove whitespace", desc: "Collapses spaces, tabs, newlines" },
            { label: "Shorten hex colors", desc: "#ffffff becomes #fff" },
            { label: "Remove trailing semicolons", desc: "Last semicolon before } removed" },
            { label: "Shorten zero values", desc: "0px, 0em, 0rem become 0" },
            { label: "Remove leading zeros", desc: "0.5 becomes .5" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground text-xs mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rich SEO content */}
      <section className="mt-8 prose prose-zinc dark:prose-invert max-w-none prose-sm">
        <h2>How to Use the CSS Minifier &amp; Beautifier</h2>
        <p>
          Using this tool is straightforward. Follow these steps to minify or beautify your CSS in seconds:
        </p>
        <ol>
          <li><strong>Paste your CSS code</strong> into the input textarea on the left. You can paste any amount of CSS — from a single rule to an entire stylesheet with thousands of lines.</li>
          <li><strong>Choose your operation.</strong> Click the <strong>Minify</strong> button to compress the CSS, or click <strong>Beautify</strong> to format it with proper indentation and spacing.</li>
          <li><strong>Review the output</strong> on the right side. For minification, you will see the compressed version along with a size comparison showing the original size, the minified size, and the percentage reduction.</li>
          <li><strong>Copy the result</strong> by clicking the Copy button in the top-right corner of the output area. The processed CSS is now on your clipboard, ready to paste into your project.</li>
          <li><strong>Try the sample</strong> if you want to see the tool in action first. Click &quot;Load sample&quot; to populate the input with example CSS that includes selectors, media queries, keyframes, and CSS variables.</li>
        </ol>

        <h2>Why CSS Minification Matters for Web Performance</h2>
        <p>
          CSS is one of the most critical resources on any web page. Unlike JavaScript, which can be deferred or loaded asynchronously, CSS is <strong>render-blocking</strong> by default. This means the browser cannot paint a single pixel on screen until it has downloaded and parsed all of the CSS files linked in your HTML. Every kilobyte of CSS directly impacts how fast your page appears to users.
        </p>
        <p>
          When a user visits your website, their browser must download your CSS file over the network. On a fast broadband connection, the difference between a 50KB and a 30KB CSS file might be imperceptible. But on a 3G mobile connection — which millions of users worldwide still rely on — that 20KB difference can add 200-400 milliseconds to the page load time. Those milliseconds add up across every page view, every user, and every visit.
        </p>
        <p>
          Google&apos;s Core Web Vitals, which directly influence search rankings, are heavily affected by CSS file size. The <strong>First Contentful Paint (FCP)</strong> metric measures how quickly the browser renders the first piece of content. Since CSS blocks rendering, a large unminified CSS file delays FCP. The <strong>Largest Contentful Paint (LCP)</strong> is similarly affected. Studies by Google and Akamai have found that a one-second delay in page load can reduce conversions by 7% and increase bounce rate by 11%.
        </p>
        <p>
          Minifying your CSS is one of the easiest performance wins available. It requires zero changes to your design or functionality — the browser interprets minified CSS identically to the original. It is a pure optimization with no tradeoffs.
        </p>

        <h2>Common Use Cases</h2>
        <h3>1. Optimizing CSS for Production Deployment</h3>
        <p>
          The most common use case is preparing CSS for production. During development, you write CSS with comments, generous whitespace, and clear formatting to keep the code maintainable. Before deploying to production, you minify it to reduce file size. While most modern build tools handle this automatically, there are many situations where you need to minify CSS manually — static HTML sites, WordPress themes, email templates, or quick prototypes that do not use a build pipeline.
        </p>

        <h3>2. Debugging Minified Production CSS</h3>
        <p>
          When you encounter a styling bug on a production site and only have access to the minified CSS, the beautifier becomes essential. Paste the minified CSS, click Beautify, and you get a properly indented, readable version you can actually debug. This is especially useful when inspecting third-party CSS or inherited codebases where source maps are not available.
        </p>

        <h3>3. Optimizing Inline CSS and Email Templates</h3>
        <p>
          Email HTML often requires inline CSS because many email clients strip external stylesheets and &lt;style&gt; blocks. When you write CSS for an HTML email template and then inline it, minifying the CSS first ensures the email&apos;s total size stays within limits (many email clients truncate messages over 100KB). Every byte counts in email, and minification helps keep your emails deliverable.
        </p>

        <h3>4. Reducing Third-Party CSS Bloat</h3>
        <p>
          Many third-party libraries ship CSS with extensive comments and verbose formatting. If you are extracting and customizing only the parts you need from a large framework like Bootstrap or Tailwind&apos;s utility layer, minifying the extracted portion removes the overhead from the original library&apos;s development comments.
        </p>

        <h3>5. Comparing CSS Versions</h3>
        <p>
          When you need to compare two versions of a CSS file — for example, before and after a design change — beautifying both versions first ensures consistent formatting, making differences easier to spot. Combine this with AllKit&apos;s Diff Checker for a complete comparison workflow.
        </p>

        <h3>6. Preparing CSS for Content Management Systems</h3>
        <p>
          Many CMS platforms like WordPress, Shopify, and Squarespace have custom CSS fields with limited space. Minifying your CSS before pasting it into these fields maximizes what you can fit and ensures the CSS loads efficiently for your site visitors.
        </p>

        <h3>7. Learning and Teaching CSS</h3>
        <p>
          The beautifier is a useful learning tool. When students encounter minified CSS in the wild, they can paste it here and instantly see the properly formatted structure. The indentation reveals the hierarchy of selectors, media queries, and nested rules in a way that minified code obscures.
        </p>

        <h2>Understanding CSS Minification Techniques</h2>
        <p>
          CSS minification involves several distinct optimizations, each targeting a different type of unnecessary character in your stylesheet:
        </p>

        <h3>Whitespace Removal</h3>
        <p>
          The largest size reduction comes from removing whitespace: spaces, tabs, and newlines that make CSS readable but have no effect on how the browser processes it. A declaration like <code>margin: 0px auto;</code> with surrounding indentation and newlines becomes <code>margin:0 auto</code> with no whitespace overhead. In a typical well-formatted stylesheet, whitespace accounts for 20-35% of the file size.
        </p>

        <h3>Comment Stripping</h3>
        <p>
          CSS comments (<code>/* ... */</code>) are invaluable during development for explaining complex selectors, documenting design decisions, or marking sections of a large stylesheet. However, the browser ignores them entirely. In heavily documented stylesheets, comments can account for 10-20% of the file size. Minification removes all comments.
        </p>

        <h3>Hex Color Shortening</h3>
        <p>
          CSS allows shorthand for hex colors where each pair of digits is identical. <code>#ffffff</code> becomes <code>#fff</code>, <code>#aabbcc</code> becomes <code>#abc</code>, and <code>#000000</code> becomes <code>#000</code>. This saves 3 bytes per shortened color. In a design system with many color references, this adds up.
        </p>

        <h3>Zero Value Optimization</h3>
        <p>
          When a CSS value is zero, the unit is irrelevant: <code>0px</code>, <code>0em</code>, <code>0rem</code>, and <code>0%</code> are all the same as plain <code>0</code>. Similarly, leading zeros in decimal values are unnecessary: <code>0.5em</code> is the same as <code>.5em</code>. These micro-optimizations save a few bytes each but compound across a large stylesheet.
        </p>

        <h3>Trailing Semicolon Removal</h3>
        <p>
          In CSS, the last declaration in a rule block does not require a trailing semicolon. While it is good practice to include it during development (to avoid bugs when adding new declarations), the minifier safely removes it to save one byte per rule block. In a stylesheet with hundreds of rules, this saves a meaningful amount.
        </p>

        <h2>CSS Minification vs. Gzip Compression</h2>
        <p>
          A common question is whether minification is still necessary when the server already applies Gzip or Brotli compression. The answer is yes — they complement each other. Gzip compression works best on files with repeated patterns. Minified CSS has fewer unique characters and more repetitive structure, which means Gzip compresses it even more efficiently than the original. In practice, minifying <em>before</em> Gzip results in a final transfer size 5-15% smaller than Gzipping the unminified version. For optimal performance, always do both.
        </p>

        <h2>When Not to Minify</h2>
        <p>
          Keep your CSS unminified in development and version control. Readable code is essential for collaboration, debugging, and maintenance. Only minify for production output. If you use a build tool like Webpack, Vite, or PostCSS, configure it to minify CSS automatically as part of the build step. Use source maps to map the minified production CSS back to the original source when debugging.
        </p>
        <p>
          Also, avoid minifying CSS that you are actively editing or sharing with other developers for review. The beautified version is always better for human consumption. Think of minification as the last step before deployment, not a replacement for clean source code.
        </p>
      </section>
    </div>
  );
}
