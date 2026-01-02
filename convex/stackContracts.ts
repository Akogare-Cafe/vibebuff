import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveContracts = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const contracts = await ctx.db
      .query("stackContracts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return contracts.filter((c) => c.expiresAt > now);
  },
});

export const getContractsByType = query({
  args: { contractType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("special")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const contracts = await ctx.db
      .query("stackContracts")
      .withIndex("by_type", (q) => q.eq("contractType", args.contractType))
      .collect();

    return contracts.filter((c) => c.isActive && c.expiresAt > now);
  },
});

export const getUserSubmissions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("contractSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const contractIds = [...new Set(submissions.map((s) => s.contractId))];
    const contracts = await Promise.all(contractIds.map((id) => ctx.db.get(id)));
    const contractMap = new Map(contracts.filter(Boolean).map((c) => [c!._id, c]));

    return submissions.map((sub) => ({
      ...sub,
      contract: contractMap.get(sub.contractId),
    }));
  },
});

export const submitContract = mutation({
  args: {
    userId: v.string(),
    contractId: v.id("stackContracts"),
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (!contract.isActive) throw new Error("Contract is no longer active");
    if (contract.expiresAt < Date.now()) throw new Error("Contract has expired");

    const existingSubmission = await ctx.db
      .query("contractSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("contractId"), args.contractId))
      .first();

    if (existingSubmission) throw new Error("Already submitted for this contract");

    const tools = await Promise.all(args.toolIds.map((id) => ctx.db.get(id)));
    const validTools = tools.filter(Boolean);

    if (contract.requirements.minTools && validTools.length < contract.requirements.minTools) {
      throw new Error(`Need at least ${contract.requirements.minTools} tools`);
    }
    if (contract.requirements.maxTools && validTools.length > contract.requirements.maxTools) {
      throw new Error(`Maximum ${contract.requirements.maxTools} tools allowed`);
    }

    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map((c) => [c._id, c.slug]));

    const toolCategories = validTools.map((t) => categoryMap.get(t!.categoryId));
    const requiredCategories = new Set(contract.requirements.requiredCategories);
    const hasAllRequired = [...requiredCategories].every((cat) =>
      toolCategories.includes(cat)
    );

    if (!hasAllRequired) {
      throw new Error("Missing required categories");
    }

    let totalCost = 0;
    for (const tool of validTools) {
      const tiers = await ctx.db
        .query("pricingTiers")
        .withIndex("by_tool", (q) => q.eq("toolId", tool!._id))
        .collect();
      const cheapestTier = tiers.reduce(
        (min, t) => (t.priceMonthly && (!min || t.priceMonthly < min) ? t.priceMonthly : min),
        0
      );
      totalCost += cheapestTier;
    }

    if (contract.requirements.maxBudget && totalCost > contract.requirements.maxBudget) {
      throw new Error(`Stack exceeds budget of $${contract.requirements.maxBudget}/mo`);
    }

    let score = 100;
    if (contract.requirements.maxBudget) {
      const budgetEfficiency = 1 - totalCost / contract.requirements.maxBudget;
      score += Math.floor(budgetEfficiency * 50);
    }
    score += validTools.length * 5;

    const submissionId = await ctx.db.insert("contractSubmissions", {
      contractId: args.contractId,
      userId: args.userId,
      toolIds: args.toolIds,
      totalCost,
      score,
      status: "approved",
      submittedAt: Date.now(),
      reviewedAt: Date.now(),
    });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (profile) {
      const newXp = profile.xp + contract.rewards.xp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });

      await ctx.db.insert("xpActivityLog", {
        userId: args.userId,
        amount: contract.rewards.xp,
        source: "contract_complete",
        description: `Completed contract: ${contract.title}`,
        timestamp: Date.now(),
      });
    }

    return {
      submissionId,
      score,
      totalCost,
      rewards: contract.rewards,
    };
  },
});

export const seedContracts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stackContracts").first();
    if (existing) return { message: "Contracts already seeded" };

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const contracts = [
      {
        slug: "budget-saas",
        title: "Budget SaaS Stack",
        description: "Build a SaaS stack for under $50/month",
        clientName: "Indie Hacker Inc",
        contractType: "daily" as const,
        requirements: {
          projectType: "saas",
          maxBudget: 50,
          minTools: 4,
          requiredCategories: ["frontend", "backend", "database", "auth"],
        },
        rewards: { xp: 100 },
        difficulty: "medium" as const,
        expiresAt: now + dayMs,
        isActive: true,
        createdAt: now,
      },
      {
        slug: "enterprise-ready",
        title: "Enterprise Ready",
        description: "Build a stack that can scale to 1M users",
        clientName: "BigCorp Solutions",
        contractType: "weekly" as const,
        requirements: {
          projectType: "enterprise",
          minTools: 6,
          requiredCategories: ["frontend", "backend", "database", "auth", "monitoring", "hosting"],
        },
        rewards: { xp: 300, bonusTitle: "Enterprise Architect" },
        difficulty: "hard" as const,
        expiresAt: now + dayMs * 7,
        isActive: true,
        createdAt: now,
      },
      {
        slug: "open-source-only",
        title: "Open Source Champion",
        description: "Build a stack using only open source tools",
        clientName: "FOSS Foundation",
        contractType: "special" as const,
        requirements: {
          projectType: "any",
          minTools: 5,
          requiredCategories: ["frontend", "backend", "database"],
        },
        rewards: { xp: 200, bonusTitle: "Open Source Advocate" },
        difficulty: "medium" as const,
        expiresAt: now + dayMs * 14,
        isActive: true,
        createdAt: now,
      },
    ];

    for (const contract of contracts) {
      await ctx.db.insert("stackContracts", contract);
    }

    return { message: "Contracts seeded successfully" };
  },
});
