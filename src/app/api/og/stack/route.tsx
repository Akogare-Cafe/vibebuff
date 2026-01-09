import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "saas";
  const framework = searchParams.get("framework") || "";
  const database = searchParams.get("database") || "";
  const auth = searchParams.get("auth") || "";
  const hosting = searchParams.get("hosting") || "";
  const styling = searchParams.get("styling") || "";

  const typeLabels: Record<string, { label: string; color: string }> = {
    saas: { label: "SaaS Stack", color: "#8b5cf6" },
    indie: { label: "Indie Hacker Stack", color: "#22c55e" },
    enterprise: { label: "Enterprise Stack", color: "#3b82f6" },
    api: { label: "API Stack", color: "#f97316" },
    ecommerce: { label: "E-commerce Stack", color: "#ec4899" },
  };

  const { label, color } = typeLabels[type] || typeLabels.saas;

  const stackItems = [
    { layer: "Framework", tool: framework },
    { layer: "Database", tool: database },
    { layer: "Auth", tool: auth },
    { layer: "Hosting", tool: hosting },
    { layer: "Styling", tool: styling },
  ].filter((item) => item.tool);

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
          backgroundColor: "#0f0f23",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a3e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #2d1b4e 0%, transparent 50%)",
          fontFamily: "system-ui",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${color}`,
            borderRadius: "16px",
            padding: "40px 60px",
            backgroundColor: `${color}10`,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: color,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "4px",
            }}
          >
            VibeBuff Recommends
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: 32,
            }}
          >
            {label}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            {stackItems.map(({ layer, tool }, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  {layer}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {tool}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 30,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#6b7280",
            fontSize: 16,
          }}
        >
          <span>Get your personalized stack at vibebuff.dev/quest</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
