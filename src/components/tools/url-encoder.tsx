"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeType, setEncodeType] = useState<"component" | "full">("component");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = useCallback((text: string, m: "encode" | "decode", type: "component" | "full") => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (m === "encode") {
        setOutput(type === "component" ? encodeURIComponent(text) : encodeURI(text));
      } else {
        setOutput(type === "component" ? decodeURIComponent(text.trim()) : decodeURI(text.trim()));
      }
      setError(null);
    } catch {
      setError(m === "decode" ? "Invalid encoded string" : "Failed to encode");
      setOutput("");
    }
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    process(value, mode, encodeType);
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    const newInput = output;
    setInput(newInput);
    process(newInput, newMode, encodeType);
  };

  const changeEncodeType = (type: "component" | "full") => {
    setEncodeType(type);
    process(input, mode, type);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleMode}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {mode === "encode" ? "Encode" : "Decode"} mode
        </button>

        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => changeEncodeType("component")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              encodeType === "component" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            Component
          </button>
          <button
            onClick={() => changeEncodeType("full")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-l border-border ${
              encodeType === "full" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            Full URL
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          {encodeType === "component"
            ? "encodeURIComponent — encodes all special characters"
            : "encodeURI — preserves :, /, ?, #, etc."}
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
            {mode === "encode" ? "Text / URL Input" : "Encoded Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text or URL to encode..." : "Paste encoded string..."}
            className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {mode === "encode" ? "Encoded Output" : "Decoded Output"}
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
            className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Reference table */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Common URL Encodings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { char: " ", encoded: "%20" },
            { char: "!", encoded: "%21" },
            { char: "#", encoded: "%23" },
            { char: "$", encoded: "%24" },
            { char: "&", encoded: "%26" },
            { char: "+", encoded: "%2B" },
            { char: "/", encoded: "%2F" },
            { char: ":", encoded: "%3A" },
            { char: "=", encoded: "%3D" },
            { char: "?", encoded: "%3F" },
            { char: "@", encoded: "%40" },
            { char: "%", encoded: "%25" },
          ].map((item) => (
            <div
              key={item.char}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="font-mono font-medium">{item.char === " " ? "space" : item.char}</span>
              <span className="font-mono text-muted-foreground">{item.encoded}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
