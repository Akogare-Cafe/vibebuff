"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Swords, 
  Heart, 
  Zap, 
  Shield, 
  Gauge, 
  Sparkles,
  Trophy,
  RotateCcw,
  Play
} from "lucide-react";

interface BossBattleProps {
  tool1Id: Id<"tools">;
  tool2Id: Id<"tools">;
  userId?: string;
  onBattleComplete?: (winnerId: Id<"tools">) => void;
}

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  icon: React.ReactNode;
  color: string;
  animate?: boolean;
}

function StatBar({ label, value, maxValue = 100, icon, color, animate }: StatBarProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setDisplayValue(value), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 text-[8px] text-[#3b82f6]">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-[8px] text-[#60a5fa]">{displayValue}</span>
      </div>
      <div className="h-3 bg-[#0a1628] border border-[#1e3a5f] overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000 ease-out", color)}
          style={{ width: `${(displayValue / maxValue) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function BossBattle({ tool1Id, tool2Id, userId, onBattleComplete }: BossBattleProps) {
  const [battleState, setBattleState] = useState<"idle" | "fighting" | "complete">("idle");
  const [weights, setWeights] = useState({
    hp: 1,
    attack: 1,
    defense: 1,
    speed: 1,
    mana: 1,
  });

  const battleResult = useQuery(api.battles.simulateBattle, {
    tool1Id,
    tool2Id,
    weights: battleState !== "idle" ? weights : undefined,
  });

  const saveBattle = useMutation(api.battles.saveBattle);

  const startBattle = () => {
    setBattleState("fighting");
    setTimeout(() => {
      setBattleState("complete");
      if (battleResult?.winner && onBattleComplete) {
        onBattleComplete(battleResult.winner._id);
      }
      // Save battle result
      if (battleResult) {
        saveBattle({
          userId,
          tool1Id,
          tool2Id,
          winnerId: battleResult.winner._id,
          tool1Score: battleResult.tool1.score,
          tool2Score: battleResult.tool2.score,
          weights,
        });
      }
    }, 3000);
  };

  const resetBattle = () => {
    setBattleState("idle");
  };

  if (!battleResult) {
    return (
      <PixelCard className="p-8 text-center">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING COMBATANTS...</div>
      </PixelCard>
    );
  }

  const { tool1, tool2, winner, statComparisons } = battleResult;

  return (
    <div className="space-y-6">
      {/* Battle Arena */}
      <div className="relative">
        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className={cn(
            "w-16 h-16 rounded-full border-4 border-[#3b82f6] bg-[#0a1628] flex items-center justify-center",
            battleState === "fighting" && "animate-pulse border-yellow-400"
          )}>
            <Swords className={cn(
              "w-8 h-8",
              battleState === "fighting" ? "text-yellow-400 animate-spin" : "text-[#60a5fa]"
            )} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Tool 1 */}
          <PixelCard 
            className={cn(
              "p-4 transition-all duration-500",
              battleState === "complete" && winner._id === tool1._id && "border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]",
              battleState === "complete" && winner._id !== tool1._id && "opacity-50"
            )}
            rarity={battleState === "complete" && winner._id === tool1._id ? "legendary" : "common"}
          >
            <PixelCardHeader>
              <PixelCardTitle className="text-center">{tool1.name}</PixelCardTitle>
              <p className="text-[#3b82f6] text-[8px] text-center mt-1">{tool1.tagline}</p>
            </PixelCardHeader>
            <PixelCardContent>
              <StatBar 
                label="HP" 
                value={tool1.stats.hp} 
                icon={<Heart className="w-3 h-3" />} 
                color="bg-red-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="ATK" 
                value={tool1.stats.attack} 
                icon={<Zap className="w-3 h-3" />} 
                color="bg-orange-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="DEF" 
                value={tool1.stats.defense} 
                icon={<Shield className="w-3 h-3" />} 
                color="bg-blue-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="SPD" 
                value={tool1.stats.speed} 
                icon={<Gauge className="w-3 h-3" />} 
                color="bg-green-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="MANA" 
                value={tool1.stats.mana} 
                icon={<Sparkles className="w-3 h-3" />} 
                color="bg-purple-500"
                animate={battleState === "fighting"}
              />
              
              {battleState === "complete" && (
                <div className="mt-4 text-center">
                  <p className="text-[#60a5fa] text-lg">{Math.round(tool1.score)}</p>
                  <p className="text-[#3b82f6] text-[8px]">TOTAL SCORE</p>
                </div>
              )}
            </PixelCardContent>
          </PixelCard>

          {/* Tool 2 */}
          <PixelCard 
            className={cn(
              "p-4 transition-all duration-500",
              battleState === "complete" && winner._id === tool2._id && "border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]",
              battleState === "complete" && winner._id !== tool2._id && "opacity-50"
            )}
            rarity={battleState === "complete" && winner._id === tool2._id ? "legendary" : "common"}
          >
            <PixelCardHeader>
              <PixelCardTitle className="text-center">{tool2.name}</PixelCardTitle>
              <p className="text-[#3b82f6] text-[8px] text-center mt-1">{tool2.tagline}</p>
            </PixelCardHeader>
            <PixelCardContent>
              <StatBar 
                label="HP" 
                value={tool2.stats.hp} 
                icon={<Heart className="w-3 h-3" />} 
                color="bg-red-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="ATK" 
                value={tool2.stats.attack} 
                icon={<Zap className="w-3 h-3" />} 
                color="bg-orange-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="DEF" 
                value={tool2.stats.defense} 
                icon={<Shield className="w-3 h-3" />} 
                color="bg-blue-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="SPD" 
                value={tool2.stats.speed} 
                icon={<Gauge className="w-3 h-3" />} 
                color="bg-green-500"
                animate={battleState === "fighting"}
              />
              <StatBar 
                label="MANA" 
                value={tool2.stats.mana} 
                icon={<Sparkles className="w-3 h-3" />} 
                color="bg-purple-500"
                animate={battleState === "fighting"}
              />
              
              {battleState === "complete" && (
                <div className="mt-4 text-center">
                  <p className="text-[#60a5fa] text-lg">{Math.round(tool2.score)}</p>
                  <p className="text-[#3b82f6] text-[8px]">TOTAL SCORE</p>
                </div>
              )}
            </PixelCardContent>
          </PixelCard>
        </div>
      </div>

      {/* Weight Adjusters (only show before battle) */}
      {battleState === "idle" && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">ADJUST PRIORITIES</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(weights).map(([stat, value]) => (
              <div key={stat} className="text-center">
                <p className="text-[#3b82f6] text-[8px] uppercase mb-2">{stat}</p>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.5"
                  value={value}
                  onChange={(e) => setWeights({ ...weights, [stat]: parseFloat(e.target.value) })}
                  className="w-full accent-[#3b82f6]"
                />
                <p className="text-[#60a5fa] text-[10px]">{value}x</p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Battle Result */}
      {battleState === "complete" && (
        <PixelCard className="p-6 text-center border-yellow-400" rarity="legendary">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-yellow-400 text-lg mb-2">VICTORY!</h2>
          <p className="text-[#60a5fa] text-sm mb-4">{winner.name} WINS!</p>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {statComparisons.map((comp) => (
              <div key={comp.stat} className="text-center">
                <p className="text-[#3b82f6] text-[8px]">{comp.stat}</p>
                <p className={cn(
                  "text-[10px]",
                  comp.winner === winner.name ? "text-green-400" : "text-[#1e3a5f]"
                )}>
                  {comp.winner === tool1.name ? "◀" : "▶"}
                </p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {battleState === "idle" && (
          <PixelButton size="lg" onClick={startBattle}>
            <Play className="w-4 h-4 mr-2" /> START BATTLE
          </PixelButton>
        )}
        {battleState === "complete" && (
          <PixelButton variant="secondary" onClick={resetBattle}>
            <RotateCcw className="w-4 h-4 mr-2" /> REMATCH
          </PixelButton>
        )}
      </div>
    </div>
  );
}

// Mini battle card for quick comparisons
interface MiniBattleCardProps {
  toolId: Id<"tools">;
  className?: string;
}

export function MiniBattleCard({ toolId, className }: MiniBattleCardProps) {
  const stats = useQuery(api.battles.getToolBattleStats, { toolId });

  if (!stats) return null;

  return (
    <div className={cn("flex items-center gap-2 p-2 border border-[#1e3a5f] bg-[#0a1628]", className)}>
      <div className="flex-1">
        <p className="text-[#60a5fa] text-[10px]">{stats.tool.name}</p>
        <p className="text-[#3b82f6] text-[8px]">PWR: {stats.totalPower}</p>
      </div>
      <PixelBadge 
        variant={stats.powerLevel === "Legendary" ? "default" : "outline"}
        className="text-[6px]"
      >
        {stats.powerLevel}
      </PixelBadge>
    </div>
  );
}
