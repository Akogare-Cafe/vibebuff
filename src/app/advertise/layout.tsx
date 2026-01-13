import { Metadata } from "next";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

export const metadata: Metadata = {
  title: "Advertise on VIBEBUFF - Reach 50K+ Developers Monthly",
  description:
    "Promote your developer tool to 50,000+ monthly visitors. Premium ad placements on tool pages, comparisons, and search results. Transparent CPC, CPM, and flat-rate pricing.",
  keywords: [
    "advertise to developers",
    "developer tool advertising",
    "tech advertising",
    "developer marketing",
    "SaaS advertising",
    "developer audience",
    "tech tool promotion",
    "B2D marketing",
    "developer tool sponsorship",
    "programming tool ads",
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
    canonical: `${siteUrl}/advertise`,
  },
  openGraph: {
    title: "Advertise on VIBEBUFF - Reach Developers Where They Discover Tools",
    description:
      "Connect with thousands of developers actively searching for the best development tools. Premium ad placements with transparent pricing.",
    url: `${siteUrl}/advertise`,
    siteName: "VIBEBUFF",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Advertise on VIBEBUFF - Developer Tool Advertising",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertise on VIBEBUFF - Reach 50K+ Developers",
    description:
      "Premium ad placements for developer tools. Reach developers actively searching for tools.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@vibebuff",
    site: "@vibebuff",
  },
};

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "VIBEBUFF Advertising",
    description:
      "Premium advertising placements for developer tools on VIBEBUFF, reaching 50,000+ monthly developers.",
    provider: {
      "@type": "Organization",
      name: "VIBEBUFF",
      url: siteUrl,
    },
    serviceType: "Digital Advertising",
    areaServed: "Worldwide",
    audience: {
      "@type": "Audience",
      audienceType: "Software Developers",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Header Ad Placement",
        description: "Premium header banner placement across all pages",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Offer",
        name: "Sidebar Ad Placement",
        description: "Sidebar placement on tool and comparison pages",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Offer",
        name: "In-Feed Ad Placement",
        description: "Native ad placement within tool listings",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
        },
      },
    ],
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
        name: "Advertise",
        item: `${siteUrl}/advertise`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does it cost to advertise on VIBEBUFF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VIBEBUFF offers flexible pricing including daily, weekly, and monthly rates, as well as CPC (cost per click) and CPM (cost per thousand impressions) options. Contact us for current pricing.",
        },
      },
      {
        "@type": "Question",
        name: "What kind of audience does VIBEBUFF reach?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VIBEBUFF reaches 50,000+ monthly visitors, with 95% being software developers actively researching and comparing developer tools for their projects.",
        },
      },
      {
        "@type": "Question",
        name: "What ad placements are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer header banners, sidebar placements, in-feed native ads, and sponsored tool listings. Each placement is designed to reach developers at different stages of their tool discovery journey.",
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="advertise-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="advertise-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="advertise-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
