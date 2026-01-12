"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Swords,
  Layers,
  Flame,
  Star,
  Users,
  ChevronLeft,
  Zap,
  MessageSquare,
  Target,
  Eye,
  Vote,
} from "lucide-react";
import { ToolsLeaderboard } from "@/components/tools-leaderboard";
import { TourTrigger } from "@/components/page-tour";
import { leaderboardsTourConfig } from "@/lib/tour-configs";

type LeaderboardType = "xp" | "battles" | "decks" | "mastery" | "streaks" | "reviews" | "quests" | "toolsViewed" | "votes";

const LEADERBOARD_CONFIG: { id: LeaderboardType; label: string; icon: React.ReactNode; getStatValue: (user: Record<string, unknown>) => string }[] = [
  { id: "xp", label: "XP Leaders", icon: <Zap className="w-5 h-5 text-yellow-400" />, getStatValue: (user) => `${(user.xp as number).toLocaleString()} XP` },
  { id: "battles", label: "Battle Champions", icon: <Swords className="w-5 h-5 text-red-400" />, getStatValue: (user) => `${user.battlesWon} wins (${user.winRate}%)` },
  { id: "decks", label: "Deck Builders", icon: <Layers className="w-5 h-5 text-blue-400" />, getStatValue: (user) => `${user.decksCreated} decks` },
  { id: "mastery", label: "Tool Masters", icon: <Star className="w-5 h-5 text-purple-400" />, getStatValue: (user) => `${(user.masteryXp as number).toLocaleString()} XP` },
  { id: "streaks", label: "Streak Kings", icon: <Flame className="w-5 h-5 text-orange-400" />, getStatValue: (user) => `${user.currentStreak} day streak` },
  { id: "reviews", label: "Top Reviewers", icon: <MessageSquare className="w-5 h-5 text-cyan-400" />, getStatValue: (user) => `${user.reviewCount} reviews` },
  { id: "quests", label: "Quest Completers", icon: <Target className="w-5 h-5 text-green-400" />, getStatValue: (user) => `${user.questsCompleted} quests` },
  { id: "toolsViewed", label: "Tool Explorers", icon: <Eye className="w-5 h-5 text-indigo-400" />, getStatValue: (user) => `${user.toolsViewed} tools` },
  { id: "votes", label: "Active Voters", icon: <Vote className="w-5 h-5 text-pink-400" />, getStatValue: (user) => `${user.votescast} votes` },
];

export default function LeaderboardsPage() {
  const xpLeaderboard = useQuery(api.leaderboards.getXpLeaderboard, { limit: 10 });
  const battlesLeaderboard = useQuery(api.leaderboards.getBattlesLeaderboard, { limit: 10 });
  const decksLeaderboard = useQuery(api.leaderboards.getDecksLeaderboard, { limit: 10 });
  const masteryLeaderboard = useQuery(api.leaderboards.getMasteryLeaderboard, { limit: 10 });
  const streaksLeaderboard = useQuery(api.leaderboards.getStreakLeaderboard, { limit: 10 });
  const reviewsLeaderboard = useQuery(api.leaderboards.getReviewsLeaderboard, { limit: 10 });
  const questsLeaderboard = useQuery(api.leaderboards.getQuestsLeaderboard, { limit: 10 });
  const toolsViewedLeaderboard = useQuery(api.leaderboards.getToolsViewedLeaderboard, { limit: 10 });
  const votesLeaderboard = useQuery(api.leaderboards.getVotesCastLeaderboard, { limit: 10 });

  const leaderboardDataMap: Record<LeaderboardType, Array<{ rank: number; clerkId: string; username: string | undefined; avatarUrl: string | undefined; level: number; title: string | undefined; [key: string]: unknown }> | undefined> = {
    xp: xpLeaderboard,
    battles: battlesLeaderboard,
    decks: decksLeaderboard,
    mastery: masteryLeaderboard,
    streaks: streaksLeaderboard,
    reviews: reviewsLeaderboard,
    quests: questsLeaderboard,
    toolsViewed: toolsViewedLeaderboard,
    votes: votesLeaderboard,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={leaderboardsTourConfig} />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tools Rankings
          </h2>
          <ToolsLeaderboard limit={10} />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Rankings
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" data-tour="leaderboard-list">
          {LEADERBOARD_CONFIG.map((config) => {
            const data = leaderboardDataMap[config.id];
            return (
              <PixelCard key={config.id}>
                <PixelCardHeader className="pb-2">
                  <PixelCardTitle className="flex items-center gap-2 text-base">
                    {config.icon}
                    {config.label}
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent className="p-0">
                  <div className="divide-y divide-border">
                    {!data && (
                      <div className="p-6 text-center">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50 animate-pulse" />
                        <p className="text-muted-foreground text-sm">Loading...</p>
                      </div>
                    )}
                    {data?.length === 0 && (
                      <div className="p-6 text-center">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-muted-foreground text-sm">No rankings yet</p>
                      </div>
                    )}
                    {data?.map((user, index) => (
                      <Link key={user.clerkId} href={`/users/${user.clerkId}`}>
                        <div className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors">
                          <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                            {index === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> :
                             index === 1 ? <Medal className="w-5 h-5 text-gray-300" /> :
                             index === 2 ? <Medal className="w-5 h-5 text-amber-600" /> :
                             <span className="text-muted-foreground text-xs font-mono">#{user.rank}</span>}
                          </div>
                          <div className="size-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl as string} alt={user.username as string || ""} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm font-medium truncate">{user.username as string || "Unknown"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-primary font-bold text-xs">{config.getStatValue(user)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </PixelCardContent>
              </PixelCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
