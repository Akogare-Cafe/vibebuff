"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import {
  Trophy,
  Star,
  Download,
  TrendingUp,
  Heart,
  Eye,
  Crown,
  Medal,
  Award,
  ChevronDown,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "stars" | "downloads" | "trending" | "favorites" | "usage";

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "stars", label: "GitHub Stars", icon: <Star className="w-4 h-4" /> },
  { value: "downloads", label: "NPM Downloads", icon: <Download className="w-4 h-4" /> },
  { value: "trending", label: "Trending", icon: <TrendingUp className="w-4 h-4" /> },
  { value: "favorites", label: "Most Favorited", icon: <Heart className="w-4 h-4" /> },
  { value: "usage", label: "Most Viewed", icon: <Eye className="w-4 h-4" /> },
];

const pricingColors: Record<string, string> = {
  free: "text-green-400 bg-green-500/20",
  freemium: "text-blue-400 bg-blue-500/20",
  paid: "text-yellow-400 bg-yellow-500/20",
  open_source: "text-purple-400 bg-purple-500/20",
  enterprise: "text-orange-400 bg-orange-500/20",
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
}

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50";
  if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-transparent border-amber-600/50";
  return "border-border";
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

interface ToolsLeaderboardProps {
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export function ToolsLeaderboard({ limit = 25, showFilters = true, compact = false }: ToolsLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortOption>("stars");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tools = useQuery(api.toolsLeaderboard.getToolsLeaderboard, {
    sortBy,
    limit,
  });

  const currentSort = sortOptions.find((o) => o.value === sortBy);

  if (!tools) {
    return (
      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tools Leaderboard
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </PixelCardContent>
      </PixelCard>
    );
  }

  return (
    <PixelCard>
      <PixelCardHeader>
        <div className="flex items-center justify-between">
          <PixelCardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tools Leaderboard
          </PixelCardTitle>
          {showFilters && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {currentSort?.icon}
                <span className="hidden sm:inline">{currentSort?.label}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[180px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg",
                        sortBy === option.value && "text-primary bg-primary/10"
                      )}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PixelCardHeader>
      <PixelCardContent className="p-0">
        <div className="divide-y divide-border">
          {tools.map((tool, index) => (
            <motion.div
              key={tool._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/tools/${tool.slug}`}>
                <div
                  className={cn(
                    "flex items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer border-l-2",
                    getRankStyle(tool.rank)
                  )}
                >
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {getRankIcon(tool.rank) || (
                      <span className="text-muted-foreground font-mono text-sm">#{tool.rank}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 border border-border">
                    {tool.logoUrl ? (
                      <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Package className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{tool.name}</span>
                      {tool.pricingModel && (
                        <PixelBadge
                          className={cn("text-[10px] hidden sm:inline-flex", pricingColors[tool.pricingModel])}
                        >
                          {tool.pricingModel === "open_source" ? "OSS" : tool.pricingModel.toUpperCase()}
                        </PixelBadge>
                      )}
                    </div>
                    {!compact && (
                      <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {sortBy === "stars" && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="font-mono text-sm">{formatNumber(tool.githubStars)}</span>
                      </div>
                    )}
                    {sortBy === "downloads" && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Download className="w-4 h-4" />
                        <span className="font-mono text-sm">{formatNumber(tool.npmDownloadsWeekly)}/wk</span>
                      </div>
                    )}
                    {sortBy === "trending" && (
                      <div className="flex items-center gap-1 text-purple-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-mono text-sm">{formatNumber(tool.stats.trendScore)}</span>
                      </div>
                    )}
                    {sortBy === "favorites" && (
                      <div className="flex items-center gap-1 text-red-400">
                        <Heart className="w-4 h-4" />
                        <span className="font-mono text-sm">{formatNumber(tool.stats.favorites)}</span>
                      </div>
                    )}
                    {sortBy === "usage" && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Eye className="w-4 h-4" />
                        <span className="font-mono text-sm">{formatNumber(tool.stats.views)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
