import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const tool = await convex.query(api.tools.getBySlug, { slug });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const categories = await convex.query(api.categories.list, {});
    const category = tool.categoryId
      ? categories.find((c: { _id: string }) => c._id === tool.categoryId)
      : null;

    const allTools = await convex.query(api.tools.list, {});
    const alternatives = allTools
      .filter(
        (t: { _id: string; categoryId?: string }) =>
          t.categoryId === tool.categoryId && t._id !== tool._id
      )
      .slice(0, 5)
      .map((t: { name: string; slug: string; tagline: string }) => ({
        name: t.name,
        slug: t.slug,
        tagline: t.tagline,
        url: `https://vibebuff.dev/tools/${t.slug}`,
      }));

    return NextResponse.json({
      id: tool._id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline,
      description: tool.description,
      category: category?.name || "Other",
      categorySlug: category?.slug || "other",
      pricing: tool.pricingModel,
      isOpenSource: tool.isOpenSource,
      pros: tool.pros,
      cons: tool.cons,
      features: tool.features,
      bestFor: tool.bestFor,
      tags: tool.tags,
      website: tool.websiteUrl,
      github: tool.githubUrl || null,
      docs: tool.docsUrl || null,
      stats: tool.stats || null,
      alternatives,
      urls: {
        page: `https://vibebuff.dev/tools/${tool.slug}`,
        compare: `https://vibebuff.dev/compare?tools=${tool.slug}`,
      },
      _meta: {
        source: "VibeBuff",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI tool detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tool details" },
      { status: 500 }
    );
  }
}
