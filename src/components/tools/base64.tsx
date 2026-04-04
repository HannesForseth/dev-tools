"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = useCallback((text: string, m: "encode" | "decode") => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(text))));
      } else {
        setOutput(decodeURIComponent(escape(atob(text.trim()))));
      }
      setError(null);
    } catch {
      setError(m === "decode" ? "Invalid Base64 string" : "Failed to encode");
      setOutput("");
    }
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    process(value, mode);
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    // Swap input/output
    const newInput = output;
    setInput(newInput);
    process(newInput, newMode);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMode}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {mode === "encode" ? "Encode" : "Decode"} mode
        </button>
        <span className="text-sm text-muted-foreground">
          {mode === "encode" ? "Text → Base64" : "Base64 → Text"}
        </span>
        <button
          onClick={() => { setInput(""); setOutput(""); setError(null); }}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            {mode === "encode" ? "Text Input" : "Base64 Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 string..."}
            className="w-full h-64 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {mode === "encode" ? "Base64 Output" : "Decoded Text"}
            </label>
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
            placeholder="Output will appear here..."
            className="w-full h-64 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
