import { query, mutation, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getToolMetadata = query({
  args: { toolSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seoMetadata")
      .withIndex("by_slug", (q) => q.eq("slug", args.toolSlug))
      .first();
  },
});

export const getComparisonBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const comparison = await ctx.db
      .query("seoComparisons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!comparison) return null;

    const tool1 = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", comparison.tool1Slug))
      .first();

    const tool2 = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", comparison.tool2Slug))
      .first();

    return {
      ...comparison,
      tool1,
      tool2,
    };
  },
});

export const listComparisons = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const comparisons = await ctx.db
      .query("seoComparisons")
      .withIndex("by_views")
      .order("desc")
      .take(args.limit || 50);

    const enrichedComparisons = await Promise.all(
      comparisons.map(async (comparison) => {
        const tool1 = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", comparison.tool1Slug))
          .first();
        const tool2 = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", comparison.tool2Slug))
          .first();
        return { ...comparison, tool1, tool2 };
      })
    );

    return enrichedComparisons;
  },
});

export const getComparisonByTools = query({
  args: { tool1Slug: v.string(), tool2Slug: v.string() },
  handler: async (ctx, args) => {
    const slug1 = [args.tool1Slug, args.tool2Slug].sort().join("-vs-");
    
    let comparison = await ctx.db
      .query("seoComparisons")
      .withIndex("by_slug", (q) => q.eq("slug", slug1))
      .first();

    if (!comparison) {
      comparison = await ctx.db
        .query("seoComparisons")
        .withIndex("by_tools", (q) => 
          q.eq("tool1Slug", args.tool1Slug).eq("tool2Slug", args.tool2Slug)
        )
        .first();
    }

    if (!comparison) {
      comparison = await ctx.db
        .query("seoComparisons")
        .withIndex("by_tools", (q) => 
          q.eq("tool1Slug", args.tool2Slug).eq("tool2Slug", args.tool1Slug)
        )
        .first();
    }

    return comparison;
  },
});

export const getFaqsForEntity = query({
  args: { 
    entityType: v.union(v.literal("tool"), v.literal("comparison"), v.literal("category")),
    entityId: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seoFaqs")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .collect();
  },
});

export const getBlogOutlines = query({
  args: { status: v.optional(v.union(v.literal("draft"), v.literal("approved"), v.literal("published"))) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("seoBlogOutlines")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("seoBlogOutlines").collect();
  },
});

export const getKeywordClusters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("seoKeywordClusters").collect();
  },
});

export const getContentScore = query({
  args: { 
    contentType: v.union(v.literal("blog"), v.literal("tool"), v.literal("comparison")),
    contentId: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seoContentScores")
      .withIndex("by_content", (q) => 
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .first();
  },
});

export const getAltText = query({
  args: { imageUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seoAltTexts")
      .withIndex("by_image", (q) => q.eq("imageUrl", args.imageUrl))
      .first();
  },
});

export const incrementComparisonViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const comparison = await ctx.db
      .query("seoComparisons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (comparison) {
      await ctx.db.patch(comparison._id, {
        views: comparison.views + 1,
      });
    }
  },
});

export const generateToolMetadata = internalMutation({
  args: {
    toolSlug: v.string(),
    title: v.string(),
    metaDescription: v.string(),
    keywords: v.array(v.string()),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoMetadata")
      .withIndex("by_slug", (q) => q.eq("slug", args.toolSlug))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        metaDescription: args.metaDescription,
        keywords: args.keywords,
        ogTitle: args.ogTitle,
        ogDescription: args.ogDescription,
        lastUpdated: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("seoMetadata", {
      entityType: "tool",
      entityId: args.toolSlug,
      slug: args.toolSlug,
      title: args.title,
      metaDescription: args.metaDescription,
      keywords: args.keywords,
      ogTitle: args.ogTitle,
      ogDescription: args.ogDescription,
      generatedAt: now,
      lastUpdated: now,
      isAiGenerated: true,
    });
  },
});

