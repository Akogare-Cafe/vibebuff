import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const MASTERY_LEVELS = {
  novice: { minXp: 0, maxXp: 99 },
  apprentice: { minXp: 100, maxXp: 499 },
  journeyman: { minXp: 500, maxXp: 999 },
  expert: { minXp: 1000, maxXp: 4999 },
  master: { minXp: 5000, maxXp: 9999 },
  grandmaster: { minXp: 10000, maxXp: Infinity },
};

const XP_REWARDS = {
  view: 1,
  deckAdd: 5,
  battleWin: 10,
  battleLoss: 2,
  comparison: 3,
  review: 25,
};

function calculateLevel(xp: number): "novice" | "apprentice" | "journeyman" | "expert" | "master" | "grandmaster" {
  if (xp >= 10000) return "grandmaster";
  if (xp >= 5000) return "master";
  if (xp >= 1000) return "expert";
  if (xp >= 500) return "journeyman";
  if (xp >= 100) return "apprentice";
  return "novice";
}

// Get user's mastery for a specific tool
export const getToolMastery = query({
  args: { userId: v.string(), toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const mastery = await ctx.db
      .query("toolMastery")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (!mastery) {
      return null;
    }

    const tool = await ctx.db.get(args.toolId);
    const levelInfo = MASTERY_LEVELS[mastery.level];
    const nextLevel = calculateLevel(mastery.xp + 1);
    const nextLevelInfo = MASTERY_LEVELS[nextLevel];

    return {
      ...mastery,
      tool,
      xpToNextLevel: nextLevelInfo.minXp - mastery.xp,
      progressPercent: ((mastery.xp - levelInfo.minXp) / (levelInfo.maxXp - levelInfo.minXp)) * 100,
    };
  },
});

// Get all masteries for a user
export const getUserMasteries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const masteries = await ctx.db
      .query("toolMastery")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const masteriesWithTools = await Promise.all(
      masteries.map(async (m) => {
        const tool = await ctx.db.get(m.toolId);
        return { ...m, tool };
      })
    );

    // Sort by XP descending
    return masteriesWithTools.sort((a, b) => b.xp - a.xp);
  },
});

// Get top mastered tools (leaderboard)
export const getToolMasteryLeaderboard = query({
  args: { toolId: v.id("tools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const masteries = await ctx.db
      .query("toolMastery")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    // Sort by XP and take top N
    const sorted = masteries.sort((a, b) => b.xp - a.xp).slice(0, args.limit || 10);

    return sorted.map((m, index) => ({
      ...m,
      rank: index + 1,
    }));
  },
});

// Record an interaction and update mastery
export const recordInteraction = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
    interactionType: v.union(
      v.literal("view"),
      v.literal("deckAdd"),
      v.literal("battleWin"),
      v.literal("battleLoss"),
      v.literal("comparison"),
      v.literal("review")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const xpGained = XP_REWARDS[args.interactionType];

    const existing = await ctx.db
      .query("toolMastery")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (existing) {
      const newXp = existing.xp + xpGained;
      const newLevel = calculateLevel(newXp);
      const leveledUp = newLevel !== existing.level;

      const interactions = { ...existing.interactions };
      switch (args.interactionType) {
        case "view":
          interactions.views++;
          break;
        case "deckAdd":
          interactions.deckAdds++;
          break;
        case "battleWin":
          interactions.battleWins++;
          break;
        case "battleLoss":
          interactions.battleLosses++;
          break;
        case "comparison":
          interactions.comparisons++;
          break;
        case "review":
          interactions.reviews++;
          break;
      }

      await ctx.db.patch(existing._id, {
        xp: newXp,
        level: newLevel,
        interactions,
        lastInteractionAt: now,
      });

      return { xpGained, newXp, newLevel, leveledUp };
    } else {
      const interactions = {
        views: args.interactionType === "view" ? 1 : 0,
        deckAdds: args.interactionType === "deckAdd" ? 1 : 0,
        battleWins: args.interactionType === "battleWin" ? 1 : 0,
        battleLosses: args.interactionType === "battleLoss" ? 1 : 0,
        comparisons: args.interactionType === "comparison" ? 1 : 0,
        reviews: args.interactionType === "review" ? 1 : 0,
      };

      await ctx.db.insert("toolMastery", {
        userId: args.userId,
        toolId: args.toolId,
        xp: xpGained,
        level: "novice",
        interactions,
        firstInteractionAt: now,
        lastInteractionAt: now,
      });

      return { xpGained, newXp: xpGained, newLevel: "novice", leveledUp: false };
    }
  },
});

// Get mastery stats summary
export const getMasteryStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const masteries = await ctx.db
      .query("toolMastery")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      totalTools: masteries.length,
      totalXp: masteries.reduce((sum, m) => sum + m.xp, 0),
      byLevel: {
        novice: 0,
        apprentice: 0,
        journeyman: 0,
        expert: 0,
        master: 0,
        grandmaster: 0,
      },
      totalInteractions: {
        views: 0,
        deckAdds: 0,
        battleWins: 0,
        battleLosses: 0,
        comparisons: 0,
        reviews: 0,
      },
    };

    for (const m of masteries) {
      stats.byLevel[m.level]++;
      stats.totalInteractions.views += m.interactions.views;
      stats.totalInteractions.deckAdds += m.interactions.deckAdds;
      stats.totalInteractions.battleWins += m.interactions.battleWins;
      stats.totalInteractions.battleLosses += m.interactions.battleLosses;
      stats.totalInteractions.comparisons += m.interactions.comparisons;
      stats.totalInteractions.reviews += m.interactions.reviews;
    }

    return stats;
  },
});
