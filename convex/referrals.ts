import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

const REFERRER_REWARD_XP = 500;
const REFERRED_REWARD_XP = 250;

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getOrCreateReferralCode = mutation({
  args: {},
  handler: async (ctx) => {
    const clerkId = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("referralCodes")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .first();

    if (existing) {
      return existing;
    }

    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await ctx.db
        .query("referralCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!existingCode) break;
      code = generateReferralCode();
      attempts++;
    }

    const id = await ctx.db.insert("referralCodes", {
      userId: clerkId,
      code,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const getReferralCode = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;
    return await ctx.db
      .query("referralCodes")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .first();
  },
});

export const validateReferralCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const referralCode = await ctx.db
      .query("referralCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!referralCode) {
      return { valid: false, error: "Invalid referral code" };
    }

    return { valid: true, referrerId: referralCode.userId };
  },
});

export const applyReferralCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const clerkId = await getAuthenticatedUser(ctx);

    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred", (q) => q.eq("referredUserId", clerkId))
      .first();

    if (existingReferral) {
      return { success: false, error: "You have already used a referral code" };
    }

    const referralCode = await ctx.db
      .query("referralCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!referralCode) {
      return { success: false, error: "Invalid referral code" };
    }

    if (referralCode.userId === clerkId) {
      return { success: false, error: "You cannot use your own referral code" };
    }

    await ctx.db.insert("referrals", {
      referrerId: referralCode.userId,
      referredUserId: clerkId,
      referralCode: args.code.toUpperCase(),
      status: "completed",
      referrerRewardXp: REFERRER_REWARD_XP,
      referredRewardXp: REFERRED_REWARD_XP,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    const referredProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (referredProfile) {
      const newXp = referredProfile.xp + REFERRED_REWARD_XP;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await ctx.db.patch(referredProfile._id, {
        xp: newXp,
        level: newLevel,
      });
    }

    const referrerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", referralCode.userId))
      .first();

    if (referrerProfile) {
      const newXp = referrerProfile.xp + REFERRER_REWARD_XP;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await ctx.db.patch(referrerProfile._id, {
        xp: newXp,
        level: newLevel,
      });

      await ctx.db.insert("notifications", {
        userId: referralCode.userId,
        type: "referral_signup",
        title: "New Referral!",
        message: `Someone joined using your referral code! You earned ${REFERRER_REWARD_XP} XP.`,
        icon: "Users",
        isRead: false,
        createdAt: Date.now(),
        metadata: {
          xpAmount: REFERRER_REWARD_XP,
        },
      });
    }

    return { 
      success: true, 
      xpEarned: REFERRED_REWARD_XP,
      message: `Welcome bonus! You earned ${REFERRED_REWARD_XP} XP` 
    };
  },
});

export const getReferralStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", clerkId))
      .collect();

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === "completed" || r.status === "rewarded").length;
    const totalXpEarned = referrals.reduce((sum, r) => sum + r.referrerRewardXp, 0);

    const referralCode = await ctx.db
      .query("referralCodes")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .first();

    return {
      code: referralCode?.code || null,
      totalReferrals,
      completedReferrals,
      totalXpEarned,
      rewardPerReferral: REFERRER_REWARD_XP,
    };
  },
});

export const trackShareEvent = mutation({
  args: {
    shareType: v.union(
      v.literal("tool"),
      v.literal("deck"),
      v.literal("profile"),
      v.literal("comparison"),
      v.literal("tier_list"),
      v.literal("stack"),
      v.literal("referral")
    ),
    platform: v.union(
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("copy_link"),
      v.literal("native_share"),
      v.literal("embed")
    ),
    resourceId: v.optional(v.string()),
    shareUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || undefined;

    await ctx.db.insert("shareEvents", {
      userId,
      shareType: args.shareType,
      platform: args.platform,
      resourceId: args.resourceId,
      shareUrl: args.shareUrl,
      createdAt: Date.now(),
    });

    if (userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();

      if (profile) {
        const xpReward = 10;
        await ctx.db.patch(profile._id, {
          xp: profile.xp + xpReward,
        });
      }
    }

    return { success: true };
  },
});

export const getShareStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    const shares = await ctx.db
      .query("shareEvents")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect();

    const byPlatform = shares.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = shares.reduce((acc, share) => {
      acc[share.shareType] = (acc[share.shareType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalShares: shares.length,
      byPlatform,
      byType,
    };
  },
});
