import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { rateLimit, createRateLimitResponse } from "@/lib/rate-limit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface FoundTool {
  slug: string;
  name: string;
  found: true;
  tagline: string;
  description: string;
  category: string;
  pricing: string;
  isOpenSource: boolean;
  pros: string[];
  cons: string[];
  features: string[];
  bestFor: string[];
  website: string;
  github: string | null;
}

interface NotFoundTool {
  slug: string;
  found: false;
  error: string;
}

type ToolCompareResult = FoundTool | NotFoundTool;

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, {
    maxRequests: 50,
    windowMs: 60000,
  });

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.resetAt);
  }

  try {
    const { searchParams } = new URL(request.url);
    const toolsParam = searchParams.get("tools");

    if (!toolsParam) {
      return NextResponse.json(
        {
          error: "Missing 'tools' parameter. Use ?tools=nextjs,remix",
          example: "/api/ai/compare?tools=nextjs,remix,sveltekit",
        },
        { status: 400 }
      );
    }

    const toolSlugs = toolsParam.split(",").map((s) => s.trim());

    if (toolSlugs.length < 2 || toolSlugs.length > 5) {
      return NextResponse.json(
        { error: "Please provide 2-5 tool slugs to compare" },
        { status: 400 }
      );
    }

    const allTools = await convex.query(api.tools.list, {});
    const categories = await convex.query(api.categories.list, {});

    const categoryMap = new Map<string, string>(
      categories.map((c: { _id: string; name: string }) => [c._id, c.name])
    );

    const toolsToCompare: ToolCompareResult[] = toolSlugs.map((slug: string): ToolCompareResult => {
      const tool = allTools.find((t: { slug: string }) => t.slug === slug);
      if (!tool) {
        return {
          slug,
          found: false,
          error: `Tool "${slug}" not found`,
        };
      }

      const categoryName = tool.categoryId ? categoryMap.get(tool.categoryId) : undefined;

      return {
        slug: tool.slug,
        name: tool.name,
        found: true,
        tagline: tool.tagline,
        description: tool.description,
        category: categoryName ?? "Other",
        pricing: tool.pricingModel,
        isOpenSource: tool.isOpenSource,
        pros: tool.pros,
        cons: tool.cons,
        features: tool.features,
        bestFor: tool.bestFor,
        website: tool.websiteUrl,
        github: tool.githubUrl || null,
      };
    });

    const foundTools = toolsToCompare.filter((t): t is FoundTool => t.found);
    const notFoundTools = toolsToCompare.filter((t): t is NotFoundTool => !t.found);

    let summary = "";
    if (foundTools.length >= 2) {
      const toolNames = foundTools.map((t) => t.name);
      summary = `Comparison of ${toolNames.join(" vs ")}. `;

      const uniqueCategories = [
        ...new Set(foundTools.map((t) => t.category)),
      ];
      if (uniqueCategories.length === 1) {
        summary += `All tools are in the ${uniqueCategories[0]} category. `;
      }

      const openSource = foundTools.filter((t) => t.isOpenSource);
      if (openSource.length === foundTools.length) {
        summary += "All tools are open source.";
      } else if (openSource.length > 0) {
        summary += `${openSource.map((t) => t.name).join(", ")} ${openSource.length === 1 ? "is" : "are"} open source.`;
      }
    }

    return NextResponse.json({
      query: toolSlugs,
      found: foundTools.length,
      notFound: notFoundTools,
      tools: foundTools,
      summary,
      compareUrl: `https://vibebuff.dev/compare?tools=${toolSlugs.join(",")}`,
      _meta: {
        source: "VibeBuff",
        description: "AI-powered tech stack recommendations",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI compare API error:", error);
    return NextResponse.json(
      { error: "Failed to compare tools" },
      { status: 500 }
    );
  }
}
