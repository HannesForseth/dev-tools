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
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type OutputFormat = "png" | "jpeg" | "webp";

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  originalFormat: string;
  convertedUrl: string | null;
  convertedSize: number | null;
  convertedBlob: Blob | null;
  status: "pending" | "converting" | "done" | "error";
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

function detectFormat(file: File): string {
  const type = file.type.toLowerCase();
  if (type === "image/png") return "PNG";
  if (type === "image/jpeg" || type === "image/jpg") return "JPEG";
  if (type === "image/webp") return "WebP";
  if (type === "image/bmp") return "BMP";
  if (type === "image/gif") return "GIF";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "png") return "PNG";
  if (ext === "jpg" || ext === "jpeg") return "JPEG";
  if (ext === "webp") return "WebP";
  if (ext === "bmp") return "BMP";
  if (ext === "gif") return "GIF";
  return "Unknown";
}

function percentChange(original: number, converted: number): number {
  if (original === 0) return 0;
  return Math.round(((converted - original) / original) * 100);
}

export function ImageFormatConverter() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [jpegQuality, setJpegQuality] = useState(85);
  const [webpQuality, setWebpQuality] = useState(80);
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
        "image/jpg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/gif",
      ];
      const validExtensions = /\.(jpe?g|png|webp|bmp|gif)$/i;
      const newItems: ImageItem[] = [];

      for (const file of Array.from(files)) {
        if (!validTypes.includes(file.type) && !file.name.match(validExtensions))
          continue;
        if (file.size > 50 * 1024 * 1024) continue;

        const url = URL.createObjectURL(file);
        const dims = await loadImageDimensions(url);

        newItems.push({
          id: crypto.randomUUID(),
          file,
          originalUrl: url,
          originalSize: file.size,
          originalFormat: detectFormat(file),
          convertedUrl: null,
          convertedSize: null,
          convertedBlob: null,
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

  const convertImage = useCallback(
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

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          // White background for JPEG (no alpha channel)
          if (outputFormat === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          const mime = getMimeType(outputFormat);
          let qualityValue: number | undefined;
          if (outputFormat === "jpeg") {
            qualityValue = jpegQuality / 100;
          } else if (outputFormat === "webp") {
            qualityValue = webpQuality / 100;
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({
                  ...item,
                  status: "error",
                  error: "Conversion failed",
                });
                return;
              }

              const convertedUrl = URL.createObjectURL(blob);
              resolve({
                ...item,
                convertedUrl,
                convertedSize: blob.size,
                convertedBlob: blob,
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
    [outputFormat, jpegQuality, webpQuality]
  );

  const convertAll = useCallback(async () => {
    const pending = images.filter(
      (img) => img.status === "pending" || img.status === "error"
    );
    if (pending.length === 0) return;

    setImages((prev) =>
      prev.map((img) =>
        img.status === "pending" || img.status === "error"
          ? { ...img, status: "converting" as const }
          : img
      )
    );

    for (const item of pending) {
      const result = await convertImage({
        ...item,
        status: "converting",
      });
      setImages((prev) =>
        prev.map((img) => (img.id === result.id ? result : img))
      );
    }
  }, [images, convertImage]);

  const reconvertAll = useCallback(async () => {
    images.forEach((img) => {
      if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
    });

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: "converting" as const,
        convertedUrl: null,
        convertedSize: null,
        convertedBlob: null,
      }))
    );

    for (const item of images) {
      const result = await convertImage({
        ...item,
        status: "converting",
        convertedUrl: null,
        convertedSize: null,
        convertedBlob: null,
      });
      setImages((prev) =>
        prev.map((img) => (img.id === result.id ? result : img))
      );
    }
  }, [images, convertImage]);

  const downloadImage = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const a = document.createElement("a");
    a.href = item.convertedUrl;
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}.${getExtension(outputFormat)}`;
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
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
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
      if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
    });
    setImages([]);
    setSelectedId(null);
  };

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const allDone =
    images.length > 0 && images.every((img) => img.status === "done");
  const anyConverting = images.some((img) => img.status === "converting");
  const hasPending = images.some(
    (img) => img.status === "pending" || img.status === "error"
  );
  const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalConverted = images
    .filter((img) => img.convertedSize !== null)
    .reduce((sum, img) => sum + (img.convertedSize ?? 0), 0);
  const totalChange =
    totalOriginal > 0 ? percentChange(totalOriginal, totalConverted) : 0;

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
              PNG, JPEG, WebP, BMP, GIF — up to 50MB per file — batch upload
              supported
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.bmp,.gif"
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
          {/* Output Format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Convert to
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          {/* Quality slider for JPEG */}
          {outputFormat === "jpeg" && (
            <div className="space-y-1.5 min-w-[180px]">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                JPEG Quality ({jpegQuality}%)
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={jpegQuality}
                onChange={(e) => setJpegQuality(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          {/* Quality slider for WebP */}
          {outputFormat === "webp" && (
            <div className="space-y-1.5 min-w-[180px]">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                WebP Quality ({webpQuality}%)
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={webpQuality}
                onChange={(e) => setWebpQuality(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 ml-auto">
            {hasPending && (
              <button
                onClick={convertAll}
                disabled={anyConverting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {anyConverting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                {anyConverting ? "Converting..." : "Convert All"}
              </button>
            )}
            {allDone && (
              <button
                onClick={reconvertAll}
                disabled={anyConverting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reconvert
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
      {images.some((img) => img.convertedSize !== null) && (
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
              Converted
            </p>
            <p className="text-lg font-semibold mt-0.5">
              {formatBytes(totalConverted)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Size Change
            </p>
            <p
              className={`text-lg font-semibold mt-0.5 ${
                totalChange < 0
                  ? "text-green-500"
                  : totalChange > 0
                  ? "text-orange-500"
                  : "text-muted-foreground"
              }`}
            >
              {totalChange > 0 ? `+${totalChange}%` : totalChange < 0 ? `${totalChange}%` : "0%"}
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
              const change =
                item.convertedSize !== null
                  ? percentChange(item.originalSize, item.convertedSize)
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
                        {item.originalFormat} &bull; {formatBytes(item.originalSize)}
                      </span>
                      {item.status === "converting" && (
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                      )}
                      {item.status === "done" && change !== null && (
                        <span
                          className={`text-[10px] font-medium ${
                            change < 0
                              ? "text-green-500"
                              : change > 0
                              ? "text-orange-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {change > 0 ? `+${change}%` : change < 0 ? `${change}%` : "same"}
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
            accept=".jpg,.jpeg,.png,.webp,.bmp,.gif"
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
                    {selectedImage.originalFormat} &bull;{" "}
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
                      Original ({selectedImage.originalFormat})
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
                      Converted ({outputFormat.toUpperCase()})
                    </span>
                    {selectedImage.convertedSize !== null && (
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(selectedImage.convertedSize)}
                        {(() => {
                          const pct = percentChange(
                            selectedImage.originalSize,
                            selectedImage.convertedSize!
                          );
                          if (pct < 0) {
                            return (
                              <span className="text-green-500 ml-1 font-medium">
                                ({pct}%)
                              </span>
                            );
                          }
                          if (pct > 0) {
                            return (
                              <span className="text-orange-500 ml-1 font-medium">
                                (+{pct}%)
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-2 flex items-center justify-center min-h-[300px]">
                    {selectedImage.status === "done" &&
                    selectedImage.convertedUrl ? (
                      <img
                        src={selectedImage.convertedUrl}
                        alt="Converted"
                        className="max-w-full max-h-[400px] rounded object-contain"
                      />
                    ) : selectedImage.status === "converting" ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm">Converting...</span>
                      </div>
                    ) : selectedImage.status === "error" ? (
                      <div className="text-center text-sm text-destructive">
                        {selectedImage.error || "Conversion failed"}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">
                          Click &quot;Convert All&quot; to start
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
