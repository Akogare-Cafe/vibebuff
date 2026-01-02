import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("spinWheelRewards")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const canSpinToday = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const todaySpin = await ctx.db
      .query("userSpins")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("spunAt", todayStart)
      )
      .first();

    return !todaySpin;
  },
});

export const getSpinHistory = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const spins = await ctx.db
      .query("userSpins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10);

    const rewardIds = [...new Set(spins.map((s) => s.rewardId))];
    const rewards = await Promise.all(
      rewardIds.map((id) => ctx.db.get(id))
    );
    const rewardMap = new Map(rewards.filter(Boolean).map((r) => [r!._id, r]));

    return spins.map((spin) => ({
      ...spin,
      reward: rewardMap.get(spin.rewardId),
    }));
  },
});

export const spin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const todaySpin = await ctx.db
      .query("userSpins")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("spunAt", todayStart)
      )
      .first();

    if (todaySpin) {
      throw new Error("Already spun today! Come back tomorrow.");
    }

    const rewards = await ctx.db
      .query("spinWheelRewards")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (rewards.length === 0) {
      throw new Error("No rewards available");
    }

    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedReward = rewards[0];

    for (const reward of rewards) {
      random -= reward.weight;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }

    const spinId = await ctx.db.insert("userSpins", {
      userId: args.userId,
      rewardId: selectedReward._id,
      rewardType: selectedReward.rewardType,
      rewardValue: selectedReward.rewardValue,
      spunAt: Date.now(),
    });

    if (selectedReward.rewardType === "xp") {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
        .first();

      if (profile) {
        const newXp = profile.xp + selectedReward.rewardValue;
        const newLevel = Math.floor(newXp / 1000) + 1;
        await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });

        await ctx.db.insert("xpActivityLog", {
          userId: args.userId,
          amount: selectedReward.rewardValue,
          source: "spin_wheel",
          description: `Daily Spin: ${selectedReward.name}`,
          timestamp: Date.now(),
        });
      }
    }

    return {
      spinId,
      reward: selectedReward,
    };
  },
});

export const seedRewards = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("spinWheelRewards").first();
    if (existing) return { message: "Rewards already seeded" };

    const rewards = [
      { slug: "xp-small", name: "Small XP Boost", description: "A modest experience boost", rewardType: "xp" as const, rewardValue: 25, weight: 30, rarity: "common" as const },
      { slug: "xp-medium", name: "Medium XP Boost", description: "A decent experience boost", rewardType: "xp" as const, rewardValue: 50, weight: 20, rarity: "uncommon" as const },
      { slug: "xp-large", name: "Large XP Boost", description: "A significant experience boost", rewardType: "xp" as const, rewardValue: 100, weight: 10, rarity: "rare" as const },
      { slug: "xp-jackpot", name: "XP JACKPOT", description: "Massive experience boost!", rewardType: "xp" as const, rewardValue: 500, weight: 2, rarity: "legendary" as const },
      { slug: "multiplier-2x", name: "2x XP Multiplier", description: "Double XP for your next action", rewardType: "multiplier" as const, rewardValue: 2, weight: 8, rarity: "rare" as const },
      { slug: "tool-reveal", name: "Mystery Tool", description: "Reveals a random tool you haven't seen", rewardType: "tool_reveal" as const, rewardValue: 1, weight: 15, rarity: "uncommon" as const },
      { slug: "nothing", name: "Better Luck Tomorrow", description: "The wheel has spoken...", rewardType: "nothing" as const, rewardValue: 0, weight: 15, rarity: "common" as const },
    ];

    for (const reward of rewards) {
      await ctx.db.insert("spinWheelRewards", { ...reward, isActive: true });
    }

    return { message: "Rewards seeded successfully" };
  },
});
