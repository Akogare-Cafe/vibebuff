import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getToolsForAI = internalQuery({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const categories = await ctx.db.query("categories").collect();
    
    return tools.map((tool) => {
      const category = categories.find((c) => c._id === tool.categoryId);
      return {
        id: tool._id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        category: category?.name || "Unknown",
        categorySlug: category?.slug || "unknown",
        pricingModel: tool.pricingModel,
        isOpenSource: tool.isOpenSource,
        pros: tool.pros,
        cons: tool.cons,
        bestFor: tool.bestFor,
        features: tool.features,
        tags: tool.tags,
        githubStars: tool.githubStars,
      };
    });
  },
});

export const generateRecommendations = action({
  args: {
    projectType: v.string(),
    scale: v.string(),
    budget: v.string(),
    features: v.array(v.string()),
    freeformPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    recommendations: Record<string, Array<{
      id: string;
      name: string;
      slug: string;
      tagline: string;
      reasoning: string;
      confidence: number;
    }>>;
    aiReasoning: string;
    estimatedMonthlyCost: string;
  }> => {
    const tools = await ctx.runQuery(internal.ai.getToolsForAI);
    
    const projectTypeMap: Record<string, string> = {
      saas: "SaaS application with subscriptions and user management",
      ecommerce: "E-commerce store with products, cart, and payments",
      blog: "Blog or portfolio website with content management",
      dashboard: "Data dashboard with charts and admin features",
      realtime: "Real-time application like chat or collaboration",
      mobile: "Mobile application for iOS and Android",
      api: "Backend API service",
      ai: "AI-powered application with LLM integration",
    };

    const scaleMap: Record<string, string> = {
      hobby: "small hobby project with under 100 users",
      startup: "startup with 100-10K users",
      growth: "growing company with 10K-100K users",
      enterprise: "enterprise with 100K+ users",
    };

    const budgetMap: Record<string, string> = {
      free: "free tools only ($0/month)",
      low: "budget-friendly ($1-50/month)",
      medium: "standard budget ($50-200/month)",
      high: "premium budget ($200+/month)",
    };

    const featureDescriptions: Record<string, string> = {
      auth: "user authentication and authorization",
      database: "database for storing data",
      realtime: "real-time updates and websockets",
      storage: "file storage and uploads",
      payments: "payment processing",
      email: "email sending",
      search: "search functionality",
      analytics: "analytics and tracking",
      ai: "AI/LLM integration",
      cms: "content management system",
    };

    const requiredFeatures = args.features
      .map((f) => featureDescriptions[f] || f)
      .join(", ");

    const prompt = `You are a tech stack advisor. Based on the following requirements, recommend the best tools from the available options.

PROJECT REQUIREMENTS:
- Type: ${projectTypeMap[args.projectType] || args.projectType}
- Scale: ${scaleMap[args.scale] || args.scale}
- Budget: ${budgetMap[args.budget] || args.budget}
- Required Features: ${requiredFeatures || "general web development"}
${args.freeformPrompt ? `- Additional Context: ${args.freeformPrompt}` : ""}

AVAILABLE TOOLS (JSON):
${JSON.stringify(tools.slice(0, 50), null, 2)}

INSTRUCTIONS:
1. Select the BEST tool for each relevant category (frontend, backend, database, hosting, auth, etc.)
2. Consider the budget constraint - for "free" budget, only recommend free/open-source tools
3. Consider the scale - for enterprise, prioritize stability; for hobby, prioritize simplicity
4. Provide a confidence score (0-100) for each recommendation
5. Explain WHY each tool is recommended for this specific use case

Respond in this exact JSON format:
{
  "recommendations": {
    "Frontend Framework": [{"id": "tool_id", "name": "Tool Name", "slug": "tool-slug", "tagline": "...", "reasoning": "Why this tool", "confidence": 85}],
    "Backend/Database": [...],
    "Hosting": [...],
    "Authentication": [...],
    "Other": [...]
  },
  "aiReasoning": "Overall explanation of the recommended stack and why it works well together",
  "estimatedMonthlyCost": "$X-Y/month"
}

Only include categories that are relevant. Each category should have 1-3 tool recommendations sorted by confidence.`;

    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return generateFallbackRecommendations(tools, args);
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful tech stack advisor. Always respond with valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error("OpenAI API error:", response.status);
        return generateFallbackRecommendations(tools, args);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return generateFallbackRecommendations(tools, args);
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return generateFallbackRecommendations(tools, args);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recommendations: parsed.recommendations || {},
        aiReasoning: parsed.aiReasoning || "AI-powered recommendation based on your requirements.",
        estimatedMonthlyCost: parsed.estimatedMonthlyCost || "Varies",
      };
    } catch (error) {
      console.error("AI recommendation error:", error);
      return generateFallbackRecommendations(tools, args);
    }
  },
});

function generateFallbackRecommendations(
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    tagline: string;
    category: string;
    categorySlug: string;
    pricingModel: string;
    isOpenSource: boolean;
    pros: string[];
    bestFor: string[];
  }>,
  args: {
    projectType: string;
    scale: string;
    budget: string;
    features: string[];
  }
) {
  const budgetFilter = (tool: typeof tools[0]) => {
    if (args.budget === "free") {
      return tool.pricingModel === "free" || tool.pricingModel === "open_source";
    }
    if (args.budget === "low") {
      return tool.pricingModel !== "enterprise";
    }
    return true;
  };

  const categoryGroups: Record<string, typeof tools> = {};
  
  tools.filter(budgetFilter).forEach((tool) => {
    const cat = tool.category;
    if (!categoryGroups[cat]) {
      categoryGroups[cat] = [];
    }
    categoryGroups[cat].push(tool);
  });

  const recommendations: Record<string, Array<{
    id: string;
    name: string;
    slug: string;
    tagline: string;
    reasoning: string;
    confidence: number;
  }>> = {};

  Object.entries(categoryGroups).forEach(([category, categoryTools]) => {
    recommendations[category] = categoryTools.slice(0, 3).map((tool, index) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline,
      reasoning: tool.bestFor[0] || tool.pros[0] || "Popular choice in this category",
      confidence: 90 - index * 10,
    }));
  });

  const costEstimates: Record<string, string> = {
    free: "$0/month",
    low: "$10-50/month",
    medium: "$50-150/month",
    high: "$200-500/month",
  };

  return {
    recommendations,
    aiReasoning: `Based on your ${args.projectType} project at ${args.scale} scale with a ${args.budget} budget, we've selected tools that balance cost, features, and scalability. These recommendations prioritize tools that work well together and match your specified requirements.`,
    estimatedMonthlyCost: costEstimates[args.budget] || "Varies",
  };
}
