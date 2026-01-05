import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { validateApiKey, unauthorizedResponse } from "@/lib/api-auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }
  
  try {
    const { slug } = await params;
    
    const tool = await convex.query(api.tools.getBySlug, { slug });

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    const categories = await convex.query(api.categories.list, {});
    const category = tool.categoryId 
      ? categories.find((c: { _id: string }) => c._id === tool.categoryId)
      : null;

    const allTools = await convex.query(api.tools.list, {});
    const alternatives = allTools
      .filter((t: { _id: string; categoryId?: string }) => 
        t.categoryId === tool.categoryId && t._id !== tool._id
      )
      .slice(0, 5)
      .map((t: { name: string; slug: string }) => ({ name: t.name, slug: t.slug }));

    return NextResponse.json({
      id: tool._id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline || "",
      description: tool.description || "",
      category: category?.name || "Other",
      categorySlug: category?.slug || "other",
      pricing: tool.pricingModel || "Unknown",
      rarity: "common",
      stats: tool.stats || null,
      pros: tool.pros || [],
      cons: tool.cons || [],
      features: tool.features || [],
      website: tool.websiteUrl || "",
      github: tool.githubUrl || "",
      logo: tool.logoUrl || "",
      alternatives,
    });
  } catch (error) {
    console.error("MCP tool details error:", error);
    return NextResponse.json(
      { error: "Failed to get tool details" },
      { status: 500 }
    );
  }
}
