import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ONE_HOUR_MS = 60 * 60 * 1000;

export const sendMessage = mutation({
  args: {
    content: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + ONE_HOUR_MS;

    await ctx.db.insert("globalChatMessages", {
      userId: args.userId,
      username: args.username,
      avatarUrl: args.avatarUrl,
      content: args.content.slice(0, 500),
      createdAt: now,
      expiresAt,
    });
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const messages = await ctx.db
      .query("globalChatMessages")
      .withIndex("by_created")
      .order("desc")
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .take(50);

    return messages.reverse();
  },
});

export const cleanupExpiredMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredMessages = await ctx.db
      .query("globalChatMessages")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .take(100);

    for (const message of expiredMessages) {
      await ctx.db.delete(message._id);
    }

    return { deleted: expiredMessages.length };
  },
});
