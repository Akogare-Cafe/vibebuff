import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNominations = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let nominations;

    if (args.status) {
      nominations = await ctx.db
        .query("toolNominations")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "under_review" | "approved" | "rejected" | "added"))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      nominations = await ctx.db
        .query("toolNominations")
        .order("desc")
        .take(args.limit ?? 50);
    }

    const userIds = [...new Set(nominations.map((n) => n.nominatedBy))];
    const profiles = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );
    const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.clerkId, p]));

    return nominations.map((nom) => ({
      ...nom,
      nominatedByUser: profileMap.get(nom.nominatedBy),
    }));
  },
});

export const getTopNominations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const nominations = await ctx.db
      .query("toolNominations")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const sorted = nominations.sort((a, b) => b.upvotes - a.upvotes).slice(0, args.limit ?? 10);

    const userIds = [...new Set(sorted.map((n) => n.nominatedBy))];
    const profiles = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );
    const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.clerkId, p]));

    return sorted.map((nom) => ({
      ...nom,
      nominatedByUser: profileMap.get(nom.nominatedBy),
    }));
  },
});

export const getUserNominations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("toolNominations")
      .withIndex("by_user", (q) => q.eq("nominatedBy", args.userId))
      .order("desc")
      .collect();
  },
});

export const submitNomination = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
    githubUrl: v.optional(v.string()),
    categorySlug: v.string(),
    description: v.string(),
    whyAdd: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("toolNominations")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) throw new Error("This tool has already been nominated");

    const nominationId = await ctx.db.insert("toolNominations", {
      name: args.name,
      websiteUrl: args.websiteUrl,
      githubUrl: args.githubUrl,
      categorySlug: args.categorySlug,
      description: args.description,
      whyAdd: args.whyAdd,
      nominatedBy: args.userId,
      upvotes: 0,
      status: "pending",
      createdAt: Date.now(),
    });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { xp: profile.xp + 50 });
      await ctx.db.insert("xpActivityLog", {
        userId: args.userId,
        amount: 50,
        source: "nomination_submit",
        description: `Nominated ${args.name} for addition`,
        timestamp: Date.now(),
      });
    }

    return { nominationId };
  },
});

export const voteForNomination = mutation({
  args: { userId: v.string(), nominationId: v.id("toolNominations") },
  handler: async (ctx, args) => {
    const nomination = await ctx.db.get(args.nominationId);
    if (!nomination) throw new Error("Nomination not found");
    if (nomination.status !== "pending") throw new Error("Nomination is no longer accepting votes");

    const existingVote = await ctx.db
      .query("nominationVotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("nominationId"), args.nominationId))
      .first();

    if (existingVote) throw new Error("Already voted for this nomination");

    await ctx.db.insert("nominationVotes", {
      nominationId: args.nominationId,
      userId: args.userId,
      votedAt: Date.now(),
    });

    await ctx.db.patch(args.nominationId, {
      upvotes: nomination.upvotes + 1,
    });

    if (nomination.upvotes + 1 >= 50) {
      await ctx.db.patch(args.nominationId, {
        status: "under_review",
      });
    }

    return { newUpvotes: nomination.upvotes + 1 };
  },
});

export const hasVoted = query({
  args: { userId: v.string(), nominationId: v.id("toolNominations") },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("nominationVotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("nominationId"), args.nominationId))
      .first();

    return !!vote;
  },
});

export const updateNominationStatus = mutation({
  args: {
    nominationId: v.id("toolNominations"),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("added")
    ),
    reviewNotes: v.optional(v.string()),
    addedToolId: v.optional(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const nomination = await ctx.db.get(args.nominationId);
    if (!nomination) throw new Error("Nomination not found");

    await ctx.db.patch(args.nominationId, {
      status: args.status,
      reviewNotes: args.reviewNotes,
      addedToolId: args.addedToolId,
      reviewedAt: Date.now(),
    });

    if (args.status === "added" || args.status === "approved") {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", nomination.nominatedBy))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, { xp: profile.xp + 200 });
        await ctx.db.insert("xpActivityLog", {
          userId: nomination.nominatedBy,
          amount: 200,
          source: "nomination_approved",
          description: `Your nomination for ${nomination.name} was approved!`,
          timestamp: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
