"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

type Base = "bin" | "oct" | "dec" | "hex";

interface BaseConfig {
  key: Base;
  label: string;
  prefix: string;
  radix: number;
  validChars: RegExp;
  placeholder: string;
  groupSize: number;
}

const BASES: BaseConfig[] = [
  { key: "bin", label: "Binary (Base 2)", prefix: "0b", radix: 2, validChars: /^[01]*$/, placeholder: "e.g. 11010110", groupSize: 4 },
  { key: "oct", label: "Octal (Base 8)", prefix: "0o", radix: 8, validChars: /^[0-7]*$/, placeholder: "e.g. 326", groupSize: 3 },
  { key: "dec", label: "Decimal (Base 10)", prefix: "", radix: 10, validChars: /^[0-9]*$/, placeholder: "e.g. 214", groupSize: 3 },
  { key: "hex", label: "Hexadecimal (Base 16)", prefix: "0x", radix: 16, validChars: /^[0-9a-fA-F]*$/, placeholder: "e.g. D6", groupSize: 4 },
];

const COMMON_VALUES = [
  { label: "MAX_INT8", dec: "127", desc: "8-bit signed max" },
  { label: "MAX_UINT8", dec: "255", desc: "8-bit unsigned max" },
  { label: "MAX_INT16", dec: "32767", desc: "16-bit signed max" },
  { label: "MAX_UINT16", dec: "65535", desc: "16-bit unsigned max" },
  { label: "MAX_INT32", dec: "2147483647", desc: "32-bit signed max" },
  { label: "MAX_UINT32", dec: "4294967295", desc: "32-bit unsigned max" },
  { label: "MAX_SAFE_INTEGER", dec: "9007199254740991", desc: "JavaScript Number.MAX_SAFE_INTEGER" },
];

function groupDigits(value: string, groupSize: number): string {
  if (!value) return "";
  // Pad from the left so groups align to the right
  const padded = value;
  const groups: string[] = [];
  for (let i = padded.length; i > 0; i -= groupSize) {
    const start = Math.max(0, i - groupSize);
    groups.unshift(padded.slice(start, i));
  }
  return groups.join(" ");
}

function getBitLength(binValue: string): string {
  if (!binValue) return "0-bit";
  const len = binValue.length;
  if (len <= 8) return "8-bit";
  if (len <= 16) return "16-bit";
  if (len <= 32) return "32-bit";
  if (len <= 64) return "64-bit";
  return `${len}-bit`;
}

export function NumberBaseConverter() {
  const [values, setValues] = useState<Record<Base, string>>({
    bin: "",
    oct: "",
    dec: "",
    hex: "",
  });
  const [activeBase, setActiveBase] = useState<Base | null>(null);
  const [showPrefix, setShowPrefix] = useState(false);
  const [grouping, setGrouping] = useState(true);
  const [copiedField, setCopiedField] = useState<Base | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertFromBase = useCallback((value: string, sourceBase: Base) => {
    if (!value.trim()) {
      setValues({ bin: "", oct: "", dec: "", hex: "" });
      setError(null);
      return;
    }

    const config = BASES.find((b) => b.key === sourceBase)!;

    // Validate input
    if (!config.validChars.test(value)) {
      setError(`Invalid character for ${config.label}`);
      return;
    }

    try {
      // Use BigInt for large number support
      const decimal = BigInt(
        sourceBase === "hex" ? "0x" + value :
        sourceBase === "oct" ? "0o" + value :
        sourceBase === "bin" ? "0b" + value :
        value
      );

      if (decimal < BigInt(0)) {
        setError("Negative numbers are not supported");
        return;
      }

      const newValues: Record<Base, string> = {
        bin: decimal.toString(2),
        oct: decimal.toString(8),
        dec: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase(),
      };

      // Keep the source field as the user typed it
      newValues[sourceBase] = value;

      setValues(newValues);
      setError(null);
    } catch {
      setError("Invalid number");
    }
  }, []);

  const handleInput = (value: string, base: Base) => {
    // Strip spaces (from grouped display) and prefixes
    const cleaned = value.replace(/\s/g, "").replace(/^0[bBxXoO]/, "");
    setActiveBase(base);
    setValues((prev) => ({ ...prev, [base]: cleaned }));
    convertFromBase(cleaned, base);
  };

  const copyValue = async (base: Base) => {
    const config = BASES.find((b) => b.key === base)!;
    const raw = values[base];
    if (!raw) return;
    const text = showPrefix ? config.prefix + raw : raw;
    await navigator.clipboard.writeText(text);
    setCopiedField(base);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadCommonValue = (dec: string) => {
    setActiveBase("dec");
    convertFromBase(dec, "dec");
  };

  const clearAll = () => {
    setValues({ bin: "", oct: "", dec: "", hex: "" });
    setError(null);
    setActiveBase(null);
  };

  const getDisplayValue = (base: Base): string => {
    const config = BASES.find((b) => b.key === base)!;
    const raw = values[base];
    if (!raw) return "";
    // If this is the active field, show raw input (no grouping while typing)
    if (activeBase === base) return raw;
    return grouping ? groupDigits(raw, config.groupSize) : raw;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowPrefix(!showPrefix)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            showPrefix
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted"
          }`}
        >
          Prefix {showPrefix ? "ON" : "OFF"}
          <span className="text-xs text-muted-foreground ml-1">0b 0o 0x</span>
        </button>
        <button
          onClick={() => setGrouping(!grouping)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            grouping
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted"
          }`}
        >
          Grouping {grouping ? "ON" : "OFF"}
        </button>
        {values.bin && (
          <span className="text-sm text-muted-foreground font-mono">
            {getBitLength(values.bin)}
          </span>
        )}
        <button
          onClick={clearAll}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Base fields */}
      <div className="space-y-3">
        {BASES.map((config) => (
          <div key={config.key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {config.label}
              </label>
              {values[config.key] && (
                <button
                  onClick={() => copyValue(config.key)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === config.key ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedField === config.key ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div className="relative">
              {showPrefix && config.prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground">
                  {config.prefix}
                </span>
              )}
              <input
                type="text"
                value={getDisplayValue(config.key)}
                onChange={(e) => handleInput(e.target.value, config.key)}
                onFocus={() => setActiveBase(config.key)}
                onBlur={() => setActiveBase(null)}
                placeholder={config.placeholder}
                className={`w-full rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  showPrefix && config.prefix ? "pl-10" : ""
                }`}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Common Values Reference */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-medium mb-3">Common Values</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {COMMON_VALUES.map((val) => (
            <button
              key={val.label}
              onClick={() => loadCommonValue(val.dec)}
              className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              <div>
                <span className="font-mono font-medium">{val.label}</span>
                <p className="text-xs text-muted-foreground">{val.desc}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground ml-2">
                {val.dec.length > 10 ? val.dec.slice(0, 8) + "..." : val.dec}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
