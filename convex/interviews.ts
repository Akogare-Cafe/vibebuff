import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getScenarios = query({
  args: { difficulty: v.optional(v.string()), company: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.difficulty) {
      return await ctx.db
        .query("interviewScenarios")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty as any))
        .take(args.limit || 20);
    }

    if (args.company) {
      return await ctx.db
        .query("interviewScenarios")
        .withIndex("by_company", (q) => q.eq("company", args.company))
        .take(args.limit || 20);
    }

    return await ctx.db.query("interviewScenarios").take(args.limit || 20);
  },
});

export const getScenario = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviewScenarios")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getScenarioLeaderboard = query({
  args: { scenarioId: v.id("interviewScenarios"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("interviewAttempts")
      .withIndex("by_scenario", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();

    const sorted = attempts.sort((a, b) => b.score - a.score);
    return sorted.slice(0, args.limit || 20).map((a, i) => ({ ...a, rank: i + 1 }));
  },
});

export const getUserAttempts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("interviewAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const attemptsWithScenarios = await Promise.all(
      attempts.map(async (a) => {
        const scenario = await ctx.db.get(a.scenarioId);
        return { ...a, scenario };
      })
    );

    return attemptsWithScenarios;
  },
});

export const startInterview = mutation({
  args: {
    scenarioId: v.id("interviewScenarios"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    return {
      scenario,
      startTime: Date.now(),
      timeLimit: scenario.timeLimit,
    };
  },
});

export const submitInterview = mutation({
  args: {
    scenarioId: v.id("interviewScenarios"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    answers: v.array(v.object({
      questionIndex: v.number(),
      answer: v.string(),
    })),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    const tools = await Promise.all(args.toolIds.map((id) => ctx.db.get(id)));
    const validTools = tools.filter(Boolean);

    let scalabilityScore = 50;
    let costScore = 50;
    let maintainabilityScore = 50;
    let innovationScore = 50;

    const totalStars = validTools.reduce((sum, t) => sum + (t?.githubStars || 0), 0);
    scalabilityScore = Math.min(100, Math.floor(Math.log10(totalStars + 1) * 20));

    const hasOpenSource = validTools.some((t) => t?.isOpenSource);
    const hasFree = validTools.some((t) => t?.pricingModel === "free");
    costScore = hasOpenSource && hasFree ? 100 : hasFree ? 80 : hasOpenSource ? 70 : 50;

    maintainabilityScore = Math.max(30, 100 - args.toolIds.length * 10);

    const uniqueCategories = new Set(validTools.map((t) => t?.categoryId?.toString()));
    innovationScore = Math.min(100, uniqueCategories.size * 15 + 20);

    const rubric = scenario.rubric;
    const totalWeight = rubric.scalability + rubric.cost + rubric.maintainability + rubric.innovation;
    const score = Math.round(
      (scalabilityScore * rubric.scalability +
        costScore * rubric.cost +
        maintainabilityScore * rubric.maintainability +
        innovationScore * rubric.innovation) / totalWeight
    );

    const timePenalty = args.timeSpent > scenario.timeLimit ? Math.floor((args.timeSpent - scenario.timeLimit) / 60000) * 2 : 0;
    const finalScore = Math.max(0, score - timePenalty);

    const attemptId = await ctx.db.insert("interviewAttempts", {
      scenarioId: args.scenarioId,
      userId: args.userId,
      toolIds: args.toolIds,
      answers: args.answers,
      timeSpent: args.timeSpent,
      score: finalScore,
      peerReviews: [],
      submittedAt: Date.now(),
    });

    return { attemptId, score: finalScore, breakdown: { scalabilityScore, costScore, maintainabilityScore, innovationScore } };
  },
});

export const addPeerReview = mutation({
  args: {
    attemptId: v.id("interviewAttempts"),
    oderId: v.string(),
    score: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const newReview = {
      oderId: args.oderId,
      score: args.score,
      comment: args.comment,
      reviewedAt: Date.now(),
    };

    await ctx.db.patch(args.attemptId, {
      peerReviews: [...attempt.peerReviews, newReview],
    });
  },
});

export const createScenario = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    company: v.optional(v.string()),
    difficulty: v.union(v.literal("junior"), v.literal("mid"), v.literal("senior"), v.literal("staff")),
    description: v.string(),
    requirements: v.array(v.object({
      category: v.string(),
      description: v.string(),
      weight: v.number(),
    })),
    followUpQuestions: v.array(v.object({
      question: v.string(),
      expectedTopics: v.array(v.string()),
    })),
    timeLimit: v.number(),
    rubric: v.object({
      scalability: v.number(),
      cost: v.number(),
      maintainability: v.number(),
      innovation: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("interviewScenarios", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const seedScenarios = mutation({
  args: {},
  handler: async (ctx) => {
    const scenarios = [
      {
        slug: "design-uber",
        title: "Design Uber",
        company: "Uber",
        difficulty: "senior" as const,
        description: "Design a ride-sharing platform that can handle millions of concurrent users",
        requirements: [
          { category: "real-time", description: "Real-time location tracking", weight: 30 },
          { category: "database", description: "Scalable data storage", weight: 25 },
          { category: "payments", description: "Payment processing", weight: 20 },
          { category: "notifications", description: "Push notifications", weight: 15 },
          { category: "maps", description: "Mapping and routing", weight: 10 },
        ],
        followUpQuestions: [
          { question: "How would you handle surge pricing?", expectedTopics: ["pricing", "demand", "algorithm"] },
          { question: "How do you ensure driver-rider matching is efficient?", expectedTopics: ["matching", "geolocation", "optimization"] },
        ],
        timeLimit: 45 * 60 * 1000,
        rubric: { scalability: 35, cost: 20, maintainability: 25, innovation: 20 },
      },
      {
        slug: "design-slack",
        title: "Design Slack",
        company: "Slack",
        difficulty: "mid" as const,
        description: "Design a real-time messaging platform for teams",
        requirements: [
          { category: "real-time", description: "Real-time messaging", weight: 35 },
          { category: "search", description: "Message search", weight: 20 },
          { category: "storage", description: "File storage", weight: 20 },
          { category: "auth", description: "Team authentication", weight: 15 },
          { category: "notifications", description: "Notifications", weight: 10 },
        ],
        followUpQuestions: [
          { question: "How would you handle message delivery guarantees?", expectedTopics: ["delivery", "acknowledgment", "retry"] },
          { question: "How do you scale to millions of channels?", expectedTopics: ["sharding", "partitioning", "caching"] },
        ],
        timeLimit: 30 * 60 * 1000,
        rubric: { scalability: 30, cost: 25, maintainability: 25, innovation: 20 },
      },
    ];

    for (const scenario of scenarios) {
      const existing = await ctx.db
        .query("interviewScenarios")
        .withIndex("by_slug", (q) => q.eq("slug", scenario.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("interviewScenarios", { ...scenario, createdAt: Date.now() });
      }
    }
  },
});
