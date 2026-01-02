import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateBlogOutline = action({
  args: {
    targetKeyword: v.string(),
    relatedTools: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<string> => {
    const toolData = args.relatedTools
      ? await ctx.runQuery(internal.seoBlog.getToolsBySlugInternal, {
          slugs: args.relatedTools,
        })
      : [];

    const slug = args.targetKeyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const title = generateTitle(args.targetKeyword);
    const outline = generateOutline(args.targetKeyword, toolData);
    const internalLinks = generateInternalLinks(args.targetKeyword, toolData);

    await ctx.runMutation(internal.seoBlog.saveBlogOutlineInternal, {
      targetKeyword: args.targetKeyword,
      title,
      slug,
      outline,
      suggestedInternalLinks: internalLinks,
      estimatedWordCount: outline.reduce(
        (sum, section) => sum + 200 + section.subheadings.length * 150,
        0
      ),
      difficulty: toolData.length > 3 ? "hard" : toolData.length > 1 ? "medium" : "easy",
    });

    return slug;
  },
});

function generateTitle(keyword: string): string {
  const templates = [
    `${keyword}: Complete Guide for 2025`,
    `Best ${keyword} in 2025: Expert Comparison`,
    `${keyword} Guide: Everything You Need to Know`,
    `How to Choose the Right ${keyword} for Your Project`,
    `${keyword}: A Developer's Complete Handbook`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateOutline(
  keyword: string,
  tools: Array<{ name: string; slug: string; tagline: string }>
): Array<{ heading: string; subheadings: string[]; keyPoints: string[] }> {
  const outline = [
    {
      heading: `What is ${keyword}?`,
      subheadings: ["Definition and Overview", "Why It Matters for Developers"],
      keyPoints: [
        `Explain the core concept of ${keyword}`,
        "Discuss relevance in modern development",
        "Highlight key benefits",
      ],
    },
    {
      heading: `Key Features to Look For`,
      subheadings: [
        "Performance Considerations",
        "Developer Experience",
        "Community and Ecosystem",
        "Pricing and Licensing",
      ],
      keyPoints: [
        "List essential features",
        "Explain evaluation criteria",
        "Provide comparison framework",
      ],
    },
  ];

  if (tools.length > 0) {
    outline.push({
      heading: `Top ${keyword} Options in 2025`,
      subheadings: tools.map((t) => t.name),
      keyPoints: tools.map((t) => `Review ${t.name}: ${t.tagline}`),
    });

    outline.push({
      heading: "Head-to-Head Comparison",
      subheadings: [
        "Feature Comparison Table",
        "Performance Benchmarks",
        "Pricing Comparison",
      ],
      keyPoints: [
        "Create detailed comparison matrix",
        "Include real-world benchmarks",
        "Analyze cost-effectiveness",
      ],
    });
  }

  outline.push({
    heading: `How to Choose the Right ${keyword}`,
    subheadings: [
      "For Startups and MVPs",
      "For Enterprise Applications",
      "For Learning and Side Projects",
    ],
    keyPoints: [
      "Provide decision framework",
      "Match tools to use cases",
      "Include practical recommendations",
    ],
  });

  outline.push({
    heading: "Getting Started",
    subheadings: ["Installation Guide", "Basic Configuration", "Best Practices"],
    keyPoints: [
      "Step-by-step setup instructions",
      "Common configuration options",
      "Tips for optimal usage",
    ],
  });

  outline.push({
    heading: "Frequently Asked Questions",
    subheadings: [],
    keyPoints: [
      `What is the best ${keyword} for beginners?`,
      `Is ${keyword} worth learning in 2025?`,
      `How do I migrate between different ${keyword} options?`,
    ],
  });

  return outline;
}

function generateInternalLinks(
  keyword: string,
  tools: Array<{ name: string; slug: string }>
): Array<{ anchorText: string; targetUrl: string }> {
  const links: Array<{ anchorText: string; targetUrl: string }> = [];

  for (const tool of tools) {
    links.push({
      anchorText: tool.name,
      targetUrl: `/tools/${tool.slug}`,
    });
  }

  for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
      const sortedSlugs = [tools[i].slug, tools[j].slug].sort();
      links.push({
        anchorText: `${tools[i].name} vs ${tools[j].name}`,
        targetUrl: `/compare/${sortedSlugs[0]}-vs-${sortedSlugs[1]}`,
      });
    }
  }

  links.push({
    anchorText: "tech stack builder",
    targetUrl: "/quest",
  });

  links.push({
    anchorText: "compare tools",
    targetUrl: "/compare",
  });

  return links;
}

export const getToolsBySlugInternal = internalQuery({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const tools = [];
    for (const slug of args.slugs) {
      const tool = await ctx.db
        .query("tools")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (tool) {
        tools.push({
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
        });
      }
    }
    return tools;
  },
});

