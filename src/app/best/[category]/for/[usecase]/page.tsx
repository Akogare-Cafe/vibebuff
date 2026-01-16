import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import BestForPageClient from "./client";

export const dynamic = 'force-static';
export const revalidate = 3600;

const useCaseDescriptions: Record<string, { title: string; description: string; keywords: string[] }> = {
  "startups": {
    title: "Startups",
    description: "Fast-moving teams that need to ship quickly with limited resources",
    keywords: ["startup", "mvp", "lean", "agile"]
  },
  "enterprise": {
    title: "Enterprise",
    description: "Large organizations requiring scalability, security, and compliance",
    keywords: ["enterprise", "corporate", "large-scale", "compliance"]
  },
  "side-projects": {
    title: "Side Projects",
    description: "Personal projects and hobby development with minimal overhead",
    keywords: ["hobby", "personal", "learning", "side-project"]
  },
  "beginners": {
    title: "Beginners",
    description: "Developers just starting their journey who need gentle learning curves",
    keywords: ["beginner", "learning", "tutorial", "easy"]
  },
  "production": {
    title: "Production",
    description: "Battle-tested solutions for mission-critical applications",
    keywords: ["production", "reliable", "stable", "proven"]
  },
  "nextjs": {
    title: "Next.js",
    description: "Tools that integrate seamlessly with the Next.js ecosystem",
    keywords: ["nextjs", "react", "vercel", "ssr"]
  },
  "typescript": {
    title: "TypeScript",
    description: "First-class TypeScript support with excellent type definitions",
    keywords: ["typescript", "types", "type-safe", "intellisense"]
  },
  "serverless": {
    title: "Serverless",
    description: "Cloud-native solutions optimized for serverless architectures",
    keywords: ["serverless", "lambda", "edge", "cloud"]
  },
  "realtime": {
    title: "Realtime Apps",
    description: "Tools optimized for live updates and real-time collaboration",
    keywords: ["realtime", "websocket", "live", "sync"]
  },
  "mobile": {
    title: "Mobile Apps",
    description: "Cross-platform or native mobile development solutions",
    keywords: ["mobile", "ios", "android", "react-native"]
  }
};

const categoryMappings: Record<string, string> = {
  "database": "database",
  "databases": "database",
  "db": "database",
  "auth": "authentication",
  "authentication": "authentication",
  "hosting": "hosting",
  "deploy": "hosting",
  "deployment": "hosting",
  "frontend": "frontend",
  "ui": "frontend",
  "backend": "backend",
  "api": "backend",
  "orm": "database",
  "css": "frontend",
  "styling": "frontend",
  "testing": "testing",
  "analytics": "analytics",
  "payments": "payments",
  "cms": "cms",
  "devops": "devops",
  "monitoring": "monitoring",
  "ai": "ai-ml",
  "ml": "ai-ml",
  "security": "security"
};

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  const categories = [
    "database",
    "frontend", 
    "backend",
    "authentication",
    "hosting",
    "devops",
    "ai-ml",
    "testing",
    "analytics",
    "payments",
    "cms",
    "monitoring",
  ];

  const useCases = [
    "startups",
    "enterprise",
    "side-projects",
    "beginners",
    "production",
    "nextjs",
    "typescript",
    "serverless",
    "realtime",
    "mobile",
  ];

  const params = [];
  for (const category of categories) {
    for (const usecase of useCases) {
      params.push({ category, usecase });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; usecase: string }> }): Promise<Metadata> {
  const { category: categorySlug, usecase: useCaseSlug } = await params;
  
  const mappedCategory = categoryMappings[categorySlug.toLowerCase()] || categorySlug;
  const category = await fetchQuery(api.categories.getBySlug, { slug: mappedCategory });
  
  const useCaseInfo = useCaseDescriptions[useCaseSlug.toLowerCase()] || {
    title: formatSlug(useCaseSlug),
    description: `Tools optimized for ${formatSlug(useCaseSlug).toLowerCase()} use cases`,
    keywords: [useCaseSlug]
  };

  const categoryTitle = category?.name || formatSlug(categorySlug);
  const pageTitle = `Best ${categoryTitle} for ${useCaseInfo.title}`;
  const description = `${useCaseInfo.description}. Discover the top ${categoryTitle.toLowerCase()} tools for ${useCaseInfo.title.toLowerCase()}.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

  return {
    title: `${pageTitle} | VibeBuff`,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      url: `${siteUrl}/best/${categorySlug}/for/${useCaseSlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/best/${categorySlug}/for/${useCaseSlug}`,
    },
  };
}

export default async function BestForPage({ params }: { params: Promise<{ category: string; usecase: string }> }) {
  const { category: categorySlug, usecase: useCaseSlug } = await params;
  return <BestForPageClient categorySlug={categorySlug} useCaseSlug={useCaseSlug} />;
}
