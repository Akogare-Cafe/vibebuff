import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserTrophyRoom = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("trophyRooms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!room) return null;

    const achievements = await Promise.all(
      room.displayedAchievements.map(async (da) => {
        const achievement = await ctx.db.get(da.achievementId);
        return { ...da, achievement };
      })
    );

    const featuredDeck = room.featuredDeckId 
      ? await ctx.db.get(room.featuredDeckId) 
      : null;

    const featuredBattle = room.featuredBattleId 
      ? await ctx.db.get(room.featuredBattleId) 
      : null;

    return {
      ...room,
      displayedAchievements: achievements,
      featuredDeck,
      featuredBattle,
    };
  },
});

export const createOrUpdate = mutation({
  args: {
    userId: v.string(),
    layout: v.string(),
    theme: v.string(),
    displayedAchievements: v.array(v.object({
      achievementId: v.id("achievements"),
      position: v.object({ x: v.number(), y: v.number() }),
      size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    })),
    displayedBadges: v.array(v.string()),
    featuredDeckId: v.optional(v.id("userDecks")),
    featuredBattleId: v.optional(v.id("battleHistory")),
    customTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trophyRooms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        layout: args.layout,
        theme: args.theme,
        displayedAchievements: args.displayedAchievements,
        displayedBadges: args.displayedBadges,
        featuredDeckId: args.featuredDeckId,
        featuredBattleId: args.featuredBattleId,
        customTitle: args.customTitle,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("trophyRooms", {
      userId: args.userId,
      layout: args.layout,
      theme: args.theme,
      displayedAchievements: args.displayedAchievements,
      displayedBadges: args.displayedBadges,
      featuredDeckId: args.featuredDeckId,
      featuredBattleId: args.featuredBattleId,
      customTitle: args.customTitle,
      views: 0,
      updatedAt: Date.now(),
    });
  },
});

export const recordView = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("trophyRooms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (room) {
      await ctx.db.patch(room._id, {
        views: room.views + 1,
      });
    }
  },
});

export const getProfileFrames = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("profileFrames").collect();
  },
});

export const getFrameBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("profileFrames")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const seedFrames = mutation({
  args: {},
  handler: async (ctx) => {
    const frames = [
      { slug: "default", name: "Default", description: "Standard profile frame", rarity: "common" as const, imageUrl: "/frames/default.png" },
      { slug: "pixel-blue", name: "Pixel Blue", description: "Classic blue pixel border", rarity: "common" as const, imageUrl: "/frames/pixel-blue.png" },
      { slug: "neon-glow", name: "Neon Glow", description: "Glowing neon effect", rarity: "rare" as const, imageUrl: "/frames/neon-glow.png", unlockRequirement: { type: "level", value: 10 } },
      { slug: "golden-circuit", name: "Golden Circuit", description: "Circuit board pattern in gold", rarity: "epic" as const, imageUrl: "/frames/golden-circuit.png", unlockRequirement: { type: "battles_won", value: 50 } },
      { slug: "legendary-flame", name: "Legendary Flame", description: "Animated flame border", rarity: "legendary" as const, imageUrl: "/frames/legendary-flame.png", unlockRequirement: { type: "achievements", value: 25 } },
    ];

    for (const frame of frames) {
      const existing = await ctx.db
        .query("profileFrames")
        .withIndex("by_slug", (q) => q.eq("slug", frame.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("profileFrames", frame);
      }
    }

    return { seeded: frames.length };
  },
});

export const getTopTrophyRooms = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("trophyRooms")
      .collect();

    const sorted = rooms.sort((a, b) => b.views - a.views).slice(0, args.limit || 10);

    return Promise.all(
      sorted.map(async (room) => {
        const profile = await ctx.db
          .query("userProfiles")
          .filter((q) => q.eq(q.field("clerkId"), room.userId))
          .first();

        return {
          ...room,
          username: profile?.username,
          level: profile?.level,
        };
      })
    );
  },
});
