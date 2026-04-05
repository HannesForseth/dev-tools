import { NextRequest, NextResponse } from "next/server";

const DAILY_LIMIT = 3;

// In-memory store (reset on cold start — good enough for serverless)
const store = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

function cleanExpired() {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}

export function checkRateLimit(req: NextRequest): { allowed: boolean; remaining: number } {
  // TODO: Check for API key in Authorization header for Pro users
  const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
  if (apiKey) {
    // TODO: Validate API key against Supabase
    // For now, any Bearer token bypasses rate limit
    return { allowed: true, remaining: 999 };
  }

  cleanExpired();
  const ip = getIP(req);
  const now = Date.now();
  const resetAt = new Date().setUTCHours(24, 0, 0, 0); // midnight UTC

  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

export function rateLimitResponse() {
  return NextResponse.json({
    error: "rate_limit_exceeded",
    message: `Free API limit reached (${DAILY_LIMIT} requests/day). Upgrade to AllKit Pro for unlimited API access.`,
    upgrade_url: "https://allkit.dev/pricing",
    docs_url: "https://allkit.dev/api",
  }, {
    status: 429,
    headers: {
      "Retry-After": "86400",
      "X-RateLimit-Limit": DAILY_LIMIT.toString(),
      "X-RateLimit-Remaining": "0",
    },
  });
}

export function apiResponse(data: unknown, remaining: number) {
  return NextResponse.json(data, {
    headers: {
      "X-RateLimit-Limit": DAILY_LIMIT.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
