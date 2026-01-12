import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export const heartbeat = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();

    if (identity) {
      const userId = identity.subject;
      const existing = await ctx.db
        .query("userPresence")
        .withIndex("by_user", (q) => q.eq("oderId", userId))
        .first();

      if (existing) {
        await ctx.db.replace(existing._id, {
          oderId: userId,
          sessionId: existing.sessionId,
          lastSeen: now,
          isOnline: true,
          isAuthenticated: true,
        });
      } else {
        await ctx.db.insert("userPresence", {
          oderId: userId,
          lastSeen: now,
          isOnline: true,
          isAuthenticated: true,
        });
      }
      return { success: true, type: "authenticated" };
    }

    if (args.sessionId) {
      const existing = await ctx.db
        .query("userPresence")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();

      if (existing) {
        await ctx.db.replace(existing._id, {
          oderId: existing.oderId,
          sessionId: args.sessionId,
          lastSeen: now,
          isOnline: true,
          isAuthenticated: false,
        });
      } else {
        await ctx.db.insert("userPresence", {
          oderId: `anon_${args.sessionId}`,
          sessionId: args.sessionId,
          lastSeen: now,
          isOnline: true,
          isAuthenticated: false,
        });
      }
      return { success: true, type: "anonymous" };
    }

    return { success: false };
  },
});

export const setOffline = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const userId = identity.subject;
      const existing = await ctx.db
        .query("userPresence")
        .withIndex("by_user", (q) => q.eq("oderId", userId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          isOnline: false,
        });
      }
      return { success: true };
    }

    if (args.sessionId) {
      const existing = await ctx.db
        .query("userPresence")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          isOnline: false,
        });
      }
      return { success: true };
    }

    return { success: false };
  },
});

export const getOnlineCount = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threshold = now - ONLINE_THRESHOLD_MS;

    const onlineUsers = await ctx.db
      .query("userPresence")
      .withIndex("by_online", (q) => q.eq("isOnline", true))
      .collect();

    const activeUsers = onlineUsers.filter(
      (user) => user.lastSeen > threshold
    );

    return {
      count: activeUsers.length,
      threshold: ONLINE_THRESHOLD_MS,
    };
  },
});

export const cleanupStalePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threshold = now - ONLINE_THRESHOLD_MS;

    const staleUsers = await ctx.db
      .query("userPresence")
      .withIndex("by_online", (q) => q.eq("isOnline", true))
      .collect();

    let cleaned = 0;
    for (const user of staleUsers) {
      if (user.lastSeen < threshold) {
        await ctx.db.patch(user._id, { isOnline: false });
        cleaned++;
      }
    }

    return { cleaned };
  },
});
