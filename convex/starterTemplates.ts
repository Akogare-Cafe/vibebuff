import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    projectType: v.optional(v.union(
      v.literal("hello-world"),
      v.literal("landing-page"),
      v.literal("saas-starter"),
      v.literal("blog"),
      v.literal("e-commerce"),
      v.literal("dashboard"),
      v.literal("api")
    )),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
  },
  handler: async (ctx, args) => {
    let templates;

    if (args.projectType) {
      templates = await ctx.db
        .query("starterTemplates")
        .withIndex("by_project_type", (q) => q.eq("projectType", args.projectType!))
        .collect();
    } else if (args.difficulty) {
      templates = await ctx.db
        .query("starterTemplates")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .collect();
    } else {
      templates = await ctx.db.query("starterTemplates").collect();
    }

    if (args.difficulty && args.projectType) {
      templates = templates.filter((t) => t.difficulty === args.difficulty);
    }

    const templatesWithTools = await Promise.all(
      templates.map(async (template) => {
        const tools = await Promise.all(
          template.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...template, tools: tools.filter(Boolean) };
      })
    );

    return templatesWithTools;
  },
});

export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("starterTemplates")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    const limited = args.limit ? templates.slice(0, args.limit) : templates;

    const templatesWithTools = await Promise.all(
      limited.map(async (template) => {
        const tools = await Promise.all(
          template.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...template, tools: tools.filter(Boolean) };
      })
    );

    return templatesWithTools;
  },
});

export const getPopular = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("starterTemplates")
      .withIndex("by_downloads")
      .order("desc")
      .collect();

    const limited = args.limit ? templates.slice(0, args.limit) : templates;

    const templatesWithTools = await Promise.all(
      limited.map(async (template) => {
        const tools = await Promise.all(
          template.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...template, tools: tools.filter(Boolean) };
      })
    );

    return templatesWithTools;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("starterTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!template) return null;

    const tools = await Promise.all(
      template.toolIds.map((id) => ctx.db.get(id))
    );

    return { ...template, tools: tools.filter(Boolean) };
  },
});

export const incrementDownloads = mutation({
  args: { templateId: v.id("starterTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return;

    await ctx.db.patch(args.templateId, {
      downloads: template.downloads + 1,
    });
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    longDescription: v.string(),
    projectType: v.union(
      v.literal("hello-world"),
      v.literal("landing-page"),
      v.literal("saas-starter"),
      v.literal("blog"),
      v.literal("e-commerce"),
      v.literal("dashboard"),
      v.literal("api")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    toolIds: v.array(v.id("tools")),
    githubUrl: v.string(),
    demoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    features: v.array(v.string()),
    setupCommands: v.array(v.object({
      command: v.string(),
      description: v.string(),
    })),
    recommendedPrompts: v.array(v.object({
      title: v.string(),
      prompt: v.string(),
      description: v.string(),
    })),
    videoWalkthroughUrl: v.optional(v.string()),
    estimatedSetupMinutes: v.number(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("starterTemplates", {
      ...args,
      downloads: 0,
      stars: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
