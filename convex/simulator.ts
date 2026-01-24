import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getScenarios = query({
  args: { difficulty: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let scenarios = ctx.db.query("simulationScenarios");
    
    if (args.difficulty) {
      scenarios = scenarios.filter((q) => 
        q.eq(q.field("difficulty"), args.difficulty)
      );
    }

    return scenarios.filter((q) => q.eq(q.field("isActive"), true)).collect();
  },
});

export const getScenarioBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("simulationScenarios")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const runSimulation = mutation({
  args: {
    userId: v.string(),
    scenarioSlug: v.string(),
    toolIds: v.array(v.id("tools")),
    deckId: v.optional(v.id("userDecks")),
  },
  handler: async (ctx, args) => {
    const scenario = await ctx.db
      .query("simulationScenarios")
      .withIndex("by_slug", (q) => q.eq("slug", args.scenarioSlug))
      .first();

    if (!scenario) throw new Error("Scenario not found");

    const tools = await Promise.all(
      args.toolIds.map((id) => ctx.db.get(id))
    );

    const results = calculateSimulationResults(tools.filter(Boolean), scenario);

    const xpEarned = Math.floor(results.overallScore * 10);

    const simulationId = await ctx.db.insert("simulations", {
      userId: args.userId,
      deckId: args.deckId,
      toolIds: args.toolIds,
      scenario: {
        type: scenario.slug,
        name: scenario.name,
        description: scenario.description,
        challenges: scenario.challenges.map((c) => ({
          name: c.name,
          weight: c.weight,
        })),
      },
      results,
      xpEarned,
      completedAt: Date.now(),
    });

    return {
      simulationId,
      results,
      xpEarned,
    };
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateSimulationResults(tools: any[], scenario: any) {
  const _toolCategories = tools.map((t) => t?.categoryId).filter(Boolean);
  const toolCount = tools.length;

  let scalability = 50;
  let security = 50;
  let performance = 50;
  let devExperience = 50;
  let costEfficiency = 50;

  for (const tool of tools) {
    if (!tool) continue;

    const stars = tool.githubStars || 0;
    const popularity = Math.min(20, stars / 5000);

    devExperience += popularity;
    performance += Math.random() * 10;
    
    if (tool.pricingModel === "free" || tool.pricingModel === "open_source") {
      costEfficiency += 10;
    }
  }

  for (const challenge of scenario.challenges) {
    const hasIdealTool = challenge.idealToolTypes.some((type: string) =>
      tools.some((t) => t?.slug?.includes(type.toLowerCase()))
    );

    if (hasIdealTool) {
      const bonus = challenge.weight * 20;
      scalability += bonus * 0.2;
      security += bonus * 0.2;
      performance += bonus * 0.3;
      devExperience += bonus * 0.3;
    }
  }

  if (toolCount > 10) {
    devExperience -= (toolCount - 10) * 2;
    costEfficiency -= (toolCount - 10) * 3;
  }

  scalability = Math.min(100, Math.max(0, scalability));
  security = Math.min(100, Math.max(0, security));
  performance = Math.min(100, Math.max(0, performance));
  devExperience = Math.min(100, Math.max(0, devExperience));
  costEfficiency = Math.min(100, Math.max(0, costEfficiency));

  const overallScore = (scalability + security + performance + devExperience + costEfficiency) / 5;

  return {
    overallScore: Math.round(overallScore),
    scalability: Math.round(scalability),
    security: Math.round(security),
    performance: Math.round(performance),
    devExperience: Math.round(devExperience),
    costEfficiency: Math.round(costEfficiency),
  };
}

export const getUserSimulations = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("simulations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 10);
  },
});

export const getSimulationLeaderboard = query({
  args: { scenarioSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const simulations = await ctx.db
      .query("simulations")
      .filter((q) => q.eq(q.field("scenario.type"), args.scenarioSlug))
      .collect();

    const sorted = simulations
      .sort((a, b) => b.results.overallScore - a.results.overallScore)
      .slice(0, args.limit || 10);

    return sorted.map((s, index) => ({
      ...s,
      rank: index + 1,
    }));
  },
});

export const seedScenarios = mutation({
  args: {},
  handler: async (ctx) => {
    const scenarios = [
      {
        slug: "startup-mvp",
        name: "Startup MVP",
        description: "Build a minimum viable product for a SaaS startup",
        difficulty: "easy" as const,
        challenges: [
          { name: "Quick Setup", description: "Get running fast", weight: 0.3, idealToolTypes: ["next", "vite", "create-react"] },
          { name: "Auth System", description: "User authentication", weight: 0.2, idealToolTypes: ["clerk", "auth0", "supabase"] },
          { name: "Database", description: "Data persistence", weight: 0.2, idealToolTypes: ["postgres", "supabase", "planetscale"] },
          { name: "Deployment", description: "Ship to production", weight: 0.3, idealToolTypes: ["vercel", "netlify", "railway"] },
        ],
        isActive: true,
      },
      {
        slug: "enterprise-scale",
        name: "Enterprise Scale",
        description: "Handle millions of users with enterprise requirements",
        difficulty: "hard" as const,
        challenges: [
          { name: "Horizontal Scaling", description: "Scale across regions", weight: 0.25, idealToolTypes: ["kubernetes", "docker", "aws"] },
          { name: "Security Compliance", description: "SOC2, GDPR compliance", weight: 0.25, idealToolTypes: ["vault", "auth0", "okta"] },
          { name: "Monitoring", description: "Observability stack", weight: 0.25, idealToolTypes: ["datadog", "grafana", "sentry"] },
          { name: "CI/CD", description: "Automated deployments", weight: 0.25, idealToolTypes: ["github-actions", "jenkins", "gitlab"] },
        ],
        isActive: true,
      },
      {
        slug: "realtime-app",
        name: "Realtime Application",
        description: "Build a collaborative realtime application",
        difficulty: "medium" as const,
        challenges: [
          { name: "WebSocket Support", description: "Realtime connections", weight: 0.3, idealToolTypes: ["socket.io", "pusher", "ably"] },
          { name: "State Sync", description: "Sync state across clients", weight: 0.3, idealToolTypes: ["yjs", "automerge", "liveblocks"] },
          { name: "Presence", description: "Show who's online", weight: 0.2, idealToolTypes: ["liveblocks", "supabase", "convex"] },
          { name: "Conflict Resolution", description: "Handle conflicts", weight: 0.2, idealToolTypes: ["yjs", "automerge", "crdt"] },
        ],
        isActive: true,
      },
      {
        slug: "ai-nightmare",
        name: "AI Nightmare Mode",
        description: "Build a production AI application with all the challenges",
        difficulty: "nightmare" as const,
        challenges: [
          { name: "LLM Integration", description: "Multiple LLM providers", weight: 0.2, idealToolTypes: ["openai", "anthropic", "langchain"] },
          { name: "Vector Search", description: "Semantic search", weight: 0.2, idealToolTypes: ["pinecone", "weaviate", "qdrant"] },
          { name: "Rate Limiting", description: "Handle API limits", weight: 0.15, idealToolTypes: ["upstash", "redis", "ratelimit"] },
          { name: "Cost Control", description: "Manage AI costs", weight: 0.15, idealToolTypes: ["helicone", "langfuse", "portkey"] },
          { name: "Streaming", description: "Stream responses", weight: 0.15, idealToolTypes: ["vercel-ai", "langchain", "llamaindex"] },
          { name: "Evaluation", description: "Test AI quality", weight: 0.15, idealToolTypes: ["promptfoo", "langsmith", "braintrust"] },
        ],
        isActive: true,
      },
    ];

    for (const scenario of scenarios) {
      const existing = await ctx.db
        .query("simulationScenarios")
        .withIndex("by_slug", (q) => q.eq("slug", scenario.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("simulationScenarios", scenario);
      }
    }

    return { seeded: scenarios.length };
  },
});
