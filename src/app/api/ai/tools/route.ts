import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "100");

    const tools = await convex.query(api.tools.list, {
      categorySlug: category || undefined,
      limit: Math.min(limit, 500),
    });

    const categories = await convex.query(api.categories.list, {});
    const categoryMap = new Map(
      categories.map((c: { _id: string; name: string; slug: string }) => [
        c._id,
        { name: c.name, slug: c.slug },
      ])
    );

    const formattedTools = tools.map(
      (tool: {
        _id: string;
        name: string;
        slug: string;
        tagline: string;
        description: string;
        categoryId: string;
        pricingModel: string;
        isOpenSource: boolean;
        tags: string[];
        websiteUrl: string;
        githubUrl?: string;
      }) => ({
        id: tool._id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        description: tool.description,
        category: categoryMap.get(tool.categoryId)?.name || "Other",
        categorySlug: categoryMap.get(tool.categoryId)?.slug || "other",
        pricing: tool.pricingModel,
        isOpenSource: tool.isOpenSource,
        tags: tool.tags,
        website: tool.websiteUrl,
        github: tool.githubUrl || null,
        url: `https://vibebuff.dev/tools/${tool.slug}`,
      })
    );

    return NextResponse.json({
      count: formattedTools.length,
      tools: formattedTools,
      categories: categories.map((c: { name: string; slug: string }) => ({
        name: c.name,
        slug: c.slug,
      })),
      _meta: {
        source: "VibeBuff",
        description: "AI-powered tech stack recommendations",
        documentation: "https://vibebuff.dev/llms.txt",
      },
    });
  } catch (error) {
    console.error("AI tools API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}
