"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Skull,
  Swords,
  Heart,
  Shield,
  Zap,
  Users,
  Trophy,
  Target,
  Clock,
  Flame,
  Crown,
} from "lucide-react";

interface GlobalRaidProps {
  userId: string;
  className?: string;
}

export function GlobalRaid({ userId, className }: GlobalRaidProps) {
  const [selectedTools, setSelectedTools] = useState<Id<"tools">[]>([]);
  const [attackResult, setAttackResult] = useState<{
    damage: number;
    isCritical: boolean;
    xpEarned: number;
  } | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);

  const activeRaid = useQuery(api.globalRaids.getActiveRaid);
  const userStats = useQuery(api.globalRaids.getUserRaidStats, { userId });
  const allTools = useQuery(api.tools.list, { limit: 20 });
  const attack = useMutation(api.globalRaids.attackBoss);

  const handleAttack = async () => {
    if (selectedTools.length === 0 || !activeRaid) return;

    setIsAttacking(true);
    setAttackResult(null);

    try {
      const result = await attack({ userId, toolIds: selectedTools });
      setAttackResult(result);
    } catch (error) {
      console.error("Attack failed:", error);
    } finally {
      setIsAttacking(false);
    }
  };

  const toggleTool = (toolId: Id<"tools">) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter((id) => id !== toolId));
    } else if (selectedTools.length < 5) {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const getTimeRemaining = (endsAt: number) => {
    const now = Date.now();
    const diff = endsAt - now;
    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  if (!activeRaid) {
    return (
      <PixelCard className={cn("p-6 text-center", className)}>
        <Skull className="w-16 h-16 mx-auto text-[#1e3a5f] mb-4" />
        <p className="text-[#60a5fa] text-lg mb-2">NO ACTIVE RAID</p>
        <p className="text-[#3b82f6] text-[10px]">
          Check back later for the next global boss battle!
        </p>
      </PixelCard>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" /> GLOBAL RAID
          </h2>
          <div className="flex items-center gap-2">
            <PixelBadge variant="outline" className="text-[8px] text-red-400 border-red-400">
              <Clock className="w-3 h-3 mr-1" /> {getTimeRemaining(activeRaid.endsAt)}
            </PixelBadge>
            <PixelBadge variant="outline" className="text-[8px]">
              <Users className="w-3 h-3 mr-1" /> {activeRaid.participantCount}
            </PixelBadge>
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-red-400 text-xl mb-2">{activeRaid.bossName}</h3>
          <p className="text-[#3b82f6] text-[10px] mb-4">{activeRaid.description}</p>

          <div className="relative w-full max-w-md mx-auto mb-4">
            <div className="flex justify-between text-[8px] mb-1">
              <span className="text-red-400">BOSS HP</span>
              <span className="text-[#60a5fa]">
                {activeRaid.currentHp.toLocaleString()} / {activeRaid.bossHp.toLocaleString()}
              </span>
            </div>
            <div className="h-6 bg-[#0a1628] border-2 border-red-400">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                initial={{ width: "100%" }}
                animate={{ width: `${activeRaid.hpPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold drop-shadow-lg">
                {activeRaid.hpPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <Swords className="w-5 h-5 mx-auto text-orange-400 mb-1" />
              <p className="text-orange-400 text-[12px]">{activeRaid.bossStats.attack}</p>
              <p className="text-[#3b82f6] text-[6px]">ATK</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 mx-auto text-blue-400 mb-1" />
              <p className="text-blue-400 text-[12px]">{activeRaid.bossStats.defense}</p>
              <p className="text-[#3b82f6] text-[6px]">DEF</p>
            </div>
            <div className="text-center">
              <Zap className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
              <p className="text-yellow-400 text-[12px]">{activeRaid.bossStats.speed}</p>
              <p className="text-[#3b82f6] text-[6px]">SPD</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-[#60a5fa] text-[10px] uppercase mb-3">
            SELECT TOOLS TO ATTACK (MAX 5)
          </h4>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-32 overflow-y-auto">
            {allTools?.map((tool) => (
              <button
                key={tool._id}
                onClick={() => toggleTool(tool._id)}
                className={cn(
                  "p-2 border-2 text-center transition-all",
                  selectedTools.includes(tool._id)
                    ? "border-green-400 bg-green-400/10"
                    : "border-[#1e3a5f] hover:border-[#3b82f6]"
                )}
              >
                <p className="text-[#60a5fa] text-[6px] truncate">{tool.name}</p>
              </button>
            ))}
          </div>
          <p className="text-[#3b82f6] text-[8px] mt-2">
            Selected: {selectedTools.length}/5 tools
          </p>
        </div>

        <div className="text-center">
          <PixelButton
            size="lg"
            onClick={handleAttack}
            disabled={selectedTools.length === 0 || isAttacking}
            className={cn(isAttacking && "animate-pulse")}
          >
            {isAttacking ? (
              <>
                <Swords className="w-5 h-5 mr-2 animate-bounce" /> ATTACKING...
              </>
            ) : (
              <>
                <Swords className="w-5 h-5 mr-2" /> ATTACK BOSS
              </>
            )}
          </PixelButton>
        </div>

        <AnimatePresence>
          {attackResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 text-center"
            >
              <div
                className={cn(
                  "border-4 p-4",
                  attackResult.isCritical
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-green-400 bg-green-400/10"
                )}
              >
                {attackResult.isCritical && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 text-lg">CRITICAL HIT!</span>
                    <Flame className="w-5 h-5 text-yellow-400" />
                  </div>
                )}
                <p className="text-[#60a5fa] text-[10px]">Damage Dealt</p>
                <p className="text-green-400 text-2xl">{attackResult.damage.toLocaleString()}</p>
                <p className="text-green-400 text-[10px] mt-2">
                  +{attackResult.xpEarned} XP
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PixelCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> TOP DAMAGERS
          </h3>
          <div className="space-y-2">
            {activeRaid.topDamagers?.map((damager, index) => (
              <div
                key={damager._id}
                className="flex items-center justify-between p-2 border border-[#1e3a5f]"
              >
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <span className="text-[#3b82f6] text-[10px] w-4">#{index + 1}</span>
                  )}
                  <span className="text-[#60a5fa] text-[10px]">
                    {damager.user?.username ?? "Unknown"}
                  </span>
                </div>
                <span className="text-red-400 text-[10px]">
                  {damager.damageDealt.toLocaleString()} DMG
                </span>
              </div>
            ))}
          </div>
        </PixelCard>

        {userStats && (
          <PixelCard className="p-4">
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" /> YOUR RAID STATS
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Raids Joined" value={userStats.raidsParticipated} />
              <StatBox label="Victories" value={userStats.victories} color="text-green-400" />
              <StatBox
                label="Total Damage"
                value={userStats.totalDamage.toLocaleString()}
                color="text-red-400"
              />
              <StatBox label="Total Attacks" value={userStats.totalAttacks} />
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color = "text-[#60a5fa]",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="border border-[#1e3a5f] p-2 text-center">
      <p className={cn("text-lg", color)}>{value}</p>
      <p className="text-[#3b82f6] text-[6px]">{label}</p>
    </div>
  );
}
