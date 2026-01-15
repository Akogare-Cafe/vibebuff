import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export const runtime = "edge";
export const alt = "Company Tech Stack on VIBEBUFF";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let company: {
    name: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    toolIds?: string[];
  } | null = null;
  let tools: Array<{ name: string; logoUrl?: string }> = [];
  try {
    company = await fetchQuery(api.companies.getBySlug, { slug });
    if (company && company.toolIds && company.toolIds.length > 0) {
      const allTools = await fetchQuery(api.tools.list, { limit: 100 });
      tools = allTools
        .filter((t) => company?.toolIds?.includes(t._id))
        .slice(0, 6);
    }
  } catch (error) {
    console.error("Failed to fetch company for OG image:", error);
  }

  if (!company) {
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
          <div style={{ fontSize: 48, color: "#f8fafc" }}>Company Not Found</div>
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
              alignItems: "center",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.name}
                width="80"
                height="80"
                style={{
                  borderRadius: "12px",
                  border: "2px solid #3b82f6",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#f8fafc",
                  lineHeight: 1.1,
                }}
              >
                {company.name}
              </div>
              {company.industry && (
                <div
                  style={{
                    fontSize: 18,
                    color: "#3b82f6",
                    letterSpacing: "0.1em",
                    marginTop: "8px",
                  }}
                >
                  {company.industry.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#3b82f6",
              letterSpacing: "0.2em",
              marginBottom: "24px",
            }}
          >
            TECH STACK
          </div>

          {tools.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: "800px",
              }}
            >
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid #3b82f6",
                    borderRadius: "6px",
                  }}
                >
                  {tool.logoUrl && (
                    <img
                      src={tool.logoUrl}
                      alt={tool.name}
                      width="24"
                      height="24"
                      style={{
                        borderRadius: "4px",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 16,
                      color: "#f8fafc",
                      fontWeight: 600,
                    }}
                  >
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              Discover what tools {company.name} uses
            </div>
          )}

          {company.location && (
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: "#64748b",
                marginTop: "32px",
                letterSpacing: "0.1em",
              }}
            >
              {company.location.toUpperCase()}
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
