"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Crown,
  Star,
  Zap,
  Package,
  Swords,
  RotateCw,
  ChevronRight,
  Lock,
  CheckCircle,
  Sparkles,
} from "lucide-react";

interface PrestigePanelProps {
  userId: string;
  className?: string;
}

export function PrestigePanel({ userId, className }: PrestigePanelProps) {
  const prestige = useQuery(api.prestige.getUserPrestige, { userId });
  const tiers = useQuery(api.prestige.getPrestigeTiers);
  const doPrestige = useMutation(api.prestige.prestige);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "master":
        return "text-red-400 border-red-400 bg-red-400/10";
      case "diamond":
        return "text-cyan-400 border-cyan-400 bg-cyan-400/10";
      case "platinum":
        return "text-purple-400 border-purple-400 bg-purple-400/10";
      case "gold":
        return "text-yellow-400 border-yellow-400 bg-yellow-400/10";
      case "silver":
        return "text-gray-300 border-gray-300 bg-gray-300/10";
      case "bronze":
        return "text-orange-400 border-orange-400 bg-orange-400/10";
      default:
        return "text-[#3b82f6] border-[#1e3a5f]";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "master":
        return <Crown className="w-6 h-6" />;
      case "diamond":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const handlePrestige = async () => {
    try {
      await doPrestige({ userId });
    } catch (error) {
      console.error("Failed to prestige:", error);
    }
  };

  if (!prestige) {
    return (
      <PixelCard className="p-6 text-center">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">
          LOADING PRESTIGE...
        </div>
      </PixelCard>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" /> PRESTIGE SYSTEM
          </h2>
          <PixelBadge
            variant="outline"
            className={cn("text-[8px]", getTierColor(prestige.prestigeTier))}
          >
            {prestige.prestigeTier.toUpperCase()}
          </PixelBadge>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div
              className={cn(
                "border-4 p-6 text-center mb-4",
                getTierColor(prestige.prestigeTier)
              )}
            >
              <div className={cn("mb-2", getTierColor(prestige.prestigeTier))}>
                {getTierIcon(prestige.prestigeTier)}
              </div>
              <p className="text-[#60a5fa] text-lg mb-1">
                Prestige Level {prestige.prestigeLevel}
              </p>
              <p className="text-[#3b82f6] text-[10px]">
                {prestige.totalXpEarned.toLocaleString()} Total XP Earned
              </p>
            </div>

            {prestige.nextTier && (
              <div className="mb-4">
                <div className="flex justify-between text-[8px] mb-1">
                  <span className="text-[#3b82f6]">PROGRESS TO NEXT TIER</span>
                  <span className="text-[#60a5fa]">{prestige.progress}%</span>
                </div>
                <div className="h-3 bg-[#0a1628] border-2 border-[#1e3a5f]">
                  <motion.div
                    className={cn(
                      "h-full",
                      getTierColor(prestige.nextTier.tier).replace("text-", "bg-").split(" ")[0]
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${prestige.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[#3b82f6] text-[8px] mt-1">
                  {prestige.nextTier.xpRequired.toLocaleString()} XP required for{" "}
                  {prestige.nextTier.tier}
                </p>
              </div>
            )}

            {prestige.nextTier && prestige.totalXpEarned >= prestige.nextTier.xpRequired && (
              <PixelButton size="lg" className="w-full" onClick={handlePrestige}>
                <Crown className="w-5 h-5 mr-2" /> PRESTIGE NOW
              </PixelButton>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">
              PERMANENT BONUSES
            </h3>
            <div className="space-y-3">
              <BonusRow
                icon={<Zap className="w-4 h-4" />}
                label="XP Multiplier"
                value={`${prestige.permanentBonuses.xpMultiplier.toFixed(2)}x`}
                color="text-green-400"
              />
              <BonusRow
                icon={<Package className="w-4 h-4" />}
                label="Pack Luck Bonus"
                value={`+${(prestige.permanentBonuses.packLuckBonus * 100).toFixed(0)}%`}
                color="text-purple-400"
              />
              <BonusRow
                icon={<Swords className="w-4 h-4" />}
                label="Battle Stat Bonus"
                value={`+${(prestige.permanentBonuses.battleStatBonus * 100).toFixed(0)}%`}
                color="text-red-400"
              />
              <BonusRow
                icon={<RotateCw className="w-4 h-4" />}
                label="Daily Spin Bonus"
                value={`+${(prestige.permanentBonuses.dailySpinBonus * 100).toFixed(0)}%`}
                color="text-yellow-400"
              />
            </div>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-4">
        <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">
          PRESTIGE TIERS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          {tiers?.map((tier, index) => {
            const isUnlocked = prestige.prestigeLevel >= tier.level;
            const isCurrent = prestige.prestigeTier === tier.tier;

            return (
              <div
                key={tier.tier}
                className={cn(
                  "border-2 p-3 text-center transition-all",
                  isCurrent
                    ? getTierColor(tier.tier)
                    : isUnlocked
                      ? "border-green-400/50 bg-green-400/5"
                      : "border-[#1e3a5f] opacity-50"
                )}
              >
                <div
                  className={cn(
                    "mb-1",
                    isCurrent ? getTierColor(tier.tier) : "text-[#3b82f6]"
                  )}
                >
                  {isUnlocked ? (
                    isCurrent ? (
                      getTierIcon(tier.tier)
                    ) : (
                      <CheckCircle className="w-5 h-5 mx-auto text-green-400" />
                    )
                  ) : (
                    <Lock className="w-5 h-5 mx-auto" />
                  )}
                </div>
                <p className="text-[#60a5fa] text-[8px] uppercase">{tier.tier}</p>
                <p className="text-[#3b82f6] text-[6px]">
                  {tier.xpRequired.toLocaleString()} XP
                </p>
              </div>
            );
          })}
        </div>
      </PixelCard>
    </div>
  );
}

function BonusRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 border border-[#1e3a5f]">
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className="text-[#60a5fa] text-[10px]">{label}</span>
      </div>
      <span className={cn("text-[12px]", color)}>{value}</span>
    </div>
  );
}
