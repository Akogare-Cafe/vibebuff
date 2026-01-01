import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserCards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("tradableCards")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return Promise.all(
      cards.map(async (card) => {
        const tool = await ctx.db.get(card.toolId);
        return { ...card, tool };
      })
    );
  },
});

export const getActiveListings = query({
  args: { 
    listingType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let listings = ctx.db
      .query("tradeListings")
      .withIndex("by_status", (q) => q.eq("status", "active"));

    const results = await listings.take(args.limit || 50);

    return Promise.all(
      results.map(async (listing) => {
        const card = await ctx.db.get(listing.cardId);
        const tool = card ? await ctx.db.get(card.toolId) : null;
        return { ...listing, card, tool };
      })
    );
  },
});

export const createListing = mutation({
  args: {
    sellerId: v.string(),
    cardId: v.id("tradableCards"),
    listingType: v.union(v.literal("auction"), v.literal("fixed"), v.literal("trade")),
    price: v.optional(v.number()),
    wantedToolIds: v.optional(v.array(v.id("tools"))),
    durationHours: v.number(),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");
    if (card.userId !== args.sellerId) throw new Error("Not your card");
    if (card.isListed) throw new Error("Card already listed");

    await ctx.db.patch(args.cardId, { isListed: true });

    const listingId = await ctx.db.insert("tradeListings", {
      sellerId: args.sellerId,
      cardId: args.cardId,
      listingType: args.listingType,
      price: args.price,
      wantedToolIds: args.wantedToolIds,
      expiresAt: Date.now() + args.durationHours * 60 * 60 * 1000,
      status: "active",
      createdAt: Date.now(),
    });

    return listingId;
  },
});

export const placeBid = mutation({
  args: {
    userId: v.string(),
    listingId: v.id("tradeListings"),
    bidAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "active") throw new Error("Listing not active");
    if (listing.listingType !== "auction") throw new Error("Not an auction");
    if (listing.sellerId === args.userId) throw new Error("Cannot bid on own listing");

    const currentBid = listing.currentBid || 0;
    if (args.bidAmount <= currentBid) {
      throw new Error("Bid must be higher than current bid");
    }

    await ctx.db.patch(args.listingId, {
      currentBid: args.bidAmount,
      currentBidderId: args.userId,
    });

    return { success: true };
  },
});

export const buyNow = mutation({
  args: {
    buyerId: v.string(),
    listingId: v.id("tradeListings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "active") throw new Error("Listing not active");
    if (listing.listingType !== "fixed") throw new Error("Not a fixed price listing");
    if (listing.sellerId === args.buyerId) throw new Error("Cannot buy own listing");

    const card = await ctx.db.get(listing.cardId);
    if (!card) throw new Error("Card not found");

    await ctx.db.patch(listing.cardId, {
      userId: args.buyerId,
      isListed: false,
      acquiredAt: Date.now(),
      acquiredFrom: "trade",
    });

    await ctx.db.patch(args.listingId, { status: "sold" });

    await ctx.db.insert("tradeHistory", {
      listingId: args.listingId,
      sellerId: listing.sellerId,
      buyerId: args.buyerId,
      cardId: listing.cardId,
      price: listing.price || 0,
      completedAt: Date.now(),
    });

    return { success: true };
  },
});

export const cancelListing = mutation({
  args: {
    userId: v.string(),
    listingId: v.id("tradeListings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== args.userId) throw new Error("Not your listing");
    if (listing.status !== "active") throw new Error("Listing not active");

    await ctx.db.patch(listing.cardId, { isListed: false });
    await ctx.db.patch(args.listingId, { status: "cancelled" });

    return { success: true };
  },
});

export const getUserTradeHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const asSeller = await ctx.db
      .query("tradeHistory")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.userId))
      .collect();

    const asBuyer = await ctx.db
      .query("tradeHistory")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.userId))
      .collect();

    const all = [...asSeller, ...asBuyer].sort((a, b) => b.completedAt - a.completedAt);

    return Promise.all(
      all.map(async (trade) => {
        const card = await ctx.db.get(trade.cardId);
        const tool = card ? await ctx.db.get(card.toolId) : null;
        return {
          ...trade,
          card,
          tool,
          role: trade.sellerId === args.userId ? "seller" : "buyer",
        };
      })
    );
  },
});

export const mintCard = mutation({
  args: {
    userId: v.string(),
    toolId: v.id("tools"),
    rarity: v.union(v.literal("common"), v.literal("uncommon"), v.literal("rare"), v.literal("legendary"), v.literal("mythic")),
    edition: v.string(),
    acquiredFrom: v.union(v.literal("pack"), v.literal("trade"), v.literal("achievement"), v.literal("event")),
  },
  handler: async (ctx, args) => {
    const existingCards = await ctx.db
      .query("tradableCards")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const serialNumber = existingCards.length + 1;

    return ctx.db.insert("tradableCards", {
      userId: args.userId,
      toolId: args.toolId,
      rarity: args.rarity,
      edition: args.edition,
      serialNumber,
      isListed: false,
      acquiredAt: Date.now(),
      acquiredFrom: args.acquiredFrom,
    });
  },
});

export const getMarketStats = query({
  args: {},
  handler: async (ctx) => {
    const activeListings = await ctx.db
      .query("tradeListings")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const recentTrades = await ctx.db
      .query("tradeHistory")
      .order("desc")
      .take(100);

    const totalVolume = recentTrades.reduce((sum, t) => sum + t.price, 0);
    const avgPrice = recentTrades.length > 0 ? totalVolume / recentTrades.length : 0;

    return {
      activeListings: activeListings.length,
      recentTrades: recentTrades.length,
      totalVolume,
      avgPrice: Math.round(avgPrice),
    };
  },
});
