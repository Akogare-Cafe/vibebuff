import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const nodeValidator = v.object({
  id: v.string(),
  type: v.string(),
  position: v.object({ x: v.number(), y: v.number() }),
  data: v.object({
    label: v.string(),
    toolId: v.optional(v.id("tools")),
    category: v.string(),
    description: v.optional(v.string()),
  }),
});

const edgeValidator = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  label: v.optional(v.string()),
  animated: v.optional(v.boolean()),
});

export const listBlueprints = query({
  args: {
    projectType: v.optional(v.union(
      v.literal("landing-page"),
      v.literal("saas"),
      v.literal("e-commerce"),
      v.literal("blog"),
      v.literal("dashboard"),
      v.literal("mobile-app"),
      v.literal("api")
    )),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
  },
  handler: async (ctx, args) => {
    let blueprints;

    if (args.projectType) {
      blueprints = await ctx.db
        .query("stackBlueprints")
        .withIndex("by_project_type", (q) => q.eq("projectType", args.projectType!))
        .collect();
    } else {
      blueprints = await ctx.db.query("stackBlueprints").collect();
    }

    if (args.difficulty) {
      blueprints = blueprints.filter((b) => b.difficulty === args.difficulty);
    }

    const blueprintsWithTools = await Promise.all(
      blueprints.map(async (blueprint) => {
        const tools = await Promise.all(
          blueprint.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...blueprint, tools: tools.filter(Boolean) };
      })
    );

    return blueprintsWithTools;
  },
});

export const getFeaturedBlueprints = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const blueprints = await ctx.db
      .query("stackBlueprints")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    const limited = args.limit ? blueprints.slice(0, args.limit) : blueprints;

    const blueprintsWithTools = await Promise.all(
      limited.map(async (blueprint) => {
        const tools = await Promise.all(
          blueprint.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...blueprint, tools: tools.filter(Boolean) };
      })
    );

    return blueprintsWithTools;
  },
});

export const getBlueprintBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const blueprint = await ctx.db
      .query("stackBlueprints")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!blueprint) return null;

    const tools = await Promise.all(
      blueprint.toolIds.map((id) => ctx.db.get(id))
    );

    const nodesWithToolData = await Promise.all(
      blueprint.nodes.map(async (node) => {
        if (node.data.toolId) {
          const tool = await ctx.db.get(node.data.toolId);
          return { ...node, data: { ...node.data, tool } };
        }
        return node;
      })
    );

    return { ...blueprint, tools: tools.filter(Boolean), nodes: nodesWithToolData };
  },
});

export const incrementBlueprintViews = mutation({
  args: { blueprintId: v.id("stackBlueprints") },
  handler: async (ctx, args) => {
    const blueprint = await ctx.db.get(args.blueprintId);
    if (!blueprint) return;

    await ctx.db.patch(args.blueprintId, {
      views: blueprint.views + 1,
    });
  },
});

export const getUserBuilds = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const builds = await ctx.db
      .query("userStackBuilds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return builds.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getBuildByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const build = await ctx.db
      .query("userStackBuilds")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!build || !build.isPublic) return null;

    const nodesWithToolData = await Promise.all(
      build.nodes.map(async (node) => {
        if (node.data.toolId) {
          const tool = await ctx.db.get(node.data.toolId);
          return { ...node, data: { ...node.data, tool } };
        }
        return node;
      })
    );

    return { ...build, nodes: nodesWithToolData };
  },
});

export const createBuild = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    nodes: v.array(nodeValidator),
    edges: v.array(edgeValidator),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const shareToken = args.isPublic 
      ? Math.random().toString(36).substring(2, 15) 
      : undefined;

    return await ctx.db.insert("userStackBuilds", {
      ...args,
      shareToken,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateBuild = mutation({
  args: {
    buildId: v.id("userStackBuilds"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    nodes: v.optional(v.array(nodeValidator)),
    edges: v.optional(v.array(edgeValidator)),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { buildId, ...updates } = args;
    const build = await ctx.db.get(buildId);
    if (!build) throw new Error("Build not found");

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (args.isPublic && !build.shareToken) {
      (filteredUpdates as Record<string, unknown>).shareToken = Math.random().toString(36).substring(2, 15);
    }

    await ctx.db.patch(buildId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteBuild = mutation({
  args: { buildId: v.id("userStackBuilds") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.buildId);
  },
});

export const createBlueprint = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    projectType: v.union(
      v.literal("landing-page"),
      v.literal("saas"),
      v.literal("e-commerce"),
      v.literal("blog"),
      v.literal("dashboard"),
      v.literal("mobile-app"),
      v.literal("api")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    nodes: v.array(nodeValidator),
    edges: v.array(edgeValidator),
    toolIds: v.array(v.id("tools")),
    estimatedCost: v.optional(v.string()),
    isTemplate: v.boolean(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stackBlueprints", {
      ...args,
      views: 0,
      createdAt: Date.now(),
    });
  },
});
