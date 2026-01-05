import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, category, limit = 10 } = body;

    const tools = await convex.query(api.tools.list, {});
    const categories = await convex.query(api.categories.list, {});

    const categoryMap = new Map(
      categories.map((c: { _id: string; name: string; slug: string }) => [c._id, c])
    );

    const queryLower = query.toLowerCase();

    let filteredTools = tools.filter((tool: { name: string; tagline?: string; description?: string }) => {
      const nameMatch = tool.name.toLowerCase().includes(queryLower);
      const taglineMatch = tool.tagline?.toLowerCase().includes(queryLower);
      const descMatch = tool.description?.toLowerCase().includes(queryLower);
      return nameMatch || taglineMatch || descMatch;
    });

    if (category) {
      const categoryLower = category.toLowerCase();
      filteredTools = filteredTools.filter((tool: { categoryId?: string }) => {
        const toolCategory = tool.categoryId ? categoryMap.get(tool.categoryId) : null;
        return toolCategory?.name.toLowerCase().includes(categoryLower) ||
               toolCategory?.slug.toLowerCase().includes(categoryLower);
      });
    }

    const results = filteredTools.slice(0, limit).map((tool: {
      _id: string;
      name: string;
      slug: string;
      tagline?: string;
      categoryId?: string;
      pricingModel?: string;
    }) => {
      const toolCategory = tool.categoryId ? categoryMap.get(tool.categoryId) : null;
      return {
        id: tool._id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline || "",
        category: toolCategory?.name || "Other",
        pricing: tool.pricingModel || "Unknown",
      };
    });

    return NextResponse.json({
      tools: results,
      total: filteredTools.length,
      query,
      category: category || null,
    });
  } catch (error) {
    console.error("MCP search error:", error);
    return NextResponse.json(
      { error: "Failed to search tools" },
      { status: 500 }
    );
  }
}
