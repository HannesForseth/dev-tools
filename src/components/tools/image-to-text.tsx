"use client";

import { useState, useRef } from "react";
import { Upload, Copy, Check, Loader2, ScanText } from "lucide-react";

export function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setError(null);
    setText("");
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const extractText = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "mcp-tools/DeepSeek-OCR-experimental",
          params: { image, task_type: "Convert to Markdown" },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setText(data.result || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <ScanText className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Drop an image here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">Screenshots, photos of documents, receipts, etc.</p>
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
          <div className="flex gap-2">
            <button
              onClick={extractText}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanText className="h-3.5 w-3.5" />}
              {loading ? "Extracting..." : "Extract Text"}
            </button>
            <button
              onClick={() => { setImage(null); setText(""); setError(null); }}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              New image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Image</label>
              <div className="rounded-lg border border-border bg-muted/50 p-2 flex items-center justify-center min-h-[300px]">
                <img src={image} alt="Input" className="max-w-full max-h-[400px] rounded" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Extracted Text</label>
                {text && (
                  <button onClick={copyText} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <textarea
                value={text}
                readOnly
                placeholder={loading ? "Extracting text..." : "Extracted text will appear here..."}
                className="w-full h-[320px] rounded-lg border border-border bg-muted/50 p-4 text-sm resize-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
