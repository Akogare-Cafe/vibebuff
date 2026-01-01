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
  Play, 
  ThumbsUp,
  Eye,
  Clock,
  Swords,
  Gamepad2,
  Users,
  FlaskConical,
  Star,
  Share2,
  Trash2
} from "lucide-react";

interface StackReplaysProps {
  userId?: string;
  className?: string;
}

const REPLAY_TYPE_CONFIG = {
  battle: { icon: Swords, color: "text-red-400", label: "BATTLE" },
  roguelike: { icon: Gamepad2, color: "text-purple-400", label: "ROGUELIKE" },
  draft: { icon: Users, color: "text-blue-400", label: "DRAFT" },
  simulation: { icon: FlaskConical, color: "text-green-400", label: "SIMULATION" },
};

export function StackReplays({ userId, className }: StackReplaysProps) {
  const [activeTab, setActiveTab] = useState<"top" | "featured" | "mine">("top");
  
  const topReplays = useQuery(api.replays.getTopReplays, { limit: 10 });
  const featuredReplays = useQuery(api.replays.getFeaturedReplays, { limit: 10 });
  const userReplays = useQuery(
    api.replays.getUserReplays,
    userId ? { userId, limit: 10 } : "skip"
  );

  const replays = activeTab === "top" 
    ? topReplays 
    : activeTab === "featured" 
      ? featuredReplays 
      : userReplays;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Play className="w-4 h-4" /> STACK REPLAYS
        </h2>
      </div>

      <div className="flex gap-2">
        <PixelButton
          variant={activeTab === "top" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("top")}
        >
          <ThumbsUp className="w-3 h-3 mr-1" /> TOP
        </PixelButton>
        <PixelButton
          variant={activeTab === "featured" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("featured")}
        >
          <Star className="w-3 h-3 mr-1" /> FEATURED
        </PixelButton>
        {userId && (
          <PixelButton
            variant={activeTab === "mine" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("mine")}
          >
            <Play className="w-3 h-3 mr-1" /> MY REPLAYS
          </PixelButton>
        )}
      </div>

      {replays && replays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {replays.map((replay: any) => (
            <ReplayCard key={replay._id} replay={replay} userId={userId} />
          ))}
        </div>
      ) : (
        <PixelCard className="p-8 text-center">
          <Play className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO REPLAYS YET</p>
          <p className="text-[#1e3a5f] text-[8px]">Complete battles or runs to create replays!</p>
        </PixelCard>
      )}
    </div>
  );
}

interface ReplayCardProps {
  replay: any;
  userId?: string;
}

