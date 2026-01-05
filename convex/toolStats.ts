import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const BASE_STAT = 20;
const MAX_STAT = 100;

interface ToolMetadata {
  githubStars?: number;
  npmDownloadsWeekly?: number;
  isOpenSource: boolean;
  pricingModel: "free" | "freemium" | "paid" | "open_source" | "enterprise";
  pros: string[];
  cons: string[];
  features: string[];
  tags: string[];
  isFeatured: boolean;
}

interface ActivityMetrics {
  totalViews: number;
  totalFavorites: number;
  totalDeckAdds: number;
  totalBattleWins: number;
  totalComparisons: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function calculateBaseHP(meta: ToolMetadata): number {
  let hp = BASE_STAT;
  
  if (meta.githubStars) {
    if (meta.githubStars >= 50000) hp += 35;
    else if (meta.githubStars >= 20000) hp += 25;
    else if (meta.githubStars >= 10000) hp += 18;
    else if (meta.githubStars >= 5000) hp += 12;
    else if (meta.githubStars >= 1000) hp += 6;
  }
  
  if (meta.isOpenSource) hp += 10;
  if (meta.isFeatured) hp += 5;
  
  hp += Math.min(meta.features.length * 2, 15);
  
  return clamp(hp, BASE_STAT, MAX_STAT);
}

function calculateBaseAttack(meta: ToolMetadata): number {
  let attack = BASE_STAT;
  
  attack += Math.min(meta.pros.length * 4, 20);
  
  if (meta.npmDownloadsWeekly) {
    if (meta.npmDownloadsWeekly >= 10000000) attack += 25;
    else if (meta.npmDownloadsWeekly >= 1000000) attack += 18;
    else if (meta.npmDownloadsWeekly >= 100000) attack += 12;
    else if (meta.npmDownloadsWeekly >= 10000) attack += 6;
  }
  
  attack += Math.min(meta.features.length, 10);
  
  return clamp(attack, BASE_STAT, MAX_STAT);
}

function calculateBaseDefense(meta: ToolMetadata): number {
  let defense = BASE_STAT;
  
  if (meta.isOpenSource) defense += 15;
  
  const stabilityPenalty = Math.min(meta.cons.length * 3, 15);
  defense -= stabilityPenalty;
  
  if (meta.pricingModel === "enterprise") defense += 12;
  else if (meta.pricingModel === "paid") defense += 8;
  else if (meta.pricingModel === "freemium") defense += 5;
  
  if (meta.githubStars && meta.githubStars >= 10000) defense += 10;
  
  return clamp(defense, BASE_STAT, MAX_STAT);
}

function calculateBaseSpeed(meta: ToolMetadata): number {
  let speed = BASE_STAT;
  
  if (meta.pricingModel === "free" || meta.pricingModel === "open_source") {
    speed += 10;
  }
  
  if (meta.npmDownloadsWeekly && meta.npmDownloadsWeekly >= 1000000) {
    speed += 15;
  }
  
  speed += Math.min(meta.tags.length * 2, 12);
  
  if (meta.features.length <= 5) speed += 8;
  else if (meta.features.length <= 10) speed += 4;
  
  return clamp(speed, BASE_STAT, MAX_STAT);
}

function calculateBaseMana(meta: ToolMetadata): number {
  let mana = BASE_STAT;
  
  mana += Math.min(meta.features.length * 3, 25);
  
  if (meta.isOpenSource) mana += 10;
  
  if (meta.pricingModel === "enterprise") mana += 15;
  else if (meta.pricingModel === "paid") mana += 10;
  else if (meta.pricingModel === "freemium") mana += 5;
  
  return clamp(mana, BASE_STAT, MAX_STAT);
}

function calculateActivityBonus(activity: ActivityMetrics): {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  mana: number;
} {
  const viewBonus = Math.min(Math.floor(activity.totalViews / 50), 10);
  const favoriteBonus = Math.min(Math.floor(activity.totalFavorites / 5), 10);
  const deckBonus = Math.min(Math.floor(activity.totalDeckAdds / 10), 8);
  const battleBonus = Math.min(Math.floor(activity.totalBattleWins / 5), 8);
  const comparisonBonus = Math.min(Math.floor(activity.totalComparisons / 20), 5);
  
  return {
    hp: viewBonus + favoriteBonus,
    attack: battleBonus + deckBonus,
    defense: favoriteBonus + comparisonBonus,
    speed: viewBonus + comparisonBonus,
    mana: deckBonus + battleBonus + favoriteBonus,
  };
}

export const calculateToolStats = query({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;

    const meta: ToolMetadata = {
      githubStars: tool.githubStars,
      npmDownloadsWeekly: tool.npmDownloadsWeekly,
      isOpenSource: tool.isOpenSource,
      pricingModel: tool.pricingModel,
      pros: tool.pros,
      cons: tool.cons,
      features: tool.features,
      tags: tool.tags,
      isFeatured: tool.isFeatured,
    };

    const baseStats = {
      hp: calculateBaseHP(meta),
      attack: calculateBaseAttack(meta),
      defense: calculateBaseDefense(meta),
      speed: calculateBaseSpeed(meta),
      mana: calculateBaseMana(meta),
    };

    const usageRecords = await ctx.db
      .query("toolUsage")
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .collect();

    const masteryRecords = await ctx.db
      .query("toolMastery")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const activity: ActivityMetrics = {
      totalViews: usageRecords.reduce((sum, r) => sum + r.usageCount, 0),
      totalFavorites: usageRecords.filter((r) => r.isFavorite).length,
      totalDeckAdds: masteryRecords.reduce((sum, r) => sum + r.interactions.deckAdds, 0),
      totalBattleWins: masteryRecords.reduce((sum, r) => sum + r.interactions.battleWins, 0),
      totalComparisons: masteryRecords.reduce((sum, r) => sum + r.interactions.comparisons, 0),
    };

    const activityBonus = calculateActivityBonus(activity);

    const finalStats = {
      hp: clamp(baseStats.hp + activityBonus.hp, BASE_STAT, MAX_STAT),
      attack: clamp(baseStats.attack + activityBonus.attack, BASE_STAT, MAX_STAT),
      defense: clamp(baseStats.defense + activityBonus.defense, BASE_STAT, MAX_STAT),
      speed: clamp(baseStats.speed + activityBonus.speed, BASE_STAT, MAX_STAT),
      mana: clamp(baseStats.mana + activityBonus.mana, BASE_STAT, MAX_STAT),
    };

    return {
      baseStats,
      activityBonus,
      finalStats,
      activity,
    };
  },
});

