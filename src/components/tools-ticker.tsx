"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Star, Download, TrendingUp, Package, ExternalLink, Github, Globe, Calendar } from "lucide-react";
import { PixelBadge } from "@/components/pixel-badge";
import { useEffect, useRef, useState } from "react";

interface ToolTickerItem {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl?: string;
  pricingModel: string;
  githubStars?: number;
  npmDownloadsWeekly?: number;
  isOpenSource: boolean;
  category?: {
    name: string;
    slug: string;
    icon?: string;
  };
  websiteUrl: string;
  githubUrl?: string;
  _creationTime: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TickerItem({ tool }: { tool: ToolTickerItem }) {
  const isNew = Date.now() - tool._creationTime < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:border-primary hover:bg-card transition-all group min-w-[320px]">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {tool.logoUrl ? (
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Package className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/tools/${tool.slug}`}
            className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors"
          >
            {tool.name}
          </Link>
          {isNew && (
            <PixelBadge variant="default" className="text-[10px] px-1.5 py-0">
              NEW
            </PixelBadge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(tool._creationTime)}
          </span>
          {tool.category && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{tool.category.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs flex-shrink-0">
        {tool.githubStars && tool.githubStars > 0 && (
          <span className="flex items-center gap-1 text-primary">
            <Star className="w-3 h-3" />
            {formatNumber(tool.githubStars)}
          </span>
        )}
        {tool.githubUrl && (
          <a
            href={tool.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="View on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
        )}
        <a
          href={tool.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Visit website"
        >
          <Globe className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function ToolsTicker() {
  const tools = useQuery(api.tools.getLatestTools, { limit: 20 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !tools || tools.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += scrollSpeed;
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [tools, isPaused]);

  if (!tools || tools.length === 0) {
    return null;
  }

  const duplicatedTools = [...tools, ...tools];

  return (
    <div className="relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Live Feed
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span>Latest Tools</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-border via-primary/30 to-transparent" />
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTools.map((tool, index) => (
          <TickerItem key={`${tool._id}-${index}`} tool={tool} />
        ))}
      </div>

    </div>
  );
}
