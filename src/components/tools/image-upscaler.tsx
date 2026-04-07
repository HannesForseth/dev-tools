"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, ImageUpscale } from "lucide-react";

export function ImageUpscaler() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const [upscaledDims, setUpscaledDims] = useState<{ w: number; h: number } | null>(null);
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
    setUpscaledDims(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      // Get original dimensions
      const img = new Image();
      img.onload = () => setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const upscaleImage = async () => {
    if (!image) return;
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "finegrain/finegrain-image-enhancer",
          params: { image },
        }),
      });
      if (!res.ok) {
        if (res.status === 504) throw new Error("The AI model is taking too long to start. Please wait a minute and try again.");
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
      // Get upscaled dimensions
      const img = new Image();
      img.onload = () => setUpscaledDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = data.result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upscale image. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "upscaled-image.png";
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
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={upscaleImage}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUpscale className="h-3.5 w-3.5" />}
              {loading ? `Processing... ${loadingTime}s` : "Upscale Image"}
            </button>
            {result && (
              <button
                onClick={downloadResult}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download PNG
              </button>
            )}
            <button
              onClick={() => { setImage(null); setResult(null); setError(null); setOriginalDims(null); setUpscaledDims(null); }}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              New image
            </button>
          </div>

          {loading && loadingTime > 5 && (
            <p className="text-xs text-muted-foreground animate-pulse">
              AI model is warming up — this can take up to 60 seconds on first use.
            </p>
          )}

          {/* Dimensions info */}
          {(originalDims || upscaledDims) && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {originalDims && (
                <span>Original: {originalDims.w} x {originalDims.h}px</span>
              )}
              {upscaledDims && (
                <span className="text-primary font-medium">
                  Upscaled: {upscaledDims.w} x {upscaledDims.h}px ({Math.round((upscaledDims.w * upscaledDims.h) / (originalDims!.w * originalDims!.h) * 100) / 100}x pixels)
                </span>
              )}
            </div>
          )}

          {/* Image comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Original</label>
              <div className="rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center min-h-[300px]">
                <img src={image} alt="Original" className="max-w-full max-h-[400px] rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Upscaled</label>
              <div className="rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center min-h-[300px]">
                {result ? (
                  <img src={result} alt="Upscaled" className="max-w-full max-h-[400px] rounded" />
                ) : loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-sm text-muted-foreground">Click &quot;Upscale Image&quot; to enhance</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