export const generateComparison = mutation({
  args: {
    tool1Slug: v.string(),
    tool2Slug: v.string(),
    title: v.string(),
    metaDescription: v.string(),
    introduction: v.string(),
    tool1Summary: v.string(),
    tool2Summary: v.string(),
    comparisonPoints: v.array(v.object({
      category: v.string(),
      tool1Score: v.number(),
      tool2Score: v.number(),
      tool1Reason: v.string(),
      tool2Reason: v.string(),
    })),
    verdict: v.string(),
    useCaseRecommendations: v.array(v.object({
      useCase: v.string(),
      recommendedTool: v.string(),
      reason: v.string(),
    })),
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const sortedSlugs = [args.tool1Slug, args.tool2Slug].sort();
    const slug = `${sortedSlugs[0]}-vs-${sortedSlugs[1]}`;

    const existing = await ctx.db
      .query("seoComparisons")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        metaDescription: args.metaDescription,
        introduction: args.introduction,
        tool1Summary: args.tool1Summary,
        tool2Summary: args.tool2Summary,
        comparisonPoints: args.comparisonPoints,
        verdict: args.verdict,
        useCaseRecommendations: args.useCaseRecommendations,
        faqs: args.faqs,
        lastUpdated: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("seoComparisons", {
      tool1Slug: sortedSlugs[0],
      tool2Slug: sortedSlugs[1],
      slug,
      title: args.title,
      metaDescription: args.metaDescription,
      introduction: args.introduction,
      tool1Summary: args.tool1Summary,
      tool2Summary: args.tool2Summary,
      comparisonPoints: args.comparisonPoints,
      verdict: args.verdict,
      useCaseRecommendations: args.useCaseRecommendations,
      faqs: args.faqs,
      generatedAt: now,
      lastUpdated: now,
      views: 0,
    });
  },
});

