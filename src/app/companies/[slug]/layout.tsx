import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let company = null;
  try {
    company = await fetchQuery(api.companies.getBySlug, { slug });
  } catch (error) {
    console.error("Failed to fetch company for metadata:", error);
  }

  if (!company) {
    return {
      title: "Company Not Found",
      description: "The requested company profile could not be found.",
    };
  }

  const title = `${company.name} Tech Stack & AI Tools | VIBEBUFF`;
  const description = company.description 
    ? `Discover ${company.name}'s tech stack and AI tools. ${company.description.slice(0, 120)}...`
    : `Explore ${company.name}'s technology stack, AI tools, and development infrastructure. See what tools ${company.name} uses to build their products.`;
  
  const keywords = [
    company.name,
    `${company.name} tech stack`,
    `${company.name} AI tools`,
    `${company.name} technology`,
    `${company.name} engineering`,
    company.industry || "technology",
    "company tech stack",
    "AI tech stack",
    "enterprise AI tools",
    "company technology stack",
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${company.name} - Tech Stack & AI Tools`,
      description: company.description || `Discover what technology ${company.name} uses`,
      url: `${siteUrl}/companies/${slug}`,
      siteName: "VIBEBUFF",
      type: "profile",
      images: [
        {
          url: company.logoUrl || "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${company.name} Tech Stack on VIBEBUFF`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${company.name} Tech Stack | VIBEBUFF`,
      description: company.description || `Discover ${company.name}'s technology stack`,
      images: [company.logoUrl || "/og-image.png"],
    },
    alternates: {
      canonical: `${siteUrl}/companies/${slug}`,
    },
    other: {
      "profile:username": company.name,
      "business:contact_data:locality": company.location || "",
      "business:contact_data:website": company.websiteUrl || "",
    },
  };
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
