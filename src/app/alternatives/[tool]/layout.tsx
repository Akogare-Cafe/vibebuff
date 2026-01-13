import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

interface Props {
  params: Promise<{ tool: string }>;
  children: React.ReactNode;
}

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool: toolSlug } = await params;

  let tool: Awaited<ReturnType<typeof fetchQuery<typeof api.tools.getBySlug>>> | null = null;
  let alternatives: Array<{ name: string; slug: string }> = [];
  try {
    tool = await fetchQuery(api.tools.getBySlug, { slug: toolSlug });
    if (tool) {
      const allTools = await fetchQuery(api.tools.list, { limit: 100 });
      alternatives = allTools
        .filter((t) => t.slug !== toolSlug && t.categoryId === tool?.categoryId)
        .slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to fetch tool for alternatives metadata:", error);
  }

  const toolName = tool?.name || formatSlug(toolSlug);
  const categoryName = tool?.category?.name || "developer tool";
  const alternativeNames = alternatives.map((a) => a.name).join(", ");

  const title = `Best ${toolName} Alternatives 2026 - Compare Top ${categoryName} Options`;
  const description = `Looking for ${toolName} alternatives? Compare the best ${categoryName.toLowerCase()} options including ${alternativeNames || "top competitors"}. Find features, pricing, pros/cons to choose the perfect replacement.`;

  return {
    title,
    description,
    keywords: [
      `${toolName} alternatives`,
      `${toolName} competitors`,
      `tools like ${toolName}`,
      `${toolName} replacement`,
      `best ${toolName} alternatives 2026`,
      `${toolName} vs`,
      `${categoryName} alternatives`,
      `${categoryName} comparison`,
      ...alternatives.map((a) => `${toolName} vs ${a.name}`),
      ...alternatives.map((a) => a.name),
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
      canonical: `${siteUrl}/alternatives/${toolSlug}`,
    },
    openGraph: {
      title: `Best ${toolName} Alternatives - Compare Top Options`,
      description: `Compare the best alternatives to ${toolName} for your next project. Side-by-side feature comparison, pricing, and community reviews.`,
      url: `${siteUrl}/alternatives/${toolSlug}`,
      siteName: "VIBEBUFF",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: tool?.logoUrl || `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${toolName} Alternatives Comparison`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Best ${toolName} Alternatives 2026`,
      description: `Compare top alternatives to ${toolName}. Find the perfect ${categoryName.toLowerCase()} for your project.`,
      images: [tool?.logoUrl || `${siteUrl}/og-image.png`],
      creator: "@vibebuff",
      site: "@vibebuff",
    },
  };
}

async function getToolData(toolSlug: string) {
  try {
    const tool = await fetchQuery(api.tools.getBySlug, { slug: toolSlug });
    if (!tool) return null;

    const allTools = await fetchQuery(api.tools.list, { limit: 100 });
    const alternatives = allTools
      .filter((t) => t.slug !== toolSlug && t.categoryId === tool.categoryId)
      .slice(0, 10);

    return { tool, alternatives };
  } catch {
    return null;
  }
}

export default async function AlternativesLayout({ params, children }: Props) {
  const { tool: toolSlug } = await params;
  const data = await getToolData(toolSlug);

  if (!data) {
    return <>{children}</>;
  }

  const { tool, alternatives } = data;
  const toolName = tool.name;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${toolName} Alternatives`,
    description: `Top alternatives to ${toolName} for developers`,
    url: `${siteUrl}/alternatives/${toolSlug}`,
    numberOfItems: alternatives.length,
    itemListElement: alternatives.map((alt, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: alt.name,
      url: `${siteUrl}/tools/${alt.slug}`,
      item: {
        "@type": "SoftwareApplication",
        name: alt.name,
        applicationCategory: tool.category?.name || "DeveloperApplication",
        url: `${siteUrl}/tools/${alt.slug}`,
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
        name: "Tools",
        item: `${siteUrl}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: toolName,
        item: `${siteUrl}/tools/${toolSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Alternatives",
        item: `${siteUrl}/alternatives/${toolSlug}`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Best ${toolName} Alternatives 2026`,
    description: `Compare the best alternatives to ${toolName}. Find features, pricing, and reviews.`,
    url: `${siteUrl}/alternatives/${toolSlug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "VIBEBUFF",
      url: siteUrl,
    },
    about: {
      "@type": "SoftwareApplication",
      name: toolName,
      applicationCategory: tool.category?.name || "DeveloperApplication",
    },
    mainEntity: itemListSchema,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the best alternatives to ${toolName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The top alternatives to ${toolName} include ${alternatives
            .slice(0, 5)
            .map((a) => a.name)
            .join(", ")}. Each offers different features and pricing to suit various project needs.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${toolName} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            tool.pricingModel === "free" || tool.pricingModel === "open_source"
              ? `Yes, ${toolName} is free to use.`
              : tool.pricingModel === "freemium"
                ? `${toolName} offers a free tier with paid upgrades available.`
                : `${toolName} is a paid tool. Check their website for current pricing.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I choose between ${toolName} and its alternatives?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Consider your project requirements, budget, team size, and technical expertise. Compare features like ${tool.features?.slice(0, 3).join(", ") || "core functionality"}, pricing models, and community support.`,
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="alternatives-item-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="alternatives-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="alternatives-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Script
        id="alternatives-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
