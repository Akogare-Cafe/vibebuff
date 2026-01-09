"use client";

import Link from "next/link";
import { Terminal, Zap, Users, Database, ArrowRight, Sparkles, Code2 } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { cn } from "@/lib/utils";

interface McpPromoCardProps {
  variant?: "default" | "compact" | "sidebar";
  className?: string;
}

export function McpPromoCard({ variant = "default", className }: McpPromoCardProps) {
  if (variant === "compact") {
    return (
      <PixelCard className={cn("bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30", className)}>
        <PixelCardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-primary text-sm font-medium">VibeBuff MCP</p>
              <p className="text-muted-foreground text-xs">AI assistant integration</p>
            </div>
            <Link href="/mcp">
              <PixelButton size="sm" variant="secondary">
                <ArrowRight className="w-3 h-3" />
              </PixelButton>
            </Link>
          </div>
        </PixelCardContent>
      </PixelCard>
    );
  }

  if (variant === "sidebar") {
    return (
      <PixelCard className={cn("bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30", className)}>
        <PixelCardContent className="py-5 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <span className="text-primary text-sm font-semibold">MCP SERVER</span>
            <PixelBadge variant="default" className="text-[10px] px-1.5 py-0.5">NEW</PixelBadge>
          </div>
          
          <p className="text-muted-foreground text-xs leading-relaxed">
            Access VibeBuff tools directly in your AI coding assistant. Get stack recommendations without leaving your IDE.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Code2 className="w-3 h-3 text-purple-400" />
              <span>Works with Cursor, Claude, Windsurf</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="w-3 h-3 text-purple-400" />
              <span>500+ tools at your fingertips</span>
            </div>
          </div>

          <Link href="/mcp" className="block">
            <PixelButton size="sm" className="w-full flex items-center justify-center gap-2">
              <Zap className="w-3 h-3" />
              Learn More
            </PixelButton>
          </Link>
        </PixelCardContent>
      </PixelCard>
    );
  }

  return (
    <PixelCard className={cn("bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-background border-purple-500/30 overflow-hidden relative", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl" />
      
      <PixelCardContent className="py-6 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-shrink-0">
            <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-400/30">
              <Terminal className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-primary text-lg font-semibold">VibeBuff MCP Server</h3>
              <PixelBadge variant="default">NEW</PixelBadge>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              Supercharge your AI coding assistant with direct access to 500+ developer tools, 
              community stack recommendations, and real-time comparisons. Works with Cursor, Claude, and Windsurf.
            </p>

            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>500+ Tools</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Community Stacks</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Recommendations</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <Link href="/mcp">
              <PixelButton className="w-full md:w-auto flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Get Started
                <ArrowRight className="w-4 h-4" />
              </PixelButton>
            </Link>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
