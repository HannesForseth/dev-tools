import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, apiResponse } from "@/lib/api/rate-limit";

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === delimiter) { result.push(current); current = ""; }
      else { current += char; }
    }
  }
  result.push(current);
  return result;
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse();

  try {
    const body = await req.json();

    // CSV → JSON
    if (body.csv && typeof body.csv === "string") {
      const delimiter = body.delimiter || ",";
      const lines = body.csv.split(/\r?\n/).filter((l: string) => l.trim());
      if (lines.length < 2) {
        return apiResponse({ error: "CSV needs at least a header row and one data row" }, rl.remaining);
      }
      const headers = parseCsvLine(lines[0], delimiter);
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i], delimiter);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => { obj[h.trim()] = (values[idx] || "").trim(); });
        rows.push(obj);
      }
      return apiResponse({ result: rows, rows: rows.length, fields: headers.length }, rl.remaining);
    }

    // JSON → CSV
    if (body.json) {
      const arr = typeof body.json === "string" ? JSON.parse(body.json) : body.json;
      if (!Array.isArray(arr) || arr.length === 0) {
        return apiResponse({ error: "json must be a non-empty array of objects" }, rl.remaining);
      }
      const delimiter = body.delimiter || ",";
      const headers = Object.keys(arr[0]);
      const escape = (v: unknown) => {
        const s = v === null || v === undefined ? "" : String(v);
        return s.includes(delimiter) || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = [headers.map(escape).join(delimiter)];
      for (const row of arr) {
        lines.push(headers.map((h) => escape(row[h])).join(delimiter));
      }
      return apiResponse({ result: lines.join("\n"), rows: arr.length, fields: headers.length }, rl.remaining);
    }

    return apiResponse({ error: "Provide either 'csv' (string) or 'json' (array) field" }, rl.remaining);
  } catch {
    return apiResponse({ error: "Invalid JSON body" }, rl.remaining);
  }
}
