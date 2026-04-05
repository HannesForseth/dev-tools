import { ImageResponse } from "next/og";

export const alt = "AllKit — Free Developer & AI Tools Online";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 800,
              color: "white",
            }}
          >
            A
          </div>
          <span style={{ fontSize: 56, fontWeight: 700, color: "white" }}>
            AllKit
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Free Developer & AI Tools Online
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["JSON", "Regex", "UUID", "OCR", "QR Code", "JWT", "Password"].map(
            (tool) => (
              <div
                key={tool}
                style={{
                  padding: "8px 20px",
                  borderRadius: 9999,
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "#a5b4fc",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {tool}
              </div>
            )
          )}
        </div>
        <p
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#52525b",
          }}
        >
          allkit.dev — 19 free tools, no signup required
        </p>
      </div>
    ),
    { ...size }
  );
}
