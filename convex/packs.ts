import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get available pack types
export const getPackTypes = query({
  args: {},
  handler: async (ctx) => {
    const packs = await ctx.db
      .query("packTypes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return packs;
  },
});

// Get user's collection
export const getUserCollection = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query("userCollection")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const collectionWithTools = await Promise.all(
      collection.map(async (c) => {
        const tool = await ctx.db.get(c.toolId);
        return { ...c, tool };
      })
    );

    return collectionWithTools;
  },
});

// Get user's pack opening history
export const getPackHistory = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("userPackOpens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 20);

    const historyWithDetails = await Promise.all(
      history.map(async (h) => {
        const packType = await ctx.db.get(h.packTypeId);
        const tools = await Promise.all(
          h.toolsRevealed.map((id) => ctx.db.get(id))
        );
        return { ...h, packType, tools: tools.filter(Boolean) };
      })
    );

    return historyWithDetails;
  },
});

// Check if user can open a free pack today
export const canOpenFreePack = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const freePack = await ctx.db
      .query("packTypes")
      .withIndex("by_slug", (q) => q.eq("slug", "daily-free"))
      .first();

    if (!freePack) return { canOpen: false, reason: "No free pack available" };

    const todayOpens = await ctx.db
      .query("userPackOpens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("packTypeId"), freePack._id),
          q.gte(q.field("openedAt"), todayStart)
        )
      )
      .collect();

    return {
      canOpen: todayOpens.length === 0,
      reason: todayOpens.length > 0 ? "Already opened today" : null,
      nextOpenAt: todayOpens.length > 0 ? todayStart + 24 * 60 * 60 * 1000 : null,
    };
  },
});

// Open a pack
export const openPack = mutation({
  args: {
    userId: v.string(),
    packTypeSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const packType = await ctx.db
      .query("packTypes")
      .withIndex("by_slug", (q) => q.eq("slug", args.packTypeSlug))
      .first();

    if (!packType) throw new Error("Pack type not found");
    if (!packType.isActive) throw new Error("Pack type not available");

    // Get all tools (optionally filtered by category)
    let toolsQuery = ctx.db.query("tools").filter((q) => q.eq(q.field("isActive"), true));
    const allTools = await toolsQuery.collect();

    if (allTools.length === 0) throw new Error("No tools available");

    // Assign rarity to tools based on GitHub stars or other metrics
    const toolsWithRarity = allTools.map((tool) => {
      let rarity: "common" | "uncommon" | "rare" | "legendary";
      const stars = tool.githubStars || 0;
      if (stars > 50000) rarity = "legendary";
      else if (stars > 20000) rarity = "rare";
      else if (stars > 5000) rarity = "uncommon";
      else rarity = "common";
      return { ...tool, rarity };
    });

    // Select tools based on rarity weights
    const selectedTools: typeof allTools = [];
    const weights = packType.rarityWeights;
    const totalWeight = weights.common + weights.uncommon + weights.rare + weights.legendary;

    for (let i = 0; i < packType.cardCount; i++) {
      const roll = Math.random() * totalWeight;
      let targetRarity: "common" | "uncommon" | "rare" | "legendary";

      if (roll < weights.legendary) targetRarity = "legendary";
      else if (roll < weights.legendary + weights.rare) targetRarity = "rare";
      else if (roll < weights.legendary + weights.rare + weights.uncommon) targetRarity = "uncommon";
      else targetRarity = "common";

      const candidates = toolsWithRarity.filter((t) => t.rarity === targetRarity);
      if (candidates.length > 0) {
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        selectedTools.push(selected);
      } else {
        // Fallback to any tool
        const selected = allTools[Math.floor(Math.random() * allTools.length)];
        selectedTools.push(selected);
      }
    }

    const toolIds = selectedTools.map((t) => t._id);

    // Record the pack open
    await ctx.db.insert("userPackOpens", {
      userId: args.userId,
      packTypeId: packType._id,
      toolsRevealed: toolIds,
      openedAt: Date.now(),
    });

    // Add to user collection (check for duplicates)
    const newTools: typeof selectedTools = [];
    for (const tool of selectedTools) {
      const existing = await ctx.db
        .query("userCollection")
        .withIndex("by_user_tool", (q) =>
          q.eq("userId", args.userId).eq("toolId", tool._id)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("userCollection", {
          userId: args.userId,
          toolId: tool._id,
          obtainedAt: Date.now(),
          obtainedFrom: "pack",
          isNew: true,
        });
        newTools.push(tool);
      }
    }

    return {
      tools: selectedTools,
      newTools,
      duplicates: selectedTools.length - newTools.length,
    };
  },
});

