"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PageHeader } from "@/components/page-header";
import { PageLayout, Section, Grid } from "@/components/page-layout";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Swords,
  Layers,
  Star,
  Users,
  ChevronLeft,
  Zap,
  Eye,
  Vote,
} from "lucide-react";
import { ToolsLeaderboard } from "@/components/tools-leaderboard";
import { TourTrigger } from "@/components/page-tour";
import { leaderboardsTourConfig } from "@/lib/tour-configs";
import { SkeletonPulse } from "@/components/skeletons";

type LeaderboardType = "xp" | "battles" | "decks" | "mastery" | "toolsViewed" | "votes";

const LEADERBOARD_CONFIG: { id: LeaderboardType; label: string; icon: React.ReactNode; getStatValue: (user: Record<string, unknown>) => string }[] = [
  { id: "xp", label: "XP Leaders", icon: <Zap className="w-5 h-5 text-yellow-400" />, getStatValue: (user) => `${(user.xp as number).toLocaleString()} XP` },
  { id: "battles", label: "Battle Champions", icon: <Swords className="w-5 h-5 text-red-400" />, getStatValue: (user) => `${user.battlesWon} wins (${user.winRate}%)` },
  { id: "decks", label: "Deck Builders", icon: <Layers className="w-5 h-5 text-blue-400" />, getStatValue: (user) => `${user.decksCreated} decks` },
  { id: "mastery", label: "Tool Masters", icon: <Star className="w-5 h-5 text-purple-400" />, getStatValue: (user) => `${(user.masteryXp as number).toLocaleString()} XP` },
  { id: "toolsViewed", label: "Tool Explorers", icon: <Eye className="w-5 h-5 text-indigo-400" />, getStatValue: (user) => `${user.toolsViewed} tools` },
  { id: "votes", label: "Active Voters", icon: <Vote className="w-5 h-5 text-pink-400" />, getStatValue: (user) => `${user.votescast} votes` },
];

export default function LeaderboardsPage() {
  const xpLeaderboard = useQuery(api.leaderboards.getXpLeaderboard, { limit: 10 });
  const battlesLeaderboard = useQuery(api.leaderboards.getBattlesLeaderboard, { limit: 10 });
  const decksLeaderboard = useQuery(api.leaderboards.getDecksLeaderboard, { limit: 10 });
  const masteryLeaderboard = useQuery(api.leaderboards.getMasteryLeaderboard, { limit: 10 });
  const toolsViewedLeaderboard = useQuery(api.leaderboards.getToolsViewedLeaderboard, { limit: 10 });
  const votesLeaderboard = useQuery(api.leaderboards.getVotesCastLeaderboard, { limit: 10 });

  const leaderboardDataMap: Record<LeaderboardType, Array<{ rank: number; clerkId: string; username: string | undefined; avatarUrl: string | undefined; level: number; title: string | undefined; [key: string]: unknown }> | undefined> = {
    xp: xpLeaderboard,
    battles: battlesLeaderboard,
    decks: decksLeaderboard,
    mastery: masteryLeaderboard,
    toolsViewed: toolsViewedLeaderboard,
    votes: votesLeaderboard,
  };

  return (
    <PageLayout>
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={leaderboardsTourConfig} />
      </div>
      <PageHeader
        title="LEADERBOARDS"
        description="See how you stack up against other adventurers in the VIBEBUFF community."
        icon={Trophy}
        breadcrumb={
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
        }
      />

        <Section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tools Rankings
          </h2>
          <ToolsLeaderboard limit={10} />
        </Section>

        <Section spacing="md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Rankings
          </h2>
        </Section>

        <Section>
          <Grid cols={4} data-tour="leaderboard-list">
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
                      <div className="space-y-0 divide-y divide-border">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3">
                            <SkeletonPulse className="w-6 h-6 shrink-0" />
                            <SkeletonPulse className="size-8 shrink-0 rounded-full" />
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <SkeletonPulse className="h-4 w-24" />
                            </div>
                            <SkeletonPulse className="h-4 w-16 shrink-0" />
                          </div>
                        ))}
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
        </Grid>
      </Section>
    </PageLayout>
  );
}
