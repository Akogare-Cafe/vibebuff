import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getActiveDebates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const debates = await ctx.db
      .query("debates")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .take(args.limit || 20);

    const debatesWithTools = await Promise.all(
      debates.map(async (d) => {
        const tool1 = await ctx.db.get(d.tool1Id);
        const tool2 = await ctx.db.get(d.tool2Id);
        return { ...d, tool1, tool2 };
      })
    );

    return debatesWithTools;
  },
});

export const getVotingDebates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const debates = await ctx.db
      .query("debates")
      .withIndex("by_status", (q) => q.eq("status", "voting"))
      .take(args.limit || 20);

    const debatesWithTools = await Promise.all(
      debates.map(async (d) => {
        const tool1 = await ctx.db.get(d.tool1Id);
        const tool2 = await ctx.db.get(d.tool2Id);
        const votes = await ctx.db
          .query("debateVotes")
          .withIndex("by_debate", (q) => q.eq("debateId", d._id))
          .collect();
        
        const tool1Votes = votes.filter((v) => v.votedForToolId === d.tool1Id).length;
        const tool2Votes = votes.filter((v) => v.votedForToolId === d.tool2Id).length;
        
        return { ...d, tool1, tool2, tool1Votes, tool2Votes };
      })
    );

    return debatesWithTools;
  },
});

export const getFeaturedDebates = query({
  args: {},
  handler: async (ctx) => {
    const debates = await ctx.db
      .query("debates")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .take(5);

    const debatesWithTools = await Promise.all(
      debates.map(async (d) => {
        const tool1 = await ctx.db.get(d.tool1Id);
        const tool2 = await ctx.db.get(d.tool2Id);
        return { ...d, tool1, tool2 };
      })
    );

    return debatesWithTools;
  },
});

export const getDebateDetails = query({
  args: { debateId: v.id("debates") },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) return null;

    const tool1 = await ctx.db.get(debate.tool1Id);
    const tool2 = await ctx.db.get(debate.tool2Id);

    const arguments_ = await ctx.db
      .query("debateArguments")
      .withIndex("by_debate", (q) => q.eq("debateId", args.debateId))
      .collect();

    const votes = await ctx.db
      .query("debateVotes")
      .withIndex("by_debate", (q) => q.eq("debateId", args.debateId))
      .collect();

    const tool1Votes = votes.filter((v) => v.votedForToolId === debate.tool1Id).length;
    const tool2Votes = votes.filter((v) => v.votedForToolId === debate.tool2Id).length;

    return {
      ...debate,
      tool1,
      tool2,
      arguments: arguments_,
      tool1Votes,
      tool2Votes,
    };
  },
});

export const createDebate = mutation({
  args: {
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    topic: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const debateId = await ctx.db.insert("debates", {
      tool1Id: args.tool1Id,
      tool2Id: args.tool2Id,
      topic: args.topic,
      status: "open",
      pro1UserId: args.creatorId,
      isFeatured: false,
      startedAt: Date.now(),
    });

    return debateId;
  },
});

export const joinDebate = mutation({
  args: {
    debateId: v.id("debates"),
    userId: v.string(),
    forToolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) throw new Error("Debate not found");

    if (args.forToolId === debate.tool1Id && !debate.pro1UserId) {
      await ctx.db.patch(args.debateId, { pro1UserId: args.userId });
    } else if (args.forToolId === debate.tool2Id && !debate.pro2UserId) {
      await ctx.db.patch(args.debateId, { pro2UserId: args.userId });
    } else {
      throw new Error("Position already taken");
    }
  },
});

export const submitArgument = mutation({
  args: {
    debateId: v.id("debates"),
    userId: v.string(),
    forToolId: v.id("tools"),
    argumentType: v.union(v.literal("opening"), v.literal("rebuttal"), v.literal("closing")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) throw new Error("Debate not found");
    if (debate.status !== "open") throw new Error("Debate not open for arguments");

    const isValidDebater =
      (args.forToolId === debate.tool1Id && debate.pro1UserId === args.userId) ||
      (args.forToolId === debate.tool2Id && debate.pro2UserId === args.userId);

    if (!isValidDebater) throw new Error("Not authorized to argue for this tool");

    const argumentId = await ctx.db.insert("debateArguments", {
      debateId: args.debateId,
      userId: args.userId,
      forToolId: args.forToolId,
      argumentType: args.argumentType,
      content: args.content,
      upvotes: 0,
      createdAt: Date.now(),
    });

    if (args.argumentType === "closing") {
      const allArguments = await ctx.db
        .query("debateArguments")
        .withIndex("by_debate", (q) => q.eq("debateId", args.debateId))
        .collect();

      const hasClosingForBoth =
        allArguments.some((a) => a.argumentType === "closing" && a.forToolId === debate.tool1Id) &&
        allArguments.some((a) => a.argumentType === "closing" && a.forToolId === debate.tool2Id);

      if (hasClosingForBoth) {
        await ctx.db.patch(args.debateId, {
          status: "voting",
          votingEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }
    }

    return argumentId;
  },
});

export const voteInDebate = mutation({
  args: {
    debateId: v.id("debates"),
    oderId: v.string(),
    votedForToolId: v.id("tools"),
    isJudge: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) throw new Error("Debate not found");
    if (debate.status !== "voting") throw new Error("Debate not in voting phase");

    const existing = await ctx.db
      .query("debateVotes")
      .withIndex("by_debate", (q) => q.eq("debateId", args.debateId))
      .filter((q) => q.eq(q.field("oderId"), args.oderId))
      .first();

    if (existing) throw new Error("Already voted");

    await ctx.db.insert("debateVotes", {
      debateId: args.debateId,
      oderId: args.oderId,
      votedForToolId: args.votedForToolId,
      isJudgeVote: args.isJudge || false,
      votedAt: Date.now(),
    });
  },
});

export const upvoteArgument = mutation({
  args: {
    argumentId: v.id("debateArguments"),
    oderId: v.string(),
  },
  handler: async (ctx, args) => {
    const argument = await ctx.db.get(args.argumentId);
    if (!argument) throw new Error("Argument not found");

    await ctx.db.patch(args.argumentId, {
      upvotes: argument.upvotes + 1,
    });
  },
});

export const closeDebate = mutation({
  args: { debateId: v.id("debates") },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) throw new Error("Debate not found");
    if (debate.status !== "voting") throw new Error("Debate not in voting phase");

    const votes = await ctx.db
      .query("debateVotes")
      .withIndex("by_debate", (q) => q.eq("debateId", args.debateId))
      .collect();

    const tool1Votes = votes.filter((v) => v.votedForToolId === debate.tool1Id).length;
    const tool2Votes = votes.filter((v) => v.votedForToolId === debate.tool2Id).length;

    const winnerId = tool1Votes >= tool2Votes ? debate.tool1Id : debate.tool2Id;

    await ctx.db.patch(args.debateId, {
      status: "closed",
      winnerId,
      closedAt: Date.now(),
    });

    return { winnerId, tool1Votes, tool2Votes };
  },
});
