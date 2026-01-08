import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "VIBEBUFF - Find Your Perfect Tech Stack in Seconds";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1e3a5f 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1e3a5f 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #3b82f6",
            borderRadius: "8px",
            padding: "60px 80px",
            backgroundColor: "rgba(3, 7, 18, 0.9)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "#3b82f6",
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            VIBEBUFF
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#94a3b8",
              marginBottom: 40,
              letterSpacing: "0.2em",
            }}
          >
            TECH STACK COMPENDIUM
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#f8fafc",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.3,
            }}
          >
            Find Your Perfect Tech Stack in Seconds
          </div>
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700, color: "#3b82f6" }}>
                500+
              </span>
              <span style={{ fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em" }}>
                TOOLS
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700, color: "#3b82f6" }}>
                AI
              </span>
              <span style={{ fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em" }}>
                POWERED
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700, color: "#3b82f6" }}>
                FREE
              </span>
              <span style={{ fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em" }}>
                FOREVER
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            fontSize: 20,
            color: "#64748b",
          }}
        >
          vibebuff.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
