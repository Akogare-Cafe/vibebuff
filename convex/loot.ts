import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get active loot drops
export const getActiveLootDrops = query({
  handler: async (ctx) => {
    const now = Date.now();
    const allDrops = await ctx.db.query("lootDrops").collect();
    
    const activeDrops = allDrops.filter(
      (drop) => drop.activeFrom <= now && drop.activeUntil >= now
    );

    const dropsWithTools = await Promise.all(
      activeDrops.map(async (drop) => {
        const tool = await ctx.db.get(drop.toolId);
        return { ...drop, tool };
      })
    );

    return dropsWithTools.filter((d) => d.tool !== null);
  },
});

// Check if user has claimed a loot drop
export const hasUserClaimedLoot = query({
  args: {
    userId: v.string(),
    lootDropId: v.id("lootDrops"),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db
      .query("userLootClaims")
      .withIndex("by_user_loot", (q) => 
        q.eq("userId", args.userId).eq("lootDropId", args.lootDropId)
      )
      .first();

    return claim !== null;
  },
});

// Claim a loot drop
export const claimLoot = mutation({
  args: {
    userId: v.string(),
    lootDropId: v.id("lootDrops"),
  },
  handler: async (ctx, args) => {
    // Check if already claimed
    const existing = await ctx.db
      .query("userLootClaims")
      .withIndex("by_user_loot", (q) => 
        q.eq("userId", args.userId).eq("lootDropId", args.lootDropId)
      )
      .first();

    if (existing) {
      return { success: false, message: "Already claimed" };
    }

    // Check if loot drop is still active
    const lootDrop = await ctx.db.get(args.lootDropId);
    if (!lootDrop) {
      return { success: false, message: "Loot drop not found" };
    }

    const now = Date.now();
    if (now < lootDrop.activeFrom || now > lootDrop.activeUntil) {
      return { success: false, message: "Loot drop expired" };
    }

    // Claim the loot
    await ctx.db.insert("userLootClaims", {
      userId: args.userId,
      lootDropId: args.lootDropId,
      claimedAt: now,
    });

    // Award XP
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      const newXp = profile.xp + lootDrop.bonusXp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });
    }

    return { success: true, xpAwarded: lootDrop.bonusXp };
  },
});

// Generate daily loot drop (called by cron or manually)
export const generateDailyLoot = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check if today's loot already exists
    const existingDaily = await ctx.db
      .query("lootDrops")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "daily"),
          q.gte(q.field("activeFrom"), startOfDay.getTime()),
          q.lte(q.field("activeFrom"), endOfDay.getTime())
        )
      )
      .first();

    if (existingDaily) {
      return { message: "Daily loot already exists", lootDrop: existingDaily };
    }

    // Get a random featured tool
    const featuredTools = await ctx.db
      .query("tools")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    if (featuredTools.length === 0) {
      return { message: "No featured tools available" };
    }

    const randomTool = featuredTools[Math.floor(Math.random() * featuredTools.length)];

    const lootDrop = await ctx.db.insert("lootDrops", {
      type: "daily",
      toolId: randomTool._id,
      title: `Daily Discovery: ${randomTool.name}`,
      description: `Today's featured tool! Claim to earn bonus XP.`,
      activeFrom: startOfDay.getTime(),
      activeUntil: endOfDay.getTime(),
      bonusXp: 50,
    });

    return { message: "Daily loot created", lootDropId: lootDrop };
  },
});

// Generate weekly loot drop
export const generateWeeklyLoot = mutation({
  handler: async (ctx) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Check if this week's loot already exists
    const existingWeekly = await ctx.db
      .query("lootDrops")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "weekly"),
          q.gte(q.field("activeFrom"), startOfWeek.getTime()),
          q.lte(q.field("activeFrom"), endOfWeek.getTime())
        )
      )
      .first();

    if (existingWeekly) {
      return { message: "Weekly loot already exists", lootDrop: existingWeekly };
    }

    // Get a random tool (prefer ones with high GitHub stars)
    const allTools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const toolsWithStars = allTools.filter((t) => t.githubStars && t.githubStars > 10000);
    const pool = toolsWithStars.length > 0 ? toolsWithStars : allTools;
    const randomTool = pool[Math.floor(Math.random() * pool.length)];

    const lootDrop = await ctx.db.insert("lootDrops", {
      type: "weekly",
      toolId: randomTool._id,
      title: `Weekly Legendary: ${randomTool.name}`,
      description: `This week's legendary find! Extra XP for claiming.`,
      activeFrom: startOfWeek.getTime(),
      activeUntil: endOfWeek.getTime(),
      bonusXp: 200,
    });

    return { message: "Weekly loot created", lootDropId: lootDrop };
  },
});

// Get user's claimed loot history
export const getUserLootHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("userLootClaims")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const claimsWithDetails = await Promise.all(
      claims.map(async (claim) => {
        const lootDrop = await ctx.db.get(claim.lootDropId);
        if (!lootDrop) return null;
        const tool = await ctx.db.get(lootDrop.toolId);
        return { ...claim, lootDrop, tool };
      })
    );

    return claimsWithDetails.filter(Boolean);
  },
});