export const getToolStatsWithBreakdown = query({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;

    const meta: ToolMetadata = {
      githubStars: tool.githubStars,
      npmDownloadsWeekly: tool.npmDownloadsWeekly,
      isOpenSource: tool.isOpenSource,
      pricingModel: tool.pricingModel,
      pros: tool.pros,
      cons: tool.cons,
      features: tool.features,
      tags: tool.tags,
      isFeatured: tool.isFeatured,
    };

    const baseStats = {
      hp: calculateBaseHP(meta),
      attack: calculateBaseAttack(meta),
      defense: calculateBaseDefense(meta),
      speed: calculateBaseSpeed(meta),
      mana: calculateBaseMana(meta),
    };

    const usageRecords = await ctx.db
      .query("toolUsage")
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .collect();

    const masteryRecords = await ctx.db
      .query("toolMastery")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const activity: ActivityMetrics = {
      totalViews: usageRecords.reduce((sum, r) => sum + r.usageCount, 0),
      totalFavorites: usageRecords.filter((r) => r.isFavorite).length,
      totalDeckAdds: masteryRecords.reduce((sum, r) => sum + r.interactions.deckAdds, 0),
      totalBattleWins: masteryRecords.reduce((sum, r) => sum + r.interactions.battleWins, 0),
      totalComparisons: masteryRecords.reduce((sum, r) => sum + r.interactions.comparisons, 0),
    };

    const activityBonus = calculateActivityBonus(activity);

    const finalStats = {
      hp: clamp(baseStats.hp + activityBonus.hp, BASE_STAT, MAX_STAT),
      attack: clamp(baseStats.attack + activityBonus.attack, BASE_STAT, MAX_STAT),
      defense: clamp(baseStats.defense + activityBonus.defense, BASE_STAT, MAX_STAT),
      speed: clamp(baseStats.speed + activityBonus.speed, BASE_STAT, MAX_STAT),
      mana: clamp(baseStats.mana + activityBonus.mana, BASE_STAT, MAX_STAT),
    };

    return {
      tool: {
        name: tool.name,
        slug: tool.slug,
      },
      baseStats,
      activityBonus,
      finalStats,
      activity,
      breakdown: {
        hp: {
          base: baseStats.hp,
          fromGithubStars: meta.githubStars ? Math.min(35, Math.floor(meta.githubStars / 1500)) : 0,
          fromOpenSource: meta.isOpenSource ? 10 : 0,
          fromFeatures: Math.min(meta.features.length * 2, 15),
          fromActivity: activityBonus.hp,
        },
        attack: {
          base: baseStats.attack,
          fromPros: Math.min(meta.pros.length * 4, 20),
          fromNpmDownloads: meta.npmDownloadsWeekly ? Math.min(25, Math.floor(meta.npmDownloadsWeekly / 400000)) : 0,
          fromActivity: activityBonus.attack,
        },
        defense: {
          base: baseStats.defense,
          fromOpenSource: meta.isOpenSource ? 15 : 0,
          fromPricing: meta.pricingModel === "enterprise" ? 12 : meta.pricingModel === "paid" ? 8 : 5,
          consPenalty: -Math.min(meta.cons.length * 3, 15),
          fromActivity: activityBonus.defense,
        },
        speed: {
          base: baseStats.speed,
          fromFreePricing: (meta.pricingModel === "free" || meta.pricingModel === "open_source") ? 10 : 0,
          fromPopularity: (meta.npmDownloadsWeekly && meta.npmDownloadsWeekly >= 1000000) ? 15 : 0,
          fromActivity: activityBonus.speed,
        },
        mana: {
          base: baseStats.mana,
          fromFeatures: Math.min(meta.features.length * 3, 25),
          fromOpenSource: meta.isOpenSource ? 10 : 0,
          fromActivity: activityBonus.mana,
        },
      },
    };
  },
});

