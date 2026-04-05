import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { text, algorithm } = await req.json();
    if (!text || typeof text !== "string") {
      return apiResponse({ error: "Missing required field: text" }, rl.remaining);
    }

    const algos = ["md5", "sha1", "sha256", "sha384", "sha512"];
    if (algorithm && !algos.includes(algorithm)) {
      return apiResponse({ error: `Invalid algorithm. Use: ${algos.join(", ")}` }, rl.remaining);
    }

    if (algorithm) {
      const hash = createHash(algorithm).update(text).digest("hex");
      return apiResponse({ algorithm, hash }, rl.remaining);
    }

    // Return all algorithms
    const hashes: Record<string, string> = {};
    for (const algo of algos) {
      hashes[algo] = createHash(algo).update(text).digest("hex");
    }
    return apiResponse({ text, hashes }, rl.remaining);
  } catch {
    return apiResponse({ error: "Invalid JSON body" }, rl.remaining);
  }
}
