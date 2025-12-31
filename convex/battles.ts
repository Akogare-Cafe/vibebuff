import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default stats for tools that don't have them
const DEFAULT_STATS = {
  hp: 50,
  attack: 50,
  defense: 50,
  speed: 50,
  mana: 50,
};

// Calculate stats from tool data if not explicitly set
function calculateStats(tool: {
  githubStars?: number;
  isOpenSource: boolean;
  pricingModel: string;
  pros: string[];
  cons: string[];
}) {
  // HP: Based on community size (GitHub stars)
  const hp = tool.githubStars 
    ? Math.min(100, Math.floor(Math.log10(tool.githubStars) * 20))
    : 40;

  // Attack: Based on number of pros (features/power)
  const attack = Math.min(100, 40 + tool.pros.length * 10);

  // Defense: Based on being open source and stability indicators
  const defense = tool.isOpenSource ? 70 : 50;

  // Speed: Inverse of complexity (fewer cons = faster)
  const speed = Math.max(30, 90 - tool.cons.length * 15);

  // Mana: Cost efficiency (free = high mana)
  const manaMap: Record<string, number> = {
    free: 100,
    open_source: 95,
    freemium: 70,
    paid: 40,
    enterprise: 20,
  };
  const mana = manaMap[tool.pricingModel] || 50;

  return { hp, attack, defense, speed, mana };
}

// Get battle stats for a tool
export const getToolBattleStats = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;

    const stats = tool.stats || calculateStats(tool);
    const totalPower = stats.hp + stats.attack + stats.defense + stats.speed + stats.mana;

    return {
      tool,
      stats,
      totalPower,
      powerLevel: totalPower >= 400 ? "Legendary" : 
                  totalPower >= 300 ? "Epic" :
                  totalPower >= 200 ? "Rare" : "Common",
    };
  },
});

// Simulate a battle between two tools
export const simulateBattle = query({
  args: {
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    weights: v.optional(v.object({
      hp: v.number(),
      attack: v.number(),
      defense: v.number(),
      speed: v.number(),
      mana: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const tool1 = await ctx.db.get(args.tool1Id);
    const tool2 = await ctx.db.get(args.tool2Id);

    if (!tool1 || !tool2) return null;

    const stats1 = tool1.stats || calculateStats(tool1);
    const stats2 = tool2.stats || calculateStats(tool2);

    // Default weights (equal)
    const weights = args.weights || {
      hp: 1,
      attack: 1,
      defense: 1,
      speed: 1,
      mana: 1,
    };

    // Calculate weighted scores
    const score1 = 
      stats1.hp * weights.hp +
      stats1.attack * weights.attack +
      stats1.defense * weights.defense +
      stats1.speed * weights.speed +
      stats1.mana * weights.mana;

    const score2 = 
      stats2.hp * weights.hp +
      stats2.attack * weights.attack +
      stats2.defense * weights.defense +
      stats2.speed * weights.speed +
      stats2.mana * weights.mana;

    const winner = score1 >= score2 ? tool1 : tool2;
    const loser = score1 >= score2 ? tool2 : tool1;

    // Generate battle narrative
    const statComparisons = [
      { stat: "HP", val1: stats1.hp, val2: stats2.hp, winner: stats1.hp > stats2.hp ? tool1.name : tool2.name },
      { stat: "ATK", val1: stats1.attack, val2: stats2.attack, winner: stats1.attack > stats2.attack ? tool1.name : tool2.name },
      { stat: "DEF", val1: stats1.defense, val2: stats2.defense, winner: stats1.defense > stats2.defense ? tool1.name : tool2.name },
      { stat: "SPD", val1: stats1.speed, val2: stats2.speed, winner: stats1.speed > stats2.speed ? tool1.name : tool2.name },
      { stat: "MANA", val1: stats1.mana, val2: stats2.mana, winner: stats1.mana > stats2.mana ? tool1.name : tool2.name },
    ];

    return {
      tool1: { ...tool1, stats: stats1, score: score1 },
      tool2: { ...tool2, stats: stats2, score: score2 },
      winner,
      loser,
      scoreDiff: Math.abs(score1 - score2),
      statComparisons,
      weights,
    };
  },
});

// Save a battle result
export const saveBattle = mutation({
  args: {
    userId: v.optional(v.string()),
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    winnerId: v.id("tools"),
    tool1Score: v.number(),
    tool2Score: v.number(),
    weights: v.object({
      hp: v.number(),
      attack: v.number(),
      defense: v.number(),
      speed: v.number(),
      mana: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("battleHistory", {
      userId: args.userId,
      tool1Id: args.tool1Id,
      tool2Id: args.tool2Id,
      winnerId: args.winnerId,
      battleStats: {
        tool1Score: args.tool1Score,
        tool2Score: args.tool2Score,
        weights: args.weights,
      },
      createdAt: Date.now(),
    });
  },
});

// Get user's battle history
export const getUserBattleHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const battles = await ctx.db
      .query("battleHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    const battlesWithTools = await Promise.all(
      battles.map(async (battle) => {
        const tool1 = await ctx.db.get(battle.tool1Id);
        const tool2 = await ctx.db.get(battle.tool2Id);
        const winner = await ctx.db.get(battle.winnerId);
        return { ...battle, tool1, tool2, winner };
      })
    );

    return battlesWithTools;
  },
});

// Get global battle leaderboard
export const getBattleLeaderboard = query({
  handler: async (ctx) => {
    const battles = await ctx.db.query("battleHistory").collect();

    // Count wins per tool
    const winCounts = new Map<string, number>();
    const lossCounts = new Map<string, number>();

    for (const battle of battles) {
      const winnerId = battle.winnerId.toString();
      const loserId = (battle.tool1Id === battle.winnerId ? battle.tool2Id : battle.tool1Id).toString();
      
      winCounts.set(winnerId, (winCounts.get(winnerId) || 0) + 1);
      lossCounts.set(loserId, (lossCounts.get(loserId) || 0) + 1);
    }

    // Get unique tool IDs
    const toolIds = new Set([...winCounts.keys(), ...lossCounts.keys()]);
    
    const leaderboard = await Promise.all(
      Array.from(toolIds).map(async (toolId) => {
        const tool = await ctx.db.get(toolId as any);
        const wins = winCounts.get(toolId) || 0;
        const losses = lossCounts.get(toolId) || 0;
        const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;
        return { tool, wins, losses, winRate };
      })
    );

    return leaderboard
      .filter((l) => l.tool !== null)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);
  },
});
