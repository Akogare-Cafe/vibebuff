import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

type Props = {
  params: Promise<{ categorySlug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  
  try {
    const category = await fetchQuery(api.forum.getCategoryBySlug, { slug: categorySlug });
    
    if (!category) {
      return {
        title: "Category Not Found - Forum",
        description: "This forum category does not exist.",
      };
    }

    return {
      title: `${category.name} - Community Forum`,
      description: category.description,
      keywords: [
        category.name.toLowerCase(),
        "developer forum",
        "tech discussion",
        "developer community",
        category.slug,
      ],
      openGraph: {
        title: `${category.name} - VibeBuff Forum`,
        description: category.description,
        type: "website",
      },
    };
  } catch {
    return {
      title: "Forum Category",
      description: "Browse discussions in this forum category.",
    };
  }
}

export default function CategoryLayout({ children }: Props) {
  return children;
}
