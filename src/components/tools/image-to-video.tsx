"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, Film, Sparkles } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "A gentle breeze blowing through hair",
  "Clouds slowly moving in the sky",
  "Water flowing in a river",
  "Leaves rustling softly in the wind",
  "A candle flame flickering gently",
  "Ocean waves crashing on the shore",
];

export function ImageToVideo() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!image || !prompt.trim()) return;
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "zerogpu-aoti/wan2-2-fp8da-aoti-faster",
          params: { image, prompt },
        }),
      });
      if (!res.ok) {
        if (res.status === 504) throw new Error("Video generation timed out. The model may be under heavy load — please try again in a minute.");
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          throw new Error(j.error || `Server error (${res.status})`);
        } catch (e) {
          if (e instanceof SyntaxError) throw new Error(`Server error (${res.status}). Please try again.`);
          throw e;
        }
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate video. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadVideo = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "generated-video.mp4";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!image ? (
        <div
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Drop an image here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Uploaded Image</label>
              <button
                onClick={() => { setImage(null); setResult(null); setError(null); setPrompt(""); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change image
              </button>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center">
              <img src={image} alt="Uploaded preview" className="max-w-full max-h-[300px] rounded" />
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <label className="block text-sm font-medium mb-2">Describe the motion you want</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want the image to animate, e.g. 'A gentle breeze blowing through hair'"
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Example prompts */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
              {loading ? `Generating... ${loadingTime}s` : "Generate Video"}
            </button>
            {result && (
              <button
                onClick={downloadVideo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download MP4
              </button>
            )}
          </div>

          {loading && (
            <div className="space-y-1">
              {loadingTime > 5 && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  AI model is processing your video — this typically takes 30-120 seconds.
                </p>
              )}
              {loadingTime > 30 && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Still working... Video generation requires significant GPU compute. Please be patient.
                </p>
              )}
            </div>
          )}

          {/* Video result */}
          {(result || loading) && (
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Generated Video</label>
              <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-center justify-center min-h-[300px]">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Generating video from your image...</p>
                  </div>
                ) : result ? (
                  <video
                    src={result}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[500px] rounded-lg"
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
