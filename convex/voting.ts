import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current month's voting periods
export const getActiveVotingPeriods = query({
  handler: async (ctx) => {
    const periods = await ctx.db
      .query("monthlyVotingPeriods")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const periodsWithDetails = await Promise.all(
      periods.map(async (period) => {
        const category = await ctx.db.get(period.categoryId);
        
        // Get vote counts per tool
        const votes = await ctx.db
          .query("toolVotes")
          .withIndex("by_period", (q) => q.eq("votingPeriodId", period._id))
          .collect();

        const voteCounts = new Map<string, number>();
        for (const vote of votes) {
          const toolId = vote.toolId.toString();
          voteCounts.set(toolId, (voteCounts.get(toolId) || 0) + 1);
        }

        // Get top tools
        const toolIds = Array.from(voteCounts.keys());
        const toolsWithVotes = await Promise.all(
          toolIds.map(async (toolId) => {
            const tool = await ctx.db.get(toolId as any);
            return { tool, votes: voteCounts.get(toolId) || 0 };
          })
        );

        const sortedTools = toolsWithVotes
          .filter((t) => t.tool !== null)
          .sort((a, b) => b.votes - a.votes);

        return {
          ...period,
          category,
          totalVotes: votes.length,
          topTools: sortedTools.slice(0, 5),
        };
      })
    );

    return periodsWithDetails;
  },
});

// Get voting period for a specific category
export const getVotingPeriodForCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const now = new Date();
    const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

    const period = await ctx.db
      .query("monthlyVotingPeriods")
      .withIndex("by_category_month", (q) => 
        q.eq("categoryId", args.categoryId).eq("month", currentMonth)
      )
      .first();

    if (!period) return null;

    // Get tools in this category
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get vote counts
    const votes = await ctx.db
      .query("toolVotes")
      .withIndex("by_period", (q) => q.eq("votingPeriodId", period._id))
      .collect();

    const voteCounts = new Map<string, number>();
    for (const vote of votes) {
      const toolId = vote.toolId.toString();
      voteCounts.set(toolId, (voteCounts.get(toolId) || 0) + 1);
    }

    const toolsWithVotes = tools.map((tool) => ({
      ...tool,
      voteCount: voteCounts.get(tool._id.toString()) || 0,
    }));

    return {
      ...period,
      tools: toolsWithVotes.sort((a, b) => b.voteCount - a.voteCount),
    };
  },
});

// Check if user has voted in a period
export const hasUserVoted = query({
  args: {
    userId: v.string(),
    votingPeriodId: v.id("monthlyVotingPeriods"),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("toolVotes")
      .withIndex("by_user_period", (q) => 
        q.eq("userId", args.userId).eq("votingPeriodId", args.votingPeriodId)
      )
      .first();

    return vote !== null;
  },
});

// Cast a vote
export const castVote = mutation({
  args: {
    userId: v.string(),
    votingPeriodId: v.id("monthlyVotingPeriods"),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    // Check if period is active
    const period = await ctx.db.get(args.votingPeriodId);
    if (!period || !period.isActive) {
      return { success: false, message: "Voting period is not active" };
    }

    // Check if already voted
    const existingVote = await ctx.db
      .query("toolVotes")
      .withIndex("by_user_period", (q) => 
        q.eq("userId", args.userId).eq("votingPeriodId", args.votingPeriodId)
      )
      .first();

    if (existingVote) {
      return { success: false, message: "Already voted in this period" };
    }

    // Verify tool is in the correct category
    const tool = await ctx.db.get(args.toolId);
    if (!tool || tool.categoryId !== period.categoryId) {
      return { success: false, message: "Tool not in this category" };
    }

    await ctx.db.insert("toolVotes", {
      userId: args.userId,
      votingPeriodId: args.votingPeriodId,
      toolId: args.toolId,
      votedAt: Date.now(),
    });

    // Update user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        votescast: profile.votescast + 1,
        xp: profile.xp + 10, // Bonus XP for voting
      });
    }

    return { success: true, xpAwarded: 10 };
  },
});

// Create voting periods for all categories (admin/cron)
export const createMonthlyVotingPeriods = mutation({
  handler: async (ctx) => {
    const now = new Date();
    const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

    const categories = await ctx.db.query("categories").collect();
    let created = 0;

    for (const category of categories) {
      // Check if period already exists
      const existing = await ctx.db
        .query("monthlyVotingPeriods")
        .withIndex("by_category_month", (q) => 
          q.eq("categoryId", category._id).eq("month", currentMonth)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("monthlyVotingPeriods", {
          categoryId: category._id,
          month: currentMonth,
          year: now.getFullYear(),
          isActive: true,
        });
        created++;
      }
    }

    return { message: `Created ${created} voting periods` };
  },
});

// Close voting period and declare winner (admin/cron)
export const closeVotingPeriod = mutation({
  args: { votingPeriodId: v.id("monthlyVotingPeriods") },
  handler: async (ctx, args) => {
    const period = await ctx.db.get(args.votingPeriodId);
    if (!period) return { success: false, message: "Period not found" };

    // Get all votes
    const votes = await ctx.db
      .query("toolVotes")
      .withIndex("by_period", (q) => q.eq("votingPeriodId", args.votingPeriodId))
      .collect();

    // Count votes
    const voteCounts = new Map<string, number>();
    for (const vote of votes) {
      const toolId = vote.toolId.toString();
      voteCounts.set(toolId, (voteCounts.get(toolId) || 0) + 1);
    }

    // Find winner
    let winnerId: string | null = null;
    let maxVotes = 0;
    for (const [toolId, count] of voteCounts) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = toolId;
      }
    }

    await ctx.db.patch(args.votingPeriodId, {
      isActive: false,
      winnerId: winnerId as any,
    });

    return { success: true, winnerId, totalVotes: votes.length };
  },
});

// Get past winners
export const getPastWinners = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const periods = await ctx.db
      .query("monthlyVotingPeriods")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), false),
          q.neq(q.field("winnerId"), undefined)
        )
      )
      .take(args.limit || 10);

    const winnersWithDetails = await Promise.all(
      periods.map(async (period) => {
        const category = await ctx.db.get(period.categoryId);
        const winner = period.winnerId ? await ctx.db.get(period.winnerId) : null;
        return { ...period, category, winner };
      })
    );

    return winnersWithDetails.filter((w) => w.winner !== null);
  },
});
