"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  User,
  Trophy,
  Swords,
  Layers,
  Vote,
  Eye,
  Target,
  Crown,
  Star,
  TrendingUp,
  Medal,
  Zap
} from "lucide-react";

interface PlayerStatsProps {
  userId: string;
  className?: string;
}

export function PlayerStats({ userId, className }: PlayerStatsProps) {
  const profile = useQuery(api.userProfiles.getProfile, { clerkId: userId });
  const rank = useQuery(api.userProfiles.getUserRank, { clerkId: userId });

  if (!profile) {
    return (
      <PixelCard className="p-6 text-center">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING STATS...</div>
      </PixelCard>
    );
  }

  const xpToNextLevel = 1000 - (profile.xp % 1000);
  const xpProgress = ((profile.xp % 1000) / 1000) * 100;

  const getTitleColor = (level: number) => {
    if (level >= 50) return "text-yellow-400";
    if (level >= 30) return "text-purple-400";
    if (level >= 20) return "text-blue-400";
    if (level >= 10) return "text-green-400";
    return "text-[#60a5fa]";
  };

  const winRate = profile.battlesWon + profile.battlesLost > 0
    ? Math.round((profile.battlesWon / (profile.battlesWon + profile.battlesLost)) * 100)
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#3b82f6] bg-[#0a1628] flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#3b82f6]" />
              )}
            </div>
            <div>
              <h2 className="text-[#60a5fa] text-lg">{profile.username || "ADVENTURER"}</h2>
              <p className={cn("text-[10px]", getTitleColor(profile.level))}>{profile.title}</p>
              {rank && (
                <div className="flex items-center gap-2 mt-1">
                  <PixelBadge variant="outline" className="text-[6px]">
                    <Medal className="w-2 h-2 mr-1" /> RANK #{rank.rank}
                  </PixelBadge>
                  <span className="text-[#3b82f6] text-[8px]">Top {rank.percentile}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 text-xl">LV.{profile.level}</span>
            </div>
            <p className="text-[#3b82f6] text-[8px]">{profile.xp.toLocaleString()} XP</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-[8px] mb-1">
            <span className="text-[#3b82f6]">LEVEL PROGRESS</span>
            <span className="text-[#60a5fa]">{xpToNextLevel} XP to next level</span>
          </div>
          <div className="h-4 bg-[#0a1628] border-2 border-[#1e3a5f]">
            <div 
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatBox 
            icon={<Swords className="w-5 h-5" />}
            label="BATTLES WON"
            value={profile.battlesWon}
            color="text-green-400"
          />
          <StatBox 
            icon={<Target className="w-5 h-5" />}
            label="WIN RATE"
            value={`${winRate}%`}
            color={winRate >= 50 ? "text-green-400" : "text-red-400"}
          />
          <StatBox 
            icon={<Layers className="w-5 h-5" />}
            label="DECKS BUILT"
            value={profile.decksCreated}
            color="text-blue-400"
          />
          <StatBox 
            icon={<Eye className="w-5 h-5" />}
            label="TOOLS VIEWED"
            value={profile.toolsViewed}
            color="text-purple-400"
          />
          <StatBox 
            icon={<Vote className="w-5 h-5" />}
            label="VOTES CAST"
            value={profile.votescast}
            color="text-yellow-400"
          />
          <StatBox 
            icon={<Trophy className="w-5 h-5" />}
            label="QUESTS DONE"
            value={profile.questsCompleted}
            color="text-orange-400"
          />
        </div>
      </PixelCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> BATTLE RECORD
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#3b82f6] text-[10px]">Wins</span>
              <span className="text-green-400 text-[12px]">{profile.battlesWon}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#3b82f6] text-[10px]">Losses</span>
              <span className="text-red-400 text-[12px]">{profile.battlesLost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#3b82f6] text-[10px]">Total Battles</span>
              <span className="text-[#60a5fa] text-[12px]">{profile.battlesWon + profile.battlesLost}</span>
            </div>
            <div className="h-3 bg-[#0a1628] border border-[#1e3a5f] flex">
              <div 
                className="h-full bg-green-400"
                style={{ width: `${winRate}%` }}
              />
              <div 
                className="h-full bg-red-400"
                style={{ width: `${100 - winRate}%` }}
              />
            </div>
          </div>
        </PixelCard>

        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> QUICK ACTIONS
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/play?tab=battle" className="block">
              <div className="border-2 border-[#1e3a5f] p-3 text-center hover:border-[#3b82f6] transition-colors">
                <Swords className="w-6 h-6 mx-auto mb-1 text-[#3b82f6]" />
                <p className="text-[#60a5fa] text-[8px]">BATTLE</p>
              </div>
            </Link>
            <Link href="/play?tab=decks" className="block">
              <div className="border-2 border-[#1e3a5f] p-3 text-center hover:border-[#3b82f6] transition-colors">
                <Layers className="w-6 h-6 mx-auto mb-1 text-[#3b82f6]" />
                <p className="text-[#60a5fa] text-[8px]">BUILD DECK</p>
              </div>
            </Link>
            <Link href="/play?tab=collection" className="block">
              <div className="border-2 border-[#1e3a5f] p-3 text-center hover:border-[#3b82f6] transition-colors">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-[#3b82f6]" />
                <p className="text-[#60a5fa] text-[8px]">COLLECTION</p>
              </div>
            </Link>
            <Link href="/play?tab=voting" className="block">
              <div className="border-2 border-[#1e3a5f] p-3 text-center hover:border-[#3b82f6] transition-colors">
                <Vote className="w-6 h-6 mx-auto mb-1 text-[#3b82f6]" />
                <p className="text-[#60a5fa] text-[8px]">VOTE</p>
              </div>
            </Link>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  color: string;
}) {
  return (
    <div className="border-2 border-[#1e3a5f] p-3 text-center bg-[#0a1628]">
      <div className={cn("flex justify-center mb-2", color)}>{icon}</div>
      <p className={cn("text-lg", color)}>{value}</p>
      <p className="text-[#3b82f6] text-[6px]">{label}</p>
    </div>
  );
}

export function PlayerStatsWidget({ userId }: { userId: string }) {
  const profile = useQuery(api.userProfiles.getProfile, { clerkId: userId });

  if (!profile) return null;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-[12px]">LV.{profile.level}</span>
        </div>
        <span className="text-[#3b82f6] text-[8px]">{profile.xp} XP</span>
      </div>
      <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
        <div 
          className="h-full bg-[#3b82f6]"
          style={{ width: `${(profile.xp % 1000) / 10}%` }}
        />
      </div>
      <p className="text-[#3b82f6] text-[6px] mt-1">{profile.title}</p>
    </PixelCard>
  );
}
