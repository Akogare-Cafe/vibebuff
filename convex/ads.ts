import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveAdsForPlacement = query({
  args: {
    placement: v.union(
      v.literal("header"),
      v.literal("sidebar"),
      v.literal("footer"),
      v.literal("in_feed"),
      v.literal("tool_page"),
      v.literal("comparison_page"),
      v.literal("search_results")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit ?? 3;

    const activeCampaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const validCampaignIds = activeCampaigns
      .filter((c) => c.startDate <= now && (!c.endDate || c.endDate >= now))
      .filter((c) => c.spent < c.budget)
      .map((c) => c._id);

    if (validCampaignIds.length === 0) {
      return [];
    }

    const ads = await ctx.db
      .query("ads")
      .withIndex("by_placement", (q) => q.eq("placement", args.placement))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    const validAds = ads
      .filter((ad) => validCampaignIds.includes(ad.campaignId))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);

    const adsWithDetails = await Promise.all(
      validAds.map(async (ad) => {
        const campaign = await ctx.db.get(ad.campaignId);
        const advertiser = await ctx.db.get(ad.advertiserId);
        let sponsoredTool = null;
        if (ad.content.sponsoredToolId) {
          sponsoredTool = await ctx.db.get(ad.content.sponsoredToolId);
        }
        return {
          ...ad,
          campaign,
          advertiser,
          sponsoredTool,
        };
      })
    );

    return adsWithDetails;
  },
});

export const recordImpression = mutation({
  args: {
    adId: v.id("ads"),
    page: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const ad = await ctx.db.get(args.adId);
    if (!ad) return null;

    const campaign = await ctx.db.get(ad.campaignId);
    if (!campaign) return null;

    const cost = campaign.bidType === "cpm" ? campaign.bidAmount / 1000 : 0;

    await ctx.db.insert("adImpressions", {
      adId: args.adId,
      campaignId: ad.campaignId,
      userId,
      sessionId: args.sessionId,
      placement: ad.placement,
      page: args.page,
      timestamp: Date.now(),
      cost,
    });

    await ctx.db.patch(args.adId, {
      impressions: ad.impressions + 1,
    });

    if (cost > 0) {
      await ctx.db.patch(ad.campaignId, {
        spent: campaign.spent + cost,
      });
    }

    return { success: true };
  },
});

export const recordClick = mutation({
  args: {
    adId: v.id("ads"),
    page: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const ad = await ctx.db.get(args.adId);
    if (!ad) return null;

    const campaign = await ctx.db.get(ad.campaignId);
    if (!campaign) return null;

    const cost = campaign.bidType === "cpc" ? campaign.bidAmount : 0;

    await ctx.db.insert("adClicks", {
      adId: args.adId,
      campaignId: ad.campaignId,
      userId,
      sessionId: args.sessionId,
      placement: ad.placement,
      page: args.page,
      timestamp: Date.now(),
      cost,
    });

    await ctx.db.patch(args.adId, {
      clicks: ad.clicks + 1,
    });

    if (cost > 0) {
      await ctx.db.patch(ad.campaignId, {
        spent: campaign.spent + cost,
      });
    }

    return { success: true };
  },
});

export const createAdvertiser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    companyName: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await ctx.db
      .query("advertisers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Advertiser with this email already exists");
    }

    const now = Date.now();
    const advertiserId = await ctx.db.insert("advertisers", {
      name: args.name,
      slug,
      email: args.email,
      companyName: args.companyName,
      websiteUrl: args.websiteUrl,
      status: "pending",
      balance: 0,
      totalSpent: 0,
      createdAt: now,
      updatedAt: now,
    });

    return advertiserId;
  },
});

