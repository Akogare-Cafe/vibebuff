import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Save a quest result
export const saveQuest = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.string(),
    answers: v.object({
      projectType: v.string(),
      scale: v.string(),
      budget: v.string(),
      features: v.array(v.string()),
    }),
    recommendedToolIds: v.array(v.id("tools")),
    aiReasoning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const questId = await ctx.db.insert("questHistory", {
      userId: args.userId,
      sessionId: args.sessionId,
      answers: args.answers,
      recommendedToolIds: args.recommendedToolIds,
      aiReasoning: args.aiReasoning,
      createdAt: Date.now(),
      outcome: "pending",
    });

    // Update user profile if logged in
    if (args.userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId!))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, {
          questsCompleted: profile.questsCompleted + 1,
          xp: profile.xp + 25, // XP for completing a quest
        });
      }
    }

    return questId;
  },
});

// Get user's quest history
export const getUserQuestHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const quests = await ctx.db
      .query("questHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const questsWithTools = await Promise.all(
      quests.map(async (quest) => {
        const tools = await Promise.all(
          quest.recommendedToolIds.slice(0, 6).map((id) => ctx.db.get(id))
        );
        return {
          ...quest,
          tools: tools.filter(Boolean),
          toolCount: quest.recommendedToolIds.length,
        };
      })
    );

    return questsWithTools;
  },
});

// Get a specific quest
export const getQuest = query({
  args: { questId: v.id("questHistory") },
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest) return null;

    const tools = await Promise.all(
      quest.recommendedToolIds.map((id) => ctx.db.get(id))
    );

    return {
      ...quest,
      tools: tools.filter(Boolean),
    };
  },
});

// Update quest outcome
export const updateQuestOutcome = mutation({
  args: {
    questId: v.id("questHistory"),
    outcome: v.union(
      v.literal("shipped"),
      v.literal("in_progress"),
      v.literal("abandoned"),
      v.literal("pending")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questId, {
      outcome: args.outcome,
      outcomeNotes: args.notes,
    });

    // Bonus XP for shipping!
    if (args.outcome === "shipped") {
      const quest = await ctx.db.get(args.questId);
      if (quest?.userId) {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", quest.userId!))
          .first();

        if (profile) {
          await ctx.db.patch(profile._id, {
            xp: profile.xp + 100, // Bonus XP for shipping
          });
        }
      }
    }
  },
});

// Get quest by session ID (for anonymous users)
export const getQuestBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const quests = await ctx.db
      .query("questHistory")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    const questsWithTools = await Promise.all(
      quests.map(async (quest) => {
        const tools = await Promise.all(
          quest.recommendedToolIds.slice(0, 6).map((id) => ctx.db.get(id))
        );
        return {
          ...quest,
          tools: tools.filter(Boolean),
        };
      })
    );

    return questsWithTools;
  },
});

// Get quest statistics
export const getQuestStats = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let quests;
    if (args.userId) {
      quests = await ctx.db
        .query("questHistory")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      quests = await ctx.db.query("questHistory").collect();
    }

    const stats = {
      total: quests.length,
      shipped: quests.filter((q) => q.outcome === "shipped").length,
      inProgress: quests.filter((q) => q.outcome === "in_progress").length,
      abandoned: quests.filter((q) => q.outcome === "abandoned").length,
      pending: quests.filter((q) => q.outcome === "pending").length,
    };

    // Most common project types
    const projectTypeCounts = new Map<string, number>();
    for (const quest of quests) {
      const type = quest.answers.projectType;
      projectTypeCounts.set(type, (projectTypeCounts.get(type) || 0) + 1);
    }

    const topProjectTypes = Array.from(projectTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return { ...stats, topProjectTypes };
  },
});
