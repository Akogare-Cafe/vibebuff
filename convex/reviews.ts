import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

// Get reviews for a tool
export const getToolReviews = query({
  args: { toolId: v.id("tools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("toolReviews")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    // Sort by helpful votes, then by date
    const sorted = reviews.sort((a, b) => {
      if (b.helpfulVotes !== a.helpfulVotes) return b.helpfulVotes - a.helpfulVotes;
      return b.createdAt - a.createdAt;
    });

    return sorted.slice(0, args.limit || 20);
  },
});

// Get user's reviews
export const getUserReviews = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("toolReviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const reviewsWithTools = await Promise.all(
      reviews.map(async (review) => {
        const tool = await ctx.db.get(review.toolId);
        return { ...review, tool };
      })
    );

    return reviewsWithTools;
  },
});

// Get tool rating summary
export const getToolRatingSummary = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("toolReviews")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        shippedCount: 0,
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let shippedCount = 0;

    for (const review of reviews) {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
      if (review.shippedWith) shippedCount++;
    }

    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      distribution,
      shippedCount,
    };
  },
});

// Create review
export const create = mutation({
  args: {
    toolId: v.id("tools"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    usedFor: v.optional(v.string()),
    shippedWith: v.boolean(),
    experienceLevel: v.union(
      v.literal("tried_it"),
      v.literal("used_in_project"),
      v.literal("shipped_product"),
      v.literal("production_veteran")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    // Check if user already reviewed this tool
    const existing = await ctx.db
      .query("toolReviews")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", userId).eq("toolId", args.toolId)
      )
      .first();

    if (existing) {
      throw new Error("You have already reviewed this tool");
    }

    const reviewId = await ctx.db.insert("toolReviews", {
      userId,
      toolId: args.toolId,
      rating: Math.min(5, Math.max(1, args.rating)),
      title: args.title,
      content: args.content,
      pros: args.pros,
      cons: args.cons,
      usedFor: args.usedFor,
      shippedWith: args.shippedWith,
      experienceLevel: args.experienceLevel,
      helpfulVotes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { reviewId };
  },
});

// Update review
export const update = mutation({
  args: {
    reviewId: v.id("toolReviews"),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
    usedFor: v.optional(v.string()),
    shippedWith: v.optional(v.boolean()),
    experienceLevel: v.optional(v.union(
      v.literal("tried_it"),
      v.literal("used_in_project"),
      v.literal("shipped_product"),
      v.literal("production_veteran")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.reviewId, {
      ...(args.rating !== undefined && { rating: Math.min(5, Math.max(1, args.rating)) }),
      ...(args.title && { title: args.title }),
      ...(args.content && { content: args.content }),
      ...(args.pros && { pros: args.pros }),
      ...(args.cons && { cons: args.cons }),
      ...(args.usedFor !== undefined && { usedFor: args.usedFor }),
      ...(args.shippedWith !== undefined && { shippedWith: args.shippedWith }),
      ...(args.experienceLevel && { experienceLevel: args.experienceLevel }),
      updatedAt: Date.now(),
    });
  },
});

// Vote on review helpfulness
export const voteHelpful = mutation({
  args: {
    reviewId: v.id("toolReviews"),
    isHelpful: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const existing = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("reviewId"), args.reviewId))
      .first();

    if (existing) {
      if (existing.isHelpful === args.isHelpful) {
        throw new Error("Already voted");
      }
      // Change vote
      await ctx.db.patch(existing._id, { isHelpful: args.isHelpful });

      const review = await ctx.db.get(args.reviewId);
      if (review) {
        await ctx.db.patch(args.reviewId, {
          helpfulVotes: review.helpfulVotes + (args.isHelpful ? 2 : -2),
        });
      }
    } else {
      await ctx.db.insert("reviewVotes", {
        userId,
        reviewId: args.reviewId,
        isHelpful: args.isHelpful,
        votedAt: Date.now(),
      });

      const review = await ctx.db.get(args.reviewId);
      if (review) {
        await ctx.db.patch(args.reviewId, {
          helpfulVotes: review.helpfulVotes + (args.isHelpful ? 1 : -1),
        });
      }
    }
  },
});

// Delete review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("toolReviews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.reviewId);
  },
});
