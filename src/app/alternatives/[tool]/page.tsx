import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import AlternativesPageClient from "./client";

export const dynamic = 'force-static';
export const revalidate = 3600;

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  const tools = await fetchQuery(api.tools.list, { limit: 200 });
  return tools.map((tool) => ({
    tool: tool.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool: toolSlug } = await params;
  const tool = await fetchQuery(api.tools.getBySlug, { slug: toolSlug });
  
  if (!tool) {
    return {
      title: `${formatSlug(toolSlug)} Alternatives | VibeBuff`,
      description: `Discover the best alternatives to ${formatSlug(toolSlug)} for your development needs.`,
    };
  }

  const pageTitle = `Best ${tool.name} Alternatives in 2025`;
  const description = `Looking for alternatives to ${tool.name}? Compare features, pricing, and community feedback for the top ${tool.name} alternatives.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

  return {
    title: `${pageTitle} | VibeBuff`,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      url: `${siteUrl}/alternatives/${toolSlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/alternatives/${toolSlug}`,
    },
  };
}

export default async function AlternativesPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: toolSlug } = await params;
  return <AlternativesPageClient toolSlug={toolSlug} />;
}
