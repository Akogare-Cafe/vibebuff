import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const ONE_HOUR_MS = 60 * 60 * 1000;
const SLOW_MODE_DEFAULT_SECONDS = 3;

export const sendMessage = mutation({
  args: {
    content: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    userId: v.optional(v.string()),
    messageType: v.optional(v.union(
      v.literal("message"),
      v.literal("announcement"),
      v.literal("system")
    )),
    replyToId: v.optional(v.id("globalChatMessages")),
    userLevel: v.optional(v.number()),
    userBadges: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + ONE_HOUR_MS;

    const settings = await ctx.db.query("chatSettings").first();
    
    if (args.userId && settings?.isSlowModeEnabled) {
      const userState = await ctx.db
        .query("chatUserState")
        .withIndex("by_user", (q) => q.eq("oderId", args.userId!))
        .first();

      if (userState) {
        const timeSinceLastMessage = now - userState.lastMessageAt;
        const slowModeMs = (settings.slowModeSeconds || SLOW_MODE_DEFAULT_SECONDS) * 1000;
        
        if (timeSinceLastMessage < slowModeMs) {
          throw new Error(`Slow mode: wait ${Math.ceil((slowModeMs - timeSinceLastMessage) / 1000)}s`);
        }
      }
    }

    if (args.userId) {
      const userState = await ctx.db
        .query("chatUserState")
        .withIndex("by_user", (q) => q.eq("oderId", args.userId!))
        .first();

      if (userState?.isMuted) {
        if (userState.mutedUntil && userState.mutedUntil > now) {
          throw new Error("You are muted from chat");
        }
      }
    }

    let replyToUsername: string | undefined;
    let replyToContent: string | undefined;

    if (args.replyToId) {
      const replyMessage = await ctx.db.get(args.replyToId);
      if (replyMessage && !replyMessage.isDeleted) {
        replyToUsername = replyMessage.username;
        replyToContent = replyMessage.content.slice(0, 100);
      }
    }

    const messageId = await ctx.db.insert("globalChatMessages", {
      userId: args.userId,
      username: args.username,
      avatarUrl: args.avatarUrl,
      content: args.content.slice(0, 500),
      createdAt: now,
      expiresAt,
      messageType: args.messageType || "message",
      replyToId: args.replyToId,
      replyToUsername,
      replyToContent,
      userLevel: args.userLevel,
      userBadges: args.userBadges,
      isDeleted: false,
    });

    if (args.userId) {
      const userState = await ctx.db
        .query("chatUserState")
        .withIndex("by_user", (q) => q.eq("oderId", args.userId!))
        .first();

      if (userState) {
        await ctx.db.patch(userState._id, {
          lastMessageAt: now,
          messageCount: userState.messageCount + 1,
        });
      } else {
        await ctx.db.insert("chatUserState", {
          oderId: args.userId,
          lastMessageAt: now,
          isMuted: false,
          messageCount: 1,
        });
      }
    }

    return messageId;
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
      .filter((q) => 
        q.and(
          q.gt(q.field("expiresAt"), now),
          q.neq(q.field("isDeleted"), true)
        )
      )
      .take(100);

    return messages.reverse();
  },
});

export const getChatSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("chatSettings").first();
    return settings || {
      slowModeSeconds: SLOW_MODE_DEFAULT_SECONDS,
      isSlowModeEnabled: false,
      subscriberOnlyMode: false,
      emoteOnlyMode: false,
      minLevelToChat: 0,
    };
  },
});

export const getOnlineCount = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const recentUsers = await ctx.db
      .query("chatUserState")
      .filter((q) => q.gt(q.field("lastMessageAt"), fiveMinutesAgo))
      .collect();

    return recentUsers.length;
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("globalChatMessages"),
    emoji: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions || [];
    const existingReaction = reactions.find((r) => r.emoji === args.emoji);

    if (existingReaction) {
      if (existingReaction.userIds.includes(args.userId)) {
        existingReaction.userIds = existingReaction.userIds.filter(
          (id) => id !== args.userId
        );
        if (existingReaction.userIds.length === 0) {
          const index = reactions.indexOf(existingReaction);
          reactions.splice(index, 1);
        }
      } else {
        existingReaction.userIds.push(args.userId);
      }
    } else {
      reactions.push({
        emoji: args.emoji,
        userIds: [args.userId],
      });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("globalChatMessages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.userId !== args.userId) {
      throw new Error("Can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const updateChatSettings = mutation({
  args: {
    slowModeSeconds: v.optional(v.number()),
    isSlowModeEnabled: v.optional(v.boolean()),
    subscriberOnlyMode: v.optional(v.boolean()),
    emoteOnlyMode: v.optional(v.boolean()),
    minLevelToChat: v.optional(v.number()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("chatSettings").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("chatSettings", {
        slowModeSeconds: args.slowModeSeconds ?? SLOW_MODE_DEFAULT_SECONDS,
        isSlowModeEnabled: args.isSlowModeEnabled ?? false,
        subscriberOnlyMode: args.subscriberOnlyMode ?? false,
        emoteOnlyMode: args.emoteOnlyMode ?? false,
        minLevelToChat: args.minLevelToChat ?? 0,
        updatedAt: now,
        updatedBy: args.updatedBy,
      });
    }
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
