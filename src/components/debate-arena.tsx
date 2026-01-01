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
  MessageSquare, 
  Swords,
  ThumbsUp,
  Users,
  Clock,
  Trophy,
  Star,
  Send,
  Vote
} from "lucide-react";

interface DebateArenaProps {
  userId?: string;
  className?: string;
}

export function DebateArena({ userId, className }: DebateArenaProps) {
  const [activeTab, setActiveTab] = useState<"open" | "voting" | "featured">("open");
  
  const openDebates = useQuery(api.debates.getActiveDebates, { limit: 10 });
  const votingDebates = useQuery(api.debates.getVotingDebates, { limit: 10 });
  const featuredDebates = useQuery(api.debates.getFeaturedDebates);

  const debates = activeTab === "open" 
    ? openDebates 
    : activeTab === "voting" 
      ? votingDebates 
      : featuredDebates;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> DEBATE ARENA
        </h2>
      </div>

      <div className="flex gap-2">
        <PixelButton
          variant={activeTab === "open" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("open")}
        >
          <Swords className="w-3 h-3 mr-1" /> OPEN
        </PixelButton>
        <PixelButton
          variant={activeTab === "voting" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("voting")}
        >
          <Vote className="w-3 h-3 mr-1" /> VOTING
        </PixelButton>
        <PixelButton
          variant={activeTab === "featured" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("featured")}
        >
          <Star className="w-3 h-3 mr-1" /> FEATURED
        </PixelButton>
      </div>

      {debates && debates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debates.map((debate: any) => (
            <DebateCard key={debate._id} debate={debate} userId={userId} />
          ))}
        </div>
      ) : (
        <PixelCard className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO DEBATES YET</p>
          <p className="text-[#1e3a5f] text-[8px]">Start a new debate!</p>
        </PixelCard>
      )}
    </div>
  );
}

function DebateCard({ debate, userId }: { debate: any; userId?: string }) {
  const voteInDebate = useMutation(api.debates.voteInDebate);

  const handleVote = async (toolId: Id<"tools">) => {
    if (!userId || debate.status !== "voting") return;
    await voteInDebate({
      debateId: debate._id,
      oderId: userId,
      votedForToolId: toolId,
    });
  };

  const totalVotes = (debate.tool1Votes || 0) + (debate.tool2Votes || 0);
  const tool1Percent = totalVotes > 0 ? Math.round((debate.tool1Votes / totalVotes) * 100) : 50;
  const tool2Percent = 100 - tool1Percent;

  return (
    <PixelCard className={cn("p-4", debate.isFeatured && "border-yellow-400")}>
      <div className="flex items-center justify-between mb-3">
        <PixelBadge variant="outline" className={cn(
          "text-[6px]",
          debate.status === "open" && "text-green-400 border-green-400",
          debate.status === "voting" && "text-yellow-400 border-yellow-400",
          debate.status === "closed" && "text-gray-400 border-gray-400"
        )}>
          {debate.status.toUpperCase()}
        </PixelBadge>
        {debate.isFeatured && <Star className="w-4 h-4 text-yellow-400" />}
      </div>

      <p className="text-[#60a5fa] text-[12px] mb-4 text-center">{debate.topic}</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 text-center">
          <Swords className="w-8 h-8 mx-auto text-blue-400 mb-2" />
          <p className="text-[#60a5fa] text-[10px]">{debate.tool1?.name}</p>
          {debate.status === "voting" && (
            <p className="text-blue-400 text-lg">{tool1Percent}%</p>
          )}
        </div>

        <div className="text-[#3b82f6] text-lg">VS</div>

        <div className="flex-1 text-center">
          <Swords className="w-8 h-8 mx-auto text-red-400 mb-2" />
          <p className="text-[#60a5fa] text-[10px]">{debate.tool2?.name}</p>
          {debate.status === "voting" && (
            <p className="text-red-400 text-lg">{tool2Percent}%</p>
          )}
        </div>
      </div>

      {debate.status === "voting" && (
        <div className="h-3 bg-[#0a1628] border border-[#1e3a5f] mb-4 flex overflow-hidden">
          <div className="bg-blue-400 h-full" style={{ width: `${tool1Percent}%` }} />
          <div className="bg-red-400 h-full" style={{ width: `${tool2Percent}%` }} />
        </div>
      )}

      {debate.status === "voting" && userId && (
        <div className="flex gap-2">
          <PixelButton size="sm" className="flex-1" onClick={() => handleVote(debate.tool1Id)}>
            {debate.tool1?.name}
          </PixelButton>
          <PixelButton size="sm" className="flex-1" onClick={() => handleVote(debate.tool2Id)}>
            {debate.tool2?.name}
          </PixelButton>
        </div>
      )}

      {debate.status === "closed" && debate.winnerId && (
        <div className="text-center p-2 border border-yellow-400 bg-yellow-400/10">
          <Trophy className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
          <p className="text-yellow-400 text-[10px]">
            WINNER: {debate.winnerId === debate.tool1Id ? debate.tool1?.name : debate.tool2?.name}
          </p>
        </div>
      )}
    </PixelCard>
  );
}

