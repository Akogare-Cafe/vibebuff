import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CURSOR_TIMEOUT = 10000;

export const updateCursor = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userAvatar: v.optional(v.string()),
    x: v.number(),
    y: v.number(),
    page: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("liveCursors")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        userName: args.userName,
        userAvatar: args.userAvatar,
        x: args.x,
        y: args.y,
        page: args.page,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("liveCursors", {
        sessionId: args.sessionId,
        userId: args.userId,
        userName: args.userName,
        userAvatar: args.userAvatar,
        x: args.x,
        y: args.y,
        page: args.page,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getActiveCursors = query({
  args: {
    page: v.string(),
    excludeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - CURSOR_TIMEOUT;
    
    const cursors = await ctx.db
      .query("liveCursors")
      .withIndex("by_page", (q) => q.eq("page", args.page))
      .filter((q) => q.gte(q.field("lastUpdated"), cutoffTime))
      .collect();

    const filtered = cursors.filter(
      (cursor) => cursor.sessionId !== args.excludeSessionId
    );

    return filtered.map((cursor) => ({
      sessionId: cursor.sessionId,
      userId: cursor.userId,
      userName: cursor.userName,
      userAvatar: cursor.userAvatar,
      x: cursor.x,
      y: cursor.y,
    }));
  },
});

export const removeCursor = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const cursor = await ctx.db
      .query("liveCursors")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (cursor) {
      await ctx.db.delete(cursor._id);
    }
  },
});

export const cleanupOldCursors = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoffTime = Date.now() - CURSOR_TIMEOUT;
    
    const oldCursors = await ctx.db
      .query("liveCursors")
      .withIndex("by_last_updated")
      .filter((q) => q.lt(q.field("lastUpdated"), cutoffTime))
      .collect();

    for (const cursor of oldCursors) {
      await ctx.db.delete(cursor._id);
    }

    return { deleted: oldCursors.length };
  },
});
