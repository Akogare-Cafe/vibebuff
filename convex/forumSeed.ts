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
