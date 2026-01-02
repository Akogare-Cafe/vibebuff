import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getRecentActivity = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("xpActivityLog")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 20);

    return activities;
  },
});

export const getTodayActivity = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const activities = await ctx.db
      .query("xpActivityLog")
      .withIndex("by_user_timestamp", (q) => 
        q.eq("userId", args.userId).gte("timestamp", todayStart)
      )
      .collect();

    const totalXp = activities.reduce((sum, a) => sum + a.amount, 0);

    return {
      activities,
      totalXp,
      count: activities.length,
    };
  },
});

export const logXpGain = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    source: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("xpActivityLog", {
      userId: args.userId,
      amount: args.amount,
      source: args.source,
      description: args.description,
      timestamp: Date.now(),
    });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      const newXp = profile.xp + args.amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      let newTitle = profile.title;
      if (newLevel >= 50) newTitle = "Legendary Architect";
      else if (newLevel >= 30) newTitle = "Master Developer";
      else if (newLevel >= 20) newTitle = "Senior Engineer";
      else if (newLevel >= 10) newTitle = "Stack Specialist";
      else if (newLevel >= 5) newTitle = "Tool Explorer";
      else if (newLevel >= 2) newTitle = "Apprentice Coder";

      await ctx.db.patch(profile._id, {
        xp: newXp,
        level: newLevel,
        title: newTitle,
      });

      return { 
        newXp, 
        newLevel, 
        leveledUp: newLevel > profile.level,
        newTitle: newLevel > profile.level ? newTitle : undefined,
      };
    }

    return { newXp: args.amount, newLevel: 1, leveledUp: false };
  },
});

export const getXpStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allActivities = await ctx.db
      .query("xpActivityLog")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    const todayActivities = allActivities.filter(a => a.timestamp >= todayStart);
    const weekActivities = allActivities.filter(a => a.timestamp >= weekStart);

    const bySource: Record<string, number> = {};
    for (const activity of allActivities) {
      bySource[activity.source] = (bySource[activity.source] || 0) + activity.amount;
    }

    return {
      totalXp: allActivities.reduce((sum, a) => sum + a.amount, 0),
      todayXp: todayActivities.reduce((sum, a) => sum + a.amount, 0),
      weekXp: weekActivities.reduce((sum, a) => sum + a.amount, 0),
      activityCount: allActivities.length,
      bySource,
    };
  },
});
