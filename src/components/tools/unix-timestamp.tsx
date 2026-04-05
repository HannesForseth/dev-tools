"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Clock, ArrowRightLeft, RefreshCw } from "lucide-react";

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatISO(date: Date): string {
  return date.toISOString();
}

function formatUTC(date: Date): string {
  return date.toUTCString();
}

function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;

  if (abs < 60_000) return future ? "in a few seconds" : "a few seconds ago";
  if (abs < 3_600_000) {
    const mins = Math.floor(abs / 60_000);
    return future ? `in ${mins} minute${mins > 1 ? "s" : ""}` : `${mins} minute${mins > 1 ? "s" : ""} ago`;
  }
  if (abs < 86_400_000) {
    const hrs = Math.floor(abs / 3_600_000);
    return future ? `in ${hrs} hour${hrs > 1 ? "s" : ""}` : `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  }
  const days = Math.floor(abs / 86_400_000);
  return future ? `in ${days} day${days > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""} ago`;
}

export function UnixTimestamp() {
  const [mode, setMode] = useState<"toDate" | "toTimestamp">("toDate");
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [result, setResult] = useState<{ date: Date; timestamp: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const convertTimestamp = useCallback((input: string) => {
    setTimestampInput(input);
    if (!input.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    const num = Number(input.trim());
    if (isNaN(num)) {
      setError("Please enter a valid number");
      setResult(null);
      return;
    }
    // Auto-detect seconds vs milliseconds
    const ms = num > 1e12 ? num : num * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      setError("Invalid timestamp");
      setResult(null);
      return;
    }
    setError(null);
    setResult({ date, timestamp: Math.floor(ms / 1000) });
  }, []);

  const convertDate = useCallback((dateStr: string, timeStr: string) => {
    setDateInput(dateStr);
    setTimeInput(timeStr);
    if (!dateStr) {
      setResult(null);
      setError(null);
      return;
    }
    const combined = `${dateStr}T${timeStr || "00:00:00"}`;
    const date = new Date(combined);
    if (isNaN(date.getTime())) {
      setError("Invalid date/time");
      setResult(null);
      return;
    }
    setError(null);
    setResult({ date, timestamp: Math.floor(date.getTime() / 1000) });
  }, []);

  const setNow = () => {
    const now = new Date();
    const ts = Math.floor(now.getTime() / 1000);
    setCurrentTime(ts);
    if (mode === "toDate") {
      setTimestampInput(ts.toString());
      setResult({ date: now, timestamp: ts });
    } else {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const d = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const t = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setDateInput(d);
      setTimeInput(t);
      setResult({ date: now, timestamp: ts });
    }
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Current time banner */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <span className="text-sm text-muted-foreground">Current Unix timestamp: </span>
          <button
            onClick={() => {
              const now = Math.floor(Date.now() / 1000);
              setCurrentTime(now);
              copyValue(now.toString(), "current");
            }}
            className="font-mono text-sm font-medium hover:text-primary transition-colors"
          >
            {currentTime}
          </button>
          {copied === "current" && <span className="ml-2 text-xs text-green-500">Copied!</span>}
        </div>
        <button
          onClick={() => setCurrentTime(Math.floor(Date.now() / 1000))}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            const newMode = mode === "toDate" ? "toTimestamp" : "toDate";
            setMode(newMode);
            setResult(null);
            setError(null);
            setTimestampInput("");
            setDateInput("");
            setTimeInput("");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {mode === "toDate" ? "Timestamp → Date" : "Date → Timestamp"}
        </button>
        <button
          onClick={setNow}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          Use current time
        </button>
        <button
          onClick={() => {
            setTimestampInput("");
            setDateInput("");
            setTimeInput("");
            setResult(null);
            setError(null);
          }}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Input */}
      {mode === "toDate" ? (
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Unix Timestamp (seconds or milliseconds)
          </label>
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => convertTimestamp(e.target.value)}
            placeholder="e.g. 1700000000 or 1700000000000"
            className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Date</label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => convertDate(e.target.value, timeInput)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Time</label>
            <input
              type="time"
              step="1"
              value={timeInput}
              onChange={(e) => convertDate(dateInput, e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Conversion Results</h3>
          <div className="rounded-lg border border-border divide-y divide-border">
            {[
              { label: "Unix Timestamp (s)", value: result.timestamp.toString() },
              { label: "Unix Timestamp (ms)", value: (result.timestamp * 1000).toString() },
              { label: "Local Date/Time", value: formatDate(result.date) },
              { label: "ISO 8601", value: formatISO(result.date) },
              { label: "UTC String", value: formatUTC(result.date) },
              { label: "Relative", value: formatRelative(result.date) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{row.value}</span>
                  <button
                    onClick={() => copyValue(row.value, row.label)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === row.label ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common timestamps reference */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Common Timestamps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { label: "Unix Epoch", ts: 0 },
            { label: "Y2K", ts: 946684800 },
            { label: "1 Billion", ts: 1000000000 },
            { label: "2 Billion", ts: 2000000000 },
            { label: "Max 32-bit", ts: 2147483647 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setMode("toDate");
                setTimestampInput(item.ts.toString());
                convertTimestamp(item.ts.toString());
              }}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono">{item.ts}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
