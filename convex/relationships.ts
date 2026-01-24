import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getToolRelationships = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const asSource = await ctx.db
      .query("toolRelationships")
      .withIndex("by_tool1", (q) => q.eq("tool1Id", args.toolId))
      .collect();

    const asTarget = await ctx.db
      .query("toolRelationships")
      .withIndex("by_tool2", (q) => q.eq("tool2Id", args.toolId))
      .collect();

    const allRelationships = [...asSource, ...asTarget];

    const relationshipsWithTools = await Promise.all(
      allRelationships.map(async (r) => {
        const otherToolId = r.tool1Id === args.toolId ? r.tool2Id : r.tool1Id;
        const otherTool = await ctx.db.get(otherToolId);
        return { ...r, relatedTool: otherTool };
      })
    );

    return relationshipsWithTools;
  },
});

export const getRelationshipsByType = query({
  args: { type: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const relationships = await ctx.db
      .query("toolRelationships")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_type", (q) => q.eq("relationshipType", args.type as any))
      .take(args.limit || 50);

    const relationshipsWithTools = await Promise.all(
      relationships.map(async (r) => {
        const tool1 = await ctx.db.get(r.tool1Id);
        const tool2 = await ctx.db.get(r.tool2Id);
        return { ...r, tool1, tool2 };
      })
    );

    return relationshipsWithTools;
  },
});

export const getMigrationPaths = query({
  args: { fromToolId: v.id("tools") },
  handler: async (ctx, args) => {
    const paths = await ctx.db
      .query("migrationPaths")
      .withIndex("by_from", (q) => q.eq("fromToolId", args.fromToolId))
      .collect();

    const pathsWithTools = await Promise.all(
      paths.map(async (p) => {
        const toTool = await ctx.db.get(p.toToolId);
        return { ...p, toTool };
      })
    );

    return pathsWithTools;
  },
});

export const getMigrationPathsTo = query({
  args: { toToolId: v.id("tools") },
  handler: async (ctx, args) => {
    const paths = await ctx.db
      .query("migrationPaths")
      .withIndex("by_to", (q) => q.eq("toToolId", args.toToolId))
      .collect();

    const pathsWithTools = await Promise.all(
      paths.map(async (p) => {
        const fromTool = await ctx.db.get(p.fromToolId);
        return { ...p, fromTool };
      })
    );

    return pathsWithTools;
  },
});

export const getRelationshipGraph = query({
  args: { centerToolId: v.id("tools"), depth: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const maxDepth = args.depth || 2;
    const visited = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const edges: any[] = [];

    async function explore(toolId: string, currentDepth: number) {
      if (currentDepth > maxDepth || visited.has(toolId)) return;
      visited.add(toolId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tool = await ctx.db.get(toolId as any);
      if (tool) {
        nodes.push({ id: toolId, data: tool, depth: currentDepth });
      }

      const relationships = await ctx.db
        .query("toolRelationships")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_tool1", (q) => q.eq("tool1Id", toolId as any))
        .collect();

      const reverseRelationships = await ctx.db
        .query("toolRelationships")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_tool2", (q) => q.eq("tool2Id", toolId as any))
        .collect();

      for (const r of [...relationships, ...reverseRelationships]) {
        const otherToolId = r.tool1Id.toString() === toolId ? r.tool2Id.toString() : r.tool1Id.toString();
        edges.push({
          source: r.tool1Id.toString(),
          target: r.tool2Id.toString(),
          type: r.relationshipType,
          strength: r.strength,
        });
        await explore(otherToolId, currentDepth + 1);
      }
    }

    await explore(args.centerToolId.toString(), 0);

    return { nodes, edges };
  },
});

export const createRelationship = mutation({
  args: {
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    relationshipType: v.union(
      v.literal("pairs_with"),
      v.literal("competes_with"),
      v.literal("replaces"),
      v.literal("inspired_by"),
      v.literal("extends"),
      v.literal("requires")
    ),
    strength: v.number(),
    evidence: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toolRelationships", {
      ...args,
      communityVotes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const voteOnRelationship = mutation({
  args: { relationshipId: v.id("toolRelationships") },
  handler: async (ctx, args) => {
    const relationship = await ctx.db.get(args.relationshipId);
    if (!relationship) throw new Error("Relationship not found");

    await ctx.db.patch(args.relationshipId, {
      communityVotes: relationship.communityVotes + 1,
      updatedAt: Date.now(),
    });
  },
});

export const createMigrationPath = mutation({
  args: {
    fromToolId: v.id("tools"),
    toToolId: v.id("tools"),
    difficulty: v.union(v.literal("easy"), v.literal("moderate"), v.literal("hard"), v.literal("painful")),
    estimatedHours: v.number(),
    steps: v.array(v.string()),
    gotchas: v.array(v.string()),
    resources: v.array(v.object({ title: v.string(), url: v.string() })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("migrationPaths", {
      ...args,
      successRate: 0,
      reports: 0,
      createdAt: Date.now(),
    });
  },
});

export const reportMigrationSuccess = mutation({
  args: { pathId: v.id("migrationPaths"), wasSuccessful: v.boolean() },
  handler: async (ctx, args) => {
    const path = await ctx.db.get(args.pathId);
    if (!path) throw new Error("Path not found");

    const newReports = path.reports + 1;
    const successfulReports = Math.round(path.successRate * path.reports / 100) + (args.wasSuccessful ? 1 : 0);
    const newSuccessRate = Math.round((successfulReports / newReports) * 100);

    await ctx.db.patch(args.pathId, {
      reports: newReports,
      successRate: newSuccessRate,
    });
  },
});
