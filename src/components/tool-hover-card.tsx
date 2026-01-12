"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Star, Download, Package, Unlock } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PixelBadge } from "@/components/pixel-badge";

interface ToolHoverCardProps {
  slug: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolHoverCard({ slug, children, className }: ToolHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toolPreview = useQuery(
    api.tools.getToolPreview,
    isOpen ? { slug } : "skip"
  );

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <Link
          href={`/tools/${slug}`}
          className={className}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="w-80 p-0 bg-card border-2 border-border"
        sideOffset={8}
      >
        {toolPreview ? (
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="size-12 bg-background border-2 border-border flex items-center justify-center shrink-0 overflow-hidden">
                {toolPreview.logoUrl ? (
                  <img
                    src={toolPreview.logoUrl}
                    alt={`${toolPreview.name} logo`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-primary font-bold text-sm mb-1 truncate">
                  {toolPreview.name}
                </h4>
                <p className="text-muted-foreground text-xs line-clamp-2">
                  {toolPreview.tagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <PixelBadge variant="outline" className="text-[10px] px-1.5 py-0.5">
                {toolPreview.pricingModel === "free"
                  ? "FREE"
                  : toolPreview.pricingModel === "freemium"
                  ? "FREEMIUM"
                  : toolPreview.pricingModel === "open_source"
                  ? "OSS"
                  : toolPreview.pricingModel === "enterprise"
                  ? "ENTERPRISE"
                  : "PAID"}
              </PixelBadge>
              {toolPreview.isOpenSource && (
                <PixelBadge variant="secondary" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                  <Unlock className="w-2.5 h-2.5" /> OPEN SOURCE
                </PixelBadge>
              )}
              {toolPreview.isFeatured && (
                <PixelBadge variant="default" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> FEATURED
                </PixelBadge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {toolPreview.githubStars !== undefined && toolPreview.githubStars > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="w-3.5 h-3.5" />
                  <span>
                    {toolPreview.githubStars >= 1000
                      ? `${(toolPreview.githubStars / 1000).toFixed(1)}K`
                      : toolPreview.githubStars}{" "}
                    stars
                  </span>
                </div>
              )}
              {toolPreview.npmDownloadsWeekly !== undefined && toolPreview.npmDownloadsWeekly > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {toolPreview.npmDownloadsWeekly >= 1000000
                      ? `${(toolPreview.npmDownloadsWeekly / 1000000).toFixed(1)}M`
                      : toolPreview.npmDownloadsWeekly >= 1000
                      ? `${(toolPreview.npmDownloadsWeekly / 1000).toFixed(0)}K`
                      : toolPreview.npmDownloadsWeekly}{" "}
                    /week
                  </span>
                </div>
              )}
              {toolPreview.category && (
                <div className="col-span-2 text-muted-foreground text-[10px] mt-1">
                  Category: {toolPreview.category.name}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs">
            Loading...
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
