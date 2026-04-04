"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Shield } from "lucide-react";

export function PrivacyPolicyGenerator() {
  const [appName, setAppName] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [appType, setAppType] = useState("website");
  const [dataCollected, setDataCollected] = useState<string[]>([]);
  const [policy, setPolicy] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataOptions = [
    "Name and email", "Payment information", "Usage analytics",
    "Cookies", "IP address", "Device information",
    "Location data", "User-generated content", "Social media data",
  ];

  const toggleData = (item: string) => {
    setDataCollected((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const generate = async () => {
    if (!appName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/privacy-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName, appUrl, appType, dataCollected }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPolicy(data.policy || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyPolicy = async () => {
    await navigator.clipboard.writeText(policy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">App / Website Name *</label>
          <input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="My Awesome App"
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Website URL</label>
          <input
            value={appUrl}
            onChange={(e) => setAppUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <div className="flex gap-2">
          {["website", "mobile app", "SaaS", "e-commerce"].map((type) => (
            <button
              key={type}
              onClick={() => setAppType(type)}
              className={`rounded-lg px-4 py-2 text-sm border transition-colors ${
                appType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Data you collect</label>
        <div className="flex flex-wrap gap-2">
          {dataOptions.map((item) => (
            <button
              key={item}
              onClick={() => toggleData(item)}
              className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                dataCollected.includes(item)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading || !appName.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
        {loading ? "Generating..." : "Generate Privacy Policy"}
      </button>

      {/* Output */}
      {policy && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">Generated Policy</label>
            <button onClick={copyPolicy} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-6 text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {policy}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
