"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "dot";

const CASE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "title", label: "Title Case" },
  { value: "sentence", label: "Sentence case" },
  { value: "camel", label: "camelCase" },
  { value: "pascal", label: "PascalCase" },
  { value: "snake", label: "snake_case" },
  { value: "kebab", label: "kebab-case" },
  { value: "constant", label: "CONSTANT_CASE" },
  { value: "dot", label: "dot.case" },
];

function splitIntoWords(text: string): string[] {
  // Handle camelCase/PascalCase boundaries
  let normalized = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Handle UPPERCASE followed by lowercase (e.g., "XMLParser" -> "XML Parser")
  normalized = normalized.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  // Replace common separators with spaces
  normalized = normalized.replace(/[_\-./]+/g, " ");
  // Split on whitespace and filter empty
  return normalized.split(/\s+/).filter((w) => w.length > 0);
}

function convertCase(text: string, caseType: CaseType): string {
  if (!text) return "";

  switch (caseType) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
    case "sentence": {
      const lower = text.toLowerCase();
      return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (match) =>
        match.toUpperCase()
      );
    }
    case "camel": {
      const words = splitIntoWords(text);
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("");
    }
    case "pascal": {
      const words = splitIntoWords(text);
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    }
    case "snake": {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join("_");
    }
    case "kebab": {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join("-");
    }
    case "constant": {
      const words = splitIntoWords(text);
      return words.map((w) => w.toUpperCase()).join("_");
    }
    case "dot": {
      const words = splitIntoWords(text);
      return words.map((w) => w.toLowerCase()).join(".");
    }
    default:
      return text;
  }
}

export function TextCaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("upper");
  const [copied, setCopied] = useState(false);

  const process = useCallback((text: string, type: CaseType) => {
    if (!text.trim()) {
      setOutput("");
      return;
    }
    setOutput(convertCase(text, type));
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    process(value, caseType);
  };

  const changeCaseType = (type: CaseType) => {
    setCaseType(type);
    process(input, type);
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {CASE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => changeCaseType(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                caseType === option.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => { setInput(""); setOutput(""); }}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Input Text
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Enter text to convert..."
            className="w-full h-48 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              {CASE_OPTIONS.find((o) => o.value === caseType)?.label} Output
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
    </div>
  );
}
