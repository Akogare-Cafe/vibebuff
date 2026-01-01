import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const trackEvent = mutation({
  args: {
    toolId: v.id("tools"),
    eventType: v.union(
      v.literal("view"),
      v.literal("click"),
      v.literal("favorite"),
      v.literal("deck_add"),
      v.literal("battle_pick"),
      v.literal("comparison")
    ),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("toolPopularityEvents", {
      toolId: args.toolId,
      eventType: args.eventType,
      userId: args.userId,
      sessionId: args.sessionId,
      timestamp: Date.now(),
    });

    const existing = await ctx.db
      .query("toolPopularity")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();

    if (existing) {
      const updates: Record<string, number> = {
        lastUpdated: Date.now(),
      };

      switch (args.eventType) {
        case "view":
          updates.views = existing.views + 1;
          updates.weeklyViews = existing.weeklyViews + 1;
          break;
        case "click":
          updates.clicks = existing.clicks + 1;
          updates.weeklyClicks = existing.weeklyClicks + 1;
          break;
        case "favorite":
          updates.favorites = existing.favorites + 1;
          break;
        case "deck_add":
          updates.deckAdds = existing.deckAdds + 1;
          break;
        case "battle_pick":
          updates.battlePicks = existing.battlePicks + 1;
          break;
        case "comparison":
          updates.comparisons = existing.comparisons + 1;
          break;
      }

      const newViews = updates.views ?? existing.views;
      const newClicks = updates.clicks ?? existing.clicks;
      const newFavorites = updates.favorites ?? existing.favorites;
      const newWeeklyViews = updates.weeklyViews ?? existing.weeklyViews;
      updates.trendScore = calculateTrendScore(newViews, newClicks, newFavorites, newWeeklyViews);

      await ctx.db.patch(existing._id, updates);
    } else {
      const initialStats = {
        toolId: args.toolId,
        views: args.eventType === "view" ? 1 : 0,
        clicks: args.eventType === "click" ? 1 : 0,
        favorites: args.eventType === "favorite" ? 1 : 0,
        deckAdds: args.eventType === "deck_add" ? 1 : 0,
        battlePicks: args.eventType === "battle_pick" ? 1 : 0,
        comparisons: args.eventType === "comparison" ? 1 : 0,
        weeklyViews: args.eventType === "view" ? 1 : 0,
        weeklyClicks: args.eventType === "click" ? 1 : 0,
        lastUpdated: Date.now(),
        trendScore: 0,
      };
      initialStats.trendScore = calculateTrendScore(
        initialStats.views,
        initialStats.clicks,
        initialStats.favorites,
        initialStats.weeklyViews
      );
      await ctx.db.insert("toolPopularity", initialStats);
    }
  },
});

function calculateTrendScore(
  views: number,
  clicks: number,
  favorites: number,
  weeklyViews: number
): number {
  return Math.round(
    views * 1 +
    clicks * 5 +
    favorites * 10 +
    weeklyViews * 2
  );
}

export const getLeaderboard = query({
  args: {
    sortBy: v.optional(v.union(
      v.literal("views"),
      v.literal("clicks"),
      v.literal("favorites"),
      v.literal("trend")
    )),
    limit: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy || "trend";
    const limit = args.limit || 20;

    let popularityRecords = await ctx.db.query("toolPopularity").collect();

    switch (sortBy) {
      case "views":
        popularityRecords.sort((a, b) => b.views - a.views);
        break;
      case "clicks":
        popularityRecords.sort((a, b) => b.clicks - a.clicks);
        break;
      case "favorites":
        popularityRecords.sort((a, b) => b.favorites - a.favorites);
        break;
      case "trend":
      default:
        popularityRecords.sort((a, b) => b.trendScore - a.trendScore);
        break;
    }

    const toolsWithPopularity = await Promise.all(
      popularityRecords.slice(0, limit * 2).map(async (pop) => {
        const tool = await ctx.db.get(pop.toolId);
        if (!tool || !tool.isActive) return null;

        if (args.categoryId && tool.categoryId !== args.categoryId) {
          return null;
        }

        const category = await ctx.db.get(tool.categoryId);
        return {
          ...tool,
          category,
          popularity: {
            views: pop.views,
            clicks: pop.clicks,
            favorites: pop.favorites,
            deckAdds: pop.deckAdds,
            battlePicks: pop.battlePicks,
            comparisons: pop.comparisons,
            trendScore: pop.trendScore,
            weeklyViews: pop.weeklyViews,
            weeklyClicks: pop.weeklyClicks,
          },
        };
      })
    );

    return toolsWithPopularity.filter(Boolean).slice(0, limit);
  },
});

