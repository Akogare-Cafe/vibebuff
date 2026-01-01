import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const TIER_THRESHOLDS = {
  bronze: { deckAdds: 100, stars: 1000 },
  silver: { deckAdds: 500, stars: 5000 },
  gold: { deckAdds: 2000, stars: 20000 },
  diamond: { deckAdds: 10000, stars: 50000 },
  legendary: { deckAdds: 50000, stars: 100000 },
};

export const getToolEvolution = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const evolution = await ctx.db
      .query("toolEvolutions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .order("desc")
      .first();

    const tool = await ctx.db.get(args.toolId);

    return {
      evolution,
      tool,
      currentTier: evolution?.tier || "bronze",
    };
  },
});

export const getEvolutionHistory = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("toolEvolutions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .order("asc")
      .collect();
  },
});

export const checkAndEvolve = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) throw new Error("Tool not found");

    const currentEvolution = await ctx.db
      .query("toolEvolutions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .order("desc")
      .first();

    const currentTier = currentEvolution?.tier || "bronze";
    const tiers = ["bronze", "silver", "gold", "diamond", "legendary"] as const;
    const currentIndex = tiers.indexOf(currentTier as typeof tiers[number]);

    if (currentIndex >= tiers.length - 1) {
      return { evolved: false, message: "Already at max tier" };
    }

    const nextTier = tiers[currentIndex + 1];
    const threshold = TIER_THRESHOLDS[nextTier];

    const deckAdds = (await ctx.db
      .query("toolUsage")
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .collect()).length;

    const stars = tool.githubStars || 0;

    if (deckAdds >= threshold.deckAdds || stars >= threshold.stars) {
      await ctx.db.insert("toolEvolutions", {
        toolId: args.toolId,
        tier: nextTier,
        previousTier: currentTier,
        evolvedAt: Date.now(),
        milestone: {
          type: deckAdds >= threshold.deckAdds ? "deckAdds" : "stars",
          value: deckAdds >= threshold.deckAdds ? deckAdds : stars,
        },
      });

      return { evolved: true, newTier: nextTier };
    }

    return { evolved: false, message: "Threshold not met" };
  },
});

export const getOGCollectors = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("ogCollectors")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .filter((q) => q.eq(q.field("isOG"), true))
      .collect();
  },
});

export const getUserOGBadges = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const badges = await ctx.db
      .query("ogCollectors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isOG"), true))
      .collect();

    return Promise.all(
      badges.map(async (b) => {
        const tool = await ctx.db.get(b.toolId);
        const currentEvolution = await ctx.db
          .query("toolEvolutions")
          .withIndex("by_tool", (q) => q.eq("toolId", b.toolId))
          .order("desc")
          .first();

        return {
          ...b,
          tool,
          currentTier: currentEvolution?.tier || "bronze",
        };
      })
    );
  },
});

export const recordCollection = mutation({
  args: { userId: v.string(), toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ogCollectors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .first();

    if (existing) return existing._id;

    const currentEvolution = await ctx.db
      .query("toolEvolutions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .order("desc")
      .first();

    const currentTier = currentEvolution?.tier || "bronze";

    return ctx.db.insert("ogCollectors", {
      userId: args.userId,
      toolId: args.toolId,
      collectedAt: Date.now(),
      tierAtCollection: currentTier,
      isOG: currentTier === "bronze",
    });
  },
});

export const getEvolvingTools = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const recentEvolutions = await ctx.db
      .query("toolEvolutions")
      .order("desc")
      .take(args.limit || 10);

    return Promise.all(
      recentEvolutions.map(async (e) => {
        const tool = await ctx.db.get(e.toolId);
        return { ...e, tool };
      })
    );
  },
});

export const getTierDistribution = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    
    const distribution: Record<string, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      diamond: 0,
      legendary: 0,
    };

    for (const tool of tools) {
      const evolution = await ctx.db
        .query("toolEvolutions")
        .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
        .order("desc")
        .first();

      const tier = evolution?.tier || "bronze";
      distribution[tier]++;
    }

    return distribution;
  },
});
