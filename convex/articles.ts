import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getArticlesForTool = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const toolArticles = await ctx.db
      .query("toolArticles")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const articles = await Promise.all(
      toolArticles.map(async (ta) => {
        const article = await ctx.db.get(ta.articleId);
        if (!article || !article.isActive) return null;
        return {
          ...article,
          mentionType: ta.mentionType,
          relevanceScore: ta.relevanceScore,
        };
      })
    );

    return articles.filter(Boolean);
  },
});

export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const upsertArticle = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    source: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    articleType: v.union(
      v.literal("tutorial"),
      v.literal("guide"),
      v.literal("comparison"),
      v.literal("review"),
      v.literal("news"),
      v.literal("blog"),
      v.literal("documentation"),
      v.literal("other")
    ),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        source: args.source,
        imageUrl: args.imageUrl,
        articleType: args.articleType,
        tags: args.tags,
      });
      return { action: "updated", id: existing._id };
    }

    const id = await ctx.db.insert("articles", {
      title: args.title,
      slug: args.slug,
      url: args.url,
      description: args.description,
      source: args.source,
      imageUrl: args.imageUrl,
      articleType: args.articleType,
      relatedToolIds: [],
      tags: args.tags,
      isActive: true,
      scrapedAt: Date.now(),
    });

    return { action: "created", id };
  },
});

export const linkArticleToTool = mutation({
  args: {
    articleId: v.id("articles"),
    toolId: v.id("tools"),
    mentionType: v.union(
      v.literal("primary"),
      v.literal("mentioned"),
      v.literal("compared"),
      v.literal("alternative")
    ),
    relevanceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("toolArticles")
      .withIndex("by_tool_article", (q) =>
        q.eq("toolId", args.toolId).eq("articleId", args.articleId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        mentionType: args.mentionType,
        relevanceScore: args.relevanceScore,
      });
      return { action: "updated", id: existing._id };
    }

    const id = await ctx.db.insert("toolArticles", {
      toolId: args.toolId,
      articleId: args.articleId,
      mentionType: args.mentionType,
      relevanceScore: args.relevanceScore,
    });

    const article = await ctx.db.get(args.articleId);
    if (article) {
      const relatedToolIds = article.relatedToolIds || [];
      if (!relatedToolIds.includes(args.toolId)) {
        await ctx.db.patch(args.articleId, {
          relatedToolIds: [...relatedToolIds, args.toolId],
        });
      }
    }

    return { action: "created", id };
  },
});

export const bulkUpsertArticles = mutation({
  args: {
    articles: v.array(
      v.object({
        title: v.string(),
        slug: v.string(),
        url: v.string(),
        description: v.optional(v.string()),
        source: v.optional(v.string()),
        articleType: v.string(),
        tags: v.array(v.string()),
        relatedToolSlugs: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = { created: 0, updated: 0, linked: 0, errors: [] as string[] };

    for (const article of args.articles) {
      try {
        const existing = await ctx.db
          .query("articles")
          .withIndex("by_url", (q) => q.eq("url", article.url))
          .first();

        let articleId;
        const articleType = ["tutorial", "guide", "comparison", "review", "news", "blog", "documentation", "other"].includes(article.articleType)
          ? article.articleType as "tutorial" | "guide" | "comparison" | "review" | "news" | "blog" | "documentation" | "other"
          : "other";

        if (existing) {
          await ctx.db.patch(existing._id, {
            title: article.title,
            description: article.description,
            source: article.source,
            articleType,
            tags: article.tags,
          });
          articleId = existing._id;
          results.updated++;
        } else {
          articleId = await ctx.db.insert("articles", {
            title: article.title,
            slug: article.slug,
            url: article.url,
            description: article.description,
            source: article.source,
            articleType,
            relatedToolIds: [],
            tags: article.tags,
            isActive: true,
            scrapedAt: Date.now(),
          });
          results.created++;
        }

        for (const toolSlug of article.relatedToolSlugs) {
          const tool = await ctx.db
            .query("tools")
            .withIndex("by_slug", (q) => q.eq("slug", toolSlug))
            .first();

          if (tool) {
            const existingLink = await ctx.db
              .query("toolArticles")
              .withIndex("by_tool_article", (q) =>
                q.eq("toolId", tool._id).eq("articleId", articleId)
              )
              .first();

            if (!existingLink) {
              await ctx.db.insert("toolArticles", {
                toolId: tool._id,
                articleId,
                mentionType: "mentioned",
              });
              results.linked++;
            }
          }
        }
      } catch (error) {
        results.errors.push(`${article.title}: ${error}`);
      }
    }

    return results;
  },
});
