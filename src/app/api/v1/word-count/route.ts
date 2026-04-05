import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return apiResponse({ error: "Missing required field: text" }, rl.remaining);
    }

    const words = text.trim().split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);

    return apiResponse({
      characters: text.length,
      characters_no_spaces: text.replace(/\s/g, "").length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      reading_time_minutes: Math.ceil(words.length / 225),
      speaking_time_minutes: Math.ceil(words.length / 140),
    }, rl.remaining);
  } catch {
    return apiResponse({ error: "Invalid JSON body" }, rl.remaining);
  }
}