export const saveFaqs = mutation({
  args: {
    entityType: v.union(v.literal("tool"), v.literal("comparison"), v.literal("category")),
    entityId: v.string(),
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoFaqs")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .collect();

    for (const faq of existing) {
      await ctx.db.delete(faq._id);
    }

    const now = Date.now();
    const ids = [];

    for (let i = 0; i < args.faqs.length; i++) {
      const id = await ctx.db.insert("seoFaqs", {
        entityType: args.entityType,
        entityId: args.entityId,
        question: args.faqs[i].question,
        answer: args.faqs[i].answer,
        sortOrder: i,
        isAiGenerated: true,
        generatedAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});

export const saveBlogOutline = mutation({
  args: {
    targetKeyword: v.string(),
    title: v.string(),
    slug: v.string(),
    outline: v.array(v.object({
      heading: v.string(),
      subheadings: v.array(v.string()),
      keyPoints: v.array(v.string()),
    })),
    suggestedInternalLinks: v.array(v.object({
      anchorText: v.string(),
      targetUrl: v.string(),
    })),
    estimatedWordCount: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoBlogOutlines")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        targetKeyword: args.targetKeyword,
        title: args.title,
        outline: args.outline,
        suggestedInternalLinks: args.suggestedInternalLinks,
        estimatedWordCount: args.estimatedWordCount,
        difficulty: args.difficulty,
      });
      return existing._id;
    }

    return await ctx.db.insert("seoBlogOutlines", {
      targetKeyword: args.targetKeyword,
      title: args.title,
      slug: args.slug,
      outline: args.outline,
      suggestedInternalLinks: args.suggestedInternalLinks,
      estimatedWordCount: args.estimatedWordCount,
      difficulty: args.difficulty,
      status: "draft",
      generatedAt: Date.now(),
    });
  },
});

export const saveKeywordCluster = mutation({
  args: {
    primaryKeyword: v.string(),
    relatedKeywords: v.array(v.object({
      keyword: v.string(),
      searchVolume: v.optional(v.number()),
      difficulty: v.optional(v.number()),
      relevanceScore: v.number(),
    })),
    suggestedContent: v.array(v.object({
      title: v.string(),
      contentType: v.union(v.literal("blog"), v.literal("comparison"), v.literal("guide"), v.literal("faq")),
      targetKeywords: v.array(v.string()),
    })),
    toolIds: v.optional(v.array(v.id("tools"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoKeywordClusters")
      .withIndex("by_keyword", (q) => q.eq("primaryKeyword", args.primaryKeyword))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        relatedKeywords: args.relatedKeywords,
        suggestedContent: args.suggestedContent,
        toolIds: args.toolIds,
        generatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("seoKeywordClusters", {
      primaryKeyword: args.primaryKeyword,
      relatedKeywords: args.relatedKeywords,
      suggestedContent: args.suggestedContent,
      toolIds: args.toolIds,
      generatedAt: Date.now(),
    });
  },
});

export const saveContentScore = mutation({
  args: {
    contentType: v.union(v.literal("blog"), v.literal("tool"), v.literal("comparison")),
    contentId: v.string(),
    overallScore: v.number(),
    keywordScore: v.number(),
    readabilityScore: v.number(),
    structureScore: v.number(),
    internalLinkScore: v.number(),
    suggestions: v.array(v.object({
      type: v.string(),
      priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      suggestion: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoContentScores")
      .withIndex("by_content", (q) => 
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        overallScore: args.overallScore,
        keywordScore: args.keywordScore,
        readabilityScore: args.readabilityScore,
        structureScore: args.structureScore,
        internalLinkScore: args.internalLinkScore,
        suggestions: args.suggestions,
        analyzedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("seoContentScores", {
      contentType: args.contentType,
      contentId: args.contentId,
      overallScore: args.overallScore,
      keywordScore: args.keywordScore,
      readabilityScore: args.readabilityScore,
      structureScore: args.structureScore,
      internalLinkScore: args.internalLinkScore,
      suggestions: args.suggestions,
      analyzedAt: Date.now(),
    });
  },
});

export const saveAltText = mutation({
  args: {
    imageUrl: v.string(),
    altText: v.string(),
    context: v.optional(v.string()),
    toolId: v.optional(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoAltTexts")
      .withIndex("by_image", (q) => q.eq("imageUrl", args.imageUrl))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        altText: args.altText,
        context: args.context,
        toolId: args.toolId,
        generatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("seoAltTexts", {
      imageUrl: args.imageUrl,
      altText: args.altText,
      context: args.context,
      toolId: args.toolId,
      generatedAt: Date.now(),
    });
  },
});

export const getAllToolPairs = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const pairs: Array<{ tool1: typeof tools[0]; tool2: typeof tools[0]; slug: string }> = [];
    
    for (let i = 0; i < tools.length; i++) {
      for (let j = i + 1; j < tools.length; j++) {
        if (tools[i].categoryId === tools[j].categoryId) {
          const sortedSlugs = [tools[i].slug, tools[j].slug].sort();
          pairs.push({
            tool1: tools[i],
            tool2: tools[j],
            slug: `${sortedSlugs[0]}-vs-${sortedSlugs[1]}`,
          });
        }
      }
    }

    return pairs;
  },
});

export const getPopularComparisons = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const comparisons = await ctx.db
      .query("seoComparisons")
      .withIndex("by_views")
      .order("desc")
      .take(args.limit || 10);

    return Promise.all(
      comparisons.map(async (c) => {
        const tool1 = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", c.tool1Slug))
          .first();
        const tool2 = await ctx.db
          .query("tools")
          .withIndex("by_slug", (q) => q.eq("slug", c.tool2Slug))
          .first();
        return { ...c, tool1, tool2 };
      })
    );
  },
});

export const getToolsForComparison = internalQuery({
  args: { tool1Slug: v.string(), tool2Slug: v.string() },
  handler: async (ctx, args) => {
    const tool1 = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.tool1Slug))
      .first();

    const tool2 = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.tool2Slug))
      .first();

    if (!tool1 || !tool2) return null;

    const category1 = await ctx.db.get(tool1.categoryId);
    const category2 = await ctx.db.get(tool2.categoryId);

    return {
      tool1: { ...tool1, category: category1 },
      tool2: { ...tool2, category: category2 },
    };
  },
});

