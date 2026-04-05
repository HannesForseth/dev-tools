"use client";

import { useState, useCallback, useMemo } from "react";
import { Copy, Check, Clock, Sparkles, Loader2 } from "lucide-react";

const FIELDS = ["Minute", "Hour", "Day (Month)", "Month", "Day (Week)"] as const;
const FIELD_RANGES = [
  { min: 0, max: 59, label: "0-59" },
  { min: 0, max: 23, label: "0-23" },
  { min: 1, max: 31, label: "1-31" },
  { min: 1, max: 12, label: "1-12" },
  { min: 0, max: 6, label: "0-6 (Sun-Sat)" },
];

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every day at noon", cron: "0 12 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every weekday at 9am", cron: "0 9 * * 1-5" },
  { label: "First of every month", cron: "0 0 1 * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every 6 hours", cron: "0 */6 * * *" },
  { label: "Sunday at 3am", cron: "0 3 * * 0" },
];

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (need 5 fields)";

  const [min, hour, dom, month, dow] = parts;

  // Validate basic characters
  for (const p of parts) {
    if (!/^[\d,\-\*\/]+$/.test(p)) return "Invalid characters in expression";
  }

  const pieces: string[] = [];

  // Time
  if (min === "*" && hour === "*") {
    pieces.push("Every minute");
  } else if (min.startsWith("*/")) {
    pieces.push(`Every ${min.slice(2)} minutes`);
  } else if (hour === "*") {
    pieces.push(`At minute ${min} of every hour`);
  } else if (hour.startsWith("*/")) {
    pieces.push(`At minute ${min}, every ${hour.slice(2)} hours`);
  } else {
    const h = parseInt(hour);
    const m = parseInt(min);
    if (!isNaN(h) && !isNaN(m)) {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      pieces.push(`At ${h12}:${m.toString().padStart(2, "0")} ${ampm}`);
    } else {
      pieces.push(`At ${hour}:${min.padStart(2, "0")}`);
    }
  }

  // Day of month
  if (dom !== "*") {
    if (dom.startsWith("*/")) {
      pieces.push(`every ${dom.slice(2)} days`);
    } else {
      pieces.push(`on day ${dom} of the month`);
    }
  }

  // Month
  if (month !== "*") {
    if (month.includes(",")) {
      const months = month.split(",").map((m) => MONTH_NAMES[parseInt(m)] || m).join(", ");
      pieces.push(`in ${months}`);
    } else if (month.includes("-")) {
      const [start, end] = month.split("-");
      pieces.push(`from ${MONTH_NAMES[parseInt(start)] || start} to ${MONTH_NAMES[parseInt(end)] || end}`);
    } else {
      pieces.push(`in ${MONTH_NAMES[parseInt(month)] || month}`);
    }
  }

  // Day of week
  if (dow !== "*") {
    if (dow.includes(",")) {
      const days = dow.split(",").map((d) => DAY_NAMES[parseInt(d)] || d).join(", ");
      pieces.push(`on ${days}`);
    } else if (dow.includes("-")) {
      const [start, end] = dow.split("-");
      pieces.push(`${DAY_NAMES[parseInt(start)] || start} through ${DAY_NAMES[parseInt(end)] || end}`);
    } else {
      pieces.push(`on ${DAY_NAMES[parseInt(dow)] || dow}`);
    }
  }

  return pieces.join(", ");
}

function getNextRuns(cron: string, count: number = 5): string[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minField, hourField, domField, monthField, dowField] = parts;
  const results: string[] = [];
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

  function matches(value: number, field: string, min: number): boolean {
    if (field === "*") return true;
    if (field.startsWith("*/")) {
      const step = parseInt(field.slice(2));
      return (value - min) % step === 0;
    }
    if (field.includes(",")) return field.split(",").map(Number).includes(value);
    if (field.includes("-")) {
      const [start, end] = field.split("-").map(Number);
      return value >= start && value <= end;
    }
    return value === parseInt(field);
  }

  for (let i = 0; i < 525600 && results.length < count; i++) {
    current.setMinutes(current.getMinutes() + 1);
    const m = current.getMinutes();
    const h = current.getHours();
    const d = current.getDate();
    const mo = current.getMonth() + 1;
    const dw = current.getDay();

    if (
      matches(m, minField, 0) &&
      matches(h, hourField, 0) &&
      matches(d, domField, 1) &&
      matches(mo, monthField, 1) &&
      matches(dw, dowField, 0)
    ) {
      results.push(
        current.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
  }

  return results;
}

export function CronGenerator() {
  const [fields, setFields] = useState(["0", "0", "*", "*", "*"]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cron = fields.join(" ");
  const description = useMemo(() => describeCron(cron), [cron]);
  const nextRuns = useMemo(() => getNextRuns(cron), [cron]);

  const setField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  const applyPreset = (preset: string) => {
    setFields(preset.split(" "));
  };

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cron]);

  const generateFromAi = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
      } else if (data.expression) {
        const parts = data.expression.trim().split(/\s+/);
        if (parts.length === 5) {
          setFields(parts);
        }
      }
    } catch {
      setAiError("Failed to generate. Try again.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  return (
    <div className="space-y-6">
      {/* AI Builder */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Cron Builder</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            AI
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateFromAi()}
            placeholder='e.g. "Every weekday at 9:30am" or "Twice a day on weekends"'
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={generateFromAi}
            disabled={aiLoading || !aiPrompt.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate
          </button>
        </div>
        {aiError && <p className="mt-2 text-sm text-destructive">{aiError}</p>}
      </div>

      {/* Expression display */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-5 py-4">
        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
        <code className="flex-1 text-xl font-mono font-bold tracking-wider">{cron}</code>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Human description */}
      <div className="rounded-lg bg-accent/50 px-4 py-3 text-sm">
        {description}
      </div>

      {/* Field editors */}
      <div className="grid grid-cols-5 gap-3">
        {FIELDS.map((label, i) => (
          <div key={label}>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
            <input
              type="text"
              value={fields[i]}
              onChange={(e) => setField(i, e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="block text-[10px] text-muted-foreground mt-1 text-center">{FIELD_RANGES[i].label}</span>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-sm font-medium mb-3">Common Presets</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.cron}
              onClick={() => applyPreset(preset.cron)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Next 5 Runs</h3>
          <div className="space-y-1.5">
            {nextRuns.map((run, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono">
                <span className="text-muted-foreground text-xs w-5">{i + 1}.</span>
                {run}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cheat sheet */}
      <details className="rounded-xl border border-border">
        <summary className="cursor-pointer px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
          Cron Syntax Cheat Sheet
        </summary>
        <div className="px-5 pb-4 text-sm text-muted-foreground space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Meaning</th>
                  <th className="py-2">Example</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-border/50"><td className="py-1.5 pr-4">*</td><td className="pr-4 font-sans">Any value</td><td>* * * * *</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 pr-4">,</td><td className="pr-4 font-sans">List</td><td>1,15 * * * *</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 pr-4">-</td><td className="pr-4 font-sans">Range</td><td>1-5 (Mon-Fri)</td></tr>
                <tr><td className="py-1.5 pr-4">*/n</td><td className="pr-4 font-sans">Every n</td><td>*/15 * * * *</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}
