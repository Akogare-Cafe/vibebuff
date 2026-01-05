import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listMarketplaceStacks = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("marketplaceStacks")),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("popular"),
      v.literal("most_imported")
    )),
    projectType: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let stacks = await ctx.db
      .query("marketplaceStacks")
      .order("desc")
      .collect();

    if (args.projectType) {
      stacks = stacks.filter((s) => s.projectType === args.projectType);
    }

    if (args.difficulty) {
      stacks = stacks.filter((s) => s.difficulty === args.difficulty);
    }

    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      stacks = stacks.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (args.sortBy === "popular") {
      stacks.sort((a, b) => b.upvotes - a.upvotes);
    } else if (args.sortBy === "most_imported") {
      stacks.sort((a, b) => b.importCount - a.importCount);
    } else {
      stacks.sort((a, b) => b.publishedAt - a.publishedAt);
    }

    const limited = stacks.slice(0, limit);

    const stacksWithDetails = await Promise.all(
      limited.map(async (stack) => {
        const build = await ctx.db.get(stack.buildId);
        return {
          ...stack,
          nodes: build?.nodes || [],
          edges: build?.edges || [],
        };
      })
    );

    return stacksWithDetails;
  },
});

export const getFeaturedStacks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;

    const stacks = await ctx.db
      .query("marketplaceStacks")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    const limited = stacks.slice(0, limit);

    const stacksWithDetails = await Promise.all(
      limited.map(async (stack) => {
        const build = await ctx.db.get(stack.buildId);
        return {
          ...stack,
          nodes: build?.nodes || [],
          edges: build?.edges || [],
        };
      })
    );

    return stacksWithDetails;
  },
});

export const getMarketplaceStack = query({
  args: { stackId: v.id("marketplaceStacks") },
  handler: async (ctx, args) => {
    const stack = await ctx.db.get(args.stackId);
    if (!stack) return null;

    const build = await ctx.db.get(stack.buildId);
    if (!build) return null;

    const nodesWithToolData = await Promise.all(
      build.nodes.map(async (node) => {
        if (node.data.toolId) {
          const tool = await ctx.db.get(node.data.toolId);
          return { ...node, data: { ...node.data, tool } };
        }
        return node;
      })
    );

    return {
      ...stack,
      nodes: nodesWithToolData,
      edges: build.edges,
    };
  },
});

export const publishToMarketplace = mutation({
  args: {
    buildId: v.id("userStackBuilds"),
    userId: v.string(),
    tags: v.array(v.string()),
    projectType: v.optional(v.union(
      v.literal("landing-page"),
      v.literal("saas"),
      v.literal("e-commerce"),
      v.literal("blog"),
      v.literal("dashboard"),
      v.literal("mobile-app"),
      v.literal("api"),
      v.literal("other")
    )),
    difficulty: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
  },
  handler: async (ctx, args) => {
    const build = await ctx.db.get(args.buildId);
    if (!build) throw new Error("Build not found");
    if (build.userId !== args.userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("marketplaceStacks")
      .withIndex("by_build", (q) => q.eq("buildId", args.buildId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: build.title,
        description: build.description,
        tags: args.tags,
        projectType: args.projectType,
        difficulty: args.difficulty,
        toolCount: build.nodes.length,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    await ctx.db.patch(args.buildId, {
      isPublic: true,
      shareToken: build.shareToken || Math.random().toString(36).substring(2, 15),
    });

    return await ctx.db.insert("marketplaceStacks", {
      buildId: args.buildId,
      userId: args.userId,
      title: build.title,
      description: build.description,
      tags: args.tags,
      projectType: args.projectType,
      difficulty: args.difficulty,
      toolCount: build.nodes.length,
      upvotes: 0,
      commentCount: 0,
      importCount: 0,
      views: 0,
      isFeatured: false,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const unpublishFromMarketplace = mutation({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stack = await ctx.db.get(args.stackId);
    if (!stack) throw new Error("Stack not found");
    if (stack.userId !== args.userId) throw new Error("Unauthorized");

    const comments = await ctx.db
      .query("marketplaceComments")
      .withIndex("by_stack", (q) => q.eq("stackId", args.stackId))
      .collect();

    for (const comment of comments) {
      const votes = await ctx.db
        .query("marketplaceCommentVotes")
        .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
        .collect();
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
      await ctx.db.delete(comment._id);
    }

    const upvotes = await ctx.db
      .query("marketplaceUpvotes")
      .withIndex("by_stack", (q) => q.eq("stackId", args.stackId))
      .collect();
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }

    const favorites = await ctx.db
      .query("marketplaceFavorites")
      .withIndex("by_stack", (q) => q.eq("stackId", args.stackId))
      .collect();
    for (const favorite of favorites) {
      await ctx.db.delete(favorite._id);
    }

    await ctx.db.delete(args.stackId);
  },
});

export const upvoteStack = mutation({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketplaceUpvotes")
      .withIndex("by_user_stack", (q) =>
        q.eq("userId", args.userId).eq("stackId", args.stackId)
      )
      .first();

    const stack = await ctx.db.get(args.stackId);
    if (!stack) throw new Error("Stack not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.stackId, {
        upvotes: Math.max(0, stack.upvotes - 1),
      });
      return { action: "removed" };
    }

    await ctx.db.insert("marketplaceUpvotes", {
      stackId: args.stackId,
      userId: args.userId,
      votedAt: Date.now(),
    });

    await ctx.db.patch(args.stackId, {
      upvotes: stack.upvotes + 1,
    });

    return { action: "added" };
  },
});

export const hasUpvoted = query({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketplaceUpvotes")
      .withIndex("by_user_stack", (q) =>
        q.eq("userId", args.userId).eq("stackId", args.stackId)
      )
      .first();
    return !!existing;
  },
});

export const favoriteStack = mutation({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketplaceFavorites")
      .withIndex("by_user_stack", (q) =>
        q.eq("userId", args.userId).eq("stackId", args.stackId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed" };
    }

    await ctx.db.insert("marketplaceFavorites", {
      stackId: args.stackId,
      userId: args.userId,
      savedAt: Date.now(),
    });

    return { action: "added" };
  },
});

export const hasFavorited = query({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketplaceFavorites")
      .withIndex("by_user_stack", (q) =>
        q.eq("userId", args.userId).eq("stackId", args.stackId)
      )
      .first();
    return !!existing;
  },
});

export const getUserFavorites = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("marketplaceFavorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stacks = await Promise.all(
      favorites.map(async (fav) => {
        const stack = await ctx.db.get(fav.stackId);
        if (!stack) return null;
        const build = await ctx.db.get(stack.buildId);
        return {
          ...stack,
          nodes: build?.nodes || [],
          edges: build?.edges || [],
          savedAt: fav.savedAt,
        };
      })
    );

    return stacks.filter(Boolean);
  },
});

