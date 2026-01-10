"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Swords,
  Layers,
  Map,
  Flame,
  Star,
  Users,
  ChevronLeft,
  Zap,
  MessageSquare,
} from "lucide-react";
import { TourTrigger } from "@/components/page-tour";
import { leaderboardsTourConfig } from "@/lib/tour-configs";

type LeaderboardType = "xp" | "battles" | "decks" | "quests" | "mastery" | "streaks" | "reviews";

const LEADERBOARD_TABS: { id: LeaderboardType; label: string; icon: React.ReactNode }[] = [
  { id: "xp", label: "XP", icon: <Zap className="w-4 h-4" /> },
  { id: "battles", label: "Battles", icon: <Swords className="w-4 h-4" /> },
  { id: "decks", label: "Decks", icon: <Layers className="w-4 h-4" /> },
  { id: "quests", label: "Quests", icon: <Map className="w-4 h-4" /> },
  { id: "mastery", label: "Mastery", icon: <Star className="w-4 h-4" /> },
  { id: "streaks", label: "Streaks", icon: <Flame className="w-4 h-4" /> },
  { id: "reviews", label: "Reviews", icon: <MessageSquare className="w-4 h-4" /> },
];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("xp");

  const xpLeaderboard = useQuery(api.leaderboards.getXpLeaderboard, { limit: 50 });
  const battlesLeaderboard = useQuery(api.leaderboards.getBattlesLeaderboard, { limit: 50 });
  const decksLeaderboard = useQuery(api.leaderboards.getDecksLeaderboard, { limit: 50 });
  const questsLeaderboard = useQuery(api.leaderboards.getQuestsLeaderboard, { limit: 50 });
  const masteryLeaderboard = useQuery(api.leaderboards.getMasteryLeaderboard, { limit: 50 });
  const streaksLeaderboard = useQuery(api.leaderboards.getStreakLeaderboard, { limit: 50 });
  const reviewsLeaderboard = useQuery(api.leaderboards.getReviewsLeaderboard, { limit: 50 });

  const getLeaderboardData = () => {
    switch (activeTab) {
      case "xp":
        return xpLeaderboard;
      case "battles":
        return battlesLeaderboard;
      case "decks":
        return decksLeaderboard;
      case "quests":
        return questsLeaderboard;
      case "mastery":
        return masteryLeaderboard;
      case "streaks":
        return streaksLeaderboard;
      case "reviews":
        return reviewsLeaderboard;
      default:
        return xpLeaderboard;
    }
  };

  const getStatValue = (user: Record<string, unknown>) => {
    switch (activeTab) {
      case "xp":
        return `${(user.xp as number).toLocaleString()} XP`;
      case "battles":
        return `${user.battlesWon} wins (${user.winRate}%)`;
      case "decks":
        return `${user.decksCreated} decks`;
      case "quests":
        return `${user.questsCompleted} quests`;
      case "mastery":
        return `${(user.masteryXp as number).toLocaleString()} XP (${user.toolsMastered} tools)`;
      case "streaks":
        return `${user.currentStreak} day streak`;
      case "reviews":
        return `${user.reviewCount} reviews (${user.helpfulVotes} helpful)`;
      default:
        return "";
    }
  };

  const leaderboardData = getLeaderboardData();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={leaderboardsTourConfig} />
      </div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="font-heading text-foreground text-2xl">LEADERBOARDS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            See how you stack up against other adventurers in the VIBEBUFF community.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6" data-tour="leaderboard-tabs">
          {LEADERBOARD_TABS.map((tab) => (
            <PixelButton
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              size="sm"
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </PixelButton>
          ))}
        </div>

        {leaderboardData && leaderboardData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-tour="leaderboard-list">
            {leaderboardData.slice(0, 3).map((user, index) => (
              <Link key={user.clerkId} href={`/users/${user.clerkId}`}>
                <PixelCard 
                  className={`h-full hover:border-primary transition-colors cursor-pointer ${
                    index === 0 ? "border-yellow-500" : 
                    index === 1 ? "border-gray-400" : 
                    "border-orange-600"
                  }`}
                  rarity={index === 0 ? "legendary" : index === 1 ? "rare" : "uncommon"}
                >
                  <PixelCardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" : 
                      "bg-orange-600"
                    }`}>
                      {index === 0 ? <Crown className="w-6 h-6 text-black" /> :
                       index === 1 ? <Medal className="w-6 h-6 text-black" /> :
                       <Medal className="w-6 h-6 text-white" />}
                    </div>
                    <div className="size-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl as string} alt={user.username as string || ""} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <h3 className="text-foreground font-bold truncate">{user.username as string || "Unknown"}</h3>
                    <p className="text-muted-foreground text-xs mb-2">{user.title as string || "Adventurer"}</p>
                    <PixelBadge variant="default" className="text-xs">
                      {getStatValue(user)}
                    </PixelBadge>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
          </div>
        )}

        <PixelCard>
          <PixelCardContent className="p-0">
            <div className="divide-y divide-border">
              {leaderboardData?.slice(3).map((user) => (
                <Link key={user.clerkId} href={`/users/${user.clerkId}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-secondary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center font-bold text-sm text-muted-foreground">
                      {user.rank}
                    </div>
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl as string} alt={user.username as string || ""} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{user.username as string || "Unknown"}</p>
                      <p className="text-muted-foreground text-xs">{user.title as string || "Adventurer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-sm">{getStatValue(user)}</p>
                      <p className="text-muted-foreground text-xs">Level {user.level}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {!leaderboardData && (
                <div className="p-8 text-center">
                  <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50 animate-pulse" />
                  <p className="text-muted-foreground">Loading leaderboard...</p>
                </div>
              )}
              {leaderboardData?.length === 0 && (
                <div className="p-8 text-center">
                  <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No rankings yet. Be the first!</p>
                </div>
              )}
            </div>
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
