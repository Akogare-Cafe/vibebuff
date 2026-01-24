import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

const projectTypeValidator = v.union(
  v.literal("landing-page"),
  v.literal("saas"),
  v.literal("e-commerce"),
  v.literal("blog"),
  v.literal("dashboard"),
  v.literal("mobile-app"),
  v.literal("api"),
  v.literal("other")
);

const difficultyValidator = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced")
);

const pricingModelValidator = v.union(
  v.literal("free"),
  v.literal("freemium"),
  v.literal("paid"),
  v.literal("open_source"),
  v.literal("enterprise")
);

export const listSubmissions = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("published")
    )),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("popular")
    )),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let submissions;
    if (args.status) {
      submissions = await ctx.db
        .query("communityStackSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      submissions = await ctx.db
        .query("communityStackSubmissions")
        .collect();
    }

    if (args.sortBy === "popular") {
      submissions.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      submissions.sort((a, b) => b.createdAt - a.createdAt);
    }

    const limited = submissions.slice(0, limit);

    const submissionsWithDetails = await Promise.all(
      limited.map(async (submission) => {
        const toolsWithData = await Promise.all(
          submission.tools.map(async (tool) => {
            if (tool.toolId) {
              const toolData = await ctx.db.get(tool.toolId);
              return { ...tool, tool: toolData };
            }
            if (tool.customToolId) {
              const customTool = await ctx.db.get(tool.customToolId);
              return { ...tool, customTool };
            }
            return tool;
          })
        );
        return { ...submission, tools: toolsWithData };
      })
    );

    return submissionsWithDetails;
  },
});

export const getSubmission = query({
  args: { submissionId: v.id("communityStackSubmissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return null;

    const toolsWithData = await Promise.all(
      submission.tools.map(async (tool) => {
        if (tool.toolId) {
          const toolData = await ctx.db.get(tool.toolId);
          return { ...tool, tool: toolData };
        }
        if (tool.customToolId) {
          const customTool = await ctx.db.get(tool.customToolId);
          return { ...tool, customTool };
        }
        return tool;
      })
    );

    return { ...submission, tools: toolsWithData };
  },
});

export const getUserSubmissions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("communityStackSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return submissions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createSubmission = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    projectType: projectTypeValidator,
    difficulty: difficultyValidator,
    tools: v.array(v.object({
      toolId: v.optional(v.id("tools")),
      customToolId: v.optional(v.id("communityToolSuggestions")),
      category: v.string(),
      notes: v.optional(v.string()),
    })),
    tags: v.array(v.string()),
    githubUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communityStackSubmissions", {
      ...args,
      status: "pending",
      upvotes: 0,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateSubmission = mutation({
  args: {
    submissionId: v.id("communityStackSubmissions"),
    userId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    projectType: v.optional(projectTypeValidator),
    difficulty: v.optional(difficultyValidator),
    tools: v.optional(v.array(v.object({
      toolId: v.optional(v.id("tools")),
      customToolId: v.optional(v.id("communityToolSuggestions")),
      category: v.string(),
      notes: v.optional(v.string()),
    }))),
    tags: v.optional(v.array(v.string())),
    githubUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.userId !== args.userId) throw new Error("Unauthorized");
    if (submission.status !== "pending") {
      throw new Error("Cannot edit submission that is already under review");
    }

    const { submissionId, userId: _userId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(submissionId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteSubmission = mutation({
  args: {
    submissionId: v.id("communityStackSubmissions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.userId !== args.userId) throw new Error("Unauthorized");

    const votes = await ctx.db
      .query("communityStackVotes")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    await ctx.db.delete(args.submissionId);
  },
});

export const upvoteSubmission = mutation({
  args: {
    submissionId: v.id("communityStackSubmissions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("communityStackVotes")
      .withIndex("by_user_submission", (q) =>
        q.eq("userId", args.userId).eq("submissionId", args.submissionId)
      )
      .first();

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.submissionId, {
        upvotes: Math.max(0, submission.upvotes - 1),
      });
      return { action: "removed" };
    }

    await ctx.db.insert("communityStackVotes", {
      submissionId: args.submissionId,
      userId: args.userId,
      votedAt: Date.now(),
    });

    await ctx.db.patch(args.submissionId, {
      upvotes: submission.upvotes + 1,
    });

    return { action: "added" };
  },
});

export const hasUpvoted = query({
  args: {
    submissionId: v.id("communityStackSubmissions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("communityStackVotes")
      .withIndex("by_user_submission", (q) =>
        q.eq("userId", args.userId).eq("submissionId", args.submissionId)
      )
      .first();
    return !!existing;
  },
});

export const incrementViews = mutation({
  args: { submissionId: v.id("communityStackSubmissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return;

    await ctx.db.patch(args.submissionId, {
      views: submission.views + 1,
    });
  },
});

export const createToolSuggestion = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.string(),
    websiteUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    category: v.string(),
    pricingModel: v.optional(pricingModelValidator),
    tags: v.array(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingByName = await ctx.db
      .query("communityToolSuggestions")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingByName) {
      throw new Error("A tool suggestion with this name already exists");
    }

    return await ctx.db.insert("communityToolSuggestions", {
      ...args,
      fetchStatus: args.githubUrl ? "pending" : "completed",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getUserToolSuggestions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityToolSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getToolSuggestion = query({
  args: { suggestionId: v.id("communityToolSuggestions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.suggestionId);
  },
});

export const searchExistingTools = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    const limit = args.limit || 10;

    const allTools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const matched = allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.tagline.toLowerCase().includes(searchTerm) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );

    return matched.slice(0, limit);
  },
});

export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const updateToolSuggestionFetchStatus = mutation({
  args: {
    suggestionId: v.id("communityToolSuggestions"),
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
  },
  handler: async (ctx, args) => {
    const { suggestionId, ...updates } = args;
    await ctx.db.patch(suggestionId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const fetchGithubData = action({
  args: {
    suggestionId: v.id("communityToolSuggestions"),
    githubUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.communityStacks.updateToolSuggestionFetchStatus, {
      suggestionId: args.suggestionId,
      fetchStatus: "fetching",
    });

    try {
      const match = args.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error("Invalid GitHub URL format");
      }

      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, "").split("/")[0].split("?")[0].split("#")[0];

      const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "VibeBuff-App",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      await ctx.runMutation(api.communityStacks.updateToolSuggestionFetchStatus, {
        suggestionId: args.suggestionId,
        fetchStatus: "completed",
        fetchedData: {
          stars: data.stargazers_count,
          forks: data.forks_count,
          description: data.description,
          language: data.language,
          topics: data.topics,
          license: data.license?.spdx_id,
          lastUpdated: data.pushed_at,
        },
      });

      return { success: true };
    } catch (error) {
      await ctx.runMutation(api.communityStacks.updateToolSuggestionFetchStatus, {
        suggestionId: args.suggestionId,
        fetchStatus: "failed",
        fetchError: error instanceof Error ? error.message : "Unknown error",
      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

export const getPendingSubmissionsCount = query({
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("communityStackSubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});
