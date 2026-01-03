import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("available"), v.literal("in_progress"), v.literal("completed"))),
    difficulty: v.optional(v.union(v.literal("novice"), v.literal("adept"), v.literal("master"))),
    classType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let quests = await ctx.db.query("dailyQuests").collect();
    
    if (args.status) {
      quests = quests.filter(q => q.status === args.status);
    }
    if (args.difficulty) {
      quests = quests.filter(q => q.difficulty === args.difficulty);
    }
    if (args.classType && args.classType !== "all") {
      quests = quests.filter(q => q.classType === args.classType || q.classType === "general");
    }
    
    return quests;
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const featured = await ctx.db
      .query("dailyQuests")
      .filter(q => q.eq(q.field("isFeatured"), true))
      .first();
    return featured;
  },
});

export const getWeeklyChallenge = query({
  args: {},
  handler: async (ctx) => {
    const challenge = await ctx.db
      .query("weeklyChallenges")
      .order("desc")
      .first();
    return challenge;
  },
});

export const getUserQuestStats = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return {
        streak: 0,
        points: 0,
        level: 1,
        levelTitle: "Novice",
        xpProgress: 0,
        inProgressCount: 0,
      };
    }
    
    const stats = await ctx.db
      .query("userQuestStats")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
    
    return stats || {
      streak: 0,
      points: 0,
      level: 1,
      levelTitle: "Novice",
      xpProgress: 0,
      inProgressCount: 0,
    };
  },
});

export const startQuest = mutation({
  args: { questId: v.id("dailyQuests"), userId: v.string() },
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest) throw new Error("Quest not found");
    
    const existing = await ctx.db
      .query("userQuestProgress")
      .filter(q => 
        q.and(
          q.eq(q.field("questId"), args.questId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    const progressId = await ctx.db.insert("userQuestProgress", {
      questId: args.questId,
      userId: args.userId,
      status: "in_progress",
      progress: 0,
      startedAt: Date.now(),
    });
    
    return progressId;
  },
});

export const getUserQuestProgress = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    const progress = await ctx.db
      .query("userQuestProgress")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
    
    return progress;
  },
});

export const getResetTimer = query({
  args: {},
  handler: async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      formatted: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    };
  },
});
