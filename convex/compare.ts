import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get tools for comparison by their IDs
export const getToolsForComparison = query({
  args: {
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const tools = await Promise.all(
      args.toolIds.map(async (id) => {
        const tool = await ctx.db.get(id);
        if (!tool) return null;

        const category = await ctx.db.get(tool.categoryId);
        const pricingTiers = await ctx.db
          .query("pricingTiers")
          .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
          .collect();

        return {
          ...tool,
          category,
          pricingTiers,
        };
      })
    );

    return tools.filter(Boolean);
  },
});

// Get tools for comparison by slugs
export const getToolsBySlug = query({
  args: {
    slugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const tools = await Promise.all(
      args.slugs.map(async (slug) => {
        const tool = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();

        if (!tool) return null;

        const category = await ctx.db.get(tool.categoryId);
        const pricingTiers = await ctx.db
          .query("pricingTiers")
          .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
          .collect();

        const calculatedStats = await calculateDynamicStats(ctx, tool);

        return {
          ...tool,
          category,
          pricingTiers,
          stats: calculatedStats,
        };
      })
    );

    return tools.filter(Boolean);
  },
});

async function calculateDynamicStats(
  ctx: { db: any },
  tool: {
    _id: any;
    githubStars?: number;
    npmDownloadsWeekly?: number;
    isOpenSource: boolean;
    pricingModel: "free" | "freemium" | "paid" | "open_source" | "enterprise";
    pros: string[];
    cons: string[];
    features: string[];
    tags: string[];
    isFeatured: boolean;
    stats?: { hp: number; attack: number; defense: number; speed: number; mana: number };
  }
) {
  const BASE_STAT = 20;
  const MAX_STAT = 100;
  const clamp = (v: number) => Math.min(Math.max(v, BASE_STAT), MAX_STAT);

  let hp = BASE_STAT;
  if (tool.githubStars) {
    if (tool.githubStars >= 50000) hp += 35;
    else if (tool.githubStars >= 20000) hp += 25;
    else if (tool.githubStars >= 10000) hp += 18;
    else if (tool.githubStars >= 5000) hp += 12;
    else if (tool.githubStars >= 1000) hp += 6;
  }
  if (tool.isOpenSource) hp += 10;
  if (tool.isFeatured) hp += 5;
  hp += Math.min(tool.features.length * 2, 15);

  let attack = BASE_STAT;
  attack += Math.min(tool.pros.length * 4, 20);
  if (tool.npmDownloadsWeekly) {
    if (tool.npmDownloadsWeekly >= 10000000) attack += 25;
    else if (tool.npmDownloadsWeekly >= 1000000) attack += 18;
    else if (tool.npmDownloadsWeekly >= 100000) attack += 12;
    else if (tool.npmDownloadsWeekly >= 10000) attack += 6;
  }
  attack += Math.min(tool.features.length, 10);

  let defense = BASE_STAT;
  if (tool.isOpenSource) defense += 15;
  defense -= Math.min(tool.cons.length * 3, 15);
  if (tool.pricingModel === "enterprise") defense += 12;
  else if (tool.pricingModel === "paid") defense += 8;
  else if (tool.pricingModel === "freemium") defense += 5;
  if (tool.githubStars && tool.githubStars >= 10000) defense += 10;

  let speed = BASE_STAT;
  if (tool.pricingModel === "free" || tool.pricingModel === "open_source") speed += 10;
  if (tool.npmDownloadsWeekly && tool.npmDownloadsWeekly >= 1000000) speed += 15;
  speed += Math.min(tool.tags.length * 2, 12);
  if (tool.features.length <= 5) speed += 8;
  else if (tool.features.length <= 10) speed += 4;

  let mana = BASE_STAT;
  mana += Math.min(tool.features.length * 3, 25);
  if (tool.isOpenSource) mana += 10;
  if (tool.pricingModel === "enterprise") mana += 15;
  else if (tool.pricingModel === "paid") mana += 10;
  else if (tool.pricingModel === "freemium") mana += 5;

  const usageRecords = await ctx.db
    .query("toolUsage")
    .filter((q: any) => q.eq(q.field("toolId"), tool._id))
    .collect();

  const masteryRecords = await ctx.db
    .query("toolMastery")
    .withIndex("by_tool", (q: any) => q.eq("toolId", tool._id))
    .collect();

  const totalViews = usageRecords.reduce((sum: number, r: any) => sum + r.usageCount, 0);
  const totalFavorites = usageRecords.filter((r: any) => r.isFavorite).length;
  const totalDeckAdds = masteryRecords.reduce((sum: number, r: any) => sum + r.interactions.deckAdds, 0);
  const totalBattleWins = masteryRecords.reduce((sum: number, r: any) => sum + r.interactions.battleWins, 0);
  const totalComparisons = masteryRecords.reduce((sum: number, r: any) => sum + r.interactions.comparisons, 0);

  const viewBonus = Math.min(Math.floor(totalViews / 50), 10);
  const favoriteBonus = Math.min(Math.floor(totalFavorites / 5), 10);
  const deckBonus = Math.min(Math.floor(totalDeckAdds / 10), 8);
  const battleBonus = Math.min(Math.floor(totalBattleWins / 5), 8);
  const comparisonBonus = Math.min(Math.floor(totalComparisons / 20), 5);

  return {
    hp: clamp(hp + viewBonus + favoriteBonus),
    attack: clamp(attack + battleBonus + deckBonus),
    defense: clamp(defense + favoriteBonus + comparisonBonus),
    speed: clamp(speed + viewBonus + comparisonBonus),
    mana: clamp(mana + deckBonus + battleBonus + favoriteBonus),
  };
}

