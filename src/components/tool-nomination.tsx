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
  Vote, 
  Search,
  Star,
  Check,
  Crown,
  Sparkles,
  ChevronRight,
  Trophy,
  X
} from "lucide-react";

interface ToolNominationProps {
  userId: string;
  className?: string;
}

export function ToolNomination({ userId, className }: ToolNominationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | null>(null);
  const [nominationResult, setNominationResult] = useState<{ success: boolean; message: string } | null>(null);

  const unvotedCategories = useQuery(api.voting.getUnvotedCategories, { userId });
  const userVotes = useQuery(api.voting.getUserVotesThisMonth, { userId });
  const searchResults = useQuery(
    api.voting.searchToolsForNomination,
    { 
      query: searchQuery, 
      categoryId: selectedCategory || undefined,
      limit: 12 
    }
  );
  const nominateTool = useMutation(api.voting.nominateTool);

  const handleNominate = async (toolId: Id<"tools">) => {
    const result = await nominateTool({ userId, toolId });
    setNominationResult(result);
    setSearchQuery("");
    
    if (result.success) {
      setTimeout(() => setNominationResult(null), 3000);
    }
  };

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Vote className="w-4 h-4" /> NOMINATE TOOLS
          </h2>
          <PixelBadge variant="outline" className="text-[8px]">
            {currentMonth}
          </PixelBadge>
        </div>

        <p className="text-[#3b82f6] text-[10px] mb-4">
          Search and nominate your favorite tools for the monthly Legendary Tool awards!
        </p>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b82f6]" />
            <PixelInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH TOOLS..."
              className="pl-10"
            />
          </div>
          {selectedCategory && (
            <PixelButton 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <X className="w-3 h-3" />
            </PixelButton>
          )}
        </div>

        {unvotedCategories && unvotedCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-[#3b82f6] text-[8px] mb-2">FILTER BY CATEGORY:</p>
            <div className="flex flex-wrap gap-2">
              {unvotedCategories.slice(0, 6).map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === cat._id ? null : cat._id
                  )}
                  className={cn(
                    "px-2 py-1 border text-[8px] transition-colors",
                    selectedCategory === cat._id
                      ? "border-[#3b82f6] bg-[#3b82f6]/20 text-[#60a5fa]"
                      : "border-[#1e3a5f] text-[#3b82f6] hover:border-[#3b82f6]"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {nominationResult && (
          <div className={cn(
            "p-3 mb-4 border-2 text-center",
            nominationResult.success 
              ? "border-green-400 bg-green-400/10" 
              : "border-red-400 bg-red-400/10"
          )}>
            <div className="flex items-center justify-center gap-2">
              {nominationResult.success ? (
                <Sparkles className="w-5 h-5 text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
              <span className={nominationResult.success ? "text-green-400" : "text-red-400"}>
                {nominationResult.message}
              </span>
            </div>
            {nominationResult.success && (
              <p className="text-[#3b82f6] text-[8px] mt-1">+15 XP earned!</p>
            )}
          </div>
        )}

        {searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {searchResults.map((tool) => (
              <NominationCard 
                key={tool._id} 
                tool={tool} 
                onNominate={() => handleNominate(tool._id)}
                isVoted={userVotes?.some((v) => v.tool?._id === tool._id)}
              />
            ))}
          </div>
        ) : searchQuery.length > 0 ? (
          <div className="text-center py-8">
            <Search className="w-8 h-8 mx-auto mb-2 text-[#1e3a5f]" />
            <p className="text-[#3b82f6] text-[10px]">NO TOOLS FOUND</p>
            <p className="text-[#1e3a5f] text-[8px]">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Vote className="w-8 h-8 mx-auto mb-2 text-[#1e3a5f]" />
            <p className="text-[#3b82f6] text-[10px]">SEARCH FOR TOOLS TO NOMINATE</p>
            <p className="text-[#1e3a5f] text-[8px]">Type a tool name to get started</p>
          </div>
        )}
      </PixelCard>

      {userVotes && userVotes.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <Check className="w-4 h-4" /> YOUR NOMINATIONS THIS MONTH
          </h3>
          <div className="space-y-2">
            {userVotes.map((vote) => (
              <div 
                key={vote._id}
                className="flex items-center justify-between p-2 border border-green-400 bg-green-400/10"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-[#60a5fa] text-[10px]">{vote.tool?.name}</p>
                    <p className="text-[#3b82f6] text-[8px]">{vote.category?.name}</p>
                  </div>
                </div>
                <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400">
                  VOTED
                </PixelBadge>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {unvotedCategories && unvotedCategories.length > 0 && (
        <PixelCard className="p-4 border-yellow-400 bg-yellow-400/5">
          <h3 className="text-yellow-400 text-[10px] uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> CATEGORIES AWAITING YOUR VOTE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {unvotedCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat._id);
                  setSearchQuery("");
                }}
                className="p-2 border border-[#1e3a5f] hover:border-yellow-400 text-left transition-colors"
              >
                <p className="text-[#60a5fa] text-[10px]">{cat.name}</p>
                <p className="text-[#3b82f6] text-[8px] flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Vote now
                </p>
              </button>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

interface NominationCardProps {
  tool: {
    _id: Id<"tools">;
    name: string;
    tagline: string;
    githubStars?: number;
  };
  onNominate: () => void;
  isVoted?: boolean;
}

function NominationCard({ tool, onNominate, isVoted }: NominationCardProps) {
  const stars = tool.githubStars || 0;
  const rarity = stars > 50000 ? "legendary" : stars > 20000 ? "rare" : stars > 5000 ? "uncommon" : "common";

  const rarityConfig = {
    legendary: { border: "border-yellow-400", text: "text-yellow-400" },
    rare: { border: "border-purple-400", text: "text-purple-400" },
    uncommon: { border: "border-blue-400", text: "text-blue-400" },
    common: { border: "border-[#1e3a5f]", text: "text-[#3b82f6]" },
  };

  const config = rarityConfig[rarity];

  return (
    <div className={cn(
      "flex items-center justify-between p-3 border transition-colors",
      isVoted ? "border-green-400 bg-green-400/10" : config.border,
      !isVoted && "hover:bg-[#0a1628]/50"
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {rarity === "legendary" && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-[#60a5fa] text-[10px] truncate">{tool.name}</p>
          <p className="text-[#3b82f6] text-[8px] truncate">{tool.tagline}</p>
        </div>
      </div>
      
      {isVoted ? (
        <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400 flex-shrink-0">
          <Check className="w-2 h-2 mr-1" /> VOTED
        </PixelBadge>
      ) : (
        <PixelButton size="sm" onClick={onNominate} className="flex-shrink-0">
          <Vote className="w-3 h-3 mr-1" /> VOTE
        </PixelButton>
      )}
    </div>
  );
}

export function NominationWidget({ userId }: { userId: string }) {
  const unvotedCategories = useQuery(api.voting.getUnvotedCategories, { userId });
  const userVotes = useQuery(api.voting.getUserVotesThisMonth, { userId });

  if (!unvotedCategories) return null;

  const votedCount = userVotes?.length || 0;
  const totalCategories = (unvotedCategories?.length || 0) + votedCount;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Vote className="w-3 h-3" /> MONTHLY VOTES
        </span>
        {unvotedCategories.length > 0 && (
          <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
            {unvotedCategories.length} LEFT
          </PixelBadge>
        )}
      </div>
      
      <div className="h-2 bg-[#0a1628] border border-[#1e3a5f] mb-1">
        <div 
          className={cn(
            "h-full transition-all",
            votedCount === totalCategories ? "bg-green-400" : "bg-[#3b82f6]"
          )}
          style={{ width: `${totalCategories > 0 ? (votedCount / totalCategories) * 100 : 0}%` }}
        />
      </div>
      <p className="text-[#3b82f6] text-[6px]">{votedCount}/{totalCategories} categories voted</p>
    </PixelCard>
  );
}
