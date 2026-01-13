import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

interface Props {
  params: Promise<{ category: string; usecase: string }>;
  children: React.ReactNode;
}

const categoryDisplayNames: Record<string, string> = {
  database: "Database",
  databases: "Database",
  frontend: "Frontend Framework",
  backend: "Backend Framework",
  authentication: "Authentication",
  auth: "Authentication",
  hosting: "Hosting Platform",
  devops: "DevOps Tool",
  "ai-ml": "AI/ML Tool",
  testing: "Testing Framework",
  analytics: "Analytics Platform",
  payments: "Payment Provider",
  cms: "CMS",
  monitoring: "Monitoring Tool",
  api: "API Tool",
  security: "Security Tool",
};

const useCaseDisplayNames: Record<string, { title: string; description: string }> = {
  startups: {
    title: "Startups",
    description: "fast-moving teams that need to ship quickly with limited resources",
  },
  enterprise: {
    title: "Enterprise",
    description: "large organizations requiring scalability, security, and compliance",
  },
  "side-projects": {
    title: "Side Projects",
    description: "personal projects and hobby development with minimal overhead",
  },
  beginners: {
    title: "Beginners",
    description: "developers just starting their journey who need gentle learning curves",
  },
  production: {
    title: "Production",
    description: "battle-tested solutions for mission-critical applications",
  },
  nextjs: {
    title: "Next.js Projects",
    description: "tools that integrate seamlessly with the Next.js ecosystem",
  },
  typescript: {
    title: "TypeScript Projects",
    description: "first-class TypeScript support with excellent type definitions",
  },
  serverless: {
    title: "Serverless",
    description: "cloud-native solutions optimized for serverless architectures",
  },
  realtime: {
    title: "Realtime Apps",
    description: "tools optimized for live updates and real-time collaboration",
  },
  mobile: {
    title: "Mobile Apps",
    description: "cross-platform or native mobile development solutions",
  },
};

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, usecase } = await params;

  const categoryName = categoryDisplayNames[category] || formatSlug(category);
  const useCaseInfo = useCaseDisplayNames[usecase] || {
    title: formatSlug(usecase),
    description: formatSlug(usecase).toLowerCase(),
  };

  let tools: Array<{ name: string; slug: string }> = [];
  try {
    const categories = await fetchQuery(api.categories.list, {});
    const matchingCategory = categories.find(
      (c) => c.slug === category || c.name.toLowerCase() === category.toLowerCase()
    );
    if (matchingCategory) {
      const allTools = await fetchQuery(api.tools.list, { limit: 50 });
      tools = allTools
        .filter((t) => t.categoryId === matchingCategory._id)
        .slice(0, 5)
        .map((t) => ({ name: t.name, slug: t.slug }));
    }
  } catch (error) {
    console.error("Failed to fetch tools for best-for metadata:", error);
  }

  const toolNames = tools.map((t) => t.name).join(", ");
  const title = `Best ${categoryName} for ${useCaseInfo.title} 2026 - Top Picks & Comparison`;
  const description = `Discover the best ${categoryName.toLowerCase()} tools for ${useCaseInfo.description}. Compare ${toolNames || "top options"} with features, pricing, and expert recommendations.`;

  return {
    title,
    description,
    keywords: [
      `best ${categoryName.toLowerCase()} for ${useCaseInfo.title.toLowerCase()}`,
      `${categoryName.toLowerCase()} for ${usecase}`,
      `top ${categoryName.toLowerCase()} 2026`,
      `${categoryName.toLowerCase()} comparison`,
      `${categoryName.toLowerCase()} recommendations`,
      `${useCaseInfo.title.toLowerCase()} ${categoryName.toLowerCase()}`,
      ...tools.map((t) => t.name),
      ...tools.map((t) => `${t.name} for ${useCaseInfo.title.toLowerCase()}`),
    ],
    authors: [{ name: "VIBEBUFF", url: siteUrl }],
    creator: "VIBEBUFF",
    publisher: "VIBEBUFF",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${siteUrl}/best/${category}/for/${usecase}`,
    },
    openGraph: {
      title: `Best ${categoryName} for ${useCaseInfo.title} - Expert Recommendations`,
      description: `Find the perfect ${categoryName.toLowerCase()} for ${useCaseInfo.description}. Curated recommendations with detailed comparisons.`,
      url: `${siteUrl}/best/${category}/for/${usecase}`,
      siteName: "VIBEBUFF",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Best ${categoryName} for ${useCaseInfo.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Best ${categoryName} for ${useCaseInfo.title} 2026`,
      description: `Top ${categoryName.toLowerCase()} picks for ${useCaseInfo.description}.`,
      images: [`${siteUrl}/og-image.png`],
      creator: "@vibebuff",
      site: "@vibebuff",
    },
  };
}

async function getToolsData(category: string) {
  try {
    const categories = await fetchQuery(api.categories.list, {});
    const matchingCategory = categories.find(
      (c) => c.slug === category || c.name.toLowerCase() === category.toLowerCase()
    );
    if (!matchingCategory) return [];
    
    const allTools = await fetchQuery(api.tools.list, { limit: 50 });
    return allTools
      .filter((t) => t.categoryId === matchingCategory._id)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export default async function BestForLayout({ params, children }: Props) {
  const { category, usecase } = await params;
  const tools = await getToolsData(category);

  const categoryName = categoryDisplayNames[category] || formatSlug(category);
  const useCaseInfo = useCaseDisplayNames[usecase] || {
    title: formatSlug(usecase),
    description: formatSlug(usecase).toLowerCase(),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${categoryName} for ${useCaseInfo.title}`,
    description: `Top ${categoryName.toLowerCase()} tools recommended for ${useCaseInfo.description}`,
    url: `${siteUrl}/best/${category}/for/${usecase}`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${siteUrl}/tools/${tool.slug}`,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: categoryName,
        url: `${siteUrl}/tools/${tool.slug}`,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Best Tools",
        item: `${siteUrl}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${siteUrl}/tools?category=${category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `For ${useCaseInfo.title}`,
        item: `${siteUrl}/best/${category}/for/${usecase}`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Best ${categoryName} for ${useCaseInfo.title} 2026`,
    description: `Curated list of the best ${categoryName.toLowerCase()} tools for ${useCaseInfo.description}.`,
    url: `${siteUrl}/best/${category}/for/${usecase}`,
    isPartOf: {
      "@type": "WebSite",
      name: "VIBEBUFF",
      url: siteUrl,
    },
    mainEntity: itemListSchema,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the best ${categoryName.toLowerCase()} for ${useCaseInfo.title.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tools.length > 0
            ? `The top ${categoryName.toLowerCase()} options for ${useCaseInfo.title.toLowerCase()} include ${tools.slice(0, 3).map((t) => t.name).join(", ")}. The best choice depends on your specific requirements, budget, and team expertise.`
            : `There are several excellent ${categoryName.toLowerCase()} options for ${useCaseInfo.title.toLowerCase()}. Consider factors like ease of use, pricing, and community support when making your decision.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I choose a ${categoryName.toLowerCase()} for ${useCaseInfo.title.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `When choosing a ${categoryName.toLowerCase()} for ${useCaseInfo.description}, consider: 1) Your team's technical expertise, 2) Budget constraints, 3) Scalability requirements, 4) Integration with your existing stack, and 5) Community support and documentation quality.`,
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="best-for-item-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="best-for-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="best-for-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Script
        id="best-for-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
