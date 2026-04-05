import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Generate a regular expression based on this description: "${prompt}"

Respond with ONLY a JSON object in this exact format:
{"pattern": "your_regex_here", "flags": "gi", "explanation": "brief explanation"}

Do not include any other text, markdown, or code blocks. Just the raw JSON object.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      pattern: parsed.pattern,
      flags: parsed.flags || "g",
      explanation: parsed.explanation,
    });
  } catch (e) {
    console.error("Regex AI error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate regex: ${message}` }, { status: 500 });
  }
}
