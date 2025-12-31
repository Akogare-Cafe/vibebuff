import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get tools for comparison by their IDs
export const getToolsForComparison = query({
  args: {
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const tools = await Promise.all(
      args.toolIds.map(async (id) => {
        const tool = await ctx.db.get(id);
        if (!tool) return null;

        const category = await ctx.db.get(tool.categoryId);
        const pricingTiers = await ctx.db
          .query("pricingTiers")
          .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
          .collect();

        return {
          ...tool,
          category,
          pricingTiers,
        };
      })
    );

    return tools.filter(Boolean);
  },
});

// Get tools for comparison by slugs
export const getToolsBySlug = query({
  args: {
    slugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const tools = await Promise.all(
      args.slugs.map(async (slug) => {
        const tool = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();

        if (!tool) return null;

        const category = await ctx.db.get(tool.categoryId);
        const pricingTiers = await ctx.db
          .query("pricingTiers")
          .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
          .collect();

        return {
          ...tool,
          category,
          pricingTiers,
        };
      })
    );

    return tools.filter(Boolean);
  },
});

// Save a comparison for later
export const saveComparison = mutation({
  args: {
    userId: v.optional(v.string()),
    toolIds: v.array(v.id("tools")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toolComparisons", {
      userId: args.userId,
      toolIds: args.toolIds,
      createdAt: Date.now(),
      name: args.name,
    });
  },
});

// Get user's saved comparisons
export const getSavedComparisons = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comparisons = await ctx.db
      .query("toolComparisons")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get tool names for each comparison
    const comparisonsWithTools = await Promise.all(
      comparisons.map(async (comp) => {
        const tools = await Promise.all(
          comp.toolIds.map((id) => ctx.db.get(id))
        );
        return {
          ...comp,
          tools: tools.filter(Boolean).map((t) => ({ name: t!.name, slug: t!.slug })),
        };
      })
    );

    return comparisonsWithTools;
  },
});

// Delete a saved comparison
export const deleteComparison = mutation({
  args: {
    comparisonId: v.id("toolComparisons"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.comparisonId);
  },
});

// Get comparison stats summary
export const getComparisonStats = query({
  args: {
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const tools = await Promise.all(
      args.toolIds.map((id) => ctx.db.get(id))
    );

    const validTools = tools.filter(Boolean);

    // Calculate comparison metrics
    const stats = {
      totalTools: validTools.length,
      openSourceCount: validTools.filter((t) => t!.isOpenSource).length,
      freeCount: validTools.filter((t) => t!.pricingModel === "free" || t!.pricingModel === "open_source").length,
      avgGithubStars: validTools.reduce((sum, t) => sum + (t!.githubStars || 0), 0) / validTools.length || 0,
      commonTags: getCommonTags(validTools as NonNullable<typeof validTools[0]>[]),
      commonFeatures: getCommonFeatures(validTools as NonNullable<typeof validTools[0]>[]),
    };

    return stats;
  },
});

function getCommonTags(tools: { tags: string[] }[]): string[] {
  if (tools.length === 0) return [];
  
  const tagCounts = new Map<string, number>();
  tools.forEach((tool) => {
    tool.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Return tags that appear in at least 2 tools
  return Array.from(tagCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag);
}

function getCommonFeatures(tools: { features: string[] }[]): string[] {
  if (tools.length === 0) return [];
  
  const featureCounts = new Map<string, number>();
  tools.forEach((tool) => {
    tool.features.forEach((feature) => {
      featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
    });
  });

  return Array.from(featureCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([feature]) => feature);
}
