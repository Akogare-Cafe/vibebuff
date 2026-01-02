import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserStreak = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastClaimDate: null,
        canClaimToday: true,
        totalXpFromStreaks: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const lastClaim = streak.lastClaimDate ? new Date(streak.lastClaimDate) : null;
    let canClaimToday = true;

    if (lastClaim) {
      lastClaim.setHours(0, 0, 0, 0);
      canClaimToday = lastClaim.getTime() < todayStart;
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastClaimDate: streak.lastClaimDate,
      canClaimToday,
      totalXpFromStreaks: streak.totalXpFromStreaks || 0,
    };
  },
});

export const claimDailyReward = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const yesterday = new Date(todayStart - 24 * 60 * 60 * 1000);

    let streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!streak) {
      const xpReward = 25;
      await ctx.db.insert("userStreaks", {
        userId: args.userId,
        currentStreak: 1,
        longestStreak: 1,
        lastClaimDate: Date.now(),
        totalXpFromStreaks: xpReward,
      });

      await awardXp(ctx, args.userId, xpReward);

      return { success: true, xpAwarded: xpReward, newStreak: 1 };
    }

    const lastClaim = streak.lastClaimDate ? new Date(streak.lastClaimDate) : null;
    
    if (lastClaim) {
      lastClaim.setHours(0, 0, 0, 0);
      if (lastClaim.getTime() >= todayStart) {
        return { success: false, reason: "Already claimed today" };
      }
    }

    let newStreak = 1;
    if (lastClaim) {
      const lastClaimDay = lastClaim.getTime();
      if (lastClaimDay === yesterday.getTime()) {
        newStreak = streak.currentStreak + 1;
      }
    }

    const streakDay = ((newStreak - 1) % 7) + 1;
    const xpRewards = [25, 50, 75, 100, 150, 200, 500];
    const xpReward = xpRewards[streakDay - 1] || 25;

    const newLongest = Math.max(streak.longestStreak, newStreak);
    const newTotalXp = (streak.totalXpFromStreaks || 0) + xpReward;

    await ctx.db.patch(streak._id, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastClaimDate: Date.now(),
      totalXpFromStreaks: newTotalXp,
    });

    await awardXp(ctx, args.userId, xpReward);

    return { 
      success: true, 
      xpAwarded: xpReward, 
      newStreak,
      streakDay,
    };
  },
});

async function awardXp(ctx: any, userId: string, amount: number) {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", userId))
    .first();

  if (profile) {
    const newXp = profile.xp + amount;
    const newLevel = Math.floor(newXp / 1000) + 1;
    await ctx.db.patch(profile._id, {
      xp: newXp,
      level: newLevel,
    });
  }
}

export const getStreakLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const streaks = await ctx.db.query("userStreaks").collect();
    
    const sorted = streaks.sort((a, b) => b.longestStreak - a.longestStreak);
    
    const leaderboard = await Promise.all(
      sorted.slice(0, args.limit || 10).map(async (streak, index) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", streak.userId))
          .first();
        
        return {
          rank: index + 1,
          userId: streak.userId,
          username: profile?.username || "Anonymous",
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        };
      })
    );

    return leaderboard;
  },
});
