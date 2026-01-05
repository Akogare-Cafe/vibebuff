import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let tool = null;
  try {
    tool = await fetchQuery(api.tools.getBySlug, { slug });
  } catch (error) {
    console.error("Failed to fetch tool for metadata:", error);
  }

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested developer tool could not be found.",
    };
  }

  const title = `${tool.name} - Features, Pricing & Alternatives | VIBEBUFF`;
  const description = `${tool.tagline}. Compare ${tool.name} with alternatives, see pricing, pros/cons, and find if it's right for your tech stack. ${tool.description?.slice(0, 100)}...`;
  
  const keywords = [
    tool.name,
    `${tool.name} review`,
    `${tool.name} pricing`,
    `${tool.name} alternatives`,
    `${tool.name} vs`,
    `best ${tool.category?.name?.toLowerCase() || "developer"} tools`,
    ...tool.tags,
    ...(tool.features?.slice(0, 5) || []),
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${tool.name} - Developer Tool Review & Comparison`,
      description: tool.tagline,
      url: `${siteUrl}/tools/${slug}`,
      siteName: "VIBEBUFF",
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${tool.name} - Developer Tool on VIBEBUFF`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | VIBEBUFF`,
      description: tool.tagline,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `${siteUrl}/tools/${slug}`,
    },
    other: {
      "article:published_time": new Date().toISOString(),
      "article:section": tool.category?.name || "Developer Tools",
      "article:tag": tool.tags.join(", "),
    },
  };
}

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
