import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "My Stack";
  const author = searchParams.get("author") || "Anonymous";
  const tools = searchParams.get("tools")?.split(",").slice(0, 6) || [];
  const score = parseInt(searchParams.get("score") || "0");
  const type = searchParams.get("type") || "custom";

  const typeLabels: Record<string, string> = {
    saas: "SaaS Stack",
    indie: "Indie Hacker Stack",
    enterprise: "Enterprise Stack",
    api: "API Stack",
    custom: "Custom Stack",
  };

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
            border: "4px solid #8b5cf6",
            borderRadius: "16px",
            padding: "40px 60px",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            width: "90%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: "#a78bfa",
                textTransform: "uppercase",
                letterSpacing: "3px",
                padding: "6px 16px",
                backgroundColor: "rgba(139, 92, 246, 0.2)",
                borderRadius: "4px",
              }}
            >
              {typeLabels[type] || "Stack"}
            </div>
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            {name}
          </div>

          {tools.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
                marginBottom: 32,
                maxWidth: "800px",
              }}
            >
              {tools.map((tool, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 20px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    border: "2px solid rgba(139, 92, 246, 0.5)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      color: "#ffffff",
                      fontWeight: 500,
                    }}
                  >
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "center",
            }}
          >
            {score > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: "bold",
                    color: "#22c55e",
                  }}
                >
                  {score}%
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                  }}
                >
                  Synergy Score
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#8b5cf6",
                }}
              >
                {tools.length}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Tools
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              color: "#9ca3af",
              fontSize: 18,
            }}
          >
            Built by {author}
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
          <span>vibebuff.dev</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
