"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { Trophy, Lock, Star, Map, Layers, Users, Swords, X } from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

interface AchievementDisplayProps {
  userId: string;
  showAll?: boolean;
  className?: string;
}

export function AchievementDisplay({ userId, showAll = false, className }: AchievementDisplayProps) {
  const allAchievements = useQuery(api.achievements.list);
  const userAchievements = useQuery(api.achievements.getUserAchievements, { userId });

  if (!allAchievements) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING ACHIEVEMENTS...</div>
      </div>
    );
  }

  const unlockedIds = new Set(userAchievements?.map((ua) => ua.achievementId) || []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "border-yellow-400 bg-yellow-400/10";
      case "rare": return "border-purple-400 bg-purple-400/10";
      case "uncommon": return "border-blue-400 bg-blue-400/10";
      default: return "border-[#1e3a5f] bg-[#0a1628]";
    }
  };

  const displayAchievements = showAll 
    ? allAchievements 
    : allAchievements.filter((a) => unlockedIds.has(a._id));

  const groupedByCategory = displayAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof displayAchievements>);

  const categoryIcons: Record<string, React.ReactNode> = {
    exploration: <Map className="w-4 h-4" />,
    collection: <Layers className="w-4 h-4" />,
    social: <Users className="w-4 h-4" />,
    mastery: <Swords className="w-4 h-4" />,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4" /> ACHIEVEMENTS
        </h2>
        <PixelBadge variant="default">
          {userAchievements?.length || 0} / {allAchievements.length}
        </PixelBadge>
      </div>

      {/* Categories */}
      {Object.entries(groupedByCategory).map(([category, achievements]) => (
        <div key={category}>
          <h3 className="text-[#3b82f6] text-[10px] uppercase mb-3 flex items-center gap-2">
            <span>{categoryIcons[category]}</span>
            {category}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement._id);
              const unlockData = userAchievements?.find((ua) => ua.achievementId === achievement._id);
              
              return (
                <PixelCard
                  key={achievement._id}
                  className={cn(
                    "p-3 transition-all",
                    isUnlocked ? getRarityColor(achievement.rarity) : "opacity-50 grayscale",
                    isUnlocked && "hover:scale-105"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <DynamicIcon name={achievement.icon} className="w-6 h-6 text-[#60a5fa]" />
                    {isUnlocked ? (
                      <Star className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#1e3a5f]" />
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-[10px] mb-1",
                    isUnlocked ? "text-[#60a5fa]" : "text-[#3b82f6]"
                  )}>
                    {achievement.name}
                  </p>
                  
                  <p className="text-[#3b82f6] text-[8px] mb-2">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <PixelBadge 
                      variant="outline" 
                      className={cn(
                        "text-[6px]",
                        achievement.rarity === "legendary" && "border-yellow-400 text-yellow-400",
                        achievement.rarity === "rare" && "border-purple-400 text-purple-400"
                      )}
                    >
                      {achievement.rarity.toUpperCase()}
                    </PixelBadge>
                    <span className="text-[#60a5fa] text-[8px]">+{achievement.xpReward} XP</span>
                  </div>
                  
                  {isUnlocked && unlockData && (
                    <p className="text-[#1e3a5f] text-[6px] mt-2">
                      Unlocked {new Date(unlockData.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </PixelCard>
              );
            })}
          </div>
        </div>
      ))}

      {displayAchievements.length === 0 && (
        <PixelCard className="p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO ACHIEVEMENTS YET</p>
          <p className="text-[#1e3a5f] text-[8px]">Start exploring to unlock badges!</p>
        </PixelCard>
      )}
    </div>
  );
}

// Compact achievement notification
interface AchievementUnlockProps {
  achievement: {
    name: string;
    icon: string;
    xpReward: number;
    rarity: string;
  };
  onClose?: () => void;
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <PixelCard 
        className="p-4 border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]"
        rarity="legendary"
      >
        <div className="flex items-center gap-3">
          <DynamicIcon name={achievement.icon} className="w-8 h-8 text-[#60a5fa]" />
          <div>
            <p className="text-yellow-400 text-[10px] uppercase">Achievement Unlocked!</p>
            <p className="text-[#60a5fa] text-sm">{achievement.name}</p>
            <p className="text-[#3b82f6] text-[8px]">+{achievement.xpReward} XP</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-[#3b82f6] hover:text-[#60a5fa]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </PixelCard>
    </div>
  );
}
