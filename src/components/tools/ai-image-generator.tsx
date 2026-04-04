"use client";

import { useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";

export function AiImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "evalstate/flux1_schnell",
          params: { prompt },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "generated-image.png";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Prompt input */}
      <div>
        <label className="block text-sm font-medium mb-2">Describe your image</label>
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene mountain landscape at sunset with a crystal-clear lake in the foreground..."
            className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {/* Result */}
      {(result || loading) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">Generated Image</label>
            {result && (
              <button
                onClick={downloadImage}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            )}
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-center justify-center min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Generating your image... This may take 10-30 seconds.</p>
              </div>
            ) : result ? (
              <img src={result} alt={prompt} className="max-w-full max-h-[600px] rounded-lg" />
            ) : null}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
