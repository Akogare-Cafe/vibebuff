import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveRaid = query({
  args: {},
  handler: async (ctx) => {
    const raid = await ctx.db
      .query("globalRaids")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!raid) return null;

    const participants = await ctx.db
      .query("raidParticipants")
      .withIndex("by_raid", (q) => q.eq("raidId", raid._id))
      .collect();

    const topDamagers = participants
      .sort((a, b) => b.damageDealt - a.damageDealt)
      .slice(0, 10);

    const userIds = topDamagers.map((p) => p.userId);
    const profiles = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );
    const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.clerkId, p]));

    return {
      ...raid,
      hpPercentage: Math.max(0, (raid.currentHp / raid.bossHp) * 100),
      topDamagers: topDamagers.map((p) => ({
        ...p,
        user: profileMap.get(p.userId),
      })),
    };
  },
});

export const getUpcomingRaids = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("globalRaids")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .collect();
  },
});

export const getRaidHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const raids = await ctx.db
      .query("globalRaids")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "victory"),
          q.eq(q.field("status"), "defeat")
        )
      )
      .order("desc")
      .take(args.limit ?? 10);

    return raids;
  },
});

export const getUserRaidStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const participations = await ctx.db
      .query("raidParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const raidIds = participations.map((p) => p.raidId);
    const raids = await Promise.all(raidIds.map((id) => ctx.db.get(id)));

    const victories = raids.filter((r) => r?.status === "victory").length;
    const totalDamage = participations.reduce((sum, p) => sum + p.damageDealt, 0);
    const totalAttacks = participations.reduce((sum, p) => sum + p.attackCount, 0);

    return {
      raidsParticipated: participations.length,
      victories,
      totalDamage,
      totalAttacks,
      averageDamagePerRaid: participations.length > 0 ? Math.floor(totalDamage / participations.length) : 0,
    };
  },
});

export const attackBoss = mutation({
  args: { userId: v.string(), toolIds: v.array(v.id("tools")) },
  handler: async (ctx, args) => {
    const raid = await ctx.db
      .query("globalRaids")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!raid) throw new Error("No active raid");
    if (raid.currentHp <= 0) throw new Error("Boss already defeated");

    const tools = await Promise.all(args.toolIds.map((id) => ctx.db.get(id)));
    const validTools = tools.filter(Boolean);

    if (validTools.length === 0) throw new Error("No valid tools selected");

    let baseDamage = 0;
    for (const tool of validTools) {
      const stats = tool!.stats;
      if (stats) {
        baseDamage += stats.attack + Math.floor(stats.speed / 2);
      } else {
        baseDamage += 10;
      }
    }

    const synergyBonus = validTools.length > 1 ? 1 + (validTools.length - 1) * 0.1 : 1;
    const randomMultiplier = 0.8 + Math.random() * 0.4;
    const finalDamage = Math.floor(baseDamage * synergyBonus * randomMultiplier);

    const isCritical = Math.random() < 0.1;
    const actualDamage = isCritical ? finalDamage * 2 : finalDamage;

    const newHp = Math.max(0, raid.currentHp - actualDamage);

    let participant = await ctx.db
      .query("raidParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("raidId"), raid._id))
      .first();

    const now = Date.now();

    if (participant) {
      await ctx.db.patch(participant._id, {
        damageDealt: participant.damageDealt + actualDamage,
        attackCount: participant.attackCount + 1,
        bestAttack: Math.max(participant.bestAttack, actualDamage),
        toolsUsed: [...new Set([...participant.toolsUsed, ...args.toolIds])],
        lastAttackAt: now,
      });
    } else {
      await ctx.db.insert("raidParticipants", {
        raidId: raid._id,
        userId: args.userId,
        damageDealt: actualDamage,
        attackCount: 1,
        bestAttack: actualDamage,
        toolsUsed: args.toolIds,
        joinedAt: now,
        lastAttackAt: now,
      });

      await ctx.db.patch(raid._id, {
        participantCount: raid.participantCount + 1,
      });
    }

    await ctx.db.patch(raid._id, {
      currentHp: newHp,
      totalDamageDealt: raid.totalDamageDealt + actualDamage,
    });

    const xpEarned = Math.floor(actualDamage / 10) + (isCritical ? 25 : 0);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { xp: profile.xp + xpEarned });
      await ctx.db.insert("xpActivityLog", {
        userId: args.userId,
        amount: xpEarned,
        source: "raid_attack",
        description: `Dealt ${actualDamage} damage to ${raid.bossName}${isCritical ? " (CRITICAL!)" : ""}`,
        timestamp: now,
      });
    }

    if (newHp <= 0) {
      await ctx.db.patch(raid._id, { status: "victory" });

      const allParticipants = await ctx.db
        .query("raidParticipants")
        .withIndex("by_raid", (q) => q.eq("raidId", raid._id))
        .collect();

      for (const p of allParticipants) {
        const pProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", p.userId))
          .first();

        if (pProfile) {
          await ctx.db.patch(pProfile._id, {
            xp: pProfile.xp + raid.rewards.victoryXp,
          });
        }
      }
    }

    return {
      damage: actualDamage,
      isCritical,
      xpEarned,
      bossHpRemaining: newHp,
      bossDefeated: newHp <= 0,
    };
  },
});

export const seedRaid = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("globalRaids")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (existing) return { message: "Active raid already exists" };

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    await ctx.db.insert("globalRaids", {
      slug: "legacy-framework-boss",
      title: "The Legacy Framework Awakens",
      description: "A massive legacy framework has emerged from the depths of deprecated code. Unite with other developers to defeat it!",
      bossName: "jQuery Titan",
      bossHp: 100000,
      currentHp: 100000,
      bossStats: {
        attack: 50,
        defense: 30,
        speed: 20,
      },
      targetToolCategory: "frontend",
      participantCount: 0,
      totalDamageDealt: 0,
      rewards: {
        participationXp: 100,
        victoryXp: 500,
        topDamagerTitle: "Legacy Slayer",
      },
      status: "active",
      startsAt: now,
      endsAt: now + dayMs * 3,
      createdAt: now,
    });

    return { message: "Raid created successfully" };
  },
});
