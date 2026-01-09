import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "My Tier List";
  const author = searchParams.get("author") || "Anonymous";
  const sCount = parseInt(searchParams.get("s") || "0");
  const aCount = parseInt(searchParams.get("a") || "0");
  const bCount = parseInt(searchParams.get("b") || "0");
  const cCount = parseInt(searchParams.get("c") || "0");
  const dCount = parseInt(searchParams.get("d") || "0");

  const totalTools = sCount + aCount + bCount + cCount + dCount;

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
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#a78bfa",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "4px",
            }}
          >
            VibeBuff Tier List
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: 24,
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: 32,
            }}
          >
            {[
              { tier: "S", count: sCount, color: "#ef4444" },
              { tier: "A", count: aCount, color: "#f97316" },
              { tier: "B", count: bCount, color: "#eab308" },
              { tier: "C", count: cCount, color: "#22c55e" },
              { tier: "D", count: dCount, color: "#6b7280" },
            ].map(({ tier, count, color }) => (
              <div
                key={tier}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px 20px",
                  backgroundColor: color,
                  borderRadius: "8px",
                  minWidth: "60px",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#ffffff",
                  }}
                >
                  {tier}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              color: "#9ca3af",
              fontSize: 18,
            }}
          >
            <span>By {author}</span>
            <span>{totalTools} tools ranked</span>
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
