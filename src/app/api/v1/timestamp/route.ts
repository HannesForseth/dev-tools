import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const body = await req.json();

    // Timestamp to date
    if (body.timestamp !== undefined) {
      const ts = Number(body.timestamp);
      if (isNaN(ts)) return apiResponse({ error: "Invalid timestamp" }, rl.remaining);
      const ms = ts > 1e12 ? ts : ts * 1000;
      const date = new Date(ms);
      return apiResponse({
        timestamp_seconds: Math.floor(ms / 1000),
        timestamp_ms: ms,
        iso8601: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toString(),
      }, rl.remaining);
    }

    // Date to timestamp
    if (body.date) {
      const date = new Date(body.date);
      if (isNaN(date.getTime())) return apiResponse({ error: "Invalid date string" }, rl.remaining);
      return apiResponse({
        timestamp_seconds: Math.floor(date.getTime() / 1000),
        timestamp_ms: date.getTime(),
        iso8601: date.toISOString(),
        utc: date.toUTCString(),
      }, rl.remaining);
    }

    // Current time
    const now = new Date();
    return apiResponse({
      timestamp_seconds: Math.floor(now.getTime() / 1000),
      timestamp_ms: now.getTime(),
      iso8601: now.toISOString(),
      utc: now.toUTCString(),
    }, rl.remaining);
  } catch {
    return apiResponse({ error: "Invalid JSON body" }, rl.remaining);
  }
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  const now = new Date();
  return apiResponse({
    timestamp_seconds: Math.floor(now.getTime() / 1000),
    timestamp_ms: now.getTime(),
    iso8601: now.toISOString(),
    utc: now.toUTCString(),
  }, rl.remaining);
}