interface DebateDetailProps {
  debateId: Id<"debates">;
  userId?: string;
}

export function DebateDetail({ debateId, userId }: DebateDetailProps) {
  const [newArgument, setNewArgument] = useState("");
  const [argumentType, setArgumentType] = useState<"opening" | "rebuttal" | "closing">("opening");
  
  const debate = useQuery(api.debates.getDebateDetails, { debateId });
  const submitArgument = useMutation(api.debates.submitArgument);
  const upvoteArgument = useMutation(api.debates.upvoteArgument);

  if (!debate) {
    return (
      <PixelCard className="p-8 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">LOADING DEBATE...</p>
      </PixelCard>
    );
  }

  const handleSubmitArgument = async (forToolId: Id<"tools">) => {
    if (!userId || !newArgument) return;
    await submitArgument({
      debateId,
      userId,
      forToolId,
      argumentType,
      content: newArgument,
    });
    setNewArgument("");
  };

  const tool1Arguments = debate.arguments?.filter((a: any) => a.forToolId === debate.tool1Id) || [];
  const tool2Arguments = debate.arguments?.filter((a: any) => a.forToolId === debate.tool2Id) || [];

  return (
    <div className="space-y-6">
      <PixelCard className="p-4">
        <h2 className="text-[#60a5fa] text-lg text-center mb-4">{debate.topic}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border border-blue-400">
            <Swords className="w-10 h-10 mx-auto text-blue-400 mb-2" />
            <p className="text-[#60a5fa] text-[12px]">{debate.tool1?.name}</p>
            <p className="text-blue-400 text-lg">{debate.tool1Votes} votes</p>
          </div>
          <div className="text-center p-4 border border-red-400">
            <Swords className="w-10 h-10 mx-auto text-red-400 mb-2" />
            <p className="text-[#60a5fa] text-[12px]">{debate.tool2?.name}</p>
            <p className="text-red-400 text-lg">{debate.tool2Votes} votes</p>
          </div>
        </div>
      </PixelCard>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-blue-400 text-[10px] uppercase mb-3">FOR {debate.tool1?.name}</h3>
          <div className="space-y-2">
            {tool1Arguments.map((arg: any) => (
              <ArgumentCard key={arg._id} argument={arg} onUpvote={() => upvoteArgument({ argumentId: arg._id, oderId: userId || "" })} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-red-400 text-[10px] uppercase mb-3">FOR {debate.tool2?.name}</h3>
          <div className="space-y-2">
            {tool2Arguments.map((arg: any) => (
              <ArgumentCard key={arg._id} argument={arg} onUpvote={() => upvoteArgument({ argumentId: arg._id, oderId: userId || "" })} />
            ))}
          </div>
        </div>
      </div>

      {debate.status === "open" && userId && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">ADD ARGUMENT</h3>
          <div className="flex gap-2 mb-3">
            {(["opening", "rebuttal", "closing"] as const).map((type) => (
              <PixelButton
                key={type}
                size="sm"
                variant={argumentType === type ? "default" : "ghost"}
                onClick={() => setArgumentType(type)}
              >
                {type.toUpperCase()}
              </PixelButton>
            ))}
          </div>
          <textarea
            value={newArgument}
            onChange={(e) => setNewArgument(e.target.value)}
            placeholder="Make your argument..."
            className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] h-24 resize-none mb-3"
          />
          <div className="flex gap-2">
            <PixelButton size="sm" onClick={() => handleSubmitArgument(debate.tool1Id)} disabled={!newArgument}>
              <Send className="w-3 h-3 mr-1" /> FOR {debate.tool1?.name}
            </PixelButton>
            <PixelButton size="sm" onClick={() => handleSubmitArgument(debate.tool2Id)} disabled={!newArgument}>
              <Send className="w-3 h-3 mr-1" /> FOR {debate.tool2?.name}
            </PixelButton>
          </div>
        </PixelCard>
      )}
    </div>
  );
}

function ArgumentCard({ argument, onUpvote }: { argument: any; onUpvote: () => void }) {
  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <PixelBadge variant="outline" className="text-[6px]">
          {argument.argumentType.toUpperCase()}
        </PixelBadge>
        <button onClick={onUpvote} className="flex items-center gap-1 text-[#3b82f6] text-[8px] hover:text-[#60a5fa]">
          <ThumbsUp className="w-3 h-3" /> {argument.upvotes}
        </button>
      </div>
      <p className="text-[#3b82f6] text-[10px]">{argument.content}</p>
    </PixelCard>
  );
}
