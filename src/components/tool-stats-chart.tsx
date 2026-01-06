"use client";

import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { BarChart3, TrendingUp, Eye, MousePointer, Heart, Swords, GitCompare, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolStatsChartProps {
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    mana: number;
  };
  className?: string;
}

export function ToolStatsRadar({ stats, className }: ToolStatsChartProps) {
  if (!stats) return null;

  const maxStat = 100;
  const statItems = [
    { name: "HP", value: stats.hp, color: "bg-red-500" },
    { name: "ATK", value: stats.attack, color: "bg-orange-500" },
    { name: "DEF", value: stats.defense, color: "bg-blue-500" },
    { name: "SPD", value: stats.speed, color: "bg-green-500" },
    { name: "MANA", value: stats.mana, color: "bg-purple-500" },
  ];

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> POWER STATS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="space-y-3">
          {statItems.map((stat) => (
            <div key={stat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{stat.name}</span>
                <span className="text-primary font-mono">{stat.value}</span>
              </div>
              <div className="h-3 bg-[#0a0f1a] border-2 border-border relative overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500", stat.color)}
                  style={{ width: `${Math.min((stat.value / maxStat) * 100, 100)}%` }}
                />
                {[25, 50, 75].map((mark) => (
                  <div
                    key={mark}
                    className="absolute top-0 bottom-0 w-px bg-border/50"
                    style={{ left: `${mark}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs">TOTAL POWER</span>
            <span className="text-primary text-lg font-mono">
              {stats.hp + stats.attack + stats.defense + stats.speed + stats.mana}
            </span>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

interface PopularityChartProps {
  popularity: {
    views: number;
    clicks: number;
    favorites: number;
    deckAdds: number;
    battlePicks: number;
    comparisons: number;
    trendScore: number;
    weeklyViews: number;
    weeklyClicks: number;
  };
  className?: string;
}

export function PopularityChart({ popularity, className }: PopularityChartProps) {
  const maxValue = Math.max(
    popularity.views,
    popularity.clicks * 5,
    popularity.favorites * 10,
    popularity.deckAdds * 10,
    1
  );

  const metrics = [
    { name: "VIEWS", value: popularity.views, icon: Eye, color: "bg-cyan-500" },
    { name: "CLICKS", value: popularity.clicks, icon: MousePointer, color: "bg-green-500" },
    { name: "FAVORITES", value: popularity.favorites, icon: Heart, color: "bg-pink-500" },
    { name: "DECK ADDS", value: popularity.deckAdds, icon: BarChart3, color: "bg-yellow-500" },
    { name: "BATTLES", value: popularity.battlePicks, icon: Swords, color: "bg-red-500" },
    { name: "COMPARES", value: popularity.comparisons, icon: GitCompare, color: "bg-purple-500" },
  ];

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> ENGAGEMENT STATS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground text-[10px]">{metric.name}</span>
                </div>
                <p className="text-primary text-lg font-mono">
                  {metric.value >= 1000000
                    ? `${(metric.value / 1000000).toFixed(1)}M`
                    : metric.value >= 1000
                    ? `${(metric.value / 1000).toFixed(1)}K`
                    : metric.value}
                </p>
                <div className="h-1 bg-[#0a0f1a] border border-border mt-1">
                  <div
                    className={cn("h-full", metric.color)}
                    style={{ width: `${Math.min((metric.value / maxValue) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-muted-foreground text-xs">TREND SCORE</span>
            </div>
            <span className="text-green-400 text-xl font-mono">{popularity.trendScore}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="text-center p-2 bg-[#0a0f1a] border border-border">
              <p className="text-muted-foreground text-[10px]">WEEKLY VIEWS</p>
              <p className="text-primary font-mono">{popularity.weeklyViews}</p>
            </div>
            <div className="text-center p-2 bg-[#0a0f1a] border border-border">
              <p className="text-muted-foreground text-[10px]">WEEKLY CLICKS</p>
              <p className="text-primary font-mono">{popularity.weeklyClicks}</p>
            </div>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

interface RatingDisplayProps {
  rating: {
    averageRating: number;
    totalReviews: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
    shippedCount: number;
  };
  className?: string;
}

export function RatingDisplay({ rating, className }: RatingDisplayProps) {
  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> COMMUNITY RATING
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-primary text-4xl font-mono">{rating.averageRating.toFixed(1)}</p>
            <p className="text-muted-foreground text-xs mt-1">{rating.totalReviews} REVIEWS</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = rating.distribution[star as keyof typeof rating.distribution];
              const percent = rating.totalReviews > 0 ? (count / rating.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-yellow-400 text-xs w-3">{star}</span>
                  <div className="flex-1 h-2 bg-[#0a0f1a] border border-border">
                    <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-muted-foreground text-xs w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {rating.shippedCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border text-center">
            <p className="text-green-400 text-sm">
              <span className="text-2xl font-mono">{rating.shippedCount}</span> devs shipped with this tool
            </p>
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  );
}
