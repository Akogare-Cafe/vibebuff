import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get user's parties
export const getUserParties = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("partyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const parties = await Promise.all(
      memberships.map(async (membership) => {
        const party = await ctx.db.get(membership.partyId);
        if (!party) return null;

        const memberCount = await ctx.db
          .query("partyMembers")
          .withIndex("by_party", (q) => q.eq("partyId", party._id))
          .collect();

        return {
          ...party,
          role: membership.role,
          memberCount: memberCount.length,
        };
      })
    );

    return parties.filter(Boolean);
  },
});

// Get party details
export const getParty = query({
  args: { partyId: v.id("parties") },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) return null;

    const members = await ctx.db
      .query("partyMembers")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .collect();

    const sharedDecks = await ctx.db
      .query("partyDecks")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .collect();

    const comments = await ctx.db
      .query("partyComments")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .collect();

    // Get deck details
    const decksWithDetails = await Promise.all(
      sharedDecks.map(async (pd) => {
        const deck = await ctx.db.get(pd.deckId);
        return { ...pd, deck };
      })
    );

    return {
      ...party,
      members,
      sharedDecks: decksWithDetails.filter((d) => d.deck !== null),
      comments,
    };
  },
});

// Create a new party
export const createParty = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inviteCode = generateInviteCode();

    const partyId = await ctx.db.insert("parties", {
      name: args.name,
      description: args.description,
      ownerId: args.userId,
      inviteCode,
      createdAt: Date.now(),
    });

    // Add creator as owner member
    await ctx.db.insert("partyMembers", {
      partyId,
      userId: args.userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return { partyId, inviteCode };
  },
});

// Join a party via invite code
export const joinParty = mutation({
  args: {
    userId: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db
      .query("parties")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!party) {
      return { success: false, message: "Invalid invite code" };
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("partyMembers")
      .withIndex("by_party", (q) => q.eq("partyId", party._id))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMembership) {
      return { success: false, message: "Already a member" };
    }

    await ctx.db.insert("partyMembers", {
      partyId: party._id,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    return { success: true, partyId: party._id, partyName: party.name };
  },
});

// Leave a party
export const leaveParty = mutation({
  args: {
    userId: v.string(),
    partyId: v.id("parties"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("partyMembers")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!membership) {
      return { success: false, message: "Not a member" };
    }

    if (membership.role === "owner") {
      return { success: false, message: "Owner cannot leave. Transfer ownership first." };
    }

    await ctx.db.delete(membership._id);
    return { success: true };
  },
});

// Share a deck with the party
export const shareDeckWithParty = mutation({
  args: {
    userId: v.string(),
    partyId: v.id("parties"),
    deckId: v.id("userDecks"),
  },
  handler: async (ctx, args) => {
    // Verify user is a member
    const membership = await ctx.db
      .query("partyMembers")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!membership) {
      return { success: false, message: "Not a member of this party" };
    }

    // Check if already shared
    const existing = await ctx.db
      .query("partyDecks")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .filter((q) => q.eq(q.field("deckId"), args.deckId))
      .first();

    if (existing) {
      return { success: false, message: "Deck already shared" };
    }

    await ctx.db.insert("partyDecks", {
      partyId: args.partyId,
      deckId: args.deckId,
      sharedBy: args.userId,
      sharedAt: Date.now(),
    });

    return { success: true };
  },
});

// Add a comment
export const addComment = mutation({
  args: {
    userId: v.string(),
    partyId: v.id("parties"),
    content: v.string(),
    toolId: v.optional(v.id("tools")),
    deckId: v.optional(v.id("userDecks")),
  },
  handler: async (ctx, args) => {
    // Verify user is a member
    const membership = await ctx.db
      .query("partyMembers")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!membership) {
      return { success: false, message: "Not a member of this party" };
    }

    await ctx.db.insert("partyComments", {
      partyId: args.partyId,
      userId: args.userId,
      content: args.content,
      toolId: args.toolId,
      deckId: args.deckId,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete a party (owner only)
export const deleteParty = mutation({
  args: {
    userId: v.string(),
    partyId: v.id("parties"),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) return { success: false, message: "Party not found" };

    if (party.ownerId !== args.userId) {
      return { success: false, message: "Only owner can delete party" };
    }

    // Delete all related data
    const members = await ctx.db
      .query("partyMembers")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const decks = await ctx.db
      .query("partyDecks")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .collect();
    for (const deck of decks) {
      await ctx.db.delete(deck._id);
    }

    const comments = await ctx.db
      .query("partyComments")
      .withIndex("by_party", (q) => q.eq("partyId", args.partyId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.partyId);
    return { success: true };
  },
});
