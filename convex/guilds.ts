import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    const existing = await ctx.db
      .query("guilds")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    
    if (existing) {
      throw new Error("Guild name already taken");
    }

    const guildId = await ctx.db.insert("guilds", {
      name: args.name,
      slug,
      description: args.description,
      icon: args.icon,
      ownerId: args.ownerId,
      isPublic: args.isPublic,
      maxMembers: 50,
      xp: 0,
      level: 1,
      createdAt: Date.now(),
    });

    await ctx.db.insert("guildMembers", {
      guildId,
      userId: args.ownerId,
      role: "owner",
      joinedAt: Date.now(),
      contributedXp: 0,
    });

    return guildId;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const guild = await ctx.db
      .query("guilds")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!guild) return null;

    const members = await ctx.db
      .query("guildMembers")
      .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
      .collect();

    const stacks = await ctx.db
      .query("guildStacks")
      .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
      .collect();

    return {
      ...guild,
      memberCount: members.length,
      members,
      stacks,
    };
  },
});

export const getUserGuilds = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("guildMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const guilds = await Promise.all(
      memberships.map(async (m) => {
        const guild = await ctx.db.get(m.guildId);
        if (!guild) return null;
        
        const memberCount = (await ctx.db
          .query("guildMembers")
          .withIndex("by_guild", (q) => q.eq("guildId", m.guildId))
          .collect()).length;

        return {
          ...guild,
          role: m.role,
          memberCount,
        };
      })
    );

    return guilds.filter(Boolean);
  },
});

export const listPublic = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const guilds = await ctx.db
      .query("guilds")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(args.limit || 20);

    return Promise.all(
      guilds.map(async (guild) => {
        const memberCount = (await ctx.db
          .query("guildMembers")
          .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
          .collect()).length;

        return { ...guild, memberCount };
      })
    );
  },
});

export const join = mutation({
  args: { userId: v.string(), guildId: v.id("guilds") },
  handler: async (ctx, args) => {
    const guild = await ctx.db.get(args.guildId);
    if (!guild) throw new Error("Guild not found");
    if (!guild.isPublic) throw new Error("Guild is private");

    const existing = await ctx.db
      .query("guildMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("guildId"), args.guildId))
      .first();

    if (existing) throw new Error("Already a member");

    const memberCount = (await ctx.db
      .query("guildMembers")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .collect()).length;

    if (memberCount >= guild.maxMembers) {
      throw new Error("Guild is full");
    }

    await ctx.db.insert("guildMembers", {
      guildId: args.guildId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
      contributedXp: 0,
    });

    return { success: true };
  },
});

export const leave = mutation({
  args: { userId: v.string(), guildId: v.id("guilds") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("guildMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("guildId"), args.guildId))
      .first();

    if (!membership) throw new Error("Not a member");
    if (membership.role === "owner") throw new Error("Owner cannot leave");

    await ctx.db.delete(membership._id);
    return { success: true };
  },
});

export const createStack = mutation({
  args: {
    userId: v.string(),
    guildId: v.id("guilds"),
    name: v.string(),
    description: v.string(),
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("guildMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("guildId"), args.guildId))
      .first();

    if (!membership) throw new Error("Not a member");

    const stackId = await ctx.db.insert("guildStacks", {
      guildId: args.guildId,
      name: args.name,
      description: args.description,
      toolIds: args.toolIds,
      createdBy: args.userId,
      upvotes: 0,
      createdAt: Date.now(),
    });

    await ctx.db.patch(membership._id, {
      contributedXp: membership.contributedXp + 50,
    });

    const guild = await ctx.db.get(args.guildId);
    if (guild) {
      await ctx.db.patch(args.guildId, {
        xp: guild.xp + 50,
      });
    }

    return stackId;
  },
});

export const upvoteStack = mutation({
  args: { stackId: v.id("guildStacks") },
  handler: async (ctx, args) => {
    const stack = await ctx.db.get(args.stackId);
    if (!stack) throw new Error("Stack not found");

    await ctx.db.patch(args.stackId, {
      upvotes: stack.upvotes + 1,
    });

    return { success: true };
  },
});

export const challengeGuild = mutation({
  args: {
    guildId: v.id("guilds"),
    opponentGuildId: v.id("guilds"),
    challengeType: v.union(v.literal("battle"), v.literal("build"), v.literal("quiz")),
    stakes: v.object({
      xp: v.number(),
      badge: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const challengeId = await ctx.db.insert("guildChallenges", {
      guildId: args.guildId,
      opponentGuildId: args.opponentGuildId,
      challengeType: args.challengeType,
      status: "pending",
      stakes: args.stakes,
      createdAt: Date.now(),
    });

    return challengeId;
  },
});

export const getGuildChallenges = query({
  args: { guildId: v.id("guilds") },
  handler: async (ctx, args) => {
    const challenges = await ctx.db
      .query("guildChallenges")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .collect();

    return Promise.all(
      challenges.map(async (c) => {
        const opponent = await ctx.db.get(c.opponentGuildId);
        return { ...c, opponent };
      })
    );
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const guilds = await ctx.db
      .query("guilds")
      .collect();

    const sorted = guilds.sort((a, b) => b.xp - a.xp).slice(0, args.limit || 10);

    return Promise.all(
      sorted.map(async (guild, index) => {
        const memberCount = (await ctx.db
          .query("guildMembers")
          .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
          .collect()).length;

        return {
          ...guild,
          rank: index + 1,
          memberCount,
        };
      })
    );
  },
});
