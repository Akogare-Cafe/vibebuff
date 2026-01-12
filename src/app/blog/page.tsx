import { Metadata } from "next";
import { BlogList } from "@/components/blog-list";
import { getAllBlogPosts } from "@/lib/blog";

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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-primary text-xl mb-4 pixel-glow">
            DEVELOPER BLOG
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Expert guides, tutorials, and insights on choosing the right tech
            stack for your projects. Stay ahead with the latest developer tools
            and best practices.
          </p>
        </div>

        <BlogList posts={posts} />

        <section className="border-4 border-primary bg-card p-8 text-center">
          <h2 className="text-primary text-sm mb-4">
            STAY UPDATED WITH TECH INSIGHTS
          </h2>
          <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
            Get weekly updates on the latest developer tools, framework
            comparisons, and tech stack recommendations delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL..."
              className="flex-1 bg-background border-4 border-border text-primary px-4 py-2 text-sm focus:border-primary outline-none"
            />
            <button className="bg-primary text-background px-6 py-2 text-sm hover:bg-primary transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
