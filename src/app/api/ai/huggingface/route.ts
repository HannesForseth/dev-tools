import { NextRequest, NextResponse } from "next/server";

// HF Spaces proxy — centralizes rate limiting and hides endpoints from client
// TODO: Add rate limiting, caching, and usage tracking via Supabase

const ALLOWED_SPACES = [
  "not-lain/background-removal",
  "mcp-tools/DeepSeek-OCR-experimental",
  "evalstate/flux1_schnell",
  "ResembleAI/Chatterbox",
  "prithivMLmods/Photo-Mate-i2i",
  "fffiloni/InstantIR",
  "mcp-tools/FLUX.1-Kontext-Dev",
];

export async function POST(req: NextRequest) {
  try {
    const { space, params } = await req.json();

    if (!space || !ALLOWED_SPACES.includes(space)) {
      return NextResponse.json({ error: "Invalid space" }, { status: 400 });
    }

    // For now, return a placeholder — HF Spaces integration requires
    // either Gradio client or direct API calls which we'll implement
    // once we verify the server-side HF integration approach
    return NextResponse.json({
      error: "HF Spaces integration coming soon. The tool UI is ready — backend proxy is being configured.",
      space,
      status: "pending",
    });
  } catch (e) {
    console.error("HF proxy error:", e);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