export const saveBlogOutlineInternal = internalMutation({
  args: {
    targetKeyword: v.string(),
    title: v.string(),
    slug: v.string(),
    outline: v.array(
      v.object({
        heading: v.string(),
        subheadings: v.array(v.string()),
        keyPoints: v.array(v.string()),
      })
    ),
    suggestedInternalLinks: v.array(
      v.object({
        anchorText: v.string(),
        targetUrl: v.string(),
      })
    ),
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

export const updateBlogOutlineStatus = mutation({
  args: {
    slug: v.string(),
    status: v.union(v.literal("draft"), v.literal("approved"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const outline = await ctx.db
      .query("seoBlogOutlines")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!outline) {
      throw new Error("Blog outline not found");
    }

    await ctx.db.patch(outline._id, {
      status: args.status,
    });

    return outline._id;
  },
});

export const generateKeywordCluster = action({
  args: {
    primaryKeyword: v.string(),
    categorySlug: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const tools = await ctx.runQuery(internal.seoBlog.getToolsByCategoryInternal, {
      categorySlug: args.categorySlug,
    });

    const relatedKeywords = generateRelatedKeywords(args.primaryKeyword, tools);
    const suggestedContent = generateContentSuggestions(args.primaryKeyword, tools);

    await ctx.runMutation(internal.seoBlog.saveKeywordClusterInternal, {
      primaryKeyword: args.primaryKeyword,
      relatedKeywords,
      suggestedContent,
      toolIds: tools.map((t) => t._id),
    });
  },
});

function generateRelatedKeywords(
  primary: string,
  tools: Array<{ name: string }>
): Array<{ keyword: string; relevanceScore: number }> {
  const keywords: Array<{ keyword: string; relevanceScore: number }> = [];

  keywords.push({ keyword: `best ${primary} 2025`, relevanceScore: 95 });
  keywords.push({ keyword: `${primary} comparison`, relevanceScore: 90 });
  keywords.push({ keyword: `${primary} for beginners`, relevanceScore: 85 });
  keywords.push({ keyword: `${primary} tutorial`, relevanceScore: 80 });
  keywords.push({ keyword: `${primary} vs alternatives`, relevanceScore: 85 });
  keywords.push({ keyword: `how to choose ${primary}`, relevanceScore: 88 });
  keywords.push({ keyword: `${primary} guide`, relevanceScore: 82 });
  keywords.push({ keyword: `${primary} for startups`, relevanceScore: 78 });

  for (const tool of tools.slice(0, 5)) {
    keywords.push({
      keyword: `${tool.name.toLowerCase()} review`,
      relevanceScore: 75,
    });
    keywords.push({
      keyword: `${tool.name.toLowerCase()} alternatives`,
      relevanceScore: 72,
    });
  }

  return keywords;
}

function generateContentSuggestions(
  primary: string,
  tools: Array<{ name: string; slug: string }>
): Array<{
  title: string;
  contentType: "blog" | "comparison" | "guide" | "faq";
  targetKeywords: string[];
}> {
  const suggestions: Array<{
    title: string;
    contentType: "blog" | "comparison" | "guide" | "faq";
    targetKeywords: string[];
  }> = [];

  suggestions.push({
    title: `Best ${primary} in 2025: Complete Guide`,
    contentType: "blog",
    targetKeywords: [`best ${primary}`, `${primary} 2025`, `${primary} guide`],
  });

  suggestions.push({
    title: `${primary} FAQ: Common Questions Answered`,
    contentType: "faq",
    targetKeywords: [`${primary} questions`, `${primary} faq`, `what is ${primary}`],
  });

  for (let i = 0; i < tools.length && i < 3; i++) {
    for (let j = i + 1; j < tools.length && j < 4; j++) {
      suggestions.push({
        title: `${tools[i].name} vs ${tools[j].name}: Which is Better?`,
        contentType: "comparison",
        targetKeywords: [
          `${tools[i].name.toLowerCase()} vs ${tools[j].name.toLowerCase()}`,
          `${tools[i].name.toLowerCase()} comparison`,
        ],
      });
    }
  }

  suggestions.push({
    title: `Getting Started with ${primary}: A Beginner's Guide`,
    contentType: "guide",
    targetKeywords: [`${primary} tutorial`, `${primary} for beginners`, `learn ${primary}`],
  });

  return suggestions;
}

export const getToolsByCategoryInternal = internalQuery({
  args: { categorySlug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.categorySlug) {
      return await ctx.db
        .query("tools")
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(20);
    }

    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
      .first();

    if (!category) {
      return [];
    }

    return await ctx.db
      .query("tools")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const saveKeywordClusterInternal = internalMutation({
  args: {
    primaryKeyword: v.string(),
    relatedKeywords: v.array(
      v.object({
        keyword: v.string(),
        relevanceScore: v.number(),
      })
    ),
    suggestedContent: v.array(
      v.object({
        title: v.string(),
        contentType: v.union(
          v.literal("blog"),
          v.literal("comparison"),
          v.literal("guide"),
          v.literal("faq")
        ),
        targetKeywords: v.array(v.string()),
      })
    ),
    toolIds: v.array(v.id("tools")),
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

export const analyzeContent = action({
  args: {
    contentType: v.union(v.literal("blog"), v.literal("tool"), v.literal("comparison")),
    contentId: v.string(),
    content: v.string(),
    targetKeywords: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const keywordScore = calculateKeywordScore(args.content, args.targetKeywords);
    const readabilityScore = calculateReadabilityScore(args.content);
    const structureScore = calculateStructureScore(args.content);
    const internalLinkScore = calculateInternalLinkScore(args.content);

    const overallScore = Math.round(
      keywordScore * 0.3 +
        readabilityScore * 0.25 +
        structureScore * 0.25 +
        internalLinkScore * 0.2
    );

    const suggestions = generateSuggestions(
      keywordScore,
      readabilityScore,
      structureScore,
      internalLinkScore,
      args.targetKeywords
    );

    await ctx.runMutation(internal.seoBlog.saveContentScoreInternal, {
      contentType: args.contentType,
      contentId: args.contentId,
      overallScore,
      keywordScore,
      readabilityScore,
      structureScore,
      internalLinkScore,
      suggestions,
    });
  },
});

function calculateKeywordScore(content: string, keywords: string[]): number {
  const lowerContent = content.toLowerCase();
  let score = 0;
  let found = 0;

  for (const keyword of keywords) {
    const regex = new RegExp(keyword.toLowerCase(), "g");
    const matches = lowerContent.match(regex);
    if (matches) {
      found++;
      const density = (matches.length / content.split(" ").length) * 100;
      if (density >= 0.5 && density <= 2.5) {
        score += 100;
      } else if (density > 0 && density < 0.5) {
        score += 60;
      } else if (density > 2.5) {
        score += 40;
      }
    }
  }

  return keywords.length > 0 ? Math.round((score / keywords.length) * (found / keywords.length)) : 50;
}

function calculateReadabilityScore(content: string): number {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = content.split(/\s+/).filter((w) => w.length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
    return 90;
  } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
    return 70;
  } else {
    return 50;
  }
}

function calculateStructureScore(content: string): number {
  let score = 50;

  const h1Count = (content.match(/<h1|^#\s/gm) || []).length;
  const h2Count = (content.match(/<h2|^##\s/gm) || []).length;
  const h3Count = (content.match(/<h3|^###\s/gm) || []).length;

  if (h1Count === 1) score += 15;
  if (h2Count >= 3) score += 20;
  if (h3Count >= 2) score += 15;

  return Math.min(score, 100);
}

function calculateInternalLinkScore(content: string): number {
  const linkMatches = content.match(/\[.*?\]\(\/.*?\)|href="\/.*?"/g) || [];
  const linkCount = linkMatches.length;

  if (linkCount >= 5) return 100;
  if (linkCount >= 3) return 80;
  if (linkCount >= 1) return 60;
  return 30;
}

function generateSuggestions(
  keywordScore: number,
  readabilityScore: number,
  structureScore: number,
  internalLinkScore: number,
  keywords: string[]
): Array<{ type: string; priority: "high" | "medium" | "low"; suggestion: string }> {
  const suggestions: Array<{
    type: string;
    priority: "high" | "medium" | "low";
    suggestion: string;
  }> = [];

  if (keywordScore < 60) {
    suggestions.push({
      type: "keyword",
      priority: "high",
      suggestion: `Include target keywords more naturally: ${keywords.slice(0, 3).join(", ")}`,
    });
  }

  if (readabilityScore < 70) {
    suggestions.push({
      type: "readability",
      priority: "medium",
      suggestion: "Break up long sentences. Aim for 15-20 words per sentence on average.",
    });
  }

  if (structureScore < 70) {
    suggestions.push({
      type: "structure",
      priority: "medium",
      suggestion: "Add more subheadings (H2, H3) to improve content structure and scannability.",
    });
  }

  if (internalLinkScore < 60) {
    suggestions.push({
      type: "internal_links",
      priority: "high",
      suggestion: "Add more internal links to related tools, comparisons, and blog posts.",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: "general",
      priority: "low",
      suggestion: "Content is well-optimized. Consider adding more examples or case studies.",
    });
  }

  return suggestions;
}

export const saveContentScoreInternal = internalMutation({
  args: {
    contentType: v.union(v.literal("blog"), v.literal("tool"), v.literal("comparison")),
    contentId: v.string(),
    overallScore: v.number(),
    keywordScore: v.number(),
    readabilityScore: v.number(),
    structureScore: v.number(),
    internalLinkScore: v.number(),
    suggestions: v.array(
      v.object({
        type: v.string(),
        priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
        suggestion: v.string(),
      })
    ),
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

export const generateAltText = action({
  args: {
    imageUrl: v.string(),
    toolSlug: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    let altText = "";

    if (args.toolSlug) {
      const tool = await ctx.runQuery(internal.seoBlog.getToolBySlugInternal, {
        slug: args.toolSlug,
      });

      if (tool) {
        altText = `${tool.name} logo - ${tool.tagline}`;
      }
    }

    if (!altText && args.context) {
      altText = `${args.context} illustration`;
    }

    if (!altText) {
      altText = "Developer tool illustration";
    }

    await ctx.runMutation(internal.seoBlog.saveAltTextInternal, {
      imageUrl: args.imageUrl,
      altText,
      context: args.context,
      toolSlug: args.toolSlug,
    });

    return altText;
  },
});

export const getToolBySlugInternal = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const saveAltTextInternal = internalMutation({
  args: {
    imageUrl: v.string(),
    altText: v.string(),
    context: v.optional(v.string()),
    toolSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let toolId = undefined;

    if (args.toolSlug) {
      const tool = await ctx.db
        .query("tools")
        .withIndex("by_slug", (q) => q.eq("slug", args.toolSlug!))
        .first();
      if (tool) {
        toolId = tool._id;
      }
    }

    const existing = await ctx.db
      .query("seoAltTexts")
      .withIndex("by_image", (q) => q.eq("imageUrl", args.imageUrl))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        altText: args.altText,
        context: args.context,
        toolId,
        generatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("seoAltTexts", {
      imageUrl: args.imageUrl,
      altText: args.altText,
      context: args.context,
      toolId,
      generatedAt: Date.now(),
    });
  },
});
