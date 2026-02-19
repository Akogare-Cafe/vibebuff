import { internalQuery, internalMutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getToolForResourceFetch = internalQuery({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;
    return {
      name: tool.name,
      slug: tool.slug,
      websiteUrl: tool.websiteUrl,
      docsUrl: tool.docsUrl,
    };
  },
});

export const getFetchLog = internalQuery({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("toolResourceFetchLog")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();
  },
});

export const upsertToolResources = internalMutation({
  args: {
    toolId: v.id("tools"),
    resources: v.array(
      v.object({
        toolId: v.id("tools"),
        resourceType: v.union(
          v.literal("youtube"),
          v.literal("documentation"),
          v.literal("howto"),
          v.literal("article"),
          v.literal("tutorial")
        ),
        title: v.string(),
        url: v.string(),
        description: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        source: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        duration: v.optional(v.string()),
        viewCount: v.optional(v.number()),
        channelName: v.optional(v.string()),
        isActive: v.boolean(),
        fetchedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const resource of args.resources) {
      const existing = await ctx.db
        .query("toolResources")
        .withIndex("by_url", (q) => q.eq("url", resource.url))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: resource.title,
          description: resource.description,
          thumbnailUrl: resource.thumbnailUrl,
          publishedAt: resource.publishedAt,
          duration: resource.duration,
          viewCount: resource.viewCount,
          channelName: resource.channelName,
          fetchedAt: resource.fetchedAt,
          isActive: true,
        });
      } else {
        await ctx.db.insert("toolResources", resource);
      }
    }
  },
});

export const upsertFetchLog = internalMutation({
  args: {
    toolId: v.id("tools"),
    youtubeCount: v.number(),
    articleCount: v.number(),
    totalCount: v.number(),
    status: v.union(
      v.literal("success"),
      v.literal("partial"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("toolResourceFetchLog")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastFetchedAt: Date.now(),
        youtubeCount: args.youtubeCount,
        articleCount: args.articleCount,
        totalCount: args.totalCount,
        status: args.status,
      });
    } else {
      await ctx.db.insert("toolResourceFetchLog", {
        toolId: args.toolId,
        lastFetchedAt: Date.now(),
        youtubeCount: args.youtubeCount,
        articleCount: args.articleCount,
        totalCount: args.totalCount,
        status: args.status,
      });
    }
  },
});

export const getResourcesForTool = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("toolResources")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    return resources.filter((r) => r.isActive);
  },
});

export const getResourceFetchStatus = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("toolResourceFetchLog")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();
  },
});
