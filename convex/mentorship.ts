import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAvailableMentors = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("userProfiles")
      .filter((q) => q.gte(q.field("level"), 10))
      .take(args.limit || 20);

    const activeMentorships = await ctx.db
      .query("mentorships")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const busyMentorIds = new Set(activeMentorships.map((m) => m.odorId));

    return profiles.filter((p) => !busyMentorIds.has(p.clerkId)).map((p) => ({
      oderId: p.clerkId,
      username: p.username,
      level: p.level,
      xp: p.xp,
      title: p.title,
    }));
  },
});

export const requestMentorship = mutation({
  args: {
    apprenticeId: v.string(),
    odorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.apprenticeId === args.odorId) {
      throw new Error("Cannot mentor yourself");
    }

    const existing = await ctx.db
      .query("mentorships")
      .withIndex("by_apprentice", (q) => q.eq("apprenticeId", args.apprenticeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      throw new Error("Already have an active mentorship");
    }

    return ctx.db.insert("mentorships", {
      odorId: args.odorId,
      apprenticeId: args.apprenticeId,
      status: "pending",
      startedAt: Date.now(),
      mentorXpEarned: 0,
      apprenticeXpEarned: 0,
    });
  },
});

export const acceptMentorship = mutation({
  args: {
    odorId: v.string(),
    mentorshipId: v.id("mentorships"),
  },
  handler: async (ctx, args) => {
    const mentorship = await ctx.db.get(args.mentorshipId);
    if (!mentorship) throw new Error("Mentorship not found");
    if (mentorship.odorId !== args.odorId) throw new Error("Not your mentorship request");
    if (mentorship.status !== "pending") throw new Error("Mentorship not pending");

    await ctx.db.patch(args.mentorshipId, {
      status: "active",
      startedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getMentorships = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const asMentor = await ctx.db
      .query("mentorships")
      .withIndex("by_mentor", (q) => q.eq("odorId", args.userId))
      .collect();

    const asApprentice = await ctx.db
      .query("mentorships")
      .withIndex("by_apprentice", (q) => q.eq("apprenticeId", args.userId))
      .collect();

    return {
      asMentor,
      asApprentice,
    };
  },
});

export const createChallenge = mutation({
  args: {
    odorId: v.string(),
    mentorshipId: v.id("mentorships"),
    title: v.string(),
    description: v.string(),
    requirement: v.object({
      type: v.string(),
      target: v.number(),
    }),
    reward: v.object({
      mentorXp: v.number(),
      apprenticeXp: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const mentorship = await ctx.db.get(args.mentorshipId);
    if (!mentorship) throw new Error("Mentorship not found");
    if (mentorship.odorId !== args.odorId) throw new Error("Only mentor can create challenges");
    if (mentorship.status !== "active") throw new Error("Mentorship not active");

    return ctx.db.insert("mentorChallenges", {
      mentorshipId: args.mentorshipId,
      createdBy: args.odorId,
      title: args.title,
      description: args.description,
      requirement: args.requirement,
      reward: args.reward,
      status: "active",
      progress: 0,
      createdAt: Date.now(),
    });
  },
});

export const getMentorshipChallenges = query({
  args: { mentorshipId: v.id("mentorships") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("mentorChallenges")
      .withIndex("by_mentorship", (q) => q.eq("mentorshipId", args.mentorshipId))
      .collect();
  },
});

export const updateChallengeProgress = mutation({
  args: {
    challengeId: v.id("mentorChallenges"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.status !== "active") throw new Error("Challenge not active");

    const newProgress = Math.min(args.progress, challenge.requirement.target);
    const isComplete = newProgress >= challenge.requirement.target;

    await ctx.db.patch(args.challengeId, {
      progress: newProgress,
      status: isComplete ? "completed" : "active",
      completedAt: isComplete ? Date.now() : undefined,
    });

    if (isComplete) {
      const mentorship = await ctx.db.get(challenge.mentorshipId);
      if (mentorship) {
        await ctx.db.patch(challenge.mentorshipId, {
          mentorXpEarned: mentorship.mentorXpEarned + challenge.reward.mentorXp,
          apprenticeXpEarned: mentorship.apprenticeXpEarned + challenge.reward.apprenticeXp,
        });
      }
    }

    return { success: true, isComplete };
  },
});

export const completeMentorship = mutation({
  args: {
    mentorshipId: v.id("mentorships"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const mentorship = await ctx.db.get(args.mentorshipId);
    if (!mentorship) throw new Error("Mentorship not found");
    if (mentorship.odorId !== args.userId && mentorship.apprenticeId !== args.userId) {
      throw new Error("Not part of this mentorship");
    }

    await ctx.db.patch(args.mentorshipId, {
      status: "completed",
      completedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getMentorLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const mentorships = await ctx.db
      .query("mentorships")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    const mentorStats: Record<string, { odorId: string; completedMentorships: number; totalXpGiven: number }> = {};

    for (const m of mentorships) {
      if (!mentorStats[m.odorId]) {
        mentorStats[m.odorId] = { odorId: m.odorId, completedMentorships: 0, totalXpGiven: 0 };
      }
      mentorStats[m.odorId].completedMentorships++;
      mentorStats[m.odorId].totalXpGiven += m.apprenticeXpEarned;
    }

    return Object.values(mentorStats)
      .sort((a, b) => b.completedMentorships - a.completedMentorships)
      .slice(0, args.limit || 10)
      .map((m, i) => ({ ...m, rank: i + 1 }));
  },
});
