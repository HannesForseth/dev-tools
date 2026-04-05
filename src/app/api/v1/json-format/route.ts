import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { json, indent, minify } = await req.json();
    if (json === undefined) {
      return apiResponse({ error: "Missing required field: json (string or object)" }, rl.remaining);
    }

    const input = typeof json === "string" ? json : JSON.stringify(json);
    const parsed = JSON.parse(input);

    if (minify) {
      return apiResponse({ result: JSON.stringify(parsed), valid: true }, rl.remaining);
    }

    const spaces = typeof indent === "number" ? indent : 2;
    return apiResponse({ result: JSON.stringify(parsed, null, spaces), valid: true }, rl.remaining);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return apiResponse({ valid: false, error: message }, rl.remaining);
  }
}
