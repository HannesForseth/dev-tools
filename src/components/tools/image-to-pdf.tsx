"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Plus,
  Loader2,
  ChevronUp,
  ChevronDown,
  FileText,
  GripVertical,
} from "lucide-react";

type PageSize = "a4" | "letter" | "original";
type Orientation = "auto" | "portrait" | "landscape";
type Margin = "none" | "small" | "normal";
type ImageFit = "fit" | "fill" | "center";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// --- Pure PDF builder (no dependencies) ---

// PDF uses 72 DPI points. A4 = 595.28 x 841.89 pt, Letter = 612 x 792 pt
const PAGE_SIZES = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
};

function getMarginPx(margin: Margin): number {
  switch (margin) {
    case "none":
      return 0;
    case "small":
      return 18; // ~6mm
    case "normal":
      return 36; // ~12mm
  }
}

/**
 * Convert an image element to JPEG bytes via a canvas.
 * Returns the raw JPEG binary as a Uint8Array.
 */
function imageToJpegBytes(
  img: HTMLImageElement,
  quality: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create JPEG blob"));
          return;
        }
        blob.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
      },
      "image/jpeg",
      quality / 100
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Build a minimal valid PDF containing JPEG images, one per page.
 * Uses DCTDecode (native JPEG embedding) for small file size.
 */
function buildPdf(
  pages: {
    jpegBytes: Uint8Array;
    imgW: number;
    imgH: number;
    pageW: number;
    pageH: number;
    drawX: number;
    drawY: number;
    drawW: number;
    drawH: number;
  }[]
): Blob {
  // We'll build the PDF as an array of strings/binary chunks then concatenate.
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = []; // byte offset of each object
  let pos = 0;

  function write(s: string) {
    const b = encoder.encode(s);
    chunks.push(b);
    pos += b.length;
  }

  function writeBin(b: Uint8Array) {
    chunks.push(b);
    pos += b.length;
  }

  function markObj(n: number) {
    offsets[n] = pos;
  }

  // Object numbering plan:
  // 1 = Catalog
  // 2 = Pages
  // For each page i (0-based): 3 + i*2 = Page, 4 + i*2 = Image XObject
  const numPages = pages.length;
  const totalObjects = 2 + numPages * 2;

  // Header
  write("%PDF-1.4\n%\xC0\xC1\xC2\xC3\n");

  // Object 1: Catalog
  markObj(1);
  write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Object 2: Pages
  const kidRefs = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
  markObj(2);
  write(
    `2 0 obj\n<< /Type /Pages /Kids [${kidRefs}] /Count ${numPages} >>\nendobj\n`
  );

  // Each page + its image
  for (let i = 0; i < numPages; i++) {
    const p = pages[i];
    const pageObjNum = 3 + i * 2;
    const imgObjNum = 4 + i * 2;

    // Content stream: draw the image
    // PDF coordinate system: origin at bottom-left
    const contentStr = `q\n${p.drawW.toFixed(2)} 0 0 ${p.drawH.toFixed(
      2
    )} ${p.drawX.toFixed(2)} ${p.drawY.toFixed(2)} cm\n/Img${i} Do\nQ\n`;
    const contentBytes = encoder.encode(contentStr);

    // Page object
    markObj(pageObjNum);
    write(
      `${pageObjNum} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R\n` +
        `   /MediaBox [0 0 ${p.pageW.toFixed(2)} ${p.pageH.toFixed(2)}]\n` +
        `   /Contents ${pageObjNum + numPages * 2} 0 R\n` +
        `   /Resources << /XObject << /Img${i} ${imgObjNum} 0 R >> >>\n` +
        `>>\nendobj\n`
    );

    // Image XObject
    markObj(imgObjNum);
    write(
      `${imgObjNum} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image\n` +
        `   /Width ${p.imgW} /Height ${p.imgH}\n` +
        `   /ColorSpace /DeviceRGB /BitsPerComponent 8\n` +
        `   /Filter /DCTDecode\n` +
        `   /Length ${p.jpegBytes.length}\n` +
        `>>\nstream\n`
    );
    writeBin(p.jpegBytes);
    write("\nendstream\nendobj\n");
  }

  // Content stream objects (one per page)
  for (let i = 0; i < numPages; i++) {
    const p = pages[i];
    const contentObjNum = 3 + i * 2 + numPages * 2;
    const contentStr = `q\n${p.drawW.toFixed(2)} 0 0 ${p.drawH.toFixed(
      2
    )} ${p.drawX.toFixed(2)} ${p.drawY.toFixed(2)} cm\n/Img${i} Do\nQ\n`;
    const contentBytes = encoder.encode(contentStr);

    markObj(contentObjNum);
    write(
      `${contentObjNum} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`
    );
    writeBin(contentBytes);
    write("\nendstream\nendobj\n");
  }

  // Cross-reference table
  const xrefOffset = pos;
  const allObjNums = totalObjects + numPages; // total objects including content streams
  write(`xref\n0 ${allObjNums + 1}\n`);
  write("0000000000 65535 f \n");
  for (let n = 1; n <= allObjNums; n++) {
    const off = offsets[n] ?? 0;
    write(`${String(off).padStart(10, "0")} 00000 n \n`);
  }

  // Trailer
  write(
    `trailer\n<< /Size ${allObjNums + 1} /Root 1 0 R >>\n` +
      `startxref\n${xrefOffset}\n%%EOF\n`
  );

  // Combine all chunks
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([result], { type: "application/pdf" });
}

