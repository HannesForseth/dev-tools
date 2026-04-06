import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, unauthorizedResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req);
  if (!rl.allowed) return "unauthorized" in rl ? unauthorizedResponse() : rateLimitResponse();

  try {
    const { text, mode } = await req.json();
    if (!text || typeof text !== "string") {
      return apiResponse({ error: "Missing required field: text" }, rl.remaining);
    }

    const m = mode === "decode" ? "decode" : "encode";
    if (m === "encode") {
      const encoded = Buffer.from(text, "utf-8").toString("base64");
      return apiResponse({ mode: "encode", result: encoded }, rl.remaining);
    } else {
      const decoded = Buffer.from(text, "base64").toString("utf-8");
      return apiResponse({ mode: "decode", result: decoded }, rl.remaining);
    }
  } catch {
    return apiResponse({ error: "Invalid JSON body or Base64 string" }, rl.remaining);
  }
}
