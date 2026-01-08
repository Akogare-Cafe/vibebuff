import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      if (existing.isActive) {
        return { success: true, alreadySubscribed: true };
      }
      await ctx.db.patch(existing._id, {
        isActive: true,
        unsubscribedAt: undefined,
        subscribedAt: Date.now(),
      });
      return { success: true, resubscribed: true };
    }

    await ctx.db.insert("newsletterSubscribers", {
      email,
      source: args.source ?? "website",
      subscribedAt: Date.now(),
      isActive: true,
    });

    await ctx.scheduler.runAfter(0, internal.email.sendWelcomeEmail, { email });

    return { success: true };
  },
});

export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!existing) {
      return { success: false, error: "Email not found" };
    }

    await ctx.db.patch(existing._id, {
      isActive: false,
      unsubscribedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getSubscriberCount = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return subscribers.length;
  },
});

export const getActiveSubscribers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});
