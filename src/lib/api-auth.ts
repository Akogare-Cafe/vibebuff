import { NextRequest, NextResponse } from "next/server";

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  const expectedKey = process.env.MCP_API_KEY;
  
  if (!expectedKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error("MCP_API_KEY not configured in production - blocking all requests");
      return false;
    }
    console.warn("MCP_API_KEY not configured - API endpoints unprotected in development");
    return true;
  }
  
  return apiKey === expectedKey;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized - Invalid or missing API key" },
    { status: 401 }
  );
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests - Please try again later" },
    { status: 429 }
  );
}
