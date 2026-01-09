import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const categories = await convex.query(api.categories.list, {});
    const tools = await convex.query(api.tools.list, {});

    const categoriesWithCounts = categories.map(
      (category: {
        _id: string;
        name: string;
        slug: string;
        description?: string;
        icon?: string;
      }) => {
        const toolCount = tools.filter(
          (t: { categoryId: string }) => t.categoryId === category._id
        ).length;

        const categoryTools = tools
          .filter((t: { categoryId: string }) => t.categoryId === category._id)
          .slice(0, 5)
          .map((t: { name: string; slug: string }) => ({
            name: t.name,
            slug: t.slug,
          }));

        return {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || null,
          icon: category.icon || null,
          toolCount,
          popularTools: categoryTools,
          url: `https://vibebuff.dev/tools?category=${category.slug}`,
        };
      }
    );

    return NextResponse.json({
      count: categoriesWithCounts.length,
      categories: categoriesWithCounts,
      _meta: {
        source: "VibeBuff",
        description: "Developer tool categories",
      },
    });
  } catch (error) {
    console.error("AI categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
