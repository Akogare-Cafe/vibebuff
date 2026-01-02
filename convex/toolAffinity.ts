import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const AFFINITY_LEVELS = [
  { level: "stranger", minPoints: 0 },
  { level: "acquaintance", minPoints: 50 },
  { level: "friend", minPoints: 200 },
  { level: "companion", minPoints: 500 },
  { level: "soulmate", minPoints: 1000 },
];

const AFFINITY_PERKS: Record<string, { name: string; description: string; bonus: string }[]> = {
  acquaintance: [
    { name: "Tool Insights", description: "See detailed usage statistics", bonus: "+5% battle stats" },
  ],
  friend: [
    { name: "Synergy Boost", description: "Enhanced synergy detection", bonus: "+10% battle stats" },
    { name: "Quick Add", description: "One-click add to any deck", bonus: "UI shortcut" },
  ],
  companion: [
    { name: "Battle Mastery", description: "Bonus damage in battles", bonus: "+15% battle stats" },
    { name: "Exclusive Tips", description: "Hidden tips and tricks", bonus: "Content unlock" },
    { name: "Priority Support", description: "Tool-specific recommendations", bonus: "AI priority" },
  ],
  soulmate: [
    { name: "Ultimate Bond", description: "Maximum battle effectiveness", bonus: "+25% battle stats" },
    { name: "Lore Access", description: "Full tool history and lore", bonus: "Content unlock" },
    { name: "Badge Display", description: "Show soulmate badge on profile", bonus: "Cosmetic" },
    { name: "Recommendation Weight", description: "Higher weight in AI recommendations", bonus: "AI boost" },
  ],
};

const INTERACTION_POINTS = {
  view: 1,
  deckAdd: 10,
  battleWin: 15,
  review: 25,
  recommendation: 5,
};

export const getUserAffinities = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const affinities = await ctx.db
      .query("userToolAffinity")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const toolIds = affinities.map((a) => a.toolId);
    const tools = await Promise.all(toolIds.map((id) => ctx.db.get(id)));
    const toolMap = new Map(tools.filter(Boolean).map((t) => [t!._id, t]));

    const unlockedPerks: { name: string; description: string; bonus: string }[] = [];
    const levelOrder = ["stranger", "acquaintance", "friend", "companion", "soulmate"];

    return affinities
      .map((affinity) => {
        const currentLevel = AFFINITY_LEVELS.find((l) => l.level === affinity.affinityLevel);
        const currentIndex = AFFINITY_LEVELS.findIndex((l) => l.level === affinity.affinityLevel);
        const nextLevel = AFFINITY_LEVELS[currentIndex + 1];

        let progress = 100;
        if (nextLevel && currentLevel) {
          const pointsInLevel = affinity.affinityPoints - currentLevel.minPoints;
          const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
          progress = Math.min(100, Math.floor((pointsInLevel / pointsNeeded) * 100));
        }

        const perks: { name: string; description: string; bonus: string }[] = [];
        const currentLevelIndex = levelOrder.indexOf(affinity.affinityLevel);
        for (let i = 1; i <= currentLevelIndex; i++) {
          const levelPerks = AFFINITY_PERKS[levelOrder[i]];
          if (levelPerks) {
            perks.push(...levelPerks);
          }
        }

        return {
          ...affinity,
          tool: toolMap.get(affinity.toolId),
          nextLevel: nextLevel?.level,
          progress,
          perks,
          nextPerks: nextLevel ? AFFINITY_PERKS[nextLevel.level] || [] : [],
        };
      })
      .sort((a, b) => b.affinityPoints - a.affinityPoints);
  },
});

