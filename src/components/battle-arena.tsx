"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import { 
  Swords, 
  Search,
  Zap,
  Shield,
  Heart,
  Sparkles,
  Trophy,
  RotateCcw,
  ChevronRight,
  Star
} from "lucide-react";

interface BattleArenaProps {
  userId: string;
  className?: string;
}

type BattlePhase = "select" | "fighting" | "result";

export function BattleArena({ userId, className }: BattleArenaProps) {
  const [phase, setPhase] = useState<BattlePhase>("select");
  const [tool1Id, setTool1Id] = useState<Id<"tools"> | null>(null);
  const [tool2Id, setTool2Id] = useState<Id<"tools"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectingSlot, setSelectingSlot] = useState<1 | 2>(1);
  const [weights, setWeights] = useState({
    hp: 1,
    attack: 1,
    defense: 1,
    speed: 1,
    mana: 1,
  });

  const allTools = useQuery(api.tools.list, { limit: 50 });
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 1 ? { query: searchQuery } : "skip"
  );

  const tool1Stats = useQuery(
    api.battles.getToolBattleStats,
    tool1Id ? { toolId: tool1Id } : "skip"
  );
  const tool2Stats = useQuery(
    api.battles.getToolBattleStats,
    tool2Id ? { toolId: tool2Id } : "skip"
  );

  const battleResult = useQuery(
    api.battles.simulateBattle,
    tool1Id && tool2Id ? { tool1Id, tool2Id, weights } : "skip"
  );

  const saveBattle = useMutation(api.battles.saveBattle);

  const handleSelectTool = (toolId: Id<"tools">) => {
    if (selectingSlot === 1) {
      setTool1Id(toolId);
      setSelectingSlot(2);
    } else {
      setTool2Id(toolId);
    }
    setSearchQuery("");
  };

  const handleStartBattle = async () => {
    if (!tool1Id || !tool2Id) return;
    setPhase("fighting");
    
    setTimeout(async () => {
      setPhase("result");
      
      if (battleResult) {
        await saveBattle({
          userId,
          tool1Id,
          tool2Id,
          winnerId: battleResult.winner._id,
          tool1Score: battleResult.tool1.score,
          tool2Score: battleResult.tool2.score,
          weights,
        });
      }
    }, 2000);
  };

  const handleReset = () => {
    setTool1Id(null);
    setTool2Id(null);
    setPhase("select");
    setSelectingSlot(1);
  };

  const displayTools = searchQuery.length > 1 ? searchResults : allTools?.slice(0, 20);

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Swords className="w-5 h-5" /> BATTLE ARENA
          </h2>
          {(tool1Id || tool2Id) && (
            <PixelButton variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-3 h-3 mr-1" /> RESET
            </PixelButton>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <BattleSlot
            label="CHALLENGER"
            tool={tool1Stats?.tool}
            stats={tool1Stats?.stats}
            powerLevel={tool1Stats?.powerLevel}
            isSelected={selectingSlot === 1}
            onClick={() => setSelectingSlot(1)}
            onClear={() => setTool1Id(null)}
          />

          <div className="flex items-center justify-center">
            <div className="text-center">
              <Swords className="w-12 h-12 mx-auto text-[#3b82f6] mb-2" />
              <p className="text-[#60a5fa] text-lg">VS</p>
            </div>
          </div>

          <BattleSlot
            label="DEFENDER"
            tool={tool2Stats?.tool}
            stats={tool2Stats?.stats}
            powerLevel={tool2Stats?.powerLevel}
            isSelected={selectingSlot === 2}
            onClick={() => setSelectingSlot(2)}
            onClear={() => setTool2Id(null)}
          />
        </div>

        {phase === "select" && (
          <>
            <div className="mb-4">
              <PixelInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH TOOLS TO BATTLE..."
                className="mb-2"
              />
              <p className="text-[#3b82f6] text-[8px]">
                Selecting for: <span className="text-[#60a5fa]">{selectingSlot === 1 ? "CHALLENGER" : "DEFENDER"}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto mb-4">
              {displayTools?.map((tool) => (
                <button
                  key={tool._id}
                  onClick={() => handleSelectTool(tool._id)}
                  disabled={tool._id === tool1Id || tool._id === tool2Id}
                  className={cn(
                    "p-2 border-2 text-left transition-all",
                    tool._id === tool1Id || tool._id === tool2Id
                      ? "border-green-400 bg-green-400/10 opacity-50"
                      : "border-[#1e3a5f] hover:border-[#3b82f6] bg-[#0a1628]"
                  )}
                >
                  <p className="text-[#60a5fa] text-[8px] truncate">{tool.name}</p>
                  <p className="text-[#3b82f6] text-[6px] truncate">{tool.tagline}</p>
                </button>
              ))}
            </div>

            {tool1Id && tool2Id && (
              <div className="text-center">
                <PixelButton size="lg" onClick={handleStartBattle}>
                  <Swords className="w-5 h-5 mr-2" /> START BATTLE
                </PixelButton>
              </div>
            )}
          </>
        )}

        {phase === "fighting" && (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Swords className="w-16 h-16 mx-auto text-[#3b82f6] mb-4" />
              <p className="text-[#60a5fa] text-lg pixel-loading">BATTLE IN PROGRESS...</p>
            </div>
          </div>
        )}

        {phase === "result" && battleResult && (
          <BattleResult 
            result={battleResult} 
            onRematch={handleReset}
          />
        )}
      </PixelCard>

      {phase === "select" && tool1Id && tool2Id && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">STAT WEIGHTS</h3>
          <p className="text-[#3b82f6] text-[8px] mb-4">
            Adjust how much each stat matters in battle
          </p>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(weights).map(([stat, value]) => (
              <div key={stat} className="text-center">
                <label className="text-[#3b82f6] text-[8px] block mb-1">{stat.toUpperCase()}</label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.5"
                  value={value}
                  onChange={(e) => setWeights({ ...weights, [stat]: parseFloat(e.target.value) })}
                  className="w-full accent-[#3b82f6]"
                />
                <span className="text-[#60a5fa] text-[8px]">{value}x</span>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

interface BattleSlotProps {
  label: string;
  tool?: { name: string; tagline: string } | null;
  stats?: { hp: number; attack: number; defense: number; speed: number; mana: number } | null;
  powerLevel?: string | null;
  isSelected: boolean;
  onClick: () => void;
  onClear: () => void;
}

function BattleSlot({ label, tool, stats, powerLevel, isSelected, onClick, onClear }: BattleSlotProps) {
  const powerColors: Record<string, string> = {
    Legendary: "text-yellow-400 border-yellow-400",
    Epic: "text-purple-400 border-purple-400",
    Rare: "text-blue-400 border-blue-400",
    Common: "text-[#3b82f6] border-[#1e3a5f]",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "border-4 p-4 cursor-pointer transition-all min-h-[200px]",
        isSelected ? "border-[#3b82f6] bg-[#3b82f6]/10" : "border-[#1e3a5f]",
        tool && powerColors[powerLevel || "Common"]
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#3b82f6] text-[8px]">{label}</span>
        {tool && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-red-400 text-[8px]">
            CLEAR
          </button>
        )}
      </div>

      {tool ? (
        <div>
          <p className="text-[#60a5fa] text-[12px] mb-1">{tool.name}</p>
          <p className="text-[#3b82f6] text-[8px] mb-3">{tool.tagline}</p>
          
          {powerLevel && (
            <PixelBadge variant="outline" className={cn("text-[6px] mb-3", powerColors[powerLevel])}>
              {powerLevel.toUpperCase()}
            </PixelBadge>
          )}

          {stats && (
            <div className="space-y-1">
              <StatBar label="HP" value={stats.hp} icon={<Heart className="w-3 h-3" />} color="text-red-400" />
              <StatBar label="ATK" value={stats.attack} icon={<Swords className="w-3 h-3" />} color="text-orange-400" />
              <StatBar label="DEF" value={stats.defense} icon={<Shield className="w-3 h-3" />} color="text-blue-400" />
              <StatBar label="SPD" value={stats.speed} icon={<Zap className="w-3 h-3" />} color="text-yellow-400" />
              <StatBar label="MANA" value={stats.mana} icon={<Sparkles className="w-3 h-3" />} color="text-purple-400" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Search className="w-8 h-8 mx-auto mb-2 text-[#1e3a5f]" />
            <p className="text-[#3b82f6] text-[8px]">SELECT A TOOL</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-4", color)}>{icon}</span>
      <span className="text-[#3b82f6] text-[6px] w-8">{label}</span>
      <div className="flex-1 h-2 bg-[#0a1628] border border-[#1e3a5f]">
        <div 
          className={cn("h-full", color.replace("text-", "bg-"))}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[#60a5fa] text-[6px] w-6 text-right">{value}</span>
    </div>
  );
}

interface BattleResultProps {
  result: {
    tool1: { name: string; score: number; stats: Record<string, number> };
    tool2: { name: string; score: number; stats: Record<string, number> };
    winner: { name: string };
    loser: { name: string };
    scoreDiff: number;
    statComparisons: Array<{ stat: string; val1: number; val2: number; winner: string }>;
  };
  xpAwarded?: number;
  onRematch: () => void;
}

function BattleResult({ result, xpAwarded = 25, onRematch }: BattleResultProps) {
  const isClose = result.scoreDiff < 50;

  return (
    <div className="text-center py-6">
      <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
      <h3 className="text-yellow-400 text-lg mb-2">WINNER!</h3>
      <p className="text-[#60a5fa] text-xl mb-2">{result.winner.name}</p>
      
      <div className="flex items-center justify-center gap-2 mb-4">
        <PixelBadge variant="default" className="text-[8px] bg-green-400 text-black">
          <Zap className="w-3 h-3 mr-1" /> +{xpAwarded} XP
        </PixelBadge>
        {isClose && (
          <PixelBadge variant="outline" className="text-[8px] text-yellow-400 border-yellow-400">
            CLOSE MATCH!
          </PixelBadge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-[#60a5fa] text-[10px]">{result.tool1.name}</p>
          <p className="text-[#3b82f6] text-lg">{Math.round(result.tool1.score)}</p>
        </div>
        <div className="flex items-center justify-center">
          <Swords className="w-6 h-6 text-[#3b82f6]" />
        </div>
        <div className="text-center">
          <p className="text-[#60a5fa] text-[10px]">{result.tool2.name}</p>
          <p className="text-[#3b82f6] text-lg">{Math.round(result.tool2.score)}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6 max-w-sm mx-auto">
        {result.statComparisons.map((comp) => (
          <div key={comp.stat} className="flex items-center justify-between text-[8px]">
            <span className={cn(
              comp.winner === result.tool1.name ? "text-green-400" : "text-[#3b82f6]"
            )}>
              {comp.val1}
            </span>
            <span className="text-[#60a5fa]">{comp.stat}</span>
            <span className={cn(
              comp.winner === result.tool2.name ? "text-green-400" : "text-[#3b82f6]"
            )}>
              {comp.val2}
            </span>
          </div>
        ))}
      </div>

      <PixelButton onClick={onRematch}>
        <RotateCcw className="w-4 h-4 mr-2" /> NEW BATTLE
      </PixelButton>
    </div>
  );
}
