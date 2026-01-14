import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

const notificationsValidator = v.object({
  emailDigest: v.boolean(),
  achievementAlerts: v.boolean(),
  weeklyProgress: v.boolean(),
  communityUpdates: v.boolean(),
  battleInvites: v.boolean(),
  newToolAlerts: v.boolean(),
  desktopNotifications: v.boolean(),
});

const privacyValidator = v.object({
  showProfile: v.boolean(),
  showActivity: v.boolean(),
  showDecks: v.boolean(),
  showAchievements: v.boolean(),
  showOnLeaderboard: v.boolean(),
});

const preferencesValidator = v.object({
  theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),
  soundEffects: v.boolean(),
  animations: v.boolean(),
  compactMode: v.boolean(),
});

const DEFAULT_NOTIFICATIONS = {
  emailDigest: true,
  achievementAlerts: true,
  weeklyProgress: true,
  communityUpdates: false,
  battleInvites: true,
  newToolAlerts: true,
  desktopNotifications: false,
};

const DEFAULT_PRIVACY = {
  showProfile: true,
  showActivity: true,
  showDecks: true,
  showAchievements: true,
  showOnLeaderboard: true,
};

const DEFAULT_PREFERENCES = {
  theme: "dark" as const,
  soundEffects: true,
  animations: true,
  compactMode: false,
};

export const getSettings = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let userId = args.userId;
    
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }
      userId = identity.subject;
    }
    
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      return {
        userId,
        displayName: undefined,
        bio: undefined,
        location: undefined,
        website: undefined,
        githubUsername: undefined,
        twitterUsername: undefined,
        notifications: DEFAULT_NOTIFICATIONS,
        privacy: DEFAULT_PRIVACY,
        preferences: DEFAULT_PREFERENCES,
        _id: null,
        createdAt: null,
        updatedAt: null,
      };
    }

    return settings;
  },
});

export const getSettingsByUserId = query({
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
        notifications: DEFAULT_NOTIFICATIONS,
        privacy: DEFAULT_PRIVACY,
        preferences: DEFAULT_PREFERENCES,
        _id: null,
        createdAt: null,
        updatedAt: null,
      };
    }

    return settings;
  },
});

export const saveSettings = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    twitterUsername: v.optional(v.string()),
    notifications: v.optional(notificationsValidator),
    privacy: v.optional(privacyValidator),
    preferences: v.optional(preferencesValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("saveSettings: No identity found, auth failed");
      throw new Error("You must be signed in to save settings");
    }
    console.log("saveSettings: Authenticated as", identity.subject);
    const userId = identity.subject;
    const now = Date.now();
    
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existing) {
      const newSettings = {
        userId,
        displayName: args.displayName,
        bio: args.bio,
        location: args.location,
        website: args.website,
        githubUsername: args.githubUsername,
        twitterUsername: args.twitterUsername,
        notifications: args.notifications ?? DEFAULT_NOTIFICATIONS,
        privacy: args.privacy ?? DEFAULT_PRIVACY,
        preferences: args.preferences ?? DEFAULT_PREFERENCES,
        createdAt: now,
        updatedAt: now,
      };
      console.log("Creating new settings:", JSON.stringify(newSettings));
      const settingsId = await ctx.db.insert("userSettings", newSettings);
      return await ctx.db.get(settingsId);
    }

    const updates: Record<string, unknown> = { updatedAt: now };
    
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.location !== undefined) updates.location = args.location;
    if (args.website !== undefined) updates.website = args.website;
    if (args.githubUsername !== undefined) updates.githubUsername = args.githubUsername;
    if (args.twitterUsername !== undefined) updates.twitterUsername = args.twitterUsername;
    if (args.notifications !== undefined) updates.notifications = args.notifications;
    if (args.privacy !== undefined) updates.privacy = args.privacy;
    if (args.preferences !== undefined) updates.preferences = args.preferences;

    console.log("Updating settings:", JSON.stringify(updates));
    await ctx.db.patch(existing._id, updates);
    return await ctx.db.get(existing._id);
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
