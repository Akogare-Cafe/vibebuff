import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import { BlogPageContent } from "./blog-page-content";

export const metadata: Metadata = {
  title: "Blog - Developer Guides & Tech Stack Insights",
  description:
    "Expert guides on choosing the right tech stack, framework comparisons, and developer tool reviews. Stay updated with the latest in web development.",
  keywords: [
    "developer blog",
    "tech stack guides",
    "framework comparison",
    "web development tutorials",
    "programming guides",
  ],
  openGraph: {
    title: "VIBEBUFF Blog - Developer Guides & Tech Stack Insights",
    description:
      "Expert guides on choosing the right tech stack, framework comparisons, and developer tool reviews.",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return <BlogPageContent posts={posts} />;
}
