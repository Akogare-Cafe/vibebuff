import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all tools
export const list = query({
  args: {
    categorySlug: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let toolsQuery = ctx.db.query("tools").filter((q) => q.eq(q.field("isActive"), true));
    
    const tools = await toolsQuery.collect();
    
    // If category filter, get category first
    if (args.categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();
      
      if (category) {
        return tools.filter((t) => t.categoryId === category._id).slice(0, args.limit || 50);
      }
    }
    
    return tools.slice(0, args.limit || 50);
  },
});

// Get featured tools
export const featured = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("tools")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
  },
});

// Get tool by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!tool) return null;
    
    // Get category
    const category = await ctx.db.get(tool.categoryId);
    
    // Get pricing tiers
    const pricingTiers = await ctx.db
      .query("pricingTiers")
      .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
      .collect();
    
    return {
      ...tool,
      category,
      pricingTiers,
    };
  },
});

// Search tools
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    const allTools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.tagline.toLowerCase().includes(searchTerm) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  },
});

// Get tools by category
export const byCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tools")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const listByCategory = query({
  args: { categorySlug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) return [];

    return await ctx.db
      .query("tools")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get database stats including last update time
export const getStats = query({
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    const categories = await ctx.db.query("categories").collect();
    
    let lastUpdated: number | null = null;
    for (const tool of tools) {
      if (!lastUpdated || tool._creationTime > lastUpdated) {
        lastUpdated = tool._creationTime;
      }
    }
    
    return {
      toolsCount: tools.length,
      categoriesCount: categories.length,
      lastUpdated,
    };
  },
});

export const getAllNamesAndSlugs = query({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return tools.map((tool) => ({
      name: tool.name,
      slug: tool.slug,
    }));
  },
});

export const updateScreenshots = mutation({
  args: {
    toolId: v.id("tools"),
    screenshots: v.array(v.object({
      url: v.string(),
      alt: v.optional(v.string()),
      caption: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolId, {
      screenshots: args.screenshots,
    });
  },
});

export const getAllForScreenshots = query({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return tools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      slug: tool.slug,
      websiteUrl: tool.websiteUrl,
      screenshots: tool.screenshots,
    }));
  },
});

export const getLatestTools = query({
  args: {
    limit: v.optional(v.number()),
    excludeCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const excludeSlugs = args.excludeCategories || [];
    
    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map((c) => [c._id, c]));
    const excludeCategoryIds = new Set(
      categories.filter((c) => excludeSlugs.includes(c.slug)).map((c) => c._id)
    );
    
    const allTools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
    
    const filteredTools = allTools
      .filter((tool) => !excludeCategoryIds.has(tool.categoryId))
      .slice(0, limit);
    
    return filteredTools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline,
      logoUrl: tool.logoUrl,
      pricingModel: tool.pricingModel,
      githubStars: tool.githubStars,
      npmDownloadsWeekly: tool.npmDownloadsWeekly,
      isOpenSource: tool.isOpenSource,
      category: categoryMap.get(tool.categoryId),
      websiteUrl: tool.websiteUrl,
      githubUrl: tool.githubUrl,
      releaseDate: tool.externalData?.github?.createdAt || tool.externalData?.npm?.firstPublished || null,
      _creationTime: tool._creationTime,
    }));
  },
});
