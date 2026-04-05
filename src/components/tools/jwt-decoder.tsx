"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Copy,
  Check,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Info,
} from "lucide-react";

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  rawParts: [string, string, string];
}

interface Warning {
  type: "error" | "warning" | "info";
  message: string;
}

const CLAIM_LABELS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration Time",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
  name: "Full Name",
  email: "Email",
  role: "Role",
  scope: "Scope",
  azp: "Authorized Party",
  nonce: "Nonce",
  at_hash: "Access Token Hash",
  c_hash: "Code Hash",
  auth_time: "Authentication Time",
  acr: "Authentication Context Class",
  amr: "Authentication Methods",
  typ: "Token Type",
  sid: "Session ID",
};

const TIMESTAMP_CLAIMS = new Set(["exp", "nbf", "iat", "auth_time"]);

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and pad
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

function signatureToHex(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  try {
    const raw = atob(base64);
    return Array.from(raw)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return str;
  }
}

function formatTimestamp(ts: number): string {
  try {
    return new Date(ts * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "long",
    });
  } catch {
    return String(ts);
  }
}

function getExpirationStatus(exp: number): {
  expired: boolean;
  label: string;
  color: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;
  if (diff < 0) {
    const ago = Math.abs(diff);
    const parts = [];
    const days = Math.floor(ago / 86400);
    const hours = Math.floor((ago % 86400) / 3600);
    const minutes = Math.floor((ago % 3600) / 60);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return {
      expired: true,
      label: `Expired ${parts.join(" ") || "just now"} ago`,
      color: "text-red-500",
    };
  } else {
    const parts = [];
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return {
      expired: false,
      label: `Expires in ${parts.join(" ") || "< 1m"}`,
      color: "text-green-500",
    };
  }
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-orange-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-sky-400"; // key
        } else {
          cls = "text-emerald-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-violet-400"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-gray-400"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}

export function JwtDecoder() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [, setTick] = useState(0);

  // Refresh expiration display every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const decode = useCallback((token: string) => {
    const trimmed = token.trim();
    if (!trimmed) {
      setDecoded(null);
      setError(null);
      setWarnings([]);
      return;
    }

    // Strip "Bearer " prefix if present
    const jwt = trimmed.replace(/^Bearer\s+/i, "");

    const parts = jwt.split(".");
    if (parts.length !== 3) {
      setError(
        `Invalid JWT structure: expected 3 parts separated by dots, got ${parts.length}.`
      );
      setDecoded(null);
      setWarnings([]);
      return;
    }

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);
      const header = JSON.parse(headerJson);
      const payload = JSON.parse(payloadJson);
      const signature = signatureToHex(parts[2]);

      const result: DecodedJwt = {
        header,
        payload,
        signature,
        rawParts: [parts[0], parts[1], parts[2]],
      };

      // Generate warnings
      const w: Warning[] = [];

      if (payload.exp) {
        const status = getExpirationStatus(payload.exp as number);
        if (status.expired) {
          w.push({ type: "error", message: status.label });
        }
      } else {
        w.push({
          type: "warning",
          message: "No expiration claim (exp) — token never expires",
        });
      }

      if (!payload.iss) {
        w.push({
          type: "warning",
          message: "Missing issuer claim (iss)",
        });
      }

      if (!payload.sub) {
        w.push({
          type: "info",
          message: "No subject claim (sub)",
        });
      }

      if (payload.nbf) {
        const now = Math.floor(Date.now() / 1000);
        if ((payload.nbf as number) > now) {
          w.push({
            type: "warning",
            message: `Token not yet valid — nbf is in the future (${formatTimestamp(payload.nbf as number)})`,
          });
        }
      }

      if (header.alg === "none") {
        w.push({
          type: "error",
          message:
            'Algorithm is "none" — this token has no signature verification',
        });
      }

      setDecoded(result);
      setError(null);
      setWarnings(w);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to decode JWT token."
      );
      setDecoded(null);
      setWarnings([]);
    }
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    decode(value);
  };

  const clearAll = () => {
    setInput("");
    setDecoded(null);
    setError(null);
    setWarnings([]);
  };

  // Color-coded JWT display
  const renderColoredToken = () => {
    if (!decoded) return null;
    const { rawParts } = decoded;
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm break-all leading-relaxed">
        <span className="text-red-400">{rawParts[0]}</span>
        <span className="text-muted-foreground">.</span>
        <span className="text-violet-400">{rawParts[1]}</span>
        <span className="text-muted-foreground">.</span>
        <span className="text-sky-400">{rawParts[2]}</span>
      </div>
    );
  };

  // Render JSON with syntax highlighting
  const renderJson = (obj: Record<string, unknown>) => {
    const json = JSON.stringify(obj, null, 2);
    return (
      <pre
        className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
      />
    );
  };

  // Render claim explanations
  const renderClaims = () => {
    if (!decoded) return null;
    const { payload } = decoded;
    const entries = Object.entries(payload);
    if (entries.length === 0) return null;

    return (
      <div className="space-y-2">
        {entries.map(([key, value]) => {
          const label = CLAIM_LABELS[key];
          const isTimestamp =
            TIMESTAMP_CLAIMS.has(key) && typeof value === "number";
          const isExp = key === "exp" && typeof value === "number";

          return (
            <div
              key={key}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <code className="text-xs font-bold text-sky-400 bg-sky-400/10 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                {key}
              </code>
              <div className="min-w-0 flex-1">
                {label && (
                  <span className="text-xs text-muted-foreground block">
                    {label}
                  </span>
                )}
                <span className="text-sm text-foreground break-all">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
                {isTimestamp && (
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {formatTimestamp(value as number)}
                  </span>
                )}
                {isExp && (
                  <span
                    className={`text-xs font-medium block mt-0.5 ${getExpirationStatus(value as number).color}`}
                  >
                    {getExpirationStatus(value as number).label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-muted-foreground">
            Paste JWT Token
          </label>
          {input && (
            <button
              onClick={clearAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          className="w-full h-36 rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          spellCheck={false}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Invalid Token</p>
            <p className="mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
                w.type === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : w.type === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-400"
              }`}
            >
              {w.type === "error" ? (
                <ShieldAlert className="h-4 w-4 shrink-0" />
              ) : w.type === "warning" ? (
                <Clock className="h-4 w-4 shrink-0" />
              ) : (
                <Info className="h-4 w-4 shrink-0" />
              )}
              {w.message}
            </div>
          ))}
        </div>
      )}

      {decoded && (
        <>
          {/* Color-coded token */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Encoded Token
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Header
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  Payload
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Signature
                </span>
              </div>
            </div>
            {renderColoredToken()}
          </div>

          {/* Decoded sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header */}
            <div className="rounded-xl border border-border bg-card text-card-foreground">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <h3 className="text-sm font-semibold">Header</h3>
                  <span className="text-xs text-muted-foreground">
                    (JOSE Header)
                  </span>
                </div>
                <CopyButton
                  text={JSON.stringify(decoded.header, null, 2)}
                  label="Copy"
                />
              </div>
              <div className="p-4 bg-muted/30 rounded-b-xl overflow-auto max-h-64">
                {renderJson(decoded.header)}
              </div>
            </div>

            {/* Payload */}
            <div className="rounded-xl border border-border bg-card text-card-foreground">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                  <h3 className="text-sm font-semibold">Payload</h3>
                  <span className="text-xs text-muted-foreground">
                    (Claims)
                  </span>
                </div>
                <CopyButton
                  text={JSON.stringify(decoded.payload, null, 2)}
                  label="Copy"
                />
              </div>
              <div className="p-4 bg-muted/30 rounded-b-xl overflow-auto max-h-64">
                {renderJson(decoded.payload)}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="rounded-xl border border-border bg-card text-card-foreground">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <h3 className="text-sm font-semibold">Signature</h3>
                <span className="text-xs text-muted-foreground">(Hex)</span>
              </div>
              <div className="flex items-center gap-2">
                {decoded.header.alg && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted rounded-md px-2 py-0.5">
                    {String(decoded.header.alg)}
                  </span>
                )}
                <CopyButton text={decoded.signature} label="Copy" />
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-b-xl overflow-auto">
              <code className="font-mono text-sm text-sky-400 break-all">
                {decoded.signature}
              </code>
            </div>
          </div>

          {/* Expiration status card */}
          {decoded.payload.exp && (
            <div
              className={`rounded-xl border p-4 flex items-center gap-3 ${
                getExpirationStatus(decoded.payload.exp as number).expired
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-green-500/30 bg-green-500/5"
              }`}
            >
              {getExpirationStatus(decoded.payload.exp as number).expired ? (
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${getExpirationStatus(decoded.payload.exp as number).color}`}
                >
                  {
                    getExpirationStatus(decoded.payload.exp as number)
                      .label
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTimestamp(decoded.payload.exp as number)}
                </p>
              </div>
            </div>
          )}

          {/* Claims table */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Payload Claims
            </h3>
            {renderClaims()}
          </div>
        </>
      )}

      {/* Empty state */}
      {!decoded && !error && !input && (
        <div className="text-center py-12 text-muted-foreground">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">
            Paste a JWT token above to decode it instantly.
          </p>
          <p className="text-xs mt-1 opacity-70">
            Everything runs in your browser — no data is sent to any server.
          </p>
        </div>
      )}
    </div>
  );
}
