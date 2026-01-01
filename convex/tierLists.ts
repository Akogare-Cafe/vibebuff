import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user's tier lists
export const getUserTierLists = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const tierLists = await ctx.db
      .query("tierLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const listsWithDetails = await Promise.all(
      tierLists.map(async (list) => {
        const category = await ctx.db.get(list.categoryId);
        return { ...list, category };
      })
    );

    return listsWithDetails;
  },
});

// Get tier lists for a category
export const getCategoryTierLists = query({
  args: { categoryId: v.id("categories"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const tierLists = await ctx.db
      .query("tierLists")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    // Sort by upvotes
    const sorted = tierLists.sort((a, b) => b.upvotes - a.upvotes);

    return sorted.slice(0, args.limit || 20);
  },
});

// Get tier list by share token
export const getByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const tierList = await ctx.db
      .query("tierLists")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!tierList) return null;

    const category = await ctx.db.get(tierList.categoryId);

    // Get all tools in the tier list
    const allToolIds = [
      ...tierList.tiers.s,
      ...tierList.tiers.a,
      ...tierList.tiers.b,
      ...tierList.tiers.c,
      ...tierList.tiers.d,
    ];

    const tools = await Promise.all(allToolIds.map((id) => ctx.db.get(id)));
    const toolsMap = Object.fromEntries(
      tools.filter(Boolean).map((t) => [t!._id, t])
    );

    return { ...tierList, category, toolsMap };
  },
});

// Create tier list
export const create = mutation({
  args: {
    userId: v.string(),
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    tiers: v.object({
      s: v.array(v.id("tools")),
      a: v.array(v.id("tools")),
      b: v.array(v.id("tools")),
      c: v.array(v.id("tools")),
      d: v.array(v.id("tools")),
    }),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const shareToken = Math.random().toString(36).substring(2, 10);

    const tierListId = await ctx.db.insert("tierLists", {
      userId: args.userId,
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      tiers: args.tiers,
      isPublic: args.isPublic,
      shareToken,
      upvotes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { tierListId, shareToken };
  },
});

// Update tier list
export const update = mutation({
  args: {
    tierListId: v.id("tierLists"),
    userId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    tiers: v.optional(v.object({
      s: v.array(v.id("tools")),
      a: v.array(v.id("tools")),
      b: v.array(v.id("tools")),
      c: v.array(v.id("tools")),
      d: v.array(v.id("tools")),
    })),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tierList = await ctx.db.get(args.tierListId);
    if (!tierList) throw new Error("Tier list not found");
    if (tierList.userId !== args.userId) throw new Error("Not authorized");

    await ctx.db.patch(args.tierListId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.tiers && { tiers: args.tiers }),
      ...(args.isPublic !== undefined && { isPublic: args.isPublic }),
      updatedAt: Date.now(),
    });
  },
});

// Upvote tier list
export const upvote = mutation({
  args: {
    userId: v.string(),
    tierListId: v.id("tierLists"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tierListVotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("tierListId"), args.tierListId))
      .first();

    if (existing) {
      throw new Error("Already upvoted");
    }

    await ctx.db.insert("tierListVotes", {
      userId: args.userId,
      tierListId: args.tierListId,
      votedAt: Date.now(),
    });

    const tierList = await ctx.db.get(args.tierListId);
    if (tierList) {
      await ctx.db.patch(args.tierListId, {
        upvotes: tierList.upvotes + 1,
      });
    }
  },
});

// Get community consensus tier list
export const getCommunityConsensus = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const tierLists = await ctx.db
      .query("tierLists")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    if (tierLists.length === 0) return null;

    // Aggregate tool placements across all tier lists
    const toolScores: Record<string, { total: number; count: number }> = {};
    const tierValues = { s: 5, a: 4, b: 3, c: 2, d: 1 };

    for (const list of tierLists) {
      const weight = 1 + list.upvotes * 0.1; // Weight by upvotes
      for (const [tier, tools] of Object.entries(list.tiers)) {
        const value = tierValues[tier as keyof typeof tierValues];
        for (const toolId of tools) {
          if (!toolScores[toolId]) {
            toolScores[toolId] = { total: 0, count: 0 };
          }
          toolScores[toolId].total += value * weight;
          toolScores[toolId].count += weight;
        }
      }
    }

    // Calculate average scores and assign tiers
    const toolAverages = Object.entries(toolScores).map(([toolId, data]) => ({
      toolId,
      average: data.total / data.count,
    }));

    toolAverages.sort((a, b) => b.average - a.average);

    // Assign to tiers based on percentile
    const consensus = { s: [] as string[], a: [] as string[], b: [] as string[], c: [] as string[], d: [] as string[] };
    const total = toolAverages.length;

    toolAverages.forEach((item, index) => {
      const percentile = index / total;
      if (percentile < 0.1) consensus.s.push(item.toolId);
      else if (percentile < 0.3) consensus.a.push(item.toolId);
      else if (percentile < 0.6) consensus.b.push(item.toolId);
      else if (percentile < 0.85) consensus.c.push(item.toolId);
      else consensus.d.push(item.toolId);
    });

    return {
      consensus,
      totalLists: tierLists.length,
      totalVotes: tierLists.reduce((sum, l) => sum + l.upvotes, 0),
    };
  },
});
