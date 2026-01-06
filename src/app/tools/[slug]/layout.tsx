import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let tool = null;
  let ratingSummary = null;
  try {
    tool = await fetchQuery(api.tools.getBySlug, { slug });
    if (tool) {
      ratingSummary = await fetchQuery(api.reviews.getToolRatingSummary, { toolId: tool._id });
    }
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
    `${tool.name} features`,
    `${tool.name} tutorial`,
    `${tool.name} documentation`,
    `best ${tool.category?.name?.toLowerCase() || "developer"} tools`,
    `${tool.category?.name?.toLowerCase() || "developer"} tools comparison`,
    tool.isOpenSource ? `open source ${tool.category?.name?.toLowerCase() || "developer"} tools` : "",
    ...tool.tags,
    ...(tool.features?.slice(0, 5) || []),
    ...(tool.bestFor?.slice(0, 3) || []),
  ].filter(Boolean);

  const hasRatings = ratingSummary && ratingSummary.totalReviews > 0;

  return {
    title,
    description,
    keywords,
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
    openGraph: {
      title: `${tool.name} - Developer Tool Review & Comparison`,
      description: tool.tagline,
      url: `${siteUrl}/tools/${slug}`,
      siteName: "VIBEBUFF",
      type: "article",
      locale: "en_US",
      images: [
        {
          url: tool.logoUrl || `${siteUrl}/og-image.png`,
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
      images: [tool.logoUrl || `${siteUrl}/og-image.png`],
      creator: "@vibebuff",
      site: "@vibebuff",
    },
    alternates: {
      canonical: `${siteUrl}/tools/${slug}`,
    },
    category: tool.category?.name || "Developer Tools",
    other: {
      "article:published_time": new Date().toISOString(),
      "article:modified_time": new Date().toISOString(),
      "article:section": tool.category?.name || "Developer Tools",
      "article:tag": tool.tags.join(", "),
      ...(hasRatings && {
        "rating:value": ratingSummary.averageRating.toFixed(1),
        "rating:count": ratingSummary.totalReviews.toString(),
      }),
    },
  };
}

async function getToolData(slug: string) {
  try {
    const tool = await fetchQuery(api.tools.getBySlug, { slug });
    if (!tool) return null;
    
    const ratingSummary = await fetchQuery(api.reviews.getToolRatingSummary, { toolId: tool._id });
    return { tool, ratingSummary };
  } catch {
    return null;
  }
}

export default async function ToolLayout({
  params,
  children,
}: ToolPageProps) {
  const { slug } = await params;
  const data = await getToolData(slug);

  if (!data) {
    return <>{children}</>;
  }

  const { tool, ratingSummary } = data;
  const hasRatings = ratingSummary && ratingSummary.totalReviews > 0;

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.websiteUrl,
    applicationCategory: tool.category?.name || "DeveloperApplication",
    operatingSystem: "Web, Windows, macOS, Linux",
    offers: {
      "@type": "Offer",
      price: tool.pricingModel === "free" || tool.pricingModel === "open_source" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(hasRatings && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingSummary.averageRating.toFixed(1),
        ratingCount: ratingSummary.totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    featureList: tool.features.join(", "),
    ...(tool.logoUrl && { image: tool.logoUrl }),
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
      ...(tool.category ? [{
        "@type": "ListItem",
        position: 3,
        name: tool.category.name,
        item: `${siteUrl}/tools?category=${tool.category.slug}`,
      }] : []),
      {
        "@type": "ListItem",
        position: tool.category ? 4 : 3,
        name: tool.name,
        item: `${siteUrl}/tools/${slug}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.description,
        },
      },
      {
        "@type": "Question",
        name: `Is ${tool.name} free to use?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.pricingModel === "free" || tool.pricingModel === "open_source"
            ? `Yes, ${tool.name} is completely free to use.`
            : tool.pricingModel === "freemium"
            ? `${tool.name} offers a free tier with optional paid upgrades for additional features.`
            : `${tool.name} is a paid tool. Check their website for current pricing.`,
        },
      },
      {
        "@type": "Question",
        name: `What are the main features of ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Key features include: ${tool.features.slice(0, 5).join(", ")}${tool.features.length > 5 ? ", and more." : "."}`,
        },
      },
      {
        "@type": "Question",
        name: `Who should use ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${tool.name} is best for: ${tool.bestFor.join(", ")}.`,
        },
      },
      {
        "@type": "Question",
        name: `What are the pros and cons of ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Pros: ${tool.pros.slice(0, 3).join(", ")}. Cons: ${tool.cons.slice(0, 3).join(", ")}.`,
        },
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tool.name,
    description: tool.tagline,
    brand: {
      "@type": "Brand",
      name: tool.name,
    },
    ...(tool.logoUrl && { image: tool.logoUrl }),
    ...(hasRatings && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingSummary.averageRating.toFixed(1),
        reviewCount: ratingSummary.totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: tool.pricingModel === "free" || tool.pricingModel === "open_source" ? "0" : undefined,
      priceCurrency: "USD",
      url: tool.websiteUrl,
    },
  };

  return (
    <>
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
