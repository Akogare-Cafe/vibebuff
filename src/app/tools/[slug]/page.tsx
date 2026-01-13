import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import ToolDetailPageClient from "./client";

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  const tools = await fetchQuery(api.tools.list, { limit: 300 });
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  let tool;
  try {
    tool = await fetchQuery(api.tools.getBySlug, { slug });
  } catch (error) {
    console.error("Failed to fetch tool for metadata:", error);
  }
  
  if (!tool) {
    return {
      title: `Tool Not Found | VibeBuff`,
      description: "The requested tool could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  const pageTitle = `${tool.name} - ${tool.tagline}`;
  const description = tool.description.slice(0, 160);

  return {
    title: `${tool.name} | VibeBuff`,
    description,
    keywords: [
      tool.name,
      ...tool.tags.slice(0, 5),
      tool.category?.name || "",
      "developer tools",
      "vibe coding",
    ].filter(Boolean),
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      url: `${siteUrl}/tools/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/tools/${slug}`,
    },
  };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ToolDetailPageClient slug={slug} />;
}
