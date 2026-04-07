"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, Mic, Square, Copy, Check, Download, FileAudio } from "lucide-react";

export function SpeechToText() {
  const [audio, setAudio] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const ACCEPTED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/flac", "audio/ogg", "audio/webm", "audio/mp3"];

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("audio/") && !ACCEPTED_TYPES.some(t => file.name.toLowerCase().endsWith(t.split("/")[1]))) {
      setError("Please upload an audio file (MP3, WAV, M4A, FLAC, OGG, WEBM)");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Audio file must be under 25MB");
      return;
    }
    setError(null);
    setResult("");
    setAudioName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setAudio(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        const reader = new FileReader();
        reader.onload = (e) => {
          setAudio(e.target?.result as string);
          setAudioName("recording.webm");
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      setError(null);
      setResult("");
    } catch {
      setError("Could not access microphone. Please allow microphone permission and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribe = async () => {
    if (!audio) return;
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "hf-audio/whisper-large-v3",
          params: { audio, task },
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
      setResult(data.result || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to transcribe audio. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload / Record area */}
      {!audio ? (
        <div className="space-y-4">
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
              <p className="font-medium">Drop an audio file here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">MP3, WAV, M4A, FLAC, OGG, WEBM up to 25MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
              recording
                ? "border-red-500 bg-red-500/5 text-red-600 hover:bg-red-500/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            {recording ? (
              <>
                <Square className="h-5 w-5 fill-current" />
                <span className="font-medium">Stop Recording</span>
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Record from Microphone</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Audio preview + controls */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
            <FileAudio className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate flex-1">{audioName}</span>
            <button
              onClick={() => { setAudio(null); setResult(""); setError(null); setAudioName(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Remove
            </button>
          </div>

          {/* Task toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setTask("transcribe")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                task === "transcribe"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              Transcribe
              <span className="block text-xs font-normal text-muted-foreground mt-0.5">Same language</span>
            </button>
            <button
              onClick={() => setTask("translate")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                task === "translate"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              Translate to English
              <span className="block text-xs font-normal text-muted-foreground mt-0.5">Any language &rarr; English</span>
            </button>
          </div>

          {/* Transcribe button */}
          <button
            onClick={transcribe}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
            {loading ? `Processing... ${loadingTime}s` : "Transcribe"}
          </button>

          {loading && loadingTime > 5 && (
            <p className="text-xs text-muted-foreground animate-pulse">
              AI model is warming up — this can take up to 60 seconds on first use.
            </p>
          )}

          {/* Result area */}
          {(result || loading) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-muted-foreground">Transcription</label>
                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyResult}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={downloadResult}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Download .txt
                    </button>
                  </div>
                )}
              </div>
              <div className="min-h-[200px] rounded-lg border border-border bg-muted/50 p-4">
                {loading && !result ? (
                  <div className="flex items-center justify-center h-full min-h-[168px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{result}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
