import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

export const submit = mutation({
  args: {
    toolId: v.id("tools"),
    suggestedChanges: v.object({
      name: v.optional(v.string()),
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
      pros: v.optional(v.array(v.string())),
      cons: v.optional(v.array(v.string())),
      bestFor: v.optional(v.array(v.string())),
      features: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    }),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const suggestionId = await ctx.db.insert("toolSuggestions", {
      toolId: args.toolId,
      userId,
      status: "pending",
      suggestedChanges: args.suggestedChanges,
      reason: args.reason,
      createdAt: Date.now(),
    });

    return suggestionId;
  },
});

export const listByTool = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("toolSuggestions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const userId = identity.subject;
    const suggestions = await ctx.db
      .query("toolSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const suggestionsWithTools = await Promise.all(
      suggestions.map(async (suggestion) => {
        const tool = await ctx.db.get(suggestion.toolId);
        return { ...suggestion, tool };
      })
    );

    return suggestionsWithTools;
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const suggestions = await ctx.db
      .query("toolSuggestions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const suggestionsWithDetails = await Promise.all(
      suggestions.map(async (suggestion) => {
        const tool = await ctx.db.get(suggestion.toolId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", suggestion.userId))
          .first();
        return { ...suggestion, tool, userProfile };
      })
    );

    return suggestionsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listAll = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
  },
  handler: async (ctx, args) => {
    let suggestions;
    if (args.status) {
      suggestions = await ctx.db
        .query("toolSuggestions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      suggestions = await ctx.db.query("toolSuggestions").collect();
    }

    const suggestionsWithDetails = await Promise.all(
      suggestions.map(async (suggestion) => {
        const tool = await ctx.db.get(suggestion.toolId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", suggestion.userId))
          .first();
        return { ...suggestion, tool, userProfile };
      })
    );

    return suggestionsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const approve = mutation({
  args: {
    suggestionId: v.id("toolSuggestions"),
    reviewNote: v.optional(v.string()),
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

    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    const tool = await ctx.db.get(suggestion.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const updates: Record<string, any> = {};
    const changes = suggestion.suggestedChanges;
    
    if (changes.name !== undefined) updates.name = changes.name;
    if (changes.tagline !== undefined) updates.tagline = changes.tagline;
    if (changes.description !== undefined) updates.description = changes.description;
    if (changes.websiteUrl !== undefined) updates.websiteUrl = changes.websiteUrl;
    if (changes.githubUrl !== undefined) updates.githubUrl = changes.githubUrl;
    if (changes.docsUrl !== undefined) updates.docsUrl = changes.docsUrl;
    if (changes.logoUrl !== undefined) updates.logoUrl = changes.logoUrl;
    if (changes.pricingModel !== undefined) updates.pricingModel = changes.pricingModel;
    if (changes.isOpenSource !== undefined) updates.isOpenSource = changes.isOpenSource;
    if (changes.pros !== undefined) updates.pros = changes.pros;
    if (changes.cons !== undefined) updates.cons = changes.cons;
    if (changes.bestFor !== undefined) updates.bestFor = changes.bestFor;
    if (changes.features !== undefined) updates.features = changes.features;
    if (changes.tags !== undefined) updates.tags = changes.tags;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(suggestion.toolId, updates);
    }

    await ctx.db.patch(args.suggestionId, {
      status: "approved",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      reviewNote: args.reviewNote,
    });

    await ctx.db.insert("notifications", {
      userId: suggestion.userId,
      type: "system_announcement",
      title: "Suggestion Approved!",
      message: `Your suggested edit for ${tool.name} has been approved and applied.`,
      icon: "CheckCircle",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        toolId: suggestion.toolId,
        link: `/tools/${tool.slug}`,
      },
    });

    return { success: true };
  },
});

export const reject = mutation({
  args: {
    suggestionId: v.id("toolSuggestions"),
    reviewNote: v.optional(v.string()),
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

    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    const tool = await ctx.db.get(suggestion.toolId);

    await ctx.db.patch(args.suggestionId, {
      status: "rejected",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      reviewNote: args.reviewNote,
    });

    await ctx.db.insert("notifications", {
      userId: suggestion.userId,
      type: "system_announcement",
      title: "Suggestion Reviewed",
      message: `Your suggested edit for ${tool?.name || "a tool"} was not approved.${args.reviewNote ? ` Reason: ${args.reviewNote}` : ""}`,
      icon: "XCircle",
      isRead: false,
      createdAt: Date.now(),
      metadata: {
        toolId: suggestion.toolId,
        link: tool ? `/tools/${tool.slug}` : undefined,
      },
    });

    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allSuggestions = await ctx.db.query("toolSuggestions").collect();
    
    const pending = allSuggestions.filter((s) => s.status === "pending").length;
    const approved = allSuggestions.filter((s) => s.status === "approved").length;
    const rejected = allSuggestions.filter((s) => s.status === "rejected").length;

    return {
      total: allSuggestions.length,
      pending,
      approved,
      rejected,
    };
  },
});
