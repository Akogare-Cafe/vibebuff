import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let comparisons: Array<{ slug: string; lastUpdated: number }> = [];
  let tools: Array<{ slug: string }> = [];

  try {
    comparisons = await fetchQuery(api.seo.listComparisons, { limit: 100 });
    tools = await fetchQuery(api.tools.list, { limit: 200 });
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap data:", error);
  }
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/stack-builder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/leaderboards`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/stack-marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/get-started`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogPosts: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/blog/best-react-frameworks-2026`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/nextjs-vs-remix-comparison`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/choosing-database-for-startup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/ai-tools-for-developers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/tech-stack-for-saas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/best-frontend-frameworks-2026`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/postgresql-vs-mongodb-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/best-authentication-services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/vercel-vs-netlify-vs-aws`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/best-orm-nodejs-2026`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/tailwind-vs-bootstrap-vs-css`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/supabase-vs-firebase-comparison`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = [
    "frontend",
    "backend",
    "database",
    "devops",
    "ai-ml",
    "mobile",
    "testing",
    "security",
    "authentication",
    "payments",
    "analytics",
    "cms",
    "hosting",
    "monitoring",
    "api",
  ].map((category) => ({
    url: `${siteUrl}/tools?category=${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const popularComparisons: MetadataRoute.Sitemap = [
    "nextjs-vs-remix",
    "react-vs-vue",
    "postgresql-vs-mongodb",
    "tailwind-vs-bootstrap",
    "prisma-vs-drizzle",
    "vercel-vs-netlify",
    "supabase-vs-firebase",
    "typescript-vs-javascript",
    "clerk-vs-auth0",
    "stripe-vs-paddle",
    "convex-vs-supabase",
    "astro-vs-nextjs",
    "bun-vs-node",
    "vite-vs-webpack",
    "pnpm-vs-npm",
  ].map((comparison) => ({
    url: `${siteUrl}/compare/${comparison}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const comparisonPages: MetadataRoute.Sitemap = comparisons.map((comparison) => ({
    url: `${siteUrl}/compare/${comparison.slug}`,
    lastModified: new Date(comparison.lastUpdated),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPosts, ...categoryPages, ...popularComparisons, ...comparisonPages, ...toolPages];
}
