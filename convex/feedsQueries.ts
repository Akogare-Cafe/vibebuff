import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sources;
    
    if (args.category) {
      sources = await ctx.db
        .query("feedSources")
        .withIndex("by_category", (q) => q.eq("category", args.category as "ai_news" | "dev_tools" | "frameworks" | "releases" | "tutorials" | "blogs" | "podcasts" | "newsletters"))
        .collect();
    } else {
      sources = await ctx.db.query("feedSources").collect();
    }

    if (args.limit) {
      sources = sources.slice(0, args.limit);
    }

    return sources;
  },
});

export const getItems = query({
  args: {
    sourceId: v.optional(v.id("feedSources")),
    limit: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.featured) {
      items = await ctx.db
        .query("feedItems")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .order("desc")
        .take(args.limit || 20);
    } else if (args.sourceId) {
      items = await ctx.db
        .query("feedItems")
        .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      items = await ctx.db
        .query("feedItems")
        .withIndex("by_published")
        .order("desc")
        .take(args.limit || 50);
    }

    return items;
  },
});

export const getLatestItems = query({
  args: {
    limit: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    
    let items = await ctx.db
      .query("feedItems")
      .withIndex("by_published")
      .order("desc")
      .take(limit * 2);

    if (args.categories && args.categories.length > 0) {
      const sources = await ctx.db.query("feedSources").collect();
      const sourceIdsByCategory = new Set(
        sources
          .filter((s) => args.categories!.includes(s.category))
          .map((s) => s._id)
      );
      items = items.filter((item) => sourceIdsByCategory.has(item.sourceId));
    }

    const sourceIds = [...new Set(items.map((item) => item.sourceId))];
    const sources = await Promise.all(sourceIds.map((id) => ctx.db.get(id)));
    const sourceMap = new Map(sources.filter(Boolean).map((s) => [s!._id, s!]));

    return items.slice(0, limit).map((item) => ({
      ...item,
      source: sourceMap.get(item.sourceId),
    }));
  },
});

export const toggleFeature = mutation({
  args: {
    itemId: v.id("feedItems"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, { isFeatured: args.isFeatured });
  },
});

export const addSource = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    url: v.string(),
    feedType: v.union(
      v.literal("rss"),
      v.literal("atom"),
      v.literal("json"),
      v.literal("api")
    ),
    category: v.union(
      v.literal("ai_news"),
      v.literal("dev_tools"),
      v.literal("frameworks"),
      v.literal("releases"),
      v.literal("tutorials"),
      v.literal("blogs"),
      v.literal("podcasts"),
      v.literal("newsletters")
    ),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    pollIntervalMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("feedSources")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Feed source with this slug already exists");
    }

    return await ctx.db.insert("feedSources", {
      name: args.name,
      slug: args.slug,
      url: args.url,
      feedType: args.feedType,
      category: args.category,
      description: args.description,
      websiteUrl: args.websiteUrl,
      isActive: true,
      pollIntervalMinutes: args.pollIntervalMinutes || 60,
      itemCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const toggleSourceActive = mutation({
  args: {
    sourceId: v.id("feedSources"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

export const deleteSource = mutation({
  args: {
    sourceId: v.id("feedSources"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("feedItems")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.sourceId);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const sources = await ctx.db.query("feedSources").collect();
    const activeSources = sources.filter((s) => s.isActive);
    
    const totalItems = sources.reduce((sum, s) => sum + s.itemCount, 0);
    
    const categoryCounts = sources.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentItems = await ctx.db
      .query("feedItems")
      .withIndex("by_published")
      .order("desc")
      .take(1);

    return {
      totalSources: sources.length,
      activeSources: activeSources.length,
      totalItems,
      categoryCounts,
      lastItemAt: recentItems[0]?.publishedAt,
    };
  },
});

export const getSourceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedSources")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getItemById = query({
  args: { itemId: v.id("feedItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return null;
    
    const source = await ctx.db.get(item.sourceId);
    return { ...item, source };
  },
});
