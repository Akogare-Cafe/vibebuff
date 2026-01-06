import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getToolExternalData = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;
    return {
      name: tool.name,
      externalData: tool.externalData,
      githubUrl: tool.githubUrl,
      npmPackageName: tool.npmPackageName,
    };
  },
});

export const setNpmPackageName = mutation({
  args: {
    toolId: v.id("tools"),
    npmPackageName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolId, {
      npmPackageName: args.npmPackageName,
    });
  },
});
