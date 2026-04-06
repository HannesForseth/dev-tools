import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const DAILY_LIMIT = 3;

// In-memory store (reset on cold start — good enough for serverless)
const store = new Map<string, { count: number; resetAt: number }>();

// Cache validated API keys for 5 minutes to reduce DB lookups
const apiKeyCache = new Map<string, { valid: boolean; expiresAt: number }>();
const API_KEY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

function cleanApiKeyCache() {
  const now = Date.now();
  for (const [key, val] of apiKeyCache) {
    if (now > val.expiresAt) apiKeyCache.delete(key);
  }
}

/**
 * Validate an API key against Supabase.
 * Returns true if the key belongs to an active Pro user.
 */
async function validateApiKey(apiKey: string): Promise<boolean> {
  // Check cache first
  cleanApiKeyCache();
  const cached = apiKeyCache.get(apiKey);
  if (cached) return cached.valid;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("api_key", apiKey)
      .single();

    if (error || !data) {
      apiKeyCache.set(apiKey, { valid: false, expiresAt: Date.now() + API_KEY_CACHE_TTL });
      return false;
    }

    const isActive = data.subscription_status === "active";
    apiKeyCache.set(apiKey, { valid: isActive, expiresAt: Date.now() + API_KEY_CACHE_TTL });
    return isActive;
  } catch (e) {
    console.error("API key validation error:", e);
    // On error, don't cache — let the next request retry
    return false;
  }
}

export type RateLimitResult =
  | { allowed: true; remaining: number; isPro: boolean }
  | { allowed: false; remaining: 0; isPro: false }
  | { allowed: false; remaining: 0; isPro: false; unauthorized: true };

export async function checkRateLimit(req: NextRequest): Promise<RateLimitResult> {
  // Check for API key in Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!apiKey) {
      return { allowed: false, remaining: 0, isPro: false, unauthorized: true };
    }

    const isValid = await validateApiKey(apiKey);
    if (isValid) {
      return { allowed: true, remaining: 999, isPro: true };
    }

    // Invalid API key — return 401
    return { allowed: false, remaining: 0, isPro: false, unauthorized: true };
  }

  // No API key — use IP-based rate limiting (free tier)
  cleanExpired();
  const ip = getIP(req);
  const now = Date.now();
  const resetAt = new Date().setUTCHours(24, 0, 0, 0); // midnight UTC

  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1, isPro: false };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, isPro: false };
  }

  entry.count++;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count, isPro: false };
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

export function unauthorizedResponse() {
  return NextResponse.json({
    error: "unauthorized",
    message: "Invalid API key. Get your API key at https://allkit.dev/pricing after subscribing to AllKit Pro.",
    upgrade_url: "https://allkit.dev/pricing",
  }, {
    status: 401,
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
