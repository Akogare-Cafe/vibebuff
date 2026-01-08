import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";
import { internal } from "./_generated/api";

const ADMIN_EMAILS = ["kavyrattana@gmail.com"];

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    
    const userId = identity.subject;
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    return userProfile?.isAdmin === true;
  },
});

export const setAdminStatus = mutation({
  args: {
    targetUserId: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!currentUserProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.targetUserId))
      .first();

    if (!targetProfile) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetProfile._id, { isAdmin: args.isAdmin });
    return { success: true };
  },
});

export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("userProfiles").collect();

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchLower) ||
          u.clerkId.toLowerCase().includes(searchLower)
      );
    }

    users.sort((a, b) => b.xp - a.xp);

    return users.slice(0, args.limit || 100);
  },
});

export const getAllTools = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let tools = await ctx.db.query("tools").collect();

    if (!args.includeInactive) {
      tools = tools.filter((t) => t.isActive);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.slug.toLowerCase().includes(searchLower) ||
          t.tagline.toLowerCase().includes(searchLower)
      );
    }

    tools.sort((a, b) => a.name.localeCompare(b.name));

    const toolsWithCategories = await Promise.all(
      tools.slice(0, args.limit || 100).map(async (tool) => {
        const category = await ctx.db.get(tool.categoryId);
        return { ...tool, category };
      })
    );

    return toolsWithCategories;
  },
});

export const updateTool = mutation({
  args: {
    toolId: v.id("tools"),
    updates: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      tagline: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      githubUrl: v.optional(v.string()),
      docsUrl: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      pricingModel: v.optional(v.union(
        v.literal("free"),
        v.literal("freemium"),
        v.literal("paid"),
        v.literal("open_source"),
        v.literal("enterprise")
      )),
      isOpenSource: v.optional(v.boolean()),
      isActive: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      pros: v.optional(v.array(v.string())),
      cons: v.optional(v.array(v.string())),
      bestFor: v.optional(v.array(v.string())),
      features: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const updates: Record<string, any> = {};
    Object.entries(args.updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    await ctx.db.patch(args.toolId, updates);
    return { success: true };
  },
});

export const deleteTool = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.toolId, { isActive: false });
    return { success: true };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("userProfiles").collect();
    const tools = await ctx.db.query("tools").collect();
    const suggestions = await ctx.db.query("toolSuggestions").collect();
    const categories = await ctx.db.query("categories").collect();

    const activeTools = tools.filter((t) => t.isActive).length;
    const pendingSuggestions = suggestions.filter((s) => s.status === "pending").length;
    const totalXp = users.reduce((sum, u) => sum + u.xp, 0);
    const adminCount = users.filter((u) => u.isAdmin).length;

    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSuggestions = suggestions.filter((s) => s.createdAt > last7Days).length;

    return {
      totalUsers: users.length,
      totalTools: tools.length,
      activeTools,
      totalCategories: categories.length,
      totalSuggestions: suggestions.length,
      pendingSuggestions,
      recentSuggestions,
      totalXp,
      adminCount,
    };
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const tools = await ctx.db
          .query("tools")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();
        return { ...category, toolCount: tools.filter((t) => t.isActive).length };
      })
    );

    return categoriesWithCounts.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const setAdminByEmail = mutation({
  args: {
    email: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUserEmail = identity.email;
    if (!ADMIN_EMAILS.includes(currentUserEmail || "")) {
      const userId = identity.subject;
      const currentUserProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();

      if (!currentUserProfile?.isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
    }

    const users = await ctx.db.query("userProfiles").collect();
    
    for (const user of users) {
      const userIdentity = user.clerkId;
      if (args.email === "kavyrattana@gmail.com" && user.username === "kavyrattana") {
        await ctx.db.patch(user._id, { isAdmin: args.isAdmin });
        return { success: true, userId: user.clerkId };
      }
    }

    throw new Error("User with email not found");
  },
});

export const initializeAdminByEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const email = identity.email;
    if (!ADMIN_EMAILS.includes(email || "")) {
      throw new Error("Your email is not in the admin list");
    }

    const userId = identity.subject;
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    await ctx.db.patch(userProfile._id, { isAdmin: true });
    return { success: true };
  },
});

export const createTool = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    websiteUrl: v.string(),
    categorySlug: v.string(),
    pricingModel: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid"),
      v.literal("open_source"),
      v.literal("enterprise")
    ),
    isOpenSource: v.boolean(),
    githubUrl: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
    bestFor: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

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

    if (existingTool) {
      throw new Error(`Tool with slug "${args.slug}" already exists`);
    }

    const toolId = await ctx.db.insert("tools", {
      name: args.name,
      slug: args.slug,
      tagline: args.tagline,
      description: args.description,
      websiteUrl: args.websiteUrl,
      githubUrl: args.githubUrl,
      docsUrl: args.docsUrl,
      logoUrl: args.logoUrl,
      categoryId: category._id,
      pricingModel: args.pricingModel,
      isOpenSource: args.isOpenSource,
      isActive: true,
      isFeatured: false,
      pros: args.pros || [],
      cons: args.cons || [],
      bestFor: args.bestFor || [],
      features: args.features || [],
      tags: args.tags || [],
    });

    return { success: true, toolId };
  },
});

