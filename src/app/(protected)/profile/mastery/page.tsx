"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import {
  GitBranch,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { ToolIcon } from "@/components/dynamic-icon";
import { ToolMasteryHero } from "@/components/tool-mastery-hero";

const MASTERY_COLORS: Record<string, { color: string; shadow: string }> = {
  novice: { color: "bg-gray-500", shadow: "shadow-[0_0_8px_rgba(107,114,128,0.5)]" },
  apprentice: { color: "bg-green-500", shadow: "shadow-[0_0_8px_rgba(34,197,94,0.5)]" },
  journeyman: { color: "bg-blue-500", shadow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
  expert: { color: "bg-purple-500", shadow: "shadow-[0_0_8px_rgba(168,85,247,0.5)]" },
  master: { color: "bg-orange-500", shadow: "shadow-[0_0_8px_rgba(249,115,22,0.5)]" },
  grandmaster: { color: "bg-yellow-500", shadow: "shadow-[0_0_8px_rgba(234,179,8,0.5)]" },
};

const MASTERY_XP_THRESHOLDS: Record<string, number> = {
  novice: 0,
  apprentice: 100,
  journeyman: 500,
  expert: 1000,
  master: 5000,
  grandmaster: 10000,
};

function getCurrentLevelXp(level: string): number {
  return MASTERY_XP_THRESHOLDS[level] || 0;
}

function getNextLevelXp(level: string): number | null {
  const levels = Object.keys(MASTERY_XP_THRESHOLDS);
  const currentIndex = levels.indexOf(level);
  if (currentIndex < levels.length - 1) {
    return MASTERY_XP_THRESHOLDS[levels[currentIndex + 1]];
  }
  return null;
}

export default function MasteryPage() {
  const { user, isLoaded } = useUser();

  const getOrCreateProfile = useMutation(api.userProfiles.getOrCreateProfile);

  const masteries = useQuery(
    api.mastery.getUserMasteries,
    user?.id ? { userId: user.id } : "skip"
  );

  const masteryStats = useQuery(
    api.mastery.getMasteryStats,
    user?.id ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    const clerkId = user?.id;
    if (clerkId && isLoaded) {
      getOrCreateProfile({
        clerkId,
        username: user?.firstName || user?.username || undefined,
        avatarUrl: user?.imageUrl || undefined,
        email: user?.primaryEmailAddress?.emailAddress || undefined,
      });
    }
  }, [user?.id, isLoaded, getOrCreateProfile, user?.firstName, user?.username, user?.imageUrl, user?.primaryEmailAddress?.emailAddress]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your mastery</p>
          <Link href="/sign-in">
            <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const topMasteries = masteries
    ?.sort((a, b) => b.xp - a.xp)
    .slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-purple-400" />
              Tool Mastery
            </h1>
            {masteryStats && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-bold text-foreground">{masteryStats.totalXp.toLocaleString()}</span>
                  <span>XP</span>
                </div>
                <span className="text-xs bg-card border border-border px-3 py-1 rounded text-muted-foreground">
                  {masteryStats.totalTools} tools
                </span>
              </div>
            )}
          </div>

          {masteryStats && masteryStats.totalTools > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(MASTERY_COLORS).map(([level, config]) => {
                const count = masteryStats.byLevel[level as keyof typeof masteryStats.byLevel] || 0;
                return (
                  <div
                    key={level}
                    className={`relative p-2.5 rounded-lg border border-border bg-card/50 text-center transition-all ${
                      count > 0 ? 'hover:border-primary/50' : 'opacity-50'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-lg ${config.color} opacity-10`} />
                    <p className={`text-lg font-bold relative z-10 ${count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {count}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground relative z-10">
                      {level}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(127,19,236,0.08),transparent_70%)] pointer-events-none" />
            
            {topMasteries.length > 0 ? (
              <div className="p-4 relative z-10">
                <ToolMasteryHero 
                  masteries={topMasteries} 
                  totalTools={masteryStats?.totalTools}
                />
              </div>
            ) : (
              <div className="py-12 px-6 text-center relative z-10">
                <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-foreground font-medium">No tool masteries yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Explore tools, add them to decks, and win battles to build your mastery
                </p>
                <Link href="/tools">
                  <button className="mt-4 text-xs font-bold text-primary border border-primary/30 bg-primary/10 px-4 py-2 rounded hover:bg-primary hover:text-white transition-all">
                    Explore Tools
                  </button>
                </Link>
              </div>
            )}
          </div>

          {masteries && masteries.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">All Masteries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {masteries.map((mastery) => {
                    if (!mastery.tool) return null;
                    
                    const currentLevelXp = getCurrentLevelXp(mastery.level);
                    const nextLevelXp = getNextLevelXp(mastery.level);
                    const progress = nextLevelXp 
                      ? ((mastery.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
                      : 100;
                    const masteryColor = MASTERY_COLORS[mastery.level];

                    return (
                      <Link key={mastery.toolId} href={`/tools/${mastery.tool.slug}`}>
                        <div className="bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-all cursor-pointer group">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="size-12 rounded bg-card border border-border flex items-center justify-center flex-shrink-0">
                              <ToolIcon toolSlug={mastery.tool.slug} className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                                {mastery.tool.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${masteryColor?.color} text-white font-medium uppercase`}>
                                  {mastery.level}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {mastery.xp.toLocaleString()} XP
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {nextLevelXp && (
                            <div className="space-y-1">
                              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${masteryColor?.color} transition-all`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {mastery.xp - currentLevelXp} / {nextLevelXp - currentLevelXp} to next level
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
