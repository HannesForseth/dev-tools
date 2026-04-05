"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Image as ImageIcon,
  Plus,
  Loader2,
  Check,
  ArrowDown,
  Settings2,
} from "lucide-react";

type OutputFormat = "jpeg" | "webp" | "png";

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  compressedUrl: string | null;
  compressedSize: number | null;
  compressedBlob: Blob | null;
  status: "pending" | "compressing" | "done" | "error";
  error?: string;
  naturalWidth: number;
  naturalHeight: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getMimeType(format: OutputFormat): string {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
  }
}

function getExtension(format: OutputFormat): string {
  switch (format) {
    case "jpeg":
      return "jpg";
    case "webp":
      return "webp";
    case "png":
      return "png";
  }
}

export function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [dragOver, setDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadImageDimensions = (
    url: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  };

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];
      const newItems: ImageItem[] = [];

      for (const file of Array.from(files)) {
        if (!validTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp)$/i)) continue;
        if (file.size > 50 * 1024 * 1024) continue;

        const url = URL.createObjectURL(file);
        const dims = await loadImageDimensions(url);

        newItems.push({
          id: crypto.randomUUID(),
          file,
          originalUrl: url,
          originalSize: file.size,
          compressedUrl: null,
          compressedSize: null,
          compressedBlob: null,
          status: "pending",
          naturalWidth: dims.width,
          naturalHeight: dims.height,
        });
      }

      if (newItems.length > 0) {
        setImages((prev) => [...prev, ...newItems]);
        if (!selectedId && newItems.length > 0) {
          setSelectedId(newItems[0].id);
        }
      }
    },
    [selectedId]
  );

  const compressImage = useCallback(
    (item: ImageItem): Promise<ImageItem> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ ...item, status: "error", error: "Canvas not supported" });
            return;
          }

          let targetWidth = img.naturalWidth;
          let targetHeight = img.naturalHeight;

          if (resizeEnabled) {
            const ratio = Math.min(
              maxWidth / targetWidth,
              maxHeight / targetHeight,
              1
            );
            targetWidth = Math.round(targetWidth * ratio);
            targetHeight = Math.round(targetHeight * ratio);
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // White background for JPEG (no alpha)
          if (outputFormat === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const mime = getMimeType(outputFormat);
          const qualityValue = outputFormat === "png" ? undefined : quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({
                  ...item,
                  status: "error",
                  error: "Compression failed",
                });
                return;
              }

              const compressedUrl = URL.createObjectURL(blob);
              resolve({
                ...item,
                compressedUrl,
                compressedSize: blob.size,
                compressedBlob: blob,
                status: "done",
              });
            },
            mime,
            qualityValue
          );
        };
        img.onerror = () => {
          resolve({ ...item, status: "error", error: "Failed to load image" });
        };
        img.src = item.originalUrl;
      });
    },
    [quality, outputFormat, resizeEnabled, maxWidth, maxHeight]
  );

  const compressAll = useCallback(async () => {
    const pending = images.filter(
      (img) => img.status === "pending" || img.status === "error"
    );
    if (pending.length === 0) return;

    // Mark all as compressing
    setImages((prev) =>
      prev.map((img) =>
        img.status === "pending" || img.status === "error"
          ? { ...img, status: "compressing" as const }
          : img
      )
    );

    for (const item of pending) {
      const result = await compressImage({
        ...item,
        status: "compressing",
      });
      setImages((prev) =>
        prev.map((img) => (img.id === result.id ? result : img))
      );
    }
  }, [images, compressImage]);

  const recompressAll = useCallback(async () => {
    // Clean up old blob URLs
    images.forEach((img) => {
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: "compressing" as const,
        compressedUrl: null,
        compressedSize: null,
        compressedBlob: null,
      }))
    );

    for (const item of images) {
      const result = await compressImage({
        ...item,
        status: "compressing",
        compressedUrl: null,
        compressedSize: null,
        compressedBlob: null,
      });
      setImages((prev) =>
        prev.map((img) => (img.id === result.id ? result : img))
      );
    }
  }, [images, compressImage]);

  const downloadImage = (item: ImageItem) => {
    if (!item.compressedUrl) return;
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-compressed.${getExtension(outputFormat)}`;
    a.click();
  };

  const downloadAll = () => {
    const done = images.filter((img) => img.status === "done");
    done.forEach((item) => downloadImage(item));
  };

  const removeImage = (id: string) => {
    const item = images.find((img) => img.id === id);
    if (item) {
      URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedId === id) {
      const remaining = images.filter((img) => img.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const clearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
    setSelectedId(null);
  };

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const allDone = images.length > 0 && images.every((img) => img.status === "done");
  const anyCompressing = images.some((img) => img.status === "compressing");
  const hasPending = images.some((img) => img.status === "pending" || img.status === "error");
  const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressed = images
    .filter((img) => img.compressedSize !== null)
    .reduce((sum, img) => sum + (img.compressedSize ?? 0), 0);
  const totalSaved =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  // Upload area (shown when no images)
  if (images.length === 0) {
    return (
      <div className="space-y-6">
        <div
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG, WebP — up to 50MB per file — batch upload supported
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Settings bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
            </select>
          </div>

          {/* Quality */}
          <div className="space-y-1.5 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quality {outputFormat !== "png" ? `(${quality}%)` : "(lossless)"}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={outputFormat === "png"}
              className="w-full accent-primary disabled:opacity-40"
            />
          </div>

          {/* Resize toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resize
            </label>
            <button
              onClick={() => setResizeEnabled(!resizeEnabled)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                resizeEnabled
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5 inline mr-1.5" />
              {resizeEnabled ? "On" : "Off"}
            </button>
          </div>

          {/* Resize inputs */}
          {resizeEnabled && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Width
                </label>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={(e) =>
                    setMaxWidth(Math.max(1, Number(e.target.value)))
                  }
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Height
                </label>
                <input
                  type="number"
                  value={maxHeight}
                  onChange={(e) =>
                    setMaxHeight(Math.max(1, Number(e.target.value)))
                  }
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 ml-auto">
            {hasPending && (
              <button
                onClick={compressAll}
                disabled={anyCompressing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {anyCompressing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5" />
                )}
                {anyCompressing ? "Compressing..." : "Compress All"}
              </button>
            )}
            {allDone && (
              <button
                onClick={recompressAll}
                disabled={anyCompressing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Recompress
              </button>
            )}
            {allDone && (
              <button
                onClick={downloadAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {images.some((img) => img.compressedSize !== null) && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Original
            </p>
            <p className="text-lg font-semibold mt-0.5">
              {formatBytes(totalOriginal)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Compressed
            </p>
            <p className="text-lg font-semibold mt-0.5">
              {formatBytes(totalCompressed)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Saved
            </p>
            <p
              className={`text-lg font-semibold mt-0.5 ${
                totalSaved > 0 ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {totalSaved > 0 ? `-${totalSaved}%` : "0%"}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Image list sidebar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-muted-foreground">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-muted transition-colors"
                title="Add more images"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                title="Clear all"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {images.map((item) => {
              const saved =
                item.compressedSize !== null
                  ? Math.round(
                      ((item.originalSize - item.compressedSize) /
                        item.originalSize) *
                        100
                    )
                  : null;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex items-center gap-2.5 rounded-lg border p-2 cursor-pointer transition-colors ${
                    selectedId === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <img
                    src={item.originalUrl}
                    alt=""
                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatBytes(item.originalSize)}
                      </span>
                      {item.status === "compressing" && (
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                      )}
                      {item.status === "done" && saved !== null && (
                        <span
                          className={`text-[10px] font-medium ${
                            saved > 0
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {saved > 0 ? `-${saved}%` : "+size"}
                        </span>
                      )}
                      {item.status === "done" && (
                        <Check className="h-2.5 w-2.5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(item.id);
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Preview area */}
        <div className="space-y-3">
          {selectedImage ? (
            <>
              {/* Image info bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {selectedImage.file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedImage.naturalWidth} x {selectedImage.naturalHeight}
                  </span>
                </div>
                {selectedImage.status === "done" && (
                  <button
                    onClick={() => downloadImage(selectedImage)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                )}
              </div>

              {/* Side-by-side preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Original
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(selectedImage.originalSize)}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-2 flex items-center justify-center min-h-[300px]">
                    <img
                      src={selectedImage.originalUrl}
                      alt="Original"
                      className="max-w-full max-h-[400px] rounded object-contain"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Compressed
                    </span>
                    {selectedImage.compressedSize !== null && (
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(selectedImage.compressedSize)}
                        {(() => {
                          const pct = Math.round(
                            ((selectedImage.originalSize -
                              selectedImage.compressedSize!) /
                              selectedImage.originalSize) *
                              100
                          );
                          return pct > 0 ? (
                            <span className="text-green-500 ml-1 font-medium">
                              (-{pct}%)
                            </span>
                          ) : null;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-2 flex items-center justify-center min-h-[300px]">
                    {selectedImage.status === "done" &&
                    selectedImage.compressedUrl ? (
                      <img
                        src={selectedImage.compressedUrl}
                        alt="Compressed"
                        className="max-w-full max-h-[400px] rounded object-contain"
                      />
                    ) : selectedImage.status === "compressing" ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm">Compressing...</span>
                      </div>
                    ) : selectedImage.status === "error" ? (
                      <div className="text-center text-sm text-destructive">
                        {selectedImage.error || "Compression failed"}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">
                          Click &quot;Compress All&quot; to start
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] rounded-xl border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Select an image to preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
