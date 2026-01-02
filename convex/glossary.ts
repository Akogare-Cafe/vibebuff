import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listTerms = query({
  args: {
    category: v.optional(v.union(
      v.literal("general"),
      v.literal("ai"),
      v.literal("ide"),
      v.literal("backend"),
      v.literal("frontend"),
      v.literal("devops"),
      v.literal("database")
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let terms;

    if (args.category) {
      terms = await ctx.db
        .query("glossaryTerms")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      terms = await ctx.db.query("glossaryTerms").collect();
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(searchLower) ||
          t.shortDefinition.toLowerCase().includes(searchLower)
      );
    }

    const termsWithTools = await Promise.all(
      terms.map(async (term) => {
        const tools = await Promise.all(
          term.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...term, tools: tools.filter(Boolean) };
      })
    );

    return termsWithTools.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const term = await ctx.db
      .query("glossaryTerms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!term) return null;

    const tools = await Promise.all(
      term.toolIds.map((id) => ctx.db.get(id))
    );

    const relatedTermsData = await Promise.all(
      term.relatedTerms.map(async (slug) => {
        return await ctx.db
          .query("glossaryTerms")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
      })
    );

    return {
      ...term,
      tools: tools.filter(Boolean),
      relatedTermsData: relatedTermsData.filter(Boolean),
    };
  },
});

export const searchTerms = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allTerms = await ctx.db.query("glossaryTerms").collect();
    const queryLower = args.query.toLowerCase();

    return allTerms
      .filter(
        (t) =>
          t.term.toLowerCase().includes(queryLower) ||
          t.shortDefinition.toLowerCase().includes(queryLower) ||
          t.fullDefinition.toLowerCase().includes(queryLower)
      )
      .slice(0, 10);
  },
});

export const listConceptCards = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
  },
  handler: async (ctx, args) => {
    let cards;

    if (args.category) {
      cards = await ctx.db
        .query("conceptCards")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      cards = await ctx.db.query("conceptCards").collect();
    }

    if (args.difficulty) {
      cards = cards.filter((c) => c.difficulty === args.difficulty);
    }

    const cardsWithTools = await Promise.all(
      cards.map(async (card) => {
        const tools = await Promise.all(
          card.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...card, tools: tools.filter(Boolean) };
      })
    );

    return cardsWithTools.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getConceptCard = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("conceptCards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) return null;

    const tools = await Promise.all(
      card.toolIds.map((id) => ctx.db.get(id))
    );

    const relatedTermsData = await Promise.all(
      card.relatedTerms.map(async (slug) => {
        return await ctx.db
          .query("glossaryTerms")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
      })
    );

    return {
      ...card,
      tools: tools.filter(Boolean),
      relatedTermsData: relatedTermsData.filter(Boolean),
    };
  },
});

export const getFlashcardsDue = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const progress = await ctx.db
      .query("userFlashcardProgress")
      .withIndex("by_next_review", (q) => q.eq("userId", args.userId))
      .collect();

    const dueCards = progress.filter((p) => p.nextReviewAt <= now);
    const limited = args.limit ? dueCards.slice(0, args.limit) : dueCards;

    const cardsWithTerms = await Promise.all(
      limited.map(async (p) => {
        const term = await ctx.db.get(p.termId);
        return { ...p, term };
      })
    );

    return cardsWithTerms.filter((c) => c.term !== null);
  },
});

export const reviewFlashcard = mutation({
  args: {
    userId: v.string(),
    termId: v.id("glossaryTerms"),
    quality: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userFlashcardProgress")
      .withIndex("by_user_term", (q) => 
        q.eq("userId", args.userId).eq("termId", args.termId)
      )
      .first();

    const quality = Math.max(0, Math.min(5, args.quality));
    
    let easeFactor = existing?.easeFactor ?? 2.5;
    let interval = existing?.interval ?? 1;
    let repetitions = existing?.repetitions ?? 0;

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const nextReviewAt = Date.now() + interval * 24 * 60 * 60 * 1000;

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastReviewedAt: Date.now(),
        nextReviewAt,
        easeFactor,
        interval,
        repetitions,
      });
      return existing._id;
    }

    return await ctx.db.insert("userFlashcardProgress", {
      userId: args.userId,
      termId: args.termId,
      lastReviewedAt: Date.now(),
      nextReviewAt,
      easeFactor,
      interval,
      repetitions,
    });
  },
});

export const createTerm = mutation({
  args: {
    slug: v.string(),
    term: v.string(),
    shortDefinition: v.string(),
    fullDefinition: v.string(),
    eli5Definition: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("ai"),
      v.literal("ide"),
      v.literal("backend"),
      v.literal("frontend"),
      v.literal("devops"),
      v.literal("database")
    ),
    relatedTerms: v.array(v.string()),
    toolIds: v.array(v.id("tools")),
    examples: v.array(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("glossaryTerms", args);
  },
});

export const createConceptCard = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    visualType: v.union(
      v.literal("diagram"),
      v.literal("flowchart"),
      v.literal("comparison"),
      v.literal("timeline"),
      v.literal("infographic")
    ),
    imageUrl: v.optional(v.string()),
    category: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    relatedTerms: v.array(v.string()),
    toolIds: v.array(v.id("tools")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conceptCards", args);
  },
});
