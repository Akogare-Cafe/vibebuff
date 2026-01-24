import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getStories = query({
  args: { industry: v.optional(v.string()), stage: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.industry) {
      return await ctx.db
        .query("startupStories")
        .withIndex("by_industry", (q) => q.eq("industry", args.industry!))
        .take(args.limit || 20);
    }

    if (args.stage) {
      return await ctx.db
        .query("startupStories")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_stage", (q) => q.eq("stage", args.stage as any))
        .take(args.limit || 20);
    }

    return await ctx.db.query("startupStories").take(args.limit || 20);
  },
});

export const getTopStories = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const stories = await ctx.db
      .query("startupStories")
      .withIndex("by_upvotes")
      .order("desc")
      .take(args.limit || 10);

    return stories;
  },
});

export const getStory = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("startupStories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!story) return null;

    const stackWithTools = await Promise.all(
      story.stackEvolution.map(async (phase) => {
        const tools = await Promise.all(phase.toolIds.map((id) => ctx.db.get(id)));
        return { ...phase, tools: tools.filter(Boolean) };
      })
    );

    return { ...story, stackEvolution: stackWithTools };
  },
});

export const getStoriesByTool = query({
  args: { toolId: v.id("tools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const allStories = await ctx.db.query("startupStories").collect();

    const storiesWithTool = allStories.filter((story) =>
      story.stackEvolution.some((phase) =>
        phase.toolIds.some((id) => id === args.toolId)
      )
    );

    return storiesWithTool.slice(0, args.limit || 10);
  },
});

export const createStory = mutation({
  args: {
    slug: v.string(),
    companyName: v.string(),
    logoUrl: v.optional(v.string()),
    foundedYear: v.number(),
    industry: v.string(),
    stage: v.union(
      v.literal("idea"),
      v.literal("mvp"),
      v.literal("seed"),
      v.literal("series_a"),
      v.literal("series_b_plus"),
      v.literal("public")
    ),
    teamSize: v.optional(v.number()),
    description: v.string(),
    stackEvolution: v.array(v.object({
      phase: v.string(),
      year: v.number(),
      toolIds: v.array(v.id("tools")),
      reasoning: v.string(),
      lessonsLearned: v.optional(v.string()),
    })),
    costBreakdown: v.optional(v.object({
      monthly: v.number(),
      breakdown: v.array(v.object({
        category: v.string(),
        amount: v.number(),
      })),
    })),
    founderQuotes: v.optional(v.array(v.object({
      quote: v.string(),
      author: v.string(),
      role: v.string(),
    }))),
    submittedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("startupStories", {
      ...args,
      isVerified: false,
      isUserSubmitted: !!args.submittedBy,
      upvotes: 0,
      views: 0,
      createdAt: Date.now(),
    });
  },
});

export const upvoteStory = mutation({
  args: { storyId: v.id("startupStories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(args.storyId, {
      upvotes: story.upvotes + 1,
    });
  },
});

export const recordView = mutation({
  args: { storyId: v.id("startupStories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(args.storyId, {
      views: story.views + 1,
    });
  },
});

export const verifyStory = mutation({
  args: { storyId: v.id("startupStories") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storyId, {
      isVerified: true,
    });
  },
});

export const seedStories = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").take(10);
    const toolIds = tools.map((t) => t._id);

    const stories = [
      {
        slug: "acme-saas",
        companyName: "Acme SaaS",
        foundedYear: 2021,
        industry: "B2B SaaS",
        stage: "seed" as const,
        teamSize: 5,
        description: "A project management tool for remote teams",
        stackEvolution: [
          {
            phase: "MVP",
            year: 2021,
            toolIds: toolIds.slice(0, 3),
            reasoning: "Needed to ship fast with minimal budget",
            lessonsLearned: "Should have invested more in testing early",
          },
          {
            phase: "Post-Seed",
            year: 2022,
            toolIds: toolIds.slice(0, 5),
            reasoning: "Scaling required better infrastructure",
          },
        ],
        costBreakdown: {
          monthly: 500,
          breakdown: [
            { category: "Hosting", amount: 200 },
            { category: "Database", amount: 150 },
            { category: "Auth", amount: 50 },
            { category: "Other", amount: 100 },
          ],
        },
        founderQuotes: [
          {
            quote: "We chose simplicity over complexity and it paid off",
            author: "Jane Doe",
            role: "CEO",
          },
        ],
      },
    ];

    for (const story of stories) {
      const existing = await ctx.db
        .query("startupStories")
        .withIndex("by_slug", (q) => q.eq("slug", story.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("startupStories", {
          ...story,
          isVerified: true,
          isUserSubmitted: false,
          upvotes: 0,
          views: 0,
          createdAt: Date.now(),
        });
      }
    }
  },
});
