import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertTool = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    websiteUrl: v.string(),
    githubUrl: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    categorySlug: v.string(),
    pricingModel: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid"),
      v.literal("open_source"),
      v.literal("enterprise")
    ),
    githubStars: v.optional(v.number()),
    npmDownloadsWeekly: v.optional(v.number()),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    bestFor: v.array(v.string()),
    features: v.array(v.string()),
    tags: v.array(v.string()),
    isOpenSource: v.boolean(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.categorySlug}`);
    }

    const existingTool = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    const toolData = {
      name: args.name,
      slug: args.slug,
      tagline: args.tagline,
      description: args.description,
      logoUrl: args.logoUrl,
      websiteUrl: args.websiteUrl,
      githubUrl: args.githubUrl,
      docsUrl: args.docsUrl,
      categoryId: category._id,
      pricingModel: args.pricingModel,
      githubStars: args.githubStars,
      npmDownloadsWeekly: args.npmDownloadsWeekly,
      pros: args.pros,
      cons: args.cons,
      bestFor: args.bestFor,
      features: args.features,
      tags: args.tags,
      isOpenSource: args.isOpenSource,
      isActive: true,
      isFeatured: false,
    };

    if (existingTool) {
      await ctx.db.patch(existingTool._id, toolData);
      return { action: "updated", id: existingTool._id, categoryName: category.name };
    } else {
      const id = await ctx.db.insert("tools", toolData);
      
      const allSettings = await ctx.db.query("userSettings").collect();
      const usersToNotify = allSettings.filter(
        (settings) => settings.notifications?.newToolAlerts !== false
      );

      for (const settings of usersToNotify) {
        await ctx.db.insert("notifications", {
          userId: settings.userId,
          type: "new_tool_discovered",
          title: "New Tool Discovered!",
          message: `${args.name} has been added to ${category.name}. Check it out!`,
          icon: "Sparkles",
          isRead: false,
          createdAt: Date.now(),
          metadata: {
            toolId: id,
            link: `/tools/${args.slug}`,
          },
        });
      }

      return { action: "created", id, categoryName: category.name, notifiedUsers: usersToNotify.length };
    }
  },
});

export const upsertCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingCategory) {
      await ctx.db.patch(existingCategory._id, args);
      return { action: "updated", id: existingCategory._id };
    } else {
      const id = await ctx.db.insert("categories", args);
      return { action: "created", id };
    }
  },
});

export const bulkUpsertTools = internalMutation({
  args: {
    tools: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        tagline: v.string(),
        description: v.string(),
        logoUrl: v.optional(v.string()),
        websiteUrl: v.string(),
        githubUrl: v.optional(v.string()),
        docsUrl: v.optional(v.string()),
        categorySlug: v.string(),
        pricingModel: v.union(
          v.literal("free"),
          v.literal("freemium"),
          v.literal("paid"),
          v.literal("open_source"),
          v.literal("enterprise")
        ),
        githubStars: v.optional(v.number()),
        pros: v.array(v.string()),
        cons: v.array(v.string()),
        bestFor: v.array(v.string()),
        features: v.array(v.string()),
        tags: v.array(v.string()),
        isOpenSource: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const tool of args.tools) {
      try {
        const category = await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", tool.categorySlug))
          .first();

        if (!category) {
          results.errors.push(`Category not found for ${tool.name}: ${tool.categorySlug}`);
          continue;
        }

        const existingTool = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", tool.slug))
          .first();

        const toolData = {
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
          description: tool.description,
          logoUrl: tool.logoUrl,
          websiteUrl: tool.websiteUrl,
          githubUrl: tool.githubUrl,
          docsUrl: tool.docsUrl,
          categoryId: category._id,
          pricingModel: tool.pricingModel,
          githubStars: tool.githubStars,
          pros: tool.pros,
          cons: tool.cons,
          bestFor: tool.bestFor,
          features: tool.features,
          tags: tool.tags,
          isOpenSource: tool.isOpenSource,
          isActive: true,
          isFeatured: false,
        };

        if (existingTool) {
          await ctx.db.patch(existingTool._id, toolData);
          results.updated++;
        } else {
          await ctx.db.insert("tools", toolData);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error processing ${tool.name}: ${error}`);
      }
    }

    return results;
  },
});

