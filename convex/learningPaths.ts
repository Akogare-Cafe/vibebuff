import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let paths;

    if (args.difficulty) {
      paths = await ctx.db
        .query("learningPaths")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .collect();
    } else if (args.publishedOnly) {
      paths = await ctx.db
        .query("learningPaths")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .collect();
    } else {
      paths = await ctx.db.query("learningPaths").collect();
    }

    if (args.publishedOnly && args.difficulty) {
      paths = paths.filter((p) => p.isPublished);
    }

    const pathsWithDetails = await Promise.all(
      paths.map(async (path) => {
        const lessons = await ctx.db
          .query("learningLessons")
          .withIndex("by_path", (q) => q.eq("pathId", path._id))
          .collect();
        
        const tools = await Promise.all(
          path.toolIds.map((id) => ctx.db.get(id))
        );

        return {
          ...path,
          lessons: lessons.sort((a, b) => a.sortOrder - b.sortOrder),
          tools: tools.filter(Boolean),
          lessonCount: lessons.length,
        };
      })
    );

    return pathsWithDetails.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const path = await ctx.db
      .query("learningPaths")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!path) return null;

    const lessons = await ctx.db
      .query("learningLessons")
      .withIndex("by_path", (q) => q.eq("pathId", path._id))
      .collect();

    const tools = await Promise.all(
      path.toolIds.map((id) => ctx.db.get(id))
    );

    return {
      ...path,
      lessons: lessons.sort((a, b) => a.sortOrder - b.sortOrder),
      tools: tools.filter(Boolean),
    };
  },
});

export const getLesson = query({
  args: { lessonSlug: v.string() },
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query("learningLessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.lessonSlug))
      .first();

    if (!lesson) return null;

    const path = await ctx.db.get(lesson.pathId);
    const tool = lesson.toolId ? await ctx.db.get(lesson.toolId) : null;

    return { ...lesson, path, tool };
  },
});

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userLearningProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const progressWithDetails = await Promise.all(
      progress.map(async (p) => {
        const path = await ctx.db.get(p.pathId);
        const lessons = path
          ? await ctx.db
              .query("learningLessons")
              .withIndex("by_path", (q) => q.eq("pathId", path._id))
              .collect()
          : [];
        
        return {
          ...p,
          path,
          totalLessons: lessons.length,
          percentComplete: lessons.length > 0 
            ? Math.round((p.completedLessons.length / lessons.length) * 100)
            : 0,
        };
      })
    );

    return progressWithDetails;
  },
});

export const getPathProgress = query({
  args: { userId: v.string(), pathId: v.id("learningPaths") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userLearningProgress")
      .withIndex("by_user_path", (q) => 
        q.eq("userId", args.userId).eq("pathId", args.pathId)
      )
      .first();
  },
});

export const startPath = mutation({
  args: { userId: v.string(), pathId: v.id("learningPaths") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userLearningProgress")
      .withIndex("by_user_path", (q) => 
        q.eq("userId", args.userId).eq("pathId", args.pathId)
      )
      .first();

    if (existing) return existing._id;

    const lessons = await ctx.db
      .query("learningLessons")
      .withIndex("by_path", (q) => q.eq("pathId", args.pathId))
      .collect();

    const firstLesson = lessons.sort((a, b) => a.sortOrder - b.sortOrder)[0];

    return await ctx.db.insert("userLearningProgress", {
      userId: args.userId,
      pathId: args.pathId,
      completedLessons: [],
      currentLessonId: firstLesson?._id,
      startedAt: Date.now(),
      totalXpEarned: 0,
    });
  },
});

export const completeLesson = mutation({
  args: { 
    userId: v.string(), 
    pathId: v.id("learningPaths"),
    lessonId: v.id("learningLessons"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userLearningProgress")
      .withIndex("by_user_path", (q) => 
        q.eq("userId", args.userId).eq("pathId", args.pathId)
      )
      .first();

    if (!progress) {
      throw new Error("Progress not found. Start the path first.");
    }

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    if (progress.completedLessons.includes(args.lessonId)) {
      return { alreadyCompleted: true, xpEarned: 0 };
    }

    const completedLessons = [...progress.completedLessons, args.lessonId];
    
    const allLessons = await ctx.db
      .query("learningLessons")
      .withIndex("by_path", (q) => q.eq("pathId", args.pathId))
      .collect();

    const sortedLessons = allLessons.sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sortedLessons.findIndex((l) => l._id === args.lessonId);
    const nextLesson = sortedLessons[currentIndex + 1];

    const isPathComplete = completedLessons.length >= allLessons.length;
    const path = await ctx.db.get(args.pathId);
    const totalXpEarned = progress.totalXpEarned + lesson.xpReward + 
      (isPathComplete && path ? path.xpReward : 0);

    await ctx.db.patch(progress._id, {
      completedLessons,
      currentLessonId: nextLesson?._id ?? progress.currentLessonId,
      completedAt: isPathComplete ? Date.now() : undefined,
      totalXpEarned,
    });

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (userProfile) {
      await ctx.db.patch(userProfile._id, {
        xp: userProfile.xp + lesson.xpReward + (isPathComplete && path ? path.xpReward : 0),
      });
    }

    return { 
      alreadyCompleted: false, 
      xpEarned: lesson.xpReward,
      pathCompleted: isPathComplete,
      pathXpBonus: isPathComplete && path ? path.xpReward : 0,
    };
  },
});

export const createPath = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedMinutes: v.number(),
    icon: v.string(),
    color: v.string(),
    prerequisites: v.array(v.string()),
    toolIds: v.array(v.id("tools")),
    xpReward: v.number(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("learningPaths", {
      ...args,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const createLesson = mutation({
  args: {
    pathId: v.id("learningPaths"),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    lessonType: v.union(
      v.literal("video"),
      v.literal("article"),
      v.literal("interactive"),
      v.literal("quiz")
    ),
    videoUrl: v.optional(v.string()),
    estimatedMinutes: v.number(),
    sortOrder: v.number(),
    xpReward: v.number(),
    toolId: v.optional(v.id("tools")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("learningLessons", args);
  },
});
