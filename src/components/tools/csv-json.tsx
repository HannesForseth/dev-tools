"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ArrowRightLeft, Upload, Download } from "lucide-react";

function csvToJson(csv: string, delimiter: string): object[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV needs at least a header row and one data row");

  const headers = parseCsvLine(lines[0], delimiter);
  const result: object[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], delimiter);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || "").trim();
    });
    result.push(obj);
  }
  return result;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function jsonToCsv(json: object[], delimiter: string): string {
  if (!Array.isArray(json) || json.length === 0) throw new Error("Input must be a non-empty JSON array");

  const headers = Object.keys(json[0]);
  const escapeCsv = (val: unknown): string => {
    const str = val === null || val === undefined ? "" : String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.map(escapeCsv).join(delimiter)];
  for (const row of json) {
    const r = row as Record<string, unknown>;
    lines.push(headers.map((h) => escapeCsv(r[h])).join(delimiter));
  }
  return lines.join("\n");
}

export function CsvJsonConverter() {
  const [mode, setMode] = useState<"csvToJson" | "jsonToCsv">("csvToJson");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convert = useCallback((text: string, m: "csvToJson" | "jsonToCsv", delim: string) => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (m === "csvToJson") {
        const result = csvToJson(text, delim);
        setOutput(JSON.stringify(result, null, 2));
      } else {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("JSON input must be an array of objects");
        setOutput(jsonToCsv(parsed, delim));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    convert(value, mode, delimiter);
  };

  const toggleMode = () => {
    const newMode = mode === "csvToJson" ? "jsonToCsv" : "csvToJson";
    setMode(newMode);
    const newInput = output;
    setInput(newInput);
    setOutput("");
    setError(null);
    convert(newInput, newMode, delimiter);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    if (!output) return;
    const ext = mode === "csvToJson" ? "json" : "csv";
    const type = mode === "csvToJson" ? "application/json" : "text/csv";
    const blob = new Blob([output], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
      convert(text, mode, delimiter);
    };
    reader.readAsText(file);
    e.target.value = "";
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
          {mode === "csvToJson" ? "CSV → JSON" : "JSON → CSV"}
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Delimiter:</label>
          <select
            value={delimiter}
            onChange={(e) => {
              setDelimiter(e.target.value);
              convert(input, mode, e.target.value);
            }}
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>

        <label className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
          <Upload className="h-3.5 w-3.5" />
          Upload file
          <input type="file" accept=".csv,.json,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
        </label>

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
            {mode === "csvToJson" ? "CSV Input" : "JSON Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={
              mode === "csvToJson"
                ? "name,email,age\nJohn,john@example.com,30\nJane,jane@example.com,25"
                : '[{"name": "John", "email": "john@example.com", "age": "30"}]'
            }
            className="w-full h-72 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {mode === "csvToJson" ? "JSON Output" : "CSV Output"}
            </label>
            {output && (
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadOutput}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
                <button
                  onClick={copyOutput}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="w-full h-72 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Stats */}
      {output && mode === "csvToJson" && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Rows: {JSON.parse(output).length}</span>
          <span>Fields: {Object.keys(JSON.parse(output)[0] || {}).length}</span>
        </div>
      )}
    </div>
  );
}
