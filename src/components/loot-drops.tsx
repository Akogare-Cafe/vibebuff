"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Gift, 
  Sparkles, 
  Clock, 
  Check,
  Star,
  ChevronRight,
  Package
} from "lucide-react";

interface LootDropsProps {
  userId?: string;
  className?: string;
}

export function LootDrops({ userId, className }: LootDropsProps) {
  const activeLoot = useQuery(api.loot.getActiveLootDrops);
  const claimLoot = useMutation(api.loot.claimLoot);

  const handleClaim = async (lootDropId: string) => {
    if (!userId) return;
    await claimLoot({ userId, lootDropId: lootDropId as any });
  };

  if (!activeLoot || activeLoot.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
        <Gift className="w-4 h-4" /> LOOT DROPS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeLoot.map((drop) => (
          <LootDropCard 
            key={drop._id} 
            drop={drop} 
            userId={userId}
            onClaim={() => handleClaim(drop._id)}
          />
        ))}
      </div>
    </div>
  );
}

interface LootDropCardProps {
  drop: {
    _id: string;
    type: "daily" | "weekly";
    title: string;
    description: string;
    bonusXp: number;
    activeUntil: number;
    tool: {
      _id: string;
      name: string;
      slug: string;
      tagline: string;
    } | null;
  };
  userId?: string;
  onClaim: () => void;
}

function LootDropCard({ drop, userId, onClaim }: LootDropCardProps) {
  const hasClaimed = useQuery(
    api.loot.hasUserClaimedLoot,
    userId ? { userId, lootDropId: drop._id as any } : "skip"
  );

  const timeLeft = drop.activeUntil - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const isDaily = drop.type === "daily";

  return (
    <PixelCard 
      className={cn(
        "p-4 relative overflow-hidden",
        isDaily ? "border-[#3b82f6]" : "border-yellow-400"
      )}
      rarity={isDaily ? "uncommon" : "legendary"}
    >
      {/* Animated sparkles for weekly */}
      {!isDaily && (
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute bottom-4 left-4 w-3 h-3 text-yellow-400 animate-pulse delay-300" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <PixelBadge 
            variant={isDaily ? "default" : "secondary"}
            className={cn("text-[8px] mb-2", !isDaily && "bg-yellow-400 text-black")}
          >
            {isDaily ? "DAILY" : "WEEKLY LEGENDARY"}
          </PixelBadge>
          <h3 className="text-[#60a5fa] text-[12px]">{drop.title}</h3>
          <p className="text-[#3b82f6] text-[8px] mt-1">{drop.description}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-lg font-bold", isDaily ? "text-[#60a5fa]" : "text-yellow-400")}>
            +{drop.bonusXp}
          </p>
          <p className="text-[#3b82f6] text-[8px]">XP</p>
        </div>
      </div>

      {drop.tool && (
        <Link href={`/tools/${drop.tool.slug}`}>
          <div className="border-2 border-[#1e3a5f] p-3 bg-[#0a1628] mb-3 hover:border-[#3b82f6] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#60a5fa] text-[10px]">{drop.tool.name}</p>
                <p className="text-[#3b82f6] text-[8px]">{drop.tool.tagline}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#3b82f6]" />
            </div>
          </div>
        </Link>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#3b82f6] text-[8px]">
          <Clock className="w-3 h-3" />
          <span>
            {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`} left
          </span>
        </div>

        {userId ? (
          hasClaimed ? (
            <PixelBadge variant="outline" className="text-[8px]">
              <Check className="w-3 h-3 mr-1" /> CLAIMED
            </PixelBadge>
          ) : (
            <PixelButton size="sm" onClick={onClaim}>
              <Gift className="w-3 h-3 mr-1" /> CLAIM
            </PixelButton>
          )
        ) : (
          <Link href="/sign-in">
            <PixelButton size="sm" variant="secondary">
              SIGN IN TO CLAIM
            </PixelButton>
          </Link>
        )}
      </div>
    </PixelCard>
  );
}

// Treasure chest animation component
export function TreasureChest({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-24 h-24 transition-transform hover:scale-110",
        isOpen && "animate-bounce"
      )}
    >
      <div className="flex items-center justify-center">
        {isOpen ? <Gift className="w-16 h-16 text-yellow-400" /> : <Package className="w-16 h-16 text-[#3b82f6]" />}
      </div>
      {!isOpen && (
        <div className="absolute -top-2 -right-2">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 items-center justify-center">
              <Star className="w-2 h-2 text-black" />
            </span>
          </span>
        </div>
      )}
    </button>
  );
}
