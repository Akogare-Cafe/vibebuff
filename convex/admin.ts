import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

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
