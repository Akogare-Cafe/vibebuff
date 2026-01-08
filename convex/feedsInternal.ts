import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getActiveFeedSources = internalQuery({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sources = await ctx.db
      .query("feedSources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (args.category) {
      sources = sources.filter((s) => s.category === args.category);
    }

    if (args.limit) {
      sources = sources.slice(0, args.limit);
    }

    return sources;
  },
});

export const getSourcesDueForFetch = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sources = await ctx.db
      .query("feedSources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return sources.filter((source) => {
      if (!source.lastFetchedAt) return true;
      const intervalMs = source.pollIntervalMinutes * 60 * 1000;
      return now - source.lastFetchedAt >= intervalMs;
    });
  },
});

export const getFeedSourceById = internalQuery({
  args: { sourceId: v.id("feedSources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

export const checkFeedItemExists = internalQuery({
  args: {
    sourceId: v.id("feedSources"),
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("feedItems")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", args.sourceId).eq("externalId", args.externalId)
      )
      .first();
    return !!existing;
  },
});

export const createFeedItem = internalMutation({
  args: {
    sourceId: v.id("feedSources"),
    externalId: v.string(),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    author: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    publishedAt: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedItems", {
      sourceId: args.sourceId,
      externalId: args.externalId,
      title: args.title,
      url: args.url,
      description: args.description,
      content: args.content,
      author: args.author,
      imageUrl: args.imageUrl,
      publishedAt: args.publishedAt,
      fetchedAt: Date.now(),
      tags: args.tags,
      isFeatured: false,
    });
  },
});

export const updateFeedSourceStatus = internalMutation({
  args: {
    sourceId: v.id("feedSources"),
    status: v.union(
      v.literal("success"),
      v.literal("error"),
      v.literal("partial")
    ),
    error: v.optional(v.string()),
    itemsAdded: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) return;

    await ctx.db.patch(args.sourceId, {
      lastFetchedAt: Date.now(),
      lastFetchStatus: args.status,
      lastFetchError: args.error,
      itemCount: source.itemCount + (args.itemsAdded || 0),
      updatedAt: Date.now(),
    });
  },
});

export const createFeedSource = internalMutation({
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
    logoUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    pollIntervalMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("feedSources")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("feedSources", {
      name: args.name,
      slug: args.slug,
      url: args.url,
      feedType: args.feedType,
      category: args.category,
      description: args.description,
      logoUrl: args.logoUrl,
      websiteUrl: args.websiteUrl,
      isActive: true,
      pollIntervalMinutes: args.pollIntervalMinutes,
      itemCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
