import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getLatestReport = query({
  args: {},
  handler: async (ctx) => {
    const report = await ctx.db
      .query("metaReports")
      .order("desc")
      .first();

    if (!report) return null;

    const toolTrends = await Promise.all(
      report.toolTrends.slice(0, 20).map(async (trend) => {
        const tool = await ctx.db.get(trend.toolId);
        return { ...trend, tool };
      })
    );

    const categoryTrends = await Promise.all(
      report.categoryTrends.map(async (ct) => {
        const category = await ctx.db.get(ct.categoryId);
        const topTools = await Promise.all(ct.topTools.map((id) => ctx.db.get(id)));
        const emergingTools = await Promise.all(ct.emergingTools.map((id) => ctx.db.get(id)));
        return { ...ct, category, topTools, emergingTools };
      })
    );

    return {
      ...report,
      toolTrends,
      categoryTrends,
    };
  },
});

export const getReportHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("metaReports")
      .order("desc")
      .take(args.limit || 10);
  },
});

export const placeBet = mutation({
  args: {
    userId: v.string(),
    reportId: v.id("metaReports"),
    predictionIndex: v.number(),
    betAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");
    if (args.predictionIndex >= report.predictions.length) {
      throw new Error("Invalid prediction index");
    }

    const existing = await ctx.db
      .query("metaPredictionBets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("reportId"), args.reportId),
          q.eq(q.field("predictionIndex"), args.predictionIndex)
        )
      )
      .first();

    if (existing) throw new Error("Already bet on this prediction");

    return ctx.db.insert("metaPredictionBets", {
      userId: args.userId,
      reportId: args.reportId,
      predictionIndex: args.predictionIndex,
      betAmount: args.betAmount,
      createdAt: Date.now(),
    });
  },
});

export const getUserBets = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bets = await ctx.db
      .query("metaPredictionBets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    return Promise.all(
      bets.map(async (bet) => {
        const report = await ctx.db.get(bet.reportId);
        return {
          ...bet,
          prediction: report?.predictions[bet.predictionIndex],
        };
      })
    );
  },
});

export const generateReport = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weekStart = now - weekMs;

    const tools = await ctx.db.query("tools").collect();
    const categories = await ctx.db.query("categories").collect();

    const toolUsageThisWeek = await ctx.db
      .query("toolUsage")
      .filter((q) => q.gte(q.field("lastUsedAt"), weekStart))
      .collect();

    const usageByTool: Record<string, number> = {};
    for (const usage of toolUsageThisWeek) {
      const key = usage.toolId.toString();
      usageByTool[key] = (usageByTool[key] || 0) + 1;
    }

    const sortedTools = tools
      .map((t) => ({
        toolId: t._id,
        usage: usageByTool[t._id.toString()] || 0,
      }))
      .sort((a, b) => b.usage - a.usage);

    const toolTrends = sortedTools.slice(0, 30).map((t, index) => ({
      toolId: t.toolId,
      previousRank: Math.floor(Math.random() * 30) + 1,
      currentRank: index + 1,
      usageChange: Math.floor(Math.random() * 100) - 50,
      sentiment: (Math.random() > 0.6 ? "rising" : Math.random() > 0.3 ? "stable" : "falling") as "rising" | "stable" | "falling",
    }));

    const categoryTrends = categories.slice(0, 5).map((cat) => {
      const categoryTools = tools.filter((t) => t.categoryId === cat._id);
      return {
        categoryId: cat._id,
        topTools: categoryTools.slice(0, 3).map((t) => t._id),
        emergingTools: categoryTools.slice(3, 5).map((t) => t._id),
      };
    });

    const predictions = [
      { prediction: "React Server Components adoption will increase 30% next week", confidence: 0.75 },
      { prediction: "Bun usage will surpass Deno in deck additions", confidence: 0.6 },
      { prediction: "AI-assisted coding tools will dominate the IDE category", confidence: 0.85 },
    ];

    const reportId = await ctx.db.insert("metaReports", {
      weekStart,
      weekEnd: now,
      generatedAt: now,
      toolTrends,
      categoryTrends,
      predictions,
    });

    return reportId;
  },
});

export const resolveBets = mutation({
  args: {
    reportId: v.id("metaReports"),
    predictionIndex: v.number(),
    outcome: v.union(v.literal("won"), v.literal("lost")),
  },
  handler: async (ctx, args) => {
    const bets = await ctx.db
      .query("metaPredictionBets")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .filter((q) => q.eq(q.field("predictionIndex"), args.predictionIndex))
      .collect();

    for (const bet of bets) {
      const payout = args.outcome === "won" ? bet.betAmount * 2 : 0;
      await ctx.db.patch(bet._id, {
        outcome: args.outcome,
        payout,
      });
    }

    return { resolved: bets.length };
  },
});

export const getTrendingTools = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("metaReports")
      .order("desc")
      .first();

    if (!report) return [];

    const rising = report.toolTrends
      .filter((t) => t.sentiment === "rising")
      .slice(0, args.limit || 5);

    return Promise.all(
      rising.map(async (trend) => {
        const tool = await ctx.db.get(trend.toolId);
        return { ...trend, tool };
      })
    );
  },
});
