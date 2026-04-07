"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Loader2, AudioLines, Mic, Square, Trash2, ShieldAlert, Check } from "lucide-react";

export function VoiceClone() {
  const [consented, setConsented] = useState(false);
  const [text, setText] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFile = useCallback((file: File) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/webm", "audio/flac"];
    if (!file.type.startsWith("audio/") && !validTypes.includes(file.type)) {
      setError("Please upload an audio file (MP3, WAV, M4A, OGG, or WebM)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Audio file must be under 10MB");
      return;
    }
    setError(null);
    setResultUrl(null);
    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setAudioData(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = (e) => {
          setAudioData(e.target?.result as string);
          setAudioFileName("recording.webm");
        };
        reader.readAsDataURL(blob);
        setRecording(false);
        setRecordingTime(0);
        if (recTimerRef.current) clearInterval(recTimerRef.current);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordingTime(0);
      setError(null);
      setResultUrl(null);
      recTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setError("Could not access microphone. Please allow microphone permission and try again.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const clearAudio = () => {
    setAudioData(null);
    setAudioFileName(null);
    setResultUrl(null);
  };

  const generate = async () => {
    if (!text.trim() || !audioData) return;
    if (text.length > 300) {
      setError("Text must be 300 characters or less");
      return;
    }
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    setResultUrl(null);
    timerRef.current = setInterval(() => setLoadingTime((t) => t + 1), 1000);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "tonyassi/voice-clone",
          params: { text, audio: audioData },
        }),
      });
      if (!res.ok) {
        if (res.status === 504) throw new Error("The AI model is taking too long to start. Please wait a minute and try again.");
        const t = await res.text();
        try {
          const j = JSON.parse(t);
          throw new Error(j.error || `Server error (${res.status})`);
        } catch (e) {
          if (e instanceof SyntaxError) throw new Error(`Server error (${res.status}). Please try again.`);
          throw e;
        }
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResultUrl(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clone voice. Please try again.");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const downloadAudio = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "voice-clone.wav";
    a.click();
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
            This tool uses AI to clone voices from audio samples. Before using it, you must agree to the following terms:
          </p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I have <strong className="text-foreground">consent from the person</strong> whose voice I am cloning, or I am cloning my own voice.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I will <strong className="text-foreground">not use this tool</strong> to create deceptive, misleading, or fraudulent audio content.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I will <strong className="text-foreground">not use this tool</strong> for impersonation, harassment, scams, or any illegal purpose.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>I understand that <strong className="text-foreground">I am solely responsible</strong> for how I use the generated audio.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Audio is processed via a third-party AI model and is <strong className="text-foreground">not stored</strong> by AllKit.</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => setConsented(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="h-4 w-4" />
              I Agree — Use Voice Cloning Tool
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
      {/* Voice Sample Section */}
      <div>
        <label className="block text-sm font-medium mb-1">Voice Sample</label>
        <p className="text-xs text-muted-foreground mb-3">
          Upload or record a 5-15 second voice sample. Clear speech with no background noise works best.
        </p>

        {audioData ? (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AudioLines className="h-4 w-4 text-primary" />
                <span className="font-medium">{audioFileName}</span>
              </div>
              <button
                onClick={clearAudio}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </div>
            <audio controls src={audioData} className="w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upload zone */}
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Upload audio file</p>
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG, WebM (max 10MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Record zone */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-6">
              {recording ? (
                <>
                  <div className="relative">
                    <Mic className="h-8 w-8 text-destructive animate-pulse" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-ping" />
                  </div>
                  <p className="text-sm font-medium text-destructive">Recording... {recordingTime}s</p>
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <Square className="h-3 w-3" />
                    Stop Recording
                  </button>
                </>
              ) : (
                <>
                  <Mic className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Record from microphone</p>
                    <p className="text-xs text-muted-foreground">Speak clearly for 5-15 seconds</p>
                  </div>
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Mic className="h-3.5 w-3.5 text-destructive" />
                    Start Recording
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Text Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Text to speak</label>
          <span className={`text-xs ${text.length > 300 ? "text-destructive" : "text-muted-foreground"}`}>
            {text.length}/300
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type the text you want spoken in the cloned voice..."
          className="w-full h-32 rounded-lg border border-border bg-muted/50 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={generate}
          disabled={loading || !text.trim() || !audioData || text.length > 300}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AudioLines className="h-3.5 w-3.5" />}
          {loading ? `Cloning... ${loadingTime}s` : "Clone Voice"}
        </button>
        {loading && loadingTime > 5 && (
          <p className="text-xs text-muted-foreground animate-pulse self-center">
            AI model is warming up — this can take up to 60 seconds on first use.
          </p>
        )}
        {resultUrl && (
          <button
            onClick={downloadAudio}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download WAV
          </button>
        )}
      </div>

      {/* Result */}
      {resultUrl && (
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">Cloned Voice Result</label>
          <audio controls src={resultUrl} className="w-full" />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cloning voice... This may take 10-60 seconds.
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Disclaimer */}
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
        <p><strong>Disclaimer:</strong> This tool is provided for legitimate creative and professional purposes only. AllKit does not store or retain any uploaded audio. You are solely responsible for ensuring you have proper consent from the voice owner and for how you use generated content. Misuse of this tool violates our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.</p>
      </div>
    </div>
  );
}
