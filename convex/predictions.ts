import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getOpenPredictions = query({
  args: { category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.category) {
      const predictions = await ctx.db
        .query("predictions")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .filter((q) => q.eq(q.field("status"), "open"))
        .take(args.limit || 20);

      return await enrichPredictions(ctx, predictions);
    }

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .take(args.limit || 20);

    return await enrichPredictions(ctx, predictions);
  },
});

async function enrichPredictions(ctx: any, predictions: any[]) {
  return await Promise.all(
    predictions.map(async (p) => {
      const tool = p.targetToolId ? await ctx.db.get(p.targetToolId) : null;
      const totalStake = p.totalYesStake + p.totalNoStake;
      const yesPercent = totalStake > 0 ? Math.round((p.totalYesStake / totalStake) * 100) : 50;
      return { ...p, tool, yesPercent, noPercent: 100 - yesPercent };
    })
  );
}

export const getPrediction = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const prediction = await ctx.db
      .query("predictions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!prediction) return null;

    const tool = prediction.targetToolId ? await ctx.db.get(prediction.targetToolId) : null;
    const bets = await ctx.db
      .query("predictionBets")
      .withIndex("by_prediction", (q) => q.eq("predictionId", prediction._id))
      .collect();

    const totalStake = prediction.totalYesStake + prediction.totalNoStake;
    const yesPercent = totalStake > 0 ? Math.round((prediction.totalYesStake / totalStake) * 100) : 50;

    return { ...prediction, tool, bets, yesPercent, noPercent: 100 - yesPercent };
  },
});

export const getUpcomingResolutions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    const upcoming = predictions
      .filter((p) => p.resolutionDate > now)
      .sort((a, b) => a.resolutionDate - b.resolutionDate)
      .slice(0, args.limit || 10);

    return await enrichPredictions(ctx, upcoming);
  },
});

export const getUserBets = query({
  args: { oderId: v.string() },
  handler: async (ctx, args) => {
    const bets = await ctx.db
      .query("predictionBets")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .collect();

    const betsWithPredictions = await Promise.all(
      bets.map(async (b) => {
        const prediction = await ctx.db.get(b.predictionId);
        return { ...b, prediction };
      })
    );

    return betsWithPredictions;
  },
});

export const getPredictionLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.db
      .query("predictionLeaderboard")
      .withIndex("by_accuracy")
      .order("desc")
      .take(args.limit || 20);

    return leaderboard.map((l, i) => ({ ...l, rank: i + 1 }));
  },
});

export const createPrediction = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("tool_growth"),
      v.literal("tool_decline"),
      v.literal("new_release"),
      v.literal("acquisition"),
      v.literal("trend"),
      v.literal("custom")
    ),
    targetToolId: v.optional(v.id("tools")),
    targetMetric: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    resolutionCriteria: v.string(),
    resolutionDate: v.number(),
    createdBy: v.string(),
    isExpertPrediction: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("predictions", {
      ...args,
      status: "open",
      totalYesStake: 0,
      totalNoStake: 0,
      isExpertPrediction: args.isExpertPrediction || false,
      createdAt: Date.now(),
    });
  },
});

export const placeBet = mutation({
  args: {
    predictionId: v.id("predictions"),
    oderId: v.string(),
    position: v.union(v.literal("yes"), v.literal("no")),
    stakeAmount: v.number(),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.predictionId);
    if (!prediction) throw new Error("Prediction not found");
    if (prediction.status !== "open") throw new Error("Prediction not open for betting");

    const existing = await ctx.db
      .query("predictionBets")
      .withIndex("by_prediction", (q) => q.eq("predictionId", args.predictionId))
      .filter((q) => q.eq(q.field("oderId"), args.oderId))
      .first();

    if (existing) throw new Error("Already placed a bet on this prediction");

    const betId = await ctx.db.insert("predictionBets", {
      predictionId: args.predictionId,
      oderId: args.oderId,
      position: args.position,
      stakeAmount: args.stakeAmount,
      confidence: args.confidence,
      placedAt: Date.now(),
    });

    if (args.position === "yes") {
      await ctx.db.patch(args.predictionId, {
        totalYesStake: prediction.totalYesStake + args.stakeAmount,
      });
    } else {
      await ctx.db.patch(args.predictionId, {
        totalNoStake: prediction.totalNoStake + args.stakeAmount,
      });
    }

    return betId;
  },
});

