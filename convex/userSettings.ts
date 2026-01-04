import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SETTINGS = {
  notifications: {
    emailDigest: true,
    achievementAlerts: true,
    weeklyProgress: true,
    communityUpdates: false,
    battleInvites: true,
  },
  privacy: {
    showProfile: true,
    showActivity: true,
    showDecks: true,
    showAchievements: true,
    showOnLeaderboard: true,
  },
  preferences: {
    theme: "dark" as const,
    soundEffects: true,
    animations: true,
    compactMode: false,
  },
};

export const getSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      return {
        userId: args.userId,
        displayName: undefined,
        bio: undefined,
        location: undefined,
        website: undefined,
        githubUsername: undefined,
        twitterUsername: undefined,
        ...DEFAULT_SETTINGS,
        _id: null,
      };
    }

    return settings;
  },
});

export const getOrCreateSettings = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();
    const settingsId = await ctx.db.insert("userSettings", {
      userId: args.userId,
      ...DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(settingsId);
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    twitterUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId,
        ...DEFAULT_SETTINGS,
        ...updates,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(settingsId);
    }

    await ctx.db.patch(settings._id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(settings._id);
  },
});

export const updateNotifications = mutation({
  args: {
    userId: v.string(),
    notifications: v.object({
      emailDigest: v.boolean(),
      achievementAlerts: v.boolean(),
      weeklyProgress: v.boolean(),
      communityUpdates: v.boolean(),
      battleInvites: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId: args.userId,
        ...DEFAULT_SETTINGS,
        notifications: args.notifications,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(settingsId);
    }

    await ctx.db.patch(settings._id, {
      notifications: args.notifications,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(settings._id);
  },
});

export const updatePrivacy = mutation({
  args: {
    userId: v.string(),
    privacy: v.object({
      showProfile: v.boolean(),
      showActivity: v.boolean(),
      showDecks: v.boolean(),
      showAchievements: v.boolean(),
      showOnLeaderboard: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId: args.userId,
        ...DEFAULT_SETTINGS,
        privacy: args.privacy,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(settingsId);
    }

    await ctx.db.patch(settings._id, {
      privacy: args.privacy,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(settings._id);
  },
});

export const updatePreferences = mutation({
  args: {
    userId: v.string(),
    preferences: v.object({
      theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),
      soundEffects: v.boolean(),
      animations: v.boolean(),
      compactMode: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId: args.userId,
        ...DEFAULT_SETTINGS,
        preferences: args.preferences,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(settingsId);
    }

    await ctx.db.patch(settings._id, {
      preferences: args.preferences,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(settings._id);
  },
});

export const deleteAccount = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (settings) {
      await ctx.db.delete(settings._id);
    }

    return { success: true };
  },
});
