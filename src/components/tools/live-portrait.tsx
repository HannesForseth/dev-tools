"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, Video, ShieldAlert, Check, Play } from "lucide-react";

export function LivePortrait() {
  const [consented, setConsented] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOverImage, setDragOverImage] = useState(false);
  const [dragOverVideo, setDragOverVideo] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, WebM)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Video must be under 20MB. Try trimming it to 2-10 seconds.");
      return;
    }
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setVideo(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const runAnimation = async () => {
    if (!image || !video) return;
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "KlingTeam/LivePortrait",
          params: { image, video },
        }),
      });
      if (!res.ok) {
        if (res.status === 504) throw new Error("The AI model is taking too long. Please wait a minute and try again — the GPU may need to warm up.");
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
      setError(e instanceof Error ? e.message : "Failed to animate portrait. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "live-portrait-result.mp4";
    a.click();
  };

  const reset = () => {
    setImage(null);
    setVideo(null);
    setResult(null);
    setError(null);
  };

  // Consent gate
  if (!consented) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-500 flex-shrink-0" />
            <h3 className="text-lg font-semibold">Responsible Use Agreement</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            This tool uses AI to animate portrait photos with realistic motion. Before using it, you must agree to the following terms:
          </p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I have <strong className="text-foreground">consent from all people</strong> whose likeness appears in the photos I upload.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I will <strong className="text-foreground">not use this tool</strong> to create deceptive, misleading, or non-consensual content.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I will <strong className="text-foreground">not use this tool</strong> for harassment, fraud, impersonation, or any illegal purpose.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I understand that <strong className="text-foreground">I am solely responsible</strong> for how I use the generated videos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Files are processed via a third-party AI model and are <strong className="text-foreground">not stored</strong> by AllKit.</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => setConsented(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="h-4 w-4" />
              I Agree — Use Live Portrait Tool
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            By clicking above you agree to our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and responsible use policy. Misuse may result in access being revoked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portrait Photo */}
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Portrait Photo</label>
          <p className="text-xs text-muted-foreground mb-2">A clear, front-facing photo with a visible face</p>
          {image ? (
            <div className="relative rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center min-h-[250px]">
              <img src={image} alt="Portrait" className="max-w-full max-h-[300px] rounded" />
              <button
                onClick={() => { setImage(null); setResult(null); }}
                className="absolute top-3 right-3 rounded-md bg-background/80 px-2 py-1 text-xs hover:bg-background transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragOverImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => imageRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOverImage(true); }}
              onDragLeave={() => setDragOverImage(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverImage(false); if (e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]); }}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop photo or click to upload</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 10MB</p>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
            </div>
          )}
        </div>

        {/* Driving Video */}
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Driving Video</label>
          <p className="text-xs text-muted-foreground mb-2">A short video (2-10s) with head movements and expressions</p>
          {video ? (
            <div className="relative rounded-lg border border-border bg-muted/50 p-2 flex flex-col items-center justify-center min-h-[250px]">
              <video src={video} controls className="max-w-full max-h-[300px] rounded" />
              <button
                onClick={() => { setVideo(null); setResult(null); }}
                className="absolute top-3 right-3 rounded-md bg-background/80 px-2 py-1 text-xs hover:bg-background transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragOverVideo ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => videoRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOverVideo(true); }}
              onDragLeave={() => setDragOverVideo(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverVideo(false); if (e.dataTransfer.files[0]) handleVideoFile(e.dataTransfer.files[0]); }}
            >
              <Video className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop video or click to upload</p>
              <p className="text-xs text-muted-foreground">MP4, WebM — max 20MB, 2-10s recommended</p>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Tips for best results:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Use a clear, front-facing portrait photo with good lighting</li>
          <li>Keep the driving video short (2-10 seconds) with slow, deliberate movements</li>
          <li>A frontal face angle in the driving video produces the smoothest animation</li>
          <li>Processing takes 15-60 seconds depending on video length and GPU availability</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={runAnimation}
          disabled={loading || !image || !video}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          {loading ? `Animating... ${loadingTime}s` : "Animate"}
        </button>
        {result && (
          <button
            onClick={downloadResult}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download MP4
          </button>
        )}
        <button
          onClick={reset}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Start over
        </button>
      </div>

      {loading && loadingTime > 10 && (
        <p className="text-xs text-muted-foreground animate-pulse">
          AI model is processing your animation — portrait animation is computationally intensive. This can take up to 60 seconds, especially on first use.
        </p>
      )}

      {/* Result */}
      {(result || loading) && (
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Animated Result</label>
          <div className="rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center min-h-[300px]">
            {result ? (
              <video src={result} controls autoPlay loop className="max-w-full max-h-[500px] rounded" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Generating animation...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Disclaimer */}
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
        <p><strong>Disclaimer:</strong> This tool is provided for creative, educational, and entertainment purposes only. AllKit does not store or retain any uploaded images or videos. You are solely responsible for ensuring you have proper consent and for how you use generated content. Misuse of this tool violates our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.</p>
      </div>
    </div>
  );
}
