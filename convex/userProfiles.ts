import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create user profile
export const getOrCreateProfile = mutation({
  args: {
    clerkId: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update avatar if provided
      if (args.avatarUrl && args.avatarUrl !== existing.avatarUrl) {
        await ctx.db.patch(existing._id, { avatarUrl: args.avatarUrl });
      }
      return existing;
    }

    // Create new profile
    const profileId = await ctx.db.insert("userProfiles", {
      clerkId: args.clerkId,
      username: args.username,
      avatarUrl: args.avatarUrl,
      xp: 0,
      level: 1,
      title: "Novice Developer",
      toolsViewed: 0,
      battlesWon: 0,
      battlesLost: 0,
      decksCreated: 0,
      questsCompleted: 0,
      votescast: 0,
    });

    await ctx.db.insert("notifications", {
      userId: args.clerkId,
      type: "welcome",
      title: "Welcome to VibeBuff!",
      message: "Start your quest to discover the perfect tech stack. Explore tools, build decks, and level up!",
      icon: "Sparkles",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        link: "/quest",
      },
    });

    return await ctx.db.get(profileId);
  },
});

// Get user profile
export const getProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Update profile
export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    username: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile) return null;

    const updates: Record<string, any> = {};
    if (args.username !== undefined) updates.username = args.username;
    if (args.title !== undefined) updates.title = args.title;

    await ctx.db.patch(profile._id, updates);
    return await ctx.db.get(profile._id);
  },
});

// Add XP to user
export const addXp = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile) return null;

    const newXp = profile.xp + args.amount;
    const newLevel = Math.floor(newXp / 1000) + 1;

    // Update title based on level
    let newTitle = profile.title;
    if (newLevel >= 50) newTitle = "Legendary Architect";
    else if (newLevel >= 30) newTitle = "Master Developer";
    else if (newLevel >= 20) newTitle = "Senior Engineer";
    else if (newLevel >= 10) newTitle = "Stack Specialist";
    else if (newLevel >= 5) newTitle = "Tool Explorer";
    else if (newLevel >= 2) newTitle = "Apprentice Coder";

    await ctx.db.patch(profile._id, {
      xp: newXp,
      level: newLevel,
      title: newTitle,
    });

    return { newXp, newLevel, leveledUp: newLevel > profile.level };
  },
});

// Increment a stat
export const incrementStat = mutation({
  args: {
    clerkId: v.string(),
    stat: v.union(
      v.literal("toolsViewed"),
      v.literal("battlesWon"),
      v.literal("battlesLost"),
      v.literal("decksCreated"),
      v.literal("questsCompleted"),
      v.literal("votescast")
    ),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile) return null;

    const currentValue = profile[args.stat] as number;
    await ctx.db.patch(profile._id, {
      [args.stat]: currentValue + 1,
    });

    return currentValue + 1;
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: { 
    sortBy: v.optional(v.union(
      v.literal("xp"),
      v.literal("level"),
      v.literal("battlesWon"),
      v.literal("decksCreated")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").collect();

    const sortField = args.sortBy || "xp";
    const sorted = profiles.sort((a, b) => {
      const aVal = a[sortField] as number;
      const bVal = b[sortField] as number;
      return bVal - aVal;
    });

    return sorted.slice(0, args.limit || 10).map((profile, index) => ({
      rank: index + 1,
      ...profile,
    }));
  },
});

// Get user's rank
export const getUserRank = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    const sorted = profiles.sort((a, b) => b.xp - a.xp);
    
    const userIndex = sorted.findIndex((p) => p.clerkId === args.clerkId);
    if (userIndex === -1) return null;

    return {
      rank: userIndex + 1,
      totalUsers: profiles.length,
      percentile: Math.round(((profiles.length - userIndex) / profiles.length) * 100),
    };
  },
});
