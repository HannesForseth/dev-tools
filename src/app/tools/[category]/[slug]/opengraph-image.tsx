import { ImageResponse } from "next/og";
import { getToolBySlug, categoryLabels, type ToolCategory } from "@/lib/tools/registry";

export const alt = "AllKit Tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  const name = tool?.name ?? "Tool";
  const description = tool?.description ?? "";
  const category = tool
    ? categoryLabels[tool.category as ToolCategory]
    : "Tools";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
              }}
            >
              A
            </div>
            <span style={{ fontSize: 28, fontWeight: 600, color: "#a1a1aa" }}>
              AllKit
            </span>
            <span style={{ fontSize: 20, color: "#52525b", marginLeft: 8 }}>
              / {category}
            </span>
          </div>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            Free {name} Online
          </h1>
          <p
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              marginTop: 20,
              maxWidth: 800,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span style={{ fontSize: 20, color: "#52525b" }}>
            allkit.dev — Free, no signup required
          </span>
          <div
            style={{
              padding: "10px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Try it free →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
