import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getToolForFetch = internalQuery({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.toolId);
  },
});

export const getStaleToolsForRefresh = internalQuery({
  args: {
    limit: v.number(),
    staleAfterMs: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.staleAfterMs;
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const staleTools = tools
      .filter((t) => !t.externalData?.lastFetched || t.externalData.lastFetched < cutoff)
      .sort((a, b) => {
        const aFetched = a.externalData?.lastFetched ?? 0;
        const bFetched = b.externalData?.lastFetched ?? 0;
        return aFetched - bFetched;
      })
      .slice(0, args.limit);

    return staleTools;
  },
});

export const getAllToolsForFetch = internalQuery({
  args: {
    limit: v.optional(v.number()),
    skipRecent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let tools = await ctx.db.query("tools").collect();

    if (args.skipRecent) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      tools = tools.filter(
        (t) => !t.externalData?.lastFetched || t.externalData.lastFetched < oneDayAgo
      );
    }

    if (args.limit) {
      tools = tools.slice(0, args.limit);
    }

    return tools;
  },
});

export const updateToolExternalData = internalMutation({
  args: {
    toolId: v.id("tools"),
    externalData: v.object({
      github: v.optional(v.object({
        stars: v.number(),
        forks: v.number(),
        watchers: v.number(),
        openIssues: v.number(),
        license: v.optional(v.string()),
        language: v.optional(v.string()),
        topics: v.optional(v.array(v.string())),
        createdAt: v.optional(v.string()),
        updatedAt: v.optional(v.string()),
        pushedAt: v.optional(v.string()),
        description: v.optional(v.string()),
        homepage: v.optional(v.string()),
        size: v.optional(v.number()),
        defaultBranch: v.optional(v.string()),
        hasWiki: v.optional(v.boolean()),
        hasIssues: v.optional(v.boolean()),
        archived: v.optional(v.boolean()),
        contributors: v.optional(v.number()),
        commits: v.optional(v.number()),
        releases: v.optional(v.number()),
        latestRelease: v.optional(v.object({
          tagName: v.string(),
          name: v.optional(v.string()),
          publishedAt: v.optional(v.string()),
        })),
      })),
      npm: v.optional(v.object({
        downloadsWeekly: v.number(),
        downloadsMonthly: v.optional(v.number()),
        downloadsYearly: v.optional(v.number()),
        version: v.optional(v.string()),
        license: v.optional(v.string()),
        dependencies: v.optional(v.number()),
        devDependencies: v.optional(v.number()),
        maintainers: v.optional(v.number()),
        lastPublished: v.optional(v.string()),
        firstPublished: v.optional(v.string()),
        types: v.optional(v.boolean()),
        unpackedSize: v.optional(v.number()),
        keywords: v.optional(v.array(v.string())),
      })),
      bundlephobia: v.optional(v.object({
        size: v.number(),
        gzip: v.number(),
        dependencyCount: v.optional(v.number()),
        hasJSModule: v.optional(v.boolean()),
        hasJSNext: v.optional(v.boolean()),
        hasSideEffects: v.optional(v.boolean()),
      })),
      lastFetched: v.number(),
    }),
    githubStars: v.optional(v.number()),
    npmDownloadsWeekly: v.optional(v.number()),
    readme: v.optional(v.object({
      excerpt: v.optional(v.string()),
      badges: v.optional(v.array(v.string())),
      hasQuickStart: v.optional(v.boolean()),
      hasContributing: v.optional(v.boolean()),
      hasChangelog: v.optional(v.boolean()),
    })),
    changelog: v.optional(v.array(v.object({
      version: v.string(),
      date: v.optional(v.string()),
      changes: v.array(v.string()),
      isBreaking: v.optional(v.boolean()),
    }))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolId, {
      externalData: args.externalData,
      ...(args.githubStars !== undefined && { githubStars: args.githubStars }),
      ...(args.npmDownloadsWeekly !== undefined && { npmDownloadsWeekly: args.npmDownloadsWeekly }),
      ...(args.readme !== undefined && { readme: args.readme }),
      ...(args.changelog !== undefined && { changelog: args.changelog }),
    });
  },
});
