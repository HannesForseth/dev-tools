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
  Lock,
  Unlock,
  Scaling,
} from "lucide-react";

type OutputFormat = "jpeg" | "png";

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  resizedUrl: string | null;
  resizedSize: number | null;
  resizedBlob: Blob | null;
  status: "pending" | "resizing" | "done" | "error";
  error?: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface Preset {
  label: string;
  group: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  // Social media
  { label: "Instagram Post", group: "Social Media", width: 1080, height: 1080 },
  { label: "Instagram Story", group: "Social Media", width: 1080, height: 1920 },
  { label: "Twitter/X Post", group: "Social Media", width: 1200, height: 675 },
  { label: "Facebook Post", group: "Social Media", width: 1200, height: 630 },
  { label: "LinkedIn Post", group: "Social Media", width: 1200, height: 627 },
  { label: "YouTube Thumbnail", group: "Social Media", width: 1280, height: 720 },
  // Common sizes
  { label: "Full HD (1920x1080)", group: "Common", width: 1920, height: 1080 },
  { label: "HD (1280x720)", group: "Common", width: 1280, height: 720 },
  { label: "SVGA (800x600)", group: "Common", width: 800, height: 600 },
  { label: "Thumbnail (150x150)", group: "Common", width: 150, height: 150 },
  { label: "Avatar (256x256)", group: "Common", width: 256, height: 256 },
  { label: "Banner (1500x500)", group: "Common", width: 1500, height: 500 },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getMimeType(format: OutputFormat): string {
  return format === "jpeg" ? "image/jpeg" : "image/png";
}

function getExtension(format: OutputFormat): string {
  return format === "jpeg" ? "jpg" : "png";
}

export function ImageResizer() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [targetWidth, setTargetWidth] = useState(1920);
  const [targetHeight, setTargetHeight] = useState(1080);
  const [lockAspect, setLockAspect] = useState(true);
  const [quality, setQuality] = useState(90);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [dragOver, setDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Store the aspect ratio of the first uploaded image (or most recently selected)
  const [aspectRatio, setAspectRatio] = useState(1920 / 1080);
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
          resizedUrl: null,
          resizedSize: null,
          resizedBlob: null,
          status: "pending",
          naturalWidth: dims.width,
          naturalHeight: dims.height,
        });
      }

      if (newItems.length > 0) {
        setImages((prev) => [...prev, ...newItems]);
        // Set target dimensions from first image
        if (images.length === 0 && newItems.length > 0) {
          const first = newItems[0];
          setTargetWidth(first.naturalWidth);
          setTargetHeight(first.naturalHeight);
          setAspectRatio(first.naturalWidth / first.naturalHeight);
          setSelectedId(newItems[0].id);
        } else if (!selectedId) {
          setSelectedId(newItems[0].id);
        }
      }
    },
    [selectedId, images.length]
  );

  const handleWidthChange = (w: number) => {
    const safeW = Math.max(1, w);
    setTargetWidth(safeW);
    if (lockAspect) {
      setTargetHeight(Math.max(1, Math.round(safeW / aspectRatio)));
    }
  };

  const handleHeightChange = (h: number) => {
    const safeH = Math.max(1, h);
    setTargetHeight(safeH);
    if (lockAspect) {
      setTargetWidth(Math.max(1, Math.round(safeH * aspectRatio)));
    }
  };

  const applyPreset = (preset: Preset) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    // Unlock aspect ratio when using a preset since the preset has fixed dims
    setLockAspect(false);
  };

  const resizeImage = useCallback(
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
                  error: "Resize failed",
                });
                return;
              }

              const resizedUrl = URL.createObjectURL(blob);
              resolve({
                ...item,
                resizedUrl,
                resizedSize: blob.size,
                resizedBlob: blob,
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
    [targetWidth, targetHeight, quality, outputFormat]
  );

  const resizeAll = useCallback(async () => {
    const pending = images.filter(
      (img) => img.status === "pending" || img.status === "error"
    );
    if (pending.length === 0) return;

    setImages((prev) =>
      prev.map((img) =>
        img.status === "pending" || img.status === "error"
          ? { ...img, status: "resizing" as const }
          : img
      )
    );

    for (const item of pending) {
      const result = await resizeImage({
        ...item,
        status: "resizing",
      });
      setImages((prev) =>
        prev.map((img) => (img.id === result.id ? result : img))
      );
    }
  }, [images, resizeImage]);

  const reresizeAll = useCallback(async () => {
    images.forEach((img) => {
      if (img.resizedUrl) URL.revokeObjectURL(img.resizedUrl);
    });

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: "resizing" as const,
        resizedUrl: null,
        resizedSize: null,
        resizedBlob: null,
      }))
    );

    for (const item of images) {
      const result = await resizeImage({
        ...item,
        status: "resizing",
        resizedUrl: null,
        resizedSize: null,
        resizedBlob: null,
      });
      setImages((prev) =>
        prev.map((img) => (img.id === result.id ? result : img))
      );
    }
  }, [images, resizeImage]);

  const downloadImage = (item: ImageItem) => {
    if (!item.resizedUrl) return;
    const a = document.createElement("a");
    a.href = item.resizedUrl;
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-${targetWidth}x${targetHeight}.${getExtension(outputFormat)}`;
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
      if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);
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
      if (img.resizedUrl) URL.revokeObjectURL(img.resizedUrl);
    });
    setImages([]);
    setSelectedId(null);
  };

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const allDone = images.length > 0 && images.every((img) => img.status === "done");
  const anyResizing = images.some((img) => img.status === "resizing");
  const hasPending = images.some((img) => img.status === "pending" || img.status === "error");

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
          {/* Width */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Width (px)
            </label>
            <input
              type="number"
              value={targetWidth}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Aspect ratio lock */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Ratio
            </label>
            <button
              onClick={() => {
                const newLock = !lockAspect;
                setLockAspect(newLock);
                if (newLock) {
                  // Recalculate aspect ratio from current target dims
                  setAspectRatio(targetWidth / targetHeight);
                }
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                lockAspect
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
              title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
            >
              {lockAspect ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Height (px)
            </label>
            <input
              type="number"
              value={targetHeight}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

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
              <option value="png">PNG</option>
            </select>
          </div>

          {/* Quality (JPEG only) */}
          {outputFormat === "jpeg" && (
            <div className="space-y-1.5 min-w-[160px]">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quality ({quality}%)
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 ml-auto">
            {hasPending && (
              <button
                onClick={resizeAll}
                disabled={anyResizing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {anyResizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Scaling className="h-3.5 w-3.5" />
                )}
                {anyResizing ? "Resizing..." : "Resize All"}
              </button>
            )}
            {allDone && (
              <button
                onClick={reresizeAll}
                disabled={anyResizing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Re-resize
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

      {/* Presets */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Quick Presets
        </p>
        <div className="space-y-3">
          {["Social Media", "Common"].map((group) => (
            <div key={group}>
              <p className="text-xs text-muted-foreground mb-1.5">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.filter((p) => p.group === group).map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      targetWidth === preset.width && targetHeight === preset.height
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {preset.label}
                    <span className="text-muted-foreground ml-1">
                      {preset.width}x{preset.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

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
            {images.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  // Update aspect ratio to this image's ratio
                  if (item.naturalWidth && item.naturalHeight) {
                    setAspectRatio(item.naturalWidth / item.naturalHeight);
                  }
                }}
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
                      {item.naturalWidth}x{item.naturalHeight}
                    </span>
                    {item.status === "resizing" && (
                      <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
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
            ))}
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
                    {selectedImage.naturalWidth}x{selectedImage.naturalHeight}
                    {" "}({formatBytes(selectedImage.originalSize)})
                    {" "}&rarr;{" "}{targetWidth}x{targetHeight}
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
                      {selectedImage.naturalWidth}x{selectedImage.naturalHeight} &middot; {formatBytes(selectedImage.originalSize)}
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
                      Resized
                    </span>
                    {selectedImage.resizedSize !== null && (
                      <span className="text-xs text-muted-foreground">
                        {targetWidth}x{targetHeight} &middot; {formatBytes(selectedImage.resizedSize)}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-2 flex items-center justify-center min-h-[300px]">
                    {selectedImage.status === "done" &&
                    selectedImage.resizedUrl ? (
                      <img
                        src={selectedImage.resizedUrl}
                        alt="Resized"
                        className="max-w-full max-h-[400px] rounded object-contain"
                      />
                    ) : selectedImage.status === "resizing" ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm">Resizing...</span>
                      </div>
                    ) : selectedImage.status === "error" ? (
                      <div className="text-center text-sm text-destructive">
                        {selectedImage.error || "Resize failed"}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">
                          Click &quot;Resize All&quot; to start
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

      {/* SEO content section */}
      <section className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
        <h2>How to Resize Images Online with AllKit</h2>
        <p>
          Resizing images is one of the most common tasks for anyone working with digital media. Whether you are preparing
          photos for a website, optimizing images for social media posts, creating thumbnails for a blog, or simply need
          to fit an image into specific pixel dimensions, AllKit&apos;s free Image Resizer handles it all directly in your
          browser. There is no software to install, no account to create, and your images never leave your device.
        </p>
        <p>
          Unlike many online image resizers that upload your files to remote servers, AllKit uses the HTML5 Canvas API to
          process everything client-side. This means your photos and screenshots stay completely private. It also means
          the tool works just as fast on a mobile phone as on a desktop computer — the resizing happens instantly
          regardless of your internet connection speed.
        </p>
        <p>
          The tool supports single images and batch processing. Upload one image or fifty — set your target dimensions
          once and resize them all with a single click. Choose from built-in presets for popular social media platforms
          (Instagram, Twitter/X, Facebook, LinkedIn, YouTube) or enter custom pixel dimensions. The aspect ratio lock
          ensures your images are never distorted unless you intentionally want non-proportional scaling.
        </p>
        <p>
          Output your resized images as JPEG (with adjustable quality from 1-100%) or PNG (lossless, with transparency
          support). JPEG is ideal for photographs where smaller file size matters, while PNG is perfect for screenshots,
          graphics, and any image where you need crisp edges or a transparent background.
        </p>

        <h3>Step-by-Step: How to Use the Image Resizer</h3>
        <ol>
          <li><strong>Upload your image(s)</strong> — Drag and drop files into the upload area, or click to browse your device. You can upload multiple images at once (JPG, PNG, or WebP, up to 50MB each).</li>
          <li><strong>Set target dimensions</strong> — Enter custom width and height in pixels, or click a preset button (e.g., &quot;Instagram Post 1080x1080&quot; or &quot;YouTube Thumbnail 1280x720&quot;). Use the lock icon to maintain the original aspect ratio.</li>
          <li><strong>Choose output format</strong> — Select JPEG for photos (and use the quality slider to balance size vs. quality) or PNG for lossless output with transparency support.</li>
          <li><strong>Click &quot;Resize All&quot;</strong> — All uploaded images are resized to your chosen dimensions instantly. Preview the original and resized versions side by side.</li>
          <li><strong>Download</strong> — Click &quot;Download&quot; on individual images or &quot;Download All&quot; to save everything at once. File names include the new dimensions for easy identification.</li>
        </ol>

        <h3>Common Use Cases</h3>
        <ul>
          <li><strong>Social media content</strong> — Each platform has optimal image dimensions. An Instagram post should be 1080x1080, a Twitter header 1500x500, a LinkedIn banner 1584x396. Using the wrong size leads to cropping or blurry scaling. AllKit&apos;s presets ensure pixel-perfect results every time.</li>
          <li><strong>Website optimization</strong> — Large images slow down web pages and hurt SEO. Resize photos to the exact display size (e.g., 800px wide for a blog post) to dramatically reduce load times and improve Core Web Vitals scores.</li>
          <li><strong>Email attachments</strong> — Many email providers limit attachment sizes. Resizing a 4000x3000 photo from a smartphone to 1920x1440 can reduce the file size by 75% or more while still looking great on any screen.</li>
          <li><strong>E-commerce product images</strong> — Online stores typically require specific image dimensions for consistency across product listings. Batch resize all your product photos to a uniform size in seconds.</li>
          <li><strong>Thumbnails and avatars</strong> — Need a 150x150 thumbnail or a 256x256 avatar? Use the preset or type the exact dimensions. The aspect ratio lock prevents distortion when creating square crops from rectangular originals.</li>
          <li><strong>Print preparation</strong> — Resize images to match specific print dimensions. While the tool works in pixels, you can calculate the required pixel dimensions from your target print size and DPI (e.g., a 4x6 inch print at 300 DPI needs 1200x1800 pixels).</li>
          <li><strong>Presentations and documents</strong> — Resize images to fit slide layouts or document templates. Full HD (1920x1080) is the standard for presentations, and the tool has it as a one-click preset.</li>
        </ul>

        <h3>How Image Resizing Works (Technical Details)</h3>
        <p>
          Image resizing is the process of changing the pixel dimensions of a digital image. When you resize an image,
          the browser creates a new pixel grid at the target dimensions and fills it by sampling from the original image
          — a process called <strong>interpolation</strong>.
        </p>
        <p>
          <strong>Downscaling</strong> (making an image smaller) generally produces excellent results because each new
          pixel is calculated from multiple original pixels, effectively averaging the detail. This is why a high-resolution
          photo resized to a smaller size still looks sharp.
        </p>
        <p>
          <strong>Upscaling</strong> (making an image larger) is more challenging because the algorithm must create new
          pixels that did not exist in the original. Modern browsers use bicubic interpolation by default, which produces
          smooth results but cannot add real detail. For significant enlargements, consider AI-based upscaling tools.
        </p>
        <p>
          AllKit uses the HTML5 Canvas API with the browser&apos;s native <code>drawImage()</code> method, which
          automatically applies high-quality interpolation. The <code>toBlob()</code> method then encodes the resized
          canvas to your chosen output format (JPEG or PNG) at the specified quality level. The entire operation happens
          in memory without any network requests — your image data never touches a server.
        </p>
      </section>
    </div>
  );
}
