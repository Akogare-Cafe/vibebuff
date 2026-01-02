import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    platform: v.optional(v.union(v.literal("mac"), v.literal("windows"), v.literal("linux"), v.literal("all"))),
    toolId: v.optional(v.id("tools")),
  },
  handler: async (ctx, args) => {
    let guides;
    
    if (args.toolId) {
      guides = await ctx.db
        .query("setupGuides")
        .withIndex("by_tool", (q) => q.eq("toolId", args.toolId!))
        .collect();
    } else if (args.platform && args.platform !== "all") {
      guides = await ctx.db
        .query("setupGuides")
        .withIndex("by_platform", (q) => q.eq("platform", args.platform!))
        .collect();
    } else {
      guides = await ctx.db.query("setupGuides").collect();
    }

    const guidesWithTools = await Promise.all(
      guides.map(async (guide) => {
        const tool = await ctx.db.get(guide.toolId);
        return { ...guide, tool };
      })
    );

    return guidesWithTools;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const guide = await ctx.db
      .query("setupGuides")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!guide) return null;

    const tool = await ctx.db.get(guide.toolId);
    return { ...guide, tool };
  },
});

export const getByTool = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const guides = await ctx.db
      .query("setupGuides")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    return guides;
  },
});

export const getUserProgress = query({
  args: { userId: v.string(), guideId: v.id("setupGuides") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSetupProgress")
      .withIndex("by_user_guide", (q) => 
        q.eq("userId", args.userId).eq("guideId", args.guideId)
      )
      .first();
  },
});

export const getAllUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSetupProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const startGuide = mutation({
  args: { userId: v.string(), guideId: v.id("setupGuides") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSetupProgress")
      .withIndex("by_user_guide", (q) => 
        q.eq("userId", args.userId).eq("guideId", args.guideId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("userSetupProgress", {
      userId: args.userId,
      guideId: args.guideId,
      completedSteps: [],
      isCompleted: false,
      startedAt: Date.now(),
    });
  },
});

export const completeStep = mutation({
  args: { 
    userId: v.string(), 
    guideId: v.id("setupGuides"),
    stepIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userSetupProgress")
      .withIndex("by_user_guide", (q) => 
        q.eq("userId", args.userId).eq("guideId", args.guideId)
      )
      .first();

    if (!progress) {
      return await ctx.db.insert("userSetupProgress", {
        userId: args.userId,
        guideId: args.guideId,
        completedSteps: [args.stepIndex],
        isCompleted: false,
        startedAt: Date.now(),
      });
    }

    const completedSteps = progress.completedSteps.includes(args.stepIndex)
      ? progress.completedSteps
      : [...progress.completedSteps, args.stepIndex];

    const guide = await ctx.db.get(args.guideId);
    const isCompleted = guide ? completedSteps.length >= guide.steps.length : false;

    await ctx.db.patch(progress._id, {
      completedSteps,
      isCompleted,
      completedAt: isCompleted ? Date.now() : undefined,
    });

    return progress._id;
  },
});

export const markHelpful = mutation({
  args: { guideId: v.id("setupGuides") },
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide) return;

    await ctx.db.patch(args.guideId, {
      helpfulCount: guide.helpfulCount + 1,
    });
  },
});

export const incrementViews = mutation({
  args: { guideId: v.id("setupGuides") },
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide) return;

    await ctx.db.patch(args.guideId, {
      views: guide.views + 1,
    });
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    toolId: v.id("tools"),
    platform: v.union(v.literal("mac"), v.literal("windows"), v.literal("linux"), v.literal("all")),
    steps: v.array(v.object({
      title: v.string(),
      description: v.string(),
      command: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      videoUrl: v.optional(v.string()),
      tips: v.array(v.string()),
      warnings: v.array(v.string()),
    })),
    prerequisites: v.array(v.string()),
    estimatedMinutes: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("setupGuides", {
      ...args,
      views: 0,
      helpfulCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
