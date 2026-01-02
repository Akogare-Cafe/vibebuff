import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CHAIN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const MAX_MULTIPLIER = 5;

export const getUserChains = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const chains = await ctx.db
      .query("comboChains")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const now = Date.now();
    return chains.map((chain) => ({
      ...chain,
      isActive: chain.expiresAt > now,
      timeRemaining: Math.max(0, chain.expiresAt - now),
    }));
  },
});

export const getChainHistory = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comboHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const recordAction = mutation({
  args: {
    userId: v.string(),
    chainType: v.union(
      v.literal("battle_win"),
      v.literal("deck_create"),
      v.literal("tool_view"),
      v.literal("review_write"),
      v.literal("daily_login")
    ),
    baseXp: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingChain = await ctx.db
      .query("comboChains")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("chainType", args.chainType)
      )
      .first();

    let multiplier = 1;
    let newCount = 1;
    let bestChain = 1;

    if (existingChain) {
      if (existingChain.expiresAt > now) {
        newCount = existingChain.currentCount + 1;
        multiplier = Math.min(1 + newCount * 0.1, MAX_MULTIPLIER);
        bestChain = Math.max(existingChain.bestChain, newCount);

        await ctx.db.patch(existingChain._id, {
          currentCount: newCount,
          multiplier,
          lastActionAt: now,
          expiresAt: now + CHAIN_EXPIRY_MS,
          bestChain,
        });
      } else {
        if (existingChain.currentCount > 1) {
          await ctx.db.insert("comboHistory", {
            userId: args.userId,
            chainType: args.chainType,
            chainLength: existingChain.currentCount,
            totalXpEarned: 0,
            brokenAt: existingChain.expiresAt,
          });
        }

        await ctx.db.patch(existingChain._id, {
          currentCount: 1,
          multiplier: 1,
          lastActionAt: now,
          expiresAt: now + CHAIN_EXPIRY_MS,
        });
      }
    } else {
      await ctx.db.insert("comboChains", {
        userId: args.userId,
        chainType: args.chainType,
        currentCount: 1,
        multiplier: 1,
        lastActionAt: now,
        expiresAt: now + CHAIN_EXPIRY_MS,
        bestChain: 1,
      });
    }

    const bonusXp = Math.floor(args.baseXp * (multiplier - 1));
    const totalXp = args.baseXp + bonusXp;

    if (bonusXp > 0) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
        .first();

      if (profile) {
        const newXp = profile.xp + bonusXp;
        const newLevel = Math.floor(newXp / 1000) + 1;
        await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });

        await ctx.db.insert("xpActivityLog", {
          userId: args.userId,
          amount: bonusXp,
          source: "combo_bonus",
          description: `${args.chainType} combo x${newCount} bonus`,
          timestamp: now,
        });
      }
    }

    return {
      chainCount: newCount,
      multiplier,
      bonusXp,
      totalXp,
      bestChain,
    };
  },
});

export const getLeaderboard = query({
  args: { chainType: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("comboChains");

    if (args.chainType) {
      const chains = await query.collect();
      const filtered = chains
        .filter((c) => c.chainType === args.chainType)
        .sort((a, b) => b.bestChain - a.bestChain)
        .slice(0, args.limit ?? 10);

      const userIds = [...new Set(filtered.map((c) => c.userId))];
      const profiles = await Promise.all(
        userIds.map((id) =>
          ctx.db
            .query("userProfiles")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
            .first()
        )
      );
      const profileMap = new Map(
        profiles.filter(Boolean).map((p) => [p!.clerkId, p])
      );

      return filtered.map((chain) => ({
        ...chain,
        user: profileMap.get(chain.userId),
      }));
    }

    const allChains = await query.collect();
    const bestByUser = new Map<string, typeof allChains[0]>();

    for (const chain of allChains) {
      const existing = bestByUser.get(chain.userId);
      if (!existing || chain.bestChain > existing.bestChain) {
        bestByUser.set(chain.userId, chain);
      }
    }

    const sorted = Array.from(bestByUser.values())
      .sort((a, b) => b.bestChain - a.bestChain)
      .slice(0, args.limit ?? 10);

    const userIds = sorted.map((c) => c.userId);
    const profiles = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );
    const profileMap = new Map(
      profiles.filter(Boolean).map((p) => [p!.clerkId, p])
    );

    return sorted.map((chain) => ({
      ...chain,
      user: profileMap.get(chain.userId),
    }));
  },
});
