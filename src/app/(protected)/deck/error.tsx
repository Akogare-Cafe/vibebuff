"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Layers } from "lucide-react";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";

export default function DeckError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Deck page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <PixelCard className="max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6 p-8">
          <div className="relative">
            <Layers className="w-16 h-16 text-red-500" />
            <AlertTriangle className="w-8 h-8 text-red-500 absolute -bottom-1 -right-1" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-500">
              Deck Error
            </h2>
            <p className="text-muted-foreground">
              We couldn&apos;t load your deck. Please try again.
            </p>
          </div>

          <div className="flex gap-3">
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
