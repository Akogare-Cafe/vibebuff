"use client";

import Link from "next/link";
import { Sparkles, Wrench, ArrowRight, Layers } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";

export function BlogPromoSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PixelCard className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
        <PixelCardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-3 border border-primary/30">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-primary text-sm font-semibold">
                AI STACK BUILDER
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Get personalized tech stack recommendations powered by AI. Answer a few questions and receive the perfect tools for your project.
              </p>
              <Link href="/">
                <PixelButton size="sm" className="flex items-center gap-2">
                  Build Stack
                  <ArrowRight className="w-3 h-3" />
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelCardContent>
      </PixelCard>

      <PixelCard className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
        <PixelCardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-3 border border-primary/30">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-primary text-sm font-semibold">
                EXPLORE 500+ TOOLS
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Browse our comprehensive database of developer tools. Compare features, read reviews, and find the right tools for your needs.
              </p>
              <Link href="/tools">
                <PixelButton size="sm" variant="secondary" className="flex items-center gap-2">
                  Browse Tools
                  <ArrowRight className="w-3 h-3" />
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelCardContent>
      </PixelCard>

      <PixelCard className="bg-gradient-to-br from-primary/10 to-background border-primary/30 md:col-span-2">
        <PixelCardContent className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="bg-primary/20 p-3 border border-primary/30">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-primary text-sm font-semibold">
                COMMUNITY STACKS
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Discover proven tech stacks from developers worldwide. See what others are building with and get inspired for your next project.
              </p>
            </div>
            <Link href="/stacks">
              <PixelButton size="sm" variant="secondary" className="flex items-center gap-2 w-full md:w-auto">
                View Stacks
                <ArrowRight className="w-3 h-3" />
              </PixelButton>
            </Link>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
