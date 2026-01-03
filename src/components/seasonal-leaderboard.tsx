"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Zap,
  Swords,
  Layers,
  MessageSquare,
  Timer,
  Target,
} from "lucide-react";

interface SeasonalLeaderboardProps {
  userId: string;
  className?: string;
}

export function SeasonalLeaderboard({ userId, className }: SeasonalLeaderboardProps) {
  const activeSeasons = useQuery(api.leaderboardSeasons.getAllActiveSeasons);
  const selectedSeasonId = activeSeasons?.[0]?._id;
  
  const leaderboard = useQuery(
    api.leaderboardSeasons.getSeasonLeaderboard,
    selectedSeasonId ? { seasonId: selectedSeasonId, limit: 20 } : "skip"
  );
  
  const userRank = useQuery(
    api.leaderboardSeasons.getUserSeasonRank,
    selectedSeasonId ? { userId, seasonId: selectedSeasonId } : "skip"
  );

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case "xp":
        return <Zap className="w-5 h-5" />;
      case "battles":
        return <Swords className="w-5 h-5" />;
      case "decks":
        return <Layers className="w-5 h-5" />;
      case "reviews":
        return <MessageSquare className="w-5 h-5" />;
      case "speedruns":
        return <Timer className="w-5 h-5" />;
      case "predictions":
        return <Target className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="text-muted-foreground text-[12px]">#{rank}</span>;
    }
  };

  const getMovementIcon = (movement: number) => {
    if (movement > 0) {
      return <TrendingUp className="w-3 h-3 text-green-400" />;
    } else if (movement < 0) {
      return <TrendingDown className="w-3 h-3 text-red-400" />;
    }
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const diff = endDate - now;
    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d remaining`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  const activeSeason = activeSeasons?.[0];

  return (
    <div className={cn("space-y-6", className)}>
      {activeSeasons && activeSeasons.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activeSeasons.map((season) => (
            <PixelBadge
              key={season._id}
              variant="outline"
              className={cn(
                "text-[8px] whitespace-nowrap cursor-pointer",
                season._id === selectedSeasonId
                  ? "bg-primary/20 border-primary"
                  : "border-border"
              )}
            >
              {getLeaderboardIcon(season.leaderboardType)}
              <span className="ml-1">{season.name}</span>
            </PixelBadge>
          ))}
        </div>
      )}

      {activeSeason && (
        <PixelCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-primary text-sm flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> {activeSeason.name}
              </h2>
              <p className="text-muted-foreground text-[8px] mt-1">
                {activeSeason.description}
              </p>
            </div>
            <div className="text-right">
              <PixelBadge variant="outline" className="text-[8px]">
                <Calendar className="w-3 h-3 mr-1" />
                {getTimeRemaining(activeSeason.endDate)}
              </PixelBadge>
            </div>
          </div>

          {userRank && (
            <div className="mb-6 p-4 border-2 border-primary bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(userRank.currentRank)}
                  <div>
                    <p className="text-primary text-[12px]">YOUR RANK</p>
                    <p className="text-muted-foreground text-[8px]">
                      Score: {userRank.score.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getMovementIcon(userRank.movement)}
                  <span
                    className={cn(
                      "text-[10px]",
                      userRank.movement > 0
                        ? "text-green-400"
                        : userRank.movement < 0
                          ? "text-red-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {userRank.movement > 0 ? `+${userRank.movement}` : userRank.movement}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {leaderboard?.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-3 border-2 transition-all",
                  entry.userId === userId
                    ? "border-primary bg-primary/10"
                    : "border-border",
                  entry.rank <= 3 && "border-yellow-400/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <p className="text-primary text-[10px]">
                      {entry.user?.username ?? "Unknown Player"}
                    </p>
                    <p className="text-muted-foreground text-[8px]">
                      Level {entry.user?.level ?? 1}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {getMovementIcon(entry.movement)}
                    <span
                      className={cn(
                        "text-[8px]",
                        entry.movement > 0
                          ? "text-green-400"
                          : entry.movement < 0
                            ? "text-red-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {Math.abs(entry.movement)}
                    </span>
                  </div>
                  <span className="text-primary text-[12px] w-20 text-right">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {(!leaderboard || leaderboard.length === 0) && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-[10px]">
                No rankings yet. Be the first to compete!
              </p>
            </div>
          )}
        </PixelCard>
      )}

      {activeSeason?.rewards && activeSeason.rewards.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-[10px] uppercase mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> SEASON REWARDS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {activeSeason.rewards.map((reward, index) => (
              <div
                key={index}
                className={cn(
                  "border-2 p-3 text-center",
                  reward.rank === 1
                    ? "border-yellow-400 bg-yellow-400/10"
                    : reward.rank === 2
                      ? "border-gray-300 bg-gray-300/10"
                      : reward.rank === 3
                        ? "border-orange-400 bg-orange-400/10"
                        : "border-border"
                )}
              >
                {getRankIcon(reward.rank)}
                <p className="text-primary text-[8px] mt-1">
                  {reward.rewardType === "title" ? "Title:" : "Reward:"}
                </p>
                <p className="text-muted-foreground text-[8px]">{reward.rewardValue}</p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {(!activeSeasons || activeSeasons.length === 0) && (
        <PixelCard className="p-6 text-center">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-primary text-lg mb-2">NO ACTIVE SEASONS</p>
          <p className="text-muted-foreground text-[10px]">
            Check back later for new competitive seasons!
          </p>
        </PixelCard>
      )}
    </div>
  );
}
