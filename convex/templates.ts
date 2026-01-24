import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all templates
export const list = query({
  args: {
    category: v.optional(v.union(
      v.literal("indie"),
      v.literal("startup"),
      v.literal("enterprise"),
      v.literal("agency"),
      v.literal("hobby")
    )),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let templates;

    if (args.featured) {
      templates = await ctx.db.query("stackTemplates")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
    } else if (args.category) {
      templates = await ctx.db.query("stackTemplates")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      templates = await ctx.db.query("stackTemplates").collect();
    }

    // Get tool details for each template
    const templatesWithTools = await Promise.all(
      templates.slice(0, args.limit || 50).map(async (template) => {
        const tools = await Promise.all(
          template.toolIds.map((id) => ctx.db.get(id))
        );
        return {
          ...template,
          tools: tools.filter(Boolean),
        };
      })
    );

    return templatesWithTools;
  },
});

// Get template by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("stackTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!template) return null;

    const tools = await Promise.all(
      template.toolIds.map((id) => ctx.db.get(id))
    );

    const categories = await Promise.all(
      template.categoryAssignments.map(async (ca) => {
        const category = await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", ca.categorySlug))
          .first();
        const tool = await ctx.db.get(ca.toolId);
        return { category, tool };
      })
    );

    return {
      ...template,
      tools: tools.filter(Boolean),
      categoryAssignmentsWithDetails: categories,
    };
  },
});

// Clone template to user deck
export const cloneToDeck = mutation({
  args: {
    userId: v.string(),
    templateId: v.id("stackTemplates"),
    deckName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    // Increment usage count
    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
    });

    // Create new deck from template
    const deckId = await ctx.db.insert("userDecks", {
      userId: args.userId,
      name: args.deckName || `${template.name} (Copy)`,
      description: `Cloned from template: ${template.name}`,
      toolIds: template.toolIds,
      categoryAssignments: template.categoryAssignments,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { deckId };
  },
});

// Seed official templates
export const seedTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Get tool IDs by slug
    const getToolId = async (slug: string) => {
      const tool = await ctx.db
        .query("tools")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      return tool?._id;
    };

    const templates = [
      {
        slug: "indie-hacker-stack",
        name: "The Indie Hacker Stack",
        description: "Battle-tested tools for solo founders shipping fast. Low cost, high velocity.",
        category: "indie" as const,
        tags: ["solo-founder", "low-cost", "fast-shipping", "saas"],
        difficulty: "beginner" as const,
        estimatedMonthlyCost: 20,
        caseStudy: {
          projectName: "ShipFast",
          description: "A SaaS boilerplate that helped 1000+ indie hackers launch faster",
          outcome: "$100k+ MRR achieved by users",
        },
        isFeatured: true,
        usageCount: 0,
        toolSlugs: ["nextjs", "supabase", "vercel", "tailwindcss", "stripe"],
      },
      {
        slug: "startup-scale-stack",
        name: "The Startup Scale Stack",
        description: "Built for growth. Handles 10x traffic without breaking a sweat.",
        category: "startup" as const,
        tags: ["scalable", "team-friendly", "growth", "series-a"],
        difficulty: "intermediate" as const,
        estimatedMonthlyCost: 200,
        caseStudy: {
          projectName: "RapidGrowth",
          description: "Scaled from 1k to 100k users in 3 months",
          outcome: "Raised $5M Series A",
        },
        isFeatured: true,
        usageCount: 0,
        toolSlugs: ["nextjs", "postgresql", "redis", "aws", "datadog"],
      },
      {
        slug: "enterprise-fortress",
        name: "The Enterprise Fortress",
        description: "Security-first, compliance-ready. Built for Fortune 500.",
        category: "enterprise" as const,
        tags: ["enterprise", "security", "compliance", "soc2"],
        difficulty: "advanced" as const,
        estimatedMonthlyCost: 2000,
        isFeatured: true,
        usageCount: 0,
        toolSlugs: ["react", "typescript", "postgresql", "aws", "okta"],
      },
      {
        slug: "ai-first-stack",
        name: "The AI-First Stack",
        description: "Everything you need to build AI-powered applications.",
        category: "startup" as const,
        tags: ["ai", "ml", "llm", "openai", "vector-db"],
        difficulty: "intermediate" as const,
        estimatedMonthlyCost: 100,
        isFeatured: true,
        usageCount: 0,
        toolSlugs: ["nextjs", "openai", "pinecone", "vercel", "langchain"],
      },
      {
        slug: "weekend-project",
        name: "The Weekend Project",
        description: "Ship something cool in 48 hours. Zero config, maximum fun.",
        category: "hobby" as const,
        tags: ["quick", "fun", "learning", "side-project"],
        difficulty: "beginner" as const,
        estimatedMonthlyCost: 0,
        isFeatured: false,
        usageCount: 0,
        toolSlugs: ["nextjs", "tailwindcss", "vercel", "supabase"],
      },
    ];

    let seeded = 0;
    for (const template of templates) {
      const existing = await ctx.db
        .query("stackTemplates")
        .withIndex("by_slug", (q) => q.eq("slug", template.slug))
        .first();

      if (!existing) {
        const toolIds = await Promise.all(
          template.toolSlugs.map(getToolId)
        );
        const validToolIds = toolIds.filter((id): id is NonNullable<typeof id> => id !== undefined);

        if (validToolIds.length > 0) {
          const categoryAssignments = validToolIds.map((toolId) => ({
            categorySlug: "frontend", // Simplified - would need proper category mapping
            toolId,
          }));

          await ctx.db.insert("stackTemplates", {
            slug: template.slug,
            name: template.name,
            description: template.description,
            category: template.category,
            toolIds: validToolIds,
            categoryAssignments,
            estimatedMonthlyCost: template.estimatedMonthlyCost,
            caseStudy: template.caseStudy,
            tags: template.tags,
            difficulty: template.difficulty,
            isFeatured: template.isFeatured,
            usageCount: template.usageCount,
          });
          seeded++;
        }
      }
    }

    return { seeded };
  },
});
