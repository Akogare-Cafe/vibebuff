import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Track tool usage when a user views/interacts with a tool
export const trackUsage = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("toolUsage")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        usageCount: existing.usageCount + 1,
        lastUsedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("toolUsage", {
        userId: args.userId,
        toolId: args.toolId,
        usageCount: 1,
        lastUsedAt: Date.now(),
        isFavorite: false,
      });
    }
  },
});

// Toggle favorite status for a tool
export const toggleFavorite = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("toolUsage")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isFavorite: !existing.isFavorite,
      });
      return !existing.isFavorite;
    } else {
      await ctx.db.insert("toolUsage", {
        userId: args.userId,
        toolId: args.toolId,
        usageCount: 0,
        lastUsedAt: Date.now(),
        isFavorite: true,
      });
      return true;
    }
  },
});

// Get user's most used tools (for recommendations)
export const getFrequentlyUsed = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const usageRecords = await ctx.db
      .query("toolUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by usage count descending
    const sorted = usageRecords.sort((a, b) => b.usageCount - a.usageCount);
    const limited = sorted.slice(0, args.limit || 10);

    // Get tool details for each usage record
    const toolsWithUsage = await Promise.all(
      limited.map(async (usage) => {
        const tool = await ctx.db.get(usage.toolId);
        return tool ? { ...tool, usageCount: usage.usageCount, isFavorite: usage.isFavorite } : null;
      })
    );

    return toolsWithUsage.filter(Boolean);
  },
});

// Get user's favorite tools
export const getFavorites = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("toolUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isFavorite"), true))
      .collect();

    const tools = await Promise.all(
      favorites.map(async (fav) => {
        const tool = await ctx.db.get(fav.toolId);
        return tool ? { ...tool, usageCount: fav.usageCount } : null;
      })
    );

    return tools.filter(Boolean);
  },
});

// Get recommended tools based on user's usage patterns
export const getRecommendations = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user's frequently used tools
    const usageRecords = await ctx.db
      .query("toolUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (usageRecords.length === 0) {
      // If no usage history, return featured tools
      return await ctx.db
        .query("tools")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .take(args.limit || 6);
    }

    // Get categories of frequently used tools
    const usedToolIds = new Set(usageRecords.map((u) => u.toolId));
    const usedTools = await Promise.all(
      Array.from(usedToolIds).map((id) => ctx.db.get(id))
    );
    
    const categoryIds = new Set(
      usedTools.filter(Boolean).map((t) => t!.categoryId)
    );

    // Get other tools from the same categories that user hasn't used
    const allTools = await ctx.db.query("tools").collect();
    const recommendations = allTools
      .filter((tool) => 
        categoryIds.has(tool.categoryId) && 
        !usedToolIds.has(tool._id) &&
        tool.isActive
      )
      .slice(0, args.limit || 6);

    return recommendations;
  },
});

// Check if a tool is favorited by user
export const isFavorite = query({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("toolUsage")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", args.userId).eq("toolId", args.toolId)
      )
      .first();

    return usage?.isFavorite ?? false;
  },
});