export const createCampaign = mutation({
  args: {
    advertiserId: v.id("advertisers"),
    name: v.string(),
    description: v.optional(v.string()),
    budget: v.number(),
    dailyBudget: v.optional(v.number()),
    bidType: v.union(v.literal("cpc"), v.literal("cpm"), v.literal("flat_rate")),
    bidAmount: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    targeting: v.optional(
      v.object({
        categories: v.optional(v.array(v.string())),
        tools: v.optional(v.array(v.id("tools"))),
        userLevels: v.optional(v.array(v.string())),
        pages: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const advertiser = await ctx.db.get(args.advertiserId);
    if (!advertiser || advertiser.status !== "approved") {
      throw new Error("Advertiser not found or not approved");
    }

    const now = Date.now();
    const campaignId = await ctx.db.insert("adCampaigns", {
      advertiserId: args.advertiserId,
      name: args.name,
      description: args.description,
      status: "draft",
      budget: args.budget,
      dailyBudget: args.dailyBudget,
      spent: 0,
      bidType: args.bidType,
      bidAmount: args.bidAmount,
      startDate: args.startDate,
      endDate: args.endDate,
      targeting: args.targeting,
      createdAt: now,
      updatedAt: now,
    });

    return campaignId;
  },
});

export const createAd = mutation({
  args: {
    campaignId: v.id("adCampaigns"),
    name: v.string(),
    adType: v.union(
      v.literal("banner"),
      v.literal("sidebar"),
      v.literal("inline"),
      v.literal("sponsored_tool"),
      v.literal("native")
    ),
    placement: v.union(
      v.literal("header"),
      v.literal("sidebar"),
      v.literal("footer"),
      v.literal("in_feed"),
      v.literal("tool_page"),
      v.literal("comparison_page"),
      v.literal("search_results")
    ),
    content: v.object({
      headline: v.string(),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      ctaText: v.optional(v.string()),
      destinationUrl: v.string(),
      sponsoredToolId: v.optional(v.id("tools")),
    }),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const now = Date.now();
    const adId = await ctx.db.insert("ads", {
      campaignId: args.campaignId,
      advertiserId: campaign.advertiserId,
      name: args.name,
      adType: args.adType,
      placement: args.placement,
      content: args.content,
      status: "draft",
      priority: args.priority ?? 0,
      impressions: 0,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    });

    return adId;
  },
});

export const getAdPricing = query({
  args: {},
  handler: async (ctx) => {
    const pricing = await ctx.db
      .query("adPricing")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return pricing;
  },
});

export const getAdStats = query({
  args: {
    adId: v.id("ads"),
  },
  handler: async (ctx, args) => {
    const ad = await ctx.db.get(args.adId);
    if (!ad) return null;

    const impressions = await ctx.db
      .query("adImpressions")
      .withIndex("by_ad", (q) => q.eq("adId", args.adId))
      .collect();

    const clicks = await ctx.db
      .query("adClicks")
      .withIndex("by_ad", (q) => q.eq("adId", args.adId))
      .collect();

    const totalImpressions = impressions.length;
    const totalClicks = clicks.length;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const totalCost = [...impressions, ...clicks].reduce((sum, e) => sum + e.cost, 0);

    return {
      ad,
      totalImpressions,
      totalClicks,
      ctr: ctr.toFixed(2),
      totalCost: totalCost.toFixed(2),
    };
  },
});

export const getCampaignStats = query({
  args: {
    campaignId: v.id("adCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;

    const ads = await ctx.db
      .query("ads")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      campaign,
      ads,
      totalImpressions,
      totalClicks,
      ctr: ctr.toFixed(2),
      budgetRemaining: campaign.budget - campaign.spent,
      budgetUsedPercent: ((campaign.spent / campaign.budget) * 100).toFixed(1),
    };
  },
});

export const updateAdStatus = mutation({
  args: {
    adId: v.id("ads"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("paused")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const updateCampaignStatus = mutation({
  args: {
    campaignId: v.id("adCampaigns"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.campaignId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const updateAdvertiserStatus = mutation({
  args: {
    advertiserId: v.id("advertisers"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("suspended"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.advertiserId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getAllAdvertisers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("advertisers").collect();
  },
});

export const getAllCampaigns = query({
  args: {
    advertiserId: v.optional(v.id("advertisers")),
  },
  handler: async (ctx, args) => {
    if (args.advertiserId) {
      return await ctx.db
        .query("adCampaigns")
        .withIndex("by_advertiser", (q) => q.eq("advertiserId", args.advertiserId!))
        .collect();
    }
    return await ctx.db.query("adCampaigns").collect();
  },
});

export const getAllAds = query({
  args: {
    campaignId: v.optional(v.id("adCampaigns")),
  },
  handler: async (ctx, args) => {
    if (args.campaignId) {
      return await ctx.db
        .query("ads")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId!))
        .collect();
    }
    return await ctx.db.query("ads").collect();
  },
});

export const initializeAdPricing = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("adPricing").first();
    if (existing) return { message: "Pricing already initialized" };

    const now = Date.now();
    const placements = [
      {
        placement: "header",
        adType: "banner",
        pricePerDay: 50,
        pricePerWeek: 300,
        pricePerMonth: 1000,
        cpcRate: 0.5,
        cpmRate: 5,
        description: "Premium header banner - highest visibility",
        dimensions: { width: 728, height: 90 },
      },
      {
        placement: "sidebar",
        adType: "sidebar",
        pricePerDay: 30,
        pricePerWeek: 180,
        pricePerMonth: 600,
        cpcRate: 0.3,
        cpmRate: 3,
        description: "Sidebar placement - visible on all pages",
        dimensions: { width: 300, height: 250 },
      },
      {
        placement: "in_feed",
        adType: "native",
        pricePerDay: 25,
        pricePerWeek: 150,
        pricePerMonth: 500,
        cpcRate: 0.25,
        cpmRate: 2.5,
        description: "Native in-feed ads - blends with content",
        dimensions: { width: 600, height: 400 },
      },
      {
        placement: "tool_page",
        adType: "sponsored_tool",
        pricePerDay: 40,
        pricePerWeek: 240,
        pricePerMonth: 800,
        cpcRate: 0.4,
        cpmRate: 4,
        description: "Sponsored tool placement on tool pages",
        dimensions: { width: 300, height: 250 },
      },
      {
        placement: "footer",
        adType: "banner",
        pricePerDay: 15,
        pricePerWeek: 90,
        pricePerMonth: 300,
        cpcRate: 0.15,
        cpmRate: 1.5,
        description: "Footer banner - cost-effective option",
        dimensions: { width: 728, height: 90 },
      },
    ];

    for (const pricing of placements) {
      await ctx.db.insert("adPricing", {
        ...pricing,
        isActive: true,
        updatedAt: now,
      });
    }

    return { message: "Pricing initialized", count: placements.length };
  },
});
