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
  Trophy, 
  Award,
  Eye,
  Settings,
  Star,
  Swords,
  Layers,
  Frame,
  Crown
} from "lucide-react";

interface TrophyRoomProps {
  userId: string;
  isOwner?: boolean;
  className?: string;
}

export function TrophyRoom({ userId, isOwner, className }: TrophyRoomProps) {
  const [isEditing, setIsEditing] = useState(false);
  const room = useQuery(api.trophyRoom.getUserTrophyRoom, { userId });
  const recordView = useMutation(api.trophyRoom.recordView);

  if (!room) {
    return (
      <PixelCard className="p-8 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-[10px]">NO TROPHY ROOM YET</p>
        {isOwner && (
          <PixelButton className="mt-4" onClick={() => setIsEditing(true)}>
            CREATE TROPHY ROOM
          </PixelButton>
        )}
      </PixelCard>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4" /> 
            {room.customTitle || "TROPHY ROOM"}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-[8px] flex items-center gap-1">
              <Eye className="w-3 h-3" /> {room.views} views
            </span>
          </div>
        </div>
        {isOwner && (
          <PixelButton size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Settings className="w-3 h-3 mr-1" /> EDIT
          </PixelButton>
        )}
      </div>

      {room.displayedAchievements.length > 0 && (
        <div>
          <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> ACHIEVEMENTS
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {room.displayedAchievements.map((da: any, index: number) => (
              <AchievementDisplay key={index} displayedAchievement={da} />
            ))}
          </div>
        </div>
      )}

      {room.displayedBadges.length > 0 && (
        <div>
          <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" /> BADGES
          </h3>
          <div className="flex flex-wrap gap-2">
            {room.displayedBadges.map((badge: string, index: number) => (
              <PixelBadge key={index} variant="outline" className="text-[8px]">
                {badge}
              </PixelBadge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {room.featuredDeck && (
          <PixelCard className="p-4">
            <h4 className="text-primary text-[10px] uppercase mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> FEATURED DECK
            </h4>
            <p className="text-muted-foreground text-[10px]">{room.featuredDeck.name}</p>
            <p className="text-muted-foreground text-[8px]">
              {room.featuredDeck.toolIds?.length || 0} tools
            </p>
          </PixelCard>
        )}

        {room.featuredBattle && (
          <PixelCard className="p-4">
            <h4 className="text-primary text-[10px] uppercase mb-2 flex items-center gap-2">
              <Swords className="w-4 h-4" /> FEATURED BATTLE
            </h4>
            <p className={cn(
              "text-[10px]",
              room.featuredBattle.winnerId === userId ? "text-green-400" : "text-red-400"
            )}>
              {room.featuredBattle.winnerId === userId ? "VICTORY" : "DEFEAT"}
            </p>
          </PixelCard>
        )}
      </div>
    </div>
  );
}

function AchievementDisplay({ displayedAchievement }: { displayedAchievement: any }) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-20 h-20",
    large: "w-24 h-24",
  };

  return (
    <div 
      className={cn(
        "border-2 border-yellow-400 bg-yellow-400/10 flex flex-col items-center justify-center p-2",
        sizeClasses[displayedAchievement.size as keyof typeof sizeClasses]
      )}
    >
      <Trophy className="w-6 h-6 text-yellow-400 mb-1" />
      <p className="text-primary text-[6px] text-center truncate w-full">
        {displayedAchievement.achievement?.name}
      </p>
    </div>
  );
}

export function TopTrophyRooms() {
  const topRooms = useQuery(api.trophyRoom.getTopTrophyRooms, { limit: 5 });

  if (!topRooms || topRooms.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <Crown className="w-4 h-4" /> POPULAR TROPHY ROOMS
      </h3>
      <div className="space-y-2">
        {topRooms.map((room: any, index: number) => (
          <Link key={room._id} href={`/profile/${room.userId}`}>
            <div className="flex items-center justify-between p-2 border border-border hover:border-primary">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-6 text-center text-[10px]",
                  index === 0 && "text-yellow-400",
                  index === 1 && "text-gray-400",
                  index === 2 && "text-orange-400",
                  index > 2 && "text-muted-foreground"
                )}>
                  #{index + 1}
                </span>
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <span className="text-primary text-[10px]">
                  {room.username || "Anonymous"}
                </span>
              </div>
              <span className="text-muted-foreground text-[8px] flex items-center gap-1">
                <Eye className="w-3 h-3" /> {room.views}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PixelCard>
  );
}

export function ProfileFrameSelector({ userId }: { userId: string }) {
  const frames = useQuery(api.trophyRoom.getProfileFrames);

  if (!frames) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <Frame className="w-4 h-4" /> PROFILE FRAMES
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {frames.map((frame: any) => {
          const rarityColors = {
            common: "border-gray-400",
            rare: "border-blue-400",
            epic: "border-purple-400",
            legendary: "border-yellow-400",
          };
          return (
            <div 
              key={frame._id}
              className={cn(
                "p-3 border-2 text-center cursor-pointer hover:bg-card/50",
                rarityColors[frame.rarity as keyof typeof rarityColors]
              )}
            >
              <Frame className={cn(
                "w-8 h-8 mx-auto mb-1",
                rarityColors[frame.rarity as keyof typeof rarityColors].replace("border-", "text-")
              )} />
              <p className="text-primary text-[8px]">{frame.name}</p>
              <PixelBadge variant="outline" className="text-[6px] mt-1">
                {frame.rarity.toUpperCase()}
              </PixelBadge>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}
