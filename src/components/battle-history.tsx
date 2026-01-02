"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Swords, 
  Trophy,
  Crown,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
  Medal,
  Flame,
  Zap,
  Target
} from "lucide-react";

interface BattleHistoryProps {
  userId: string;
  className?: string;
}

export function BattleHistory({ userId, className }: BattleHistoryProps) {
  const battleHistory = useQuery(api.battles.getUserBattleHistory, { userId });

  if (!battleHistory) {
    return (
      <PixelCard className="p-6 text-center">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING BATTLE HISTORY...</div>
      </PixelCard>
    );
  }

  if (battleHistory.length === 0) {
    return (
      <PixelCard className="p-8 text-center">
        <Swords className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">NO BATTLES YET</p>
        <p className="text-[#1e3a5f] text-[8px]">Start battling tools to see your history!</p>
      </PixelCard>
    );
  }

  const wins = battleHistory.filter((b) => b.winner).length;
  const total = battleHistory.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  let currentStreak = 0;
  for (const battle of battleHistory) {
    if (battle.winner) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <History className="w-4 h-4" /> BATTLE HISTORY
          </h2>
          <div className="flex items-center gap-2">
            {currentStreak >= 3 && (
              <PixelBadge variant="default" className="text-[6px] bg-orange-400 text-black">
                <Flame className="w-2 h-2 mr-1" /> {currentStreak} STREAK
              </PixelBadge>
            )}
            <PixelBadge variant="default">
              {wins}W / {total - wins}L ({winRate}%)
            </PixelBadge>
          </div>
        </div>

        <div className="space-y-2">
          {battleHistory.map((battle) => (
            <BattleHistoryCard key={battle._id} battle={battle} />
          ))}
        </div>
      </PixelCard>
    </div>
  );
}

interface BattleHistoryCardProps {
  battle: {
    _id: string;
    tool1: { _id: string; name: string; slug: string } | null;
    tool2: { _id: string; name: string; slug: string } | null;
    winner: { _id: string; name: string; slug: string } | null;
    battleStats: {
      tool1Score: number;
      tool2Score: number;
      weights: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
        mana: number;
      };
    };
    createdAt: number;
  };
}

function BattleHistoryCard({ battle }: BattleHistoryCardProps) {
  if (!battle.tool1 || !battle.tool2 || !battle.winner) return null;

  const tool1Won = battle.winner._id === battle.tool1._id;
  const scoreDiff = Math.abs(battle.battleStats.tool1Score - battle.battleStats.tool2Score);
  const isClose = scoreDiff < 50;

  return (
    <div className="border-2 border-[#1e3a5f] p-3 bg-[#0a1628]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[8px] text-[#3b82f6]">
          <Clock className="w-3 h-3" />
          {new Date(battle.createdAt).toLocaleDateString()}
        </div>
        {isClose && (
          <PixelBadge variant="outline" className="text-[6px] text-yellow-400 border-yellow-400">
            CLOSE MATCH
          </PixelBadge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className={cn(
          "flex-1 text-center p-2 border",
          tool1Won ? "border-green-400 bg-green-400/10" : "border-[#1e3a5f]"
        )}>
          <div className="flex items-center justify-center gap-1 mb-1">
            {tool1Won && <Trophy className="w-3 h-3 text-yellow-400" />}
            <Link 
              href={`/tools/${battle.tool1.slug}`}
              className="text-[#60a5fa] text-[10px] hover:underline"
            >
              {battle.tool1.name}
            </Link>
          </div>
          <p className="text-[#3b82f6] text-[8px]">
            {Math.round(battle.battleStats.tool1Score)} pts
          </p>
        </div>

        <div className="px-3">
          <Swords className="w-5 h-5 text-[#3b82f6]" />
        </div>

        <div className={cn(
          "flex-1 text-center p-2 border",
          !tool1Won ? "border-green-400 bg-green-400/10" : "border-[#1e3a5f]"
        )}>
          <div className="flex items-center justify-center gap-1 mb-1">
            {!tool1Won && <Trophy className="w-3 h-3 text-yellow-400" />}
            <Link 
              href={`/tools/${battle.tool2.slug}`}
              className="text-[#60a5fa] text-[10px] hover:underline"
            >
              {battle.tool2.name}
            </Link>
          </div>
          <p className="text-[#3b82f6] text-[8px]">
            {Math.round(battle.battleStats.tool2Score)} pts
          </p>
        </div>
      </div>
    </div>
  );
}

export function BattleLeaderboard({ className }: { className?: string }) {
  const leaderboard = useQuery(api.battles.getBattleLeaderboard);

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  return (
    <PixelCard className={cn("p-4", className)}>
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
        <Crown className="w-4 h-4" /> BATTLE CHAMPIONS
      </h3>

      <div className="space-y-2">
        {leaderboard.slice(0, 5).map((entry, index) => {
          const tool = entry.tool as { _id: string; name: string; slug: string } | null;
          if (!tool) return null;
          
          const trend = entry.winRate >= 60 ? "up" : entry.winRate <= 40 ? "down" : "neutral";
          
          return (
            <div 
              key={tool._id}
              className={cn(
                "flex items-center justify-between p-2 border",
                index === 0 && "border-yellow-400 bg-yellow-400/10",
                index === 1 && "border-gray-400 bg-gray-400/10",
                index === 2 && "border-orange-400 bg-orange-400/10",
                index > 2 && "border-[#1e3a5f]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-6 h-6 flex items-center justify-center text-[10px]",
                  index === 0 && "text-yellow-400",
                  index === 1 && "text-gray-400",
                  index === 2 && "text-orange-400",
                  index > 2 && "text-[#3b82f6]"
                )}>
                  {index === 0 ? <Medal className="w-4 h-4" /> : `#${index + 1}`}
                </span>
                <Link 
                  href={`/tools/${tool.slug}`}
                  className="text-[#60a5fa] text-[10px] hover:underline"
                >
                  {tool.name}
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[#60a5fa] text-[10px]">{entry.wins}W / {entry.losses}L</p>
                  <p className="text-[#3b82f6] text-[8px]">{entry.winRate.toFixed(0)}% WR</p>
                </div>
                {trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
                {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                {trend === "neutral" && <Minus className="w-4 h-4 text-[#3b82f6]" />}
              </div>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}

export function BattleStatsWidget({ userId }: { userId: string }) {
  const battleHistory = useQuery(api.battles.getUserBattleHistory, { userId });

  if (!battleHistory || battleHistory.length === 0) return null;

  const wins = battleHistory.filter((b) => b.winner).length;
  const winRate = (wins / battleHistory.length) * 100;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Swords className="w-3 h-3" /> BATTLE STATS
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[#60a5fa] text-lg">{battleHistory.length}</p>
          <p className="text-[#3b82f6] text-[6px]">BATTLES</p>
        </div>
        <div>
          <p className="text-green-400 text-lg">{wins}</p>
          <p className="text-[#3b82f6] text-[6px]">WINS</p>
        </div>
        <div>
          <p className="text-[#60a5fa] text-lg">{winRate.toFixed(0)}%</p>
          <p className="text-[#3b82f6] text-[6px]">WIN RATE</p>
        </div>
      </div>
    </PixelCard>
  );
}
