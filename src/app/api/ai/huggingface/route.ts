import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

// Allow up to 120 seconds for HF Spaces cold starts (video generation needs more time)
export const maxDuration = 120;

const ALLOWED_SPACES: Record<string, boolean> = {
  "not-lain/background-removal": true,
  "briaai/BRIA-RMBG-2.0": true,
  "mcp-tools/DeepSeek-OCR-experimental": true,
  "evalstate/flux1_schnell": true,
  "ResembleAI/Chatterbox": true,
  "felixrosberg/face-swap": true,
  "finegrain/finegrain-image-enhancer": true,
  "KlingTeam/LivePortrait": true,
  "hf-audio/whisper-large-v3": true,
  "tonyassi/voice-clone": true,
  "zerogpu-aoti/wan2-2-fp8da-aoti-faster": true,
  "nvidia/Kimodo": true,
};

// Background removal spaces in priority order (fallback chain)
const BG_REMOVAL_SPACES = [
  "briaai/BRIA-RMBG-2.0",
  "not-lain/background-removal",
];

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
    if (["not-lain/background-removal", "briaai/BRIA-RMBG-2.0", "mcp-tools/DeepSeek-OCR-experimental", "finegrain/finegrain-image-enhancer"].includes(space)) {
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
    if (space === "felixrosberg/face-swap") {
      if (!params?.target || typeof params.target !== "string" || !params.target.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload a target image (the face to change)" }, { status: 400 });
      }
      if (!params?.source || typeof params.source !== "string" || !params.source.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload a source image (the face to use)" }, { status: 400 });
      }
    }
    if (space === "KlingTeam/LivePortrait") {
      if (!params?.image || typeof params.image !== "string" || !params.image.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload a portrait photo" }, { status: 400 });
      }
      if (!params?.video || typeof params.video !== "string" || !params.video.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload a driving video" }, { status: 400 });
      }
    }
    if (space === "tonyassi/voice-clone") {
      if (!params?.text || typeof params.text !== "string") {
        return NextResponse.json({ error: "Please enter text to speak" }, { status: 400 });
      }
      if (!params?.audio || typeof params.audio !== "string" || !params.audio.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload or record a voice sample" }, { status: 400 });
      }
    }
    if (space === "hf-audio/whisper-large-v3") {
      if (!params?.audio || typeof params.audio !== "string" || !params.audio.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload an audio file first" }, { status: 400 });
      }
    }
    if (space === "zerogpu-aoti/wan2-2-fp8da-aoti-faster") {
      if (!params?.image || typeof params.image !== "string" || !params.image.startsWith("data:")) {
        return NextResponse.json({ error: "Please upload an image first" }, { status: 400 });
      }
      if (!params?.prompt || typeof params.prompt !== "string") {
        return NextResponse.json({ error: "Please enter a motion prompt" }, { status: 400 });
      }
    }
    if (space === "nvidia/Kimodo") {
      if (!params?.prompt || typeof params.prompt !== "string" || !params.prompt.trim()) {
        return NextResponse.json({ error: "Please describe the motion you want to generate" }, { status: 400 });
      }
    }

    const client = await Client.connect(space);

    // Background Removal (with fallback chain)
    if (space === "not-lain/background-removal" || space === "briaai/BRIA-RMBG-2.0") {
      const imageBlob = dataURLToBlob(params.image);

      // Try each space in the fallback chain
      for (const bgSpace of BG_REMOVAL_SPACES) {
        try {
          console.log(`Trying background removal with ${bgSpace}...`);
          const bgClient = await Client.connect(bgSpace);

          let result;
          if (bgSpace === "briaai/BRIA-RMBG-2.0") {
            result = await bgClient.predict("/image", {
              input_image: handle_file(imageBlob),
            });
          } else {
            result = await bgClient.predict("/predict", {
              input_image: handle_file(imageBlob),
            });
          }

          const data = result.data as Array<{ url?: string; path?: string }>;
          if (data?.[0]?.url) {
            const imageRes = await fetch(data[0].url);
            const blob = await imageRes.blob();
            const dataUrl = await toDataURL(blob);
            return NextResponse.json({ result: dataUrl });
          }
        } catch (bgError) {
          console.error(`Background removal failed with ${bgSpace}:`, bgError);
          // Continue to next space in fallback chain
          continue;
        }
      }
      return NextResponse.json({ error: "All background removal models are currently unavailable. Please try again in a minute." }, { status: 503 });
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

    // Face Swap
    if (space === "felixrosberg/face-swap") {
      const targetBlob = dataURLToBlob(params.target);
      const sourceBlob = dataURLToBlob(params.source);

      const result = await client.predict("/run_inference", {
        target: handle_file(targetBlob),
        source: handle_file(sourceBlob),
        slider: 100,
        adv_slider: 100,
        settings: [],
      });

      const data = result.data as Array<{ url?: string; path?: string }>;
      if (data?.[0]?.url) {
        const imageRes = await fetch(data[0].url);
        const blob = await imageRes.blob();
        const dataUrl = await toDataURL(blob);
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No result from face swap" }, { status: 500 });
    }

    // Live Portrait (Animate Photo)
    if (space === "KlingTeam/LivePortrait") {
      const imageBlob = dataURLToBlob(params.image);
      const videoBlob = dataURLToBlob(params.video);
      const result = await client.predict("/gpu_wrapped_execute_video", {
        param_0: handle_file(imageBlob),
        param_1: handle_file(videoBlob),
        param_2: true,
        param_3: true,
        param_4: true,
      });
      const data = result.data as Array<{ url?: string; video?: { url?: string } } | null>;
      const videoData = data?.[0];
      if (typeof videoData === "object" && videoData?.url) {
        const videoRes = await fetch(videoData.url);
        const blob = await videoRes.blob();
        const dataUrl = await toDataURL(new Blob([await blob.arrayBuffer()], { type: "video/mp4" }));
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No video result from Live Portrait" }, { status: 500 });
    }

    // Image Upscaling (Finegrain Image Enhancer)
    if (space === "finegrain/finegrain-image-enhancer") {
      const imageBlob = dataURLToBlob(params.image);

      const result = await client.predict("/process", {
        input_image: handle_file(imageBlob),
        prompt: "",
        negative_prompt: "",
        seed: 42,
        upscale_factor: 2,
        controlnet_scale: 0.6,
        controlnet_decay: 1.0,
        condition_scale: 6,
        tile_width: 112,
        tile_height: 144,
        denoise_strength: 0.35,
        num_inference_steps: 18,
        solver: "DDIM",
      });

      const data = result.data as Array<{ url?: string; path?: string }>;
      if (data?.[0]?.url) {
        const imageRes = await fetch(data[0].url);
        const blob = await imageRes.blob();
        const dataUrl = await toDataURL(blob);
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No result from image upscaler" }, { status: 500 });
    }

    // Voice Cloning (XTTS v2)
    if (space === "tonyassi/voice-clone") {
      const audioBlob = dataURLToBlob(params.audio);
      const result = await client.predict("/predict", {
        text: params.text,
        audio: handle_file(audioBlob),
      });
      const data = result.data as Array<{ url?: string } | null>;
      const audioData = data?.[0];
      if (typeof audioData === "object" && audioData?.url) {
        const audioRes = await fetch(audioData.url);
        const blob = await audioRes.blob();
        const dataUrl = await toDataURL(new Blob([await blob.arrayBuffer()], { type: "audio/wav" }));
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No audio result from voice cloning" }, { status: 500 });
    }

    // Speech to Text (Whisper)
    if (space === "hf-audio/whisper-large-v3") {
      const audioBlob = dataURLToBlob(params.audio);
      const result = await client.predict("/predict", {
        inputs: handle_file(audioBlob),
        task: params.task || "transcribe",
      });
      const data = result.data as string[];
      return NextResponse.json({ result: data?.[0] || "" });
    }

    // Image to Video (Wan2.2 14B)
    if (space === "zerogpu-aoti/wan2-2-fp8da-aoti-faster") {
      const imageBlob = dataURLToBlob(params.image);
      const result = await client.predict("/predict", {
        image: handle_file(imageBlob),
        prompt: params.prompt || "",
      });
      const data = result.data as Array<{ url?: string; video?: { url?: string } } | null>;
      const videoData = data?.[0];
      if (typeof videoData === "object" && videoData?.url) {
        const videoRes = await fetch(videoData.url);
        const blob = await videoRes.blob();
        const dataUrl = await toDataURL(new Blob([await blob.arrayBuffer()], { type: "video/mp4" }));
        return NextResponse.json({ result: dataUrl });
      }
      return NextResponse.json({ error: "No video result from Image to Video" }, { status: 500 });
    }

    // Text to 3D Motion (NVIDIA Kimodo)
    if (space === "nvidia/Kimodo") {
      const duration = Math.min(Math.max(Number(params.duration) || 4, 2), 10);

      // The nvidia/Kimodo Space exposes its main generation endpoint at index 0.
      // Known inputs: prompt (string) + duration (seconds). Outputs a list containing
      // a preview video/animation and one or more downloadable motion files (BVH/NPZ).
      const predictArgs: Record<string, unknown> = {
        prompt: params.prompt,
        duration,
      };

      let result;
      try {
        result = await client.predict("/predict", predictArgs);
      } catch {
        try {
          result = await client.predict("/generate", predictArgs);
        } catch {
          result = await client.predict(0, predictArgs);
        }
      }

      const rawData = (result?.data ?? []) as unknown[];
      // Log shape on first use to help iterate if the Space changes its signature.
      console.log("Kimodo result shape:", JSON.stringify(rawData).slice(0, 800));

      const flatItems: Array<Record<string, unknown>> = [];
      const collect = (v: unknown) => {
        if (!v) return;
        if (Array.isArray(v)) { v.forEach(collect); return; }
        if (typeof v === "object") flatItems.push(v as Record<string, unknown>);
      };
      rawData.forEach(collect);

      let videoUrl: string | null = null;
      let motionUrl: string | null = null;
      let motionExt = "bvh";

      for (const item of flatItems) {
        const url = (item.url as string | undefined) || ((item.video as { url?: string } | undefined)?.url);
        if (!url || typeof url !== "string") continue;
        const name = ((item.orig_name as string | undefined) || (item.path as string | undefined) || url).toLowerCase();
        if (/\.(mp4|webm|mov|gif)(\?|$)/.test(name)) {
          if (!videoUrl) videoUrl = url;
        } else if (/\.(bvh|npz|fbx|csv)(\?|$)/.test(name)) {
          if (!motionUrl) {
            motionUrl = url;
            const m = name.match(/\.(bvh|npz|fbx|csv)(\?|$)/);
            if (m) motionExt = m[1];
          }
        } else if (!videoUrl) {
          videoUrl = url;
        }
      }

      if (!videoUrl && !motionUrl) {
        return NextResponse.json({ error: "Kimodo did not return a recognizable output. The model may be cold-starting — please try again in a minute." }, { status: 500 });
      }

      const out: { video?: string; motion?: string; motionExt?: string } = { motionExt };

      if (videoUrl) {
        const vRes = await fetch(videoUrl);
        if (vRes.ok) {
          const vBlob = await vRes.blob();
          out.video = await toDataURL(new Blob([await vBlob.arrayBuffer()], { type: vBlob.type || "video/mp4" }));
        }
      }

      if (motionUrl) {
        const mRes = await fetch(motionUrl);
        if (mRes.ok) {
          const mBuf = await mRes.arrayBuffer();
          const base64 = Buffer.from(mBuf).toString("base64");
          out.motion = `data:application/octet-stream;base64,${base64}`;
        }
      }

      return NextResponse.json({ result: out });
    }

    return NextResponse.json({ error: "Space not implemented" }, { status: 400 });
  } catch (e) {
    console.error("HF proxy error:", e);
    const message = e instanceof Error ? e.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