// Save a comparison for later
export const saveComparison = mutation({
  args: {
    userId: v.optional(v.string()),
    toolIds: v.array(v.id("tools")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toolComparisons", {
      userId: args.userId,
      toolIds: args.toolIds,
      createdAt: Date.now(),
      name: args.name,
    });
  },
});

// Get user's saved comparisons
export const getSavedComparisons = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comparisons = await ctx.db
      .query("toolComparisons")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get tool names for each comparison
    const comparisonsWithTools = await Promise.all(
      comparisons.map(async (comp) => {
        const tools = await Promise.all(
          comp.toolIds.map((id) => ctx.db.get(id))
        );
        return {
          ...comp,
          tools: tools.filter(Boolean).map((t) => ({ name: t!.name, slug: t!.slug })),
        };
      })
    );

    return comparisonsWithTools;
  },
});

// Delete a saved comparison
export const deleteComparison = mutation({
  args: {
    comparisonId: v.id("toolComparisons"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.comparisonId);
  },
});

// Get comparison stats summary
export const getComparisonStats = query({
  args: {
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const tools = await Promise.all(
      args.toolIds.map((id) => ctx.db.get(id))
    );

    const validTools = tools.filter(Boolean);

    // Calculate comparison metrics
    const stats = {
      totalTools: validTools.length,
      openSourceCount: validTools.filter((t) => t!.isOpenSource).length,
      freeCount: validTools.filter((t) => t!.pricingModel === "free" || t!.pricingModel === "open_source").length,
      avgGithubStars: validTools.reduce((sum, t) => sum + (t!.githubStars || 0), 0) / validTools.length || 0,
      commonTags: getCommonTags(validTools as NonNullable<typeof validTools[0]>[]),
      commonFeatures: getCommonFeatures(validTools as NonNullable<typeof validTools[0]>[]),
    };

    return stats;
  },
});

function getCommonTags(tools: { tags: string[] }[]): string[] {
  if (tools.length === 0) return [];
  
  const tagCounts = new Map<string, number>();
  tools.forEach((tool) => {
    tool.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Return tags that appear in at least 2 tools
  return Array.from(tagCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag);
}

function getCommonFeatures(tools: { features: string[] }[]): string[] {
  if (tools.length === 0) return [];
  
  const featureCounts = new Map<string, number>();
  tools.forEach((tool) => {
    tool.features.forEach((feature) => {
      featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
    });
  });

  return Array.from(featureCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([feature]) => feature);
}
