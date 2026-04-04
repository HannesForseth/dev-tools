import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { appName, appUrl, appType, dataCollected } = await req.json();
    if (!appName) {
      return NextResponse.json({ error: "Missing app name" }, { status: 400 });
    }

    const dataList = dataCollected?.length
      ? `Data collected: ${dataCollected.join(", ")}`
      : "General data collection practices";

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Generate a comprehensive privacy policy for:
- App/Website name: ${appName}
- URL: ${appUrl || "Not specified"}
- Type: ${appType}
- ${dataList}

The policy should:
1. Be professional and legally-informed (but include a disclaimer that this is not legal advice)
2. Cover GDPR and CCPA basics
3. Cover data collection, usage, sharing, cookies, security, user rights
4. Include contact information placeholders where needed
5. Use today's date as the effective date
6. Be formatted as clean text with headers

Generate the complete privacy policy text.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ policy: text });
  } catch (e) {
    console.error("Privacy policy error:", e);
    return NextResponse.json({ error: "Failed to generate privacy policy" }, { status: 500 });
  }
}
