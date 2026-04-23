"use client";

import { useState, useRef } from "react";
import { Download, Loader2, Sparkles, Film, FileBox } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "A person doing a backflip",
  "A character walking confidently forward",
  "Someone dancing a salsa turn",
  "A person picking up an object from the ground",
  "Running and jumping over an obstacle",
  "Sitting down slowly in a chair",
  "A person waving hello with their right hand",
  "Throwing a punch combination",
];

export function TextTo3dMotion() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(4);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [motionUrl, setMotionUrl] = useState<string | null>(null);
  const [motionExt, setMotionExt] = useState<string>("bvh");
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    setVideoUrl(null);
    setMotionUrl(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "nvidia/Kimodo",
          params: { prompt, duration },
        }),
      });
      if (!res.ok) {
        if (res.status === 504) throw new Error("Motion generation timed out. The model may be cold-starting — please try again in a minute.");
        if (res.status === 429) throw new Error("Free limit reached (3 AI generations/day). Upgrade to Pro for unlimited motions.");
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
      const r = data.result || {};
      if (r.video) setVideoUrl(r.video);
      if (r.motion) {
        setMotionUrl(r.motion);
        if (typeof r.motionExt === "string") setMotionExt(r.motionExt);
      }
      if (!r.video && !r.motion) throw new Error("No animation was generated. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate motion. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadMotion = () => {
    if (!motionUrl) return;
    const a = document.createElement("a");
    a.href = motionUrl;
    a.download = `kimodo-motion-${Date.now()}.${motionExt}`;
    a.click();
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `kimodo-preview-${Date.now()}.mp4`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Describe the motion</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A person doing a backflip"
          className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

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

      <div>
        <label className="flex items-center justify-between text-sm font-medium mb-2">
          <span>Duration</span>
          <span className="text-muted-foreground">{duration}s</span>
        </label>
        <input
          type="range"
          min={2}
          max={10}
          step={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? `Generating... ${loadingTime}s` : "Generate Motion"}
        </button>
      </div>

      {loading && (
        <div className="space-y-1">
          {loadingTime > 5 && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Kimodo is running on NVIDIA GPU infrastructure — this typically takes 5-30 seconds on a warm GPU.
            </p>
          )}
          {loadingTime > 30 && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Still working... The model may be cold-starting. Cold starts can take up to 60-90 seconds.
            </p>
          )}
        </div>
      )}

      {(videoUrl || loading) && (
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Preview</label>
          <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Generating 3D motion from text...</p>
              </div>
            ) : videoUrl ? (
              <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[500px] rounded-lg" />
            ) : null}
          </div>
        </div>
      )}

      {(videoUrl || motionUrl) && (
        <div className="flex flex-wrap gap-2">
          {videoUrl && (
            <button
              onClick={downloadVideo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Film className="h-3.5 w-3.5" />
              Download Preview MP4
            </button>
          )}
          {motionUrl && (
            <button
              onClick={downloadMotion}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <FileBox className="h-3.5 w-3.5" />
              Download {motionExt.toUpperCase()} Motion File
            </button>
          )}
        </div>
      )}

      {motionUrl && (
        <p className="text-xs text-muted-foreground">
          Import the {motionExt.toUpperCase()} file into Blender, Unreal Engine, Unity, or Maya to retarget the motion onto your own 3D character.
          For quick Mixamo-style retargeting, you can also drag it into tools like Blender&apos;s built-in BVH importer or Cascadeur.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1 inline-flex items-center gap-1.5">
          <Download className="h-3 w-3" /> Powered by NVIDIA Kimodo
        </p>
        <p>
          Kimodo is NVIDIA&apos;s open-source kinematic motion diffusion model, released under the NVIDIA Open Model License.
          Motions are free to use commercially — in games, films, research, and personal projects.
        </p>
      </div>
    </div>
  );
}
