import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const notificationTypes = v.union(
  v.literal("achievement_unlocked"),
  v.literal("level_up"),
  v.literal("xp_earned"),
  v.literal("deck_shared"),
  v.literal("battle_result"),
  v.literal("review_response"),
  v.literal("system_announcement"),
  v.literal("tool_update"),
  v.literal("streak_reminder"),
  v.literal("welcome"),
  v.literal("quest_completed")
);

export const list = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    if (args.unreadOnly) {
      notifications = notifications.filter((n) => !n.isRead);
    }

    return notifications;
  },
});

export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    type: notificationTypes,
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.object({
      toolId: v.optional(v.id("tools")),
      achievementId: v.optional(v.id("achievements")),
      deckId: v.optional(v.id("userDecks")),
      battleId: v.optional(v.id("battleHistory")),
      xpAmount: v.optional(v.number()),
      level: v.optional(v.number()),
      link: v.optional(v.string()),
    })),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      metadata: args.metadata,
      icon: args.icon,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }

    return unreadNotifications.length;
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const clearAll = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return notifications.length;
  },
});

export const createWelcomeNotification = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), "welcome"))
      .first();

    if (existing) {
      return null;
    }

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "welcome",
      title: "Welcome to VibeBuff!",
      message: "Start your quest to discover the perfect tech stack. Explore tools, build decks, and level up!",
      icon: "Sparkles",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        link: "/",
      },
    });
  },
});

export const createAchievementNotification = mutation({
  args: {
    userId: v.string(),
    achievementId: v.id("achievements"),
    achievementName: v.string(),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "achievement_unlocked",
      title: "Achievement Unlocked!",
      message: `You earned "${args.achievementName}" and gained ${args.xpReward} XP!`,
      icon: "Trophy",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        achievementId: args.achievementId,
        xpAmount: args.xpReward,
        link: "/profile/achievements",
      },
    });
  },
});

export const createLevelUpNotification = mutation({
  args: {
    userId: v.string(),
    newLevel: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "level_up",
      title: "Level Up!",
      message: `Congratulations! You've reached Level ${args.newLevel}!`,
      icon: "TrendingUp",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        level: args.newLevel,
        link: "/profile",
      },
    });
  },
});

export const createXpNotification = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "xp_earned",
      title: `+${args.amount} XP`,
      message: `You earned XP from: ${args.source}`,
      icon: "Zap",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        xpAmount: args.amount,
      },
    });
  },
});

export const createBattleResultNotification = mutation({
  args: {
    userId: v.string(),
    won: v.boolean(),
    opponentToolName: v.string(),
    battleId: v.id("battleHistory"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "battle_result",
      title: args.won ? "Victory!" : "Defeat",
      message: args.won 
        ? `Your tool defeated ${args.opponentToolName} in battle!`
        : `Your tool was defeated by ${args.opponentToolName}. Try again!`,
      icon: args.won ? "Swords" : "Shield",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        battleId: args.battleId,
        link: "/battle",
      },
    });
  },
});

export const createSystemNotification = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system_announcement",
      title: args.title,
      message: args.message,
      icon: "Bell",
      isRead: false,
      createdAt: Date.now(),
      metadata: args.link ? { link: args.link } : undefined,
    });
  },
});
