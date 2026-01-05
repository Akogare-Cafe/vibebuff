"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { PixelButton } from "./pixel-button";
import { cn } from "@/lib/utils";
import { 
  User, 
  Star, 
  Trophy,
  Swords,
  Layers,
  Scroll,
  Vote,
  TrendingUp,
  Medal
} from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

interface UserProfileProps {
  userId: string;
  className?: string;
}

export function UserProfile({ userId, className }: UserProfileProps) {
  const profile = useQuery(api.userProfiles.getProfile, { clerkId: userId });
  const rank = useQuery(api.userProfiles.getUserRank, { clerkId: userId });
  const achievements = useQuery(api.achievements.getUserAchievements, { userId });

  if (!profile) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground text-sm pixel-loading">LOADING PROFILE...</div>
      </div>
    );
  }

  const xpToNextLevel = ((profile.level) * 1000) - profile.xp;
  const xpProgress = (profile.xp % 1000) / 1000 * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Profile Header */}
      <PixelCard className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 border-4 border-primary bg-[#191022] flex items-center justify-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-primary text-lg">{profile.username || "ADVENTURER"}</h2>
            <p className="text-muted-foreground text-sm">{profile.title || "Novice Developer"}</p>
            {rank && (
              <p className="text-muted-foreground text-xs mt-1">
                Rank #{rank.rank} • Top {rank.percentile}%
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-yellow-400 text-2xl">LV.{profile.level}</p>
            <p className="text-muted-foreground text-xs">{profile.xp.toLocaleString()} XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">LEVEL {profile.level}</span>
            <span className="text-muted-foreground">LEVEL {profile.level + 1}</span>
          </div>
          <div className="h-4 bg-[#191022] border-2 border-border">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs text-center mt-1">
            {xpToNextLevel.toLocaleString()} XP to next level
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox 
            icon={<Swords className="w-4 h-4" />}
            label="BATTLES"
            value={`${profile.battlesWon}W / ${profile.battlesLost}L`}
            color="text-red-400"
          />
          <StatBox 
            icon={<Layers className="w-4 h-4" />}
            label="DECKS"
            value={profile.decksCreated}
            color="text-blue-400"
          />
          <StatBox 
            icon={<Scroll className="w-4 h-4" />}
            label="QUESTS"
            value={profile.questsCompleted}
            color="text-green-400"
          />
          <StatBox 
            icon={<Star className="w-4 h-4" />}
            label="TOOLS VIEWED"
            value={profile.toolsViewed}
            color="text-yellow-400"
          />
          <StatBox 
            icon={<Vote className="w-4 h-4" />}
            label="VOTES"
            value={profile.votescast}
            color="text-purple-400"
          />
          <StatBox 
            icon={<Trophy className="w-4 h-4" />}
            label="ACHIEVEMENTS"
            value={achievements?.length || 0}
            color="text-orange-400"
          />
        </div>
      </PixelCard>

      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> RECENT ACHIEVEMENTS
          </h3>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 6).map((ua: any) => (
              <div 
                key={ua._id}
                className="flex items-center gap-1 p-2 border border-border bg-[#191022]"
                title={ua.achievement?.description}
              >
                <DynamicIcon name={ua.achievement?.icon || "Trophy"} className="w-5 h-5 text-primary" />
                <span className="text-primary text-xs">{ua.achievement?.name}</span>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

function StatBox({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-center p-2 border border-border bg-[#191022]">
      <div className={cn("mb-1", color)}>{icon}</div>
      <p className={cn("text-lg", color)}>{value}</p>
      <p className="text-muted-foreground text-[6px]">{label}</p>
    </div>
  );
}

// Compact profile widget for header/sidebar
export function ProfileWidget({ userId }: { userId: string }) {
  const profile = useQuery(api.userProfiles.getProfile, { clerkId: userId });

  if (!profile) return null;

  const xpProgress = (profile.xp % 1000) / 1000 * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 border-2 border-primary bg-[#191022] flex items-center justify-center">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className="hidden md:block">
        <p className="text-primary text-sm">LV.{profile.level}</p>
        <div className="w-16 h-1 bg-[#191022] border border-border">
          <div 
            className="h-full bg-primary"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Leaderboard component
export function Leaderboard({ className }: { className?: string }) {
  const leaderboard = useQuery(api.userProfiles.getLeaderboard, { limit: 10 });

  if (!leaderboard) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground text-sm pixel-loading">LOADING LEADERBOARD...</div>
      </div>
    );
  }

  return (
    <PixelCard className={cn("p-4", className)}>
      <h3 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> LEADERBOARD
      </h3>

      <div className="space-y-2">
        {leaderboard.map((user: any, index: number) => (
          <div 
            key={user._id}
            className={cn(
              "flex items-center justify-between p-2 border",
              index === 0 && "border-yellow-400 bg-yellow-400/10",
              index === 1 && "border-gray-400 bg-gray-400/10",
              index === 2 && "border-orange-400 bg-orange-400/10",
              index > 2 && "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-6 h-6 flex items-center justify-center text-sm",
                index === 0 && "text-yellow-400",
                index === 1 && "text-gray-400",
                index === 2 && "text-orange-400",
                index > 2 && "text-muted-foreground"
              )}>
                {index < 3 ? <Medal className={`w-4 h-4 ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-400" : "text-orange-400"}`} /> : `#${user.rank}`}
              </span>
              <div>
                <p className="text-primary text-sm">{user.username || "Anonymous"}</p>
                <p className="text-muted-foreground text-xs">{user.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary text-sm">LV.{user.level}</p>
              <p className="text-muted-foreground text-xs">{user.xp.toLocaleString()} XP</p>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
