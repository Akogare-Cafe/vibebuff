"use client";

import { BarChart, DonutChart, AreaChart, BarList } from "@tremor/react";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { BarChart3, PieChart as PieChartIcon, Activity, TrendingUp } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  username?: string;
  xp?: number;
  battlesWon?: number;
  winRate?: number;
  decksCreated?: number;
  masteryXp?: number;
  questsCompleted?: number;
  toolsViewed?: number;
  votescast?: number;
}

interface XpDistributionChartProps {
  data: LeaderboardUser[] | undefined;
}

const CHART_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

export function XpDistributionChart({ data }: XpDistributionChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 10).map((user) => ({
    name: user.username || `User ${user.rank}`,
    "XP": user.xp || 0,
  }));

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> XP Distribution
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <BarChart
          className="h-64"
          data={chartData}
          index="name"
          categories={["XP"]}
          colors={["emerald"]}
          valueFormatter={(value) => `${value.toLocaleString()} XP`}
          layout="vertical"
          showLegend={false}
        />
      </PixelCardContent>
    </PixelCard>
  );
}

interface BattleStatsChartProps {
  data: LeaderboardUser[] | undefined;
}

export function BattleStatsChart({ data }: BattleStatsChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 8).map((user) => ({
    name: user.username || `User ${user.rank}`,
    "Battles Won": user.battlesWon || 0,
  }));

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> Battle Performance
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <AreaChart
          className="h-64"
          data={chartData}
          index="name"
          categories={["Battles Won"]}
          colors={["red"]}
          valueFormatter={(value) => `${value} wins`}
          showLegend={false}
        />
      </PixelCardContent>
    </PixelCard>
  );
}

interface ActivityBreakdownChartProps {
  xpData: LeaderboardUser[] | undefined;
  battlesData: LeaderboardUser[] | undefined;
  decksData: LeaderboardUser[] | undefined;
  questsData: LeaderboardUser[] | undefined;
}

export function ActivityBreakdownChart({ xpData, battlesData, decksData, questsData }: ActivityBreakdownChartProps) {
  const totalXp = xpData?.reduce((sum, u) => sum + (u.xp || 0), 0) || 0;
  const totalBattles = battlesData?.reduce((sum, u) => sum + (u.battlesWon || 0), 0) || 0;
  const totalDecks = decksData?.reduce((sum, u) => sum + (u.decksCreated || 0), 0) || 0;
  const totalQuests = questsData?.reduce((sum, u) => sum + (u.questsCompleted || 0), 0) || 0;

  const chartData = [
    { name: "XP Earned", value: totalXp },
    { name: "Battles Won", value: totalBattles },
    { name: "Decks Created", value: totalDecks },
    { name: "Quests Done", value: totalQuests },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) return null;

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4" /> Community Activity
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <DonutChart
          className="h-64"
          data={chartData}
          category="value"
          index="name"
          colors={["emerald", "red", "blue", "purple"]}
          valueFormatter={(value) => value.toLocaleString()}
          showLabel={true}
        />
      </PixelCardContent>
    </PixelCard>
  );
}

interface TopPerformersRadarProps {
  user: LeaderboardUser & {
    xpRank?: number;
    battlesRank?: number;
    decksRank?: number;
    questsRank?: number;
    masteryRank?: number;
  };
  maxRank: number;
}

export function TopPerformersRadar({ user, maxRank }: TopPerformersRadarProps) {
  const barListData = [
    { name: "XP Rank", value: maxRank - (user.xpRank || maxRank) + 1 },
    { name: "Battles Rank", value: maxRank - (user.battlesRank || maxRank) + 1 },
    { name: "Decks Rank", value: maxRank - (user.decksRank || maxRank) + 1 },
    { name: "Quests Rank", value: maxRank - (user.questsRank || maxRank) + 1 },
    { name: "Mastery Rank", value: maxRank - (user.masteryRank || maxRank) + 1 },
  ];

  return (
    <div className="h-64">
      <BarList
        data={barListData}
        valueFormatter={(value: number) => `Rank ${maxRank - value + 1}`}
        color="emerald"
      />
    </div>
  );
}

interface EngagementTrendChartProps {
  toolsViewedData: LeaderboardUser[] | undefined;
  votesData: LeaderboardUser[] | undefined;
}

export function EngagementTrendChart({ toolsViewedData, votesData }: EngagementTrendChartProps) {
  if (!toolsViewedData && !votesData) return null;

  const chartData = (toolsViewedData || []).slice(0, 10).map((user, index) => ({
    name: user.username || `User ${user.rank}`,
    "Tools Viewed": user.toolsViewed || 0,
    "Votes Cast": votesData?.[index]?.votescast || 0,
  }));

  if (chartData.length === 0) return null;

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Engagement Leaders
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <BarChart
          className="h-64"
          data={chartData}
          index="name"
          categories={["Tools Viewed", "Votes Cast"]}
          colors={["indigo", "pink"]}
          valueFormatter={(value) => value.toString()}
          showLegend={true}
        />
      </PixelCardContent>
    </PixelCard>
  );
}
