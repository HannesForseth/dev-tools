"use client";

import { useState, useRef } from "react";
import { Download, Loader2, Volume2 } from "lucide-react";

export function TextToSpeech() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exaggeration, setExaggeration] = useState(0.5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = async () => {
    if (!text.trim()) return;
    if (text.length > 300) {
      setError("Text must be 300 characters or less");
      return;
    }
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    setAudioUrl(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "ResembleAI/Chatterbox",
          params: { text, exaggeration },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAudioUrl(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "speech.wav";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Enter text (max 300 characters)</label>
          <span className={`text-xs ${text.length > 300 ? "text-destructive" : "text-muted-foreground"}`}>
            {text.length}/300
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type the text you want to convert to speech..."
          className="w-full h-32 rounded-lg border border-border bg-muted/50 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-muted-foreground">Expressiveness:</label>
        <input
          type="range"
          min="0.25"
          max="2"
          step="0.05"
          value={exaggeration}
          onChange={(e) => setExaggeration(Number(e.target.value))}
          className="flex-1 max-w-xs"
        />
        <span className="text-sm text-muted-foreground w-10">{exaggeration.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={loading || !text.trim() || text.length > 300}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
          {loading ? `Generating... ${loadingTime}s` : "Generate Speech"}
        </button>
        {loading && loadingTime > 5 && (
          <p className="text-xs text-muted-foreground animate-pulse self-center">
            AI model is warming up — this can take up to 60 seconds on first use.
          </p>
        )}
        {audioUrl && (
          <button
            onClick={downloadAudio}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download WAV
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating speech... This may take 10-30 seconds.
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
