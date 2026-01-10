import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

export const createBattle = mutation({
  args: {
    deckId: v.id("userDecks"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized to use this deck");
    if (!deck.isPublic) throw new Error("Deck must be public to create a battle");

    const shareToken = crypto.randomUUID();

    const battleId = await ctx.db.insert("deckBattles", {
      creatorUserId: userId,
      creatorDeckId: args.deckId,
      prompt: args.prompt,
      status: "pending",
      shareToken,
      votesForCreator: 0,
      votesForChallenger: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { battleId, shareToken };
  },
});

export const joinBattle = mutation({
  args: {
    battleId: v.id("deckBattles"),
    deckId: v.id("userDecks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);

    const battle = await ctx.db.get(args.battleId);
    if (!battle) throw new Error("Battle not found");
    if (battle.status !== "pending") throw new Error("Battle is not accepting challengers");
    if (battle.creatorUserId === userId) throw new Error("Cannot challenge your own battle");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized to use this deck");
    if (!deck.isPublic) throw new Error("Deck must be public to join a battle");

    await ctx.db.patch(args.battleId, {
      challengerUserId: userId,
      challengerDeckId: args.deckId,
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getBattle = query({
  args: { battleId: v.id("deckBattles") },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.battleId);
    if (!battle) return null;

    const creatorDeck = await ctx.db.get(battle.creatorDeckId);
    const creatorTools = creatorDeck
      ? await Promise.all(creatorDeck.toolIds.map((id) => ctx.db.get(id)))
      : [];

    let challengerDeck = null;
    let challengerTools: (typeof creatorTools[number])[] = [];
    if (battle.challengerDeckId) {
      challengerDeck = await ctx.db.get(battle.challengerDeckId);
      if (challengerDeck) {
        challengerTools = await Promise.all(
          challengerDeck.toolIds.map((id) => ctx.db.get(id))
        );
      }
    }

    return {
      ...battle,
      creatorDeck: creatorDeck
        ? { ...creatorDeck, tools: creatorTools.filter(Boolean) }
        : null,
      challengerDeck: challengerDeck
        ? { ...challengerDeck, tools: challengerTools.filter(Boolean) }
        : null,
    };
  },
});

export const getBattleByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const battle = await ctx.db
      .query("deckBattles")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!battle) return null;

    const creatorDeck = await ctx.db.get(battle.creatorDeckId);
    const creatorTools = creatorDeck
      ? await Promise.all(creatorDeck.toolIds.map((id) => ctx.db.get(id)))
      : [];

    let challengerDeck = null;
    let challengerTools: (typeof creatorTools[number])[] = [];
    if (battle.challengerDeckId) {
      challengerDeck = await ctx.db.get(battle.challengerDeckId);
      if (challengerDeck) {
        challengerTools = await Promise.all(
          challengerDeck.toolIds.map((id) => ctx.db.get(id))
        );
      }
    }

    return {
      ...battle,
      creatorDeck: creatorDeck
        ? { ...creatorDeck, tools: creatorTools.filter(Boolean) }
        : null,
      challengerDeck: challengerDeck
        ? { ...challengerDeck, tools: challengerTools.filter(Boolean) }
        : null,
    };
  },
});

export const getUserBattles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    const createdBattles = await ctx.db
      .query("deckBattles")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", userId))
      .collect();

    const challengedBattles = await ctx.db
      .query("deckBattles")
      .withIndex("by_challenger", (q) => q.eq("challengerUserId", userId))
      .collect();

    const allBattles = [...createdBattles, ...challengedBattles];
    const uniqueBattles = allBattles.filter(
      (battle, index, self) =>
        index === self.findIndex((b) => b._id === battle._id)
    );

    const battlesWithDecks = await Promise.all(
      uniqueBattles.map(async (battle) => {
        const creatorDeck = await ctx.db.get(battle.creatorDeckId);
        const challengerDeck = battle.challengerDeckId
          ? await ctx.db.get(battle.challengerDeckId)
          : null;

        return {
          ...battle,
          creatorDeck,
          challengerDeck,
        };
      })
    );

    return battlesWithDecks.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getPublicBattles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const battles = await ctx.db
      .query("deckBattles")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(args.limit || 20);

    const battlesWithDecks = await Promise.all(
      battles.map(async (battle) => {
        const creatorDeck = await ctx.db.get(battle.creatorDeckId);
        const creatorTools = creatorDeck
          ? await Promise.all(creatorDeck.toolIds.slice(0, 4).map((id) => ctx.db.get(id)))
          : [];

        const challengerDeck = battle.challengerDeckId
          ? await ctx.db.get(battle.challengerDeckId)
          : null;
        const challengerTools = challengerDeck
          ? await Promise.all(challengerDeck.toolIds.slice(0, 4).map((id) => ctx.db.get(id)))
          : [];

        return {
          ...battle,
          creatorDeck: creatorDeck
            ? { ...creatorDeck, tools: creatorTools.filter(Boolean) }
            : null,
          challengerDeck: challengerDeck
            ? { ...challengerDeck, tools: challengerTools.filter(Boolean) }
            : null,
        };
      })
    );

    return battlesWithDecks;
  },
});