export const recalculateAndSaveStats = mutation({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;

    const meta: ToolMetadata = {
      githubStars: tool.githubStars,
      npmDownloadsWeekly: tool.npmDownloadsWeekly,
      isOpenSource: tool.isOpenSource,
      pricingModel: tool.pricingModel,
      pros: tool.pros,
      cons: tool.cons,
      features: tool.features,
      tags: tool.tags,
      isFeatured: tool.isFeatured,
    };

    const baseStats = {
      hp: calculateBaseHP(meta),
      attack: calculateBaseAttack(meta),
      defense: calculateBaseDefense(meta),
      speed: calculateBaseSpeed(meta),
      mana: calculateBaseMana(meta),
    };

    const usageRecords = await ctx.db
      .query("toolUsage")
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .collect();

    const masteryRecords = await ctx.db
      .query("toolMastery")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const activity: ActivityMetrics = {
      totalViews: usageRecords.reduce((sum, r) => sum + r.usageCount, 0),
      totalFavorites: usageRecords.filter((r) => r.isFavorite).length,
      totalDeckAdds: masteryRecords.reduce((sum, r) => sum + r.interactions.deckAdds, 0),
      totalBattleWins: masteryRecords.reduce((sum, r) => sum + r.interactions.battleWins, 0),
      totalComparisons: masteryRecords.reduce((sum, r) => sum + r.interactions.comparisons, 0),
    };

    const activityBonus = calculateActivityBonus(activity);

    const finalStats = {
      hp: clamp(baseStats.hp + activityBonus.hp, BASE_STAT, MAX_STAT),
      attack: clamp(baseStats.attack + activityBonus.attack, BASE_STAT, MAX_STAT),
      defense: clamp(baseStats.defense + activityBonus.defense, BASE_STAT, MAX_STAT),
      speed: clamp(baseStats.speed + activityBonus.speed, BASE_STAT, MAX_STAT),
      mana: clamp(baseStats.mana + activityBonus.mana, BASE_STAT, MAX_STAT),
    };

    await ctx.db.patch(args.toolId, {
      stats: finalStats,
    });

    return finalStats;
  },
});

