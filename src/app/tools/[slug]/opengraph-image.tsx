import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export const runtime = "edge";
export const alt = "Tool on VIBEBUFF";
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

  let tool = null;
  let ratingSummary = null;
  try {
    tool = await fetchQuery(api.tools.getBySlug, { slug });
    if (tool) {
      ratingSummary = await fetchQuery(api.reviews.getToolRatingSummary, {
        toolId: tool._id,
      });
    }
  } catch (error) {
    console.error("Failed to fetch tool for OG image:", error);
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

  const externalData = tool.externalData;
  const githubStars = externalData?.github?.stars || tool.githubStars;
  const npmDownloads = externalData?.npm?.downloadsWeekly || tool.npmDownloadsWeekly;
  const hasRatings = ratingSummary && ratingSummary.totalReviews > 0;

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
              marginBottom: "32px",
            }}
          >
            {tool.logoUrl && (
              <img
                src={tool.logoUrl}
                alt={tool.name}
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
                {tool.name}
              </div>
              {tool.category && (
                <div
                  style={{
                    fontSize: 20,
                    color: "#3b82f6",
                    letterSpacing: "0.1em",
                    marginTop: "8px",
                  }}
                >
                  {tool.category.name.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.4,
              marginBottom: "32px",
            }}
          >
            {tool.tagline}
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {githubStars && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid #3b82f6",
                  borderRadius: "4px",
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>
                  {githubStars >= 1000
                    ? `${(githubStars / 1000).toFixed(1)}K`
                    : githubStars}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.1em" }}>
                  STARS
                </span>
              </div>
            )}
            {npmDownloads && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid #3b82f6",
                  borderRadius: "4px",
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>
                  {npmDownloads >= 1000
                    ? `${(npmDownloads / 1000).toFixed(0)}K`
                    : npmDownloads}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.1em" }}>
                  WEEKLY
                </span>
              </div>
            )}
            {hasRatings && ratingSummary && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid #3b82f6",
                  borderRadius: "4px",
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>
                  {ratingSummary.averageRating.toFixed(1)}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.1em" }}>
                  RATING
                </span>
              </div>
            )}
            {tool.pricingModel && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid #3b82f6",
                  borderRadius: "4px",
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>
                  {tool.pricingModel === "free" || tool.pricingModel === "open_source"
                    ? "FREE"
                    : tool.pricingModel === "freemium"
                    ? "FREEMIUM"
                    : "PAID"}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.1em" }}>
                  PRICING
                </span>
              </div>
            )}
          </div>
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
