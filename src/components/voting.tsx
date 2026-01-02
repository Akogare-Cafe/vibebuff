"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Vote, 
  Trophy, 
  Crown,
  Star,
  Check,
  ChevronRight,
  Calendar,
  Medal,
  Zap,
  Clock,
  TrendingUp
} from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

interface VotingProps {
  userId?: string;
  className?: string;
}

export function VotingSection({ userId, className }: VotingProps) {
  const activeVotingPeriods = useQuery(api.voting.getActiveVotingPeriods);
  const pastWinners = useQuery(api.voting.getPastWinners, { limit: 5 });

  if (!activeVotingPeriods) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING VOTES...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Active Voting */}
      <div>
        <h2 className="text-[#60a5fa] text-sm mb-4 flex items-center gap-2">
          <Vote className="w-4 h-4" /> LEGENDARY TOOL OF THE MONTH
        </h2>
        
        {activeVotingPeriods.length === 0 ? (
          <PixelCard className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
            <p className="text-[#3b82f6] text-[10px]">NO ACTIVE VOTING PERIODS</p>
            <p className="text-[#1e3a5f] text-[8px]">Check back at the start of the month!</p>
          </PixelCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeVotingPeriods.slice(0, 6).map((period: any) => (
              <VotingCard 
                key={period._id} 
                period={period} 
                userId={userId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Winners */}
      {pastWinners && pastWinners.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[12px] mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> HALL OF FAME
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pastWinners.map((winner) => (
              <PixelCard 
                key={winner._id} 
                className="p-3 text-center border-yellow-400"
                rarity="legendary"
              >
                <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-[#60a5fa] text-[10px]">{winner.winner?.name}</p>
                <p className="text-[#3b82f6] text-[8px]">{winner.category?.name}</p>
                <p className="text-[#1e3a5f] text-[6px] mt-1">
                  {new Date(winner.year, (winner.month % 100) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </PixelCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface VotingCardProps {
  period: any;
  userId?: string;
}

function VotingCard({ period, userId }: VotingCardProps) {
  const [selectedTool, setSelectedTool] = useState<Id<"tools"> | null>(null);
  
  const hasVoted = useQuery(
    api.voting.hasUserVoted,
    userId ? { userId, votingPeriodId: period._id } : "skip"
  );
  
  const castVote = useMutation(api.voting.castVote);

  const handleVote = async () => {
    if (!userId || !selectedTool) return;
    await castVote({
      userId,
      votingPeriodId: period._id,
      toolId: selectedTool,
    });
  };

  const leader = period.topTools[0];

  return (
    <PixelCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <DynamicIcon name={period.category?.icon || "Trophy"} className="w-6 h-6 text-[#60a5fa]" />
        <div>
          <h3 className="text-[#60a5fa] text-[12px]">{period.category?.name}</h3>
          <p className="text-[#3b82f6] text-[8px]">{period.totalVotes} votes cast</p>
        </div>
      </div>

      {/* Current Leader */}
      {leader?.tool && (
        <div className="border-2 border-yellow-400 p-2 mb-3 bg-yellow-400/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-[#60a5fa] text-[10px]">{leader.tool.name}</span>
            </div>
            <PixelBadge variant="secondary" className="text-[6px] bg-yellow-400 text-black">
              {leader.votes} VOTES
            </PixelBadge>
          </div>
        </div>
      )}

      {/* Top 3 */}
      <div className="space-y-2 mb-4">
        {period.topTools.slice(0, 3).map((item: any, index: number) => (
          item.tool && (
            <div 
              key={item.tool._id}
              className={cn(
                "flex items-center justify-between p-2 border border-[#1e3a5f]",
                selectedTool === item.tool._id && "border-[#3b82f6] bg-[#3b82f6]/10"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 flex items-center justify-center text-[10px]",
                  index === 0 && "text-yellow-400",
                  index === 1 && "text-gray-400",
                  index === 2 && "text-orange-400"
                )}>
                  {index + 1}
                </span>
                <Link href={`/tools/${item.tool.slug}`} className="text-[#60a5fa] text-[10px] hover:underline">
                  {item.tool.name}
                </Link>
              </div>
              <span className="text-[#3b82f6] text-[8px]">{item.votes}</span>
            </div>
          )
        ))}
      </div>

      {/* Vote Action */}
      {userId ? (
        hasVoted ? (
          <div className="text-center space-y-2">
            <PixelBadge variant="outline" className="text-[8px] text-green-400 border-green-400">
              <Check className="w-3 h-3 mr-1" /> VOTE CAST
            </PixelBadge>
            <PixelBadge variant="default" className="text-[6px] bg-green-400 text-black">
              <Zap className="w-2 h-2 mr-1" /> +10 XP EARNED
            </PixelBadge>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedTool || ""}
              onChange={(e) => setSelectedTool(e.target.value as Id<"tools">)}
              className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px]"
            >
              <option value="">Select a tool...</option>
              {period.topTools.map((item: any) => (
                item.tool && (
                  <option key={item.tool._id} value={item.tool._id}>
                    {item.tool.name}
                  </option>
                )
              ))}
            </select>
            <PixelButton 
              size="sm" 
              onClick={handleVote}
              disabled={!selectedTool}
              className="w-full"
            >
              <Vote className="w-3 h-3 mr-1" /> CAST VOTE
            </PixelButton>
          </div>
        )
      ) : (
        <Link href="/sign-in">
          <PixelButton size="sm" variant="secondary" className="w-full">
            SIGN IN TO VOTE
          </PixelButton>
        </Link>
      )}
    </PixelCard>
  );
}

// Compact voting widget for sidebar
export function VotingWidget({ userId }: { userId?: string }) {
  const activeVotingPeriods = useQuery(api.voting.getActiveVotingPeriods);

  if (!activeVotingPeriods || activeVotingPeriods.length === 0) return null;

  const period = activeVotingPeriods[0] as any;
  const leader = period.topTools[0] as any;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1"><Trophy className="w-3 h-3" /> VOTE NOW</span>
        <PixelBadge variant="outline" className="text-[6px]">
          {period.totalVotes} VOTES
        </PixelBadge>
      </div>
      
      {leader?.tool && (
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-3 h-3 text-yellow-400" />
          <span className="text-[#3b82f6] text-[8px]">{leader.tool.name} leads</span>
        </div>
      )}

      <Link href="/vote">
        <PixelButton size="sm" variant="ghost" className="w-full">
          <Vote className="w-3 h-3 mr-1" /> VIEW ALL
        </PixelButton>
      </Link>
    </PixelCard>
  );
}
