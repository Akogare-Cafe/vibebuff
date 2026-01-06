import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("forumCategories")
      .withIndex("by_sort_order")
      .collect();
    return categories;
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return category;
  },
});

export const getThreadsByCategory = query({
  args: { categoryId: v.id("forumCategories") },
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("desc")
      .collect();

    const pinnedThreads = threads.filter((t) => t.isPinned);
    const regularThreads = threads.filter((t) => !t.isPinned);

    return [...pinnedThreads, ...regularThreads];
  },
});

export const getThreadBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forumThreads")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!thread) return null;

    const category = await ctx.db.get(thread.categoryId);
    return { ...thread, category };
  },
});

export const getPostsByThread = query({
  args: { threadId: v.id("forumThreads") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    return posts;
  },
});

export const getRecentThreads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const threads = await ctx.db
      .query("forumThreads")
      .order("desc")
      .take(limit);

    const threadsWithCategories = await Promise.all(
      threads.map(async (thread) => {
        const category = await ctx.db.get(thread.categoryId);
        return { ...thread, category };
      })
    );

    return threadsWithCategories;
  },
});

export const createThread = mutation({
  args: {
    categoryId: v.id("forumCategories"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to create a thread");
    }

    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 100) + "-" + Date.now().toString(36);

    const now = Date.now();

    const threadId = await ctx.db.insert("forumThreads", {
      categoryId: args.categoryId,
      title: args.title,
      slug,
      content: args.content,
      authorId: identity.subject,
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.categoryId, {
      threadCount: (await ctx.db.get(args.categoryId))!.threadCount + 1,
      lastActivityAt: now,
    });

    return { threadId, slug };
  },
});

export const createPost = mutation({
  args: {
    threadId: v.id("forumThreads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to reply");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.isLocked) {
      throw new Error("Thread is locked");
    }

    const now = Date.now();

    const postId = await ctx.db.insert("forumPosts", {
      threadId: args.threadId,
      authorId: identity.subject,
      content: args.content,
      isEdited: false,
      upvotes: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.threadId, {
      replyCount: thread.replyCount + 1,
      lastReplyAt: now,
      lastReplyById: identity.subject,
      updatedAt: now,
    });

    const category = await ctx.db.get(thread.categoryId);
    if (category) {
      await ctx.db.patch(thread.categoryId, {
        postCount: category.postCount + 1,
        lastActivityAt: now,
      });
    }

    return postId;
  },
});

export const incrementViewCount = mutation({
  args: { threadId: v.id("forumThreads") },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (thread) {
      await ctx.db.patch(args.threadId, {
        viewCount: thread.viewCount + 1,
      });
    }
  },
});

export const upvotePost = mutation({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to vote");
    }

    const existingVote = await ctx.db
      .query("forumPostVotes")
      .withIndex("by_user_post", (q) =>
        q.eq("oderId", identity.subject).eq("postId", args.postId)
      )
      .first();

    if (existingVote) {
      await ctx.db.delete(existingVote._id);
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, { upvotes: post.upvotes - 1 });
      }
      return { action: "removed" };
    } else {
      await ctx.db.insert("forumPostVotes", {
        postId: args.postId,
        oderId: identity.subject,
        votedAt: Date.now(),
      });
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, { upvotes: post.upvotes + 1 });
      }
      return { action: "added" };
    }
  },
});

export const getUserVotes = query({
  args: { postIds: v.array(v.id("forumPosts")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const votes = await Promise.all(
      args.postIds.map(async (postId) => {
        const vote = await ctx.db
          .query("forumPostVotes")
          .withIndex("by_user_post", (q) =>
            q.eq("oderId", identity.subject).eq("postId", postId)
          )
          .first();
        return vote ? postId : null;
      })
    );

    return votes.filter(Boolean) as Id<"forumPosts">[];
  },
});

export const getForumStats = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("forumCategories").collect();
    const totalThreads = categories.reduce((sum, c) => sum + c.threadCount, 0);
    const totalPosts = categories.reduce((sum, c) => sum + c.postCount, 0);

    return {
      categoryCount: categories.length,
      threadCount: totalThreads,
      postCount: totalPosts,
    };
  },
});
