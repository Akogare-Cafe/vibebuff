import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

// Get user's decks
export const getUserDecks = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? args.userId;
    
    if (!userId) {
      return [];
    }
    
    const decks = await ctx.db
      .query("userDecks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const decksWithTools = await Promise.all(
      decks.map(async (deck) => {
        const tools = await Promise.all(
          deck.toolIds.map((id) => ctx.db.get(id))
        );
        return { ...deck, tools: tools.filter(Boolean) };
      })
    );

    return decksWithTools;
  },
});

// Get a single deck by ID
export const getDeck = query({
  args: { deckId: v.id("userDecks") },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) return null;

    const tools = await Promise.all(
      deck.toolIds.map((id) => ctx.db.get(id))
    );

    // Calculate synergy score
    let totalSynergyScore = 0;
    const synergies = [];

    for (let i = 0; i < deck.toolIds.length; i++) {
      for (let j = i + 1; j < deck.toolIds.length; j++) {
        const synergy = await ctx.db
          .query("toolSynergies")
          .withIndex("by_tool_a", (q) => q.eq("toolAId", deck.toolIds[i]))
          .filter((q) => q.eq(q.field("toolBId"), deck.toolIds[j]))
          .first();

        if (synergy) {
          totalSynergyScore += synergy.synergyScore;
          synergies.push(synergy);
        } else {
          // Check reverse
          const reverseSynergy = await ctx.db
            .query("toolSynergies")
            .withIndex("by_tool_a", (q) => q.eq("toolAId", deck.toolIds[j]))
            .filter((q) => q.eq(q.field("toolBId"), deck.toolIds[i]))
            .first();

          if (reverseSynergy) {
            totalSynergyScore += reverseSynergy.synergyScore;
            synergies.push(reverseSynergy);
          }
        }
      }
    }

    return {
      ...deck,
      tools: tools.filter(Boolean),
      totalSynergyScore,
      synergies,
    };
  },
});

// Get deck by share token
export const getDeckByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const deck = await ctx.db
      .query("userDecks")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!deck) return null;

    const tools = await Promise.all(
      deck.toolIds.map((id) => ctx.db.get(id))
    );

    return { ...deck, tools: tools.filter(Boolean) };
  },
});

// Create a new deck
export const createDeck = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    toolIds: v.array(v.id("tools")),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const shareToken = args.isPublic 
      ? crypto.randomUUID()
      : undefined;

    const deckId = await ctx.db.insert("userDecks", {
      userId,
      name: args.name,
      description: args.description,
      toolIds: args.toolIds,
      isPublic: args.isPublic,
      shareToken,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user profile stats
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        decksCreated: profile.decksCreated + 1,
      });
    }

    return deckId;
  },
});

// Update a deck
export const updateDeck = mutation({
  args: {
    deckId: v.id("userDecks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    toolIds: v.optional(v.array(v.id("tools"))),
    isPublic: v.optional(v.boolean()),
    categoryAssignments: v.optional(v.array(v.object({
      categorySlug: v.string(),
      toolId: v.id("tools"),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized");
    
    const { deckId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(deckId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Assign tool to category slot in deck
export const assignToolToSlot = mutation({
  args: {
    deckId: v.id("userDecks"),
    categorySlug: v.string(),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized");

    const currentAssignments = deck.categoryAssignments || [];
    const filteredAssignments = currentAssignments.filter(
      (a) => a.categorySlug !== args.categorySlug
    );

    const newAssignments = [
      ...filteredAssignments,
      { categorySlug: args.categorySlug, toolId: args.toolId },
    ];

    await ctx.db.patch(args.deckId, {
      categoryAssignments: newAssignments,
      updatedAt: Date.now(),
    });

    return { message: "Tool assigned to slot" };
  },
});

// Remove tool from category slot
export const removeToolFromSlot = mutation({
  args: {
    deckId: v.id("userDecks"),
    categorySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized");

    const currentAssignments = deck.categoryAssignments || [];
    const newAssignments = currentAssignments.filter(
      (a) => a.categorySlug !== args.categorySlug
    );

    await ctx.db.patch(args.deckId, {
      categoryAssignments: newAssignments,
      updatedAt: Date.now(),
    });
  },
});

// Get deck with full category details
export const getDeckWithCategories = query({
  args: { deckId: v.id("userDecks") },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) return null;

    const tools = await Promise.all(
      deck.toolIds.map((id) => ctx.db.get(id))
    );

    const categories = await ctx.db.query("categories").collect();
    
    const slotsWithTools = await Promise.all(
      categories.map(async (category) => {
        const assignment = deck.categoryAssignments?.find(
          (a) => a.categorySlug === category.slug
        );
        const assignedTool = assignment 
          ? await ctx.db.get(assignment.toolId)
          : null;
        
        return {
          category,
          assignedTool,
          availableTools: tools.filter(Boolean).filter((t) => 
            t && t.categoryId === category._id
          ),
        };
      })
    );

    return {
      ...deck,
      tools: tools.filter(Boolean),
      slots: slotsWithTools.filter((s) => s.availableTools.length > 0 || s.assignedTool),
    };
  },
});

// Delete a deck
export const deleteDeck = mutation({
  args: { deckId: v.id("userDecks") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized");
    
    await ctx.db.delete(args.deckId);
  },
});

// Add tool to deck
export const addToolToDeck = mutation({
  args: {
    deckId: v.id("userDecks"),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized");

    if (deck.toolIds.includes(args.toolId)) {
      return { message: "Tool already in deck" };
    }

    await ctx.db.patch(args.deckId, {
      toolIds: [...deck.toolIds, args.toolId],
      updatedAt: Date.now(),
    });

    return { message: "Tool added to deck" };
  },
});

// Remove tool from deck
export const removeToolFromDeck = mutation({
  args: {
    deckId: v.id("userDecks"),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.deckId, {
      toolIds: deck.toolIds.filter((id) => id !== args.toolId),
      updatedAt: Date.now(),
    });
  },
});

// Get public decks (for discovery)
export const getPublicDecks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const decks = await ctx.db
      .query("userDecks")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(args.limit || 20);

    const decksWithTools = await Promise.all(
      decks.map(async (deck) => {
        const tools = await Promise.all(
          deck.toolIds.slice(0, 5).map((id) => ctx.db.get(id))
        );
        return { ...deck, tools: tools.filter(Boolean), toolCount: deck.toolIds.length };
      })
    );

    return decksWithTools;
  },
});
