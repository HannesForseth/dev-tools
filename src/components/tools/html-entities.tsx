"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";

const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  "\u00A0": "&nbsp;", "\u00A9": "&copy;", "\u00AE": "&reg;", "\u2122": "&trade;",
  "\u20AC": "&euro;", "\u00A3": "&pound;", "\u00A5": "&yen;", "\u00A2": "&cent;",
  "\u2013": "&ndash;", "\u2014": "&mdash;", "\u2018": "&lsquo;", "\u2019": "&rsquo;",
  "\u201C": "&ldquo;", "\u201D": "&rdquo;", "\u2026": "&hellip;", "\u00D7": "&times;",
  "\u00F7": "&divide;", "\u2260": "&ne;", "\u2264": "&le;", "\u2265": "&ge;",
};

const REVERSE_MAP: Record<string, string> = {};
for (const [char, entity] of Object.entries(ENTITY_MAP)) {
  REVERSE_MAP[entity] = char;
}

function encodeEntities(text: string): string {
  return text.replace(/[&<>"'\u00A0\u00A9\u00AE\u2122\u20AC\u00A3\u00A5\u00A2\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u00D7\u00F7\u2260\u2264\u2265]/g,
    (char) => ENTITY_MAP[char] || `&#${char.charCodeAt(0)};`
  );
}

function decodeEntities(text: string): string {
  return text
    // Named entities
    .replace(/&[a-zA-Z]+;/g, (entity) => REVERSE_MAP[entity] || entity)
    // Numeric entities (decimal)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    // Numeric entities (hex)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const process = useCallback((text: string, m: "encode" | "decode") => {
    if (!text) { setOutput(""); return; }
    setOutput(m === "encode" ? encodeEntities(text) : decodeEntities(text));
  }, []);

  const handleInput = (val: string) => {
    setInput(val);
    process(val, mode);
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
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
      <div className="flex items-center gap-3">
        <button onClick={toggleMode} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {mode === "encode" ? "Encode" : "Decode"} mode
        </button>
        <span className="text-sm text-muted-foreground">
          {mode === "encode" ? 'Text → &amp;entities;' : '&amp;entities; → Text'}
        </span>
        <button onClick={() => { setInput(""); setOutput(""); }} className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            {mode === "encode" ? "Text Input" : "HTML Entities Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === "encode" ? '<p>Hello "World" & everyone</p>' : '&lt;p&gt;Hello &quot;World&quot; &amp; everyone&lt;/p&gt;'}
            className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {mode === "encode" ? "Encoded Output" : "Decoded Output"}
            </label>
            {output && (
              <button onClick={copyOutput} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea value={output} readOnly placeholder="Output will appear here..." className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none" spellCheck={false} />
        </div>
      </div>

      {/* Reference */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Common HTML Entities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { char: "&", entity: "&amp;" },
            { char: "<", entity: "&lt;" },
            { char: ">", entity: "&gt;" },
            { char: '"', entity: "&quot;" },
            { char: "'", entity: "&#39;" },
            { char: "\u00A0", entity: "&nbsp;", label: "nbsp" },
            { char: "\u00A9", entity: "&copy;" },
            { char: "\u00AE", entity: "&reg;" },
            { char: "\u2122", entity: "&trade;" },
            { char: "\u20AC", entity: "&euro;" },
            { char: "\u2014", entity: "&mdash;" },
            { char: "\u2026", entity: "&hellip;" },
          ].map((item) => (
            <div key={item.entity} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-mono font-medium">{item.label || item.char}</span>
              <span className="font-mono text-muted-foreground text-xs">{item.entity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
