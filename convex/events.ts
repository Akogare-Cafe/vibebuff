import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getActiveEvents = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return ctx.db
      .query("seasonalEvents")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => 
        q.and(
          q.lte(q.field("startDate"), now),
          q.gte(q.field("endDate"), now)
        )
      )
      .collect();
  },
});

export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("seasonalEvents")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!event) return null;

    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    const leaderboard = participants
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    return {
      ...event,
      participantCount: participants.length,
      leaderboard,
    };
  },
});

export const joinEvent = mutation({
  args: {
    userId: v.string(),
    eventId: v.id("seasonalEvents"),
    faction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (!event.isActive) throw new Error("Event not active");

    const existing = await ctx.db
      .query("eventParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    if (existing) throw new Error("Already joined");

    return ctx.db.insert("eventParticipants", {
      eventId: args.eventId,
      userId: args.userId,
      faction: args.faction,
      score: 0,
      submissions: [],
      joinedAt: Date.now(),
    });
  },
});

export const submitToEvent = mutation({
  args: {
    userId: v.string(),
    eventId: v.id("seasonalEvents"),
    submissionType: v.string(),
    referenceId: v.string(),
    scoreEarned: v.number(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("eventParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    if (!participant) throw new Error("Not a participant");

    await ctx.db.patch(participant._id, {
      score: participant.score + args.scoreEarned,
      submissions: [
        ...participant.submissions,
        {
          type: args.submissionType,
          referenceId: args.referenceId,
          submittedAt: Date.now(),
        },
      ],
    });

    return { success: true };
  },
});

export const getUserEventParticipation = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const participations = await ctx.db
      .query("eventParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return Promise.all(
      participations.map(async (p) => {
        const event = await ctx.db.get(p.eventId);
        return { ...p, event };
      })
    );
  },
});

export const getEventLeaderboard = query({
  args: { eventId: v.id("seasonalEvents"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return participants
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit || 50)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  },
});

export const getFactionScores = query({
  args: { eventId: v.id("seasonalEvents") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const factionScores: Record<string, { score: number; members: number }> = {};

    for (const p of participants) {
      if (p.faction) {
        if (!factionScores[p.faction]) {
          factionScores[p.faction] = { score: 0, members: 0 };
        }
        factionScores[p.faction].score += p.score;
        factionScores[p.faction].members++;
      }
    }

    return Object.entries(factionScores)
      .map(([faction, data]) => ({ faction, ...data }))
      .sort((a, b) => b.score - a.score);
  },
});

export const seedEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    const events = [
      {
        slug: "framework-wars-2024",
        name: "Framework Wars 2024",
        description: "Choose your faction and battle for framework supremacy!",
        eventType: "framework_war" as const,
        rules: {
          factions: ["React", "Vue", "Svelte", "Angular", "Solid"],
        },
        rewards: [
          { rank: 1, rewardType: "title", rewardValue: "Framework Champion" },
          { rank: 2, rewardType: "badge", rewardValue: "Silver Warrior" },
          { rank: 3, rewardType: "badge", rewardValue: "Bronze Fighter" },
        ],
        startDate: now,
        endDate: now + weekMs * 2,
        isActive: true,
      },
      {
        slug: "retro-week",
        name: "Retro Week",
        description: "Build with tools from 2015 or earlier only!",
        eventType: "retro_week" as const,
        rules: {
          maxYear: 2015,
          customRules: ["Only tools released before 2016", "jQuery is mandatory"],
        },
        rewards: [
          { rank: 1, rewardType: "title", rewardValue: "Retro Master" },
          { rank: 2, rewardType: "xp", rewardValue: "1000" },
          { rank: 3, rewardType: "xp", rewardValue: "500" },
        ],
        startDate: now + weekMs,
        endDate: now + weekMs * 2,
        isActive: false,
      },
      {
        slug: "ai-hackathon",
        name: "AI Hackathon",
        description: "48-hour challenge to build the best AI-powered stack",
        eventType: "hackathon" as const,
        rules: {
          customRules: ["Must include at least one AI tool", "Bonus points for novel combinations"],
        },
        rewards: [
          { rank: 1, rewardType: "title", rewardValue: "AI Pioneer" },
          { rank: 1, rewardType: "pack", rewardValue: "legendary-pack" },
          { rank: 2, rewardType: "pack", rewardValue: "premium-pack" },
        ],
        startDate: now + weekMs * 3,
        endDate: now + weekMs * 3 + 48 * 60 * 60 * 1000,
        isActive: false,
      },
    ];

    for (const event of events) {
      const existing = await ctx.db
        .query("seasonalEvents")
        .withIndex("by_slug", (q) => q.eq("slug", event.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("seasonalEvents", event);
      }
    }

    return { seeded: events.length };
  },
});
