import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tools: toolSlugs } = body;

    if (!toolSlugs || toolSlugs.length < 2 || toolSlugs.length > 4) {
      return NextResponse.json(
        { error: "Please provide 2-4 tool slugs to compare" },
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
          name: slug,
          found: false,
          error: `Tool "${slug}" not found`,
        };
      }

      return {
        slug: tool.slug,
        name: tool.name,
        found: true,
        tagline: tool.tagline || "",
        category: tool.categoryId ? categoryMap.get(tool.categoryId) : "Other",
        pricing: tool.pricingModel || "Unknown",
        rarity: "common",
        stats: tool.stats || { hp: 0, attack: 0, defense: 0, speed: 0, mana: 0 },
        pros: tool.pros || [],
        cons: tool.cons || [],
        features: tool.features || [],
        scores: {
          performance: Math.round((tool.stats?.speed || 5) * 10) / 10,
          dx: Math.round((tool.stats?.mana || 5) * 10) / 10,
          ecosystem: Math.round((tool.stats?.hp || 5) * 10) / 10,
          learning: Math.round((10 - (tool.stats?.defense || 5)) * 10) / 10,
        },
      };
    });

    const foundTools = toolsToCompare.filter((t: { found: boolean }) => t.found);
    
    let recommendation = "";
    if (foundTools.length >= 2) {
      const sorted = [...foundTools].sort((a, b) => {
        const aTotal = Object.values(a.scores as Record<string, number>).reduce((sum, v) => sum + v, 0);
        const bTotal = Object.values(b.scores as Record<string, number>).reduce((sum, v) => sum + v, 0);
        return bTotal - aTotal;
      });
      recommendation = `Based on overall scores, ${sorted[0].name} is recommended. However, the best choice depends on your specific needs - consider the pros/cons and feature differences.`;
    }

    return NextResponse.json({
      tools: toolsToCompare,
      recommendation,
      comparisonDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("MCP compare error:", error);
    return NextResponse.json(
      { error: "Failed to compare tools" },
      { status: 500 }
    );
  }
}
