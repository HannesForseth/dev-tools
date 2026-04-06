import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { checkRateLimit, rateLimitResponse, unauthorizedResponse, apiResponse } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest) {
  const rl = await checkRateLimit(req);
  if (!rl.allowed) return "unauthorized" in rl ? unauthorizedResponse() : rateLimitResponse();

  const count = Math.min(
    parseInt(req.nextUrl.searchParams.get("count") || "1", 10) || 1,
    100
  );

  const uuids = Array.from({ length: count }, () => randomUUID());
  return apiResponse(count === 1 ? { uuid: uuids[0] } : { uuids, count }, rl.remaining);
}