function calculateCommunityScore(tool: { 
  githubStars?: number; 
  externalData?: { 
    github?: { stars: number; forks: number; contributors?: number; openIssues: number }; 
    npm?: { downloadsWeekly: number; downloadsMonthly?: number } 
  } 
}): number {
  const github = tool.externalData?.github;
  const npm = tool.externalData?.npm;
  const stars = github?.stars || tool.githubStars || 0;
  const forks = github?.forks || 0;
  const contributors = github?.contributors || 0;
  const weeklyDownloads = npm?.downloadsWeekly || 0;

  let score = 0;
  if (stars > 100000) score += 40;
  else if (stars > 50000) score += 35;
  else if (stars > 20000) score += 30;
  else if (stars > 10000) score += 25;
  else if (stars > 5000) score += 20;
  else if (stars > 1000) score += 15;
  else if (stars > 100) score += 10;
  else score += 5;

  if (forks > 10000) score += 15;
  else if (forks > 5000) score += 12;
  else if (forks > 1000) score += 9;
  else if (forks > 500) score += 6;
  else score += 3;

  if (contributors > 500) score += 15;
  else if (contributors > 100) score += 12;
  else if (contributors > 50) score += 9;
  else if (contributors > 10) score += 6;
  else score += 3;

  if (weeklyDownloads > 10000000) score += 30;
  else if (weeklyDownloads > 1000000) score += 25;
  else if (weeklyDownloads > 100000) score += 20;
  else if (weeklyDownloads > 10000) score += 15;
  else if (weeklyDownloads > 1000) score += 10;
  else score += 5;

  return Math.min(100, score);
}

function calculateMaturityScore(tool: { 
  externalData?: { 
    github?: { createdAt?: string; releases?: number; pushedAt?: string }; 
    npm?: { firstPublished?: string; lastPublished?: string; version?: string } 
  };
  majorVersions?: Array<{ version: string; releasedAt: number }>;
}): number {
  const github = tool.externalData?.github;
  const npm = tool.externalData?.npm;
  
  let score = 50;
  
  const createdAt = github?.createdAt || npm?.firstPublished;
  if (createdAt) {
    const ageYears = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (ageYears > 10) score += 20;
    else if (ageYears > 5) score += 15;
    else if (ageYears > 2) score += 10;
    else if (ageYears > 1) score += 5;
  }

  const releases = github?.releases || 0;
  if (releases > 100) score += 15;
  else if (releases > 50) score += 12;
  else if (releases > 20) score += 9;
  else if (releases > 5) score += 6;

  const lastUpdate = github?.pushedAt || npm?.lastPublished;
  if (lastUpdate) {
    const daysSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 15;
    else if (daysSinceUpdate < 30) score += 12;
    else if (daysSinceUpdate < 90) score += 8;
    else if (daysSinceUpdate < 180) score += 4;
  }

  return Math.min(100, score);
}

function calculateBundleSizeScore(tool: { 
  externalData?: { bundlephobia?: { gzip: number; dependencyCount?: number } } 
}): number {
  const bundle = tool.externalData?.bundlephobia;
  if (!bundle) return 50;
  
  const gzipKb = bundle.gzip / 1024;
  let score = 50;
  
  if (gzipKb < 5) score = 95;
  else if (gzipKb < 10) score = 85;
  else if (gzipKb < 25) score = 75;
  else if (gzipKb < 50) score = 65;
  else if (gzipKb < 100) score = 55;
  else if (gzipKb < 200) score = 45;
  else score = 35;

  const deps = bundle.dependencyCount || 0;
  if (deps === 0) score += 5;
  else if (deps < 3) score += 3;
  else if (deps > 10) score -= 5;

  return Math.min(100, Math.max(0, score));
}

function calculateDXScore(tool: { 
  externalData?: { npm?: { types?: boolean } };
  docsUrl?: string;
  features: string[];
  pros: string[];
}): number {
  let score = 50;
  
  if (tool.externalData?.npm?.types) score += 15;
  if (tool.docsUrl) score += 10;

  const dxKeywords = ["typescript", "type-safe", "developer experience", "dx", "intuitive", "easy to use", "simple api", "well documented"];
  const allText = [...tool.features, ...tool.pros].join(" ").toLowerCase();
  const matches = dxKeywords.filter(kw => allText.includes(kw)).length;
  score += Math.min(25, matches * 5);

  return Math.min(100, score);
}

