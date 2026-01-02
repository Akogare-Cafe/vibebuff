import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveBounties = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const bounties = await ctx.db
      .query("bountyHunts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const activeBounties = bounties.filter((b) => b.expiresAt > now);

    const toolIds = [...new Set(activeBounties.map((b) => b.targetToolId))];
    const tools = await Promise.all(toolIds.map((id) => ctx.db.get(id)));
    const toolMap = new Map(tools.filter(Boolean).map((t) => [t!._id, t]));

    return activeBounties.map((bounty) => ({
      ...bounty,
      targetTool: toolMap.get(bounty.targetToolId),
    }));
  },
});

export const getUserBounties = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const hunters = await ctx.db
      .query("bountyHunters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const bountyIds = [...new Set(hunters.map((h) => h.bountyId))];
    const bounties = await Promise.all(bountyIds.map((id) => ctx.db.get(id)));
    const bountyMap = new Map(bounties.filter(Boolean).map((b) => [b!._id, b]));

    const toolIds = bounties.filter(Boolean).map((b) => b!.targetToolId);
    const tools = await Promise.all(toolIds.map((id) => ctx.db.get(id)));
    const toolMap = new Map(tools.filter(Boolean).map((t) => [t!._id, t]));

    return hunters.map((hunter) => {
      const bounty = bountyMap.get(hunter.bountyId);
      return {
        ...hunter,
        bounty,
        targetTool: bounty ? toolMap.get(bounty.targetToolId) : null,
      };
    });
  },
});

export const joinBounty = mutation({
  args: { userId: v.string(), bountyId: v.id("bountyHunts") },
  handler: async (ctx, args) => {
    const bounty = await ctx.db.get(args.bountyId);
    if (!bounty) throw new Error("Bounty not found");
    if (!bounty.isActive) throw new Error("Bounty is no longer active");
    if (bounty.expiresAt < Date.now()) throw new Error("Bounty has expired");
    if (bounty.currentHunters >= bounty.maxHunters) throw new Error("Bounty is full");

    const existing = await ctx.db
      .query("bountyHunters")
      .withIndex("by_user_bounty", (q) =>
        q.eq("userId", args.userId).eq("bountyId", args.bountyId)
      )
      .first();

    if (existing) throw new Error("Already hunting this bounty");

    await ctx.db.patch(args.bountyId, {
      currentHunters: bounty.currentHunters + 1,
    });

    return await ctx.db.insert("bountyHunters", {
      bountyId: args.bountyId,
      userId: args.userId,
      progress: 0,
      status: "hunting",
      startedAt: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    userId: v.string(),
    bountyId: v.id("bountyHunts"),
    progressIncrement: v.number(),
  },
  handler: async (ctx, args) => {
    const hunter = await ctx.db
      .query("bountyHunters")
      .withIndex("by_user_bounty", (q) =>
        q.eq("userId", args.userId).eq("bountyId", args.bountyId)
      )
      .first();

    if (!hunter) throw new Error("Not hunting this bounty");
    if (hunter.status !== "hunting") throw new Error("Bounty already completed or expired");

    const bounty = await ctx.db.get(args.bountyId);
    if (!bounty) throw new Error("Bounty not found");

    const newProgress = hunter.progress + args.progressIncrement;
    const isComplete = newProgress >= bounty.requirement.count;

    await ctx.db.patch(hunter._id, {
      progress: newProgress,
      status: isComplete ? "completed" : "hunting",
      completedAt: isComplete ? Date.now() : undefined,
    });

    return { progress: newProgress, isComplete };
  },
});

export const claimReward = mutation({
  args: { userId: v.string(), bountyId: v.id("bountyHunts") },
  handler: async (ctx, args) => {
    const hunter = await ctx.db
      .query("bountyHunters")
      .withIndex("by_user_bounty", (q) =>
        q.eq("userId", args.userId).eq("bountyId", args.bountyId)
      )
      .first();

    if (!hunter) throw new Error("Not hunting this bounty");
    if (hunter.status !== "completed") throw new Error("Bounty not completed");

    const bounty = await ctx.db.get(args.bountyId);
    if (!bounty) throw new Error("Bounty not found");

    await ctx.db.patch(hunter._id, { status: "claimed" });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      const newXp = profile.xp + bounty.rewards.xp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });

      await ctx.db.insert("xpActivityLog", {
        userId: args.userId,
        amount: bounty.rewards.xp,
        source: "bounty_hunt",
        description: `Completed bounty: ${bounty.title}`,
        timestamp: Date.now(),
      });
    }

    return { rewards: bounty.rewards };
  },
});

export const seedBounties = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("bountyHunts").first();
    if (existing) return { message: "Bounties already seeded" };

    const tools = await ctx.db.query("tools").take(5);
    if (tools.length === 0) return { message: "No tools to create bounties for" };

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const bounties = [
      {
        slug: "battle-master",
        title: "Battle Master",
        description: "Win 3 battles using this tool",
        targetToolId: tools[0]._id,
        huntType: "find_and_battle" as const,
        requirement: { action: "battle_win", count: 3 },
        rewards: { xp: 150 },
        maxHunters: 50,
        currentHunters: 0,
        expiresAt: now + dayMs * 3,
        difficulty: "medium" as const,
        isActive: true,
        createdAt: now,
      },
      {
        slug: "deck-builder",
        title: "Deck Architect",
        description: "Add this tool to 2 different decks",
        targetToolId: tools[1]?._id ?? tools[0]._id,
        huntType: "add_to_deck" as const,
        requirement: { action: "deck_add", count: 2 },
        rewards: { xp: 100 },
        maxHunters: 100,
        currentHunters: 0,
        expiresAt: now + dayMs * 2,
        difficulty: "easy" as const,
        isActive: true,
        createdAt: now,
      },
      {
        slug: "review-hunter",
        title: "Review Hunter",
        description: "Write a detailed review for this tool",
        targetToolId: tools[2]?._id ?? tools[0]._id,
        huntType: "review" as const,
        requirement: { action: "review_write", count: 1 },
        rewards: { xp: 200, bonusTitle: "Tool Critic" },
        maxHunters: 25,
        currentHunters: 0,
        expiresAt: now + dayMs * 7,
        difficulty: "hard" as const,
        isActive: true,
        createdAt: now,
      },
    ];

    for (const bounty of bounties) {
      await ctx.db.insert("bountyHunts", bounty);
    }

    return { message: "Bounties seeded successfully" };
  },
});
