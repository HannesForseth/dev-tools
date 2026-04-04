"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw, Plus } from "lucide-react";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => [generateUUID()]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = useCallback(() => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  }, [count]);

  const formatUuid = (uuid: string) => {
    let result = uuid;
    if (noDashes) result = result.replace(/-/g, "");
    if (uppercase) result = result.toUpperCase();
    return result;
  };

  const copyOne = async (index: number) => {
    await navigator.clipboard.writeText(formatUuid(uuids[index]));
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    const text = uuids.map(formatUuid).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Count:</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {[1, 5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded"
          />
          Uppercase
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noDashes}
            onChange={(e) => setNoDashes(e.target.checked)}
            className="rounded"
          />
          No dashes
        </label>

        {uuids.length > 1 && (
          <button
            onClick={copyAll}
            className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedAll ? "Copied all!" : "Copy all"}
          </button>
        )}
      </div>

      {/* UUIDs */}
      <div className="space-y-2">
        {uuids.map((uuid, i) => (
          <div
            key={`${uuid}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-sm group"
          >
            <span className="flex-1 select-all break-all">{formatUuid(uuid)}</span>
            <button
              onClick={() => copyOne(i)}
              className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
              title="Copy"
            >
              {copied === i ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
