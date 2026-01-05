import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { validateApiKey, unauthorizedResponse } from "@/lib/api-auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }
  
  try {
    const body = await request.json();
    const { projectDescription, budget, scale, teamSize } = body;

    const tools = await convex.query(api.tools.list, {});
    const categories = await convex.query(api.categories.list, {});

    const categoryMap = new Map(
      categories.map((c: { _id: string; name: string; slug: string }) => [c._id, c])
    );

    const toolsByCategory: Record<string, typeof tools> = {};
    for (const tool of tools) {
      const category = tool.categoryId ? categoryMap.get(tool.categoryId) : null;
      const categoryName = category?.name || "Other";
      if (!toolsByCategory[categoryName]) {
        toolsByCategory[categoryName] = [];
      }
      toolsByCategory[categoryName].push(tool);
    }

    const budgetFilter = budget || "medium";
    const scaleFilter = scale || "startup";

    const recommendations: Record<string, { name: string; slug: string; reasoning: string; confidence: number }> = {};

    const categoryPriority = [
      "Frontend Framework",
      "Backend/BaaS",
      "Database",
      "Authentication",
      "Hosting/Deployment",
      "Styling/CSS",
      "State Management",
      "Payments",
      "Analytics",
      "Monitoring",
    ];

    for (const categoryName of categoryPriority) {
      const categoryTools = toolsByCategory[categoryName];
      if (categoryTools && categoryTools.length > 0) {
        const sortedTools = categoryTools.sort((a, b) => {
          const aScore = (a.stats?.attack || 0) + (a.stats?.defense || 0);
          const bScore = (b.stats?.attack || 0) + (b.stats?.defense || 0);
          return bScore - aScore;
        });

        const topTool = sortedTools[0];
        const key = categoryName.toLowerCase().replace(/[^a-z]/g, "");
        
        recommendations[key] = {
          name: topTool.name,
          slug: topTool.slug,
          reasoning: getToolReasoning(topTool, projectDescription, budgetFilter, scaleFilter),
          confidence: Math.min(95, 70 + (topTool.stats?.speed || 0) * 2),
        };
      }
    }

    const estimatedCost = getEstimatedCost(budgetFilter, scaleFilter);

    return NextResponse.json({
      stack: recommendations,
      estimatedMonthlyCost: estimatedCost,
      aiReasoning: `Based on your project "${projectDescription.slice(0, 100)}...", I've analyzed your requirements for a ${scaleFilter}-scale project with a ${budgetFilter} budget. Here's my recommended stack optimized for developer experience, scalability, and cost-effectiveness.`,
      projectContext: {
        budget: budgetFilter,
        scale: scaleFilter,
        teamSize: teamSize || 1,
      },
    });
  } catch (error) {
    console.error("MCP recommend error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

function getToolReasoning(
  tool: { name: string; tagline?: string; pricingModel?: string },
  projectDescription: string,
  budget: string,
  scale: string
): string {
  const reasons = [];

  if (tool.tagline) {
    reasons.push(tool.tagline);
  }

  if (budget === "free" && tool.pricingModel?.toLowerCase().includes("free")) {
    reasons.push("Offers a generous free tier");
  }

  if (scale === "enterprise") {
    reasons.push("Enterprise-ready with proven scalability");
  } else if (scale === "startup") {
    reasons.push("Great for rapid development and iteration");
  }

  return reasons.join(". ") || `Recommended for ${scale} projects`;
}

function getEstimatedCost(budget: string, scale: string): string {
  const costs: Record<string, Record<string, string>> = {
    free: {
      hobby: "$0/month",
      startup: "$0-20/month",
      growth: "$20-100/month",
      enterprise: "$100-500/month",
    },
    low: {
      hobby: "$10-30/month",
      startup: "$30-100/month",
      growth: "$100-300/month",
      enterprise: "$300-1000/month",
    },
    medium: {
      hobby: "$30-50/month",
      startup: "$50-200/month",
      growth: "$200-500/month",
      enterprise: "$500-2000/month",
    },
    high: {
      hobby: "$50-100/month",
      startup: "$100-500/month",
      growth: "$500-2000/month",
      enterprise: "$2000-10000/month",
    },
    enterprise: {
      hobby: "$100+/month",
      startup: "$500+/month",
      growth: "$2000+/month",
      enterprise: "$10000+/month",
    },
  };

  return costs[budget]?.[scale] || "$50-200/month";
}
