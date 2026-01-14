import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export const runtime = "edge";
export const alt = "Tool Alternatives on VIBEBUFF";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ tool: string }>;
}

export default async function Image({ params }: Props) {
  const { tool: toolSlug } = await params;

  let tool = null;
  let alternatives: Array<{ name: string; logoUrl?: string }> = [];
  try {
    tool = await fetchQuery(api.tools.getBySlug, { slug: toolSlug });
    if (tool) {
      const allTools = await fetchQuery(api.tools.list, { limit: 100 });
      alternatives = allTools
        .filter((t) => t.slug !== toolSlug && t.categoryId === tool?.categoryId)
        .slice(0, 4);
    }
  } catch (error) {
    console.error("Failed to fetch tool for alternatives OG image:", error);
  }

  if (!tool) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#030712",
          }}
        >
          <div style={{ fontSize: 48, color: "#f8fafc" }}>Tool Not Found</div>
        </div>
      ),
      { ...size }
    );
  }

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
          padding: "60px",
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
            padding: "50px 60px",
            backgroundColor: "rgba(3, 7, 18, 0.95)",
            width: "100%",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#3b82f6",
              letterSpacing: "0.2em",
              marginBottom: "16px",
            }}
          >
            ALTERNATIVES TO
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {tool.logoUrl && (
              <img
                src={tool.logoUrl}
                alt={tool.name}
                width="60"
                height="60"
                style={{
                  borderRadius: "8px",
                  border: "2px solid #3b82f6",
                }}
              />
            )}
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#f8fafc",
              }}
            >
              {tool.name}
            </div>
          </div>

          {alternatives.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  color: "#94a3b8",
                  marginBottom: "24px",
                }}
              >
                Top {alternatives.length} Alternatives
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {alternatives.map((alt) => (
                  <div
                    key={alt.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "16px 20px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid #3b82f6",
                      borderRadius: "6px",
                      minWidth: "140px",
                    }}
                  >
                    {alt.logoUrl && (
                      <img
                        src={alt.logoUrl}
                        alt={alt.name}
                        width="40"
                        height="40"
                        style={{
                          borderRadius: "6px",
                          marginBottom: "8px",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 16,
                        color: "#f8fafc",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {alt.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tool.category && (
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#64748b",
                marginTop: "32px",
                letterSpacing: "0.1em",
              }}
            >
              {tool.category.name.toUpperCase()} CATEGORY
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            fontSize: 18,
            color: "#64748b",
            letterSpacing: "0.1em",
          }}
        >
          VIBEBUFF.DEV
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
