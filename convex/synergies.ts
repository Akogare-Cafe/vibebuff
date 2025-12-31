import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all synergies for a specific tool
export const getToolSynergies = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const synergiesA = await ctx.db
      .query("toolSynergies")
      .withIndex("by_tool_a", (q) => q.eq("toolAId", args.toolId))
      .collect();

    const synergiesB = await ctx.db
      .query("toolSynergies")
      .withIndex("by_tool_b", (q) => q.eq("toolBId", args.toolId))
      .collect();

    // Combine and get tool details
    const allSynergies = [...synergiesA, ...synergiesB];
    
    const synergiesWithTools = await Promise.all(
      allSynergies.map(async (synergy) => {
        const otherToolId = synergy.toolAId === args.toolId ? synergy.toolBId : synergy.toolAId;
        const otherTool = await ctx.db.get(otherToolId);
        return {
          ...synergy,
          otherTool,
        };
      })
    );

    return synergiesWithTools.filter((s) => s.otherTool !== null);
  },
});

// Get synergy between two specific tools
export const getSynergyBetween = query({
  args: { 
    toolAId: v.id("tools"),
    toolBId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    // Check both directions
    const synergy = await ctx.db
      .query("toolSynergies")
      .withIndex("by_tool_a", (q) => q.eq("toolAId", args.toolAId))
      .filter((q) => q.eq(q.field("toolBId"), args.toolBId))
      .first();

    if (synergy) return synergy;

    // Check reverse
    return await ctx.db
      .query("toolSynergies")
      .withIndex("by_tool_a", (q) => q.eq("toolAId", args.toolBId))
      .filter((q) => q.eq(q.field("toolBId"), args.toolAId))
      .first();
  },
});

// Calculate total synergy score for a deck
export const calculateDeckSynergy = query({
  args: { toolIds: v.array(v.id("tools")) },
  handler: async (ctx, args) => {
    if (args.toolIds.length < 2) return { totalScore: 0, synergies: [] };

    const synergies: Array<{
      toolA: string;
      toolB: string;
      score: number;
      type: string;
      bonusEffect?: string;
    }> = [];

    // Check all pairs
    for (let i = 0; i < args.toolIds.length; i++) {
      for (let j = i + 1; j < args.toolIds.length; j++) {
        const toolAId = args.toolIds[i];
        const toolBId = args.toolIds[j];

        // Check both directions
        let synergy = await ctx.db
          .query("toolSynergies")
          .withIndex("by_tool_a", (q) => q.eq("toolAId", toolAId))
          .filter((q) => q.eq(q.field("toolBId"), toolBId))
          .first();

        if (!synergy) {
          synergy = await ctx.db
            .query("toolSynergies")
            .withIndex("by_tool_a", (q) => q.eq("toolAId", toolBId))
            .filter((q) => q.eq(q.field("toolBId"), toolAId))
            .first();
        }

        if (synergy) {
          const toolA = await ctx.db.get(toolAId);
          const toolB = await ctx.db.get(toolBId);
          synergies.push({
            toolA: toolA?.name || "Unknown",
            toolB: toolB?.name || "Unknown",
            score: synergy.synergyScore,
            type: synergy.synergyType,
            bonusEffect: synergy.bonusEffect,
          });
        }
      }
    }

    const totalScore = synergies.reduce((sum, s) => sum + s.score, 0);
    return { totalScore, synergies };
  },
});

// Add a synergy (admin function)
export const addSynergy = mutation({
  args: {
    toolAId: v.id("tools"),
    toolBId: v.id("tools"),
    synergyType: v.union(
      v.literal("combo"),
      v.literal("integration"),
      v.literal("alternative"),
      v.literal("conflict")
    ),
    synergyScore: v.number(),
    description: v.string(),
    bonusEffect: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toolSynergies", args);
  },
});

// Seed initial synergies
export const seedSynergies = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("toolSynergies").first();
    if (existing) return { message: "Synergies already seeded" };

    // Get tools by slug for reference
    const getToolBySlug = async (slug: string) => {
      return await ctx.db
        .query("tools")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
    };

    const synergies = [
      // Next.js + Vercel = Perfect combo
      { toolA: "nextjs", toolB: "vercel", type: "integration" as const, score: 95, desc: "Native integration with zero-config deployment", bonus: "+100% Deploy Speed" },
      // Next.js + React = Foundation
      { toolA: "nextjs", toolB: "react", type: "combo" as const, score: 90, desc: "Next.js is built on React", bonus: "+50% DX" },
      // Supabase + Next.js
      { toolA: "supabase", toolB: "nextjs", type: "integration" as const, score: 85, desc: "Excellent SSR support and auth helpers", bonus: "+30% Auth Speed" },
      // Convex + Next.js
      { toolA: "convex", toolB: "nextjs", type: "integration" as const, score: 90, desc: "First-class React hooks and SSR support", bonus: "+40% Realtime DX" },
      // Clerk + Next.js
      { toolA: "clerk", toolB: "nextjs", type: "integration" as const, score: 95, desc: "Official Next.js SDK with middleware", bonus: "+50% Auth Setup" },
      // Tailwind + shadcn (implied through styling)
      { toolA: "react", toolB: "svelte", type: "alternative" as const, score: -20, desc: "Different paradigms - choose one", bonus: undefined },
      // Cursor + Claude
      { toolA: "cursor", toolB: "claude", type: "integration" as const, score: 85, desc: "Claude powers Cursor's AI features", bonus: "+30% AI Accuracy" },
      // VS Code + GitHub Copilot
      { toolA: "vscode", toolB: "github-copilot", type: "integration" as const, score: 90, desc: "Native extension support", bonus: "+25% Coding Speed" },
      // Bun + Node.js (alternative)
      { toolA: "bun", toolB: "nodejs", type: "alternative" as const, score: 0, desc: "Drop-in replacement - choose based on needs", bonus: undefined },
      // Supabase + Convex (conflict - both are backends)
      { toolA: "supabase", toolB: "convex", type: "conflict" as const, score: -50, desc: "Both serve as backend - typically choose one", bonus: undefined },
      // Neon + Supabase (they can work together but overlap)
      { toolA: "neon", toolB: "supabase", type: "alternative" as const, score: -10, desc: "Both offer Postgres - Supabase includes more", bonus: undefined },
      // Astro + React
      { toolA: "astro", toolB: "react", type: "combo" as const, score: 80, desc: "Use React components in Astro islands", bonus: "+20% Performance" },
      // SvelteKit + Svelte
      { toolA: "sveltekit", toolB: "svelte", type: "combo" as const, score: 95, desc: "SvelteKit is the official Svelte framework", bonus: "+40% DX" },
      // Nuxt + Vue
      { toolA: "nuxt", toolB: "vuejs", type: "combo" as const, score: 95, desc: "Nuxt is the official Vue meta-framework", bonus: "+40% DX" },
    ];

    for (const syn of synergies) {
      const toolA = await getToolBySlug(syn.toolA);
      const toolB = await getToolBySlug(syn.toolB);
      
      if (toolA && toolB) {
        await ctx.db.insert("toolSynergies", {
          toolAId: toolA._id,
          toolBId: toolB._id,
          synergyType: syn.type,
          synergyScore: syn.score,
          description: syn.desc,
          bonusEffect: syn.bonus,
        });
      }
    }

    return { message: "Synergies seeded successfully" };
  },
});
