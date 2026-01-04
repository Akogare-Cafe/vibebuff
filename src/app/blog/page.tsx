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
    slug: "vue-vs-react-2025",
    title: "Vue vs React in 2025: Which Frontend Framework Should You Choose?",
    description:
      "A detailed comparison of Vue.js and React covering performance, ecosystem, learning curve, and job market to help you pick the right framework.",
    date: "2025-01-20",
    readTime: "11 min read",
    tags: ["Vue", "React", "Frontend", "Frameworks"],
    featured: true,
  },
  {
    slug: "best-orms-nodejs-2025",
    title: "Best ORMs for Node.js in 2025: Prisma vs Drizzle vs TypeORM",
    description:
      "Compare the top Node.js ORMs including Prisma, Drizzle, and TypeORM. Learn which ORM fits your project based on performance and type safety.",
    date: "2025-01-18",
    readTime: "10 min read",
    tags: ["ORM", "Prisma", "Drizzle", "Node.js"],
    featured: true,
  },
  {
    slug: "serverless-database-guide",
    title: "Serverless Databases in 2025: PlanetScale vs Neon vs Turso",
    description:
      "A comprehensive guide to serverless databases. Compare PlanetScale, Neon, Turso, and other options for your next serverless application.",
    date: "2025-01-16",
    readTime: "9 min read",
    tags: ["Serverless", "Database", "PlanetScale", "Neon"],
    featured: true,
  },
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
    slug: "authentication-solutions-2025",
    title: "Best Authentication Solutions in 2025: Clerk vs Auth0 vs NextAuth",
    description:
      "Compare top authentication providers including Clerk, Auth0, and NextAuth. Find the best auth solution for your web application.",
    date: "2025-01-14",
    readTime: "10 min read",
    tags: ["Authentication", "Clerk", "Auth0", "Security"],
    featured: true,
  },
  {
    slug: "tailwind-vs-bootstrap-2025",
    title: "Tailwind CSS vs Bootstrap in 2025: Which CSS Framework Wins?",
    description:
      "A comprehensive comparison of Tailwind CSS and Bootstrap. Learn which CSS framework is better for your project.",
    date: "2025-01-12",
    readTime: "8 min read",
    tags: ["Tailwind CSS", "Bootstrap", "CSS", "Styling"],
    featured: false,
  },
  {
    slug: "nextjs-vs-remix-comparison",
    title: "Next.js vs Remix: Which Should You Choose in 2025?",
    description:
      "An in-depth comparison of Next.js and Remix covering routing, data fetching, performance, and use cases to help you make the right choice.",
    date: "2025-01-10",
    readTime: "12 min read",
    tags: ["Next.js", "Remix", "Comparison"],
    featured: false,
  },
  {
    slug: "supabase-vs-firebase-2025",
    title: "Supabase vs Firebase in 2025: The Complete Comparison",
    description:
      "Compare Supabase and Firebase for your next project. Detailed analysis of features, pricing, performance, and use cases.",
    date: "2025-01-08",
    readTime: "12 min read",
    tags: ["Supabase", "Firebase", "BaaS", "Backend"],
    featured: false,
  },
  {
    slug: "frontend-framework-beginners-2025",
    title: "Best Frontend Framework for Beginners in 2025",
    description:
      "New to web development? Learn which frontend framework is easiest to learn in 2025. Compare React, Vue, Svelte, and more.",
    date: "2025-01-06",
    readTime: "9 min read",
    tags: ["Beginners", "Frontend", "React", "Vue"],
    featured: false,
  },
  {
    slug: "choosing-database-for-startup",
    title: "How to Choose the Right Database for Your Startup",
    description:
      "PostgreSQL, MongoDB, or something else? Learn how to evaluate databases based on your startup's specific needs and growth plans.",
    date: "2025-01-05",
    readTime: "10 min read",
    tags: ["Database", "PostgreSQL", "MongoDB", "Startup"],
    featured: false,
  },
  {
    slug: "typescript-vs-javascript-2025",
    title: "TypeScript vs JavaScript in 2025: Should You Make the Switch?",
    description:
      "Is TypeScript worth learning? Compare TypeScript and JavaScript to understand the benefits, trade-offs, and when to use each.",
    date: "2025-01-04",
    readTime: "8 min read",
    tags: ["TypeScript", "JavaScript", "Programming"],
    featured: false,
  },
  {
    slug: "monorepo-tools-2025",
    title: "Best Monorepo Tools in 2025: Turborepo vs Nx vs pnpm Workspaces",
    description:
      "Compare the top monorepo tools for JavaScript and TypeScript projects. Learn about Turborepo, Nx, pnpm workspaces, and when to use each.",
    date: "2025-01-02",
    readTime: "10 min read",
    tags: ["Monorepo", "Turborepo", "Nx", "pnpm"],
    featured: false,
  },
  {
    slug: "api-design-rest-vs-graphql",
    title: "REST vs GraphQL in 2025: Which API Design Should You Choose?",
    description:
      "Compare REST and GraphQL API architectures. Learn the pros, cons, and best use cases for each approach to build better APIs.",
    date: "2024-12-30",
    readTime: "11 min read",
    tags: ["API", "REST", "GraphQL", "Backend"],
    featured: false,
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
    featured: false,
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const recentPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
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

        {/* Featured Posts */}
        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> FEATURED ARTICLES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="border-4 border-border bg-card p-6 h-full hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
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
                  <h3 className="text-primary text-sm mb-3 leading-relaxed">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[6px] px-2 py-1 border border-primary text-muted-foreground"
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
            <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> MORE ARTICLES
            </h2>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <article className="border-4 border-border bg-card p-6 hover:border-primary transition-colors cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-primary text-sm mb-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {post.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
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
