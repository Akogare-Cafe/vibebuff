"use client";

import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, BarList } from "@tremor/react";

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

const STAT_COLORS = {
  HP: "#ef4444",
  ATK: "#f97316",
  DEF: "#3b82f6",
  SPD: "#22c55e",
  MANA: "#a855f7",
};

export function ToolStatsRadar({ stats, className }: ToolStatsChartProps) {
  if (!stats) return null;

  const barListData = [
    { name: "HP", value: stats.hp, color: "red" },
    { name: "ATK", value: stats.attack, color: "orange" },
    { name: "DEF", value: stats.defense, color: "blue" },
    { name: "SPD", value: stats.speed, color: "green" },
    { name: "MANA", value: stats.mana, color: "purple" },
  ];

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> POWER STATS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="space-y-4">
          {barListData.map((stat) => (
            <div key={stat.name}>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground text-xs font-medium">{stat.name}</span>
                <span className="text-primary text-xs font-mono">{stat.value}/100</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    stat.color === "red" && "bg-red-500",
                    stat.color === "orange" && "bg-orange-500",
                    stat.color === "blue" && "bg-blue-500",
                    stat.color === "green" && "bg-green-500",
                    stat.color === "purple" && "bg-purple-500"
                  )}
                  style={{ width: `${stat.value}%` }}
                />
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

const ENGAGEMENT_COLORS = ["#06b6d4", "#22c55e", "#ec4899", "#eab308", "#ef4444", "#a855f7"];

export function PopularityChart({ popularity, className }: PopularityChartProps) {
  const chartData = [
    { name: "Views", value: popularity.views },
    { name: "Clicks", value: popularity.clicks },
    { name: "Favorites", value: popularity.favorites },
    { name: "Deck Adds", value: popularity.deckAdds },
    { name: "Battles", value: popularity.battlePicks },
    { name: "Compares", value: popularity.comparisons },
  ];

  const weeklyData = [
    { name: "Views", value: popularity.weeklyViews },
    { name: "Clicks", value: popularity.weeklyClicks },
  ];

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> ENGAGEMENT STATS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <BarChart
          className="h-48 mb-4"
          data={chartData}
          index="name"
          categories={["value"]}
          colors={["cyan", "green", "pink", "yellow", "red", "purple"]}
          valueFormatter={(value) => value.toLocaleString()}
          showLegend={false}
        />

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-muted-foreground text-xs">TREND SCORE</span>
            </div>
            <span className="text-green-400 text-xl font-mono">{popularity.trendScore}</span>
          </div>
          <div>
            <p className="text-muted-foreground text-[10px] mb-2 text-center">WEEKLY ACTIVITY</p>
            <BarList
              data={weeklyData}
              valueFormatter={(value: number) => value.toLocaleString()}
              color="cyan"
            />
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
  const distributionData = [5, 4, 3, 2, 1].map((star) => ({
    name: `${star}★`,
    value: rating.distribution[star as keyof typeof rating.distribution],
  }));

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> COMMUNITY RATING
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-primary text-4xl font-mono">{rating.averageRating.toFixed(1)}</p>
            <p className="text-muted-foreground text-xs mt-1">{rating.totalReviews} REVIEWS</p>
          </div>
          <div className="flex-1">
            <BarList
              data={distributionData}
              valueFormatter={(value: number) => `${value} reviews`}
              color="yellow"
            />
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
