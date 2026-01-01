import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getToolLore = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const lore = await ctx.db
      .query("toolLore")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();

    if (!lore) return null;

    const relatedTools = await Promise.all(
      lore.relatedTools.map((id) => ctx.db.get(id))
    );

    return {
      ...lore,
      relatedTools: relatedTools.filter(Boolean),
    };
  },
});

export const getUserLoreUnlocks = query({
  args: { userId: v.string(), toolId: v.optional(v.id("tools")) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("loreUnlocks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.toolId) {
      query = query.filter((q) => q.eq(q.field("toolId"), args.toolId));
    }

    return query.collect();
  },
});

export const unlockLoreSection = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("loreUnlocks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .first();

    if (existing) {
      if (!existing.unlockedSections.includes(args.section)) {
        await ctx.db.patch(existing._id, {
          unlockedSections: [...existing.unlockedSections, args.section],
        });
      }
      return existing._id;
    }

    return ctx.db.insert("loreUnlocks", {
      userId: args.userId,
      toolId: args.toolId,
      unlockedSections: [args.section],
      unlockedAt: Date.now(),
    });
  },
});

export const createToolLore = mutation({
  args: {
    toolId: v.id("tools"),
    originStory: v.string(),
    creatorInfo: v.optional(v.object({
      name: v.string(),
      bio: v.string(),
      quote: v.optional(v.string()),
    })),
    eras: v.array(v.object({
      version: v.string(),
      name: v.string(),
      description: v.string(),
      releaseDate: v.number(),
      majorChanges: v.array(v.string()),
    })),
    funFacts: v.array(v.string()),
    relatedTools: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("toolLore")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return ctx.db.insert("toolLore", args);
  },
});

export const getEncyclopediaProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allLore = await ctx.db.query("toolLore").collect();
    const userUnlocks = await ctx.db
      .query("loreUnlocks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalSections = allLore.reduce((sum, lore) => {
      return sum + 1 + (lore.creatorInfo ? 1 : 0) + lore.eras.length + lore.funFacts.length;
    }, 0);

    const unlockedSections = userUnlocks.reduce((sum, unlock) => {
      return sum + unlock.unlockedSections.length;
    }, 0);

    return {
      totalTools: allLore.length,
      toolsDiscovered: userUnlocks.length,
      totalSections,
      unlockedSections,
      completionPercent: totalSections > 0 ? Math.round((unlockedSections / totalSections) * 100) : 0,
    };
  },
});

export const seedLore = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").take(5);

    for (const tool of tools) {
      const existing = await ctx.db
        .query("toolLore")
        .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
        .first();

      if (!existing) {
        await ctx.db.insert("toolLore", {
          toolId: tool._id,
          originStory: `${tool.name} was created to solve a fundamental problem in web development. Its journey from a small project to a widely-adopted tool is a testament to the power of open source.`,
          creatorInfo: {
            name: "The Community",
            bio: "Built by developers, for developers.",
            quote: "We wanted to make development easier for everyone.",
          },
          eras: [
            {
              version: "1.0",
              name: "The Beginning",
              description: "The initial release that started it all.",
              releaseDate: Date.now() - 365 * 24 * 60 * 60 * 1000 * 3,
              majorChanges: ["Initial release", "Core functionality"],
            },
            {
              version: "2.0",
              name: "The Evolution",
              description: "Major improvements and new features.",
              releaseDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
              majorChanges: ["Performance improvements", "New API", "Better DX"],
            },
          ],
          funFacts: [
            "The name was chosen after a late-night brainstorming session.",
            "The first commit was made on a weekend.",
            "It has been downloaded millions of times.",
          ],
          relatedTools: [],
        });
      }
    }

    return { seeded: tools.length };
  },
});
