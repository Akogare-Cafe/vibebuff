import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all discovered fusions
export const getAllFusions = query({
  args: {},
  handler: async (ctx) => {
    const fusions = await ctx.db.query("toolFusions").collect();

    const fusionsWithTools = await Promise.all(
      fusions.map(async (fusion) => {
        const tool1 = await ctx.db.get(fusion.tool1Id);
        const tool2 = await ctx.db.get(fusion.tool2Id);
        return { ...fusion, tool1, tool2 };
      })
    );

    return fusionsWithTools;
  },
});

// Get user's discovered fusions
export const getUserFusions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userFusions = await ctx.db
      .query("userFusions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const fusionsWithDetails = await Promise.all(
      userFusions.map(async (uf) => {
        const fusion = await ctx.db.get(uf.fusionId);
        if (!fusion) return null;
        const tool1 = await ctx.db.get(fusion.tool1Id);
        const tool2 = await ctx.db.get(fusion.tool2Id);
        return { ...uf, fusion: { ...fusion, tool1, tool2 } };
      })
    );

    return fusionsWithDetails.filter(Boolean);
  },
});

// Check if fusion exists between two tools
export const checkFusion = query({
  args: { tool1Id: v.id("tools"), tool2Id: v.id("tools") },
  handler: async (ctx, args) => {
    // Check both orderings
    let fusion = await ctx.db
      .query("toolFusions")
      .withIndex("by_tools", (q) =>
        q.eq("tool1Id", args.tool1Id).eq("tool2Id", args.tool2Id)
      )
      .first();

    if (!fusion) {
      fusion = await ctx.db
        .query("toolFusions")
        .withIndex("by_tools", (q) =>
          q.eq("tool1Id", args.tool2Id).eq("tool2Id", args.tool1Id)
        )
        .first();
    }

    if (!fusion) return null;

    const tool1 = await ctx.db.get(fusion.tool1Id);
    const tool2 = await ctx.db.get(fusion.tool2Id);

    return { ...fusion, tool1, tool2 };
  },
});

// Attempt fusion (discover or use existing)
export const attemptFusion = mutation({
  args: {
    userId: v.string(),
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
  },
  handler: async (ctx, args) => {
    // Check if fusion exists
    let fusion = await ctx.db
      .query("toolFusions")
      .withIndex("by_tools", (q) =>
        q.eq("tool1Id", args.tool1Id).eq("tool2Id", args.tool2Id)
      )
      .first();

    if (!fusion) {
      fusion = await ctx.db
        .query("toolFusions")
        .withIndex("by_tools", (q) =>
          q.eq("tool1Id", args.tool2Id).eq("tool2Id", args.tool1Id)
        )
        .first();
    }

    if (!fusion) {
      return { success: false, message: "No fusion recipe exists for these tools" };
    }

    // Check if user already discovered this fusion
    const existing = await ctx.db
      .query("userFusions")
      .withIndex("by_user_fusion", (q) =>
        q.eq("userId", args.userId).eq("fusionId", fusion!._id)
      )
      .first();

    if (existing) {
      // Increment usage count
      await ctx.db.patch(existing._id, {
        timesUsed: existing.timesUsed + 1,
      });
      return { success: true, isNew: false, fusion };
    }

    // New discovery!
    await ctx.db.insert("userFusions", {
      userId: args.userId,
      fusionId: fusion._id,
      discoveredAt: Date.now(),
      timesUsed: 1,
    });

    // If this is the first ever discovery, record it
    if (!fusion.discoveredBy) {
      await ctx.db.patch(fusion._id, {
        discoveredBy: args.userId,
        discoveredAt: Date.now(),
      });
    }

    return { success: true, isNew: true, fusion };
  },
});

// Seed fusion recipes
export const seedFusions = mutation({
  args: {},
  handler: async (ctx) => {
    const getToolId = async (slug: string) => {
      const tool = await ctx.db
        .query("tools")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      return tool?._id;
    };

    const fusionRecipes = [
      {
        slug: "vercel-stack",
        name: "Vercel Stack",
        description: "The ultimate deployment combo. Next.js + Vercel = instant deploys with zero config.",
        tool1Slug: "nextjs",
        tool2Slug: "vercel",
        resultStats: { hp: 95, attack: 90, defense: 95, speed: 100, mana: 85 },
        bonusEffects: ["+50% Deploy Speed", "Zero Config", "Edge Functions"],
        rarity: "legendary" as const,
      },
      {
        slug: "t3-stack",
        name: "T3 Stack",
        description: "Type-safe from database to frontend. The holy trinity of modern web dev.",
        tool1Slug: "nextjs",
        tool2Slug: "prisma",
        resultStats: { hp: 90, attack: 85, defense: 95, speed: 80, mana: 90 },
        bonusEffects: ["+30% Type Safety", "End-to-end Types", "DX Boost"],
        rarity: "epic" as const,
      },
      {
        slug: "supabase-auth",
        name: "Supabase Auth Stack",
        description: "Authentication + Database in one. Backend as a service perfected.",
        tool1Slug: "supabase",
        tool2Slug: "nextjs",
        resultStats: { hp: 88, attack: 82, defense: 90, speed: 85, mana: 95 },
        bonusEffects: ["+40% Auth Speed", "Row Level Security", "Realtime"],
        rarity: "rare" as const,
      },
      {
        slug: "tailwind-shadcn",
        name: "UI Powerhouse",
        description: "Beautiful, accessible components with utility-first styling.",
        tool1Slug: "tailwindcss",
        tool2Slug: "shadcn-ui",
        resultStats: { hp: 85, attack: 95, defense: 80, speed: 90, mana: 88 },
        bonusEffects: ["+60% UI Speed", "Copy-Paste Components", "Dark Mode"],
        rarity: "rare" as const,
      },
      {
        slug: "ai-stack",
        name: "AI Superstack",
        description: "LLM-powered applications with vector search. The future is now.",
        tool1Slug: "openai",
        tool2Slug: "pinecone",
        resultStats: { hp: 92, attack: 98, defense: 75, speed: 85, mana: 70 },
        bonusEffects: ["+100% AI Power", "Semantic Search", "RAG Ready"],
        rarity: "legendary" as const,
      },
    ];

    let seeded = 0;
    for (const recipe of fusionRecipes) {
      const existing = await ctx.db
        .query("toolFusions")
        .withIndex("by_slug", (q) => q.eq("slug", recipe.slug))
        .first();

      if (!existing) {
        const tool1Id = await getToolId(recipe.tool1Slug);
        const tool2Id = await getToolId(recipe.tool2Slug);

        if (tool1Id && tool2Id) {
          await ctx.db.insert("toolFusions", {
            slug: recipe.slug,
            name: recipe.name,
            description: recipe.description,
            tool1Id,
            tool2Id,
            resultStats: recipe.resultStats,
            bonusEffects: recipe.bonusEffects,
            rarity: recipe.rarity,
          });
          seeded++;
        }
      }
    }

    return { seeded };
  },
});
