"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Package, 
  Sparkles,
  Star,
  Clock,
  Gift,
  ChevronRight,
  X
} from "lucide-react";

interface PackOpeningProps {
  userId: string;
  className?: string;
}

export function PackOpening({ userId, className }: PackOpeningProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedTools, setRevealedTools] = useState<any[] | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const packTypes = useQuery(api.packs.getPackTypes);
  const canOpenFree = useQuery(api.packs.canOpenFreePack, { userId });
  const openPack = useMutation(api.packs.openPack);

  const handleOpenPack = async (packSlug: string) => {
    setSelectedPack(packSlug);
    setIsOpening(true);
    
    try {
      const result = await openPack({ userId, packTypeSlug: packSlug });
      
      setTimeout(() => {
        setRevealedTools(result.tools);
        setIsOpening(false);
      }, 2000);
    } catch (error) {
      setIsOpening(false);
      setSelectedPack(null);
    }
  };

  const closeReveal = () => {
    setRevealedTools(null);
    setSelectedPack(null);
  };

  if (!packTypes) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING PACKS...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Package className="w-4 h-4" /> TOOL PACKS
        </h2>
      </div>

      {canOpenFree && canOpenFree.canOpen && (
        <PixelCard className="p-4 border-yellow-400 bg-yellow-400/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-yellow-400 text-[12px]">FREE DAILY PACK AVAILABLE!</p>
                <p className="text-[#3b82f6] text-[8px]">Open now to discover new tools</p>
              </div>
            </div>
            <PixelButton onClick={() => handleOpenPack("daily-free")}>
              <Sparkles className="w-4 h-4 mr-2" /> OPEN FREE
            </PixelButton>
          </div>
        </PixelCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packTypes.map((pack) => (
          <PackCard 
            key={pack._id} 
            pack={pack} 
            onOpen={() => handleOpenPack(pack.slug)}
            isOpening={isOpening && selectedPack === pack.slug}
            canOpenFree={pack.slug === "daily-free" && canOpenFree?.canOpen}
          />
        ))}
      </div>

      {isOpening && (
        <PackOpeningAnimation />
      )}

      {revealedTools && (
        <RevealModal tools={revealedTools} onClose={closeReveal} />
      )}
    </div>
  );
}

interface PackCardProps {
  pack: {
    _id: string;
    slug: string;
    name: string;
    description: string;
    cost: "free" | "premium";
    cardCount: number;
    rarityWeights: {
      common: number;
      uncommon: number;
      rare: number;
      legendary: number;
    };
  };
  onOpen: () => void;
  isOpening: boolean;
  canOpenFree?: boolean;
}

function PackCard({ pack, onOpen, isOpening, canOpenFree }: PackCardProps) {
  const isFree = pack.cost === "free";
  const legendaryChance = pack.rarityWeights.legendary;

  return (
    <PixelCard 
      className={cn(
        "p-4 text-center",
        legendaryChance >= 10 && "border-yellow-400",
        legendaryChance >= 20 && "border-purple-400"
      )}
      rarity={legendaryChance >= 20 ? "legendary" : legendaryChance >= 10 ? "rare" : undefined}
    >
      <div className="text-4xl mb-3">
        <Package className={cn(
          "w-12 h-12 mx-auto",
          isFree ? "text-[#3b82f6]" : "text-yellow-400"
        )} />
      </div>

      <h3 className="text-[#60a5fa] text-[12px] mb-1">{pack.name}</h3>
      <p className="text-[#3b82f6] text-[8px] mb-3">{pack.description}</p>

      <div className="flex justify-center gap-2 mb-3">
        <PixelBadge variant="outline" className="text-[6px]">
          {pack.cardCount} CARDS
        </PixelBadge>
        {legendaryChance > 0 && (
          <PixelBadge variant="outline" className="text-[6px] text-yellow-400 border-yellow-400">
            {legendaryChance}% LEGENDARY
          </PixelBadge>
        )}
      </div>

      <div className="flex justify-center gap-1 mb-3 text-[6px]">
        <span className="text-gray-400">{pack.rarityWeights.common}% C</span>
        <span className="text-green-400">{pack.rarityWeights.uncommon}% U</span>
        <span className="text-purple-400">{pack.rarityWeights.rare}% R</span>
        <span className="text-yellow-400">{pack.rarityWeights.legendary}% L</span>
      </div>

      <PixelButton 
        onClick={onOpen}
        disabled={isOpening || (isFree && !canOpenFree)}
        className="w-full"
      >
        {isOpening ? (
          "OPENING..."
        ) : isFree ? (
          canOpenFree ? "OPEN FREE" : "CLAIMED TODAY"
        ) : (
          "OPEN PACK"
        )}
      </PixelButton>
    </PixelCard>
  );
}

function PackOpeningAnimation() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center">
        <Package className="w-32 h-32 mx-auto text-yellow-400 animate-bounce" />
        <p className="text-yellow-400 text-lg mt-4 pixel-loading">OPENING PACK...</p>
        <div className="flex justify-center gap-2 mt-4">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse delay-100" />
          <Sparkles className="w-6 h-6 text-blue-400 animate-pulse delay-200" />
        </div>
      </div>
    </div>
  );
}

interface RevealModalProps {
  tools: any[];
  onClose: () => void;
}

function RevealModal({ tools, onClose }: RevealModalProps) {
  const getRarity = (stars: number) => {
    if (stars > 50000) return { label: "LEGENDARY", color: "border-yellow-400 bg-yellow-400/10", textColor: "text-yellow-400" };
    if (stars > 20000) return { label: "RARE", color: "border-purple-400 bg-purple-400/10", textColor: "text-purple-400" };
    if (stars > 5000) return { label: "UNCOMMON", color: "border-green-400 bg-green-400/10", textColor: "text-green-400" };
    return { label: "COMMON", color: "border-gray-400 bg-gray-400/10", textColor: "text-gray-400" };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-yellow-400 text-lg flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> YOU GOT:
          </h2>
          <button onClick={onClose} className="text-[#3b82f6] hover:text-[#60a5fa]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {tools.map((tool, index) => {
            const rarity = getRarity(tool.githubStars || 0);
            return (
              <Link key={`${tool._id}-${index}`} href={`/tools/${tool.slug}`}>
                <PixelCard 
                  className={cn(
                    "p-3 text-center hover:scale-105 transition-transform",
                    rarity.color
                  )}
                >
                  <Star className={cn("w-8 h-8 mx-auto mb-2", rarity.textColor)} />
                  <p className="text-[#60a5fa] text-[10px] truncate">{tool.name}</p>
                  <PixelBadge variant="outline" className={cn("text-[6px] mt-2", rarity.textColor)}>
                    {rarity.label}
                  </PixelBadge>
                </PixelCard>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <PixelButton onClick={onClose}>
            <ChevronRight className="w-4 h-4 mr-2" /> CONTINUE
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

export function CollectionProgress({ userId }: { userId: string }) {
  const collection = useQuery(api.packs.getUserCollection, { userId });

  if (!collection) return null;

  const newCount = collection.filter((c) => c.isNew).length;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Package className="w-3 h-3" /> COLLECTION
        </span>
        {newCount > 0 && (
          <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
            {newCount} NEW
          </PixelBadge>
        )}
      </div>
      <p className="text-[#3b82f6] text-[8px]">{collection.length} tools collected</p>
    </PixelCard>
  );
}
