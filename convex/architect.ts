import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getDailyPuzzle = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const puzzle = await ctx.db
      .query("architectPuzzles")
      .withIndex("by_daily", (q) => q.eq("isDaily", true).eq("activeDate", todayTimestamp))
      .first();

    return puzzle;
  },
});

export const getPuzzle = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("architectPuzzles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getPuzzles = query({
  args: { difficulty: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.difficulty) {
      const puzzles = await ctx.db
        .query("architectPuzzles")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty as any))
        .take(args.limit || 20);
      return puzzles;
    }

    const puzzles = await ctx.db.query("architectPuzzles").take(args.limit || 20);
    return puzzles;
  },
});

export const getPuzzleLeaderboard = query({
  args: { puzzleId: v.id("architectPuzzles"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const solutions = await ctx.db
      .query("puzzleSolutions")
      .withIndex("by_puzzle", (q) => q.eq("puzzleId", args.puzzleId))
      .collect();

    const sorted = solutions.sort((a, b) => b.score - a.score);
    return sorted.slice(0, args.limit || 20).map((s, i) => ({ ...s, rank: i + 1 }));
  },
});

export const getUserSolutions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const solutions = await ctx.db
      .query("puzzleSolutions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const solutionsWithPuzzles = await Promise.all(
      solutions.map(async (s) => {
        const puzzle = await ctx.db.get(s.puzzleId);
        return { ...s, puzzle };
      })
    );

    return solutionsWithPuzzles;
  },
});

export const submitSolution = mutation({
  args: {
    userId: v.string(),
    puzzleId: v.id("architectPuzzles"),
    toolIds: v.array(v.id("tools")),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const puzzle = await ctx.db.get(args.puzzleId);
    if (!puzzle) throw new Error("Puzzle not found");

    const tools = await Promise.all(args.toolIds.map((id) => ctx.db.get(id)));
    const validTools = tools.filter(Boolean);

    let costScore = 100;
    let performanceScore = 100;
    let simplicityScore = 100;
    let innovationScore = 50;

    if (puzzle.constraints.maxTools && args.toolIds.length > puzzle.constraints.maxTools) {
      simplicityScore -= 30;
    }

    simplicityScore = Math.max(0, 100 - (args.toolIds.length - 3) * 10);

    const totalStars = validTools.reduce((sum, t) => sum + (t?.githubStars || 0), 0);
    performanceScore = Math.min(100, Math.floor(Math.log10(totalStars + 1) * 20));

    const hasOpenSource = validTools.some((t) => t?.isOpenSource);
    const hasFree = validTools.some((t) => t?.pricingModel === "free");
    costScore = hasOpenSource && hasFree ? 100 : hasFree ? 80 : 60;

    const uniqueCategories = new Set(validTools.map((t) => t?.categoryId?.toString()));
    innovationScore = Math.min(100, uniqueCategories.size * 20);

    const weights = puzzle.scoringCriteria;
    const totalWeight = weights.costWeight + weights.performanceWeight + weights.simplicityWeight + weights.innovationWeight;
    const score = Math.round(
      (costScore * weights.costWeight +
        performanceScore * weights.performanceWeight +
        simplicityScore * weights.simplicityWeight +
        innovationScore * weights.innovationWeight) / totalWeight
    );

    const solutionId = await ctx.db.insert("puzzleSolutions", {
      puzzleId: args.puzzleId,
      userId: args.userId,
      toolIds: args.toolIds,
      score,
      breakdown: {
        costScore,
        performanceScore,
        simplicityScore,
        innovationScore,
      },
      timeSpent: args.timeSpent,
      submittedAt: Date.now(),
    });

    return { solutionId, score, breakdown: { costScore, performanceScore, simplicityScore, innovationScore } };
  },
});

export const createPuzzle = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("expert")),
    constraints: v.object({
      maxBudget: v.optional(v.number()),
      maxTools: v.optional(v.number()),
      requiredCategories: v.optional(v.array(v.string())),
      bannedTools: v.optional(v.array(v.id("tools"))),
      mustInclude: v.optional(v.array(v.id("tools"))),
      targetUsers: v.optional(v.number()),
      maxLatency: v.optional(v.number()),
      customConstraints: v.optional(v.array(v.string())),
    }),
    scoringCriteria: v.object({
      costWeight: v.number(),
      performanceWeight: v.number(),
      simplicityWeight: v.number(),
      innovationWeight: v.number(),
    }),
    isDaily: v.boolean(),
    activeDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("architectPuzzles", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const seedPuzzles = mutation({
  args: {},
  handler: async (ctx) => {
    const puzzles = [
      {
        slug: "zero-budget-saas",
        title: "Zero Budget SaaS",
        description: "Build a complete SaaS application spending $0/month on infrastructure",
        difficulty: "medium" as const,
        constraints: {
          maxBudget: 0,
          customConstraints: ["Must include authentication", "Must have a database", "Must be deployable"],
        },
        scoringCriteria: { costWeight: 40, performanceWeight: 20, simplicityWeight: 20, innovationWeight: 20 },
        isDaily: false,
      },
      {
        slug: "million-users",
        title: "Scale to a Million",
        description: "Design a stack that can handle 1 million concurrent users",
        difficulty: "hard" as const,
        constraints: {
          targetUsers: 1000000,
          customConstraints: ["Must handle real-time features", "Must have CDN", "Must have caching"],
        },
        scoringCriteria: { costWeight: 10, performanceWeight: 50, simplicityWeight: 10, innovationWeight: 30 },
        isDaily: false,
      },
      {
        slug: "weekend-mvp",
        title: "Weekend MVP",
        description: "Build an MVP in a weekend with maximum 4 tools",
        difficulty: "easy" as const,
        constraints: {
          maxTools: 4,
          customConstraints: ["Must be deployable", "Must have frontend and backend"],
        },
        scoringCriteria: { costWeight: 20, performanceWeight: 20, simplicityWeight: 40, innovationWeight: 20 },
        isDaily: false,
      },
    ];

    for (const puzzle of puzzles) {
      const existing = await ctx.db
        .query("architectPuzzles")
        .withIndex("by_slug", (q) => q.eq("slug", puzzle.slug))
        .first();
      
      if (!existing) {
        await ctx.db.insert("architectPuzzles", { ...puzzle, createdAt: Date.now() });
      }
    }
  },
});
