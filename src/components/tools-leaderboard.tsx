"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
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
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "stars" | "downloads" | "trending" | "favorites" | "usage";

const sortOptions: { 
  value: SortOption; 
  label: string; 
  icon: React.ReactNode;
  getStatValue: (tool: any) => { icon: React.ReactNode; value: string; color: string };
}[] = [
  { 
    value: "stars", 
    label: "GitHub Stars", 
    icon: <Star className="w-5 h-5 text-yellow-400" />,
    getStatValue: (tool) => ({
      icon: <Star className="w-4 h-4" />,
      value: formatNumber(tool.githubStars),
      color: "text-yellow-400"
    })
  },
  { 
    value: "downloads", 
    label: "NPM Downloads", 
    icon: <Download className="w-5 h-5 text-green-400" />,
    getStatValue: (tool) => ({
      icon: <Download className="w-4 h-4" />,
      value: `${formatNumber(tool.npmDownloadsWeekly)}/wk`,
      color: "text-green-400"
    })
  },
  { 
    value: "trending", 
    label: "Trending", 
    icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
    getStatValue: (tool) => ({
      icon: <TrendingUp className="w-4 h-4" />,
      value: formatNumber(tool.stats.trendScore),
      color: "text-purple-400"
    })
  },
  { 
    value: "favorites", 
    label: "Most Favorited", 
    icon: <Heart className="w-5 h-5 text-red-400" />,
    getStatValue: (tool) => ({
      icon: <Heart className="w-4 h-4" />,
      value: formatNumber(tool.stats.favorites),
      color: "text-red-400"
    })
  },
  { 
    value: "usage", 
    label: "Most Viewed", 
    icon: <Eye className="w-5 h-5 text-blue-400" />,
    getStatValue: (tool) => ({
      icon: <Eye className="w-4 h-4" />,
      value: formatNumber(tool.stats.views),
      color: "text-blue-400"
    })
  },
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

export function ToolsLeaderboard({ limit = 10, showFilters = false, compact = false }: ToolsLeaderboardProps) {
  const starsTools = useQuery(api.toolsLeaderboard.getToolsLeaderboard, { sortBy: "stars", limit });
  const downloadsTools = useQuery(api.toolsLeaderboard.getToolsLeaderboard, { sortBy: "downloads", limit });
  const trendingTools = useQuery(api.toolsLeaderboard.getToolsLeaderboard, { sortBy: "trending", limit });
  const favoritesTools = useQuery(api.toolsLeaderboard.getToolsLeaderboard, { sortBy: "favorites", limit });
  const usageTools = useQuery(api.toolsLeaderboard.getToolsLeaderboard, { sortBy: "usage", limit });

  const toolsDataMap: Record<SortOption, typeof starsTools> = {
    stars: starsTools,
    downloads: downloadsTools,
    trending: trendingTools,
    favorites: favoritesTools,
    usage: usageTools,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {sortOptions.map((option) => {
        const tools = toolsDataMap[option.value];
        return (
          <PixelCard key={option.value}>
            <PixelCardHeader className="pb-2">
              <PixelCardTitle className="flex items-center gap-2 text-base">
                {option.icon}
                {option.label}
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent className="p-0">
              <div className="divide-y divide-border">
                {!tools && (
                  <div className="p-6 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50 animate-pulse" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  </div>
                )}
                {tools?.length === 0 && (
                  <div className="p-6 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">No tools yet</p>
                  </div>
                )}
                {tools?.map((tool, index) => {
                  const stat = option.getStatValue(tool);
                  return (
                    <Link key={tool._id} href={`/tools/${tool.slug}`}>
                      <div className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors">
                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                          {index === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> :
                           index === 1 ? <Medal className="w-5 h-5 text-gray-300" /> :
                           index === 2 ? <Award className="w-5 h-5 text-amber-600" /> :
                           <span className="text-muted-foreground text-xs font-mono">#{tool.rank}</span>}
                        </div>
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 border border-border">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{tool.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={cn("flex items-center gap-1", stat.color)}>
                            {stat.icon}
                            <span className="font-mono text-xs">{stat.value}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </PixelCardContent>
          </PixelCard>
        );
      })}
    </div>
  );
}
