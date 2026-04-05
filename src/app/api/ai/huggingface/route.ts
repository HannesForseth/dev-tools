import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

// Allow up to 60 seconds for HF Spaces cold starts
export const maxDuration = 60;

const ALLOWED_SPACES: Record<string, boolean> = {
  "not-lain/background-removal": true,
  "mcp-tools/DeepSeek-OCR-experimental": true,
  "evalstate/flux1_schnell": true,
  "ResembleAI/Chatterbox": true,
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

    // Validate image input for image-based spaces
    if (["not-lain/background-removal", "mcp-tools/DeepSeek-OCR-experimental"].includes(space)) {
      if (!params?.image || typeof params.image !== "string" || !params.image.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload an image first" }, { status: 400 });
      }
    }
    if (space === "evalstate/flux1_schnell" && (!params?.prompt || typeof params.prompt !== "string")) {
      return NextResponse.json({ error: "Please enter a prompt" }, { status: 400 });
    }
    if (space === "ResembleAI/Chatterbox" && (!params?.text || typeof params.text !== "string")) {
      return NextResponse.json({ error: "Please enter text to convert to speech" }, { status: 400 });
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

    // Text to Speech (Chatterbox)
    if (space === "ResembleAI/Chatterbox") {
      const result = await client.predict("/generate_tts_audio", {
        text_input: params.text,
        exaggeration_input: params.exaggeration ?? 0.5,
        temperature_input: 0.8,
        cfgw_input: 0.5,
        seed_num_input: 0,
      });

      const data = result.data as Array<{ url?: string } | null>;
      const audioData = data?.[0];
      if (typeof audioData === "object" && audioData?.url) {
        const audioRes = await fetch(audioData.url);
        const blob = await audioRes.blob();
        const dataUrl = await toDataURL(new Blob([await blob.arrayBuffer()], { type: "audio/wav" }));
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No audio result from TTS" }, { status: 500 });
    }

    return NextResponse.json({ error: "Space not implemented" }, { status: 400 });
  } catch (e) {
    console.error("HF proxy error:", e);
    const message = e instanceof Error ? e.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
