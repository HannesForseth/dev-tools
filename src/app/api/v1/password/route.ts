import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  const params = req.nextUrl.searchParams;
  const length = Math.min(Math.max(parseInt(params.get("length") || "16", 10) || 16, 4), 128);
  const count = Math.min(parseInt(params.get("count") || "1", 10) || 1, 20);
  const noSymbols = params.get("symbols") === "false";

  let charset = CHARSETS.lowercase + CHARSETS.uppercase + CHARSETS.digits;
  if (!noSymbols) charset += CHARSETS.symbols;

  const passwords: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = randomBytes(length);
    let pw = "";
    for (let j = 0; j < length; j++) {
      pw += charset[bytes[j] % charset.length];
    }
    passwords.push(pw);
  }

  const entropy = Math.floor(length * Math.log2(charset.length));

  return apiResponse(
    count === 1
      ? { password: passwords[0], length, entropy_bits: entropy }
      : { passwords, count, length, entropy_bits: entropy },
    rl.remaining
  );
}
