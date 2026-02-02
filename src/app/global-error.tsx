"use client";

import { captureException } from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card border-2 border-red-500/50 rounded-lg shadow-lg">
            <div className="flex flex-col items-center text-center space-y-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <AlertTriangle className="w-20 h-20 text-red-500 relative z-10" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-red-500">
                  Critical Error
                </h1>
                <p className="text-lg text-muted-foreground">
                  A critical error occurred. Please refresh the page.
                </p>
              </div>

              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
