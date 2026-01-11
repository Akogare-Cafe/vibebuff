import { NextResponse } from "next/server";

export async function GET() {
  const configured = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    configured,
    timestamp: Date.now(),
  });
}
