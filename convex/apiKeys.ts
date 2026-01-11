import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "vb_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return keys.map((key) => ({
      _id: key._id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      isActive: key.isActive,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    if (existingKeys.length >= 5) {
      throw new Error("Maximum of 5 active API keys allowed");
    }

    const apiKey = generateApiKey();
    const keyHash = await hashKey(apiKey);
    const keyPrefix = apiKey.substring(0, 7) + "..." + apiKey.substring(apiKey.length - 4);

    await ctx.db.insert("apiKeys", {
      userId,
      name: args.name,
      keyPrefix,
      keyHash,
      usageCount: 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return { apiKey };
  },
});

export const revoke = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const key = await ctx.db.get(args.keyId);

    if (!key) {
      throw new Error("API key not found");
    }

    if (key.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.keyId, { isActive: false });

    return { success: true };
  },
});

export const deleteKey = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const key = await ctx.db.get(args.keyId);

    if (!key) {
      throw new Error("API key not found");
    }

    if (key.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.keyId);

    return { success: true };
  },
});

export const validateKey = query({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const keyHash = await hashKey(args.apiKey);

    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", keyHash))
      .first();

    if (!key) {
      return { valid: false, reason: "Invalid API key" };
    }

    if (!key.isActive) {
      return { valid: false, reason: "API key has been revoked" };
    }

    if (key.expiresAt && key.expiresAt < Date.now()) {
      return { valid: false, reason: "API key has expired" };
    }

    return { valid: true, userId: key.userId };
  },
});

export const recordUsage = mutation({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const keyHash = await hashKey(args.apiKey);

    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", keyHash))
      .first();

    if (!key || !key.isActive) {
      return { success: false };
    }

    await ctx.db.patch(key._id, {
      lastUsedAt: Date.now(),
      usageCount: key.usageCount + 1,
    });

    return { success: true };
  },
});
