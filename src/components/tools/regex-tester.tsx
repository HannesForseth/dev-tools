"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const matches = useMemo(() => {
    if (!pattern || !testString) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const results: { match: string; index: number; groups?: Record<string, string> }[] = [];
      let m;
      if (flags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          results.push({ match: m[0], index: m.index, groups: m.groups });
          if (m.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        m = regex.exec(testString);
        if (m) results.push({ match: m[0], index: m.index, groups: m.groups });
      }
      return results;
    } catch {
      return [];
    }
  }, [pattern, flags, testString]);

  const regexError = useMemo(() => {
    if (!pattern) return null;
    try {
      new RegExp(pattern, flags);
      return null;
    } catch (e) {
      return e instanceof SyntaxError ? e.message : "Invalid regex";
    }
  }, [pattern, flags]);

  const highlightedText = useMemo(() => {
    if (!pattern || !testString || regexError) return testString;
    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;
      let m;
      while ((m = regex.exec(testString)) !== null) {
        if (m.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, m.index), isMatch: false });
        }
        parts.push({ text: m[0], isMatch: true });
        lastIndex = m.index + m[0].length;
        if (m.index === regex.lastIndex) regex.lastIndex++;
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }
      return parts;
    } catch {
      return testString;
    }
  }, [pattern, flags, testString, regexError]);

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/regex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.pattern) {
        setPattern(data.pattern);
        if (data.flags) setFlags(data.flags);
      }
    } catch {
      // silently fail
    } finally {
      setAiLoading(false);
    }
  };

  const copyPattern = async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* AI Builder */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Regex Builder</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">AI</span>
        </div>
        <div className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateWithAi()}
            placeholder="Describe what you want to match, e.g. 'email addresses' or 'phone numbers with country code'"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={generateWithAi}
            disabled={aiLoading || !aiPrompt.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate
          </button>
        </div>
      </div>

      {/* Pattern input */}
      <div className="flex gap-2 items-center">
        <span className="text-muted-foreground font-mono">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter regex pattern..."
          className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          spellCheck={false}
        />
        <span className="text-muted-foreground font-mono">/</span>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          className="w-16 rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="gi"
        />
        {pattern && (
          <button onClick={copyPattern} className="text-muted-foreground hover:text-foreground">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>

      {regexError && <p className="text-sm text-destructive">{regexError}</p>}

      {/* Test string */}
      <div>
        <label className="block text-sm font-medium mb-2 text-muted-foreground">Test String</label>
        <div className="relative rounded-lg border border-border bg-muted/50 p-4 min-h-[160px] font-mono text-sm whitespace-pre-wrap break-all">
          {typeof highlightedText === "string" ? (
            <span>{highlightedText}</span>
          ) : (
            highlightedText.map((part, i) =>
              part.isMatch ? (
                <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{part.text}</mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )
          )}
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-foreground resize-none focus:outline-none"
            placeholder="Enter test string..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Match results */}
      {matches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            {matches.length} match{matches.length !== 1 ? "es" : ""} found
          </h3>
          <div className="space-y-1">
            {matches.slice(0, 50).map((m, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-mono rounded bg-muted/50 px-3 py-1.5">
                <span className="text-muted-foreground text-xs w-8">#{i + 1}</span>
                <span className="text-primary">{m.match}</span>
                <span className="text-muted-foreground text-xs ml-auto">index: {m.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
