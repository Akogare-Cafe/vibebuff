import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createReplay = mutation({
  args: {
    userId: v.string(),
    replayType: v.union(v.literal("battle"), v.literal("roguelike"), v.literal("draft"), v.literal("simulation")),
    referenceId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    replayData: v.object({
      duration: v.number(),
      keyMoments: v.array(v.object({
        timestamp: v.number(),
        event: v.string(),
        description: v.string(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("stackReplays", {
      userId: args.userId,
      replayType: args.replayType,
      referenceId: args.referenceId,
      title: args.title,
      description: args.description,
      replayData: args.replayData,
      upvotes: 0,
      views: 0,
      isFeatured: false,
      createdAt: Date.now(),
    });
  },
});

export const getReplay = query({
  args: { replayId: v.id("stackReplays") },
  handler: async (ctx, args) => {
    const replay = await ctx.db.get(args.replayId);
    if (!replay) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("clerkId"), replay.userId))
      .first();

    return {
      ...replay,
      username: profile?.username,
      userLevel: profile?.level,
    };
  },
});

export const getUserReplays = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("stackReplays")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 20);
  },
});

export const getTopReplays = query({
  args: { 
    replayType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let replays = await ctx.db
      .query("stackReplays")
      .order("desc")
      .take(100);

    if (args.replayType) {
      replays = replays.filter((r) => r.replayType === args.replayType);
    }

    const sorted = replays
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, args.limit || 10);

    return Promise.all(
      sorted.map(async (replay) => {
        const profile = await ctx.db
          .query("userProfiles")
          .filter((q) => q.eq(q.field("clerkId"), replay.userId))
          .first();

        return {
          ...replay,
          username: profile?.username,
        };
      })
    );
  },
});

export const getFeaturedReplays = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const replays = await ctx.db
      .query("stackReplays")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .take(args.limit || 10);

    return Promise.all(
      replays.map(async (replay) => {
        const profile = await ctx.db
          .query("userProfiles")
          .filter((q) => q.eq(q.field("clerkId"), replay.userId))
          .first();

        return {
          ...replay,
          username: profile?.username,
        };
      })
    );
  },
});

export const upvoteReplay = mutation({
  args: {
    oderId: v.string(),
    replayId: v.id("stackReplays"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("replayVotes")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .filter((q) => q.eq(q.field("replayId"), args.replayId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      const replay = await ctx.db.get(args.replayId);
      if (replay) {
        await ctx.db.patch(args.replayId, { upvotes: Math.max(0, replay.upvotes - 1) });
      }
      return { action: "removed" };
    }

    await ctx.db.insert("replayVotes", {
      replayId: args.replayId,
      oderId: args.oderId,
      votedAt: Date.now(),
    });

    const replay = await ctx.db.get(args.replayId);
    if (replay) {
      await ctx.db.patch(args.replayId, { upvotes: replay.upvotes + 1 });
    }

    return { action: "added" };
  },
});

export const recordView = mutation({
  args: { replayId: v.id("stackReplays") },
  handler: async (ctx, args) => {
    const replay = await ctx.db.get(args.replayId);
    if (replay) {
      await ctx.db.patch(args.replayId, { views: replay.views + 1 });
    }
  },
});

export const setFeatured = mutation({
  args: {
    replayId: v.id("stackReplays"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.replayId, { isFeatured: args.isFeatured });
    return { success: true };
  },
});

export const getWeeklyHighlights = query({
  args: {},
  handler: async (ctx) => {
    const highlights = await ctx.db
      .query("weeklyHighlights")
      .order("desc")
      .first();

    if (!highlights) return null;

    const replays = await Promise.all(
      highlights.topReplays.map(async (id) => {
        const replay = await ctx.db.get(id);
        if (!replay) return null;

        const profile = await ctx.db
          .query("userProfiles")
          .filter((q) => q.eq(q.field("clerkId"), replay.userId))
          .first();

        return {
          ...replay,
          username: profile?.username,
        };
      })
    );

    return {
      ...highlights,
      replays: replays.filter(Boolean),
    };
  },
});

export const generateWeeklyHighlights = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weekStart = now - weekMs;

    const recentReplays = await ctx.db
      .query("stackReplays")
      .filter((q) => q.gte(q.field("createdAt"), weekStart))
      .collect();

    const topReplays = recentReplays
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 10)
      .map((r) => r._id);

    return ctx.db.insert("weeklyHighlights", {
      weekStart,
      weekEnd: now,
      topReplays,
      generatedAt: now,
    });
  },
});

export const deleteReplay = mutation({
  args: {
    userId: v.string(),
    replayId: v.id("stackReplays"),
  },
  handler: async (ctx, args) => {
    const replay = await ctx.db.get(args.replayId);
    if (!replay) throw new Error("Replay not found");
    if (replay.userId !== args.userId) throw new Error("Not your replay");

    const votes = await ctx.db
      .query("replayVotes")
      .withIndex("by_replay", (q) => q.eq("replayId", args.replayId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    await ctx.db.delete(args.replayId);
    return { success: true };
  },
});
