"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";

// Minimal YAML parser (handles common cases: objects, arrays, strings, numbers, booleans, null, nested)
function parseYaml(yaml: string): unknown {
  const lines = yaml.split("\n");
  let i = 0;

  function getIndent(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  function parseValue(val: string): unknown {
    val = val.trim();
    if (val === "" || val === "null" || val === "~") return null;
    if (val === "true") return true;
    if (val === "false") return false;
    if (/^-?\d+$/.test(val)) return parseInt(val, 10);
    if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      return val.slice(1, -1);
    // Inline array [a, b, c]
    if (val.startsWith("[") && val.endsWith("]")) {
      return val.slice(1, -1).split(",").map((v) => parseValue(v.trim()));
    }
    return val;
  }

  function parseBlock(minIndent: number): unknown {
    // Detect if this is a list or object
    while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith("#"))) i++;
    if (i >= lines.length) return null;

    const firstLine = lines[i];
    const firstIndent = getIndent(firstLine);
    if (firstIndent < minIndent) return null;

    const trimmed = firstLine.trim();
    if (trimmed.startsWith("- ")) {
      // Array
      const arr: unknown[] = [];
      while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
        const indent = getIndent(line);
        if (indent < firstIndent) break;
        if (indent === firstIndent && line.trim().startsWith("- ")) {
          const val = line.trim().slice(2).trim();
          if (val.includes(": ")) {
            // Array of objects - first key on same line
            const obj: Record<string, unknown> = {};
            const [k, ...rest] = val.split(": ");
            obj[k.trim()] = parseValue(rest.join(": "));
            i++;
            // Read subsequent keys at deeper indent
            while (i < lines.length) {
              const nextLine = lines[i];
              if (nextLine.trim() === "") { i++; continue; }
              const nextIndent = getIndent(nextLine);
              if (nextIndent <= firstIndent) break;
              if (nextLine.trim().includes(": ")) {
                const [nk, ...nv] = nextLine.trim().split(": ");
                obj[nk.trim()] = parseValue(nv.join(": "));
              }
              i++;
            }
            arr.push(obj);
          } else if (val === "") {
            i++;
            arr.push(parseBlock(firstIndent + 2));
          } else {
            arr.push(parseValue(val));
            i++;
          }
        } else {
          break;
        }
      }
      return arr;
    } else if (trimmed.includes(": ")) {
      // Object
      const obj: Record<string, unknown> = {};
      while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
        const indent = getIndent(line);
        if (indent < firstIndent) break;
        if (indent > firstIndent) { i++; continue; }
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) { i++; continue; }
        const key = line.slice(indent, colonIdx).trim();
        const valStr = line.slice(colonIdx + 1).trim();
        i++;
        if (valStr === "" || valStr === "|" || valStr === ">") {
          obj[key] = parseBlock(indent + 2);
        } else {
          obj[key] = parseValue(valStr);
        }
      }
      return obj;
    }
    i++;
    return parseValue(trimmed);
  }

  return parseBlock(0);
}

// JSON to YAML converter
function jsonToYaml(obj: unknown, indent: number = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "boolean") return obj.toString();
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(": ") || obj.includes("#") || obj.startsWith("{") || obj.startsWith("["))
      return `"${obj.replace(/"/g, '\\"')}"`;
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => {
      const val = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const lines = val.split("\n");
        return `${pad}- ${lines[0].trim()}\n${lines.slice(1).map((l) => `${pad}  ${l.trim()}`).join("\n")}`;
      }
      return `${pad}- ${val}`;
    }).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      if (typeof val === "object" && val !== null) {
        return `${pad}${key}:\n${jsonToYaml(val, indent + 1)}`;
      }
      return `${pad}${key}: ${jsonToYaml(val, indent)}`;
    }).join("\n");
  }
  return String(obj);
}

export function YamlJsonConverter() {
  const [mode, setMode] = useState<"yamlToJson" | "jsonToYaml">("yamlToJson");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convert = useCallback((text: string, m: "yamlToJson" | "jsonToYaml") => {
    if (!text.trim()) { setOutput(""); setError(null); return; }
    try {
      if (m === "yamlToJson") {
        const parsed = parseYaml(text);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(text);
        setOutput(jsonToYaml(parsed));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, []);

  const handleInput = (val: string) => {
    setInput(val);
    convert(val, mode);
  };

  const toggleMode = () => {
    const newMode = mode === "yamlToJson" ? "jsonToYaml" : "yamlToJson";
    setMode(newMode);
    const newInput = output;
    setInput(newInput);
    setOutput("");
    setError(null);
    convert(newInput, newMode);
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
          {mode === "yamlToJson" ? "YAML → JSON" : "JSON → YAML"}
        </button>
        <button onClick={() => { setInput(""); setOutput(""); setError(null); }} className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            {mode === "yamlToJson" ? "YAML Input" : "JSON Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === "yamlToJson" ? "name: John\nage: 30\ntags:\n  - dev\n  - ai" : '{"name": "John", "age": 30}'}
            className="w-full h-72 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {mode === "yamlToJson" ? "JSON Output" : "YAML Output"}
            </label>
            {output && (
              <button onClick={copyOutput} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea value={output} readOnly placeholder="Output will appear here..." className="w-full h-72 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none" spellCheck={false} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
