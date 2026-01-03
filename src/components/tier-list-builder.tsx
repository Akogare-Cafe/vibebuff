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
import Link from "next/link";
import { 
  BarChart3, 
  Save,
  Share2,
  ThumbsUp,
  Copy,
  Check,
  Plus,
  X,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface TierListBuilderProps {
  userId: string;
  categoryId: Id<"categories">;
  className?: string;
}

const TIER_CONFIG = {
  s: { label: "S", color: "bg-red-500/20 border-red-500", textColor: "text-red-400" },
  a: { label: "A", color: "bg-orange-500/20 border-orange-500", textColor: "text-orange-400" },
  b: { label: "B", color: "bg-yellow-500/20 border-yellow-500", textColor: "text-yellow-400" },
  c: { label: "C", color: "bg-green-500/20 border-green-500", textColor: "text-green-400" },
  d: { label: "D", color: "bg-blue-500/20 border-blue-500", textColor: "text-blue-400" },
};

type TierKey = keyof typeof TIER_CONFIG;

export function TierListBuilder({ userId, categoryId, className }: TierListBuilderProps) {
  const [name, setName] = useState("My Tier List");
  const [tiers, setTiers] = useState<Record<TierKey, Id<"tools">[]>>({
    s: [], a: [], b: [], c: [], d: [],
  });
  const [isPublic, setIsPublic] = useState(false);

  const categoryTools = useQuery(api.tools.list, { limit: 50 });
  const createTierList = useMutation(api.tierLists.create);

  const unrankedTools = categoryTools?.filter(
    (tool) => !Object.values(tiers).flat().includes(tool._id)
  ) || [];

  const addToTier = (toolId: Id<"tools">, tier: TierKey) => {
    setTiers((prev) => ({
      ...prev,
      [tier]: [...prev[tier], toolId],
    }));
  };

  const removeFromTier = (toolId: Id<"tools">, tier: TierKey) => {
    setTiers((prev) => ({
      ...prev,
      [tier]: prev[tier].filter((id) => id !== toolId),
    }));
  };

  const moveTier = (toolId: Id<"tools">, fromTier: TierKey, direction: "up" | "down") => {
    const tierOrder: TierKey[] = ["s", "a", "b", "c", "d"];
    const currentIndex = tierOrder.indexOf(fromTier);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= tierOrder.length) return;
    
    const toTier = tierOrder[newIndex];
    setTiers((prev) => ({
      ...prev,
      [fromTier]: prev[fromTier].filter((id) => id !== toolId),
      [toTier]: [...prev[toTier], toolId],
    }));
  };

  const handleSave = async () => {
    await createTierList({
      userId,
      categoryId,
      name,
      tiers,
      isPublic,
    });
  };

  const getToolById = (id: Id<"tools">) => categoryTools?.find((t) => t._id === id);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> TIER LIST BUILDER
        </h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-muted-foreground text-[10px]">PUBLIC</span>
          </label>
          <PixelButton onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> SAVE
          </PixelButton>
        </div>
      </div>

      <PixelInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="TIER LIST NAME"
      />

      <div className="space-y-2">
        {(Object.entries(TIER_CONFIG) as [TierKey, typeof TIER_CONFIG.s][]).map(([tier, config]) => (
          <div key={tier} className={cn("flex border-2 min-h-[60px]", config.color)}>
            <div className={cn("w-12 flex items-center justify-center font-bold text-xl", config.textColor)}>
              {config.label}
            </div>
            <div className="flex-1 flex flex-wrap gap-2 p-2 bg-[#191022]/50">
              {tiers[tier].map((toolId) => {
                const tool = getToolById(toolId);
                if (!tool) return null;
                return (
                  <div
                    key={toolId}
                    className="group relative border border-border bg-[#191022] px-2 py-1"
                  >
                    <span className="text-primary text-[10px]">{tool.name}</span>
                    <div className="absolute -top-6 right-0 hidden group-hover:flex gap-1">
                      <button
                        onClick={() => moveTier(toolId, tier, "up")}
                        className="p-0.5 bg-[#191022] border border-primary text-muted-foreground"
                        disabled={tier === "s"}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveTier(toolId, tier, "down")}
                        className="p-0.5 bg-[#191022] border border-primary text-muted-foreground"
                        disabled={tier === "d"}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromTier(toolId, tier)}
                        className="p-0.5 bg-[#191022] border border-red-400 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <PixelCard className="p-4">
        <h3 className="text-primary text-[10px] uppercase mb-3">UNRANKED TOOLS</h3>
        <div className="flex flex-wrap gap-2">
          {unrankedTools.map((tool) => (
            <div key={tool._id} className="group relative">
              <PixelBadge variant="outline" className="text-[8px] cursor-pointer">
                {tool.name}
              </PixelBadge>
              <div className="absolute -top-8 left-0 hidden group-hover:flex gap-1 z-10">
                {(Object.keys(TIER_CONFIG) as TierKey[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => addToTier(tool._id, tier)}
                    className={cn(
                      "w-6 h-6 text-[10px] font-bold border",
                      TIER_CONFIG[tier].color,
                      TIER_CONFIG[tier].textColor
                    )}
                  >
                    {tier.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PixelCard>
    </div>
  );
}

interface TierListDisplayProps {
  tierListId?: Id<"tierLists">;
  shareToken?: string;
  className?: string;
}

export function TierListDisplay({ tierListId, shareToken, className }: TierListDisplayProps) {
  const tierList = useQuery(
    api.tierLists.getByShareToken,
    shareToken ? { shareToken } : "skip"
  );

  if (!tierList) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground text-[10px] pixel-loading">LOADING TIER LIST...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary text-sm">{tierList.name}</h2>
          <p className="text-muted-foreground text-[8px]">{tierList.category?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <PixelBadge variant="outline" className="text-[8px]">
            <ThumbsUp className="w-3 h-3 mr-1" /> {tierList.upvotes}
          </PixelBadge>
        </div>
      </div>

      <div className="space-y-1">
        {(Object.entries(TIER_CONFIG) as [TierKey, typeof TIER_CONFIG.s][]).map(([tier, config]) => (
          <div key={tier} className={cn("flex border-2 min-h-[50px]", config.color)}>
            <div className={cn("w-10 flex items-center justify-center font-bold text-lg", config.textColor)}>
              {config.label}
            </div>
            <div className="flex-1 flex flex-wrap gap-1 p-2 bg-[#191022]/50">
              {tierList.tiers[tier].map((toolId: string) => {
                const tool = tierList.toolsMap[toolId];
                if (!tool) return null;
                return (
                  <Link key={toolId} href={`/tools/${tool.slug}`}>
                    <PixelBadge variant="outline" className="text-[8px] hover:border-primary">
                      {tool.name}
                    </PixelBadge>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunityConsensusTierList({ categoryId }: { categoryId: Id<"categories"> }) {
  const consensus = useQuery(api.tierLists.getCommunityConsensus, { categoryId });

  if (!consensus) return null;

  return (
    <PixelCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary text-[10px] uppercase flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> COMMUNITY CONSENSUS
        </h3>
        <PixelBadge variant="outline" className="text-[6px]">
          {consensus.totalLists} LISTS
        </PixelBadge>
      </div>

      <div className="space-y-1">
        {(Object.entries(TIER_CONFIG) as [TierKey, typeof TIER_CONFIG.s][]).map(([tier, config]) => (
          <div key={tier} className={cn("flex border min-h-[30px]", config.color)}>
            <div className={cn("w-8 flex items-center justify-center font-bold text-sm", config.textColor)}>
              {config.label}
            </div>
            <div className="flex-1 flex flex-wrap gap-1 p-1 bg-[#191022]/50">
              {consensus.consensus[tier].slice(0, 5).map((toolId: string) => (
                <PixelBadge key={toolId} variant="outline" className="text-[6px]">
                  {toolId.slice(-4)}
                </PixelBadge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