export const resolvePrediction = mutation({
  args: {
    predictionId: v.id("predictions"),
    outcome: v.union(v.literal("yes"), v.literal("no")),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.predictionId);
    if (!prediction) throw new Error("Prediction not found");

    const newStatus = args.outcome === "yes" ? "resolved_yes" : "resolved_no";

    await ctx.db.patch(args.predictionId, {
      status: newStatus,
      resolvedAt: Date.now(),
    });

    const bets = await ctx.db
      .query("predictionBets")
      .withIndex("by_prediction", (q) => q.eq("predictionId", args.predictionId))
      .collect();

    const totalPool = prediction.totalYesStake + prediction.totalNoStake;
    const winningPool = args.outcome === "yes" ? prediction.totalYesStake : prediction.totalNoStake;

    for (const bet of bets) {
      const won = bet.position === args.outcome;
      let payout = 0;

      if (won && winningPool > 0) {
        payout = Math.round((bet.stakeAmount / winningPool) * totalPool);
      }

      await ctx.db.patch(bet._id, { payout });

      const leaderboardEntry = await ctx.db
        .query("predictionLeaderboard")
        .filter((q) => q.eq(q.field("oderId"), bet.oderId))
        .first();

      if (leaderboardEntry) {
        const newTotal = leaderboardEntry.totalPredictions + 1;
        const newCorrect = leaderboardEntry.correctPredictions + (won ? 1 : 0);
        const newStreak = won ? leaderboardEntry.streak + 1 : 0;

        await ctx.db.patch(leaderboardEntry._id, {
          totalPredictions: newTotal,
          correctPredictions: newCorrect,
          accuracy: Math.round((newCorrect / newTotal) * 100),
          totalProfit: leaderboardEntry.totalProfit + (won ? payout - bet.stakeAmount : -bet.stakeAmount),
          streak: newStreak,
          bestStreak: Math.max(leaderboardEntry.bestStreak, newStreak),
          lastUpdated: Date.now(),
        });
      } else {
        await ctx.db.insert("predictionLeaderboard", {
          oderId: bet.oderId,
          totalPredictions: 1,
          correctPredictions: won ? 1 : 0,
          accuracy: won ? 100 : 0,
          totalProfit: won ? payout - bet.stakeAmount : -bet.stakeAmount,
          streak: won ? 1 : 0,
          bestStreak: won ? 1 : 0,
          lastUpdated: Date.now(),
        });
      }
    }
  },
});

export const seedPredictions = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").take(5);

    const predictions = [
      {
        slug: "react-100k-stars-2025",
        title: "React will reach 250k GitHub stars by end of 2025",
        description: "Will React's GitHub repository reach 250,000 stars before December 31, 2025?",
        category: "tool_growth" as const,
        targetToolId: tools[0]?._id,
        targetMetric: "github_stars",
        targetValue: 250000,
        resolutionCriteria: "Check React's GitHub stars on December 31, 2025",
        resolutionDate: new Date("2025-12-31").getTime(),
        createdBy: "system",
        isExpertPrediction: false,
      },
      {
        slug: "ai-framework-dominance",
        title: "An AI-first framework will be in the top 5 most used by 2026",
        description: "Will an AI-native development framework break into the top 5 most used frameworks?",
        category: "trend" as const,
        resolutionCriteria: "Based on Stack Overflow Developer Survey 2026",
        resolutionDate: new Date("2026-06-01").getTime(),
        createdBy: "system",
        isExpertPrediction: true,
      },
    ];

    for (const prediction of predictions) {
      const existing = await ctx.db
        .query("predictions")
        .withIndex("by_slug", (q) => q.eq("slug", prediction.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("predictions", {
          ...prediction,
          status: "open",
          totalYesStake: 0,
          totalNoStake: 0,
          createdAt: Date.now(),
        });
      }
    }
  },
});
