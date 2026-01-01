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
  Package, 
  Star,
  Sparkles,
  Eye,
  EyeOff,
  Filter,
  Grid,
  List,
  Check,
  Crown,
  Gem
} from "lucide-react";

interface CollectionManagerProps {
  userId: string;
  className?: string;
}

type ViewMode = "grid" | "list";
type FilterRarity = "all" | "legendary" | "rare" | "uncommon" | "common";

export function CollectionManager({ userId, className }: CollectionManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterRarity, setFilterRarity] = useState<FilterRarity>("all");
  const [showNewOnly, setShowNewOnly] = useState(false);

  const collection = useQuery(api.packs.getUserCollection, { userId });
  const stats = useQuery(api.packs.getCollectionStats, { userId });
  const markAllAsSeen = useMutation(api.packs.markAllAsSeen);
  const markAsSeen = useMutation(api.packs.markAsSeen);

  if (!collection || !stats) {
    return (
      <PixelCard className="p-6 text-center">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING COLLECTION...</div>
      </PixelCard>
    );
  }

  const getRarity = (stars: number) => {
    if (stars > 50000) return "legendary";
    if (stars > 20000) return "rare";
    if (stars > 5000) return "uncommon";
    return "common";
  };

  const filteredCollection = collection.filter((item) => {
    if (!item.tool) return false;
    
    if (showNewOnly && !item.isNew) return false;
    
    if (filterRarity !== "all") {
      const rarity = getRarity(item.tool.githubStars || 0);
      if (rarity !== filterRarity) return false;
    }
    
    return true;
  });

  const handleMarkAllSeen = async () => {
    await markAllAsSeen({ userId });
  };

  const handleMarkSeen = async (toolId: Id<"tools">) => {
    await markAsSeen({ userId, toolId });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Package className="w-4 h-4" /> MY COLLECTION
          </h2>
          <div className="flex items-center gap-2">
            {stats.newCount > 0 && (
              <PixelButton size="sm" onClick={handleMarkAllSeen}>
                <Check className="w-3 h-3 mr-1" /> MARK ALL SEEN
              </PixelButton>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 border border-[#1e3a5f]">
            <p className="text-[#60a5fa] text-2xl">{stats.collected}</p>
            <p className="text-[#3b82f6] text-[8px]">COLLECTED</p>
          </div>
          <div className="text-center p-3 border border-[#1e3a5f]">
            <p className="text-[#60a5fa] text-2xl">{stats.completionPercent}%</p>
            <p className="text-[#3b82f6] text-[8px]">COMPLETE</p>
          </div>
          <div className="text-center p-3 border border-yellow-400 bg-yellow-400/10">
            <p className="text-yellow-400 text-2xl">{stats.byRarity.legendary}</p>
            <p className="text-[#3b82f6] text-[8px]">LEGENDARY</p>
          </div>
          <div className="text-center p-3 border border-purple-400 bg-purple-400/10">
            <p className="text-purple-400 text-2xl">{stats.byRarity.rare}</p>
            <p className="text-[#3b82f6] text-[8px]">RARE</p>
          </div>
        </div>

        <div className="h-4 bg-[#0a1628] border border-[#1e3a5f] mb-2">
          <div 
            className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all duration-500"
            style={{ width: `${stats.completionPercent}%` }}
          />
        </div>
        <p className="text-[#3b82f6] text-[8px] text-center">
          {stats.collected} / {stats.total} tools collected
        </p>
      </PixelCard>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PixelButton 
            size="sm" 
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-3 h-3" />
          </PixelButton>
          <PixelButton 
            size="sm" 
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
          >
            <List className="w-3 h-3" />
          </PixelButton>
        </div>

        <div className="flex items-center gap-2">
          <PixelButton
            size="sm"
            variant={showNewOnly ? "default" : "ghost"}
            onClick={() => setShowNewOnly(!showNewOnly)}
          >
            {showNewOnly ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
            NEW ({stats.newCount})
          </PixelButton>

          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as FilterRarity)}
            className="bg-[#0a1628] border border-[#1e3a5f] text-[#60a5fa] text-[10px] px-2 py-1"
          >
            <option value="all">ALL RARITIES</option>
            <option value="legendary">LEGENDARY</option>
            <option value="rare">RARE</option>
            <option value="uncommon">UNCOMMON</option>
            <option value="common">COMMON</option>
          </select>
        </div>
      </div>

      {filteredCollection.length === 0 ? (
        <PixelCard className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO TOOLS FOUND</p>
          <p className="text-[#1e3a5f] text-[8px]">
            {showNewOnly ? "No new tools to view" : "Open packs to collect tools!"}
          </p>
        </PixelCard>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredCollection.map((item) => (
            <CollectionCard 
              key={item._id} 
              item={item} 
              onMarkSeen={() => handleMarkSeen(item.toolId)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCollection.map((item) => (
            <CollectionListItem 
              key={item._id} 
              item={item}
              onMarkSeen={() => handleMarkSeen(item.toolId)}
            />
          ))}
        </div>
      )}

      {stats.byCategory.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" /> BY CATEGORY
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.byCategory.map((cat) => (
              <div 
                key={cat.category._id}
                className={cn(
                  "p-3 border",
                  cat.collected === cat.total 
                    ? "border-green-400 bg-green-400/10" 
                    : "border-[#1e3a5f]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#60a5fa] text-[10px]">{cat.category.name}</span>
                  {cat.collected === cat.total && (
                    <Check className="w-3 h-3 text-green-400" />
                  )}
                </div>
                <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      cat.collected === cat.total ? "bg-green-400" : "bg-[#3b82f6]"
                    )}
                    style={{ width: `${(cat.collected / cat.total) * 100}%` }}
                  />
                </div>
                <p className="text-[#3b82f6] text-[8px] mt-1">
                  {cat.collected}/{cat.total}
                </p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

interface CollectionItemProps {
  item: {
    _id: string;
    toolId: Id<"tools">;
    isNew: boolean;
    obtainedAt: number;
    tool: {
      _id: Id<"tools">;
      name: string;
      slug: string;
      tagline: string;
      githubStars?: number;
    } | null;
  };
  onMarkSeen: () => void;
}

function CollectionCard({ item, onMarkSeen }: CollectionItemProps) {
  if (!item.tool) return null;

  const stars = item.tool.githubStars || 0;
  const rarity = stars > 50000 ? "legendary" : stars > 20000 ? "rare" : stars > 5000 ? "uncommon" : "common";

  const rarityConfig = {
    legendary: { border: "border-yellow-400", bg: "bg-yellow-400/10", text: "text-yellow-400", icon: Crown },
    rare: { border: "border-purple-400", bg: "bg-purple-400/10", text: "text-purple-400", icon: Gem },
    uncommon: { border: "border-blue-400", bg: "bg-blue-400/10", text: "text-blue-400", icon: Star },
    common: { border: "border-[#1e3a5f]", bg: "bg-[#0a1628]", text: "text-[#3b82f6]", icon: Star },
  };

  const config = rarityConfig[rarity];
  const RarityIcon = config.icon;

  return (
    <Link href={`/tools/${item.tool.slug}`}>
      <PixelCard 
        className={cn(
          "p-3 text-center relative hover:scale-105 transition-transform",
          config.border,
          config.bg
        )}
        onClick={() => item.isNew && onMarkSeen()}
      >
        {item.isNew && (
          <div className="absolute -top-1 -right-1">
            <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
              NEW
            </PixelBadge>
          </div>
        )}
        
        <RarityIcon className={cn("w-8 h-8 mx-auto mb-2", config.text)} />
        <p className="text-[#60a5fa] text-[10px] truncate">{item.tool.name}</p>
        <PixelBadge variant="outline" className={cn("text-[6px] mt-2", config.text)}>
          {rarity.toUpperCase()}
        </PixelBadge>
      </PixelCard>
    </Link>
  );
}

function CollectionListItem({ item, onMarkSeen }: CollectionItemProps) {
  if (!item.tool) return null;

  const stars = item.tool.githubStars || 0;
  const rarity = stars > 50000 ? "legendary" : stars > 20000 ? "rare" : stars > 5000 ? "uncommon" : "common";

  const rarityColors = {
    legendary: "text-yellow-400 border-yellow-400",
    rare: "text-purple-400 border-purple-400",
    uncommon: "text-blue-400 border-blue-400",
    common: "text-[#3b82f6] border-[#1e3a5f]",
  };

  return (
    <Link href={`/tools/${item.tool.slug}`}>
      <div 
        className={cn(
          "flex items-center justify-between p-3 border hover:bg-[#0a1628]/50 transition-colors",
          item.isNew ? "border-yellow-400 bg-yellow-400/5" : "border-[#1e3a5f]"
        )}
        onClick={() => item.isNew && onMarkSeen()}
      >
        <div className="flex items-center gap-3">
          <Star className={cn("w-5 h-5", rarityColors[rarity].split(" ")[0])} />
          <div>
            <p className="text-[#60a5fa] text-[10px]">{item.tool.name}</p>
            <p className="text-[#3b82f6] text-[8px] truncate max-w-[200px]">{item.tool.tagline}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {item.isNew && (
            <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
              NEW
            </PixelBadge>
          )}
          <PixelBadge variant="outline" className={cn("text-[6px]", rarityColors[rarity])}>
            {rarity.toUpperCase()}
          </PixelBadge>
        </div>
      </div>
    </Link>
  );
}

export function CollectionWidget({ userId }: { userId: string }) {
  const stats = useQuery(api.packs.getCollectionStats, { userId });

  if (!stats) return null;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Package className="w-3 h-3" /> COLLECTION
        </span>
        {stats.newCount > 0 && (
          <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
            {stats.newCount} NEW
          </PixelBadge>
        )}
      </div>
      
      <div className="h-2 bg-[#0a1628] border border-[#1e3a5f] mb-1">
        <div 
          className="h-full bg-[#3b82f6]"
          style={{ width: `${stats.completionPercent}%` }}
        />
      </div>
      <p className="text-[#3b82f6] text-[6px]">{stats.collected}/{stats.total} ({stats.completionPercent}%)</p>
    </PixelCard>
  );
}
