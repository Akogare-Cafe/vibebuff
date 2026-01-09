import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
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

    const categoryMap = new Map(
      categories.map((c: { _id: string; name: string }) => [c._id, c.name])
    );

    const toolsToCompare = toolSlugs.map((slug: string) => {
      const tool = allTools.find((t: { slug: string }) => t.slug === slug);
      if (!tool) {
        return {
          slug,
          found: false,
          error: `Tool "${slug}" not found`,
        };
      }

      return {
        slug: tool.slug,
        name: tool.name,
        found: true,
        tagline: tool.tagline,
        description: tool.description,
        category: tool.categoryId ? categoryMap.get(tool.categoryId) : "Other",
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

    const foundTools = toolsToCompare.filter(
      (t: { found: boolean }) => t.found
    );
    const notFoundTools = toolsToCompare.filter(
      (t: { found: boolean }) => !t.found
    );

    let summary = "";
    if (foundTools.length >= 2) {
      const toolNames = foundTools.map((t: { name: string }) => t.name);
      summary = `Comparison of ${toolNames.join(" vs ")}. `;

      const categories = [
        ...new Set(foundTools.map((t: { category: string }) => t.category)),
      ];
      if (categories.length === 1) {
        summary += `All tools are in the ${categories[0]} category. `;
      }

      const openSource = foundTools.filter(
        (t: { isOpenSource: boolean }) => t.isOpenSource
      );
      if (openSource.length === foundTools.length) {
        summary += "All tools are open source.";
      } else if (openSource.length > 0) {
        summary += `${openSource.map((t: { name: string }) => t.name).join(", ")} ${openSource.length === 1 ? "is" : "are"} open source.`;
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