export const bulkUpsertToolsPublic = mutation({
  args: {
    tools: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        tagline: v.string(),
        description: v.string(),
        logoUrl: v.optional(v.string()),
        websiteUrl: v.string(),
        githubUrl: v.optional(v.string()),
        docsUrl: v.optional(v.string()),
        categorySlug: v.string(),
        pricingModel: v.union(
          v.literal("free"),
          v.literal("freemium"),
          v.literal("paid"),
          v.literal("open_source"),
          v.literal("enterprise")
        ),
        githubStars: v.optional(v.number()),
        pros: v.array(v.string()),
        cons: v.array(v.string()),
        bestFor: v.array(v.string()),
        features: v.array(v.string()),
        tags: v.array(v.string()),
        isOpenSource: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (const tool of args.tools) {
      try {
        const category = await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", tool.categorySlug))
          .first();

        if (!category) {
          results.skipped++;
          continue;
        }

        const existingTool = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", tool.slug))
          .first();

        const toolData = {
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
          description: tool.description,
          logoUrl: tool.logoUrl,
          websiteUrl: tool.websiteUrl,
          githubUrl: tool.githubUrl,
          docsUrl: tool.docsUrl,
          categoryId: category._id,
          pricingModel: tool.pricingModel,
          githubStars: tool.githubStars,
          pros: tool.pros,
          cons: tool.cons,
          bestFor: tool.bestFor,
          features: tool.features,
          tags: tool.tags,
          isOpenSource: tool.isOpenSource,
          isActive: true,
          isFeatured: false,
        };

        if (existingTool) {
          await ctx.db.patch(existingTool._id, toolData);
          results.updated++;
        } else {
          await ctx.db.insert("tools", toolData);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`${tool.name}: ${error}`);
      }
    }

    return results;
  },
});

export const deleteToolBySlug = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!tool) {
      return { success: false, error: "Tool not found" };
    }

    await ctx.db.delete(tool._id);
    return { success: true, deletedId: tool._id, name: tool.name };
  },
});

export const cleanupInvalidTools = mutation({
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    
    const excludedUrlPatterns = ["/blog/", "/article/", "/post/", "/news/", "/guide/", "/tutorial/", "/docs/", "/wiki/", "/alternatives/", "/vs/", "/comparison/", "medium.com/", "dev.to/", "hashnode.com/", "substack.com/", "wikipedia.org/", "youtube.com/", "reddit.com/"];
    const excludedNamePatterns = ["how to", "how-to", "guide to", "tutorial", "introduction to", "getting started", "best practices", "tips and tricks", "top 10", "top 5", "top 7", "i tested", "we tested", "review:", "comparison:", "vs.", "versus", "alternatives", "alternative to", "best ai", "5 best", "7 best", "10 best"];
    
    let deleted = 0;
    const deletedTools: string[] = [];
    
    for (const tool of tools) {
      const url = (tool.websiteUrl || "").toLowerCase();
      const name = (tool.name || "").toLowerCase();
      
      const hasExcludedUrl = excludedUrlPatterns.some(p => url.includes(p));
      const hasExcludedName = excludedNamePatterns.some(p => name.includes(p));
      const nameTooLong = tool.name && tool.name.length > 80;
      
      if (hasExcludedUrl || hasExcludedName || nameTooLong) {
        deletedTools.push(tool.name);
        await ctx.db.delete(tool._id);
        deleted++;
      }
    }
    
    return { deleted, deletedTools: deletedTools.slice(0, 20) };
  },
});

export const getIngestionStats = mutation({
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    const categories = await ctx.db.query("categories").collect();

    return {
      totalTools: tools.length,
      totalCategories: categories.length,
      activeTools: tools.filter((t) => t.isActive).length,
      featuredTools: tools.filter((t) => t.isFeatured).length,
    };
  },
});
