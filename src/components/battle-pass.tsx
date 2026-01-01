"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Lock,
  Check,
  Gift,
  Crown,
  Star,
  Zap,
  Clock
} from "lucide-react";

interface BattlePassProps {
  userId: string;
  className?: string;
}

const REWARD_ICONS: Record<string, React.ReactNode> = {
  xp_boost: <Zap className="w-4 h-4 text-yellow-400" />,
  title: <Crown className="w-4 h-4 text-purple-400" />,
  badge: <Star className="w-4 h-4 text-blue-400" />,
  profile_frame: <Trophy className="w-4 h-4 text-orange-400" />,
  pack: <Gift className="w-4 h-4 text-green-400" />,
  exclusive_tool_skin: <Star className="w-4 h-4 text-pink-400" />,
};

export function BattlePass({ userId, className }: BattlePassProps) {
  const [now, setNow] = useState(() => Date.now());
  const season = useQuery(api.battlePass.getActiveSeason);
  const progress = useQuery(api.battlePass.getUserProgress, { userId });
  const claimReward = useMutation(api.battlePass.claimReward);
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!season) {
    return (
      <PixelCard className="p-8 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">NO ACTIVE SEASON</p>
        <p className="text-[#1e3a5f] text-[8px]">Check back soon!</p>
      </PixelCard>
    );
  }

  const timeLeft = season.endDate - now;
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const xpProgress = progress ? (progress.xp % season.xpPerLevel) / season.xpPerLevel * 100 : 0;

  const handleClaim = async (level: number) => {
    await claimReward({ userId, seasonId: season._id, level });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6 border-yellow-400">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-yellow-400 text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" /> {season.name}
            </h2>
            <p className="text-[#3b82f6] text-[10px]">{season.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[#3b82f6] text-[10px]">
              <Clock className="w-3 h-3" /> {daysLeft} days left
            </div>
            {progress && !progress.isPremium && (
              <PixelButton size="sm" className="mt-2">
                <Crown className="w-3 h-3 mr-1" /> UPGRADE
              </PixelButton>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-yellow-400 text-3xl">LV.{progress?.level || 1}</p>
            <p className="text-[#3b82f6] text-[8px]">{progress?.xp || 0} XP</p>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[8px] mb-1">
              <span className="text-[#3b82f6]">LEVEL {progress?.level || 1}</span>
              <span className="text-[#3b82f6]">LEVEL {(progress?.level || 1) + 1}</span>
            </div>
            <div className="h-4 bg-[#0a1628] border-2 border-[#1e3a5f]">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[#1e3a5f] text-[8px] text-center mt-1">
              {season.xpPerLevel - (progress?.xp || 0) % season.xpPerLevel} XP to next level
            </p>
          </div>
        </div>
      </PixelCard>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {Array.from({ length: Math.min(season.maxLevel, 20) }, (_, i) => i + 1).map((level) => {
            const rewards = season.rewardsByLevel[level] || [];
            const freeReward = rewards.find((r: any) => r.track === "free");
            const premiumReward = rewards.find((r: any) => r.track === "premium");
            const isUnlocked = (progress?.level || 0) >= level;
            const isClaimed = (progress?.claimedRewards as number[] | undefined)?.includes(level) || false;

            return (
              <div key={level} className="w-20 flex-shrink-0">
                <div className="text-center mb-2">
                  <PixelBadge 
                    variant={isUnlocked ? "default" : "outline"} 
                    className={cn("text-[8px]", isUnlocked && "bg-yellow-400 text-black")}
                  >
                    LV.{level}
                  </PixelBadge>
                </div>

                {premiumReward && (
                  <RewardTile
                    reward={premiumReward}
                    isUnlocked={isUnlocked && Boolean(progress?.isPremium)}
                    isClaimed={isClaimed}
                    isPremium
                    onClaim={() => handleClaim(level)}
                  />
                )}

                {freeReward && (
                  <RewardTile
                    reward={freeReward}
                    isUnlocked={isUnlocked}
                    isClaimed={isClaimed}
                    onClaim={() => handleClaim(level)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[#3b82f6] text-[8px]">
          Earn XP by completing challenges, battles, and quests!
        </p>
      </div>
    </div>
  );
}

interface RewardTileProps {
  reward: {
    rewardType: string;
    rewardValue: string;
    rewardIcon?: string;
  };
  isUnlocked: boolean;
  isClaimed: boolean;
  isPremium?: boolean;
  onClaim: () => void;
}

function RewardTile({ reward, isUnlocked, isClaimed, isPremium, onClaim }: RewardTileProps) {
  return (
    <div 
      className={cn(
        "border-2 p-2 text-center mb-1 relative",
        isPremium ? "border-yellow-400 bg-yellow-400/10" : "border-[#1e3a5f] bg-[#0a1628]",
        !isUnlocked && "opacity-50",
        isClaimed && "opacity-30"
      )}
    >
      {isPremium && (
        <Crown className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400" />
      )}
      
      {!isUnlocked && (
        <Lock className="absolute top-1 right-1 w-3 h-3 text-[#1e3a5f]" />
      )}

      <div className="mb-1">
        {REWARD_ICONS[reward.rewardType] || <Gift className="w-4 h-4 text-[#3b82f6] mx-auto" />}
      </div>
      
      <p className="text-[#60a5fa] text-[8px] truncate">{reward.rewardValue}</p>
      <p className="text-[#3b82f6] text-[6px]">{reward.rewardType.replace(/_/g, " ")}</p>

      {isUnlocked && !isClaimed && (
        <button
          onClick={onClaim}
          className="absolute inset-0 bg-green-400/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        >
          <Check className="w-6 h-6 text-green-400" />
        </button>
      )}

      {isClaimed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="w-6 h-6 text-green-400" />
        </div>
      )}
    </div>
  );
}

export function BattlePassWidget({ userId }: { userId: string }) {
  const season = useQuery(api.battlePass.getActiveSeason);
  const progress = useQuery(api.battlePass.getUserProgress, { userId });

  if (!season) return null;

  const xpProgress = progress ? (progress.xp % season.xpPerLevel) / season.xpPerLevel * 100 : 0;

  return (
    <PixelCard className="p-3 border-yellow-400">
      <div className="flex items-center justify-between mb-2">
        <span className="text-yellow-400 text-[10px] flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {season.name}
        </span>
        <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
          LV.{progress?.level || 1}
        </PixelBadge>
      </div>
      
      <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
        <div 
          className="h-full bg-yellow-400"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
      <p className="text-[#3b82f6] text-[6px] mt-1">{progress?.xp || 0} / {season.xpPerLevel} XP</p>
    </PixelCard>
  );
}
