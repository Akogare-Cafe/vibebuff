"use client";

interface ToolJsonLdProps {
  tool: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    logoUrl?: string;
    pricingModel: string;
    isOpenSource: boolean;
    features: string[];
    pros: string[];
    cons: string[];
    category?: {
      name: string;
      slug: string;
    } | null;
    externalData?: {
      github?: {
        stars: number;
      };
      npm?: {
        downloadsWeekly: number;
      };
    };
  };
  ratingSummary?: {
    averageRating: number;
    totalReviews: number;
  } | null;
}

export function ToolJsonLd({ tool, ratingSummary }: ToolJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `https://vibebuff.dev/tools/${tool.slug}`,
    applicationCategory: tool.category?.name || "DeveloperApplication",
    operatingSystem: "Web, Cross-platform",
    offers: {
      "@type": "Offer",
      price: tool.pricingModel === "free" || tool.pricingModel === "open_source" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(tool.logoUrl && { image: tool.logoUrl }),
    ...(ratingSummary && ratingSummary.totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingSummary.averageRating.toFixed(1),
        ratingCount: ratingSummary.totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    featureList: tool.features.join(", "),
    softwareHelp: {
      "@type": "WebPage",
      url: tool.websiteUrl,
    },
    isAccessibleForFree: tool.pricingModel === "free" || tool.pricingModel === "open_source",
    license: tool.isOpenSource ? "Open Source" : undefined,
  };

  const faqJsonLd = {
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
        name: `Is ${tool.name} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.pricingModel === "free" || tool.pricingModel === "open_source"
            ? `Yes, ${tool.name} is free to use.`
            : tool.pricingModel === "freemium"
            ? `${tool.name} offers a free tier with paid plans for additional features.`
            : `${tool.name} is a paid tool. Check their website for pricing details.`,
        },
      },
      ...(tool.pros.length > 0 ? [{
        "@type": "Question",
        name: `What are the pros of ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.pros.join(". "),
        },
      }] : []),
      ...(tool.cons.length > 0 ? [{
        "@type": "Question",
        name: `What are the cons of ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.cons.join(". "),
        },
      }] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
