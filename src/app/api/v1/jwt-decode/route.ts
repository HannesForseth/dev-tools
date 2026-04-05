import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return apiResponse({ error: "Missing required field: token" }, rl.remaining);
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return apiResponse({ error: "Invalid JWT format (expected 3 dot-separated parts)" }, rl.remaining);
    }

    const decode = (s: string) => JSON.parse(Buffer.from(s, "base64url").toString("utf-8"));

    const header = decode(parts[0]);
    const payload = decode(parts[1]);

    const result: Record<string, unknown> = { header, payload };

    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      result.expired = expDate < new Date();
      result.expires_at = expDate.toISOString();
    }
    if (payload.iat) {
      result.issued_at = new Date(payload.iat * 1000).toISOString();
    }

    return apiResponse(result, rl.remaining);
  } catch {
    return apiResponse({ error: "Failed to decode JWT. Ensure it's a valid token." }, rl.remaining);
  }
}
