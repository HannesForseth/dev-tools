"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Hash } from "lucide-react";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGORITHMS: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

async function computeHash(algorithm: Algorithm, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Simple MD5 implementation (not in Web Crypto API)
function md5(str: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);  d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);   b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);   d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);  b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);   d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);      b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);  d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);   d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);  b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);   d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);  b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);  b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);      d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);  d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);  b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);   d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);  b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);   d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);  b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);   d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);  d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);   b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);   d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);   d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);   b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  const n = str.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 64; i <= n; i += 64) {
    const block: number[] = [];
    for (let j = i - 64; j < i; j += 4) {
      block.push(
        str.charCodeAt(j) | (str.charCodeAt(j + 1) << 8) | (str.charCodeAt(j + 2) << 16) | (str.charCodeAt(j + 3) << 24)
      );
    }
    md5cycle(state, block);
  }
  for (let j = 0; j < 16; j++) tail[j] = 0;
  for (let j = 0; j < n % 64; j++) {
    tail[j >> 2] |= str.charCodeAt(i - 64 + (n % 64) + j - (n % 64) + j >= 0 ? 0 : 0);
  }
  // Simpler approach for tail
  const remaining = n % 64;
  for (let j = 0; j < 16; j++) tail[j] = 0;
  const offset = n - remaining;
  for (let j = 0; j < remaining; j++) {
    tail[j >> 2] |= str.charCodeAt(offset + j) << ((j % 4) * 8);
  }
  tail[remaining >> 2] |= 0x80 << ((remaining % 4) * 8);
  if (remaining > 55) {
    md5cycle(state, tail);
    for (let j = 0; j < 16; j++) tail[j] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);

  const hex = "0123456789abcdef";
  let result = "";
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < 4; k++) {
      const byte = (state[j] >> (k * 8)) & 0xff;
      result += hex.charAt((byte >> 4) & 0xf) + hex.charAt(byte & 0xf);
    }
  }
  return result;
}

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generateHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes({});
      return;
    }

    const results: Record<string, string> = {};
    results["MD5"] = md5(text);
    for (const algo of ALGORITHMS) {
      results[algo] = await computeHash(algo, text);
    }
    setHashes(results);
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    generateHashes(value);
  };

  const copyHash = async (algo: string) => {
    const hash = uppercase ? hashes[algo].toUpperCase() : hashes[algo];
    await navigator.clipboard.writeText(hash);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-muted-foreground">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-32 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          spellCheck={false}
        />
      </div>

      {/* Options */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded"
          />
          Uppercase output
        </label>
      </div>

      {/* Hashes */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{algo}</span>
                  <span className="text-[10px] text-muted-foreground">{hash.length * 4} bit</span>
                </div>
                <button
                  onClick={() => copyHash(algo)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied === algo ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  {copied === algo ? "Copied!" : "Copy"}
                </button>
              </div>
              <code className="block text-xs font-mono break-all text-muted-foreground select-all">
                {uppercase ? hash.toUpperCase() : hash}
              </code>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {Object.keys(hashes).length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Enter text above to generate hashes
        </div>
      )}
    </div>
  );
}
