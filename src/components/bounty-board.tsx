"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import {
  Target,
  Clock,
  Users,
  Zap,
  Award,
  CheckCircle,
  Play,
  Gift,
  Crosshair,
} from "lucide-react";

interface BountyBoardProps {
  userId: string;
  className?: string;
}

export function BountyBoard({ userId, className }: BountyBoardProps) {
  const [selectedBounty, setSelectedBounty] = useState<Id<"bountyHunts"> | null>(null);

  const activeBounties = useQuery(api.bountyHunts.getActiveBounties);
  const userBounties = useQuery(api.bountyHunts.getUserBounties, { userId });
  const joinBounty = useMutation(api.bountyHunts.joinBounty);
  const claimReward = useMutation(api.bountyHunts.claimReward);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "legendary":
        return "text-yellow-400 border-yellow-400";
      case "hard":
        return "text-red-400 border-red-400";
      case "medium":
        return "text-orange-400 border-orange-400";
      default:
        return "text-green-400 border-green-400";
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleJoinBounty = async (bountyId: Id<"bountyHunts">) => {
    try {
      await joinBounty({ userId, bountyId });
    } catch (error) {
      console.error("Failed to join bounty:", error);
    }
  };

  const handleClaimReward = async (bountyId: Id<"bountyHunts">) => {
    try {
      await claimReward({ userId, bountyId });
    } catch (error) {
      console.error("Failed to claim reward:", error);
    }
  };

  const isHunting = (bountyId: Id<"bountyHunts">) => {
    return userBounties?.some(
      (ub) => ub.bountyId === bountyId && ub.status === "hunting"
    );
  };

  const getHuntProgress = (bountyId: Id<"bountyHunts">) => {
    return userBounties?.find((ub) => ub.bountyId === bountyId);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Crosshair className="w-5 h-5" /> BOUNTY BOARD
          </h2>
          <PixelBadge variant="outline" className="text-[8px]">
            {activeBounties?.length ?? 0} ACTIVE
          </PixelBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBounties?.map((bounty) => {
            const huntProgress = getHuntProgress(bounty._id);
            const isCompleted = huntProgress?.status === "completed";
            const isClaimed = huntProgress?.status === "claimed";

            return (
              <div
                key={bounty._id}
                className={cn(
                  "border-2 p-4 transition-all cursor-pointer",
                  selectedBounty === bounty._id
                    ? "border-[#3b82f6] bg-[#3b82f6]/10"
                    : "border-[#1e3a5f] hover:border-[#3b82f6]",
                  isClaimed && "opacity-50"
                )}
                onClick={() => setSelectedBounty(bounty._id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[#60a5fa] text-[12px] mb-1">
                      {bounty.title}
                    </h3>
                    <PixelBadge
                      variant="outline"
                      className={cn("text-[6px]", getDifficultyColor(bounty.difficulty))}
                    >
                      {bounty.difficulty.toUpperCase()}
                    </PixelBadge>
                  </div>
                  <Target className={cn("w-5 h-5", getDifficultyColor(bounty.difficulty))} />
                </div>

                <p className="text-[#3b82f6] text-[8px] mb-3">
                  {bounty.description}
                </p>

                {bounty.targetTool && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-[#0a1628] border border-[#1e3a5f]">
                    <span className="text-[#60a5fa] text-[10px]">
                      {bounty.targetTool.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[8px] mb-3">
                  <div className="flex items-center gap-1 text-[#3b82f6]">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(bounty.expiresAt)}
                  </div>
                  <div className="flex items-center gap-1 text-[#3b82f6]">
                    <Users className="w-3 h-3" />
                    {bounty.currentHunters}/{bounty.maxHunters}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-[10px]">
                    +{bounty.rewards.xp} XP
                  </span>
                  {bounty.rewards.bonusTitle && (
                    <>
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-[8px]">
                        {bounty.rewards.bonusTitle}
                      </span>
                    </>
                  )}
                </div>

                {huntProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[8px] mb-1">
                      <span className="text-[#3b82f6]">PROGRESS</span>
                      <span className="text-[#60a5fa]">
                        {huntProgress.progress}/{bounty.requirement.count}
                      </span>
                    </div>
                    <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
                      <div
                        className="h-full bg-[#3b82f6]"
                        style={{
                          width: `${Math.min(100, (huntProgress.progress / bounty.requirement.count) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isClaimed ? (
                  <div className="flex items-center justify-center gap-2 text-green-400 text-[10px]">
                    <CheckCircle className="w-4 h-4" /> CLAIMED
                  </div>
                ) : isCompleted ? (
                  <PixelButton
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimReward(bounty._id);
                    }}
                  >
                    <Gift className="w-4 h-4 mr-1" /> CLAIM REWARD
                  </PixelButton>
                ) : isHunting(bounty._id) ? (
                  <div className="flex items-center justify-center gap-2 text-orange-400 text-[10px]">
                    <Target className="w-4 h-4 animate-pulse" /> HUNTING...
                  </div>
                ) : (
                  <PixelButton
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinBounty(bounty._id);
                    }}
                    disabled={bounty.currentHunters >= bounty.maxHunters}
                  >
                    <Play className="w-4 h-4 mr-1" /> JOIN HUNT
                  </PixelButton>
                )}
              </div>
            );
          })}
        </div>

        {(!activeBounties || activeBounties.length === 0) && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-[#1e3a5f] mb-4" />
            <p className="text-[#3b82f6] text-[10px]">
              No active bounties. Check back later!
            </p>
          </div>
        )}
      </PixelCard>

      {userBounties && userBounties.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">
            YOUR HUNTS
          </h3>
          <div className="space-y-2">
            {userBounties.map((hunt) => (
              <div
                key={hunt._id}
                className="flex items-center justify-between p-2 border border-[#1e3a5f]"
              >
                <div className="flex items-center gap-2">
                  <Target
                    className={cn(
                      "w-4 h-4",
                      hunt.status === "completed" || hunt.status === "claimed"
                        ? "text-green-400"
                        : "text-orange-400"
                    )}
                  />
                  <span className="text-[#60a5fa] text-[10px]">
                    {hunt.bounty?.title ?? "Unknown Bounty"}
                  </span>
                </div>
                <PixelBadge
                  variant="outline"
                  className={cn(
                    "text-[6px]",
                    hunt.status === "claimed"
                      ? "text-green-400 border-green-400"
                      : hunt.status === "completed"
                        ? "text-yellow-400 border-yellow-400"
                        : "text-orange-400 border-orange-400"
                  )}
                >
                  {hunt.status.toUpperCase()}
                </PixelBadge>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
