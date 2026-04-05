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
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Convert this schedule description to a standard 5-field cron expression (minute hour day-of-month month day-of-week): "${prompt}"

Respond with ONLY a JSON object in this exact format:
{"expression": "0 9 * * 1-5", "explanation": "brief explanation"}

Do not include any other text, markdown, or code blocks. Just the raw JSON object.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      expression: parsed.expression,
      explanation: parsed.explanation,
    });
  } catch (e) {
    console.error("Cron AI error:", e);
    return NextResponse.json({ error: "Failed to generate cron expression" }, { status: 500 });
  }
}
