import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

const DEFAULT_SETTINGS = {
  notifications: {
    emailDigest: true,
    achievementAlerts: true,
    weeklyProgress: true,
    communityUpdates: false,
    battleInvites: true,
    newToolAlerts: true,
    desktopNotifications: false,
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
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    twitterUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to update your profile");
    }
    
    try {
      const userId = identity.subject;
      console.log("updateProfile called by user:", userId);
      console.log("updateProfile args:", args);
      
      // Filter out undefined values to only update provided fields
      const updates: Record<string, string> = {};
      if (args.displayName !== undefined) updates.displayName = args.displayName;
      if (args.bio !== undefined) updates.bio = args.bio;
      if (args.location !== undefined) updates.location = args.location;
      if (args.website !== undefined) updates.website = args.website;
      if (args.githubUsername !== undefined) updates.githubUsername = args.githubUsername;
      if (args.twitterUsername !== undefined) updates.twitterUsername = args.twitterUsername;
      
      let settings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!settings) {
        console.log("Creating new settings for user:", userId);
        const now = Date.now();
        const settingsId = await ctx.db.insert("userSettings", {
          userId,
          ...DEFAULT_SETTINGS,
          displayName: args.displayName,
          bio: args.bio,
          location: args.location,
          website: args.website,
          githubUsername: args.githubUsername,
          twitterUsername: args.twitterUsername,
          createdAt: now,
          updatedAt: now,
        });
        const newSettings = await ctx.db.get(settingsId);
        console.log("Created new settings:", settingsId);
        return newSettings;
      }

      console.log("Updating existing settings:", settings._id);
      await ctx.db.patch(settings._id, {
        ...updates,
        updatedAt: Date.now(),
      });

      const updatedSettings = await ctx.db.get(settings._id);
      console.log("Updated settings successfully");
      return updatedSettings;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  },
});

export const updateNotifications = mutation({
  args: {
    notifications: v.object({
      emailDigest: v.boolean(),
      achievementAlerts: v.boolean(),
      weeklyProgress: v.boolean(),
      communityUpdates: v.boolean(),
      battleInvites: v.boolean(),
      newToolAlerts: v.boolean(),
      desktopNotifications: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId,
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
    privacy: v.object({
      showProfile: v.boolean(),
      showActivity: v.boolean(),
      showDecks: v.boolean(),
      showAchievements: v.boolean(),
      showOnLeaderboard: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId,
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
    preferences: v.object({
      theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),
      soundEffects: v.boolean(),
      animations: v.boolean(),
      compactMode: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      const now = Date.now();
      const settingsId = await ctx.db.insert("userSettings", {
        userId,
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
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (settings) {
      await ctx.db.delete(settings._id);
    }

    return { success: true };
  },
});
