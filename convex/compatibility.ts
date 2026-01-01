import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCompatibilityScore = query({
  args: { tool1Id: v.id("tools"), tool2Id: v.id("tools") },
  handler: async (ctx, args) => {
    const score = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_tool1", (q) => q.eq("tool1Id", args.tool1Id))
      .filter((q) => q.eq(q.field("tool2Id"), args.tool2Id))
      .first();

    if (score) {
      const tool1 = await ctx.db.get(args.tool1Id);
      const tool2 = await ctx.db.get(args.tool2Id);
      return { ...score, tool1, tool2 };
    }

    const reverseScore = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_tool1", (q) => q.eq("tool1Id", args.tool2Id))
      .filter((q) => q.eq(q.field("tool2Id"), args.tool1Id))
      .first();

    if (reverseScore) {
      const tool1 = await ctx.db.get(args.tool1Id);
      const tool2 = await ctx.db.get(args.tool2Id);
      return { ...reverseScore, tool1, tool2 };
    }

    return null;
  },
});

export const getToolCompatibilities = query({
  args: { toolId: v.id("tools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const asFirst = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_tool1", (q) => q.eq("tool1Id", args.toolId))
      .collect();

    const asSecond = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_tool2", (q) => q.eq("tool2Id", args.toolId))
      .collect();

    const all = [...asFirst, ...asSecond];

    const withTools = await Promise.all(
      all.map(async (c) => {
        const otherToolId = c.tool1Id === args.toolId ? c.tool2Id : c.tool1Id;
        const otherTool = await ctx.db.get(otherToolId);
        return { ...c, otherTool };
      })
    );

    return withTools
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, args.limit || 20);
  },
});

export const getTopCompatiblePairs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_score")
      .order("desc")
      .take(args.limit || 20);

    const withTools = await Promise.all(
      scores.map(async (s) => {
        const tool1 = await ctx.db.get(s.tool1Id);
        const tool2 = await ctx.db.get(s.tool2Id);
        return { ...s, tool1, tool2 };
      })
    );

    return withTools;
  },
});

export const getCompatibilityReports = query({
  args: { tool1Id: v.id("tools"), tool2Id: v.id("tools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("compatibilityReports")
      .withIndex("by_tools", (q) => q.eq("tool1Id", args.tool1Id).eq("tool2Id", args.tool2Id))
      .take(args.limit || 20);

    if (reports.length > 0) return reports;

    return await ctx.db
      .query("compatibilityReports")
      .withIndex("by_tools", (q) => q.eq("tool1Id", args.tool2Id).eq("tool2Id", args.tool1Id))
      .take(args.limit || 20);
  },
});

export const submitCompatibilityReport = mutation({
  args: {
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    userId: v.string(),
    score: v.number(),
    experience: v.union(
      v.literal("smooth"),
      v.literal("minor_issues"),
      v.literal("major_issues"),
      v.literal("incompatible")
    ),
    gotchas: v.array(v.string()),
    tips: v.array(v.string()),
    projectContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("compatibilityReports", {
      ...args,
      upvotes: 0,
      createdAt: Date.now(),
    });

    const existingScore = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_tool1", (q) => q.eq("tool1Id", args.tool1Id))
      .filter((q) => q.eq(q.field("tool2Id"), args.tool2Id))
      .first();

    if (existingScore) {
      const newReportCount = existingScore.reportCount + 1;
      const newOverallScore = Math.round(
        (existingScore.overallScore * existingScore.reportCount + args.score) / newReportCount
      );

      await ctx.db.patch(existingScore._id, {
        overallScore: newOverallScore,
        reportCount: newReportCount,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("compatibilityScores", {
        tool1Id: args.tool1Id,
        tool2Id: args.tool2Id,
        overallScore: args.score,
        breakdown: {
          setupEase: args.score,
          documentation: args.score,
          communitySupport: args.score,
          performanceTogether: args.score,
        },
        reportCount: 1,
        lastUpdated: Date.now(),
      });
    }

    return reportId;
  },
});

export const upvoteReport = mutation({
  args: { reportId: v.id("compatibilityReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(args.reportId, {
      upvotes: report.upvotes + 1,
    });
  },
});

export const addIntegrationGuide = mutation({
  args: {
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    guide: v.string(),
    boilerplateUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("compatibilityScores")
      .withIndex("by_tool1", (q) => q.eq("tool1Id", args.tool1Id))
      .filter((q) => q.eq(q.field("tool2Id"), args.tool2Id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        integrationGuide: args.guide,
        boilerplateUrl: args.boilerplateUrl,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("compatibilityScores", {
        tool1Id: args.tool1Id,
        tool2Id: args.tool2Id,
        overallScore: 70,
        breakdown: {
          setupEase: 70,
          documentation: 70,
          communitySupport: 70,
          performanceTogether: 70,
        },
        integrationGuide: args.guide,
        boilerplateUrl: args.boilerplateUrl,
        reportCount: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});