function calculateCostScore(tool: { 
  pricingModel: string; 
  isOpenSource: boolean 
}): number {
  if (tool.isOpenSource) return 100;
  if (tool.pricingModel === "free") return 95;
  if (tool.pricingModel === "open_source") return 100;
  if (tool.pricingModel === "freemium") return 70;
  if (tool.pricingModel === "paid") return 40;
  if (tool.pricingModel === "enterprise") return 30;
  return 50;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export const generateAIComparison = internalAction({
  args: { tool1Slug: v.string(), tool2Slug: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const tools = await ctx.runQuery(internal.seo.getToolsForComparison, {
      tool1Slug: args.tool1Slug,
      tool2Slug: args.tool2Slug,
    });

    if (!tools) {
      throw new Error("Tools not found");
    }

    const { tool1, tool2 } = tools;

    const t1Community = calculateCommunityScore(tool1);
    const t2Community = calculateCommunityScore(tool2);
    const t1Maturity = calculateMaturityScore(tool1);
    const t2Maturity = calculateMaturityScore(tool2);
    const t1Bundle = calculateBundleSizeScore(tool1);
    const t2Bundle = calculateBundleSizeScore(tool2);
    const t1DX = calculateDXScore(tool1);
    const t2DX = calculateDXScore(tool2);
    const t1Cost = calculateCostScore(tool1);
    const t2Cost = calculateCostScore(tool2);

    const t1Stars = tool1.externalData?.github?.stars || tool1.githubStars || 0;
    const t2Stars = tool2.externalData?.github?.stars || tool2.githubStars || 0;
    const t1Downloads = tool1.externalData?.npm?.downloadsWeekly || 0;
    const t2Downloads = tool2.externalData?.npm?.downloadsWeekly || 0;
    const t1Gzip = tool1.externalData?.bundlephobia?.gzip;
    const t2Gzip = tool2.externalData?.bundlephobia?.gzip;

    const comparisonPoints = [
      {
        category: "Community & Adoption",
        tool1Score: t1Community,
        tool2Score: t2Community,
        tool1Reason: t1Stars > 0 || t1Downloads > 0 
          ? `${t1Stars > 0 ? `${formatNumber(t1Stars)} GitHub stars` : ""}${t1Stars > 0 && t1Downloads > 0 ? ", " : ""}${t1Downloads > 0 ? `${formatNumber(t1Downloads)} weekly npm downloads` : ""}`
          : `${tool1.name} has a growing community`,
        tool2Reason: t2Stars > 0 || t2Downloads > 0
          ? `${t2Stars > 0 ? `${formatNumber(t2Stars)} GitHub stars` : ""}${t2Stars > 0 && t2Downloads > 0 ? ", " : ""}${t2Downloads > 0 ? `${formatNumber(t2Downloads)} weekly npm downloads` : ""}`
          : `${tool2.name} has a growing community`,
      },
      {
        category: "Maturity & Stability",
        tool1Score: t1Maturity,
        tool2Score: t2Maturity,
        tool1Reason: tool1.externalData?.github?.releases 
          ? `${tool1.externalData.github.releases} releases, actively maintained`
          : tool1.majorVersions?.length 
            ? `${tool1.majorVersions.length} major versions released`
            : `${tool1.name} is ${tool1.externalData?.github?.createdAt ? "established since " + new Date(tool1.externalData.github.createdAt).getFullYear() : "actively developed"}`,
        tool2Reason: tool2.externalData?.github?.releases
          ? `${tool2.externalData.github.releases} releases, actively maintained`
          : tool2.majorVersions?.length
            ? `${tool2.majorVersions.length} major versions released`
            : `${tool2.name} is ${tool2.externalData?.github?.createdAt ? "established since " + new Date(tool2.externalData.github.createdAt).getFullYear() : "actively developed"}`,
      },
      {
        category: "Bundle Size & Performance",
        tool1Score: t1Bundle,
        tool2Score: t2Bundle,
        tool1Reason: t1Gzip 
          ? `${(t1Gzip / 1024).toFixed(1)}KB gzipped${tool1.externalData?.bundlephobia?.dependencyCount !== undefined ? `, ${tool1.externalData.bundlephobia.dependencyCount} dependencies` : ""}`
          : `${tool1.name} ${tool1.pros.find(p => p.toLowerCase().includes("lightweight") || p.toLowerCase().includes("fast") || p.toLowerCase().includes("performance")) || "offers solid performance"}`,
        tool2Reason: t2Gzip
          ? `${(t2Gzip / 1024).toFixed(1)}KB gzipped${tool2.externalData?.bundlephobia?.dependencyCount !== undefined ? `, ${tool2.externalData.bundlephobia.dependencyCount} dependencies` : ""}`
          : `${tool2.name} ${tool2.pros.find(p => p.toLowerCase().includes("lightweight") || p.toLowerCase().includes("fast") || p.toLowerCase().includes("performance")) || "offers solid performance"}`,
      },
      {
        category: "Developer Experience",
        tool1Score: t1DX,
        tool2Score: t2DX,
        tool1Reason: `${tool1.externalData?.npm?.types ? "TypeScript support" : ""}${tool1.externalData?.npm?.types && tool1.docsUrl ? ", " : ""}${tool1.docsUrl ? "comprehensive docs" : ""}${!tool1.externalData?.npm?.types && !tool1.docsUrl ? tool1.pros[0] || "good developer experience" : ""}`,
        tool2Reason: `${tool2.externalData?.npm?.types ? "TypeScript support" : ""}${tool2.externalData?.npm?.types && tool2.docsUrl ? ", " : ""}${tool2.docsUrl ? "comprehensive docs" : ""}${!tool2.externalData?.npm?.types && !tool2.docsUrl ? tool2.pros[0] || "good developer experience" : ""}`,
      },
      {
        category: "Cost & Licensing",
        tool1Score: t1Cost,
        tool2Score: t2Cost,
        tool1Reason: `${tool1.isOpenSource ? "Open source" : tool1.pricingModel.replace("_", " ")}${tool1.externalData?.github?.license ? ` (${tool1.externalData.github.license})` : ""}`,
        tool2Reason: `${tool2.isOpenSource ? "Open source" : tool2.pricingModel.replace("_", " ")}${tool2.externalData?.github?.license ? ` (${tool2.externalData.github.license})` : ""}`,
      },
    ];

    const title = `${tool1.name} vs ${tool2.name}: Which Should You Choose in 2025?`;
    const metaDescription = `Compare ${tool1.name} and ${tool2.name} side by side. Discover which ${tool1.category?.name || "tool"} is best for your project based on performance, features, and pricing.`;
    
    const introduction = `Choosing between ${tool1.name} and ${tool2.name} is a common decision for developers in 2025. Both are powerful ${tool1.category?.name?.toLowerCase() || "tools"} with their own strengths. This comprehensive comparison will help you make the right choice for your specific needs.`;

    const tool1Summary = `${tool1.name} is ${tool1.tagline}. Key strengths include: ${tool1.pros.slice(0, 3).join(", ")}. It's best suited for ${tool1.bestFor.slice(0, 2).join(" and ")}.`;
    
    const tool2Summary = `${tool2.name} is ${tool2.tagline}. Key strengths include: ${tool2.pros.slice(0, 3).join(", ")}. It's best suited for ${tool2.bestFor.slice(0, 2).join(" and ")}.`;

    const tool1TotalScore = comparisonPoints.reduce((sum, p) => sum + p.tool1Score, 0);
    const tool2TotalScore = comparisonPoints.reduce((sum, p) => sum + p.tool2Score, 0);
    
    const winner = tool1TotalScore > tool2TotalScore ? tool1 : tool2;
    const verdict = `Based on our analysis, ${winner.name} edges ahead for most use cases due to its ${winner.pros[0]?.toLowerCase() || "overall capabilities"}. However, ${tool1TotalScore === tool2TotalScore ? "both tools are excellent choices" : `${tool1TotalScore > tool2TotalScore ? tool2.name : tool1.name} remains a strong contender`} depending on your specific requirements.`;

    const costWinner = t1Cost > t2Cost ? tool1 : tool2;
    const communityWinner = t1Community > t2Community ? tool1 : tool2;
    const dxWinner = t1DX > t2DX ? tool1 : tool2;
    const bundleWinner = t1Bundle > t2Bundle ? tool1 : tool2;
    const maturityWinner = t1Maturity > t2Maturity ? tool1 : tool2;

    const useCaseRecommendations = [
      {
        useCase: "Startups & MVPs",
        recommendedTool: costWinner.name,
        reason: `${costWinner.name} offers better cost efficiency${costWinner.isOpenSource ? " as an open source solution" : ` with ${costWinner.pricingModel.replace("_", " ")} pricing`}`,
      },
      {
        useCase: "Enterprise Applications",
        recommendedTool: maturityWinner.name,
        reason: `${maturityWinner.name} has ${maturityWinner.externalData?.github?.releases ? `${maturityWinner.externalData.github.releases} releases and` : ""} proven stability for production use`,
      },
      {
        useCase: "Learning & Side Projects",
        recommendedTool: dxWinner.name,
        reason: `${dxWinner.name} offers ${dxWinner.externalData?.npm?.types ? "TypeScript support and " : ""}${dxWinner.docsUrl ? "comprehensive documentation" : "a great developer experience"}`,
      },
      {
        useCase: "Performance-Critical Apps",
        recommendedTool: bundleWinner.name,
        reason: bundleWinner.externalData?.bundlephobia?.gzip 
          ? `${bundleWinner.name} has a smaller footprint at ${(bundleWinner.externalData.bundlephobia.gzip / 1024).toFixed(1)}KB gzipped`
          : `${bundleWinner.name} is optimized for performance`,
      },
      {
        useCase: "Long-term Projects",
        recommendedTool: communityWinner.name,
        reason: `${communityWinner.name} has ${communityWinner.externalData?.github?.stars ? `${formatNumber(communityWinner.externalData.github.stars)} stars and` : ""} strong community support`,
      },
    ];

    const t1BundleStr = t1Gzip ? `${(t1Gzip / 1024).toFixed(1)}KB gzipped` : "optimized bundle size";
    const t2BundleStr = t2Gzip ? `${(t2Gzip / 1024).toFixed(1)}KB gzipped` : "optimized bundle size";

    const faqs = [
      {
        question: `Is ${tool1.name} better than ${tool2.name}?`,
        answer: `It depends on your priorities. ${tool1.name} scores higher in ${t1Community > t2Community ? "community adoption" : t1Bundle > t2Bundle ? "bundle size" : t1DX > t2DX ? "developer experience" : "cost efficiency"}, while ${tool2.name} excels in ${t2Community > t1Community ? "community adoption" : t2Bundle > t1Bundle ? "bundle size" : t2DX > t1DX ? "developer experience" : "cost efficiency"}. Consider your project requirements when choosing.`,
      },
      {
        question: `Can I migrate from ${tool1.name} to ${tool2.name}?`,
        answer: `Yes, migration is possible though the complexity depends on your project size. Both tools have ${tool1.docsUrl && tool2.docsUrl ? "documentation" : "community resources"} to help with migration.`,
      },
      {
        question: `Which has better performance: ${tool1.name} or ${tool2.name}?`,
        answer: t1Gzip && t2Gzip 
          ? `${tool1.name} is ${t1BundleStr} while ${tool2.name} is ${t2BundleStr}. ${t1Gzip < t2Gzip ? tool1.name : tool2.name} has the smaller bundle size.`
          : `Performance varies by use case. ${tool1.name} ${tool1.pros.find(p => p.toLowerCase().includes("performance") || p.toLowerCase().includes("fast")) || "offers solid performance"}, while ${tool2.name} ${tool2.pros.find(p => p.toLowerCase().includes("performance") || p.toLowerCase().includes("fast")) || "provides reliable performance"}.`,
      },
      {
        question: `Is ${tool1.name} free to use?`,
        answer: `${tool1.name} is ${tool1.pricingModel.replace("_", " ")}${tool1.externalData?.github?.license ? ` under the ${tool1.externalData.github.license} license` : ""}. ${tool1.isOpenSource ? "It's open source, so you can use it freely for any project." : "Check their pricing page for the latest plans."}`,
      },
      {
        question: `Which should I learn first: ${tool1.name} or ${tool2.name}?`,
        answer: `For beginners, we recommend ${dxWinner.name} due to its ${dxWinner.externalData?.npm?.types ? "TypeScript support and " : ""}${dxWinner.docsUrl ? "comprehensive documentation" : "developer-friendly API"}. ${t1Community > t2Community ? tool1.name : tool2.name} has more community resources with ${formatNumber(Math.max(t1Stars, t2Stars))} GitHub stars.`,
      },
    ];

    const sortedSlugs = [args.tool1Slug, args.tool2Slug].sort();
    
    await ctx.runMutation(internal.seo.saveComparisonInternal, {
      tool1Slug: sortedSlugs[0],
      tool2Slug: sortedSlugs[1],
      title,
      metaDescription,
      introduction,
      tool1Summary,
      tool2Summary,
      comparisonPoints,
      verdict,
      useCaseRecommendations,
      faqs,
    });

    return `${sortedSlugs[0]}-vs-${sortedSlugs[1]}`;
  },
});

export const saveComparisonInternal = internalMutation({
  args: {
    tool1Slug: v.string(),
    tool2Slug: v.string(),
    title: v.string(),
    metaDescription: v.string(),
    introduction: v.string(),
    tool1Summary: v.string(),
    tool2Summary: v.string(),
    comparisonPoints: v.array(v.object({
      category: v.string(),
      tool1Score: v.number(),
      tool2Score: v.number(),
      tool1Reason: v.string(),
      tool2Reason: v.string(),
    })),
    verdict: v.string(),
    useCaseRecommendations: v.array(v.object({
      useCase: v.string(),
      recommendedTool: v.string(),
      reason: v.string(),
    })),
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const slug = `${args.tool1Slug}-vs-${args.tool2Slug}`;

    const existing = await ctx.db
      .query("seoComparisons")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        metaDescription: args.metaDescription,
        introduction: args.introduction,
        tool1Summary: args.tool1Summary,
        tool2Summary: args.tool2Summary,
        comparisonPoints: args.comparisonPoints,
        verdict: args.verdict,
        useCaseRecommendations: args.useCaseRecommendations,
        faqs: args.faqs,
        lastUpdated: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("seoComparisons", {
      tool1Slug: args.tool1Slug,
      tool2Slug: args.tool2Slug,
      slug,
      title: args.title,
      metaDescription: args.metaDescription,
      introduction: args.introduction,
      tool1Summary: args.tool1Summary,
      tool2Summary: args.tool2Summary,
      comparisonPoints: args.comparisonPoints,
      verdict: args.verdict,
      useCaseRecommendations: args.useCaseRecommendations,
      faqs: args.faqs,
      generatedAt: now,
      lastUpdated: now,
      views: 0,
    });
  },
});

export const generateBulkComparisons = action({
  args: { categorySlug: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<string[]> => {
    const pairs = await ctx.runQuery(internal.seo.getToolPairsForGeneration, {
      categorySlug: args.categorySlug,
      limit: args.limit || 10,
    });

    const generatedSlugs: string[] = [];

    for (const pair of pairs) {
      try {
        const slug = await ctx.runAction(internal.seo.generateAIComparison, {
          tool1Slug: pair.tool1Slug,
          tool2Slug: pair.tool2Slug,
        });
        generatedSlugs.push(slug);
      } catch (error) {
        console.error(`Failed to generate comparison for ${pair.tool1Slug} vs ${pair.tool2Slug}:`, error);
      }
    }

    return generatedSlugs;
  },
});

export const getToolPairsForGeneration = internalQuery({
  args: { categorySlug: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();

      if (category) {
        tools = tools.filter((t) => t.categoryId === category._id);
      }
    }

    const existingComparisons = await ctx.db.query("seoComparisons").collect();
    const existingSlugs = new Set(existingComparisons.map((c) => c.slug));

    const pairs: Array<{ tool1Slug: string; tool2Slug: string }> = [];

    for (let i = 0; i < tools.length && pairs.length < (args.limit || 10); i++) {
      for (let j = i + 1; j < tools.length && pairs.length < (args.limit || 10); j++) {
        if (tools[i].categoryId === tools[j].categoryId) {
          const sortedSlugs = [tools[i].slug, tools[j].slug].sort();
          const slug = `${sortedSlugs[0]}-vs-${sortedSlugs[1]}`;

          if (!existingSlugs.has(slug)) {
            pairs.push({
              tool1Slug: sortedSlugs[0],
              tool2Slug: sortedSlugs[1],
            });
          }
        }
      }
    }

    return pairs;
  },
});
