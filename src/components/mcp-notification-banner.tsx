"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Terminal, Zap, ArrowRight } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vibebuff-mcp-banner-dismissed";

export function McpNotificationBanner() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900/90 via-purple-800/90 to-purple-900/90 border-b-2 border-purple-500/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
              <Terminal className="w-5 h-5 text-purple-300" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-purple-200 text-sm font-medium">NEW</span>
                <span className="text-white text-sm font-semibold">
                  VibeBuff MCP Server for AI Assistants
                </span>
                <span className="hidden sm:inline text-purple-300 text-sm">
                  - Access 500+ tools directly in Cursor, Claude & Windsurf
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/mcp">
              <PixelButton size="sm" className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">Learn More</span>
                <ArrowRight className="w-3 h-3" />
              </PixelButton>
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-1.5 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
