"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Combine, 
  Sparkles,
  Plus,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Heart,
  Gauge,
  Coins,
  X
} from "lucide-react";

interface ToolFusionProps {
  userId: string;
  className?: string;
}

export function ToolFusion({ userId, className }: ToolFusionProps) {
  const [tool1Id, setTool1Id] = useState<Id<"tools"> | null>(null);
  const [tool2Id, setTool2Id] = useState<Id<"tools"> | null>(null);
  const [fusionResult, setFusionResult] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const allTools = useQuery(api.tools.list, { limit: 100 });
  const userFusions = useQuery(api.fusions.getUserFusions, { userId });
  const attemptFusion = useMutation(api.fusions.attemptFusion);

  const tool1 = allTools?.find((t) => t._id === tool1Id);
  const tool2 = allTools?.find((t) => t._id === tool2Id);

  const handleFusion = async () => {
    if (!tool1Id || !tool2Id) return;
    
    setIsAnimating(true);
    setFusionResult(null);

    setTimeout(async () => {
      const result = await attemptFusion({ userId, tool1Id, tool2Id });
      setFusionResult(result);
      setIsAnimating(false);
    }, 2000);
  };

  const clearSelection = () => {
    setTool1Id(null);
    setTool2Id(null);
    setFusionResult(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Combine className="w-4 h-4" /> TOOL FUSION LAB
        </h2>
        <PixelBadge variant="default">
          {userFusions?.length || 0} DISCOVERED
        </PixelBadge>
      </div>

      <PixelCard className="p-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <FusionSlot 
            tool={tool1} 
            onSelect={(id) => setTool1Id(id)}
            onClear={() => setTool1Id(null)}
            allTools={allTools || []}
            excludeId={tool2Id}
          />
          
          <Plus className="w-8 h-8 text-[#3b82f6]" />
          
          <FusionSlot 
            tool={tool2} 
            onSelect={(id) => setTool2Id(id)}
            onClear={() => setTool2Id(null)}
            allTools={allTools || []}
            excludeId={tool1Id}
          />
          
          <ArrowRight className="w-8 h-8 text-[#3b82f6]" />
          
          <div className={cn(
            "w-24 h-24 border-4 border-dashed flex items-center justify-center",
            fusionResult?.success ? "border-yellow-400 bg-yellow-400/10" : "border-[#1e3a5f]"
          )}>
            {isAnimating ? (
              <Sparkles className="w-10 h-10 text-yellow-400 animate-spin" />
            ) : fusionResult?.success ? (
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-yellow-400 mx-auto" />
                <p className="text-yellow-400 text-[8px] mt-1">
                  {fusionResult.isNew ? "NEW!" : "KNOWN"}
                </p>
              </div>
            ) : (
              <span className="text-[#3b82f6] text-[8px]">RESULT</span>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <PixelButton 
            onClick={handleFusion}
            disabled={!tool1Id || !tool2Id || isAnimating}
          >
            <Combine className="w-4 h-4 mr-2" /> FUSE TOOLS
          </PixelButton>
          <PixelButton variant="ghost" onClick={clearSelection}>
            CLEAR
          </PixelButton>
        </div>
      </PixelCard>

      {fusionResult && (
        <FusionResultCard result={fusionResult} />
      )}

      {userFusions && userFusions.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" /> YOUR DISCOVERED FUSIONS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userFusions.map((uf: any) => (
              <FusionCard key={uf._id} fusion={uf.fusion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FusionSlotProps {
  tool: any;
  onSelect: (id: Id<"tools">) => void;
  onClear: () => void;
  allTools: any[];
  excludeId: Id<"tools"> | null;
}

function FusionSlot({ tool, onSelect, onClear, allTools, excludeId }: FusionSlotProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableTools = allTools.filter((t) => t._id !== excludeId);

  return (
    <div className="relative">
      {tool ? (
        <div className="w-24 h-24 border-4 border-[#3b82f6] bg-[#0a1628] p-2 text-center relative">
          <button 
            onClick={onClear}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
          <Star className="w-6 h-6 mx-auto text-[#3b82f6] mb-1" />
          <p className="text-[#60a5fa] text-[8px] truncate">{tool.name}</p>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-24 h-24 border-4 border-dashed border-[#1e3a5f] flex items-center justify-center hover:border-[#3b82f6] transition-colors"
        >
          <Plus className="w-8 h-8 text-[#3b82f6]" />
        </button>
      )}

      {isOpen && !tool && (
        <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-[#0a1628] border-2 border-[#1e3a5f] z-20">
          {availableTools.slice(0, 20).map((t) => (
            <button
              key={t._id}
              onClick={() => {
                onSelect(t._id);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#1e3a5f] text-[#60a5fa] text-[10px] border-b border-[#1e3a5f]"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FusionResultCard({ result }: { result: any }) {
  if (!result.success) {
    return (
      <PixelCard className="p-4 border-red-400">
        <p className="text-red-400 text-center">{result.message}</p>
      </PixelCard>
    );
  }

  const fusion = result.fusion;
  const rarityColors = {
    rare: "border-purple-400 bg-purple-400/10",
    epic: "border-orange-400 bg-orange-400/10",
    legendary: "border-yellow-400 bg-yellow-400/10",
  };

  return (
    <PixelCard className={cn("p-6", rarityColors[fusion.rarity as keyof typeof rarityColors])}>
      {result.isNew && (
        <div className="text-center mb-4">
          <PixelBadge variant="default" className="bg-yellow-400 text-black">
            <Sparkles className="w-3 h-3 mr-1" /> NEW FUSION DISCOVERED!
          </PixelBadge>
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-[#60a5fa] text-lg">{fusion.name}</h3>
        <p className="text-[#3b82f6] text-[10px]">{fusion.description}</p>
        <PixelBadge variant="outline" className="text-[8px] mt-2">
          {fusion.rarity.toUpperCase()}
        </PixelBadge>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        <StatBar icon={<Heart className="w-3 h-3" />} label="HP" value={fusion.resultStats.hp} />
        <StatBar icon={<Zap className="w-3 h-3" />} label="ATK" value={fusion.resultStats.attack} />
        <StatBar icon={<Shield className="w-3 h-3" />} label="DEF" value={fusion.resultStats.defense} />
        <StatBar icon={<Gauge className="w-3 h-3" />} label="SPD" value={fusion.resultStats.speed} />
        <StatBar icon={<Coins className="w-3 h-3" />} label="MANA" value={fusion.resultStats.mana} />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {fusion.bonusEffects.map((effect: string, i: number) => (
          <PixelBadge key={i} variant="outline" className="text-[8px] text-green-400 border-green-400">
            {effect}
          </PixelBadge>
        ))}
      </div>
    </PixelCard>
  );
}

function StatBar({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[#3b82f6] mb-1">{icon}</div>
      <div className="h-16 w-full bg-[#0a1628] border border-[#1e3a5f] relative">
        <div 
          className="absolute bottom-0 w-full bg-[#3b82f6]"
          style={{ height: `${value}%` }}
        />
      </div>
      <p className="text-[#60a5fa] text-[8px] mt-1">{value}</p>
      <p className="text-[#3b82f6] text-[6px]">{label}</p>
    </div>
  );
}

function FusionCard({ fusion }: { fusion: any }) {
  const rarityColors = {
    rare: "border-purple-400",
    epic: "border-orange-400",
    legendary: "border-yellow-400",
  };

  return (
    <PixelCard className={cn("p-3", rarityColors[fusion.rarity as keyof typeof rarityColors])}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[#60a5fa] text-[11px]">{fusion.name}</h4>
        <PixelBadge variant="outline" className="text-[6px]">
          {fusion.rarity.toUpperCase()}
        </PixelBadge>
      </div>
      
      <div className="flex items-center gap-1 text-[8px] text-[#3b82f6] mb-2">
        <span>{fusion.tool1?.name}</span>
        <Plus className="w-2 h-2" />
        <span>{fusion.tool2?.name}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {fusion.bonusEffects.slice(0, 2).map((effect: string, i: number) => (
          <PixelBadge key={i} variant="outline" className="text-[6px]">
            {effect}
          </PixelBadge>
        ))}
      </div>
    </PixelCard>
  );
}
