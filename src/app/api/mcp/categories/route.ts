import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { includeTools = false } = body;

    const categories = await convex.query(api.categories.list, {});
    
    let result;
    
    if (includeTools) {
      const tools = await convex.query(api.tools.list, {});
      
      const toolCountByCategory = new Map<string, number>();
      for (const tool of tools) {
        if (tool.categoryId) {
          const count = toolCountByCategory.get(tool.categoryId) || 0;
          toolCountByCategory.set(tool.categoryId, count + 1);
        }
      }

      result = categories.map((cat: { _id: string; name: string; slug: string; description?: string }) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        toolCount: toolCountByCategory.get(cat._id) || 0,
      }));
    } else {
      result = categories.map((cat: { _id: string; name: string; slug: string; description?: string }) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
      }));
    }

    return NextResponse.json({
      categories: result,
      total: result.length,
    });
  } catch (error) {
    console.error("MCP categories error:", error);
    return NextResponse.json(
      { error: "Failed to get categories" },
      { status: 500 }
    );
  }
}