export const getToolPopularity = query({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const popularity = await ctx.db
      .query("toolPopularity")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();

    if (!popularity) {
      return {
        views: 0,
        clicks: 0,
        favorites: 0,
        deckAdds: 0,
        battlePicks: 0,
        comparisons: 0,
        trendScore: 0,
        weeklyViews: 0,
        weeklyClicks: 0,
      };
    }

    return {
      views: popularity.views,
      clicks: popularity.clicks,
      favorites: popularity.favorites,
      deckAdds: popularity.deckAdds,
      battlePicks: popularity.battlePicks,
      comparisons: popularity.comparisons,
      trendScore: popularity.trendScore,
      weeklyViews: popularity.weeklyViews,
      weeklyClicks: popularity.weeklyClicks,
    };
  },
});

export const getTrendingTools = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const popularityRecords = await ctx.db.query("toolPopularity").collect();
    popularityRecords.sort((a, b) => b.weeklyViews + b.weeklyClicks - (a.weeklyViews + a.weeklyClicks));

    const trendingTools = await Promise.all(
      popularityRecords.slice(0, limit).map(async (pop) => {
        const tool = await ctx.db.get(pop.toolId);
        if (!tool || !tool.isActive) return null;

        const category = await ctx.db.get(tool.categoryId);
        return {
          ...tool,
          category,
          weeklyViews: pop.weeklyViews,
          weeklyClicks: pop.weeklyClicks,
          trendScore: pop.trendScore,
        };
      })
    );

    return trendingTools.filter(Boolean);
  },
});

export const getMostFavorited = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const popularityRecords = await ctx.db.query("toolPopularity").collect();
    popularityRecords.sort((a, b) => b.favorites - a.favorites);

    const favoritedTools = await Promise.all(
      popularityRecords.slice(0, limit).map(async (pop) => {
        const tool = await ctx.db.get(pop.toolId);
        if (!tool || !tool.isActive) return null;

        const category = await ctx.db.get(tool.categoryId);
        return {
          ...tool,
          category,
          favorites: pop.favorites,
        };
      })
    );

    return favoritedTools.filter(Boolean);
  },
});

export const getTopByCategory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;

    const categories = await ctx.db.query("categories").collect();
    const popularityRecords = await ctx.db.query("toolPopularity").collect();

    const result: Record<string, Array<{
      tool: Awaited<ReturnType<typeof ctx.db.get>>;
      popularity: { views: number; clicks: number; trendScore: number };
    }>> = {};

    for (const category of categories) {
      const categoryTools = await ctx.db
        .query("tools")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const toolIds = new Set(categoryTools.map((t) => t._id));

      const categoryPopularity = popularityRecords
        .filter((p) => toolIds.has(p.toolId))
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit);

      const toolsWithPop = await Promise.all(
        categoryPopularity.map(async (pop) => {
          const tool = await ctx.db.get(pop.toolId);
          return {
            tool,
            popularity: {
              views: pop.views,
              clicks: pop.clicks,
              trendScore: pop.trendScore,
            },
          };
        })
      );

      result[category.slug] = toolsWithPop.filter((t) => t.tool !== null);
    }

    return result;
  },
});

export const resetWeeklyStats = mutation({
  args: {},
  handler: async (ctx) => {
    const allPopularity = await ctx.db.query("toolPopularity").collect();

    for (const pop of allPopularity) {
      await ctx.db.patch(pop._id, {
        weeklyViews: 0,
        weeklyClicks: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});
