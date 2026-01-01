import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getGraveyardEntries = query({
  args: { cause: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.cause) {
      return await ctx.db
        .query("toolGraveyard")
        .withIndex("by_cause", (q) => q.eq("causeOfDeath", args.cause as any))
        .take(args.limit || 20);
    }

    return await ctx.db.query("toolGraveyard").take(args.limit || 20);
  },
});

export const getGraveyardEntry = query({
  args: { entryId: v.id("toolGraveyard") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) return null;

    const successors = entry.successorToolIds
      ? await Promise.all(entry.successorToolIds.map((id) => ctx.db.get(id)))
      : [];

    const memorials = await ctx.db
      .query("graveyardMemorials")
      .withIndex("by_entry", (q) => q.eq("graveyardEntryId", args.entryId))
      .take(50);

    return { ...entry, successors: successors.filter(Boolean), memorials };
  },
});

export const getRecentDeaths = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("toolGraveyard")
      .withIndex("by_death_year")
      .order("desc")
      .take(args.limit || 10);

    return entries;
  },
});

export const getResurrectedTools = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("toolGraveyard")
      .withIndex("by_resurrected", (q) => q.eq("isResurrected", true))
      .collect();
  },
});

export const getResurrectionWatch = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const watches = await ctx.db
      .query("resurrectionWatch")
      .withIndex("by_hope")
      .order("desc")
      .take(args.limit || 10);

    return watches;
  },
});

export const getMigrationGuides = query({
  args: { fromToolName: v.string() },
  handler: async (ctx, args) => {
    const guides = await ctx.db
      .query("legacyMigrationGuides")
      .withIndex("by_from", (q) => q.eq("fromToolName", args.fromToolName))
      .collect();

    const guidesWithTools = await Promise.all(
      guides.map(async (g) => {
        const toTool = await ctx.db.get(g.toToolId);
        return { ...g, toTool };
      })
    );

    return guidesWithTools;
  },
});

export const addToGraveyard = mutation({
  args: {
    toolId: v.optional(v.id("tools")),
    name: v.string(),
    tagline: v.string(),
    logoUrl: v.optional(v.string()),
    category: v.string(),
    peakPopularity: v.number(),
    peakYear: v.number(),
    deathYear: v.number(),
    causeOfDeath: v.union(
      v.literal("abandoned"),
      v.literal("acquired_killed"),
      v.literal("superseded"),
      v.literal("security_issues"),
      v.literal("company_shutdown"),
      v.literal("community_exodus"),
      v.literal("other")
    ),
    obituary: v.string(),
    lessonsLearned: v.array(v.string()),
    successorToolIds: v.optional(v.array(v.id("tools"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toolGraveyard", {
      ...args,
      memorialMessages: 0,
      isResurrected: false,
      createdAt: Date.now(),
    });
  },
});

export const addMemorial = mutation({
  args: {
    graveyardEntryId: v.id("toolGraveyard"),
    oderId: v.string(),
    message: v.string(),
    yearsUsed: v.optional(v.number()),
    fondestMemory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.graveyardEntryId);
    if (!entry) throw new Error("Entry not found");

    await ctx.db.insert("graveyardMemorials", {
      ...args,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.graveyardEntryId, {
      memorialMessages: entry.memorialMessages + 1,
    });
  },
});

export const addToResurrectionWatch = mutation({
  args: {
    toolId: v.optional(v.id("tools")),
    graveyardEntryId: v.optional(v.id("toolGraveyard")),
    name: v.string(),
    sign: v.string(),
    reportedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("resurrectionWatch")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        signs: [...existing.signs, { sign: args.sign, reportedAt: Date.now(), reportedBy: args.reportedBy }],
        hopeLevel: Math.min(100, existing.hopeLevel + 10),
        lastActivity: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("resurrectionWatch", {
      toolId: args.toolId,
      graveyardEntryId: args.graveyardEntryId,
      name: args.name,
      signs: [{ sign: args.sign, reportedAt: Date.now(), reportedBy: args.reportedBy }],
      hopeLevel: 20,
      watchers: 1,
      lastActivity: Date.now(),
    });
  },
});

export const watchResurrection = mutation({
  args: { watchId: v.id("resurrectionWatch") },
  handler: async (ctx, args) => {
    const watch = await ctx.db.get(args.watchId);
    if (!watch) throw new Error("Watch not found");

    await ctx.db.patch(args.watchId, {
      watchers: watch.watchers + 1,
    });
  },
});

export const markResurrected = mutation({
  args: { graveyardEntryId: v.id("toolGraveyard") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.graveyardEntryId, {
      isResurrected: true,
      resurrectionDate: Date.now(),
    });
  },
});

export const addMigrationGuide = mutation({
  args: {
    fromToolName: v.string(),
    graveyardEntryId: v.optional(v.id("toolGraveyard")),
    toToolId: v.id("tools"),
    guide: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("hard"),
      v.literal("nightmare")
    ),
    estimatedHours: v.number(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("legacyMigrationGuides", {
      ...args,
      upvotes: 0,
      createdAt: Date.now(),
    });
  },
});

export const upvoteMigrationGuide = mutation({
  args: { guideId: v.id("legacyMigrationGuides") },
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide) throw new Error("Guide not found");

    await ctx.db.patch(args.guideId, {
      upvotes: guide.upvotes + 1,
    });
  },
});

export const seedGraveyard = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").take(3);

    const entries = [
      {
        name: "Bower",
        tagline: "A package manager for the web",
        category: "Package Managers",
        peakPopularity: 85,
        peakYear: 2015,
        deathYear: 2017,
        causeOfDeath: "superseded" as const,
        obituary: "Bower was once the go-to package manager for frontend dependencies. It served us well during the jQuery era, but npm and yarn eventually made it obsolete.",
        lessonsLearned: [
          "Consolidation in tooling is inevitable",
          "Being frontend-specific wasn't enough differentiation",
          "The JavaScript ecosystem moves fast",
        ],
        successorToolIds: tools.slice(0, 1).map((t) => t._id),
      },
      {
        name: "Parse",
        tagline: "The complete mobile app platform",
        category: "Backend as a Service",
        peakPopularity: 90,
        peakYear: 2014,
        deathYear: 2017,
        causeOfDeath: "acquired_killed" as const,
        obituary: "Parse was beloved by mobile developers for its simplicity. Facebook acquired it in 2013 and shut it down in 2017, leaving many developers scrambling.",
        lessonsLearned: [
          "Don't rely too heavily on a single provider",
          "Open source your platform if you want it to survive",
          "Acquisitions can kill products",
        ],
      },
    ];

    for (const entry of entries) {
      const existing = await ctx.db
        .query("toolGraveyard")
        .filter((q) => q.eq(q.field("name"), entry.name))
        .first();

      if (!existing) {
        await ctx.db.insert("toolGraveyard", {
          ...entry,
          memorialMessages: 0,
          isResurrected: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});
