import { v } from "convex/values";
import { query } from "./_generated/server";

export const getXpLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const sorted = profiles
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);

    return sorted.map((profile, index) => ({
      rank: index + 1,
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      xp: profile.xp,
      title: profile.title,
    }));
  },
});

export const getBattlesLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const sorted = profiles
      .sort((a, b) => b.battlesWon - a.battlesWon)
      .slice(0, limit);

    return sorted.map((profile, index) => ({
      rank: index + 1,
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      battlesWon: profile.battlesWon,
      battlesLost: profile.battlesLost,
      winRate: profile.battlesWon + profile.battlesLost > 0
        ? Math.round((profile.battlesWon / (profile.battlesWon + profile.battlesLost)) * 100)
        : 0,
      title: profile.title,
    }));
  },
});

export const getDecksLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const sorted = profiles
      .sort((a, b) => b.decksCreated - a.decksCreated)
      .slice(0, limit);

    return sorted.map((profile, index) => ({
      rank: index + 1,
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      decksCreated: profile.decksCreated,
      title: profile.title,
    }));
  },
});

export const getMasteryLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const masteries = await ctx.db
      .query("toolMastery")
      .collect();

    const userMasteryXp: Record<string, number> = {};
    const userToolCount: Record<string, number> = {};

    for (const mastery of masteries) {
      if (!userMasteryXp[mastery.userId]) {
        userMasteryXp[mastery.userId] = 0;
        userToolCount[mastery.userId] = 0;
      }
      userMasteryXp[mastery.userId] += mastery.xp;
      userToolCount[mastery.userId]++;
    }

    const userIds = Object.keys(userMasteryXp);
    const usersWithProfiles = await Promise.all(
      userIds.map(async (userId) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
          .first();

        return {
          clerkId: userId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
          masteryXp: userMasteryXp[userId],
          toolsMastered: userToolCount[userId],
        };
      })
    );

    const sorted = usersWithProfiles
      .filter((u) => u.username)
      .sort((a, b) => b.masteryXp - a.masteryXp)
      .slice(0, limit);

    return sorted.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  },
});

export const getStreakLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const streaks = await ctx.db
      .query("userStreaks")
      .collect();

    const streaksWithProfiles = await Promise.all(
      streaks.map(async (streak) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", streak.userId))
          .first();

        return {
          clerkId: streak.userId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        };
      })
    );

    const sorted = streaksWithProfiles
      .filter((u) => u.username)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit);

    return sorted.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  },
});

export const getReviewsLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const reviews = await ctx.db
      .query("toolReviews")
      .collect();

    const userReviewCount: Record<string, number> = {};
    const userHelpfulVotes: Record<string, number> = {};

    for (const review of reviews) {
      if (!userReviewCount[review.userId]) {
        userReviewCount[review.userId] = 0;
        userHelpfulVotes[review.userId] = 0;
      }
      userReviewCount[review.userId]++;
      userHelpfulVotes[review.userId] += review.helpfulVotes;
    }

    const userIds = Object.keys(userReviewCount);
    const usersWithProfiles = await Promise.all(
      userIds.map(async (userId) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
          .first();

        return {
          clerkId: userId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
          reviewCount: userReviewCount[userId],
          helpfulVotes: userHelpfulVotes[userId],
        };
      })
    );

    const sorted = usersWithProfiles
      .filter((u) => u.username)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit);

    return sorted.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  },
});

export const getUserRankings = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!profile) return null;

    const allProfiles = await ctx.db
      .query("userProfiles")
      .collect();

    const xpRank = allProfiles
      .sort((a, b) => b.xp - a.xp)
      .findIndex((p) => p.clerkId === args.userId) + 1;

    const battlesRank = allProfiles
      .sort((a, b) => b.battlesWon - a.battlesWon)
      .findIndex((p) => p.clerkId === args.userId) + 1;

    const decksRank = allProfiles
      .sort((a, b) => b.decksCreated - a.decksCreated)
      .findIndex((p) => p.clerkId === args.userId) + 1;

    return {
      totalUsers: allProfiles.length,
      xp: {
        rank: xpRank,
        value: profile.xp,
        percentile: Math.round(((allProfiles.length - xpRank) / allProfiles.length) * 100),
      },
      battles: {
        rank: battlesRank,
        value: profile.battlesWon,
        percentile: Math.round(((allProfiles.length - battlesRank) / allProfiles.length) * 100),
      },
      decks: {
        rank: decksRank,
        value: profile.decksCreated,
        percentile: Math.round(((allProfiles.length - decksRank) / allProfiles.length) * 100),
      },
    };
  },
});

export const getToolsViewedLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const sorted = profiles
      .sort((a, b) => b.toolsViewed - a.toolsViewed)
      .slice(0, limit);

    return sorted.map((profile, index) => ({
      rank: index + 1,
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      toolsViewed: profile.toolsViewed,
      title: profile.title,
    }));
  },
});

export const getVotesCastLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const sorted = profiles
      .sort((a, b) => b.votescast - a.votescast)
      .slice(0, limit);

    return sorted.map((profile, index) => ({
      rank: index + 1,
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      votescast: profile.votescast,
      title: profile.title,
    }));
  },
});

export const getTopUsers = query({
  args: {
    category: v.union(
      v.literal("xp"),
      v.literal("battles"),
      v.literal("decks")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    let sorted;
    switch (args.category) {
      case "xp":
        sorted = profiles.sort((a, b) => b.xp - a.xp);
        break;
      case "battles":
        sorted = profiles.sort((a, b) => b.battlesWon - a.battlesWon);
        break;
      case "decks":
        sorted = profiles.sort((a, b) => b.decksCreated - a.decksCreated);
        break;
    }

    return sorted.slice(0, limit).map((profile, index) => ({
      rank: index + 1,
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      xp: profile.xp,
      battlesWon: profile.battlesWon,
      decksCreated: profile.decksCreated,
      title: profile.title,
    }));
  },
});
