"use client";

import { useState, useMemo } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";

interface DiffLine {
  type: "equal" | "add" | "delete";
  leftNum: number | null;
  rightNum: number | null;
  text: string;
}

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");

  // Simple LCS-based diff
  const m = leftLines.length;
  const n = rightLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to get diff
  const result: DiffLine[] = [];
  let i = m, j = n;
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      stack.push({ type: "equal", leftNum: i, rightNum: j, text: leftLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "add", leftNum: null, rightNum: j, text: rightLines[j - 1] });
      j--;
    } else {
      stack.push({ type: "delete", leftNum: i, rightNum: null, text: leftLines[i - 1] });
      i--;
    }
  }

  while (stack.length > 0) result.push(stack.pop()!);
  return result;
}

export function DiffChecker() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    if (!left && !right) return [];
    return computeDiff(left, right);
  }, [left, right]);

  const stats = useMemo(() => {
    const adds = diff.filter((d) => d.type === "add").length;
    const deletes = diff.filter((d) => d.type === "delete").length;
    const equal = diff.filter((d) => d.type === "equal").length;
    return { adds, deletes, equal };
  }, [diff]);

  const swap = () => {
    const temp = left;
    setLeft(right);
    setRight(temp);
  };

  const copyDiff = async () => {
    const text = diff
      .map((d) => {
        const prefix = d.type === "add" ? "+ " : d.type === "delete" ? "- " : "  ";
        return prefix + d.text;
      })
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={swap}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Swap
        </button>
        {diff.length > 0 && (
          <>
            <button
              onClick={copyDiff}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy diff"}
            </button>
            <div className="ml-auto flex gap-3 text-xs text-muted-foreground">
              <span className="text-success">+{stats.adds} added</span>
              <span className="text-destructive">-{stats.deletes} removed</span>
              <span>{stats.equal} unchanged</span>
            </div>
          </>
        )}
        <button
          onClick={() => { setLeft(""); setRight(""); }}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Input panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Original</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original text here..."
            className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Modified</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste modified text here..."
            className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff output */}
      {diff.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Differences</label>
          <div className="rounded-lg border border-border bg-muted/50 overflow-hidden font-mono text-sm">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`flex ${
                  line.type === "add"
                    ? "bg-success/10"
                    : line.type === "delete"
                    ? "bg-destructive/10"
                    : ""
                }`}
              >
                <span className="w-10 text-right text-xs text-muted-foreground px-2 py-0.5 select-none border-r border-border shrink-0">
                  {line.leftNum ?? ""}
                </span>
                <span className="w-10 text-right text-xs text-muted-foreground px-2 py-0.5 select-none border-r border-border shrink-0">
                  {line.rightNum ?? ""}
                </span>
                <span className={`w-6 text-center py-0.5 select-none shrink-0 ${
                  line.type === "add" ? "text-success" : line.type === "delete" ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {line.type === "add" ? "+" : line.type === "delete" ? "-" : " "}
                </span>
                <span className="px-2 py-0.5 whitespace-pre-wrap break-all flex-1">
                  {line.text || "\u00A0"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
