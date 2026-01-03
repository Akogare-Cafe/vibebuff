"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { Zap, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SynergyMatrixProps {
  toolId: Id<"tools">;
  className?: string;
}

export function SynergyMatrix({ toolId, className }: SynergyMatrixProps) {
  const synergies = useQuery(api.synergies.getToolSynergies, { toolId });

  if (!synergies || synergies.length === 0) {
    return null;
  }

  const getSynergyColor = (type: string, score: number) => {
    if (type === "conflict" || score < 0) return "text-red-400 border-red-400";
    if (type === "combo" || score >= 80) return "text-yellow-400 border-yellow-400";
    if (type === "integration") return "text-green-400 border-green-400";
    return "text-muted-foreground border-primary";
  };

  const getSynergyIcon = (type: string) => {
    switch (type) {
      case "combo": return <Sparkles className="w-3 h-3" />;
      case "integration": return <Zap className="w-3 h-3" />;
      case "conflict": return <AlertTriangle className="w-3 h-3" />;
      default: return <ArrowRight className="w-3 h-3" />;
    }
  };

  return (
    <PixelCard className={cn("p-4", className)}>
      <h3 className="text-primary text-[10px] uppercase mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" /> SYNERGY MATRIX
      </h3>
      
      <div className="space-y-3">
        {synergies.map((synergy) => (
          <div
            key={synergy._id}
            className={cn(
              "border-2 p-3 bg-[#191022]/50",
              getSynergyColor(synergy.synergyType, synergy.synergyScore)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSynergyIcon(synergy.synergyType)}
                <span className="text-primary text-[10px]">
                  {synergy.otherTool?.name}
                </span>
              </div>
              <PixelBadge
                variant={synergy.synergyScore >= 0 ? "default" : "outline"}
                className="text-[8px]"
              >
                {synergy.synergyScore > 0 ? "+" : ""}{synergy.synergyScore}
              </PixelBadge>
            </div>
            
            <p className="text-muted-foreground text-[8px] mb-2">
              {synergy.description}
            </p>
            
            {synergy.bonusEffect && (
              <div className="bg-[#191022] border border-primary px-2 py-1 inline-flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-primary text-[8px]">
                  {synergy.bonusEffect}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </PixelCard>
  );
}

interface DeckSynergyDisplayProps {
  toolIds: Id<"tools">[];
  className?: string;
}

export function DeckSynergyDisplay({ toolIds, className }: DeckSynergyDisplayProps) {
  const synergyData = useQuery(api.synergies.calculateDeckSynergy, { toolIds });

  if (!synergyData || synergyData.synergies.length === 0) {
    return (
      <div className={cn("text-center p-4", className)}>
        <p className="text-muted-foreground text-[10px]">NO SYNERGIES DETECTED</p>
        <p className="text-muted-foreground text-[8px]">Add more tools to see combos</p>
      </div>
    );
  }

  const scoreColor = synergyData.totalScore >= 100 
    ? "text-yellow-400" 
    : synergyData.totalScore >= 50 
      ? "text-green-400" 
      : synergyData.totalScore >= 0 
        ? "text-primary" 
        : "text-red-400";

  return (
    <PixelCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary text-[10px] uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> DECK SYNERGY
        </h3>
        <div className={cn("text-lg font-bold", scoreColor)}>
          {synergyData.totalScore > 0 ? "+" : ""}{synergyData.totalScore}
        </div>
      </div>

      <div className="space-y-2">
        {synergyData.synergies.map((syn, i) => (
          <div key={i} className="flex items-center justify-between text-[8px] border-b border-border pb-2">
            <span className="text-muted-foreground">
              {syn.toolA} + {syn.toolB}
            </span>
            <div className="flex items-center gap-2">
              {syn.bonusEffect && (
                <span className="text-primary">{syn.bonusEffect}</span>
              )}
              <span className={syn.score >= 0 ? "text-green-400" : "text-red-400"}>
                {syn.score > 0 ? "+" : ""}{syn.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
