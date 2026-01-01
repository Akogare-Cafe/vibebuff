import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get lobby by code
export const getLobby = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const lobby = await ctx.db
      .query("draftLobbies")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!lobby) return null;

    const players = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobby._id))
      .collect();

    // Get picked tools for each player
    const playersWithTools = await Promise.all(
      players.map(async (player) => {
        const tools = await Promise.all(
          player.pickedToolIds.map((id) => ctx.db.get(id))
        );
        return { ...player, tools: tools.filter(Boolean) };
      })
    );

    // Get available tools
    const availableTools = await Promise.all(
      lobby.availableToolIds.map((id) => ctx.db.get(id))
    );

    return {
      ...lobby,
      players: playersWithTools.sort((a, b) => a.pickOrder - b.pickOrder),
      availableTools: availableTools.filter(Boolean),
    };
  },
});

// Get user's active lobbies
export const getUserLobbies = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const playerEntries = await ctx.db
      .query("draftPlayers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const lobbies = await Promise.all(
      playerEntries.map(async (entry) => {
        const lobby = await ctx.db.get(entry.lobbyId);
        return lobby;
      })
    );

    return lobbies.filter(Boolean).filter((l) => l!.status !== "completed");
  },
});

// Create draft lobby
export const createLobby = mutation({
  args: {
    hostId: v.string(),
    name: v.string(),
    maxPlayers: v.optional(v.number()),
    picksPerRound: v.optional(v.number()),
    totalRounds: v.optional(v.number()),
    categoryFilter: v.optional(v.id("categories")),
    timePerPick: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate unique code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Get all active tools (optionally filtered by category)
    let toolsQuery = ctx.db.query("tools").filter((q) => q.eq(q.field("isActive"), true));
    const allTools = await toolsQuery.collect();

    const filteredTools = args.categoryFilter
      ? allTools.filter((t) => t.categoryId === args.categoryFilter)
      : allTools;

    const lobbyId = await ctx.db.insert("draftLobbies", {
      code,
      name: args.name,
      hostId: args.hostId,
      status: "waiting",
      settings: {
        maxPlayers: args.maxPlayers || 4,
        picksPerRound: args.picksPerRound || 1,
        totalRounds: args.totalRounds || 5,
        categoryFilter: args.categoryFilter,
        timePerPick: args.timePerPick || 30,
      },
      currentRound: 0,
      currentPickerIndex: 0,
      availableToolIds: filteredTools.map((t) => t._id),
      createdAt: Date.now(),
    });

    // Add host as first player
    await ctx.db.insert("draftPlayers", {
      lobbyId,
      userId: args.hostId,
      pickOrder: 0,
      pickedToolIds: [],
      isReady: false,
      joinedAt: Date.now(),
    });

    return { lobbyId, code };
  },
});

// Join lobby
export const joinLobby = mutation({
  args: {
    userId: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const lobby = await ctx.db
      .query("draftLobbies")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!lobby) throw new Error("Lobby not found");
    if (lobby.status !== "waiting") throw new Error("Lobby already started");

    const existingPlayers = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobby._id))
      .collect();

    if (existingPlayers.length >= lobby.settings.maxPlayers) {
      throw new Error("Lobby is full");
    }

    // Check if already in lobby
    const alreadyJoined = existingPlayers.find((p) => p.userId === args.userId);
    if (alreadyJoined) {
      return { success: true, message: "Already in lobby" };
    }

    await ctx.db.insert("draftPlayers", {
      lobbyId: lobby._id,
      userId: args.userId,
      pickOrder: existingPlayers.length,
      pickedToolIds: [],
      isReady: false,
      joinedAt: Date.now(),
    });

    return { success: true };
  },
});

// Set ready status
export const setReady = mutation({
  args: {
    userId: v.string(),
    lobbyId: v.id("draftLobbies"),
    isReady: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!player) throw new Error("Not in lobby");

    await ctx.db.patch(player._id, { isReady: args.isReady });
  },
});

