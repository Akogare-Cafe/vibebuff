import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listTemplates = query({
  args: {
    category: v.optional(v.union(
      v.literal("landing-page"),
      v.literal("authentication"),
      v.literal("database"),
      v.literal("api"),
      v.literal("styling"),
      v.literal("debugging"),
      v.literal("refactoring"),
      v.literal("testing")
    )),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let templates;

    if (args.category) {
      templates = await ctx.db
        .query("promptTemplates")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.difficulty) {
      templates = await ctx.db
        .query("promptTemplates")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .collect();
    } else {
      templates = await ctx.db.query("promptTemplates").collect();
    }

    if (args.difficulty && args.category) {
      templates = templates.filter((t) => t.difficulty === args.difficulty);
    }

    const limited = args.limit ? templates.slice(0, args.limit) : templates;

    const templatesWithTools = await Promise.all(
      limited.map(async (template) => {
        const tools = await Promise.all(
          template.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...template, tools: tools.filter(Boolean) };
      })
    );

    return templatesWithTools;
  },
});

export const getTemplateBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("promptTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!template) return null;

    const tools = await Promise.all(
      template.toolIds.map((id) => ctx.db.get(id))
    );

    return { ...template, tools: tools.filter(Boolean) };
  },
});

export const getPopularTemplates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("promptTemplates")
      .withIndex("by_usage")
      .order("desc")
      .collect();

    const limited = args.limit ? templates.slice(0, args.limit) : templates;

    const templatesWithTools = await Promise.all(
      limited.map(async (template) => {
        const tools = await Promise.all(
          template.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...template, tools: tools.filter(Boolean) };
      })
    );

    return templatesWithTools;
  },
});

export const useTemplate = mutation({
  args: { templateId: v.id("promptTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return;

    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
    });
  },
});

export const listChallenges = query({
  args: {
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
  },
  handler: async (ctx, args) => {
    let challenges;

    if (args.difficulty) {
      challenges = await ctx.db
        .query("promptChallenges")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .collect();
    } else {
      challenges = await ctx.db.query("promptChallenges").collect();
    }

    return challenges.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getChallengeBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promptChallenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getUserAttempts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("userPromptAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const attemptsWithChallenges = await Promise.all(
      attempts.map(async (attempt) => {
        const challenge = await ctx.db.get(attempt.challengeId);
        return { ...attempt, challenge };
      })
    );

    return attemptsWithChallenges;
  },
});

export const getCompletedChallenges = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("userPromptAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const successfulAttempts = attempts.filter((a) => a.isSuccessful);
    const uniqueChallengeIds = [...new Set(successfulAttempts.map((a) => a.challengeId))];

    return uniqueChallengeIds;
  },
});

export const submitAttempt = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("promptChallenges"),
    prompt: v.string(),
    isSuccessful: v.boolean(),
  },
  handler: async (ctx, args) => {
    const attemptId = await ctx.db.insert("userPromptAttempts", {
      userId: args.userId,
      challengeId: args.challengeId,
      prompt: args.prompt,
      isSuccessful: args.isSuccessful,
      attemptedAt: Date.now(),
    });

    if (args.isSuccessful) {
      const challenge = await ctx.db.get(args.challengeId);
      if (challenge) {
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
          .first();

        if (userProfile) {
          await ctx.db.patch(userProfile._id, {
            xp: userProfile.xp + challenge.xpReward,
          });
        }
      }
    }

    return attemptId;
  },
});

export const createTemplate = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("landing-page"),
      v.literal("authentication"),
      v.literal("database"),
      v.literal("api"),
      v.literal("styling"),
      v.literal("debugging"),
      v.literal("refactoring"),
      v.literal("testing")
    ),
    prompt: v.string(),
    exampleOutput: v.optional(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    toolIds: v.array(v.id("tools")),
    tags: v.array(v.string()),
    isOfficial: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("promptTemplates", {
      ...args,
      usageCount: 0,
      rating: 0,
      createdAt: Date.now(),
    });
  },
});

export const createChallenge = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    task: v.string(),
    hints: v.array(v.string()),
    solutionPrompt: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    xpReward: v.number(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("promptChallenges", args);
  },
});
