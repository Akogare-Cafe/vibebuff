import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const PRESTIGE_TIERS = [
  { level: 0, tier: "none", xpRequired: 0 },
  { level: 1, tier: "bronze", xpRequired: 10000 },
  { level: 2, tier: "silver", xpRequired: 25000 },
  { level: 3, tier: "gold", xpRequired: 50000 },
  { level: 4, tier: "platinum", xpRequired: 100000 },
  { level: 5, tier: "diamond", xpRequired: 250000 },
  { level: 6, tier: "master", xpRequired: 500000 },
];

const PRESTIGE_BONUSES = {
  bronze: { xpMultiplier: 1.05, packLuckBonus: 0.02, battleStatBonus: 0.02, dailySpinBonus: 0.05 },
  silver: { xpMultiplier: 1.10, packLuckBonus: 0.05, battleStatBonus: 0.05, dailySpinBonus: 0.10 },
  gold: { xpMultiplier: 1.15, packLuckBonus: 0.08, battleStatBonus: 0.08, dailySpinBonus: 0.15 },
  platinum: { xpMultiplier: 1.25, packLuckBonus: 0.12, battleStatBonus: 0.12, dailySpinBonus: 0.20 },
  diamond: { xpMultiplier: 1.40, packLuckBonus: 0.18, battleStatBonus: 0.18, dailySpinBonus: 0.30 },
  master: { xpMultiplier: 1.60, packLuckBonus: 0.25, battleStatBonus: 0.25, dailySpinBonus: 0.50 },
};

export const getUserPrestige = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prestige = await ctx.db
      .query("userPrestige")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!prestige) {
      return {
        prestigeLevel: 0,
        prestigeTier: "none",
        totalXpEarned: 0,
        permanentBonuses: {
          xpMultiplier: 1,
          packLuckBonus: 0,
          battleStatBonus: 0,
          dailySpinBonus: 0,
        },
        timesPrestiged: 0,
        nextTier: PRESTIGE_TIERS[1],
        progress: 0,
      };
    }

    const currentTierIndex = PRESTIGE_TIERS.findIndex(
      (t) => t.tier === prestige.prestigeTier
    );
    const nextTier = PRESTIGE_TIERS[currentTierIndex + 1];
    const currentTier = PRESTIGE_TIERS[currentTierIndex];

    let progress = 100;
    if (nextTier) {
      const xpInTier = prestige.totalXpEarned - currentTier.xpRequired;
      const xpNeeded = nextTier.xpRequired - currentTier.xpRequired;
      progress = Math.min(100, Math.floor((xpInTier / xpNeeded) * 100));
    }

    return {
      ...prestige,
      nextTier,
      progress,
      canPrestige: nextTier && prestige.totalXpEarned >= nextTier.xpRequired,
    };
  },
});

export const getPrestigeTiers = query({
  args: {},
  handler: async () => {
    return PRESTIGE_TIERS.map((tier) => ({
      ...tier,
      bonuses: tier.tier !== "none" ? PRESTIGE_BONUSES[tier.tier as keyof typeof PRESTIGE_BONUSES] : null,
    }));
  },
});

export const initializePrestige = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPrestige")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) return existing;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    const totalXp = profile?.xp ?? 0;

    return await ctx.db.insert("userPrestige", {
      userId: args.userId,
      prestigeLevel: 0,
      prestigeTier: "none",
      totalXpEarned: totalXp,
      permanentBonuses: {
        xpMultiplier: 1,
        packLuckBonus: 0,
        battleStatBonus: 0,
        dailySpinBonus: 0,
      },
      timesPrestiged: 0,
    });
  },
});

export const prestige = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prestige = await ctx.db
      .query("userPrestige")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!prestige) throw new Error("Prestige not initialized");

    const currentTierIndex = PRESTIGE_TIERS.findIndex(
      (t) => t.tier === prestige.prestigeTier
    );
    const nextTier = PRESTIGE_TIERS[currentTierIndex + 1];

    if (!nextTier) throw new Error("Already at max prestige");
    if (prestige.totalXpEarned < nextTier.xpRequired) {
      throw new Error(`Need ${nextTier.xpRequired} total XP to prestige`);
    }

    const newBonuses = PRESTIGE_BONUSES[nextTier.tier as keyof typeof PRESTIGE_BONUSES];

    await ctx.db.patch(prestige._id, {
      prestigeLevel: nextTier.level,
      prestigeTier: nextTier.tier as "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master",
      permanentBonuses: newBonuses,
      prestigedAt: Date.now(),
      timesPrestiged: prestige.timesPrestiged + 1,
    });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        title: `${nextTier.tier.charAt(0).toUpperCase() + nextTier.tier.slice(1)} Prestige`,
      });
    }

    await ctx.db.insert("xpActivityLog", {
      userId: args.userId,
      amount: 0,
      source: "prestige",
      description: `Achieved ${nextTier.tier} prestige!`,
      timestamp: Date.now(),
    });

    return {
      newTier: nextTier.tier,
      newBonuses,
    };
  },
});

export const addXpToPrestige = mutation({
  args: { userId: v.string(), xpAmount: v.number() },
  handler: async (ctx, args) => {
    const prestige = await ctx.db
      .query("userPrestige")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!prestige) {
      await ctx.db.insert("userPrestige", {
        userId: args.userId,
        prestigeLevel: 0,
        prestigeTier: "none",
        totalXpEarned: args.xpAmount,
        permanentBonuses: {
          xpMultiplier: 1,
          packLuckBonus: 0,
          battleStatBonus: 0,
          dailySpinBonus: 0,
        },
        timesPrestiged: 0,
      });
      return;
    }

    await ctx.db.patch(prestige._id, {
      totalXpEarned: prestige.totalXpEarned + args.xpAmount,
    });
  },
});
