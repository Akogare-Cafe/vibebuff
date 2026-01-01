"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Lock, 
  Star,
  Map,
  Layers,
  Users,
  Swords,
  Zap,
  Target,
  ChevronRight
} from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

interface AchievementProgressProps {
  userId: string;
  showAll?: boolean;
  className?: string;
}

export function AchievementProgress({ userId, showAll = false, className }: AchievementProgressProps) {
  const data = useQuery(api.achievements.getAchievementsWithProgress, { userId });

  if (!data) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING ACHIEVEMENTS...</div>
      </div>
    );
  }

  const { achievements, stats } = data;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "border-yellow-400 bg-yellow-400/10";
      case "rare": return "border-purple-400 bg-purple-400/10";
      case "uncommon": return "border-blue-400 bg-blue-400/10";
      default: return "border-[#1e3a5f] bg-[#0a1628]";
    }
  };

  const displayAchievements = showAll 
    ? achievements 
    : achievements.filter((a) => a.isUnlocked || a.progressPercent > 0);

  const inProgress = achievements.filter((a) => !a.isUnlocked && a.progressPercent > 0);
  const nearCompletion = inProgress.filter((a) => a.progressPercent >= 75);

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
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4" /> ACHIEVEMENTS
          </h2>
          <PixelBadge variant="default">
            {stats.unlocked} / {stats.total}
          </PixelBadge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-[#60a5fa] text-xl">{stats.unlocked}</p>
            <p className="text-[#3b82f6] text-[8px]">UNLOCKED</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 text-xl">{stats.totalXpEarned}</p>
            <p className="text-[#3b82f6] text-[8px]">XP EARNED</p>
          </div>
          <div className="text-center">
            <p className="text-purple-400 text-xl">{inProgress.length}</p>
            <p className="text-[#3b82f6] text-[8px]">IN PROGRESS</p>
          </div>
        </div>

        <div className="h-3 bg-[#0a1628] border border-[#1e3a5f] mb-2">
          <div 
            className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all duration-500"
            style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
          />
        </div>
        <p className="text-[#3b82f6] text-[8px] text-center">
          {Math.round((stats.unlocked / stats.total) * 100)}% COMPLETE
        </p>
      </PixelCard>

      {nearCompletion.length > 0 && (
        <PixelCard className="p-4 border-yellow-400">
          <h3 className="text-yellow-400 text-[10px] uppercase mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" /> ALMOST THERE!
          </h3>
          <div className="space-y-2">
            {nearCompletion.slice(0, 3).map((achievement) => (
              <div 
                key={achievement._id}
                className="flex items-center gap-3 p-2 border border-yellow-400/50 bg-yellow-400/5"
              >
                <DynamicIcon name={achievement.icon} className="w-6 h-6 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-[#60a5fa] text-[10px]">{achievement.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#0a1628] border border-[#1e3a5f]">
                      <div 
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${achievement.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-yellow-400 text-[8px]">
                      {achievement.currentProgress}/{achievement.requirement.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {Object.entries(groupedByCategory).map(([category, categoryAchievements]) => (
        <div key={category}>
          <h3 className="text-[#3b82f6] text-[10px] uppercase mb-3 flex items-center gap-2">
            <span>{categoryIcons[category]}</span>
            {category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryAchievements.map((achievement) => (
              <AchievementCard key={achievement._id} achievement={achievement} />
            ))}
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

interface AchievementCardProps {
  achievement: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    xpReward: number;
    requirement: { type: string; count: number };
    isUnlocked: boolean;
    unlockedAt?: number;
    currentProgress: number;
    progressPercent: number;
    remaining: number;
  };
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "border-yellow-400 bg-yellow-400/10";
      case "rare": return "border-purple-400 bg-purple-400/10";
      case "uncommon": return "border-blue-400 bg-blue-400/10";
      default: return "border-[#1e3a5f] bg-[#0a1628]";
    }
  };

  return (
    <PixelCard
      className={cn(
        "p-3 transition-all",
        achievement.isUnlocked ? getRarityColor(achievement.rarity) : "opacity-80",
        achievement.isUnlocked && "hover:scale-[1.02]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 border-2 flex items-center justify-center flex-shrink-0",
          achievement.isUnlocked ? "border-current" : "border-[#1e3a5f]"
        )}>
          {achievement.isUnlocked ? (
            <DynamicIcon name={achievement.icon} className="w-5 h-5 text-[#60a5fa]" />
          ) : (
            <Lock className="w-5 h-5 text-[#1e3a5f]" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn(
                "text-[10px]",
                achievement.isUnlocked ? "text-[#60a5fa]" : "text-[#3b82f6]"
              )}>
                {achievement.name}
              </p>
              <p className="text-[#3b82f6] text-[8px]">{achievement.description}</p>
            </div>
            {achievement.isUnlocked && (
              <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          
          {!achievement.isUnlocked && achievement.progressPercent > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#0a1628] border border-[#1e3a5f]">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      achievement.progressPercent >= 75 ? "bg-yellow-400" : "bg-[#3b82f6]"
                    )}
                    style={{ width: `${achievement.progressPercent}%` }}
                  />
                </div>
                <span className="text-[#3b82f6] text-[8px] flex-shrink-0">
                  {achievement.currentProgress}/{achievement.requirement.count}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
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
          
          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="text-[#1e3a5f] text-[6px] mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </PixelCard>
  );
}

export function AchievementProgressWidget({ userId }: { userId: string }) {
  const data = useQuery(api.achievements.getAchievementsWithProgress, { userId });

  if (!data) return null;

  const { achievements, stats } = data;
  const nearCompletion = achievements.filter((a) => !a.isUnlocked && a.progressPercent >= 50);

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Trophy className="w-3 h-3" /> ACHIEVEMENTS
        </span>
        <PixelBadge variant="outline" className="text-[6px]">
          {stats.unlocked}/{stats.total}
        </PixelBadge>
      </div>
      
      <div className="h-2 bg-[#0a1628] border border-[#1e3a5f] mb-2">
        <div 
          className="h-full bg-[#3b82f6]"
          style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
        />
      </div>

      {nearCompletion.length > 0 && (
        <div className="space-y-1">
          {nearCompletion.slice(0, 2).map((a) => (
            <div key={a._id} className="flex items-center gap-2 text-[8px]">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-[#3b82f6] truncate flex-1">{a.name}</span>
              <span className="text-yellow-400">{a.progressPercent.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </PixelCard>
  );
}
