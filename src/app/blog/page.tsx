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
    slug: "state-management-react-2025",
    title: "React State Management in 2025: Zustand vs Redux vs Jotai vs Context",
    description:
      "A comprehensive guide to choosing the right state management solution for your React app. Compare Zustand, Redux Toolkit, Jotai, and Context API with real benchmarks.",
    date: "2025-01-25",
    readTime: "14 min read",
    tags: ["React", "State Management", "Zustand", "Redux"],
    featured: true,
  },
  {
    slug: "edge-functions-vs-serverless-2025",
    title: "Edge Functions vs Serverless in 2025: The Performance Battle",
    description:
      "Edge functions are 9x faster during cold starts. Compare Cloudflare Workers, Vercel Edge, and AWS Lambda with real benchmarks and cost analysis.",
    date: "2025-01-24",
    readTime: "12 min read",
    tags: ["Edge Computing", "Serverless", "Cloudflare", "Vercel"],
    featured: true,
  },
  {
    slug: "ai-coding-assistants-2025",
    title: "Best AI Coding Assistants in 2025: Complete Comparison Guide",
    description:
      "From GitHub Copilot to Cursor to Claude - compare 15+ AI coding tools with features, pricing, and real-world performance benchmarks.",
    date: "2025-01-23",
    readTime: "15 min read",
    tags: ["AI", "Coding Assistants", "GitHub Copilot", "Cursor"],
    featured: true,
  },
  {
    slug: "convex-vs-supabase-vs-firebase",
    title: "Convex vs Supabase vs Firebase: Real-Time Backend Showdown 2025",
    description:
      "Compare the top real-time backend platforms. Detailed analysis of Convex, Supabase, and Firebase for modern web applications.",
    date: "2025-01-22",
    readTime: "13 min read",
    tags: ["Backend", "Convex", "Supabase", "Firebase"],
    featured: true,
  },
  {
    slug: "deployment-platforms-2025",
    title: "Best Deployment Platforms in 2025: Vercel vs Netlify vs Railway vs Render",
    description:
      "Compare modern deployment platforms for your web apps. From Vercel's edge network to Railway's simplicity - find the right platform for your project.",
    date: "2025-01-21",
    readTime: "11 min read",
    tags: ["Deployment", "Vercel", "Netlify", "Railway"],
    featured: true,
  },
  {
    slug: "vue-vs-react-2025",
    title: "Vue vs React in 2025: Which Frontend Framework Should You Choose?",
    description:
      "A detailed comparison of Vue.js and React covering performance, ecosystem, learning curve, and job market to help you pick the right framework.",
    date: "2025-01-20",
    readTime: "11 min read",
    tags: ["Vue", "React", "Frontend", "Frameworks"],
    featured: false,
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
  {
    slug: "docker-vs-kubernetes-2025",
    title: "Docker vs Kubernetes in 2025: When to Use Each",
    description:
      "Understand the differences between Docker and Kubernetes. Learn when to use containers alone vs orchestration for your deployment strategy.",
    date: "2024-12-18",
    readTime: "12 min read",
    tags: ["Docker", "Kubernetes", "DevOps", "Containers"],
    featured: false,
  },
  {
    slug: "testing-frameworks-javascript-2025",
    title: "Best JavaScript Testing Frameworks in 2025: Jest vs Vitest vs Playwright",
    description:
      "Compare modern testing frameworks for JavaScript. From unit tests with Vitest to E2E with Playwright - choose the right testing stack.",
    date: "2024-12-15",
    readTime: "10 min read",
    tags: ["Testing", "Jest", "Vitest", "Playwright"],
    featured: false,
  },
  {
    slug: "css-in-js-vs-utility-first-2025",
    title: "CSS-in-JS vs Utility-First CSS in 2025: The Great Debate",
    description:
      "Styled Components vs Tailwind CSS - compare styling approaches for React apps. Performance, DX, and maintainability analyzed.",
    date: "2024-12-12",
    readTime: "9 min read",
    tags: ["CSS", "Tailwind", "Styled Components", "Styling"],
    featured: false,
  },
  {
    slug: "web3-development-stack-2025",
    title: "Complete Web3 Development Stack Guide for 2025",
    description:
      "Build decentralized applications with the right tools. Compare Ethereum, Solana, and Polygon development stacks with frameworks and libraries.",
    date: "2024-12-10",
    readTime: "14 min read",
    tags: ["Web3", "Blockchain", "Ethereum", "Solana"],
    featured: false,
  },
  {
    slug: "mobile-app-frameworks-2025",
    title: "Best Mobile App Frameworks in 2025: React Native vs Flutter vs Native",
    description:
      "Choose the right mobile development framework. Compare React Native, Flutter, and native development for iOS and Android apps.",
    date: "2024-12-08",
    readTime: "13 min read",
    tags: ["Mobile", "React Native", "Flutter", "iOS"],
    featured: false,
  },
  {
    slug: "graphql-vs-rest-vs-trpc-2025",
    title: "GraphQL vs REST vs tRPC in 2025: API Architecture Comparison",
    description:
      "Modern API design patterns compared. Learn when to use GraphQL, REST, or tRPC for type-safe, efficient backend communication.",
    date: "2024-12-05",
    readTime: "11 min read",
    tags: ["API", "GraphQL", "tRPC", "REST"],
    featured: false,
  },
  {
    slug: "micro-frontends-architecture-2025",
    title: "Micro-Frontends Architecture Guide for 2025",
    description:
      "Build scalable frontend applications with micro-frontends. Compare Module Federation, Single-SPA, and modern implementation patterns.",
    date: "2024-12-03",
    readTime: "12 min read",
    tags: ["Architecture", "Micro-Frontends", "Webpack", "Module Federation"],
    featured: false,
  },
  {
    slug: "cms-comparison-2025",
    title: "Best Headless CMS in 2025: Contentful vs Sanity vs Strapi",
    description:
      "Compare top headless CMS platforms for modern web apps. Features, pricing, and developer experience of Contentful, Sanity, and Strapi.",
    date: "2024-12-01",
    readTime: "10 min read",
    tags: ["CMS", "Contentful", "Sanity", "Strapi"],
    featured: false,
  },
  {
    slug: "performance-monitoring-tools-2025",
    title: "Best Performance Monitoring Tools in 2025: Sentry vs Datadog vs New Relic",
    description:
      "Monitor your application performance with the right tools. Compare APM solutions, error tracking, and observability platforms.",
    date: "2024-11-28",
    readTime: "11 min read",
    tags: ["Monitoring", "Sentry", "Datadog", "Performance"],
    featured: false,
  },
  {
    slug: "svelte-vs-react-vs-vue-2025",
    title: "Svelte vs React vs Vue in 2025: The Ultimate Framework Battle",
    description:
      "Three-way comparison of top frontend frameworks. Performance benchmarks, ecosystem, and real-world use cases for Svelte, React, and Vue.",
    date: "2024-11-25",
    readTime: "13 min read",
    tags: ["Svelte", "React", "Vue", "Frontend"],
    featured: false,
  },
  {
    slug: "ci-cd-pipelines-2025",
    title: "Best CI/CD Tools in 2025: GitHub Actions vs GitLab CI vs CircleCI",
    description:
      "Automate your deployment pipeline with the right CI/CD tool. Compare features, pricing, and performance of top platforms.",
    date: "2024-11-22",
    readTime: "10 min read",
    tags: ["CI/CD", "GitHub Actions", "GitLab", "DevOps"],
    featured: false,
  },
  {
    slug: "websocket-alternatives-2025",
    title: "WebSockets vs Server-Sent Events vs WebRTC in 2025",
    description:
      "Choose the right real-time communication protocol. Compare WebSockets, SSE, and WebRTC for live data streaming and chat applications.",
    date: "2024-11-20",
    readTime: "9 min read",
    tags: ["WebSockets", "Real-time", "WebRTC", "SSE"],
    featured: false,
  },
  {
    slug: "design-systems-2025",
    title: "Building Design Systems in 2025: Storybook vs Chromatic vs Figma",
    description:
      "Create and maintain design systems effectively. Tools, best practices, and workflows for component libraries and design tokens.",
    date: "2024-11-18",
    readTime: "12 min read",
    tags: ["Design Systems", "Storybook", "Figma", "UI"],
    featured: false,
  },
  {
    slug: "search-engines-2025",
    title: "Best Search Solutions in 2025: Algolia vs Elasticsearch vs Meilisearch",
    description:
      "Implement powerful search in your application. Compare search engines, performance, and pricing for different use cases.",
    date: "2024-11-15",
    readTime: "11 min read",
    tags: ["Search", "Algolia", "Elasticsearch", "Meilisearch"],
    featured: false,
  },
  {
    slug: "email-services-developers-2025",
    title: "Best Email Services for Developers in 2025: SendGrid vs Resend vs Postmark",
    description:
      "Send transactional emails reliably. Compare email APIs, deliverability, and developer experience of top email services.",
    date: "2024-11-12",
    readTime: "9 min read",
    tags: ["Email", "SendGrid", "Resend", "Postmark"],
    featured: false,
  },
  {
    slug: "payment-processing-2025",
    title: "Payment Processing in 2025: Stripe vs PayPal vs Square",
    description:
      "Integrate payments into your application. Compare fees, features, and developer experience of leading payment processors.",
    date: "2024-11-10",
    readTime: "10 min read",
    tags: ["Payments", "Stripe", "PayPal", "Square"],
    featured: false,
  },
  {
    slug: "static-site-generators-2025",
    title: "Best Static Site Generators in 2025: Astro vs Hugo vs Eleventy",
    description:
      "Build blazing-fast static sites with modern generators. Compare Astro, Hugo, and Eleventy for blogs, documentation, and marketing sites.",
    date: "2024-11-08",
    readTime: "10 min read",
    tags: ["SSG", "Astro", "Hugo", "Eleventy"],
    featured: false,
  },
  {
    slug: "form-libraries-react-2025",
    title: "Best React Form Libraries in 2025: React Hook Form vs Formik vs TanStack Form",
    description:
      "Handle forms efficiently in React. Compare validation, performance, and DX of top form libraries for complex form requirements.",
    date: "2024-11-05",
    readTime: "9 min read",
    tags: ["React", "Forms", "React Hook Form", "Formik"],
    featured: false,
  },
  {
    slug: "animation-libraries-web-2025",
    title: "Best Animation Libraries for Web in 2025: Framer Motion vs GSAP vs Anime.js",
    description:
      "Create stunning web animations. Compare animation libraries for React and vanilla JavaScript with performance benchmarks.",
    date: "2024-11-03",
    readTime: "10 min read",
    tags: ["Animation", "Framer Motion", "GSAP", "UI"],
    featured: false,
  },
  {
    slug: "code-quality-tools-2025",
    title: "Essential Code Quality Tools in 2025: ESLint vs Prettier vs Biome",
    description:
      "Maintain code quality and consistency. Compare linters, formatters, and all-in-one tools for JavaScript and TypeScript projects.",
    date: "2024-11-01",
    readTime: "8 min read",
    tags: ["Code Quality", "ESLint", "Prettier", "Biome"],
    featured: false,
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const recentPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
