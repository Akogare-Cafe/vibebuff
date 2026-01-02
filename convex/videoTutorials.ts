import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.union(
      v.literal("setup"),
      v.literal("prompting"),
      v.literal("build-along"),
      v.literal("tips"),
      v.literal("deep-dive"),
      v.literal("mcp")
    )),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let videos;
    
    if (args.category) {
      videos = await ctx.db
        .query("videoTutorials")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.difficulty) {
      videos = await ctx.db
        .query("videoTutorials")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .collect();
    } else {
      videos = await ctx.db.query("videoTutorials").collect();
    }
    const limited = args.limit ? videos.slice(0, args.limit) : videos;

    const videosWithTools = await Promise.all(
      limited.map(async (video) => {
        const tools = await Promise.all(
          video.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...video, tools: tools.filter(Boolean) };
      })
    );

    return videosWithTools;
  },
});

export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videoTutorials")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    const limited = args.limit ? videos.slice(0, args.limit) : videos;

    const videosWithTools = await Promise.all(
      limited.map(async (video) => {
        const tools = await Promise.all(
          video.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...video, tools: tools.filter(Boolean) };
      })
    );

    return videosWithTools;
  },
});

export const getByYoutubeId = query({
  args: { youtubeId: v.string() },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videoTutorials")
      .withIndex("by_youtube_id", (q) => q.eq("youtubeId", args.youtubeId))
      .first();

    if (!video) return null;

    const tools = await Promise.all(
      video.toolIds.map((id) => ctx.db.get(id))
    );

    return { ...video, tools: tools.filter(Boolean) };
  },
});

export const getPopular = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videoTutorials")
      .withIndex("by_views")
      .order("desc")
      .collect();

    const limited = args.limit ? videos.slice(0, args.limit) : videos;

    const videosWithTools = await Promise.all(
      limited.map(async (video) => {
        const tools = await Promise.all(
          video.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...video, tools: tools.filter(Boolean) };
      })
    );

    return videosWithTools;
  },
});

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userVideoProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getBookmarked = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userVideoProgress")
      .withIndex("by_bookmarked", (q) => 
        q.eq("userId", args.userId).eq("isBookmarked", true)
      )
      .collect();

    const videos = await Promise.all(
      progress.map(async (p) => {
        const video = await ctx.db.get(p.videoId);
        if (!video) return null;
        const tools = await Promise.all(
          video.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...video, tools: tools.filter(Boolean), progress: p };
      })
    );

    return videos.filter(Boolean);
  },
});

export const updateProgress = mutation({
  args: {
    userId: v.string(),
    videoId: v.id("videoTutorials"),
    watchedSeconds: v.number(),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userVideoProgress")
      .withIndex("by_user_video", (q) => 
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        watchedSeconds: args.watchedSeconds,
        isCompleted: args.isCompleted ?? existing.isCompleted,
        lastWatchedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("userVideoProgress", {
      userId: args.userId,
      videoId: args.videoId,
      watchedSeconds: args.watchedSeconds,
      isCompleted: args.isCompleted ?? false,
      isBookmarked: false,
      lastWatchedAt: Date.now(),
    });
  },
});

export const toggleBookmark = mutation({
  args: { userId: v.string(), videoId: v.id("videoTutorials") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userVideoProgress")
      .withIndex("by_user_video", (q) => 
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isBookmarked: !existing.isBookmarked,
      });
      return !existing.isBookmarked;
    }

    await ctx.db.insert("userVideoProgress", {
      userId: args.userId,
      videoId: args.videoId,
      watchedSeconds: 0,
      isCompleted: false,
      isBookmarked: true,
      lastWatchedAt: Date.now(),
    });
    return true;
  },
});

export const incrementViews = mutation({
  args: { videoId: v.id("videoTutorials") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) return;

    await ctx.db.patch(args.videoId, {
      views: video.views + 1,
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    youtubeId: v.string(),
    thumbnailUrl: v.optional(v.string()),
    duration: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    category: v.union(
      v.literal("setup"),
      v.literal("prompting"),
      v.literal("build-along"),
      v.literal("tips"),
      v.literal("deep-dive"),
      v.literal("mcp")
    ),
    toolIds: v.array(v.id("tools")),
    tags: v.array(v.string()),
    authorName: v.string(),
    authorChannel: v.optional(v.string()),
    isOfficial: v.boolean(),
    isFeatured: v.boolean(),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("videoTutorials", {
      ...args,
      views: 0,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});
