import { mutation, internalMutation, query } from "./_generated/server";
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
    
    const excludedUrlPatterns = [
      "/blog/", "/article/", "/post/", "/news/", "/guide/", "/tutorial/",
      "/docs/", "/wiki/", "/alternatives/", "/vs/", "/comparison/",
      "medium.com/", "dev.to/", "hashnode.com/", "substack.com/",
      "wikipedia.org/", "youtube.com/", "reddit.com/", "twitter.com/",
      "x.com/", "linkedin.com/", "facebook.com/", "tiktok.com/",
      "/tag/", "/tags/", "/category/", "/categories/", "/archive/",
      "/search?", "/search/", "/explore", "/trending", "/popular",
      "/list/", "/lists/", "/collection/", "/collections/",
      "producthunt.com/", "alternativeto.net/", "stackshare.io/",
      "g2.com/", "capterra.com/", "trustradius.com/",
      "slant.co/", "saashub.com/", "toolify.ai/",
      "theresanaiforthat.com/", "futurepedia.io/",
      "ycombinator.com/", "news.ycombinator.com/",
    ];
    
    const excludedNamePatterns = [
      "how to", "how-to", "guide to", "tutorial", "introduction to",
      "getting started", "best practices", "tips and tricks",
      "top 10", "top 5", "top 7", "top 20", "top 50", "top 100",
      "i tested", "we tested", "review:", "comparison:", "vs.", "versus",
      "alternatives", "alternative to", "best ai", "5 best", "7 best",
      "10 best", "15 best", "20 best", "50 best",
      "awesome mcp", "awesome-mcp", "mcp server list", "mcp directory",
      "mcp server finder", "best mcp", "curated list",
      "awesome list", "awesome-list",
      "example clients", "essential tool integrations",
      "| cursor", "| claude", "| windsurf",
      "complete guide", "ultimate guide", "definitive guide",
      "cheat sheet", "cheatsheet", "roadmap",
      "what is", "why you should", "why i",
      "list of", "directory of", "collection of", "catalog of",
      "roundup", "round-up", "wrap-up", "wrapup",
    ];

    const excludedTaglinePatterns = [
      "curated list", "awesome list", "collection of",
      "discover the best", "find the best", "compare and choose",
      "our curated directory",
    ];
    
    let deleted = 0;
    const deletedTools: string[] = [];
    
    for (const tool of tools) {
      const url = (tool.websiteUrl || "").toLowerCase();
      const name = (tool.name || "").toLowerCase();
      const tagline = (tool.tagline || "").toLowerCase();
      
      const hasExcludedUrl = excludedUrlPatterns.some(p => url.includes(p));
      const hasExcludedName = excludedNamePatterns.some(p => name.includes(p));
      const hasExcludedTagline = excludedTaglinePatterns.some(p => tagline.includes(p));
      const nameTooLong = tool.name && tool.name.length > 80;
      const nameHasPipe = tool.name && tool.name.includes(" | ") && tool.name.length > 50;
      const nameHasEllipsis = tool.name && tool.name.includes("...");
      
      if (hasExcludedUrl || hasExcludedName || hasExcludedTagline || nameTooLong || nameHasPipe || nameHasEllipsis) {
        deletedTools.push(tool.name);
        await ctx.db.delete(tool._id);
        deleted++;
      }
    }
    
    return { deleted, deletedTools: deletedTools.slice(0, 50), totalRemaining: tools.length - deleted };
  },
});

export const diagnoseLowQualityTools = query({
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    let withGithub = 0, withNpm = 0, withPros = 0, withCons = 0;
    let withFeatures = 0, withBestFor = 0, withStars = 0, withDownloads = 0;
    let withExternal = 0, featured = 0;
    let noRichData = 0;
    const noRichSamples: string[] = [];

    for (const tool of tools) {
      if (tool.githubUrl) withGithub++;
      if (tool.npmPackageName) withNpm++;
      if (tool.pros && tool.pros.length > 0) withPros++;
      if (tool.cons && tool.cons.length > 0) withCons++;
      if (tool.features && tool.features.length > 0) withFeatures++;
      if (tool.bestFor && tool.bestFor.length > 0) withBestFor++;
      if ((tool.githubStars ?? 0) > 0) withStars++;
      if ((tool.npmDownloadsWeekly ?? 0) > 0) withDownloads++;
      if (tool.externalData?.lastFetched) withExternal++;
      if (tool.isFeatured) featured++;

      const hasRich = !!(
        tool.githubUrl || tool.npmPackageName ||
        (tool.pros && tool.pros.length > 0) ||
        (tool.cons && tool.cons.length > 0) ||
        (tool.features && tool.features.length > 0) ||
        (tool.bestFor && tool.bestFor.length > 0) ||
        ((tool.githubStars ?? 0) > 0) ||
        ((tool.npmDownloadsWeekly ?? 0) > 0) ||
        tool.externalData?.lastFetched ||
        tool.isFeatured
      );
      if (!hasRich) {
        noRichData++;
        if (noRichSamples.length < 30) {
          noRichSamples.push(`${tool.name} | ${tool.websiteUrl} | desc:${(tool.description || "").length}chars | tags:${(tool.tags || []).length}`);
        }
      }
    }

    return {
      total: tools.length,
      withGithub, withNpm, withPros, withCons,
      withFeatures, withBestFor, withStars, withDownloads,
      withExternal, featured, noRichData, noRichSamples,
    };
  },
});

export const cleanupLowQualityTools = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tools = await ctx.db.query("tools").collect();
    const dryRun = args.dryRun ?? true;

    let deleted = 0;
    const deletedTools: string[] = [];

    for (const tool of tools) {
      const hasRichData = !!(
        tool.githubUrl || tool.npmPackageName ||
        (tool.pros && tool.pros.length > 0) ||
        (tool.cons && tool.cons.length > 0) ||
        (tool.features && tool.features.length > 0) ||
        (tool.bestFor && tool.bestFor.length > 0) ||
        ((tool.githubStars ?? 0) > 0) ||
        ((tool.npmDownloadsWeekly ?? 0) > 0) ||
        tool.externalData?.lastFetched ||
        tool.isFeatured
      );

      if (!hasRichData) {
        deletedTools.push(tool.name);
        if (!dryRun) {
          await ctx.db.delete(tool._id);
        }
        deleted++;
      }
    }

    return {
      dryRun,
      wouldDelete: deleted,
      samples: deletedTools.slice(0, 50),
      totalRemaining: tools.length - (dryRun ? 0 : deleted),
    };
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
