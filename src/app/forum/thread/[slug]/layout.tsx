import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const thread = await fetchQuery(api.forum.getThreadBySlug, { slug });
    
    if (!thread) {
      return {
        title: "Thread Not Found - Forum",
        description: "This forum thread does not exist.",
      };
    }

    const description = thread.content.slice(0, 160) + (thread.content.length > 160 ? "..." : "");

    return {
      title: `${thread.title} - Community Forum`,
      description,
      keywords: [
        "forum discussion",
        "developer community",
        thread.category?.name?.toLowerCase() || "general",
        "tech discussion",
      ],
      openGraph: {
        title: thread.title,
        description,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Forum Thread",
      description: "View this discussion in the VibeBuff community forum.",
    };
  }
}

export default function ThreadLayout({ children }: Props) {
  return children;
}
