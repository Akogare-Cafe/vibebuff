import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const ROOM_CHALLENGES = [
  { type: "auth", question: "Your app needs user authentication. Pick a tool!", category: "auth", difficulty: 1 },
  { type: "database", question: "Time to store some data. Choose your database!", category: "databases", difficulty: 1 },
  { type: "hosting", question: "Deploy time! Where will you host?", category: "hosting", difficulty: 1 },
  { type: "frontend", question: "Build that UI! Pick your frontend framework.", category: "frontend", difficulty: 1 },
  { type: "styling", question: "Make it pretty! Choose your styling solution.", category: "styling", difficulty: 2 },
  { type: "state", question: "State management crisis! What do you reach for?", category: "state-management", difficulty: 2 },
  { type: "api", question: "API layer needed. REST, GraphQL, or tRPC?", category: "backend", difficulty: 2 },
  { type: "realtime", question: "Users want live updates! Add realtime.", category: "realtime", difficulty: 3 },
  { type: "payments", question: "Time to monetize! Integrate payments.", category: "payments", difficulty: 3 },
  { type: "ai", question: "Add some AI magic! Pick your LLM provider.", category: "ai-assistants", difficulty: 3 },
  { type: "monitoring", question: "Production issues! Add monitoring.", category: "devops", difficulty: 4 },
  { type: "testing", question: "QA demands tests! Pick a testing framework.", category: "testing", difficulty: 4 },
  { type: "boss", question: "BOSS FIGHT: Build a complete microservice!", category: "backend", difficulty: 5 },
];

// Get user's active run
export const getActiveRun = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const run = await ctx.db
      .query("roguelikeRuns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!run) return null;

    // Get selected tools
    const tools = await Promise.all(
      run.selectedToolIds.map((id) => ctx.db.get(id))
    );

    return { ...run, tools: tools.filter(Boolean) };
  },
});

// Get user's run history
export const getRunHistory = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("roguelikeRuns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 10);

    return runs;
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("roguelikeLeaderboard")
      .withIndex("by_score")
      .order("desc")
      .take(args.limit || 20);

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

// Start a new run
export const startRun = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check for existing active run
    const existing = await ctx.db
      .query("roguelikeRuns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      throw new Error("You already have an active run");
    }

    const seed = Math.random().toString(36).substring(2, 10);

    const runId = await ctx.db.insert("roguelikeRuns", {
      userId: args.userId,
      seed,
      status: "active",
      currentRoom: 1,
      maxRooms: 10,
      hp: 3,
      maxHp: 3,
      score: 0,
      selectedToolIds: [],
      roomHistory: [],
      startedAt: Date.now(),
    });

    return { runId, seed };
  },
});

// Get current room challenge
export const getCurrentRoom = query({
  args: { runId: v.id("roguelikeRuns") },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) return null;
    if (run.status !== "active") return null;

    // Use seed + room number to deterministically select challenge
    const seedNum = parseInt(run.seed, 36);
    const challengeIndex = (seedNum + run.currentRoom) % ROOM_CHALLENGES.length;
    const challenge = ROOM_CHALLENGES[challengeIndex];

    // Get tools for this category
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", challenge.category))
      .first();

    let availableTools: any[] = [];
    if (category) {
      availableTools = await ctx.db
        .query("tools")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // If no tools in category, get random tools
    if (availableTools.length === 0) {
      availableTools = await ctx.db
        .query("tools")
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(10);
    }

    // Shuffle and take 4 options
    const shuffled = availableTools.sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 4);

    // Determine correct answer (highest GitHub stars or random)
    const correct = options.reduce((best, tool) =>
      (tool.githubStars || 0) > (best.githubStars || 0) ? tool : best
    );

    return {
      roomNumber: run.currentRoom,
      challenge: challenge.question,
      type: challenge.type,
      difficulty: challenge.difficulty,
      options,
      correctToolId: correct._id, // In production, don't expose this!
      hp: run.hp,
      maxHp: run.maxHp,
      score: run.score,
    };
  },
});

// Submit answer
export const submitAnswer = mutation({
  args: {
    runId: v.id("roguelikeRuns"),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error("Run not found");
    if (run.status !== "active") throw new Error("Run not active");

    // Determine if correct (simplified - in production use proper logic)
    const tool = await ctx.db.get(args.toolId);
    const isCorrect: boolean = !!(tool && (tool.githubStars || 0) > 5000);

    const seedNum = parseInt(run.seed, 36);
    const challengeIndex = (seedNum + run.currentRoom) % ROOM_CHALLENGES.length;
    const challenge = ROOM_CHALLENGES[challengeIndex];

    const xpGained = isCorrect ? challenge.difficulty * 100 : 0;
    const newHp = isCorrect ? run.hp : run.hp - 1;
    const newScore = run.score + xpGained;

    // Record room result
    const roomResult = {
      roomNumber: run.currentRoom,
      challenge: challenge.question,
      selectedToolId: args.toolId,
      wasCorrect: isCorrect,
      xpGained,
    };

    // Check if run ends
    const isDead = newHp <= 0;
    const isComplete = run.currentRoom >= run.maxRooms && !isDead;

    await ctx.db.patch(args.runId, {
      hp: newHp,
      score: newScore,
      currentRoom: run.currentRoom + 1,
      selectedToolIds: [...run.selectedToolIds, args.toolId],
      roomHistory: [...run.roomHistory, roomResult],
      status: isDead ? "failed" : isComplete ? "completed" : "active",
      completedAt: isDead || isComplete ? Date.now() : undefined,
    });

    // Update leaderboard if completed
    if (isComplete) {
      await ctx.db.insert("roguelikeLeaderboard", {
        userId: run.userId,
        runId: args.runId,
        score: newScore,
        roomsCleared: run.currentRoom,
        achievedAt: Date.now(),
      });
    }

    return {
      isCorrect,
      xpGained,
      newHp,
      newScore,
      isDead,
      isComplete,
      correctTool: tool,
    };
  },
});

// Abandon run
export const abandonRun = mutation({
  args: { runId: v.id("roguelikeRuns"), userId: v.string() },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error("Run not found");
    if (run.userId !== args.userId) throw new Error("Not your run");
    if (run.status !== "active") throw new Error("Run not active");

    await ctx.db.patch(args.runId, {
      status: "failed",
      completedAt: Date.now(),
    });
  },
});

// Use a healing item (if we add items later)
export const heal = mutation({
  args: { runId: v.id("roguelikeRuns"), userId: v.string() },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error("Run not found");
    if (run.userId !== args.userId) throw new Error("Not your run");
    if (run.status !== "active") throw new Error("Run not active");
    if (run.hp >= run.maxHp) throw new Error("Already at full HP");

    // For now, just heal 1 HP (could cost score or items)
    const healCost = 500;
    if (run.score < healCost) throw new Error("Not enough score");

    await ctx.db.patch(args.runId, {
      hp: Math.min(run.maxHp, run.hp + 1),
      score: run.score - healCost,
    });

    return { newHp: run.hp + 1, scoreCost: healCost };
  },
});