function ReplayCard({ replay, userId }: ReplayCardProps) {
  const upvoteReplay = useMutation(api.replays.upvoteReplay);
  const deleteReplay = useMutation(api.replays.deleteReplay);
  const recordView = useMutation(api.replays.recordView);

  const config = REPLAY_TYPE_CONFIG[replay.replayType as keyof typeof REPLAY_TYPE_CONFIG];
  const TypeIcon = config?.icon || Play;

  const isOwner = userId === replay.userId;

  const handleUpvote = async () => {
    if (!userId) return;
    await upvoteReplay({ oderId: userId, replayId: replay._id });
  };

  const handleDelete = async () => {
    if (!userId || !isOwner) return;
    if (confirm("Delete this replay?")) {
      await deleteReplay({ userId, replayId: replay._id });
    }
  };

  const handleView = async () => {
    await recordView({ replayId: replay._id });
  };

  const duration = Math.floor(replay.replayData.duration / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <PixelCard className={cn("p-4", replay.isFeatured && "border-yellow-400")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon className={cn("w-6 h-6", config?.color)} />
          <div>
            <h3 className="text-[#60a5fa] text-[11px]">{replay.title}</h3>
            <div className="flex items-center gap-2">
              <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
                {config?.label}
              </PixelBadge>
              {replay.isFeatured && (
                <Star className="w-3 h-3 text-yellow-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {replay.description && (
        <p className="text-[#3b82f6] text-[8px] mb-3">{replay.description}</p>
      )}

      <div className="flex items-center gap-3 mb-3 text-[8px] text-[#3b82f6]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" /> {replay.views}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" /> {replay.upvotes}
        </span>
      </div>

      {replay.replayData.keyMoments.length > 0 && (
        <div className="mb-3 p-2 border border-[#1e3a5f] bg-[#0a1628]">
          <p className="text-[#60a5fa] text-[8px] mb-1">KEY MOMENTS:</p>
          <div className="space-y-1">
            {replay.replayData.keyMoments.slice(0, 2).map((moment: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[8px]">
                <span className="text-[#3b82f6]">
                  {Math.floor(moment.timestamp / 1000)}s
                </span>
                <span className="text-[#60a5fa]">{moment.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[#3b82f6] text-[8px]">
          by {replay.username || "Anonymous"}
        </span>
        <div className="flex gap-2">
          <PixelButton size="sm" variant="ghost" onClick={handleUpvote} disabled={!userId}>
            <ThumbsUp className="w-3 h-3" />
          </PixelButton>
          <PixelButton size="sm" variant="ghost">
            <Share2 className="w-3 h-3" />
          </PixelButton>
          {isOwner && (
            <PixelButton size="sm" variant="ghost" onClick={handleDelete}>
              <Trash2 className="w-3 h-3" />
            </PixelButton>
          )}
        </div>
      </div>
    </PixelCard>
  );
}

export function WeeklyHighlights() {
  const highlights = useQuery(api.replays.getWeeklyHighlights);

  if (!highlights || !highlights.replays || highlights.replays.length === 0) return null;

  return (
    <PixelCard className="p-4 border-yellow-400">
      <h3 className="text-yellow-400 text-[10px] uppercase mb-3 flex items-center gap-2">
        <Star className="w-4 h-4" /> WEEKLY TOP PLAYS
      </h3>
      <div className="space-y-2">
        {highlights.replays.slice(0, 5).map((replay: any, index: number) => {
          const config = REPLAY_TYPE_CONFIG[replay.replayType as keyof typeof REPLAY_TYPE_CONFIG];
          return (
            <div 
              key={replay._id}
              className={cn(
                "flex items-center justify-between p-2 border",
                index === 0 && "border-yellow-400 bg-yellow-400/10",
                index > 0 && "border-[#1e3a5f]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-6 text-center text-[10px]",
                  index === 0 && "text-yellow-400",
                  index === 1 && "text-gray-400",
                  index === 2 && "text-orange-400",
                  index > 2 && "text-[#3b82f6]"
                )}>
                  #{index + 1}
                </span>
                {config && <config.icon className={cn("w-4 h-4", config.color)} />}
                <span className="text-[#60a5fa] text-[10px]">{replay.title}</span>
              </div>
              <span className="text-[#3b82f6] text-[8px] flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> {replay.upvotes}
              </span>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}

export function ReplayWidget({ userId }: { userId: string }) {
  const userReplays = useQuery(api.replays.getUserReplays, { userId, limit: 3 });

  if (!userReplays || userReplays.length === 0) return null;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Play className="w-3 h-3" /> YOUR REPLAYS
        </span>
        <Link href="/replays">
          <PixelBadge variant="outline" className="text-[6px]">
            VIEW ALL
          </PixelBadge>
        </Link>
      </div>
      <div className="space-y-1">
        {userReplays.map((replay: any) => {
          const config = REPLAY_TYPE_CONFIG[replay.replayType as keyof typeof REPLAY_TYPE_CONFIG];
          return (
            <div key={replay._id} className="flex items-center justify-between text-[8px]">
              <div className="flex items-center gap-1">
                {config && <config.icon className={cn("w-3 h-3", config.color)} />}
                <span className="text-[#60a5fa]">{replay.title}</span>
              </div>
              <span className="text-[#3b82f6]">{replay.upvotes} votes</span>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}
