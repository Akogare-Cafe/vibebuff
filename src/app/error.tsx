"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelCard className="max-w-2xl w-full">
        <div className="flex flex-col items-center text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <AlertTriangle className="w-20 h-20 text-red-500 relative z-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-500">
              Oops! Something broke
            </h1>
            <p className="text-lg text-muted-foreground">
              We encountered an unexpected error. Your data is safe.
            </p>
          </div>

          {isDev && (
            <div className="w-full bg-red-950/20 border border-red-500/30 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2 mb-2">
                <Bug className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-red-400 break-words">
                    {error.name}: {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-300/50 mt-1">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              </div>
              {error.stack && (
                <pre className="text-xs text-red-300/70 overflow-x-auto mt-2 whitespace-pre-wrap break-words max-h-64">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <PixelButton onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </PixelButton>
            <PixelButton
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}
