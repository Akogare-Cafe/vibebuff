"use client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

interface SiteJsonLdProps {
  path?: string;
}

export function SiteJsonLd({ path = "/" }: SiteJsonLdProps) {

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VibeBuff",
    alternateName: ["VIBEBUFF", "Vibe Buff"],
    url: siteUrl,
    description:
      "AI-powered tech stack recommendations. Compare 500+ developer tools, get personalized stack recommendations, and discover what top startups use.",
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/tools?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "VibeBuff",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo-icon.svg`,
        width: 512,
        height: 512,
      },
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VibeBuff",
    url: siteUrl,
    logo: `${siteUrl}/logo-icon.svg`,
    description:
      "The gamified tech stack builder for developers. Compare tools, battle frameworks, and get AI-powered recommendations.",
    sameAs: [
      "https://twitter.com/vibebuff",
      "https://github.com/vibebuff",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${siteUrl}/contact`,
    },
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VibeBuff",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "AI-powered tech stack recommendation platform with 500+ developer tools. Compare frameworks, databases, and services to build your perfect stack.",
    featureList: [
      "Compare 500+ developer tools",
      "AI-powered stack recommendations",
      "Visual drag-and-drop stack builder",
      "Side-by-side tool comparisons",
      "Community tier lists and ratings",
      "Company tech stack discovery",
    ],
    screenshot: `${siteUrl}/og-image.png`,
    url: siteUrl,
  };

  const webAPISchema = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: "VibeBuff AI API",
    description:
      "Public API for accessing 500+ developer tools, comparisons, and AI-powered stack recommendations. No authentication required.",
    url: `${siteUrl}/api/ai`,
    documentation: `${siteUrl}/api-docs`,
    provider: {
      "@type": "Organization",
      name: "VibeBuff",
      url: siteUrl,
    },
    termsOfService: `${siteUrl}/terms`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAPISchema) }}
      />
    </>
  );
}
