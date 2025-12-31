import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Calendar, Clock, Tag } from "lucide-react";

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

const blogPosts = [
  {
    slug: "best-react-frameworks-2025",
    title: "Best React Frameworks in 2025: Next.js vs Remix vs Gatsby",
    description:
      "A comprehensive comparison of the top React frameworks. Learn which one is best for your project based on performance, SEO, and developer experience.",
    date: "2025-01-15",
    readTime: "8 min read",
    tags: ["React", "Next.js", "Remix", "Frameworks"],
    featured: true,
  },
  {
    slug: "nextjs-vs-remix-comparison",
    title: "Next.js vs Remix: Which Should You Choose in 2025?",
    description:
      "An in-depth comparison of Next.js and Remix covering routing, data fetching, performance, and use cases to help you make the right choice.",
    date: "2025-01-10",
    readTime: "12 min read",
    tags: ["Next.js", "Remix", "Comparison"],
    featured: true,
  },
  {
    slug: "choosing-database-for-startup",
    title: "How to Choose the Right Database for Your Startup",
    description:
      "PostgreSQL, MongoDB, or something else? Learn how to evaluate databases based on your startup's specific needs and growth plans.",
    date: "2025-01-05",
    readTime: "10 min read",
    tags: ["Database", "PostgreSQL", "MongoDB", "Startup"],
    featured: true,
  },
  {
    slug: "ai-tools-for-developers",
    title: "Top 10 AI Tools Every Developer Should Know in 2025",
    description:
      "From GitHub Copilot to Claude, discover the AI tools that are revolutionizing how developers write code and build applications.",
    date: "2024-12-28",
    readTime: "7 min read",
    tags: ["AI", "Developer Tools", "Productivity"],
    featured: false,
  },
  {
    slug: "tech-stack-for-saas",
    title: "The Ultimate Tech Stack for Building a SaaS in 2025",
    description:
      "A complete guide to choosing the right technologies for your SaaS product, from frontend to backend, database to deployment.",
    date: "2024-12-20",
    readTime: "15 min read",
    tags: ["SaaS", "Tech Stack", "Full Stack"],
    featured: true,
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const recentPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[#60a5fa] text-xl mb-4 pixel-glow">
            DEVELOPER BLOG
          </h1>
          <p className="text-[#3b82f6] text-[10px] max-w-2xl mx-auto">
            Expert guides, tutorials, and insights on choosing the right tech
            stack for your projects. Stay ahead with the latest developer tools
            and best practices.
          </p>
        </div>

        {/* Featured Posts */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> FEATURED ARTICLES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6 h-full hover:border-[#3b82f6] transition-colors cursor-pointer">
                  <div className="flex items-center gap-4 text-[8px] text-[#3b82f6] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-[#60a5fa] text-[10px] mb-3 leading-relaxed">
                    {post.title}
                  </h3>
                  <p className="text-[#3b82f6] text-[8px] mb-4 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[6px] px-2 py-1 border border-[#3b82f6] text-[#3b82f6]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* All Posts */}
        {recentPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> MORE ARTICLES
            </h2>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <article className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6 hover:border-[#3b82f6] transition-colors cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-[#60a5fa] text-[10px] mb-2">
                          {post.title}
                        </h3>
                        <p className="text-[#3b82f6] text-[8px]">
                          {post.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[8px] text-[#3b82f6] shrink-0">
                        <span>{post.readTime}</span>
                        <span>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="border-4 border-[#3b82f6] bg-[#0a1628] p-8 text-center">
          <h2 className="text-[#60a5fa] text-sm mb-4">
            STAY UPDATED WITH TECH INSIGHTS
          </h2>
          <p className="text-[#3b82f6] text-[8px] mb-6 max-w-xl mx-auto">
            Get weekly updates on the latest developer tools, framework
            comparisons, and tech stack recommendations delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL..."
              className="flex-1 bg-[#000000] border-4 border-[#1e3a5f] text-[#60a5fa] px-4 py-2 text-[10px] focus:border-[#3b82f6] outline-none"
            />
            <button className="bg-[#3b82f6] text-[#000000] px-6 py-2 text-[10px] hover:bg-[#60a5fa] transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
