import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const comparisons = await ctx.db
      .query("beginnerComparisons")
      .withIndex("by_views")
      .order("desc")
      .collect();

    const limited = args.limit ? comparisons.slice(0, args.limit) : comparisons;

    const comparisonsWithTools = await Promise.all(
      limited.map(async (comparison) => {
        const tool1 = await ctx.db.get(comparison.tool1Id);
        const tool2 = await ctx.db.get(comparison.tool2Id);
        return { ...comparison, tool1, tool2 };
      })
    );

    return comparisonsWithTools;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const comparison = await ctx.db
      .query("beginnerComparisons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!comparison) return null;

    const tool1 = await ctx.db.get(comparison.tool1Id);
    const tool2 = await ctx.db.get(comparison.tool2Id);

    return { ...comparison, tool1, tool2 };
  },
});

export const getByTools = query({
  args: { tool1Id: v.id("tools"), tool2Id: v.id("tools") },
  handler: async (ctx, args) => {
    let comparison = await ctx.db
      .query("beginnerComparisons")
      .withIndex("by_tools", (q) => 
        q.eq("tool1Id", args.tool1Id).eq("tool2Id", args.tool2Id)
      )
      .first();

    if (!comparison) {
      comparison = await ctx.db
        .query("beginnerComparisons")
        .withIndex("by_tools", (q) => 
          q.eq("tool1Id", args.tool2Id).eq("tool2Id", args.tool1Id)
        )
        .first();
    }

    if (!comparison) return null;

    const tool1 = await ctx.db.get(comparison.tool1Id);
    const tool2 = await ctx.db.get(comparison.tool2Id);

    return { ...comparison, tool1, tool2 };
  },
});

export const incrementViews = mutation({
  args: { comparisonId: v.id("beginnerComparisons") },
  handler: async (ctx, args) => {
    const comparison = await ctx.db.get(args.comparisonId);
    if (!comparison) return;

    await ctx.db.patch(args.comparisonId, {
      views: comparison.views + 1,
    });
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    beginnerVerdict: v.string(),
    beginnerScores: v.object({
      tool1: v.object({
        easeOfSetup: v.number(),
        learningCurve: v.number(),
        documentation: v.number(),
        communitySupport: v.number(),
        costForBeginners: v.number(),
        overall: v.number(),
      }),
      tool2: v.object({
        easeOfSetup: v.number(),
        learningCurve: v.number(),
        documentation: v.number(),
        communitySupport: v.number(),
        costForBeginners: v.number(),
        overall: v.number(),
      }),
    }),
    comparisonPoints: v.array(v.object({
      aspect: v.string(),
      tool1: v.string(),
      tool2: v.string(),
      winnerForBeginners: v.union(v.literal("tool1"), v.literal("tool2"), v.literal("tie")),
    })),
    recommendedFor: v.array(v.object({
      useCase: v.string(),
      recommendation: v.string(),
      toolSlug: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("beginnerComparisons", {
      ...args,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
