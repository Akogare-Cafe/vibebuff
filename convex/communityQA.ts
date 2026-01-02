import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listQuestions = query({
  args: {
    status: v.optional(v.union(v.literal("open"), v.literal("answered"), v.literal("closed"))),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
  },
  handler: async (ctx, args) => {
    let questions;

    if (args.status) {
      questions = await ctx.db
        .query("communityQuestions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.sortBy === "popular") {
      questions = await ctx.db
        .query("communityQuestions")
        .withIndex("by_upvotes")
        .order("desc")
        .collect();
    } else {
      questions = await ctx.db
        .query("communityQuestions")
        .withIndex("by_created")
        .order("desc")
        .collect();
    }

    if (args.difficulty) {
      questions = questions.filter((q) => q.difficulty === args.difficulty);
    }

    const limited = args.limit ? questions.slice(0, args.limit) : questions;

    const questionsWithDetails = await Promise.all(
      limited.map(async (question) => {
        const tools = await Promise.all(
          question.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...question, tools: tools.filter(Boolean) };
      })
    );

    return questionsWithDetails;
  },
});

export const getQuestion = query({
  args: { questionId: v.id("communityQuestions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return null;

    const tools = await Promise.all(
      question.toolIds.map((id) => ctx.db.get(id))
    );

    const answers = await ctx.db
      .query("communityAnswers")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();

    const sortedAnswers = answers.sort((a, b) => {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      return b.upvotes - a.upvotes;
    });

    return {
      ...question,
      tools: tools.filter(Boolean),
      answers: sortedAnswers,
    };
  },
});

export const getUserQuestions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityQuestions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const searchQuestions = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const allQuestions = await ctx.db.query("communityQuestions").collect();
    const queryLower = args.query.toLowerCase();

    const filtered = allQuestions.filter(
      (q) =>
        q.title.toLowerCase().includes(queryLower) ||
        q.content.toLowerCase().includes(queryLower) ||
        q.tags.some((tag) => tag.toLowerCase().includes(queryLower))
    );

    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

export const createQuestion = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    toolIds: v.array(v.id("tools")),
    tags: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communityQuestions", {
      ...args,
      status: "open",
      views: 0,
      upvotes: 0,
      answerCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const upvoteQuestion = mutation({
  args: { questionId: v.id("communityQuestions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return;

    await ctx.db.patch(args.questionId, {
      upvotes: question.upvotes + 1,
    });
  },
});

export const incrementViews = mutation({
  args: { questionId: v.id("communityQuestions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return;

    await ctx.db.patch(args.questionId, {
      views: question.views + 1,
    });
  },
});

export const createAnswer = mutation({
  args: {
    questionId: v.id("communityQuestions"),
    userId: v.string(),
    content: v.string(),
    isMentorAnswer: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const answerId = await ctx.db.insert("communityAnswers", {
      questionId: args.questionId,
      userId: args.userId,
      content: args.content,
      upvotes: 0,
      isAccepted: false,
      isMentorAnswer: args.isMentorAnswer ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const question = await ctx.db.get(args.questionId);
    if (question) {
      await ctx.db.patch(args.questionId, {
        answerCount: question.answerCount + 1,
        status: question.status === "open" ? "answered" : question.status,
        updatedAt: Date.now(),
      });
    }

    return answerId;
  },
});

export const upvoteAnswer = mutation({
  args: { answerId: v.id("communityAnswers") },
  handler: async (ctx, args) => {
    const answer = await ctx.db.get(args.answerId);
    if (!answer) return;

    await ctx.db.patch(args.answerId, {
      upvotes: answer.upvotes + 1,
    });
  },
});

export const acceptAnswer = mutation({
  args: { 
    questionId: v.id("communityQuestions"),
    answerId: v.id("communityAnswers"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question || question.userId !== args.userId) {
      throw new Error("Only the question author can accept an answer");
    }

    if (question.acceptedAnswerId) {
      const previousAnswer = await ctx.db.get(question.acceptedAnswerId);
      if (previousAnswer) {
        await ctx.db.patch(question.acceptedAnswerId, {
          isAccepted: false,
        });
      }
    }

    await ctx.db.patch(args.answerId, {
      isAccepted: true,
    });

    await ctx.db.patch(args.questionId, {
      acceptedAnswerId: args.answerId,
      status: "answered",
      updatedAt: Date.now(),
    });
  },
});

export const closeQuestion = mutation({
  args: { questionId: v.id("communityQuestions"), userId: v.string() },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question || question.userId !== args.userId) {
      throw new Error("Only the question author can close the question");
    }

    await ctx.db.patch(args.questionId, {
      status: "closed",
      updatedAt: Date.now(),
    });
  },
});