export const addComment = mutation({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("marketplaceComments")),
  },
  handler: async (ctx, args) => {
    const stack = await ctx.db.get(args.stackId);
    if (!stack) throw new Error("Stack not found");

    const commentId = await ctx.db.insert("marketplaceComments", {
      stackId: args.stackId,
      userId: args.userId,
      content: args.content,
      parentId: args.parentId,
      upvotes: 0,
      isEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.stackId, {
      commentCount: stack.commentCount + 1,
    });

    return commentId;
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id("marketplaceComments"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== args.userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.commentId, {
      content: args.content,
      isEdited: true,
      updatedAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("marketplaceComments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== args.userId) throw new Error("Unauthorized");

    const stack = await ctx.db.get(comment.stackId);
    if (stack) {
      await ctx.db.patch(comment.stackId, {
        commentCount: Math.max(0, stack.commentCount - 1),
      });
    }

    const votes = await ctx.db
      .query("marketplaceCommentVotes")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    await ctx.db.delete(args.commentId);
  },
});

export const getComments = query({
  args: { stackId: v.id("marketplaceStacks") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("marketplaceComments")
      .withIndex("by_stack", (q) => q.eq("stackId", args.stackId))
      .collect();

    return comments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const upvoteComment = mutation({
  args: {
    commentId: v.id("marketplaceComments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketplaceCommentVotes")
      .withIndex("by_user_comment", (q) =>
        q.eq("userId", args.userId).eq("commentId", args.commentId)
      )
      .first();

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.commentId, {
        upvotes: Math.max(0, comment.upvotes - 1),
      });
      return { action: "removed" };
    }

    await ctx.db.insert("marketplaceCommentVotes", {
      commentId: args.commentId,
      userId: args.userId,
      votedAt: Date.now(),
    });

    await ctx.db.patch(args.commentId, {
      upvotes: comment.upvotes + 1,
    });

    return { action: "added" };
  },
});

export const importStack = mutation({
  args: {
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stack = await ctx.db.get(args.stackId);
    if (!stack) throw new Error("Stack not found");

    const sourceBuild = await ctx.db.get(stack.buildId);
    if (!sourceBuild) throw new Error("Source build not found");

    const newBuildId = await ctx.db.insert("userStackBuilds", {
      userId: args.userId,
      title: `${stack.title} (imported)`,
      description: stack.description,
      nodes: sourceBuild.nodes,
      edges: sourceBuild.edges,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("marketplaceImports", {
      sourceStackId: args.stackId,
      targetBuildId: newBuildId,
      userId: args.userId,
      importedAt: Date.now(),
    });

    await ctx.db.patch(args.stackId, {
      importCount: stack.importCount + 1,
    });

    return newBuildId;
  },
});

export const incrementViews = mutation({
  args: { stackId: v.id("marketplaceStacks") },
  handler: async (ctx, args) => {
    const stack = await ctx.db.get(args.stackId);
    if (!stack) return;

    await ctx.db.patch(args.stackId, {
      views: stack.views + 1,
    });
  },
});

export const getUserPublishedStacks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const stacks = await ctx.db
      .query("marketplaceStacks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stacksWithDetails = await Promise.all(
      stacks.map(async (stack) => {
        const build = await ctx.db.get(stack.buildId);
        return {
          ...stack,
          nodes: build?.nodes || [],
          edges: build?.edges || [],
        };
      })
    );

    return stacksWithDetails.sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

export const isPublishedToMarketplace = query({
  args: { buildId: v.id("userStackBuilds") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketplaceStacks")
      .withIndex("by_build", (q) => q.eq("buildId", args.buildId))
      .first();
    return existing ? existing._id : null;
  },
});
