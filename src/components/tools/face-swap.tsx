"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, Repeat, ShieldAlert, Check } from "lucide-react";

export function FaceSwap() {
  const [consented, setConsented] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState(false);
  const [dragOverSource, setDragOverSource] = useState(false);
  const targetRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = (file: File, setter: (v: string) => void) => {
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
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const runFaceSwap = async () => {
    if (!target || !source) return;
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "felixrosberg/face-swap",
          params: { target, source },
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to swap faces. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "face-swap-result.png";
    a.click();
  };

  const swapInputs = () => {
    const t = target;
    setTarget(source);
    setSource(t);
    setResult(null);
  };

  const reset = () => {
    setTarget(null);
    setSource(null);
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
            This tool uses AI to swap faces between two photos. Before using it, you must agree to the following terms:
          </p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I have <strong className="text-foreground">consent from all people</strong> whose faces appear in the photos I upload.</span>
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
              <span>I understand that <strong className="text-foreground">I am solely responsible</strong> for how I use the generated images.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Images are processed via a third-party AI model and are <strong className="text-foreground">not stored</strong> by AllKit.</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => setConsented(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="h-4 w-4" />
              I Agree — Use Face Swap Tool
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            By clicking above you agree to our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and responsible use policy. Misuse may result in access being revoked.
          </p>
        </div>
      </div>
    );
  }

  // Upload zones for both images
  const UploadZone = ({
    label,
    description,
    image,
    dragOver,
    setDragOver,
    inputRef,
    onFile,
  }: {
    label: string;
    description: string;
    image: string | null;
    dragOver: boolean;
    setDragOver: (v: boolean) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFile: (f: File) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-2 text-muted-foreground">{label}</label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      {image ? (
        <div className="relative rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center min-h-[250px]">
          <img src={image} alt={label} className="max-w-full max-h-[300px] rounded" />
          <button
            onClick={() => {
              if (label.includes("Target")) setTarget(null);
              else setSource(null);
              setResult(null);
            }}
            className="absolute top-3 right-3 rounded-md bg-background/80 px-2 py-1 text-xs hover:bg-background transition-colors"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drop image or click to upload</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Upload areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <UploadZone
          label="Target Photo"
          description="The photo where the face will be replaced"
          image={target}
          dragOver={dragOverTarget}
          setDragOver={setDragOverTarget}
          inputRef={targetRef}
          onFile={(f) => handleFile(f, setTarget)}
        />
        {/* Swap button between zones */}
        {target && source && (
          <button
            onClick={swapInputs}
            title="Swap target and source"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full border border-border bg-background p-2 shadow-md hover:bg-muted transition-colors hidden md:flex items-center justify-center"
          >
            <Repeat className="h-4 w-4" />
          </button>
        )}
        <UploadZone
          label="Source Face"
          description="The face that will be placed on the target"
          image={source}
          dragOver={dragOverSource}
          setDragOver={setDragOverSource}
          inputRef={sourceRef}
          onFile={(f) => handleFile(f, setSource)}
        />
      </div>
      {/* Mobile swap button */}
      {target && source && (
        <button
          onClick={swapInputs}
          className="md:hidden inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Repeat className="h-3 w-3" />
          Swap target & source
        </button>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={runFaceSwap}
          disabled={loading || !target || !source}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Repeat className="h-3.5 w-3.5" />}
          {loading ? `Swapping... ${loadingTime}s` : "Swap Faces"}
        </button>
        {result && (
          <button
            onClick={downloadResult}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download Result
          </button>
        )}
        <button
          onClick={reset}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Start over
        </button>
      </div>

      {/* Loading progress */}
      {loading && (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">
                {loadingTime < 5 ? "Detecting faces..." : loadingTime < 15 ? "Mapping facial features..." : loadingTime < 25 ? "Blending and compositing..." : "AI model warming up..."}
              </p>
              <p className="text-xs text-muted-foreground">{loadingTime}s elapsed{loadingTime > 10 ? " — first use can take up to 60s" : ""}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${Math.min(loadingTime * (loadingTime < 30 ? 2 : 1.2), 95)}%` }}
            />
          </div>
        </div>
      )}

      {/* Before/After Result */}
      {result && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">Result — Before & After</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground mb-2 text-center">Original</p>
              <div className="flex items-center justify-center min-h-[200px]">
                <img src={target!} alt="Original target" className="max-w-full max-h-[350px] rounded" />
              </div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
              <p className="text-xs text-primary mb-2 text-center font-medium">Face Swapped</p>
              <div className="flex items-center justify-center min-h-[200px]">
                <img src={result} alt="Face swap result" className="max-w-full max-h-[350px] rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Disclaimer */}
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
        <p><strong>Disclaimer:</strong> This tool is provided for entertainment and creative purposes only. AllKit does not store or retain any uploaded images. You are solely responsible for ensuring you have proper consent and for how you use generated content. Misuse of this tool violates our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.</p>
      </div>
    </div>
  );
}
