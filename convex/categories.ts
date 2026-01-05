import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const fixCategoryIcons = mutation({
  handler: async (ctx) => {
    const iconMapping: Record<string, string> = {
      "ides": "Monitor",
      "ai-assistants": "Bot",
      "frontend": "Layout",
      "meta-frameworks": "Layers",
      "backend": "Server",
      "databases": "Database",
      "auth": "Lock",
      "hosting": "Cloud",
      "realtime": "Zap",
      "llms": "Brain",
      "styling": "Palette",
      "testing": "FlaskConical",
      "observability": "BarChart3",
      "vibe-coding": "Sparkles",
      "cli-agents": "Terminal",
    };

    const categories = await ctx.db.query("categories").collect();
    let updated = 0;

    for (const category of categories) {
      const correctIcon = iconMapping[category.slug];
      if (correctIcon && category.icon !== correctIcon) {
        await ctx.db.patch(category._id, { icon: correctIcon });
        updated++;
      }
    }

    return { message: `Updated ${updated} category icons` };
  },
});

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
