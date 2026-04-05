"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw, Lock, Unlock } from "lucide-react";

interface PaletteColor {
  hex: string;
  locked: boolean;
}

function randomHex(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function generateHarmony(baseHex: string, type: string): string[] {
  const { h, s, l } = hexToHsl(baseHex);

  function hslToHex(h: number, s: number, l: number): string {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  switch (type) {
    case "complementary":
      return [baseHex, hslToHex(h + 180, s, l)];
    case "analogous":
      return [hslToHex(h - 30, s, l), baseHex, hslToHex(h + 30, s, l), hslToHex(h + 60, s, l), hslToHex(h - 60, s, l)];
    case "triadic":
      return [baseHex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    case "split-complementary":
      return [baseHex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)];
    case "shades":
      return [
        hslToHex(h, s, Math.min(95, l + 30)),
        hslToHex(h, s, Math.min(85, l + 15)),
        baseHex,
        hslToHex(h, s, Math.max(15, l - 15)),
        hslToHex(h, s, Math.max(5, l - 30)),
      ];
    default:
      return [baseHex];
  }
}

export function ColorPalette() {
  const [colors, setColors] = useState<PaletteColor[]>(() =>
    Array.from({ length: 5 }, () => ({ hex: randomHex(), locked: false }))
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [harmonyBase, setHarmonyBase] = useState("#3b82f6");
  const [harmonyType, setHarmonyType] = useState("analogous");

  const regenerate = useCallback(() => {
    setColors((prev) =>
      prev.map((c) => (c.locked ? c : { hex: randomHex(), locked: false }))
    );
  }, []);

  const toggleLock = (index: number) => {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)));
  };

  const updateColor = (index: number, hex: string) => {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, hex } : c)));
  };

  const copyColor = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyPalette = async () => {
    const text = colors.map((c) => c.hex).join(", ");
    await navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  const harmonyColors = generateHarmony(harmonyBase, harmonyType);

  return (
    <div className="space-y-8">
      {/* Random Palette */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Random Palette</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={copyPalette}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === "all" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              {copied === "all" ? "Copied!" : "Copy all"}
            </button>
            <button
              onClick={regenerate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3">Press spacebar to regenerate. Lock colors to keep them.</p>

        {/* Color bars */}
        <div className="flex rounded-xl overflow-hidden h-48 border border-border">
          {colors.map((color, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end pb-4 gap-2 relative group cursor-pointer"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyColor(color.hex)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(i);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                style={{ color: getContrastColor(color.hex) }}
              >
                {color.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateColor(i, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded cursor-pointer border-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span
                className="text-xs font-mono font-medium"
                style={{ color: getContrastColor(color.hex) }}
              >
                {color.hex.toUpperCase()}
              </span>
              {copied === color.hex && (
                <span className="text-[10px] font-medium" style={{ color: getContrastColor(color.hex) }}>
                  Copied!
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Color details */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          {colors.map((color, i) => {
            const rgb = hexToRgb(color.hex);
            const hsl = hexToHsl(color.hex);
            return (
              <div key={i} className="text-[10px] text-muted-foreground text-center space-y-0.5">
                <div className="font-mono">{color.hex.toUpperCase()}</div>
                <div className="font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                <div className="font-mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Harmony */}
      <div>
        <h3 className="text-sm font-medium mb-4">Color Harmony</h3>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Base:</label>
            <input
              type="color"
              value={harmonyBase}
              onChange={(e) => setHarmonyBase(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer border border-border"
            />
            <span className="text-xs font-mono text-muted-foreground">{harmonyBase.toUpperCase()}</span>
          </div>
          <select
            value={harmonyType}
            onChange={(e) => setHarmonyType(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="split-complementary">Split Complementary</option>
            <option value="shades">Shades</option>
          </select>
        </div>

        <div className="flex rounded-xl overflow-hidden h-24 border border-border">
          {harmonyColors.map((hex, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center cursor-pointer group"
              style={{ backgroundColor: hex }}
              onClick={() => copyColor(hex)}
            >
              <span
                className="text-xs font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: getContrastColor(hex) }}
              >
                {hex.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
