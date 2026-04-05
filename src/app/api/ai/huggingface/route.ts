import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

const ALLOWED_SPACES: Record<string, boolean> = {
  "not-lain/background-removal": true,
  "mcp-tools/DeepSeek-OCR-experimental": true,
  "evalstate/flux1_schnell": true,
};

// Convert base64 data URL to Blob
function dataURLToBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

// Convert Blob/Response to base64 data URL
async function toDataURL(data: Blob): Promise<string> {
  const buffer = await data.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mime = data.type || "image/png";
  return `data:${mime};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const { space, params } = await req.json();

    if (!space || !ALLOWED_SPACES[space]) {
      return NextResponse.json({ error: "Invalid space" }, { status: 400 });
    }

    const client = await Client.connect(space);

    // Background Removal
    if (space === "not-lain/background-removal") {
      const imageBlob = dataURLToBlob(params.image);
      const result = await client.predict("/predict", {
        input_image: handle_file(imageBlob),
      });

      const data = result.data as Array<{ url?: string; path?: string }>;
      if (data?.[0]?.url) {
        // Fetch the result image from the HF Space URL
        const imageRes = await fetch(data[0].url);
        const blob = await imageRes.blob();
        const dataUrl = await toDataURL(blob);
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No result from background removal" }, { status: 500 });
    }

    // OCR
    if (space === "mcp-tools/DeepSeek-OCR-experimental") {
      const imageBlob = dataURLToBlob(params.image);
      const result = await client.predict("/predict", {
        image: handle_file(imageBlob),
      });

      const data = result.data as string[];
      const text = data?.[0] || "";
      return NextResponse.json({ result: text });
    }

    // Image Generation (FLUX.1 Schnell)
    if (space === "evalstate/flux1_schnell") {
      const result = await client.predict("/infer", {
        prompt: params.prompt,
        seed: 0,
        randomize_seed: true,
        width: 1024,
        height: 1024,
        num_inference_steps: 4,
      });

      const data = result.data as Array<{ url?: string; path?: string } | number>;
      const imageData = data?.[0];
      if (typeof imageData === "object" && imageData?.url) {
        const imageRes = await fetch(imageData.url);
        const blob = await imageRes.blob();
        const dataUrl = await toDataURL(blob);
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No result from image generator" }, { status: 500 });
    }

    return NextResponse.json({ error: "Space not implemented" }, { status: 400 });
  } catch (e) {
    console.error("HF proxy error:", e);
    const message = e instanceof Error ? e.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
