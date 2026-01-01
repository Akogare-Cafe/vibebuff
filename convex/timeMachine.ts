import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getToolTimeline = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("toolSnapshots")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const tool = await ctx.db.get(args.toolId);

    return {
      tool,
      snapshots: snapshots.sort((a, b) => a.year - b.year),
    };
  },
});

export const getYearSnapshot = query({
  args: { year: v.number(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("toolSnapshots")
      .withIndex("by_year", (q) => q.eq("year", args.year))
      .collect();

    const snapshotsWithTools = await Promise.all(
      snapshots.map(async (s) => {
        const tool = await ctx.db.get(s.toolId);
        return { ...s, tool };
      })
    );

    return snapshotsWithTools
      .filter((s) => s.wasAvailable)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, args.limit || 50);
  },
});

export const getTimeMachineChallenges = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.year) {
      return await ctx.db
        .query("timeMachineChallenges")
        .withIndex("by_year", (q) => q.eq("targetYear", args.year!))
        .collect();
    }

    return await ctx.db.query("timeMachineChallenges").take(20);
  },
});

export const getChallenge = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const challenge = await ctx.db
      .query("timeMachineChallenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!challenge) return null;

    const availableTools = await Promise.all(
      challenge.availableToolIds.map((id) => ctx.db.get(id))
    );

    return { ...challenge, availableTools: availableTools.filter(Boolean) };
  },
});

export const getChallengeSubmissions = query({
  args: { challengeId: v.id("timeMachineChallenges"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("timeMachineSubmissions")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect();

    const sorted = submissions.sort((a, b) => b.score - a.score);
    return sorted.slice(0, args.limit || 20);
  },
});

export const submitTimeMachineChallenge = mutation({
  args: {
    challengeId: v.id("timeMachineChallenges"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const validTools = args.toolIds.filter((id) =>
      challenge.availableToolIds.some((aid) => aid === id)
    );

    if (validTools.length !== args.toolIds.length) {
      throw new Error("Some tools were not available in this year");
    }

    const tools = await Promise.all(args.toolIds.map((id) => ctx.db.get(id)));
    const totalStars = tools.reduce((sum, t) => sum + (t?.githubStars || 0), 0);
    const score = Math.min(100, Math.floor(Math.log10(totalStars + 1) * 15) + args.toolIds.length * 5);

    const submissionId = await ctx.db.insert("timeMachineSubmissions", {
      challengeId: args.challengeId,
      userId: args.userId,
      toolIds: args.toolIds,
      explanation: args.explanation,
      score,
      upvotes: 0,
      submittedAt: Date.now(),
    });

    return { submissionId, score };
  },
});

export const upvoteSubmission = mutation({
  args: { submissionId: v.id("timeMachineSubmissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    await ctx.db.patch(args.submissionId, {
      upvotes: submission.upvotes + 1,
    });
  },
});

export const createToolSnapshot = mutation({
  args: {
    toolId: v.id("tools"),
    year: v.number(),
    githubStars: v.optional(v.number()),
    weeklyDownloads: v.optional(v.number()),
    popularity: v.number(),
    wasAvailable: v.boolean(),
    majorVersion: v.optional(v.string()),
    notableEvents: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toolSnapshots", args);
  },
});

export const createTimeMachineChallenge = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    targetYear: v.number(),
    projectType: v.string(),
    requirements: v.array(v.string()),
    availableToolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("timeMachineChallenges", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const seedTimeMachineChallenges = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").take(20);
    const toolIds = tools.map((t) => t._id);

    const challenges = [
      {
        slug: "twitter-2010",
        title: "Build Twitter in 2010",
        description: "Create a microblogging platform using only tools available in 2010",
        targetYear: 2010,
        projectType: "social_media",
        requirements: ["Real-time updates", "User authentication", "Follow system"],
      },
      {
        slug: "ecommerce-2015",
        title: "E-commerce in 2015",
        description: "Build an online store with the 2015 tech stack",
        targetYear: 2015,
        projectType: "ecommerce",
        requirements: ["Product catalog", "Shopping cart", "Payment processing"],
      },
    ];

    for (const challenge of challenges) {
      const existing = await ctx.db
        .query("timeMachineChallenges")
        .withIndex("by_slug", (q) => q.eq("slug", challenge.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("timeMachineChallenges", {
          ...challenge,
          availableToolIds: toolIds.slice(0, 10),
          createdAt: Date.now(),
        });
      }
    }
  },
});
