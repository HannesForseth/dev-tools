"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Minimize2, Maximize2, AlertCircle } from "lucide-react";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const format = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setError(msg);
    }
  }, [input]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  // Auto-format on input change
  const handleInput = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={format}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Format
        </button>
        <button
          onClick={minify}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Minify
        </button>
        <select
          value={indent}
          onChange={(e) => setIndent(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={1}>1 tab</option>
        </select>
        <button
          onClick={() => { setInput(""); setOutput(""); setError(null); }}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Input</label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder='Paste your JSON here...'
            className="w-full h-80 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">Output</label>
            {output && (
              <button
                onClick={copyOutput}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="w-full h-80 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Invalid JSON</p>
            <p className="mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