// Seed pack types
export const seedPackTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const packTypes = [
      {
        slug: "daily-free",
        name: "Daily Pack",
        description: "One free pack every day! Contains 3 random tools.",
        cost: "free" as const,
        cardCount: 3,
        rarityWeights: { common: 70, uncommon: 20, rare: 8, legendary: 2 },
        isActive: true,
      },
      {
        slug: "starter-pack",
        name: "Starter Pack",
        description: "Perfect for beginners. 5 tools with guaranteed uncommon+.",
        cost: "free" as const,
        cardCount: 5,
        rarityWeights: { common: 40, uncommon: 40, rare: 15, legendary: 5 },
        isActive: true,
      },
      {
        slug: "premium-pack",
        name: "Premium Pack",
        description: "Higher chances for rare and legendary tools!",
        cost: "premium" as const,
        cardCount: 5,
        rarityWeights: { common: 20, uncommon: 40, rare: 30, legendary: 10 },
        isActive: true,
      },
      {
        slug: "legendary-pack",
        name: "Legendary Pack",
        description: "Guaranteed legendary tool! Plus 4 rare+ tools.",
        cost: "premium" as const,
        cardCount: 5,
        rarityWeights: { common: 0, uncommon: 0, rare: 80, legendary: 20 },
        isActive: true,
      },
    ];

    let seeded = 0;
    for (const pack of packTypes) {
      const existing = await ctx.db
        .query("packTypes")
        .withIndex("by_slug", (q) => q.eq("slug", pack.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("packTypes", pack);
        seeded++;
      }
    }

    return { seeded };
  },
});

// Mark collection item as seen (not new)
export const markAsSeen = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("userCollection")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (item && item.isNew) {
      await ctx.db.patch(item._id, { isNew: false });
    }
  },
});

// Mark all collection items as seen
export const markAllAsSeen = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const newItems = await ctx.db
      .query("userCollection")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isNew"), true))
      .collect();

    for (const item of newItems) {
      await ctx.db.patch(item._id, { isNew: false });
    }

    return { marked: newItems.length };
  },
});

// Get collection stats
export const getCollectionStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query("userCollection")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allTools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const categories = await ctx.db.query("categories").collect();

    const collectionWithTools = await Promise.all(
      collection.map(async (c) => {
        const tool = await ctx.db.get(c.toolId);
        return { ...c, tool };
      })
    );

    const validCollection = collectionWithTools.filter((c) => c.tool !== null);

    const byRarity = {
      legendary: validCollection.filter((c) => (c.tool?.githubStars || 0) > 50000).length,
      rare: validCollection.filter((c) => {
        const stars = c.tool?.githubStars || 0;
        return stars > 20000 && stars <= 50000;
      }).length,
      uncommon: validCollection.filter((c) => {
        const stars = c.tool?.githubStars || 0;
        return stars > 5000 && stars <= 20000;
      }).length,
      common: validCollection.filter((c) => (c.tool?.githubStars || 0) <= 5000).length,
    };

    const byCategory = categories.map((cat) => ({
      category: cat,
      collected: validCollection.filter((c) => c.tool?.categoryId === cat._id).length,
      total: allTools.filter((t) => t.categoryId === cat._id).length,
    }));

    return {
      collected: collection.length,
      total: allTools.length,
      newCount: collection.filter((c) => c.isNew).length,
      completionPercent: Math.round((collection.length / allTools.length) * 100),
      byRarity,
      byCategory: byCategory.filter((c) => c.total > 0),
    };
  },
});
