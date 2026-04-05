import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { text, mode, type } = await req.json();
    if (!text || typeof text !== "string") {
      return apiResponse({ error: "Missing required field: text" }, rl.remaining);
    }

    const m = mode === "decode" ? "decode" : "encode";
    const t = type === "full" ? "full" : "component";

    if (m === "encode") {
      const result = t === "component" ? encodeURIComponent(text) : encodeURI(text);
      return apiResponse({ mode: "encode", type: t, result }, rl.remaining);
    } else {
      const result = t === "component" ? decodeURIComponent(text) : decodeURI(text);
      return apiResponse({ mode: "decode", type: t, result }, rl.remaining);
    }
  } catch {
    return apiResponse({ error: "Invalid JSON body or encoded string" }, rl.remaining);
  }
}
