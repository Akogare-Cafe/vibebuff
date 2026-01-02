import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const checkRateLimit = query({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const identifier = args.userId || args.sessionId;
    if (!identifier) {
      return { allowed: true, remaining: 999, resetAt: null };
    }

    const limits: Record<string, { max: number; windowMs: number }> = {
      quest: { max: 10, windowMs: 60 * 60 * 1000 },
      battle: { max: 20, windowMs: 60 * 60 * 1000 },
      deck_create: { max: 5, windowMs: 60 * 60 * 1000 },
      pack_open: { max: 3, windowMs: 24 * 60 * 60 * 1000 },
      ai_recommendation: { max: 5, windowMs: 60 * 60 * 1000 },
    };

    const limit = limits[args.action] || { max: 100, windowMs: 60 * 60 * 1000 };
    const windowStart = Date.now() - limit.windowMs;

    const recentActions = await ctx.db
      .query("usageTracking")
      .filter((q) =>
        q.and(
          q.eq(q.field("identifier"), identifier),
          q.eq(q.field("action"), args.action),
          q.gt(q.field("timestamp"), windowStart)
        )
      )
      .collect();

    const count = recentActions.length;
    const allowed = count < limit.max;
    const remaining = Math.max(0, limit.max - count);
    const oldestInWindow = recentActions[0]?.timestamp;
    const resetAt = oldestInWindow ? oldestInWindow + limit.windowMs : null;

    return { allowed, remaining, resetAt, count, limit: limit.max };
  },
});

export const trackUsage = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    action: v.string(),
    metadata: v.optional(v.object({
      toolId: v.optional(v.string()),
      deckId: v.optional(v.string()),
      projectType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identifier = args.userId || args.sessionId;
    if (!identifier) return { success: false };

    await ctx.db.insert("usageTracking", {
      identifier,
      userId: args.userId,
      sessionId: args.sessionId,
      action: args.action,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allTime = await ctx.db
      .query("usageTracking")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const today = Date.now() - 24 * 60 * 60 * 1000;
    const thisWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const todayActions = allTime.filter((a) => a.timestamp > today);
    const weekActions = allTime.filter((a) => a.timestamp > thisWeek);

    const actionCounts: Record<string, number> = {};
    allTime.forEach((a) => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });

    return {
      totalActions: allTime.length,
      todayActions: todayActions.length,
      weekActions: weekActions.length,
      actionBreakdown: actionCounts,
      firstAction: allTime[allTime.length - 1]?.timestamp,
      lastAction: allTime[0]?.timestamp,
    };
  },
});

export const cleanupOldTracking = internalMutation({
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const oldRecords = await ctx.db
      .query("usageTracking")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .take(1000);

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }

    return { deleted: oldRecords.length };
  },
});
