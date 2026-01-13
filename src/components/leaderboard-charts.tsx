"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
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

  const chartData = data.slice(0, 10).map((user, index) => ({
    name: user.username || `User ${user.rank}`,
    xp: user.xp || 0,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> XP Distribution
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "#374151" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={{ stroke: "#374151" }}
                width={80}
                tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                  color: "#22c55e",
                }}
                formatter={(value) => [`${(value as number).toLocaleString()} XP`, "XP"]}
              />
              <Bar dataKey="xp" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
    wins: user.battlesWon || 0,
    winRate: user.winRate || 0,
  }));

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" /> Battle Performance
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 20, top: 10 }}>
              <defs>
                <linearGradient id="winsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={{ stroke: "#374151" }}
                tickFormatter={(value) => value.length > 6 ? `${value.slice(0, 6)}..` : value}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "#374151" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                  color: "#ef4444",
                }}
                formatter={(value, name) => [
                  name === "wins" ? `${value} wins` : `${value}%`,
                  name === "wins" ? "Battles Won" : "Win Rate",
                ]}
              />
              <Area
                type="monotone"
                dataKey="wins"
                stroke="#ef4444"
                fill="url(#winsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
    { name: "XP Earned", value: totalXp, color: "#22c55e" },
    { name: "Battles Won", value: totalBattles, color: "#ef4444" },
    { name: "Decks Created", value: totalDecks, color: "#3b82f6" },
    { name: "Quests Done", value: totalQuests, color: "#a855f7" },
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
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#6b7280" }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0f1a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                }}
                formatter={(value) => [(value as number).toLocaleString(), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
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
  const chartData = [
    { stat: "XP", value: maxRank - (user.xpRank || maxRank) + 1, fullMark: maxRank },
    { stat: "Battles", value: maxRank - (user.battlesRank || maxRank) + 1, fullMark: maxRank },
    { stat: "Decks", value: maxRank - (user.decksRank || maxRank) + 1, fullMark: maxRank },
    { stat: "Quests", value: maxRank - (user.questsRank || maxRank) + 1, fullMark: maxRank },
    { stat: "Mastery", value: maxRank - (user.masteryRank || maxRank) + 1, fullMark: maxRank },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="stat" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: "#6b7280", fontSize: 9 }} domain={[0, maxRank]} />
          <Radar
            name={user.username || "User"}
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
    toolsViewed: user.toolsViewed || 0,
    votes: votesData?.[index]?.votescast || 0,
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={{ stroke: "#374151" }}
                tickFormatter={(value) => value.length > 6 ? `${value.slice(0, 6)}..` : value}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "#374151" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0f1a",
                  border: "2px solid #374151",
                  borderRadius: 0,
                }}
              />
              <Bar dataKey="toolsViewed" name="Tools Viewed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="votes" name="Votes Cast" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500" />
            <span className="text-muted-foreground text-xs">Tools Viewed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500" />
            <span className="text-muted-foreground text-xs">Votes Cast</span>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
