import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getWhispersForTool = query({
  args: { toolId: v.id("tools"), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const whispers = await ctx.db
      .query("toolWhispers")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    if (!args.userId) {
      return whispers.map((w) => ({
        ...w,
        content: w.isVerified ? w.content : "???",
        isLocked: !w.isVerified,
      }));
    }

    const unlocks = await ctx.db
      .query("whisperUnlocks")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId!).eq("toolId", args.toolId)
      )
      .first();

    const unlockedIds = new Set(unlocks?.unlockedWhisperIds ?? []);

    return whispers.map((w) => ({
      ...w,
      content: unlockedIds.has(w._id) || w.isVerified ? w.content : "???",
      isLocked: !unlockedIds.has(w._id) && !w.isVerified,
    }));
  },
});

export const getUnlockedWhispers = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unlocks = await ctx.db
      .query("whisperUnlocks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allWhisperIds = unlocks.flatMap((u) => u.unlockedWhisperIds);
    const whispers = await Promise.all(
      allWhisperIds.map((id) => ctx.db.get(id))
    );

    const toolIds = [...new Set(unlocks.map((u) => u.toolId))];
    const tools = await Promise.all(toolIds.map((id) => ctx.db.get(id)));
    const toolMap = new Map(tools.filter(Boolean).map((t) => [t!._id, t]));

    return whispers.filter(Boolean).map((w) => ({
      ...w,
      tool: toolMap.get(w!.toolId),
    }));
  },
});

export const unlockWhisper = mutation({
  args: { userId: v.string(), toolId: v.id("tools"), whisperId: v.id("toolWhispers") },
  handler: async (ctx, args) => {
    const whisper = await ctx.db.get(args.whisperId);
    if (!whisper) throw new Error("Whisper not found");
    if (whisper.toolId !== args.toolId) throw new Error("Whisper does not belong to this tool");

    const existing = await ctx.db
      .query("whisperUnlocks")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (existing) {
      if (existing.unlockedWhisperIds.includes(args.whisperId)) {
        return { alreadyUnlocked: true };
      }

      await ctx.db.patch(existing._id, {
        unlockedWhisperIds: [...existing.unlockedWhisperIds, args.whisperId],
        unlockedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("whisperUnlocks", {
        userId: args.userId,
        toolId: args.toolId,
        unlockedWhisperIds: [args.whisperId],
        unlockedAt: Date.now(),
      });
    }

    await ctx.db.insert("xpActivityLog", {
      userId: args.userId,
      amount: 10,
      source: "whisper_unlock",
      description: `Unlocked a ${whisper.whisperType} whisper`,
      timestamp: Date.now(),
    });

    return { unlocked: true, whisper };
  },
});

export const submitWhisper = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
    whisperType: v.union(
      v.literal("pro_tip"),
      v.literal("hidden_feature"),
      v.literal("gotcha"),
      v.literal("best_practice"),
      v.literal("performance_tip"),
      v.literal("cost_saving")
    ),
    content: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) throw new Error("Tool not found");

    const whisperId = await ctx.db.insert("toolWhispers", {
      toolId: args.toolId,
      whisperType: args.whisperType,
      content: args.content,
      source: args.source,
      upvotes: 0,
      isVerified: false,
      createdBy: args.userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("xpActivityLog", {
      userId: args.userId,
      amount: 25,
      source: "whisper_submit",
      description: `Submitted a whisper for ${tool.name}`,
      timestamp: Date.now(),
    });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { xp: profile.xp + 25 });
    }

    return { whisperId };
  },
});

export const upvoteWhisper = mutation({
  args: { userId: v.string(), whisperId: v.id("toolWhispers") },
  handler: async (ctx, args) => {
    const whisper = await ctx.db.get(args.whisperId);
    if (!whisper) throw new Error("Whisper not found");

    await ctx.db.patch(args.whisperId, {
      upvotes: whisper.upvotes + 1,
    });

    if (whisper.upvotes + 1 >= 10 && !whisper.isVerified) {
      await ctx.db.patch(args.whisperId, { isVerified: true });
    }

    return { newUpvotes: whisper.upvotes + 1 };
  },
});

export const seedWhispers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("toolWhispers").first();
    if (existing) return { message: "Whispers already seeded" };

    const tools = await ctx.db.query("tools").take(5);
    if (tools.length === 0) return { message: "No tools to create whispers for" };

    const whisperData = [
      { whisperType: "pro_tip" as const, content: "Use the built-in caching layer for 10x faster queries" },
      { whisperType: "hidden_feature" as const, content: "There's an undocumented --turbo flag that speeds up builds" },
      { whisperType: "gotcha" as const, content: "Watch out for memory leaks when using this with large datasets" },
      { whisperType: "best_practice" as const, content: "Always wrap async operations in try-catch for better error handling" },
      { whisperType: "performance_tip" as const, content: "Enable lazy loading to reduce initial bundle size by 40%" },
      { whisperType: "cost_saving" as const, content: "The hobby tier is often enough for projects under 10k MAU" },
    ];

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      const whisper = whisperData[i % whisperData.length];

      await ctx.db.insert("toolWhispers", {
        toolId: tool._id,
        whisperType: whisper.whisperType,
        content: whisper.content,
        upvotes: Math.floor(Math.random() * 20),
        isVerified: Math.random() > 0.5,
        createdAt: Date.now(),
      });
    }

    return { message: "Whispers seeded successfully" };
  },
});