// Start draft
export const startDraft = mutation({
  args: {
    userId: v.string(),
    lobbyId: v.id("draftLobbies"),
  },
  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.hostId !== args.userId) throw new Error("Only host can start");
    if (lobby.status !== "waiting") throw new Error("Already started");

    const players = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    if (players.length < 2) throw new Error("Need at least 2 players");

    const allReady = players.every((p) => p.isReady || p.userId === args.userId);
    if (!allReady) throw new Error("Not all players are ready");

    // Randomize pick order
    const shuffled = players.sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      await ctx.db.patch(shuffled[i]._id, { pickOrder: i });
    }

    await ctx.db.patch(args.lobbyId, {
      status: "drafting",
      currentRound: 1,
      currentPickerIndex: 0,
      startedAt: Date.now(),
    });
  },
});

// Make a pick
export const makePick = mutation({
  args: {
    userId: v.string(),
    lobbyId: v.id("draftLobbies"),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.status !== "drafting") throw new Error("Not in drafting phase");

    const players = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    const sortedPlayers = players.sort((a, b) => a.pickOrder - b.pickOrder);
    const currentPicker = sortedPlayers[lobby.currentPickerIndex];

    if (currentPicker.userId !== args.userId) {
      throw new Error("Not your turn");
    }

    if (!lobby.availableToolIds.includes(args.toolId)) {
      throw new Error("Tool not available");
    }

    // Add tool to player's picks
    await ctx.db.patch(currentPicker._id, {
      pickedToolIds: [...currentPicker.pickedToolIds, args.toolId],
    });

    // Remove from available
    const newAvailable = lobby.availableToolIds.filter((id) => id !== args.toolId);

    // Calculate next picker (snake draft)
    let nextPickerIndex = lobby.currentPickerIndex;
    let nextRound = lobby.currentRound;
    const isEvenRound = lobby.currentRound % 2 === 0;

    if (isEvenRound) {
      nextPickerIndex--;
      if (nextPickerIndex < 0) {
        nextPickerIndex = 0;
        nextRound++;
      }
    } else {
      nextPickerIndex++;
      if (nextPickerIndex >= players.length) {
        nextPickerIndex = players.length - 1;
        nextRound++;
      }
    }

    // Check if draft is complete
    const isComplete = nextRound > lobby.settings.totalRounds;

    await ctx.db.patch(args.lobbyId, {
      availableToolIds: newAvailable,
      currentPickerIndex: nextPickerIndex,
      currentRound: nextRound,
      status: isComplete ? "voting" : "drafting",
      completedAt: isComplete ? Date.now() : undefined,
    });

    return { isComplete };
  },
});

// Vote for best draft
export const voteForDraft = mutation({
  args: {
    oderId: v.string(),
    lobbyId: v.id("draftLobbies"),
    votedForUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.status !== "voting") throw new Error("Not in voting phase");

    // Check if already voted
    const existing = await ctx.db
      .query("draftVotes")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .filter((q) => q.eq(q.field("oderId"), args.oderId))
      .first();

    if (existing) throw new Error("Already voted");

    await ctx.db.insert("draftVotes", {
      lobbyId: args.lobbyId,
      oderId: args.oderId,
      votedForUserId: args.votedForUserId,
      votedAt: Date.now(),
    });

    // Check if all players have voted
    const players = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    const votes = await ctx.db
      .query("draftVotes")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    if (votes.length >= players.length) {
      await ctx.db.patch(args.lobbyId, { status: "completed" });
    }
  },
});

// Get draft results
export const getResults = query({
  args: { lobbyId: v.id("draftLobbies") },
  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) return null;

    const players = await ctx.db
      .query("draftPlayers")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    const votes = await ctx.db
      .query("draftVotes")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Count votes per player
    const voteCount: Record<string, number> = {};
    for (const vote of votes) {
      voteCount[vote.votedForUserId] = (voteCount[vote.votedForUserId] || 0) + 1;
    }

    const playersWithResults = await Promise.all(
      players.map(async (player) => {
        const tools = await Promise.all(
          player.pickedToolIds.map((id) => ctx.db.get(id))
        );
        return {
          ...player,
          tools: tools.filter(Boolean),
          votes: voteCount[player.userId] || 0,
        };
      })
    );

    // Sort by votes
    playersWithResults.sort((a, b) => b.votes - a.votes);

    return {
      lobby,
      players: playersWithResults,
      winner: playersWithResults[0],
    };
  },
});
