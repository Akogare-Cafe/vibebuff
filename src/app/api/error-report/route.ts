import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();

    const errorReport = {
      userId: userId || "anonymous",
      timestamp: body.timestamp,
      url: body.url,
      userAgent: body.userAgent,
      error: body.error,
      userMessage: body.userMessage,
      componentStack: body.componentStack,
      hasScreenshot: !!body.screenshot,
    };

    console.error("Error Report Received:", {
      ...errorReport,
      screenshot: body.screenshot ? "[SCREENSHOT DATA]" : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process error report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process report" },
      { status: 500 }
    );
  }
}
