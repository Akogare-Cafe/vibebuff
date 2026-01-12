"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Star, Download, TrendingUp, Package, Github, Globe, Calendar, Settings2 } from "lucide-react";
import { PixelBadge } from "@/components/pixel-badge";
import { ToolIcon } from "@/components/dynamic-icon";
import { useState } from "react";

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
  releaseDate?: string | null;
  _creationTime: number;
}

type TickerDisplay = "stars" | "downloads" | "category" | "date";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string | number): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TickerItem({ tool, display }: { tool: ToolTickerItem; display: TickerDisplay[] }) {
  const isNew = Date.now() - tool._creationTime < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:border-primary hover:bg-card transition-all group min-w-[280px]">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {tool.logoUrl ? (
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <ToolIcon toolSlug={tool.slug} className="w-4 h-4 text-muted-foreground" />
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
          {display.includes("date") && tool.releaseDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(tool.releaseDate)}
            </span>
          )}
          {display.includes("category") && tool.category && (
            <>
              {display.includes("date") && tool.releaseDate && <span className="text-border">|</span>}
              <span className="truncate">{tool.category.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs flex-shrink-0">
        {display.includes("stars") && tool.githubStars && tool.githubStars > 0 && (
          <span className="flex items-center gap-1 text-primary">
            <Star className="w-3 h-3" />
            {formatNumber(tool.githubStars)}
          </span>
        )}
        {display.includes("downloads") && tool.npmDownloadsWeekly && tool.npmDownloadsWeekly > 0 && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Download className="w-3 h-3" />
            {formatNumber(tool.npmDownloadsWeekly)}
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
  const tools = useQuery(api.tools.getLatestTools, { 
    limit: 12,
    excludeCategories: ["mcp-servers"],
  });
  const [showSettings, setShowSettings] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<TickerDisplay[]>(["stars", "category"]);

  if (!tools || tools.length === 0) {
    return (
      <div className="h-[72px] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Loading tools...</span>
        </div>
      </div>
    );
  }

  const duplicatedTools = [...tools, ...tools];

  const toggleDisplay = (option: TickerDisplay) => {
    setDisplayOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3 px-4">
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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Configure display"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="flex items-center gap-4 mb-3 px-4 py-2 bg-muted/50 rounded-lg mx-4">
          <span className="text-xs text-muted-foreground">Show:</span>
          {(["stars", "downloads", "date", "category"] as TickerDisplay[]).map((option) => (
            <label key={option} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={displayOptions.includes(option)}
                onChange={() => toggleDisplay(option)}
                className="w-3 h-3 rounded border-border accent-primary"
              />
              <span className="text-muted-foreground capitalize">{option}</span>
            </label>
          ))}
        </div>
      )}

      <div className="overflow-hidden">
        <div className="flex gap-3 animate-ticker hover:[animation-play-state:paused]">
          {duplicatedTools.map((tool, index) => (
            <TickerItem key={`${tool._id}-${index}`} tool={tool} display={displayOptions} />
          ))}
        </div>
      </div>
    </div>
  );
}
