import { query } from "./_generated/server";
import { v } from "convex/values";

export const getToolsLeaderboard = query({
  args: {
    sortBy: v.optional(v.union(
      v.literal("stars"),
      v.literal("downloads"),
      v.literal("trending"),
      v.literal("favorites"),
      v.literal("usage")
    )),
    limit: v.optional(v.number()),
    categorySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy || "stars";
    const limit = args.limit || 25;

    let tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();
      
      if (category) {
        tools = tools.filter((t) => t.categoryId === category._id);
      }
    }

    const popularityRecords = await ctx.db.query("toolPopularity").collect();
    const popularityMap = new Map(popularityRecords.map((p) => [p.toolId.toString(), p]));

    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const toolsWithStats = tools.map((tool) => {
      const popularity = popularityMap.get(tool._id.toString());
      return {
        _id: tool._id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        logoUrl: tool.logoUrl,
        pricingModel: tool.pricingModel,
        isOpenSource: tool.isOpenSource,
        githubStars: tool.githubStars || 0,
        npmDownloadsWeekly: tool.npmDownloadsWeekly || 0,
        category: categoryMap.get(tool.categoryId.toString()),
        stats: {
          views: popularity?.views || 0,
          clicks: popularity?.clicks || 0,
          favorites: popularity?.favorites || 0,
          deckAdds: popularity?.deckAdds || 0,
          trendScore: popularity?.trendScore || 0,
          weeklyViews: popularity?.weeklyViews || 0,
        },
      };
    });

    switch (sortBy) {
      case "stars":
        toolsWithStats.sort((a, b) => b.githubStars - a.githubStars);
        break;
      case "downloads":
        toolsWithStats.sort((a, b) => b.npmDownloadsWeekly - a.npmDownloadsWeekly);
        break;
      case "trending":
        toolsWithStats.sort((a, b) => b.stats.trendScore - a.stats.trendScore);
        break;
      case "favorites":
        toolsWithStats.sort((a, b) => b.stats.favorites - a.stats.favorites);
        break;
      case "usage":
        toolsWithStats.sort((a, b) => b.stats.views - a.stats.views);
        break;
    }

    return toolsWithStats.slice(0, limit).map((tool, index) => ({
      rank: index + 1,
      ...tool,
    }));
  },
});

export const getStacksLeaderboard = query({
  args: {
    sortBy: v.optional(v.union(
      v.literal("upvotes"),
      v.literal("imports"),
      v.literal("views"),
      v.literal("newest")
    )),
    limit: v.optional(v.number()),
    projectType: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy || "upvotes";
    const limit = args.limit || 25;

    let stacks = await ctx.db.query("marketplaceStacks").collect();

    if (args.projectType) {
      stacks = stacks.filter((s) => s.projectType === args.projectType);
    }

    if (args.difficulty) {
      stacks = stacks.filter((s) => s.difficulty === args.difficulty);
    }

    switch (sortBy) {
      case "upvotes":
        stacks.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "imports":
        stacks.sort((a, b) => b.importCount - a.importCount);
        break;
      case "views":
        stacks.sort((a, b) => b.views - a.views);
        break;
      case "newest":
        stacks.sort((a, b) => b.publishedAt - a.publishedAt);
        break;
    }

    const stacksWithDetails = await Promise.all(
      stacks.slice(0, limit).map(async (stack, index) => {
        const build = await ctx.db.get(stack.buildId);
        const toolNames = build?.nodes
          ?.map((n: { data?: { label?: string } }) => n.data?.label)
          .filter(Boolean) || [];

        return {
          rank: index + 1,
          _id: stack._id,
          title: stack.title,
          description: stack.description,
          userId: stack.userId,
          tags: stack.tags,
          projectType: stack.projectType,
          difficulty: stack.difficulty,
          toolCount: stack.toolCount,
          upvotes: stack.upvotes,
          importCount: stack.importCount,
          views: stack.views,
          commentCount: stack.commentCount,
          isFeatured: stack.isFeatured,
          publishedAt: stack.publishedAt,
          toolNames: toolNames.slice(0, 5),
        };
      })
    );

    return stacksWithDetails;
  },
});

export const getTopToolsByCategory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    const categories = await ctx.db.query("categories").collect();
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    const popularityRecords = await ctx.db.query("toolPopularity").collect();
    const popularityMap = new Map(popularityRecords.map((p) => [p.toolId.toString(), p]));

    const result: Record<string, Array<{
      rank: number;
      _id: string;
      name: string;
      slug: string;
      tagline: string;
      logoUrl?: string;
      githubStars: number;
      trendScore: number;
    }>> = {};

    for (const category of categories) {
      const categoryTools = tools
        .filter((t) => t.categoryId === category._id)
        .map((tool) => {
          const popularity = popularityMap.get(tool._id.toString());
          return {
            _id: tool._id.toString(),
            name: tool.name,
            slug: tool.slug,
            tagline: tool.tagline,
            logoUrl: tool.logoUrl,
            githubStars: tool.githubStars || 0,
            trendScore: popularity?.trendScore || 0,
          };
        })
        .sort((a, b) => b.trendScore - a.trendScore || b.githubStars - a.githubStars)
        .slice(0, limit)
        .map((tool, index) => ({
          rank: index + 1,
          ...tool,
        }));

      if (categoryTools.length > 0) {
        result[category.slug] = categoryTools;
      }
    }

    return result;
  },
});

export const getLeaderboardStats = query({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const stacks = await ctx.db.query("marketplaceStacks").collect();
    const popularityRecords = await ctx.db.query("toolPopularity").collect();

    const totalStars = tools.reduce((sum, t) => sum + (t.githubStars || 0), 0);
    const totalDownloads = tools.reduce((sum, t) => sum + (t.npmDownloadsWeekly || 0), 0);
    const totalUpvotes = stacks.reduce((sum, s) => sum + s.upvotes, 0);
    const totalImports = stacks.reduce((sum, s) => sum + s.importCount, 0);
    const totalViews = popularityRecords.reduce((sum, p) => sum + p.views, 0);

    return {
      toolsCount: tools.length,
      stacksCount: stacks.length,
      totalStars,
      totalDownloads,
      totalUpvotes,
      totalImports,
      totalViews,
    };
  },
});
