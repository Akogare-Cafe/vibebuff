import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all categories
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Get category by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
