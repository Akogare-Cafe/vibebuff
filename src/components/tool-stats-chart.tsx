"use client";

import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { BarChart3, TrendingUp, Eye, MousePointer, Heart, Swords, GitCompare, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

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

  const radarData = [
    { stat: "HP", value: stats.hp, fullMark: 100 },
    { stat: "ATK", value: stats.attack, fullMark: 100 },
    { stat: "DEF", value: stats.defense, fullMark: 100 },
    { stat: "SPD", value: stats.speed, fullMark: 100 },
    { stat: "MANA", value: stats.mana, fullMark: 100 },
  ];

  const barData = [
    { name: "HP", value: stats.hp, fill: STAT_COLORS.HP },
    { name: "ATK", value: stats.attack, fill: STAT_COLORS.ATK },
    { name: "DEF", value: stats.defense, fill: STAT_COLORS.DEF },
    { name: "SPD", value: stats.speed, fill: STAT_COLORS.SPD },
    { name: "MANA", value: stats.mana, fill: STAT_COLORS.MANA },
  ];

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> POWER STATS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#6b7280", fontSize: 9 }}
              />
              <Radar
                name="Stats"
                dataKey="value"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                  color: "#22c55e",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={{ stroke: "#374151" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "#374151" }} width={45} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                }}
                formatter={(value) => [`${value}`, "Power"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
    { name: "Views", value: popularity.views, fill: ENGAGEMENT_COLORS[0] },
    { name: "Clicks", value: popularity.clicks, fill: ENGAGEMENT_COLORS[1] },
    { name: "Favorites", value: popularity.favorites, fill: ENGAGEMENT_COLORS[2] },
    { name: "Deck Adds", value: popularity.deckAdds, fill: ENGAGEMENT_COLORS[3] },
    { name: "Battles", value: popularity.battlePicks, fill: ENGAGEMENT_COLORS[4] },
    { name: "Compares", value: popularity.comparisons, fill: ENGAGEMENT_COLORS[5] },
  ];

  const weeklyData = [
    { name: "Views", value: popularity.weeklyViews, fill: "#06b6d4" },
    { name: "Clicks", value: popularity.weeklyClicks, fill: "#22c55e" },
  ];

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> ENGAGEMENT STATS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -10, right: 10 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 9 }}
                axisLine={{ stroke: "#374151" }}
                tickFormatter={(value) => value.length > 6 ? `${value.slice(0, 5)}..` : value}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={{ stroke: "#374151" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                }}
                formatter={(value) => [(value as number).toLocaleString(), ""]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-muted-foreground text-xs">TREND SCORE</span>
            </div>
            <span className="text-green-400 text-xl font-mono">{popularity.trendScore}</span>
          </div>
          <div className="h-24">
            <p className="text-muted-foreground text-[10px] mb-2 text-center">WEEKLY ACTIVITY</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={{ stroke: "#374151" }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "#374151" }} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0f1a",
                    border: "2px solid #374151",
                    borderRadius: 0,
                  }}
                  formatter={(value) => [(value as number).toLocaleString(), ""]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
    star: `${star}★`,
    count: rating.distribution[star as keyof typeof rating.distribution],
    fill: star >= 4 ? "#eab308" : star === 3 ? "#f97316" : "#ef4444",
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
          <div className="flex-1 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={{ stroke: "#374151" }} />
                <YAxis
                  type="category"
                  dataKey="star"
                  tick={{ fill: "#eab308", fontSize: 10 }}
                  axisLine={{ stroke: "#374151" }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0f1a",
                    border: "2px solid #374151",
                    borderRadius: 0,
                  }}
                  formatter={(value) => [`${value} reviews`, ""]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
