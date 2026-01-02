"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Flame,
  Gift,
  Calendar,
  Check,
  Star,
  Zap,
  Package,
  Crown,
  Trophy,
  Sparkles
} from "lucide-react";

interface DailyRewardsProps {
  userId: string;
  className?: string;
}

const STREAK_REWARDS = [
  { day: 1, xp: 25, icon: Star, label: "Day 1" },
  { day: 2, xp: 50, icon: Star, label: "Day 2" },
  { day: 3, xp: 75, icon: Zap, label: "Day 3" },
  { day: 4, xp: 100, icon: Zap, label: "Day 4" },
  { day: 5, xp: 150, icon: Package, label: "Day 5", bonus: "Free Pack" },
  { day: 6, xp: 200, icon: Crown, label: "Day 6" },
  { day: 7, xp: 500, icon: Trophy, label: "Day 7", bonus: "Premium Pack" },
];

export function DailyRewards({ userId, className }: DailyRewardsProps) {
  const [claimed, setClaimed] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const streakData = useQuery(api.streaks.getUserStreak, { userId });
  const claimDaily = useMutation(api.streaks.claimDailyReward);

  const handleClaim = async () => {
    try {
      const result = await claimDaily({ userId });
      if (result.success) {
        setRewardAmount(result.xpAwarded || 0);
        setShowReward(true);
        setClaimed(true);
        setTimeout(() => setShowReward(false), 3000);
      }
    } catch (error) {
      console.error("Failed to claim daily reward:", error);
    }
  };

  if (!streakData) {
    return (
      <PixelCard className="p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING STREAK...</div>
      </PixelCard>
    );
  }

  const currentDay = ((streakData.currentStreak - 1) % 7) + 1;
  const canClaim = streakData.canClaimToday && !claimed;

  return (
    <div className={cn("space-y-4", className)}>
      <PixelCard className={cn("p-4", canClaim && "border-yellow-400")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> DAILY LOGIN
          </h2>
          <div className="flex items-center gap-2">
            <Flame className={cn(
              "w-5 h-5",
              streakData.currentStreak > 0 ? "text-orange-400" : "text-[#1e3a5f]"
            )} />
            <span className="text-orange-400 text-lg">{streakData.currentStreak}</span>
            <span className="text-[#3b82f6] text-[8px]">DAY STREAK</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {STREAK_REWARDS.map((reward, index) => {
            const dayNum = index + 1;
            const isPast = dayNum < currentDay;
            const isCurrent = dayNum === currentDay;
            const isFuture = dayNum > currentDay;
            const Icon = reward.icon;

            return (
              <div
                key={dayNum}
                className={cn(
                  "border-2 p-2 text-center relative",
                  isPast && "border-green-400 bg-green-400/10",
                  isCurrent && canClaim && "border-yellow-400 bg-yellow-400/10 animate-pulse",
                  isCurrent && !canClaim && "border-green-400 bg-green-400/10",
                  isFuture && "border-[#1e3a5f] bg-[#0a1628] opacity-50"
                )}
              >
                {isPast && (
                  <Check className="absolute -top-1 -right-1 w-3 h-3 text-green-400" />
                )}
                <Icon className={cn(
                  "w-4 h-4 mx-auto mb-1",
                  isPast && "text-green-400",
                  isCurrent && "text-yellow-400",
                  isFuture && "text-[#1e3a5f]"
                )} />
                <p className={cn(
                  "text-[8px]",
                  isPast && "text-green-400",
                  isCurrent && "text-yellow-400",
                  isFuture && "text-[#1e3a5f]"
                )}>
                  +{reward.xp}
                </p>
                {reward.bonus && (
                  <PixelBadge 
                    variant="outline" 
                    className={cn(
                      "text-[5px] mt-1",
                      dayNum === 5 && "text-blue-400 border-blue-400",
                      dayNum === 7 && "text-yellow-400 border-yellow-400"
                    )}
                  >
                    {reward.bonus}
                  </PixelBadge>
                )}
              </div>
            );
          })}
        </div>

        {canClaim ? (
          <PixelButton onClick={handleClaim} className="w-full">
            <Gift className="w-4 h-4 mr-2" /> CLAIM DAILY REWARD
          </PixelButton>
        ) : (
          <div className="text-center">
            <PixelBadge variant="secondary" className="text-[8px]">
              <Check className="w-3 h-3 mr-1" /> CLAIMED TODAY
            </PixelBadge>
            <p className="text-[#3b82f6] text-[8px] mt-2">Come back tomorrow!</p>
          </div>
        )}
      </PixelCard>

      {streakData.longestStreak > 0 && (
        <div className="flex items-center justify-center gap-4 text-[10px]">
          <div className="text-center">
            <p className="text-[#3b82f6]">CURRENT</p>
            <p className="text-orange-400 text-lg">{streakData.currentStreak}</p>
          </div>
          <div className="w-px h-8 bg-[#1e3a5f]" />
          <div className="text-center">
            <p className="text-[#3b82f6]">BEST</p>
            <p className="text-yellow-400 text-lg">{streakData.longestStreak}</p>
          </div>
          <div className="w-px h-8 bg-[#1e3a5f]" />
          <div className="text-center">
            <p className="text-[#3b82f6]">TOTAL XP</p>
            <p className="text-[#60a5fa] text-lg">{streakData.totalXpFromStreaks}</p>
          </div>
        </div>
      )}

      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-none">
          <div className="text-center animate-bounce">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <p className="text-yellow-400 text-2xl">+{rewardAmount} XP</p>
            <p className="text-[#3b82f6] text-[12px]">Daily reward claimed!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function DailyRewardsWidget({ userId }: { userId: string }) {
  const streakData = useQuery(api.streaks.getUserStreak, { userId });

  if (!streakData) return null;

  return (
    <PixelCard className={cn("p-3", streakData.canClaimToday && "border-yellow-400")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={cn(
            "w-4 h-4",
            streakData.currentStreak > 0 ? "text-orange-400" : "text-[#1e3a5f]"
          )} />
          <div>
            <p className="text-orange-400 text-[12px]">{streakData.currentStreak} Day Streak</p>
            <p className="text-[#3b82f6] text-[8px]">Best: {streakData.longestStreak}</p>
          </div>
        </div>
        {streakData.canClaimToday && (
          <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black animate-pulse">
            <Gift className="w-2 h-2 mr-1" /> CLAIM
          </PixelBadge>
        )}
      </div>
    </PixelCard>
  );
}