export const getFeedSources = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("feedSources").collect();
    return sources.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const updateFeedSource = mutation({
  args: {
    sourceId: v.id("feedSources"),
    updates: v.object({
      isActive: v.optional(v.boolean()),
      pollIntervalMinutes: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.sourceId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const createFeedSource = mutation({
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
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const existing = await ctx.db
      .query("feedSources")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Feed source with slug "${args.slug}" already exists`);
    }

    const sourceId = await ctx.db.insert("feedSources", {
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

    return { success: true, sourceId };
  },
});

export const getCronJobs = query({
  args: {},
  handler: async (ctx) => {
    const feedSources = await ctx.db
      .query("feedSources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return {
      feedFetcher: {
        name: "fetch-ai-tooling-feeds",
        interval: "30 minutes",
        lastRun: feedSources.reduce((latest, s) => 
          Math.max(latest, s.lastFetchedAt || 0), 0
        ),
        activeSources: feedSources.length,
        status: "active",
      },
    };
  },
});

export const getScrapeJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("communityToolSuggestions")
      .withIndex("by_fetch_status")
      .collect();

    return jobs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
  },
});

export const getToolScrapeQueue = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("communityToolSuggestions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pending.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createScrapeJob = mutation({
  args: {
    url: v.string(),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const isGithub = args.url.includes("github.com");
    
    const jobId = await ctx.db.insert("communityToolSuggestions", {
      userId,
      name: args.name || "Pending scrape",
      description: `Scraping from: ${args.url}`,
      websiteUrl: isGithub ? undefined : args.url,
      githubUrl: isGithub ? args.url : undefined,
      category: args.category || "other",
      tags: [],
      fetchStatus: "pending",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, jobId };
  },
});

export const internalRequireAdmin = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    return userProfile?.isAdmin === true;
  },
});

export const updateScrapeJobStatus = internalMutation({
  args: {
    jobId: v.id("communityToolSuggestions"),
    fetchStatus: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("completed"),
      v.literal("failed")
    ),
    fetchedData: v.optional(v.object({
      stars: v.optional(v.number()),
      forks: v.optional(v.number()),
      description: v.optional(v.string()),
      language: v.optional(v.string()),
      topics: v.optional(v.array(v.string())),
      license: v.optional(v.string()),
      lastUpdated: v.optional(v.string()),
    })),
    fetchError: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      fetchStatus: args.fetchStatus,
      updatedAt: Date.now(),
    };

    if (args.fetchedData) updates.fetchedData = args.fetchedData;
    if (args.fetchError) updates.fetchError = args.fetchError;
    if (args.name) updates.name = args.name;
    if (args.description) updates.description = args.description;

    await ctx.db.patch(args.jobId, updates);
  },
});

export const approveScrapeJob = mutation({
  args: {
    jobId: v.id("communityToolSuggestions"),
    toolData: v.object({
      name: v.string(),
      slug: v.string(),
      tagline: v.string(),
      description: v.string(),
      websiteUrl: v.string(),
      categorySlug: v.string(),
      pricingModel: v.union(
        v.literal("free"),
        v.literal("freemium"),
        v.literal("paid"),
        v.literal("open_source"),
        v.literal("enterprise")
      ),
      isOpenSource: v.boolean(),
      githubUrl: v.optional(v.string()),
      docsUrl: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      pros: v.array(v.string()),
      cons: v.array(v.string()),
      bestFor: v.array(v.string()),
      features: v.array(v.string()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.toolData.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.toolData.categorySlug}`);
    }

    const existingTool = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.toolData.slug))
      .first();

    if (existingTool) {
      throw new Error(`Tool with slug "${args.toolData.slug}" already exists`);
    }

    const toolId = await ctx.db.insert("tools", {
      name: args.toolData.name,
      slug: args.toolData.slug,
      tagline: args.toolData.tagline,
      description: args.toolData.description,
      websiteUrl: args.toolData.websiteUrl,
      githubUrl: args.toolData.githubUrl,
      docsUrl: args.toolData.docsUrl,
      logoUrl: args.toolData.logoUrl,
      categoryId: category._id,
      pricingModel: args.toolData.pricingModel,
      isOpenSource: args.toolData.isOpenSource,
      isActive: true,
      isFeatured: false,
      pros: args.toolData.pros,
      cons: args.toolData.cons,
      bestFor: args.toolData.bestFor,
      features: args.toolData.features,
      tags: args.toolData.tags,
    });

    await ctx.db.patch(args.jobId, {
      status: "approved",
      mergedToolId: toolId,
      updatedAt: Date.now(),
    });

    return { success: true, toolId };
  },
});
