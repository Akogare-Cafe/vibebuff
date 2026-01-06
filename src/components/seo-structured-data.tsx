"use client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

interface FAQItem {
  question: string;
  answer: string;
}

interface ToolSchemaProps {
  name: string;
  description: string;
  url: string;
  category: string;
  pricing: string;
  rating?: number;
  reviewCount?: number;
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: string;
  image?: string;
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VIBEBUFF",
    alternateName: ["VibeBuff", "Vibe Buff", "Tech Stack Builder"],
    description: "AI-powered tech stack builder and developer tool recommendations platform",
    url: siteUrl,
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
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VIBEBUFF",
    url: siteUrl,
    logo: `${siteUrl}/og-image.png`,
    description: "AI-powered tech stack recommendations for developers. Compare 500+ developer tools and build the perfect stack.",
    foundingDate: "2024",
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VIBEBUFF Tech Stack Builder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
    description: "Build the perfect tech stack with AI-powered recommendations. Compare 500+ developer tools.",
    url: siteUrl,
    screenshot: `${siteUrl}/og-image.png`,
    featureList: [
      "AI-powered tech stack recommendations",
      "Compare 500+ developer tools",
      "Visual stack builder",
      "Tool synergy analysis",
      "Cost estimation",
      "Community reviews",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ToolSchema({ tool }: { tool: ToolSchemaProps }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: tool.category,
    offers: {
      "@type": "Offer",
      price: tool.pricing === "free" || tool.pricing === "open_source" ? "0" : "varies",
      priceCurrency: "USD",
    },
    ...(tool.rating && tool.reviewCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tool.rating.toString(),
        ratingCount: tool.reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({ article }: { article: ArticleSchemaProps }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      "@type": "Organization",
      name: article.author,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "VIBEBUFF",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og-image.png`,
      },
    },
    image: article.image || `${siteUrl}/og-image.png`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HowToSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Build the Perfect Tech Stack with VIBEBUFF",
    description: "Learn how to use VIBEBUFF to build the perfect tech stack for your project using AI-powered recommendations.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Describe Your Project",
        text: "Enter a description of your project in plain English. Include details about features, scale, and budget.",
        url: siteUrl,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Get AI Recommendations",
        text: "Our AI analyzes your requirements and suggests the optimal tech stack based on your needs.",
        url: siteUrl,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Compare and Customize",
        text: "Compare recommended tools, view synergies, and customize your stack using the visual builder.",
        url: `${siteUrl}/stack-builder`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Save and Share",
        text: "Save your tech stack, share it with your team, and export it for documentation.",
        url: `${siteUrl}/deck`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CompanySchemaProps {
  name: string;
  description?: string;
  url: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  location?: string;
  memberCount: number;
  aiTools?: Array<{
    name: string;
    category: string;
  }>;
}

export function CompanySchema({ company }: { company: CompanySchemaProps }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description || `${company.name}'s technology stack and AI tools`,
    url: company.url,
    ...(company.logoUrl && { logo: company.logoUrl }),
    ...(company.websiteUrl && { sameAs: [company.websiteUrl] }),
    ...(company.industry && { industry: company.industry }),
    ...(company.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: company.location,
      },
    }),
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: company.memberCount,
    },
    ...(company.aiTools && company.aiTools.length > 0 && {
      knowsAbout: company.aiTools.map((tool) => ({
        "@type": "Thing",
        name: tool.name,
        description: `${tool.category} tool used by ${company.name}`,
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CompanyListSchema({ companies }: { companies: Array<{ name: string; url: string; description?: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Company Tech Stacks",
    description: "Discover what AI tools and technology stacks companies are using",
    numberOfItems: companies.length,
    itemListElement: companies.map((company, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Organization",
        name: company.name,
        url: company.url,
        description: company.description,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HomePageSchemas() {
  const homeFaqs: FAQItem[] = [
    {
      question: "What is VIBEBUFF?",
      answer: "VIBEBUFF is an AI-powered tech stack builder that helps developers discover, compare, and choose the best tools for their projects. We analyze 500+ developer tools and provide personalized recommendations based on your project requirements.",
    },
    {
      question: "How does the AI tech stack recommendation work?",
      answer: "Simply describe your project in plain English - including features you need, your budget, and scale. Our AI analyzes your requirements and suggests the optimal combination of frameworks, databases, hosting, and other tools based on compatibility, cost, and community support.",
    },
    {
      question: "Is VIBEBUFF free to use?",
      answer: "Yes! VIBEBUFF is completely free to use. You can browse all 500+ tools, get AI recommendations, compare tools, and build your tech stack without any cost.",
    },
    {
      question: "What types of tools does VIBEBUFF cover?",
      answer: "VIBEBUFF covers the full spectrum of developer tools including frontend frameworks (React, Vue, Angular), backend frameworks (Node.js, Django, Rails), databases (PostgreSQL, MongoDB, Redis), hosting platforms (Vercel, AWS, Netlify), authentication services, payment processors, and more.",
    },
    {
      question: "How do I compare different tools?",
      answer: "Use our comparison tool to view side-by-side comparisons of any tools. We show pricing, features, pros/cons, community size, and compatibility scores to help you make informed decisions.",
    },
    {
      question: "Can I save and share my tech stack?",
      answer: "Yes! Create an account to save your tech stacks, share them with your team, and access them from anywhere. You can also export your stack for documentation purposes.",
    },
  ];

  return (
    <>
      <WebsiteSchema />
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <HowToSchema />
      <FAQSchema faqs={homeFaqs} />
    </>
  );
}
