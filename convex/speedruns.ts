import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCategories = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("speedrunCategories")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_type", (q) => q.eq("categoryType", args.type as any))
        .collect();
    }

    return await ctx.db.query("speedrunCategories").collect();
  },
});

export const getCategory = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("speedrunCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getCategoryLeaderboard = query({
  args: { categoryId: v.id("speedrunCategories"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("speedruns")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const verified = runs.filter((r) => r.isVerified);
    const sorted = verified.sort((a, b) => a.timeMs - b.timeMs);

    return sorted.slice(0, args.limit || 20).map((r, i) => ({ ...r, rank: i + 1 }));
  },
});

export const getUserSpeedruns = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("speedruns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const runsWithCategories = await Promise.all(
      runs.map(async (r) => {
        const category = await ctx.db.get(r.categoryId);
        return { ...r, category };
      })
    );

    return runsWithCategories;
  },
});

export const getWorldRecords = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db
      .query("speedruns")
      .withIndex("by_world_record", (q) => q.eq("isWorldRecord", true))
      .collect();

    const recordsWithCategories = await Promise.all(
      records.map(async (r) => {
        const category = await ctx.db.get(r.categoryId);
        return { ...r, category };
      })
    );

    return recordsWithCategories;
  },
});

export const getActiveRaces = query({
  args: {},
  handler: async (ctx) => {
    const races = await ctx.db
      .query("weeklyRaces")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const racesWithCategories = await Promise.all(
      races.map(async (r) => {
        const category = await ctx.db.get(r.categoryId);
        return { ...r, category };
      })
    );

    return racesWithCategories;
  },
});

export const getUpcomingRaces = query({
  args: {},
  handler: async (ctx) => {
    const races = await ctx.db
      .query("weeklyRaces")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .collect();

    const racesWithCategories = await Promise.all(
      races.map(async (r) => {
        const category = await ctx.db.get(r.categoryId);
        return { ...r, category };
      })
    );

    return racesWithCategories.sort((a, b) => a.startTime - b.startTime);
  },
});

export const submitSpeedrun = mutation({
  args: {
    categoryId: v.id("speedrunCategories"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    timeMs: v.number(),
    splits: v.array(v.object({
      name: v.string(),
      timeMs: v.number(),
      toolId: v.optional(v.id("tools")),
    })),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    const currentRecord = category.worldRecord;
    const isWorldRecord = !currentRecord || args.timeMs < currentRecord;

    const runId = await ctx.db.insert("speedruns", {
      categoryId: args.categoryId,
      userId: args.userId,
      toolIds: args.toolIds,
      timeMs: args.timeMs,
      splits: args.splits,
      isVerified: false,
      videoUrl: args.videoUrl,
      isWorldRecord: false,
      submittedAt: Date.now(),
    });

    return { runId, isPotentialWorldRecord: isWorldRecord };
  },
});

export const verifySpeedrun = mutation({
  args: {
    runId: v.id("speedruns"),
    verifiedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error("Run not found");

    const category = await ctx.db.get(run.categoryId);
    if (!category) throw new Error("Category not found");

    const isWorldRecord = !category.worldRecord || run.timeMs < category.worldRecord;

    await ctx.db.patch(args.runId, {
      isVerified: true,
      verifiedBy: args.verifiedBy,
      isWorldRecord,
    });

    if (isWorldRecord) {
      const previousRecord = await ctx.db
        .query("speedruns")
        .withIndex("by_category", (q) => q.eq("categoryId", run.categoryId))
        .filter((q) => q.eq(q.field("isWorldRecord"), true))
        .first();

      if (previousRecord && previousRecord._id !== args.runId) {
        await ctx.db.patch(previousRecord._id, { isWorldRecord: false });
      }

      await ctx.db.patch(run.categoryId, {
        worldRecord: run.timeMs,
        worldRecordHolder: run.userId,
      });
    }
  },
});

export const joinRace = mutation({
  args: {
    raceId: v.id("weeklyRaces"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race) throw new Error("Race not found");
    if (race.status !== "upcoming") throw new Error("Race not open for registration");

    if (race.participants.includes(args.userId)) {
      throw new Error("Already registered");
    }

    await ctx.db.patch(args.raceId, {
      participants: [...race.participants, args.userId],
    });
  },
});

export const submitRaceResult = mutation({
  args: {
    raceId: v.id("weeklyRaces"),
    oderId: v.string(),
    timeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race) throw new Error("Race not found");
    if (race.status !== "active") throw new Error("Race not active");

    const existingResult = race.results.find((r) => r.oderId === args.oderId);
    if (existingResult) throw new Error("Already submitted result");

    const newResults = [...race.results, { oderId: args.oderId, timeMs: args.timeMs, rank: 0 }];
    const sorted = newResults.sort((a, b) => a.timeMs - b.timeMs);
    const ranked = sorted.map((r, i) => ({ ...r, rank: i + 1 }));

    await ctx.db.patch(args.raceId, { results: ranked });
  },
});

export const createCategory = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    categoryType: v.union(
      v.literal("any_percent"),
      v.literal("full_stack"),
      v.literal("category_specific"),
      v.literal("glitchless")
    ),
    requirements: v.array(v.object({
      category: v.string(),
      count: v.number(),
    })),
    bannedTools: v.optional(v.array(v.id("tools"))),
    verificationSteps: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("speedrunCategories", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = [
      {
        slug: "any-percent-fullstack",
        name: "Any% Full-Stack",
        description: "Build a complete full-stack application as fast as possible",
        categoryType: "any_percent" as const,
        requirements: [
          { category: "frontend", count: 1 },
          { category: "backend", count: 1 },
          { category: "database", count: 1 },
        ],
        verificationSteps: [
          "App must be deployable",
          "Must have working frontend and backend",
          "Must persist data",
        ],
      },
      {
        slug: "auth-glitchless",
        name: "Auth Glitchless",
        description: "Implement authentication without any workarounds",
        categoryType: "glitchless" as const,
        requirements: [
          { category: "auth", count: 1 },
          { category: "frontend", count: 1 },
        ],
        verificationSteps: [
          "Must use proper auth provider",
          "No hardcoded credentials",
          "Must support sign up and sign in",
        ],
      },
    ];

    for (const category of categories) {
      const existing = await ctx.db
        .query("speedrunCategories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("speedrunCategories", { ...category, createdAt: Date.now() });
      }
    }
  },
});