export const getPendingBattles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const battles = await ctx.db
      .query("deckBattles")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(args.limit || 20);

    const battlesWithDecks = await Promise.all(
      battles.map(async (battle) => {
        const creatorDeck = await ctx.db.get(battle.creatorDeckId);
        const creatorTools = creatorDeck
          ? await Promise.all(creatorDeck.toolIds.slice(0, 4).map((id) => ctx.db.get(id)))
          : [];

        return {
          ...battle,
          creatorDeck: creatorDeck
            ? { ...creatorDeck, tools: creatorTools.filter(Boolean) }
            : null,
        };
      })
    );

    return battlesWithDecks;
  },
});

export const voteForDeck = mutation({
  args: {
    battleId: v.id("deckBattles"),
    deckId: v.id("userDecks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Must be signed in to vote");

    const voterId = identity.subject;

    const battle = await ctx.db.get(args.battleId);
    if (!battle) throw new Error("Battle not found");
    if (battle.status !== "active" && battle.status !== "voting") {
      throw new Error("Battle is not accepting votes");
    }

    const existingVote = await ctx.db
      .query("deckBattleVotes")
      .withIndex("by_battle_voter", (q) =>
        q.eq("battleId", args.battleId).eq("voterId", voterId)
      )
      .first();

    if (existingVote) {
      throw new Error("You have already voted in this battle");
    }

    if (args.deckId !== battle.creatorDeckId && args.deckId !== battle.challengerDeckId) {
      throw new Error("Invalid deck selection");
    }

    await ctx.db.insert("deckBattleVotes", {
      battleId: args.battleId,
      voterId,
      votedForDeckId: args.deckId,
      createdAt: Date.now(),
    });

    const isCreatorVote = args.deckId === battle.creatorDeckId;
    await ctx.db.patch(args.battleId, {
      votesForCreator: battle.votesForCreator + (isCreatorVote ? 1 : 0),
      votesForChallenger: battle.votesForChallenger + (isCreatorVote ? 0 : 1),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getUserVote = query({
  args: { battleId: v.id("deckBattles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const vote = await ctx.db
      .query("deckBattleVotes")
      .withIndex("by_battle_voter", (q) =>
        q.eq("battleId", args.battleId).eq("voterId", identity.subject)
      )
      .first();

    return vote;
  },
});

export const cancelBattle = mutation({
  args: { battleId: v.id("deckBattles") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);

    const battle = await ctx.db.get(args.battleId);
    if (!battle) throw new Error("Battle not found");
    if (battle.creatorUserId !== userId) throw new Error("Not authorized");
    if (battle.status !== "pending") throw new Error("Can only cancel pending battles");

    await ctx.db.patch(args.battleId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const completeBattle = mutation({
  args: { battleId: v.id("deckBattles") },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.battleId);
    if (!battle) throw new Error("Battle not found");
    if (battle.status !== "active" && battle.status !== "voting") {
      throw new Error("Battle cannot be completed");
    }

    const winnerId =
      battle.votesForCreator > battle.votesForChallenger
        ? battle.creatorDeckId
        : battle.votesForChallenger > battle.votesForCreator
          ? battle.challengerDeckId
          : undefined;

    await ctx.db.patch(args.battleId, {
      status: "completed",
      winnerId,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, winnerId };
  },
});
