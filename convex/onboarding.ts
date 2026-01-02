import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getOnboardingState = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const startOnboarding = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("userOnboarding", {
      userId: args.userId,
      currentStep: 0,
      completedSteps: [],
      answers: {},
      recommendedToolIds: [],
      isCompleted: false,
      startedAt: Date.now(),
    });
  },
});

export const updateOnboardingStep = mutation({
  args: {
    userId: v.string(),
    step: v.number(),
    answers: v.optional(v.object({
      experienceLevel: v.optional(v.union(
        v.literal("no-coding"),
        v.literal("some-coding"),
        v.literal("experienced")
      )),
      goal: v.optional(v.union(
        v.literal("learn"),
        v.literal("build-project"),
        v.literal("explore-tools")
      )),
      projectType: v.optional(v.string()),
      preferredIde: v.optional(v.string()),
      budget: v.optional(v.union(
        v.literal("free"),
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )),
    })),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding not started");
    }

    const completedSteps = onboarding.completedSteps.includes(args.step)
      ? onboarding.completedSteps
      : [...onboarding.completedSteps, args.step];

    const updatedAnswers = args.answers
      ? { ...onboarding.answers, ...args.answers }
      : onboarding.answers;

    await ctx.db.patch(onboarding._id, {
      currentStep: args.step + 1,
      completedSteps,
      answers: updatedAnswers,
    });

    return onboarding._id;
  },
});

export const completeOnboarding = mutation({
  args: {
    userId: v.string(),
    recommendedPathId: v.optional(v.id("learningPaths")),
    recommendedToolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding not started");
    }

    await ctx.db.patch(onboarding._id, {
      recommendedPathId: args.recommendedPathId,
      recommendedToolIds: args.recommendedToolIds,
      isCompleted: true,
      completedAt: Date.now(),
    });

    return onboarding._id;
  },
});

export const getRecommendations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!onboarding || !onboarding.isCompleted) return null;

    const recommendedPath = onboarding.recommendedPathId
      ? await ctx.db.get(onboarding.recommendedPathId)
      : null;

    const recommendedTools = await Promise.all(
      onboarding.recommendedToolIds.map((id) => ctx.db.get(id))
    );

    return {
      path: recommendedPath,
      tools: recommendedTools.filter(Boolean),
      answers: onboarding.answers,
    };
  },
});

export const generateRecommendations = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding not started");
    }

    const { experienceLevel, goal, budget } = onboarding.answers;

    const allTools = await ctx.db.query("tools").collect();
    const allPaths = await ctx.db
      .query("learningPaths")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    let recommendedToolIds: typeof allTools[0]["_id"][] = [];
    let recommendedPathId: typeof allPaths[0]["_id"] | undefined;

    const ideTools = allTools.filter((t) => 
      t.tags.includes("ide") || t.tags.includes("editor")
    );

    const aiTools = allTools.filter((t) => 
      t.tags.includes("ai") || t.tags.includes("llm")
    );

    if (experienceLevel === "no-coding") {
      const beginnerPaths = allPaths.filter((p) => p.difficulty === "beginner");
      if (beginnerPaths.length > 0) {
        recommendedPathId = beginnerPaths[0]._id;
      }

      const beginnerFriendlyIdes = ideTools.filter((t) => 
        t.bestFor.some((b) => b.toLowerCase().includes("beginner"))
      );
      if (beginnerFriendlyIdes.length > 0) {
        recommendedToolIds.push(beginnerFriendlyIdes[0]._id);
      } else if (ideTools.length > 0) {
        recommendedToolIds.push(ideTools[0]._id);
      }
    } else if (experienceLevel === "some-coding") {
      const intermediatePaths = allPaths.filter((p) => 
        p.difficulty === "beginner" || p.difficulty === "intermediate"
      );
      if (intermediatePaths.length > 0) {
        recommendedPathId = intermediatePaths[0]._id;
      }

      if (ideTools.length > 0) {
        recommendedToolIds.push(ideTools[0]._id);
      }
    } else {
      const advancedPaths = allPaths.filter((p) => p.difficulty === "advanced");
      if (advancedPaths.length > 0) {
        recommendedPathId = advancedPaths[0]._id;
      } else if (allPaths.length > 0) {
        recommendedPathId = allPaths[0]._id;
      }

      if (ideTools.length > 0) {
        recommendedToolIds.push(ideTools[0]._id);
      }
    }

    if (budget === "free") {
      const freeAiTools = aiTools.filter((t) => 
        t.pricingModel === "free" || t.pricingModel === "open_source"
      );
      if (freeAiTools.length > 0) {
        recommendedToolIds.push(freeAiTools[0]._id);
      }
    } else if (aiTools.length > 0) {
      recommendedToolIds.push(aiTools[0]._id);
    }

    if (goal === "build-project") {
      const dbTools = allTools.filter((t) => t.tags.includes("database"));
      if (dbTools.length > 0) {
        recommendedToolIds.push(dbTools[0]._id);
      }

      const deployTools = allTools.filter((t) => t.tags.includes("deployment"));
      if (deployTools.length > 0) {
        recommendedToolIds.push(deployTools[0]._id);
      }
    }

    recommendedToolIds = [...new Set(recommendedToolIds)].slice(0, 5);

    await ctx.db.patch(onboarding._id, {
      recommendedPathId,
      recommendedToolIds,
      isCompleted: true,
      completedAt: Date.now(),
    });

    const recommendedPath = recommendedPathId
      ? await ctx.db.get(recommendedPathId)
      : null;

    const recommendedTools = await Promise.all(
      recommendedToolIds.map((id) => ctx.db.get(id))
    );

    return {
      path: recommendedPath,
      tools: recommendedTools.filter(Boolean),
    };
  },
});

export const resetOnboarding = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (onboarding) {
      await ctx.db.delete(onboarding._id);
    }
  },
});