/**
 * Main function: given images + settings, produce a PDF Blob.
 */
async function generatePdf(
  items: ImageItem[],
  pageSize: PageSize,
  orientation: Orientation,
  margin: Margin,
  imageFit: ImageFit,
  quality: number
): Promise<Blob> {
  const marginPx = getMarginPx(margin);
  const pageData: Parameters<typeof buildPdf>[0] = [];

  for (const item of items) {
    const img = await loadImage(item.url);
    const jpegBytes = await imageToJpegBytes(img, quality);
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Determine page dimensions
    let pageW: number;
    let pageH: number;

    if (pageSize === "original") {
      // 1 pixel = 1 point (72 DPI)
      pageW = imgW;
      pageH = imgH;
    } else {
      const base = PAGE_SIZES[pageSize];
      // Determine orientation
      const imgIsLandscape = imgW > imgH;
      let useLandscape: boolean;
      if (orientation === "auto") {
        useLandscape = imgIsLandscape;
      } else {
        useLandscape = orientation === "landscape";
      }
      if (useLandscape) {
        pageW = Math.max(base.w, base.h);
        pageH = Math.min(base.w, base.h);
      } else {
        pageW = Math.min(base.w, base.h);
        pageH = Math.max(base.w, base.h);
      }
    }

    // Available area after margins
    const availW = pageW - marginPx * 2;
    const availH = pageH - marginPx * 2;

    let drawW: number;
    let drawH: number;
    let drawX: number;
    let drawY: number; // bottom-left origin

    if (imageFit === "fill") {
      drawW = availW;
      drawH = availH;
      drawX = marginPx;
      drawY = marginPx;
    } else if (imageFit === "fit") {
      const scale = Math.min(availW / imgW, availH / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
      drawX = marginPx + (availW - drawW) / 2;
      drawY = marginPx + (availH - drawH) / 2;
    } else {
      // center — original size, centered, clipped by page
      drawW = Math.min(imgW, availW);
      drawH = Math.min(imgH, availH);
      drawX = marginPx + (availW - drawW) / 2;
      drawY = marginPx + (availH - drawH) / 2;
    }

    pageData.push({
      jpegBytes,
      imgW,
      imgH,
      pageW,
      pageH,
      drawX,
      drawY,
      drawW,
      drawH,
    });
  }

  return buildPdf(pageData);
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<Margin>("normal");
  const [imageFit, setImageFit] = useState<ImageFit>("fit");
  const [quality, setQuality] = useState(85);
  const [dragOver, setDragOver] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
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

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/bmp"];
    const newItems: ImageItem[] = [];

    for (const file of Array.from(files)) {
      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(jpe?g|png|webp|gif|bmp)$/i)
      )
        continue;
      if (file.size > 50 * 1024 * 1024) continue;

      const url = URL.createObjectURL(file);
      const dims = await loadImageDimensions(url);

      newItems.push({
        id: crypto.randomUUID(),
        file,
        url,
        width: dims.width,
        height: dims.height,
        size: file.size,
      });
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      // Clear any previous PDF when new images are added
      setPdfBlob(null);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }
  }, [pdfUrl]);

  const removeImage = (id: string) => {
    const item = images.find((img) => img.id === id);
    if (item) URL.revokeObjectURL(item.url);
    setImages((prev) => prev.filter((img) => img.id !== id));
    setPdfBlob(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setPdfBlob(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImages((prev) => {
      const next = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next;
    });
    setPdfBlob(null);
  };

  const handleDragStart = (index: number) => {
    setDragIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === index) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIdx(index);
    setPdfBlob(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    setGenerating(true);
    setPdfBlob(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const blob = await generatePdf(
        images,
        pageSize,
        orientation,
        margin,
        imageFit,
        quality
      );
      setPdfBlob(blob);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "images.pdf";
    a.click();
  };

  const totalSize = images.reduce((s, img) => s + img.size, 0);
  const estimatedPdfSize = Math.round(totalSize * (quality / 100) * 0.9);

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
              JPG, PNG, WebP, GIF, BMP — up to 50MB per file — multiple files
              supported
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
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
          {/* Page Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Page Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value as PageSize);
                setPdfBlob(null);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="original">Original</option>
            </select>
          </div>

          {/* Orientation */}
          {pageSize !== "original" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => {
                  setOrientation(e.target.value as Orientation);
                  setPdfBlob(null);
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="auto">Auto</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          )}

          {/* Margin */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Margin
            </label>
            <select
              value={margin}
              onChange={(e) => {
                setMargin(e.target.value as Margin);
                setPdfBlob(null);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Image Fit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Image Fit
            </label>
            <select
              value={imageFit}
              onChange={(e) => {
                setImageFit(e.target.value as ImageFit);
                setPdfBlob(null);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="fit">Fit (aspect ratio)</option>
              <option value="fill">Fill (stretch)</option>
              <option value="center">Center</option>
            </select>
          </div>

          {/* Quality */}
          <div className="space-y-1.5 min-w-[160px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              JPEG Quality ({quality}%)
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => {
                setQuality(Number(e.target.value));
                setPdfBlob(null);
              }}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Pages
          </p>
          <p className="text-lg font-semibold mt-0.5">{images.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Image Size
          </p>
          <p className="text-lg font-semibold mt-0.5">
            {formatBytes(totalSize)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {pdfBlob ? "PDF Size" : "Est. PDF Size"}
          </p>
          <p className="text-lg font-semibold mt-0.5">
            {pdfBlob
              ? formatBytes(pdfBlob.size)
              : `~${formatBytes(estimatedPdfSize)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Image list */}
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
            {images.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                  dragIdx === index
                    ? "border-primary bg-primary/5 opacity-50"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                <img
                  src={item.url}
                  alt=""
                  className="h-10 w-10 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.width} x {item.height} &middot;{" "}
                    {formatBytes(item.size)}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
                  p.{index + 1}
                </span>
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeImage(item.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {/* Generate / Download buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleGenerate}
              disabled={generating || images.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate PDF
                </>
              )}
            </button>
            {pdfBlob && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors w-full"
              >
                <Download className="h-4 w-4" />
                Download PDF ({formatBytes(pdfBlob.size)})
              </button>
            )}
          </div>
        </div>

        {/* Preview area */}
        <div className="space-y-3">
          {pdfBlob && pdfUrl ? (
            <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                <span className="text-sm font-medium">PDF Preview</span>
                <span className="text-xs text-muted-foreground">
                  {images.length} page{images.length !== 1 ? "s" : ""} &middot;{" "}
                  {formatBytes(pdfBlob.size)}
                </span>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-[600px] bg-white"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Image Thumbnails
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative group rounded-lg border border-border overflow-hidden bg-white aspect-[3/4] flex items-center justify-center"
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="max-w-full max-h-full object-contain p-1"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Click &quot;Generate PDF&quot; to create your PDF
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
