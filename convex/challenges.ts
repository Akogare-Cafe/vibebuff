import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get active challenges
export const getActiveChallenges = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const challenges = await ctx.db
      .query("challenges")
      .filter((q) =>
        q.and(
          q.lte(q.field("activeFrom"), now),
          q.gte(q.field("activeUntil"), now)
        )
      )
      .collect();

    return challenges;
  },
});

// Get user's challenge progress
export const getUserChallengeProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userChallengeProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get challenge details for each progress entry
    const progressWithDetails = await Promise.all(
      progress.map(async (p) => {
        const challenge = await ctx.db.get(p.challengeId);
        return { ...p, challenge };
      })
    );

    return progressWithDetails;
  },
});

// Get active challenges with user progress
export const getActiveChallengesWithProgress = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const challenges = await ctx.db
      .query("challenges")
      .filter((q) =>
        q.and(
          q.lte(q.field("activeFrom"), now),
          q.gte(q.field("activeUntil"), now)
        )
      )
      .collect();

    if (!args.userId) {
      return challenges.map((c) => ({ ...c, progress: null, isCompleted: false, isClaimed: false }));
    }

    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const progress = await ctx.db
          .query("userChallengeProgress")
          .withIndex("by_user_challenge", (q) =>
            q.eq("userId", args.userId!).eq("challengeId", challenge._id)
          )
          .first();

        return {
          ...challenge,
          progress: progress?.progress || 0,
          isCompleted: !!progress?.completedAt,
          isClaimed: !!progress?.claimedAt,
        };
      })
    );

    return challengesWithProgress;
  },
});

// Update challenge progress
export const updateProgress = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
    increment: v.number(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const existing = await ctx.db
      .query("userChallengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .first();

    const newProgress = (existing?.progress || 0) + args.increment;
    const isCompleted = newProgress >= challenge.requirement.target;

    if (existing) {
      await ctx.db.patch(existing._id, {
        progress: newProgress,
        completedAt: isCompleted && !existing.completedAt ? Date.now() : existing.completedAt,
      });
    } else {
      await ctx.db.insert("userChallengeProgress", {
        userId: args.userId,
        challengeId: args.challengeId,
        progress: newProgress,
        completedAt: isCompleted ? Date.now() : undefined,
      });
    }

    return { newProgress, isCompleted };
  },
});

// Claim challenge reward
export const claimReward = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const progress = await ctx.db
      .query("userChallengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .first();

    if (!progress || !progress.completedAt) {
      throw new Error("Challenge not completed");
    }

    if (progress.claimedAt) {
      throw new Error("Reward already claimed");
    }

    // Mark as claimed
    await ctx.db.patch(progress._id, { claimedAt: Date.now() });

    // Award XP to user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      const newXp = profile.xp + challenge.rewards.xp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await ctx.db.patch(profile._id, {
        xp: newXp,
        level: newLevel,
        title: challenge.rewards.title || profile.title,
      });
    }

    return { xpAwarded: challenge.rewards.xp, badge: challenge.rewards.badge };
  },
});

// Seed initial challenges
export const seedChallenges = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    const challenges = [
      // Daily Challenges
      {
        slug: "daily-explorer",
        title: "Tool Explorer",
        description: "View 5 different tools today",
        type: "daily" as const,
        category: "exploration" as const,
        requirement: { type: "view_tools", target: 5 },
        rewards: { xp: 50 },
        activeFrom: now,
        activeUntil: now + dayMs,
        difficulty: "easy" as const,
      },
      {
        slug: "daily-battler",
        title: "Arena Warrior",
        description: "Win 3 tool battles",
        type: "daily" as const,
        category: "battle" as const,
        requirement: { type: "win_battles", target: 3 },
        rewards: { xp: 75 },
        activeFrom: now,
        activeUntil: now + dayMs,
        difficulty: "medium" as const,
      },
      {
        slug: "daily-builder",
        title: "Stack Architect",
        description: "Create a deck with at least 5 tools",
        type: "daily" as const,
        category: "building" as const,
        requirement: { type: "create_deck", target: 1, conditions: { minTools: 5 } },
        rewards: { xp: 100 },
        activeFrom: now,
        activeUntil: now + dayMs,
        difficulty: "medium" as const,
      },
      // Weekly Challenges
      {
        slug: "weekly-budget-master",
        title: "Budget Master",
        description: "Create a complete stack under $50/month",
        type: "weekly" as const,
        category: "building" as const,
        requirement: { type: "create_deck_budget", target: 1, conditions: { maxBudget: 50 } },
        rewards: { xp: 500, badge: "Coins" },
        activeFrom: now,
        activeUntil: now + weekMs,
        difficulty: "hard" as const,
      },
      {
        slug: "weekly-open-source-hero",
        title: "Open Source Hero",
        description: "Build a stack using only open-source tools",
        type: "weekly" as const,
        category: "building" as const,
        requirement: { type: "create_deck_oss", target: 1, conditions: { openSourceOnly: true } },
        rewards: { xp: 750, badge: "Star", title: "Open Source Champion" },
        activeFrom: now,
        activeUntil: now + weekMs,
        difficulty: "legendary" as const,
      },
      {
        slug: "weekly-battle-champion",
        title: "Battle Champion",
        description: "Win 10 tool battles this week",
        type: "weekly" as const,
        category: "battle" as const,
        requirement: { type: "win_battles", target: 10 },
        rewards: { xp: 400, badge: "Swords" },
        activeFrom: now,
        activeUntil: now + weekMs,
        difficulty: "hard" as const,
      },
    ];

    for (const challenge of challenges) {
      const existing = await ctx.db
        .query("challenges")
        .withIndex("by_slug", (q) => q.eq("slug", challenge.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("challenges", challenge);
      }
    }

    return { seeded: challenges.length };
  },
});
