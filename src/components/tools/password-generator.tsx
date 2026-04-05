"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, RefreshCw, Shield, Eye, EyeOff } from "lucide-react";

const DEFAULT_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  customSymbols: string;
  count: number;
}

interface StrengthResult {
  label: string;
  color: string;
  bgColor: string;
  percent: number;
}

function getCharacterPool(options: PasswordOptions): string {
  let pool = "";
  if (options.lowercase) pool += "abcdefghijklmnopqrstuvwxyz";
  if (options.uppercase) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.numbers) pool += "0123456789";
  if (options.symbols) pool += options.customSymbols;
  return pool;
}

function generatePassword(options: PasswordOptions): string {
  const pool = getCharacterPool(options);
  if (pool.length === 0) return "";

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < options.length; i++) {
    password += pool[array[i] % pool.length];
  }
  return password;
}

function calculateEntropy(options: PasswordOptions): number {
  const poolSize = getCharacterPool(options).length;
  if (poolSize === 0) return 0;
  return Math.round(options.length * Math.log2(poolSize) * 100) / 100;
}

function getStrength(entropy: number): StrengthResult {
  if (entropy < 36) {
    return { label: "Weak", color: "text-red-500", bgColor: "bg-red-500", percent: 20 };
  }
  if (entropy < 60) {
    return { label: "Fair", color: "text-orange-500", bgColor: "bg-orange-500", percent: 45 };
  }
  if (entropy < 80) {
    return { label: "Strong", color: "text-yellow-500", bgColor: "bg-yellow-500", percent: 70 };
  }
  return { label: "Very Strong", color: "text-green-500", bgColor: "bg-green-500", percent: 100 };
}

function estimateCrackTime(entropy: number): string {
  // Assuming 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 1e10;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond / 2; // average case

  if (seconds < 1) return "instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1e3) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${(seconds / 31536000 / 1e3).toFixed(1)}k years`;
  if (seconds < 31536000 * 1e9) return `${(seconds / 31536000 / 1e6).toFixed(1)}M years`;
  if (seconds < 31536000 * 1e12) return `${(seconds / 31536000 / 1e9).toFixed(1)}B years`;
  return "heat death of the universe+";
}

export function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    customSymbols: DEFAULT_SYMBOLS,
    count: 1,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPasswords, setShowPasswords] = useState(true);
  const [showCustomSymbols, setShowCustomSymbols] = useState(false);

  const generate = useCallback(() => {
    const pool = getCharacterPool(options);
    if (pool.length === 0) {
      setPasswords([]);
      return;
    }
    const newPasswords = Array.from({ length: options.count }, () =>
      generatePassword(options)
    );
    setPasswords(newPasswords);
  }, [options]);

  // Generate on mount and when options change
  useEffect(() => {
    generate();
  }, [generate]);

  const copyOne = async (index: number) => {
    await navigator.clipboard.writeText(passwords[index]);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(passwords.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const updateOption = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const entropy = calculateEntropy(options);
  const strength = getStrength(entropy);
  const crackTime = estimateCrackTime(entropy);
  const poolSize = getCharacterPool(options).length;
  const hasPool = poolSize > 0;

  return (
    <div className="space-y-6">
      {/* Length slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">
            Password Length
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={8}
              max={128}
              value={options.length}
              onChange={(e) => {
                const v = Math.max(8, Math.min(128, Number(e.target.value) || 8));
                updateOption("length", v);
              }}
              className="w-16 rounded-lg border border-border bg-muted/50 px-2 py-1 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
        <input
          type="range"
          min={8}
          max={128}
          value={options.length}
          onChange={(e) => updateOption("length", Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-muted"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>8</span>
          <span>32</span>
          <span>64</span>
          <span>96</span>
          <span>128</span>
        </div>
      </div>

      {/* Character type toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "uppercase" as const, label: "Uppercase", hint: "A-Z" },
          { key: "lowercase" as const, label: "Lowercase", hint: "a-z" },
          { key: "numbers" as const, label: "Numbers", hint: "0-9" },
          { key: "symbols" as const, label: "Symbols", hint: "!@#$..." },
        ].map(({ key, label, hint }) => (
          <button
            key={key}
            onClick={() => updateOption(key, !options[key])}
            className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-3 text-sm transition-colors ${
              options[key]
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            <span className="font-medium">{label}</span>
            <span className="text-xs opacity-70">{hint}</span>
          </button>
        ))}
      </div>

      {/* Custom symbols */}
      {options.symbols && (
        <div>
          <button
            onClick={() => setShowCustomSymbols(!showCustomSymbols)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCustomSymbols ? "Hide" : "Customize"} symbol characters
          </button>
          {showCustomSymbols && (
            <div className="mt-2">
              <input
                type="text"
                value={options.customSymbols}
                onChange={(e) => updateOption("customSymbols", e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                spellCheck={false}
              />
              <button
                onClick={() => updateOption("customSymbols", DEFAULT_SYMBOLS)}
                className="text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors"
              >
                Reset to default
              </button>
            </div>
          )}
        </div>
      )}

      {/* Count selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Generate</label>
        <select
          value={options.count}
          onChange={(e) => updateOption("count", Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          password{options.count > 1 ? "s" : ""} at a time
        </span>
      </div>

      {/* Strength indicator */}
      {hasPool && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Password Strength</span>
            </div>
            <span className={`text-sm font-semibold ${strength.color}`}>
              {strength.label}
            </span>
          </div>

          {/* Strength bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.bgColor}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-mono font-semibold">{entropy}</div>
              <div className="text-xs text-muted-foreground">bits of entropy</div>
            </div>
            <div>
              <div className="text-lg font-mono font-semibold">{poolSize}</div>
              <div className="text-xs text-muted-foreground">character pool</div>
            </div>
            <div>
              <div className="text-lg font-mono font-semibold truncate" title={crackTime}>
                {crackTime}
              </div>
              <div className="text-xs text-muted-foreground">to crack</div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={generate}
          disabled={!hasPool}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </button>

        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          {showPasswords ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {showPasswords ? "Hide" : "Show"}
        </button>

        {passwords.length > 1 && (
          <button
            onClick={copyAll}
            className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedAll ? "Copied all!" : "Copy all"}
          </button>
        )}
      </div>

      {/* No pool warning */}
      {!hasPool && (
        <div className="text-center py-6 text-sm text-red-500">
          Enable at least one character type to generate passwords.
        </div>
      )}

      {/* Generated passwords */}
      {passwords.length > 0 && (
        <div className="space-y-2">
          {passwords.map((pw, i) => (
            <div
              key={`${pw}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 font-mono text-sm group"
            >
              <span className="flex-1 select-all break-all">
                {showPasswords ? (
                  <PasswordHighlight password={pw} />
                ) : (
                  <span className="text-muted-foreground">
                    {"*".repeat(Math.min(pw.length, 40))}
                    {pw.length > 40 ? "..." : ""}
                  </span>
                )}
              </span>
              <button
                onClick={() => copyOne(i)}
                className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                title="Copy password"
              >
                {copied === i ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Color-codes password characters by type for readability */
function PasswordHighlight({ password }: { password: string }) {
  return (
    <>
      {password.split("").map((char, i) => {
        let className = "";
        if (/[a-z]/.test(char)) {
          className = "text-foreground";
        } else if (/[A-Z]/.test(char)) {
          className = "text-blue-500";
        } else if (/[0-9]/.test(char)) {
          className = "text-green-500";
        } else {
          className = "text-orange-500";
        }
        return (
          <span key={i} className={className}>
            {char}
          </span>
        );
      })}
    </>
  );
}
