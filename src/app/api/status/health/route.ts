import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  const endpoints = [
    { name: "MCP Search", path: "/api/mcp/search" },
    { name: "MCP Tools", path: "/api/mcp/tools/[slug]" },
    { name: "MCP Categories", path: "/api/mcp/categories" },
    { name: "MCP Compare", path: "/api/mcp/compare" },
    { name: "MCP Recommend", path: "/api/mcp/recommend" },
    { name: "MCP Templates", path: "/api/mcp/templates" },
  ];

  const startTime = Date.now();
  
  try {
    await convex.query(api.tools.list, {});
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: "healthy",
      responseTime,
      endpoints: endpoints.map(ep => ({
        ...ep,
        status: "operational",
      })),
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      endpoints: endpoints.map(ep => ({
        ...ep,
        status: "down",
      })),
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    });
  }
}
