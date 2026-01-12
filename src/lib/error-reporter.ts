import { toPng } from "html-to-image";

export interface ErrorReport {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  screenshot?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  componentStack?: string;
}

export async function captureScreenshot(): Promise<string | null> {
  try {
    const body = document.body;
    const dataUrl = await toPng(body, {
      cacheBust: true,
      quality: 0.8,
      pixelRatio: 1,
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    return null;
  }
}

export async function createErrorReport(
  error: Error,
  componentStack?: string
): Promise<ErrorReport> {
  const screenshot = await captureScreenshot();
  
  return {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    screenshot: screenshot || undefined,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    componentStack,
  };
}

export async function submitErrorReport(
  report: ErrorReport,
  userMessage?: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/error-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...report,
        userMessage,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to submit error report:", error);
    return false;
  }
}
