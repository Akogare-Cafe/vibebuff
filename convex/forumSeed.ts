import { mutation } from "./_generated/server";

export const seedForumData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCategories = await ctx.db.query("forumCategories").collect();
    if (existingCategories.length > 0) {
      return { message: "Forum already seeded", categoriesCount: existingCategories.length };
    }

    const now = Date.now();

    const categories = [
      {
        name: "General Discussion",
        slug: "general",
        description: "Chat about anything related to development tools and tech",
        icon: "Flame",
        color: "#ef4444",
        sortOrder: 1,
        threadCount: 0,
        postCount: 0,
        lastActivityAt: now,
      },
      {
        name: "Tool Recommendations",
        slug: "recommendations",
        description: "Ask for and share tool recommendations for your projects",
        icon: "Lightbulb",
        color: "#f59e0b",
        sortOrder: 2,
        threadCount: 0,
        postCount: 0,
        lastActivityAt: now,
      },
      {
        name: "Help & Support",
        slug: "help",
        description: "Get help with tools, integrations, and technical issues",
        icon: "HelpCircle",
        color: "#3b82f6",
        sortOrder: 3,
        threadCount: 0,
        postCount: 0,
        lastActivityAt: now,
      },
      {
        name: "Announcements",
        slug: "announcements",
        description: "Official announcements and updates from the VibeBuff team",
        icon: "Megaphone",
        color: "#8b5cf6",
        sortOrder: 4,
        threadCount: 0,
        postCount: 0,
        lastActivityAt: now,
      },
      {
        name: "Show & Tell",
        slug: "showcase",
        description: "Share your projects, stacks, and what you've built",
        icon: "Wrench",
        color: "#10b981",
        sortOrder: 5,
        threadCount: 0,
        postCount: 0,
        lastActivityAt: now,
      },
    ];

    const categoryIds: Record<string, string> = {};
    for (const category of categories) {
      const id = await ctx.db.insert("forumCategories", category);
      categoryIds[category.slug] = id;
    }

    const threads = [
      {
        categorySlug: "announcements",
        title: "Welcome to the VibeBuff Community Forum!",
        slug: "welcome-to-vibebuff-forum-" + now.toString(36),
        content: `Hey everyone! Welcome to the official VibeBuff community forum.

This is the place to:
- Discuss your favorite development tools
- Share your tech stacks and get feedback
- Ask for recommendations
- Help fellow developers
- Show off what you've built

We're excited to have you here. Feel free to introduce yourself and start exploring!

Happy building!`,
        isPinned: true,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "What's your go-to tech stack for side projects?",
        slug: "go-to-tech-stack-side-projects-" + (now + 1).toString(36),
        content: `I'm curious what everyone uses for their side projects. 

For me, I've been loving the combination of Next.js + Convex + Tailwind. It's incredibly fast to get something up and running.

What about you? What's your default stack when starting something new?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "recommendations",
        title: "Best database for a real-time collaborative app?",
        slug: "best-database-realtime-collab-" + (now + 2).toString(36),
        content: `I'm building a collaborative document editor (think Notion-like) and I'm trying to decide on the database.

Requirements:
- Real-time sync across clients
- Good conflict resolution
- Scales well
- Preferably has a generous free tier

I've been looking at Convex, Supabase, and Firebase. Any experiences or recommendations?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "help",
        title: "How to handle authentication in a monorepo?",
        slug: "auth-monorepo-setup-" + (now + 3).toString(36),
        content: `I have a monorepo with a Next.js frontend and a separate API service. I'm using Clerk for auth on the frontend but struggling to validate tokens on the API side.

Has anyone set up something similar? What's the best approach for sharing auth state across services in a monorepo?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "showcase",
        title: "Just launched my first SaaS - built with tools from VibeBuff!",
        slug: "launched-first-saas-" + (now + 4).toString(36),
        content: `After 3 months of building, I finally launched my first SaaS product!

Tech stack:
- Frontend: Next.js 14 with App Router
- Backend: Convex for real-time data
- Auth: Clerk
- Payments: Stripe
- Hosting: Vercel
- Analytics: Posthog

The whole stack cost me $0/month during development thanks to generous free tiers. Now I'm paying about $50/month with real users.

Happy to answer any questions about the stack or the journey!`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "Core Web Vitals optimization tips - what worked for you?",
        slug: "core-web-vitals-optimization-" + (now + 5).toString(36),
        content: `I've been working on improving my site's Core Web Vitals scores and wanted to share some findings.

What helped the most:
- Lazy loading images below the fold
- Using next/image for automatic optimization
- Reducing JavaScript bundle size with dynamic imports

My LCP went from 4.2s to 1.8s! What techniques have worked for you?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "recommendations",
        title: "Docker vs Railway for small projects - which do you prefer?",
        slug: "docker-vs-railway-small-projects-" + (now + 6).toString(36),
        content: `I'm deploying a small Node.js API and trying to decide between:

1. Docker on a VPS (more control, more work)
2. Railway (managed, simpler, slightly more expensive)

For those who've used both - what's your recommendation for a solo developer? Is the convenience of Railway worth the extra cost?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "help",
        title: "Vitest vs Jest - migration worth it?",
        slug: "vitest-vs-jest-migration-" + (now + 7).toString(36),
        content: `Our team is considering migrating from Jest to Vitest. We're using Vite for our React app.

Questions:
- How painful is the migration process?
- Are there any gotchas we should know about?
- Is the speed improvement as significant as benchmarks suggest?

Would love to hear from anyone who's made this switch!`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "React Server Components - are you using them in production?",
        slug: "react-server-components-production-" + (now + 8).toString(36),
        content: `RSC has been out for a while now with Next.js App Router. I'm curious:

- Are you using Server Components in production?
- What's your experience been like?
- Any gotchas or patterns you've discovered?

I'm still wrapping my head around when to use "use client" vs keeping things on the server.`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "recommendations",
        title: "Best headless CMS for a developer blog?",
        slug: "best-headless-cms-developer-blog-" + (now + 9).toString(36),
        content: `I'm setting up a developer blog and looking for a headless CMS. Requirements:

- Good developer experience
- Markdown support
- Free tier for personal use
- Good API/SDK

I've narrowed it down to Sanity, Contentful, and just using MDX files. What would you recommend?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "showcase",
        title: "Built a real-time dashboard with SvelteKit and Convex",
        slug: "realtime-dashboard-sveltekit-convex-" + (now + 10).toString(36),
        content: `Just finished building a real-time analytics dashboard for my side project.

Stack:
- SvelteKit for the frontend
- Convex for real-time data
- Tailwind CSS for styling
- Vercel for hosting

The real-time updates are buttery smooth. Convex's reactive queries made it super easy to implement. Happy to share more details if anyone's interested!`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "help",
        title: "tRPC type inference not working - any ideas?",
        slug: "trpc-type-inference-issues-" + (now + 11).toString(36),
        content: `I'm setting up tRPC in a Next.js monorepo and the type inference isn't working on the client side.

My setup:
- pnpm workspaces
- Next.js 14 in apps/web
- tRPC router in packages/api

The types work in the API package but not in the Next.js app. Has anyone dealt with this before?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "Bun 1.0 - anyone using it in production?",
        slug: "bun-production-experience-" + (now + 12).toString(36),
        content: `Bun has been stable for a while now. I'm tempted to switch from Node.js for the performance gains.

Questions for those using Bun in production:
- Any compatibility issues with npm packages?
- How's the debugging experience?
- Is it stable enough for production workloads?

The benchmarks look amazing but real-world experience matters more.`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "recommendations",
        title: "shadcn/ui vs Chakra UI vs MUI - which for a new project?",
        slug: "shadcn-chakra-mui-comparison-" + (now + 13).toString(36),
        content: `Starting a new React project and need to pick a component library. I've used MUI before but heard great things about shadcn/ui.

Priorities:
- Customization flexibility
- Good accessibility
- Active maintenance
- TypeScript support

What's your go-to in 2025?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "showcase",
        title: "Open-sourced my Playwright testing setup",
        slug: "playwright-testing-setup-opensource-" + (now + 14).toString(36),
        content: `I've been refining my E2E testing setup with Playwright and decided to open-source it.

Features:
- Page Object Model pattern
- Visual regression testing
- Parallel test execution
- GitHub Actions integration
- Slack notifications for failures

Link in my profile. Feedback welcome!`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "help",
        title: "Vercel Edge Functions vs Cloudflare Workers - latency comparison?",
        slug: "vercel-edge-vs-cloudflare-workers-" + (now + 15).toString(36),
        content: `I'm building an API that needs to be as fast as possible globally. Trying to decide between Vercel Edge Functions and Cloudflare Workers.

Has anyone done actual latency comparisons? The marketing materials all claim to be the fastest but I'd love real-world numbers.`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "pnpm workspaces - best practices for monorepos?",
        slug: "pnpm-workspaces-monorepo-practices-" + (now + 16).toString(36),
        content: `I'm setting up a new monorepo with pnpm workspaces. Looking for advice on:

- Folder structure (apps/ packages/ or flat?)
- Shared configs (ESLint, TypeScript, etc.)
- Versioning strategy
- CI/CD setup

What patterns have worked well for your team?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "recommendations",
        title: "Best analytics tool for privacy-conscious users?",
        slug: "privacy-focused-analytics-tools-" + (now + 17).toString(36),
        content: `Looking for an analytics solution that respects user privacy. Google Analytics feels too invasive.

Options I'm considering:
- Plausible
- Fathom
- Umami (self-hosted)
- PostHog

Anyone have experience with these? Which provides the best balance of insights vs privacy?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "showcase",
        title: "My GitHub Actions workflow for Next.js deployments",
        slug: "github-actions-nextjs-workflow-" + (now + 18).toString(36),
        content: `Sharing my optimized GitHub Actions workflow for Next.js projects.

Features:
- Caching for node_modules and Next.js build cache
- Parallel linting, type-checking, and testing
- Preview deployments on PRs
- Production deployment on merge to main

Reduced our CI time from 8 minutes to 2 minutes. Happy to share the YAML!`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "help",
        title: "TanStack Query cache invalidation patterns?",
        slug: "tanstack-query-cache-invalidation-" + (now + 19).toString(36),
        content: `I'm using TanStack Query (React Query) and struggling with cache invalidation after mutations.

Specifically:
- When to use invalidateQueries vs setQueryData
- How to handle optimistic updates properly
- Best practices for query key organization

Any resources or patterns you'd recommend?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "Astro vs Next.js for a documentation site?",
        slug: "astro-vs-nextjs-documentation-" + (now + 20).toString(36),
        content: `Building documentation for an open-source project. Torn between Astro and Next.js.

Astro pros: Zero JS by default, content collections
Next.js pros: Already know it, more flexibility

For a mostly static docs site, is Astro worth learning? How's the developer experience?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "recommendations",
        title: "React Native vs Flutter for a new mobile app?",
        slug: "react-native-vs-flutter-mobile-" + (now + 21).toString(36),
        content: `Starting a new mobile app project. Our web team knows React well, which makes React Native appealing.

But Flutter's performance and tooling look impressive. For a team of React developers:
- Is the Dart learning curve worth it?
- How's the Flutter job market?
- Any cross-platform gotchas to be aware of?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "showcase",
        title: "Built an AI chatbot with Vercel AI SDK",
        slug: "ai-chatbot-vercel-sdk-" + (now + 22).toString(36),
        content: `Just shipped an AI-powered customer support chatbot using the Vercel AI SDK.

Tech stack:
- Next.js App Router
- Vercel AI SDK for streaming
- OpenAI GPT-4 API
- Convex for conversation history
- Tailwind for styling

The streaming responses make it feel super responsive. The Vercel AI SDK made integration surprisingly easy!`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "help",
        title: "Web accessibility testing - automated tools recommendations?",
        slug: "accessibility-testing-tools-" + (now + 23).toString(36),
        content: `We're trying to improve our app's accessibility. Looking for tools to integrate into our CI pipeline.

Currently considering:
- axe-core
- Lighthouse CI
- Pa11y

What's your experience with automated a11y testing? How do you balance automated vs manual testing?`,
        isPinned: false,
        isLocked: false,
      },
      {
        categorySlug: "general",
        title: "TypeScript strict mode - worth the pain?",
        slug: "typescript-strict-mode-worth-it-" + (now + 24).toString(36),
        content: `We're debating whether to enable strict mode in our TypeScript config. Currently using a more relaxed setup.

For those who've made the switch:
- How long did the migration take?
- Was it worth the effort?
- Any tips for a gradual migration?

Our codebase is about 50k lines of TypeScript.`,
        isPinned: false,
        isLocked: false,
      },
    ];

    for (const thread of threads) {
      const categoryId = categoryIds[thread.categorySlug];
      if (!categoryId) continue;

      await ctx.db.insert("forumThreads", {
        categoryId: categoryId as any,
        title: thread.title,
        slug: thread.slug,
        content: thread.content,
        authorId: "system",
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        viewCount: Math.floor(Math.random() * 100) + 10,
        replyCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(categoryId as any, {
        threadCount: 1,
        lastActivityAt: now,
      });
    }

    return { 
      message: "Forum seeded successfully", 
      categoriesCount: categories.length,
      threadsCount: threads.length,
    };
  },
});

export const clearForumData = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("forumCategories").collect();
    const threads = await ctx.db.query("forumThreads").collect();
    const posts = await ctx.db.query("forumPosts").collect();
    const votes = await ctx.db.query("forumPostVotes").collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }
    for (const thread of threads) {
      await ctx.db.delete(thread._id);
    }
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    return { 
      message: "Forum data cleared",
      deleted: {
        categories: categories.length,
        threads: threads.length,
        posts: posts.length,
        votes: votes.length,
      }
    };
  },
});
