import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get active season
export const getActiveSeason = query({
  args: {},
  handler: async (ctx) => {
    const season = await ctx.db
      .query("seasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (!season) return null;

    const rewards = await ctx.db
      .query("battlePassRewards")
      .withIndex("by_season", (q) => q.eq("seasonId", season._id))
      .collect();

    // Group rewards by level
    const rewardsByLevel: Record<number, typeof rewards> = {};
    for (const reward of rewards) {
      if (!rewardsByLevel[reward.level]) {
        rewardsByLevel[reward.level] = [];
      }
      rewardsByLevel[reward.level].push(reward);
    }

    return { ...season, rewardsByLevel };
  },
});

// Get user's season progress
export const getUserProgress = query({
  args: { userId: v.string(), seasonId: v.optional(v.id("seasons")) },
  handler: async (ctx, args) => {
    let seasonId = args.seasonId;

    if (!seasonId) {
      const activeSeason = await ctx.db
        .query("seasons")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .first();
      if (!activeSeason) return null;
      seasonId = activeSeason._id;
    }

    const progress = await ctx.db
      .query("userSeasonProgress")
      .withIndex("by_user_season", (q) =>
        q.eq("userId", args.userId).eq("seasonId", seasonId!)
      )
      .first();

    if (!progress) {
      return {
        xp: 0,
        level: 1,
        isPremium: false,
        claimedRewards: [],
        seasonId,
      };
    }

    return progress;
  },
});

// Add XP to battle pass
export const addXp = mutation({
  args: {
    userId: v.string(),
    xp: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const activeSeason = await ctx.db
      .query("seasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (!activeSeason) return { success: false, reason: "No active season" };

    let progress = await ctx.db
      .query("userSeasonProgress")
      .withIndex("by_user_season", (q) =>
        q.eq("userId", args.userId).eq("seasonId", activeSeason._id)
      )
      .first();

    if (!progress) {
      // Create new progress
      await ctx.db.insert("userSeasonProgress", {
        userId: args.userId,
        seasonId: activeSeason._id,
        xp: args.xp,
        level: 1,
        isPremium: false,
        claimedRewards: [],
      });
      return { success: true, newXp: args.xp, newLevel: 1, leveledUp: false };
    }

    const newXp = progress.xp + args.xp;
    const newLevel = Math.min(
      activeSeason.maxLevel,
      Math.floor(newXp / activeSeason.xpPerLevel) + 1
    );
    const leveledUp = newLevel > progress.level;

    await ctx.db.patch(progress._id, {
      xp: newXp,
      level: newLevel,
    });

    return { success: true, newXp, newLevel, leveledUp };
  },
});

// Claim reward
export const claimReward = mutation({
  args: {
    userId: v.string(),
    seasonId: v.id("seasons"),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userSeasonProgress")
      .withIndex("by_user_season", (q) =>
        q.eq("userId", args.userId).eq("seasonId", args.seasonId)
      )
      .first();

    if (!progress) throw new Error("No progress found");
    if (progress.level < args.level) throw new Error("Level not reached");
    if (progress.claimedRewards.includes(args.level)) {
      throw new Error("Reward already claimed");
    }

    // Get rewards for this level
    const rewards = await ctx.db
      .query("battlePassRewards")
      .withIndex("by_season_level", (q) =>
        q.eq("seasonId", args.seasonId).eq("level", args.level)
      )
      .collect();

    // Filter by track (free or premium)
    const availableRewards = rewards.filter(
      (r) => r.track === "free" || progress.isPremium
    );

    if (availableRewards.length === 0) {
      throw new Error("No rewards available at this level");
    }

    // Mark as claimed
    await ctx.db.patch(progress._id, {
      claimedRewards: [...progress.claimedRewards, args.level],
    });

    return { rewards: availableRewards };
  },
});

// Upgrade to premium
export const upgradeToPremium = mutation({
  args: { userId: v.string(), seasonId: v.id("seasons") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userSeasonProgress")
      .withIndex("by_user_season", (q) =>
        q.eq("userId", args.userId).eq("seasonId", args.seasonId)
      )
      .first();

    if (!progress) {
      await ctx.db.insert("userSeasonProgress", {
        userId: args.userId,
        seasonId: args.seasonId,
        xp: 0,
        level: 1,
        isPremium: true,
        claimedRewards: [],
      });
    } else {
      await ctx.db.patch(progress._id, { isPremium: true });
    }
  },
});

// Seed a season
export const seedSeason = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    // Check if active season exists
    const existing = await ctx.db
      .query("seasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (existing) return { message: "Season already exists" };

    const seasonId = await ctx.db.insert("seasons", {
      slug: "season-1-ai-winter",
      name: "Season 1: AI Winter",
      theme: "ai",
      description: "The age of AI tools is upon us. Master the new frontier!",
      startDate: now,
      endDate: now + monthMs,
      isActive: true,
      maxLevel: 50,
      xpPerLevel: 1000,
    });

    // Create rewards
    const rewards = [
      // Free track
      { level: 1, track: "free" as const, rewardType: "xp_boost" as const, rewardValue: "100", rewardIcon: "Zap" },
      { level: 5, track: "free" as const, rewardType: "badge" as const, rewardValue: "Sprout", rewardIcon: "Sprout" },
      { level: 10, track: "free" as const, rewardType: "title" as const, rewardValue: "AI Explorer", rewardIcon: "Bot" },
      { level: 15, track: "free" as const, rewardType: "xp_boost" as const, rewardValue: "500", rewardIcon: "Zap" },
      { level: 20, track: "free" as const, rewardType: "badge" as const, rewardValue: "Target", rewardIcon: "Target" },
      { level: 25, track: "free" as const, rewardType: "pack" as const, rewardValue: "premium-pack", rewardIcon: "Package" },
      { level: 30, track: "free" as const, rewardType: "title" as const, rewardValue: "Stack Architect", rewardIcon: "Layers" },
      { level: 40, track: "free" as const, rewardType: "badge" as const, rewardValue: "Star", rewardIcon: "Star" },
      { level: 50, track: "free" as const, rewardType: "title" as const, rewardValue: "Season 1 Champion", rewardIcon: "Trophy" },
      // Premium track
      { level: 1, track: "premium" as const, rewardType: "profile_frame" as const, rewardValue: "ai-frame", rewardIcon: "Frame" },
      { level: 5, track: "premium" as const, rewardType: "xp_boost" as const, rewardValue: "250", rewardIcon: "Zap" },
      { level: 10, track: "premium" as const, rewardType: "badge" as const, rewardValue: "Gem", rewardIcon: "Gem" },
      { level: 15, track: "premium" as const, rewardType: "pack" as const, rewardValue: "legendary-pack", rewardIcon: "Package" },
      { level: 20, track: "premium" as const, rewardType: "title" as const, rewardValue: "AI Whisperer", rewardIcon: "Bot" },
      { level: 25, track: "premium" as const, rewardType: "exclusive_tool_skin" as const, rewardValue: "holographic", rewardIcon: "Sparkles" },
      { level: 30, track: "premium" as const, rewardType: "xp_boost" as const, rewardValue: "1000", rewardIcon: "Zap" },
      { level: 40, track: "premium" as const, rewardType: "profile_frame" as const, rewardValue: "legendary-frame", rewardIcon: "Frame" },
      { level: 50, track: "premium" as const, rewardType: "title" as const, rewardValue: "Season 1 Legend", rewardIcon: "Crown" },
    ];

    for (const reward of rewards) {
      await ctx.db.insert("battlePassRewards", {
        seasonId,
        ...reward,
      });
    }

    return { seasonId, rewardsCreated: rewards.length };
  },
});
