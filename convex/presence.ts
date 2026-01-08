import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query("userPresence")
      .withIndex("by_user", (q) => q.eq("oderId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: now,
        isOnline: true,
      });
    } else {
      await ctx.db.insert("userPresence", {
        oderId: userId,
        lastSeen: now,
        isOnline: true,
      });
    }

    return { success: true };
  },
});

export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

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
