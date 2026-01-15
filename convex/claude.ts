import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getClaudeModels = query({
  handler: async (ctx) => {
    const models = await ctx.db
      .query("claudeModels")
      .order("desc")
      .collect();
    return models;
  },
});

export const getLatestClaudeModels = query({
  handler: async (ctx) => {
    const models = await ctx.db
      .query("claudeModels")
      .withIndex("by_latest", (q) => q.eq("isLatest", true))
      .collect();
    return models;
  },
});

export const getClaudeModelsByFamily = query({
  args: { family: v.string() },
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("claudeModels")
      .withIndex("by_family", (q) => q.eq("family", args.family))
      .collect();
    return models;
  },
});

export const getClaudeResources = query({
  args: {
    category: v.optional(v.string()),
    resourceType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const resources = await ctx.db
        .query("claudeResources")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(args.limit || 100);
      return resources;
    } else if (args.resourceType) {
      const resources = await ctx.db
        .query("claudeResources")
        .withIndex("by_type", (q) => q.eq("resourceType", args.resourceType!))
        .order("desc")
        .take(args.limit || 100);
      return resources;
    }

    const resources = await ctx.db
      .query("claudeResources")
      .order("desc")
      .take(args.limit || 100);
    return resources;
  },
});

export const getClaudeMcpServers = query({
  args: {
    serverType: v.optional(v.string()),
    officialOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let servers;

    if (args.officialOnly) {
      servers = await ctx.db
        .query("claudeMcpServers")
        .withIndex("by_official", (q) => q.eq("isOfficial", true))
        .order("desc")
        .collect();
    } else if (args.serverType) {
      servers = await ctx.db
        .query("claudeMcpServers")
        .withIndex("by_type", (q) => q.eq("serverType", args.serverType!))
        .order("desc")
        .collect();
    } else {
      servers = await ctx.db
        .query("claudeMcpServers")
        .order("desc")
        .collect();
    }

    return servers.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  },
});

export const getClaudeReleases = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const releases = await ctx.db
      .query("claudeReleases")
      .order("desc")
      .take(args.limit || 10);
    return releases;
  },
});

export const getClaudeStats = query({
  handler: async (ctx) => {
    const [models, resources, mcpServers, releases] = await Promise.all([
      ctx.db.query("claudeModels").collect(),
      ctx.db.query("claudeResources").collect(),
      ctx.db.query("claudeMcpServers").collect(),
      ctx.db.query("claudeReleases").collect(),
    ]);

    const resourcesByCategory = resources.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resourcesByType = resources.reduce((acc, r) => {
      acc[r.resourceType] = (acc[r.resourceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalModels: models.length,
      totalResources: resources.length,
      totalMcpServers: mcpServers.length,
      officialMcpServers: mcpServers.filter(s => s.isOfficial).length,
      communityMcpServers: mcpServers.filter(s => !s.isOfficial).length,
      totalReleases: releases.length,
      resourcesByCategory,
      resourcesByType,
      latestFamily: models.find(m => m.isLatest)?.family || "claude-3-5",
    };
  },
});

export const upsertClaudeModel = mutation({
  args: {
    modelId: v.string(),
    name: v.string(),
    family: v.string(),
    releaseDate: v.string(),
    contextWindow: v.number(),
    maxOutput: v.number(),
    capabilities: v.array(v.string()),
    isLatest: v.boolean(),
    description: v.optional(v.string()),
    pricing: v.optional(v.object({
      inputPerMillion: v.optional(v.number()),
      outputPerMillion: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("claudeModels")
      .withIndex("by_model_id", (q) => q.eq("modelId", args.modelId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("claudeModels", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

export const upsertClaudeResource = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    resourceType: v.string(),
    stars: v.optional(v.number()),
    language: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("claudeResources")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        scrapedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("claudeResources", {
        ...args,
        scrapedAt: Date.now(),
      });
    }
  },
});

export const upsertClaudeMcpServer = mutation({
  args: {
    name: v.string(),
    fullName: v.optional(v.string()),
    url: v.string(),
    description: v.optional(v.string()),
    serverType: v.string(),
    stars: v.optional(v.number()),
    language: v.optional(v.string()),
    isOfficial: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("claudeMcpServers")
      .filter((q) => q.eq(q.field("url"), args.url))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        scrapedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("claudeMcpServers", {
        ...args,
        scrapedAt: Date.now(),
      });
    }
  },
});

export const upsertClaudeRelease = mutation({
  args: {
    version: v.string(),
    name: v.string(),
    publishedAt: v.string(),
    url: v.string(),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("claudeReleases")
      .withIndex("by_version", (q) => q.eq("version", args.version))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        scrapedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("claudeReleases", {
        ...args,
        scrapedAt: Date.now(),
      });
    }
  },
});