export const getToolAffinity = query({
  args: { userId: v.string(), toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const affinity = await ctx.db
      .query("userToolAffinity")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (!affinity) {
      return {
        affinityLevel: "stranger",
        affinityPoints: 0,
        interactions: { views: 0, deckAdds: 0, battleWins: 0, reviews: 0, recommendations: 0 },
        nextLevel: "acquaintance",
        progress: 0,
      };
    }

    const currentIndex = AFFINITY_LEVELS.findIndex((l) => l.level === affinity.affinityLevel);
    const nextLevel = AFFINITY_LEVELS[currentIndex + 1];
    const currentLevel = AFFINITY_LEVELS[currentIndex];

    let progress = 100;
    if (nextLevel && currentLevel) {
      const pointsInLevel = affinity.affinityPoints - currentLevel.minPoints;
      const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
      progress = Math.min(100, Math.floor((pointsInLevel / pointsNeeded) * 100));
    }

    return {
      ...affinity,
      nextLevel: nextLevel?.level,
      progress,
    };
  },
});

export const recordInteraction = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
    interactionType: v.union(
      v.literal("view"),
      v.literal("deckAdd"),
      v.literal("battleWin"),
      v.literal("review"),
      v.literal("recommendation")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const points = INTERACTION_POINTS[args.interactionType];

    const existing = await ctx.db
      .query("userToolAffinity")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (existing) {
      const newPoints = existing.affinityPoints + points;
      const newInteractions = { ...existing.interactions };

      switch (args.interactionType) {
        case "view":
          newInteractions.views += 1;
          break;
        case "deckAdd":
          newInteractions.deckAdds += 1;
          break;
        case "battleWin":
          newInteractions.battleWins += 1;
          break;
        case "review":
          newInteractions.reviews += 1;
          break;
        case "recommendation":
          newInteractions.recommendations += 1;
          break;
      }

      const newLevel = AFFINITY_LEVELS.reduce(
        (acc, level) => (newPoints >= level.minPoints ? level.level : acc),
        "stranger"
      );

      const leveledUp = newLevel !== existing.affinityLevel;

      await ctx.db.patch(existing._id, {
        affinityPoints: newPoints,
        affinityLevel: newLevel as "stranger" | "acquaintance" | "friend" | "companion" | "soulmate",
        interactions: newInteractions,
        lastInteractionAt: now,
      });

      if (leveledUp) {
        const tool = await ctx.db.get(args.toolId);
        await ctx.db.insert("xpActivityLog", {
          userId: args.userId,
          amount: 50,
          source: "affinity_levelup",
          description: `Reached ${newLevel} affinity with ${tool?.name}`,
          timestamp: now,
        });

        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
          .first();

        if (profile) {
          await ctx.db.patch(profile._id, { xp: profile.xp + 50 });
        }
      }

      return { points: newPoints, level: newLevel, leveledUp };
    } else {
      const initialInteractions = {
        views: args.interactionType === "view" ? 1 : 0,
        deckAdds: args.interactionType === "deckAdd" ? 1 : 0,
        battleWins: args.interactionType === "battleWin" ? 1 : 0,
        reviews: args.interactionType === "review" ? 1 : 0,
        recommendations: args.interactionType === "recommendation" ? 1 : 0,
      };

      await ctx.db.insert("userToolAffinity", {
        userId: args.userId,
        toolId: args.toolId,
        affinityLevel: "stranger",
        affinityPoints: points,
        interactions: initialInteractions,
        unlockedPerks: [],
        firstInteractionAt: now,
        lastInteractionAt: now,
      });

      return { points, level: "stranger", leveledUp: false };
    }
  },
});

export const getTopAffinities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const affinities = await ctx.db
      .query("userToolAffinity")
      .withIndex("by_affinity", (q) => q.eq("affinityLevel", "soulmate"))
      .take(args.limit ?? 10);

    const userIds = [...new Set(affinities.map((a) => a.userId))];
    const toolIds = [...new Set(affinities.map((a) => a.toolId))];

    const profiles = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );
    const tools = await Promise.all(toolIds.map((id) => ctx.db.get(id)));

    const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.clerkId, p]));
    const toolMap = new Map(tools.filter(Boolean).map((t) => [t!._id, t]));

    return affinities.map((a) => ({
      ...a,
      user: profileMap.get(a.userId),
      tool: toolMap.get(a.toolId),
    }));
  },
});