export const recalculateAllToolStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    
    for (const tool of tools) {
      const meta: ToolMetadata = {
        githubStars: tool.githubStars,
        npmDownloadsWeekly: tool.npmDownloadsWeekly,
        isOpenSource: tool.isOpenSource,
        pricingModel: tool.pricingModel,
        pros: tool.pros,
        cons: tool.cons,
        features: tool.features,
        tags: tool.tags,
        isFeatured: tool.isFeatured,
      };

      const baseStats = {
        hp: calculateBaseHP(meta),
        attack: calculateBaseAttack(meta),
        defense: calculateBaseDefense(meta),
        speed: calculateBaseSpeed(meta),
        mana: calculateBaseMana(meta),
      };

      const usageRecords = await ctx.db
        .query("toolUsage")
        .filter((q) => q.eq(q.field("toolId"), tool._id))
        .collect();

      const masteryRecords = await ctx.db
        .query("toolMastery")
        .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
        .collect();

      const activity: ActivityMetrics = {
        totalViews: usageRecords.reduce((sum, r) => sum + r.usageCount, 0),
        totalFavorites: usageRecords.filter((r) => r.isFavorite).length,
        totalDeckAdds: masteryRecords.reduce((sum, r) => sum + r.interactions.deckAdds, 0),
        totalBattleWins: masteryRecords.reduce((sum, r) => sum + r.interactions.battleWins, 0),
        totalComparisons: masteryRecords.reduce((sum, r) => sum + r.interactions.comparisons, 0),
      };

      const activityBonus = calculateActivityBonus(activity);

      const finalStats = {
        hp: clamp(baseStats.hp + activityBonus.hp, BASE_STAT, MAX_STAT),
        attack: clamp(baseStats.attack + activityBonus.attack, BASE_STAT, MAX_STAT),
        defense: clamp(baseStats.defense + activityBonus.defense, BASE_STAT, MAX_STAT),
        speed: clamp(baseStats.speed + activityBonus.speed, BASE_STAT, MAX_STAT),
        mana: clamp(baseStats.mana + activityBonus.mana, BASE_STAT, MAX_STAT),
      };

      await ctx.db.patch(tool._id, {
        stats: finalStats,
      });
    }

    return { updated: tools.length };
  },
});

export const getStatsFormula = query({
  args: {},
  handler: async () => {
    return {
      stats: {
        hp: {
          name: "HP (Health Points)",
          description: "Represents the tool's community strength and longevity",
          factors: [
            { name: "GitHub Stars", weight: "Up to +35 (50K+ stars)" },
            { name: "Open Source", weight: "+10" },
            { name: "Featured Status", weight: "+5" },
            { name: "Features Count", weight: "Up to +15" },
            { name: "User Views", weight: "Up to +10 (activity)" },
            { name: "User Favorites", weight: "Up to +10 (activity)" },
          ],
        },
        attack: {
          name: "ATK (Attack)",
          description: "Represents the tool's capability and power",
          factors: [
            { name: "Pros Count", weight: "Up to +20" },
            { name: "NPM Downloads", weight: "Up to +25 (10M+ weekly)" },
            { name: "Features Count", weight: "Up to +10" },
            { name: "Battle Wins", weight: "Up to +8 (activity)" },
            { name: "Deck Additions", weight: "Up to +8 (activity)" },
          ],
        },
        defense: {
          name: "DEF (Defense)",
          description: "Represents the tool's stability and reliability",
          factors: [
            { name: "Open Source", weight: "+15" },
            { name: "Pricing Model", weight: "Enterprise +12, Paid +8, Freemium +5" },
            { name: "GitHub Stars (10K+)", weight: "+10" },
            { name: "Cons Count", weight: "Penalty up to -15" },
            { name: "User Favorites", weight: "Up to +10 (activity)" },
            { name: "Comparisons", weight: "Up to +5 (activity)" },
          ],
        },
        speed: {
          name: "SPD (Speed)",
          description: "Represents the tool's ease of adoption and learning curve",
          factors: [
            { name: "Free/OSS Pricing", weight: "+10" },
            { name: "NPM Downloads (1M+)", weight: "+15" },
            { name: "Tags Count", weight: "Up to +12" },
            { name: "Minimal Features", weight: "Up to +8 (simplicity bonus)" },
            { name: "User Views", weight: "Up to +10 (activity)" },
            { name: "Comparisons", weight: "Up to +5 (activity)" },
          ],
        },
        mana: {
          name: "MANA",
          description: "Represents the tool's versatility and extensibility",
          factors: [
            { name: "Features Count", weight: "Up to +25" },
            { name: "Open Source", weight: "+10" },
            { name: "Pricing Model", weight: "Enterprise +15, Paid +10, Freemium +5" },
            { name: "Deck Additions", weight: "Up to +8 (activity)" },
            { name: "Battle Wins", weight: "Up to +8 (activity)" },
            { name: "User Favorites", weight: "Up to +10 (activity)" },
          ],
        },
      },
      activityGrowth: {
        description: "Stats grow over time based on user activity in the app",
        metrics: [
          { name: "Views", effect: "+1 HP/SPD per 50 views" },
          { name: "Favorites", effect: "+1 HP/DEF/MANA per 5 favorites" },
          { name: "Deck Additions", effect: "+1 ATK/MANA per 10 adds" },
          { name: "Battle Wins", effect: "+1 ATK/MANA per 5 wins" },
          { name: "Comparisons", effect: "+1 DEF/SPD per 20 comparisons" },
        ],
      },
      limits: {
        baseMin: BASE_STAT,
        max: MAX_STAT,
      },
    };
  },
});
