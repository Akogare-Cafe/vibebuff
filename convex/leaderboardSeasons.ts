import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveSeason = query({
  args: { leaderboardType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const seasons = await ctx.db
      .query("leaderboardSeasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (args.leaderboardType) {
      return seasons.find((s) => s.leaderboardType === args.leaderboardType) ?? null;
    }

    return seasons[0] ?? null;
  },
});

export const getAllActiveSeasons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("leaderboardSeasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getSeasonLeaderboard = query({
  args: { seasonId: v.id("leaderboardSeasons"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const rankings = await ctx.db
      .query("seasonalRankings")
      .withIndex("by_season_score", (q) => q.eq("seasonId", args.seasonId))
      .order("desc")
      .take(args.limit ?? 100);

    const userIds = rankings.map((r) => r.userId);
    const profiles = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );
    const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.clerkId, p]));

    return rankings.map((ranking, index) => ({
      ...ranking,
      rank: index + 1,
      user: profileMap.get(ranking.userId),
      movement: ranking.previousRank ? ranking.previousRank - (index + 1) : 0,
    }));
  },
});

export const getUserSeasonRank = query({
  args: { userId: v.string(), seasonId: v.id("leaderboardSeasons") },
  handler: async (ctx, args) => {
    const ranking = await ctx.db
      .query("seasonalRankings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("seasonId"), args.seasonId))
      .first();

    if (!ranking) return null;

    const allRankings = await ctx.db
      .query("seasonalRankings")
      .withIndex("by_season_score", (q) => q.eq("seasonId", args.seasonId))
      .order("desc")
      .collect();

    const currentRank = allRankings.findIndex((r) => r.userId === args.userId) + 1;

    return {
      ...ranking,
      currentRank,
      movement: ranking.previousRank ? ranking.previousRank - currentRank : 0,
    };
  },
});

export const updateSeasonScore = mutation({
  args: {
    userId: v.string(),
    seasonId: v.id("leaderboardSeasons"),
    scoreIncrement: v.number(),
  },
  handler: async (ctx, args) => {
    const season = await ctx.db.get(args.seasonId);
    if (!season) throw new Error("Season not found");
    if (!season.isActive) throw new Error("Season is not active");

    const existing = await ctx.db
      .query("seasonalRankings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("seasonId"), args.seasonId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        score: existing.score + args.scoreIncrement,
        previousRank: existing.rank,
        updatedAt: Date.now(),
      });

      return { newScore: existing.score + args.scoreIncrement };
    } else {
      await ctx.db.insert("seasonalRankings", {
        seasonId: args.seasonId,
        userId: args.userId,
        score: args.scoreIncrement,
        rank: 0,
        updatedAt: Date.now(),
      });

      return { newScore: args.scoreIncrement };
    }
  },
});

export const recalculateRanks = mutation({
  args: { seasonId: v.id("leaderboardSeasons") },
  handler: async (ctx, args) => {
    const rankings = await ctx.db
      .query("seasonalRankings")
      .withIndex("by_season", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    const sorted = rankings.sort((a, b) => b.score - a.score);

    for (let i = 0; i < sorted.length; i++) {
      await ctx.db.patch(sorted[i]._id, {
        previousRank: sorted[i].rank,
        rank: i + 1,
        updatedAt: Date.now(),
      });
    }

    return { updated: sorted.length };
  },
});

export const seedSeason = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("leaderboardSeasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (existing) return { message: "Active season already exists" };

    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const seasons = [
      {
        slug: "xp-season-1",
        name: "XP Champions Season 1",
        description: "Earn the most XP this month to claim glory!",
        startDate: now,
        endDate: now + monthMs,
        leaderboardType: "xp" as const,
        rewards: [
          { rank: 1, rewardType: "title", rewardValue: "XP Champion" },
          { rank: 2, rewardType: "title", rewardValue: "XP Master" },
          { rank: 3, rewardType: "title", rewardValue: "XP Expert" },
          { rank: 10, rewardType: "xp_bonus", rewardValue: "1000" },
        ],
        isActive: true,
      },
      {
        slug: "battle-season-1",
        name: "Battle Royale Season 1",
        description: "Win the most battles to become the ultimate champion!",
        startDate: now,
        endDate: now + monthMs,
        leaderboardType: "battles" as const,
        rewards: [
          { rank: 1, rewardType: "title", rewardValue: "Battle Champion" },
          { rank: 2, rewardType: "title", rewardValue: "Battle Master" },
          { rank: 3, rewardType: "title", rewardValue: "Battle Expert" },
        ],
        isActive: true,
      },
    ];

    for (const season of seasons) {
      await ctx.db.insert("leaderboardSeasons", season);
    }

    return { message: "Seasons created successfully" };
  },
});
