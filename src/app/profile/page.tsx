"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import {
  Edit,
  BarChart3,
  GitBranch,
  Backpack,
  Trophy,
  User,
  Lock,
  PlusCircle,
  Search,
  Map,
  Crown,
  Layers,
  Swords,
  Flame,
  Shield,
  Medal,
  PartyPopper,
  Users,
  Vote,
  Coins,
  Star,
  Heart,
  Zap,
  Gift,
  Eye,
} from "lucide-react";
import { ToolIcon } from "@/components/dynamic-icon";
import { TourTrigger } from "@/components/page-tour";
import { profileTourConfig } from "@/lib/tour-configs";
// import { ReferralCard } from "@/components/referral-card";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Search,
  Map,
  Crown,
  Layers,
  Swords,
  Flame,
  Shield,
  Medal,
  PartyPopper,
  Users,
  Vote,
  Coins,
  Star,
};

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: "bg-gray-600", border: "border-gray-500", text: "text-gray-300" },
  uncommon: { bg: "bg-green-600", border: "border-green-500", text: "text-green-300" },
  rare: { bg: "bg-blue-600", border: "border-blue-500", text: "text-blue-300" },
  epic: { bg: "bg-purple-600", border: "border-purple-500", text: "text-purple-300" },
  legendary: { bg: "bg-yellow-600", border: "border-yellow-500", text: "text-yellow-300" },
};

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

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const getOrCreateProfile = useMutation(api.userProfiles.getOrCreateProfile);

  const profile = useQuery(
    api.userProfiles.getProfile,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const userRank = useQuery(
    api.userProfiles.getUserRank,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const achievementsData = useQuery(
    api.achievements.getAchievementsWithProgress,
    user?.id ? { userId: user.id } : "skip"
  );

  const masteries = useQuery(
    api.mastery.getUserMasteries,
    user?.id ? { userId: user.id } : "skip"
  );

  const masteryStats = useQuery(
    api.mastery.getMasteryStats,
    user?.id ? { userId: user.id } : "skip"
  );

  const userDecks = useQuery(
    api.decks.getUserDecks,
    user?.id ? { userId: user.id } : "skip"
  );

  const favoriteTools = useQuery(
    api.toolUsage.getFavorites,
    user?.id ? { userId: user.id } : "skip"
  );

  const affinities = useQuery(
    api.toolAffinity.getUserAffinities,
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
      }).catch(() => {});
    }
  }, [user?.id, isLoaded, getOrCreateProfile, user?.firstName, user?.username, user?.imageUrl, user?.primaryEmailAddress?.emailAddress]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="quest-card p-8 text-center max-w-md mx-auto mb-8">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In to View Profile</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an account to track your progress, earn achievements, and save your favorite tools.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-in">
                <button className="quest-btn px-6 py-2 font-bold">
                  Connect
                </button>
              </Link>
              <Link href="/tools">
                <button className="quest-btn-outline px-6 py-2 font-bold">
                  Browse Tools
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const userName = profile?.username || user.firstName || "Adventurer";
  const userTitle = profile?.title || "Novice Developer";
  const userLevel = profile?.level || 1;
  const xpCurrent = profile?.xp || 0;
  const xpForCurrentLevel = (userLevel - 1) * 1000;
  const xpForNextLevel = userLevel * 1000;
  const xpInLevel = xpCurrent - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpPercent = Math.round((xpInLevel / xpNeeded) * 100);

  const characterStats = [
    { 
      name: "Tools Viewed", 
      value: profile?.toolsViewed || 0, 
      max: 100, 
      color: "bg-blue-500", 
      shadow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
    },
    { 
      name: "Battles Won", 
      value: profile?.battlesWon || 0, 
      max: 50, 
      color: "bg-pink-500", 
      shadow: "shadow-[0_0_8px_rgba(236,72,153,0.5)]" 
    },
    { 
      name: "Decks Created", 
      value: profile?.decksCreated || 0, 
      max: 20, 
      color: "bg-orange-500", 
      shadow: "shadow-[0_0_8px_rgba(249,115,22,0.5)]" 
    },
    { 
      name: "Quests Completed", 
      value: profile?.questsCompleted || 0, 
      max: 30, 
      color: "bg-cyan-500", 
      shadow: "shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
    },
  ];

  const topMasteries = masteries?.slice(0, 4) || [];
  const unlockedAchievements = achievementsData?.achievements.filter(a => a.isUnlocked) || [];
  const lockedAchievements = achievementsData?.achievements.filter(a => !a.isUnlocked).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={profileTourConfig} />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden relative group" data-tour="profile-stats">
              <div className="h-32 bg-gradient-to-b from-primary/30 to-card relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
              </div>
              <div className="px-6 pb-6 pt-0 relative">
                <div className="size-24 rounded-xl border-4 border-card bg-card absolute -top-12 left-6 overflow-hidden shadow-xl">
                  {user.imageUrl ? (
                    <img
                      alt="Avatar"
                      className="w-full h-full object-cover bg-primary/10"
                      src={user.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-3 mb-2">
                  <Link href="/profile/settings">
                    <button className="text-xs bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  </Link>
                </div>
                <div className="mt-8">
                  <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-bold text-sm tracking-wide">{userTitle}</span>
                    <span className="size-1 bg-muted-foreground rounded-full" />
                    <span className="text-muted-foreground text-sm">Level {userLevel}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm uppercase font-bold text-muted-foreground mb-1">
                      <span>Experience</span>
                      <span>{xpCurrent.toLocaleString()} XP</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {xpInLevel}/{xpNeeded} to Level {userLevel + 1}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-background p-3 rounded border border-border">
                      <div className="text-sm text-muted-foreground uppercase">Rank</div>
                      <div className="text-lg font-bold text-foreground">
                        {userRank ? `#${userRank.rank.toLocaleString()}` : "---"}
                      </div>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <div className="text-sm text-muted-foreground uppercase">Quests</div>
                      <div className="text-lg font-bold text-foreground">
                        {profile?.questsCompleted || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 size-24 bg-primary/10 rounded-full blur-2xl" />
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-500" />
                Character Stats
              </h3>
              <div className="space-y-4">
                {characterStats.map((stat) => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300 font-medium">{stat.name}</span>
                      <span className="text-primary font-bold text-sm">{stat.value}/{stat.max}</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-1.5">
                      <div
                        className={`${stat.color} h-1.5 rounded-full ${stat.shadow} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {masteryStats && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground">{masteryStats.totalTools}</div>
                      <div className="text-xs text-muted-foreground">Tools Mastered</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{masteryStats.totalXp.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Mastery XP</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* <ReferralCard /> */}
          </aside>

          <div className="flex-1 flex flex-col gap-8 min-w-0">
            <section className="flex flex-col gap-4" data-tour="tool-mastery">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                  Tool Mastery
                </h2>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topMasteries.map((mastery) => {
                        const masteryColor = MASTERY_COLORS[mastery.level] || MASTERY_COLORS.novice;
                        const isMaxed = mastery.level === "grandmaster";
                        const nextLevelXp = getNextLevelXp(mastery.level);
                        const currentLevelXp = getCurrentLevelXp(mastery.level);
                        const progressPercent = nextLevelXp 
                          ? Math.min(100, ((mastery.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
                          : 100;

                        return (
                          <Link key={mastery._id} href={`/tools/${mastery.tool?.slug}`}>
                            <div className="group relative p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                              <div className={`absolute top-0 left-0 right-0 h-0.5 ${masteryColor.color}`} />
                              
                              <div className="flex items-start gap-3">
                                <div className={`relative size-12 rounded-lg bg-card border-2 flex-shrink-0 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 ${
                                  isMaxed ? 'border-yellow-500' : 'border-border'
                                } ${isMaxed ? masteryColor.shadow : ''}`}>
                                  {mastery.tool?.logoUrl ? (
                                    <img src={mastery.tool.logoUrl} alt={mastery.tool.name} className="w-8 h-8 object-contain" />
                                  ) : (
                                    <ToolIcon toolSlug={mastery.tool?.slug || ''} className="w-6 h-6 text-primary" />
                                  )}
                                  {isMaxed && (
                                    <div className="absolute -top-1 -right-1">
                                      <Crown className="w-4 h-4 text-yellow-500 drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                      {mastery.tool?.name || "Unknown"}
                                    </h4>
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${masteryColor.color} text-white`}>
                                      {mastery.level}
                                    </span>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <div className="flex justify-between items-center text-[10px] mb-1">
                                      <span className="text-muted-foreground">{mastery.xp.toLocaleString()} XP</span>
                                      {nextLevelXp && (
                                        <span className="text-muted-foreground">{nextLevelXp.toLocaleString()} XP</span>
                                      )}
                                    </div>
                                    <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${masteryColor.color} transition-all duration-500`}
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> {mastery.interactions.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Layers className="w-3 h-3" /> {mastery.interactions.deckAdds}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Swords className="w-3 h-3" /> {mastery.interactions.battleWins}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {masteryStats && masteryStats.totalTools > 4 && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-center">
                        <Link href="/profile/mastery">
                          <button className="text-xs font-bold text-primary border border-primary/30 bg-primary/10 px-4 py-2 rounded hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                            View All {masteryStats.totalTools} Masteries
                            <GitBranch className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    )}
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
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Backpack className="w-6 h-6 text-primary" />
                  My Decks
                </h2>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-card border border-border text-muted-foreground">
                    {userDecks?.length || 0} decks
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {userDecks && userDecks.length > 0 ? (
                  <>
                    {userDecks.slice(0, 5).map((deck) => (
                      <Link key={deck._id} href={`/decks/${deck._id}`}>
                        <div className="flex items-center gap-3 bg-card border border-border hover:border-primary/30 rounded-lg p-3 relative overflow-hidden group hover:bg-secondary transition-colors cursor-pointer">
                          <div className="size-14 bg-background rounded flex items-center justify-center border border-white/10">
                            <Layers className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-foreground font-bold text-sm truncate">{deck.name}</h4>
                            <p className="text-sm text-muted-foreground">{deck.toolIds.length} tools</p>
                            <div className="flex gap-1 mt-1">
                              {deck.tools?.slice(0, 3).filter((t): t is NonNullable<typeof t> => t !== null).map((tool) => (
                                <div key={tool._id} className="size-5 rounded bg-background border border-border overflow-hidden">
                                  {tool.logoUrl ? (
                                    <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <ToolIcon toolSlug={tool.slug} className="w-3 h-3 m-1 text-muted-foreground" />
                                  )}
                                </div>
                              ))}
                              {deck.toolIds.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{deck.toolIds.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : null}
                <Link href="/decks/new">
                  <div className="flex items-center justify-center gap-3 bg-card/30 border border-dashed border-border rounded-lg p-3 min-h-[80px] group hover:bg-card hover:border-primary/50 transition-colors cursor-pointer">
                    <PlusCircle className="w-5 h-5 text-border group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                      Create New Deck
                    </span>
                  </div>
                </Link>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  Favorite Tools
                </h2>
                <Link href="/profile/favorites">
                  <span className="text-xs bg-card border border-border px-3 py-1 rounded text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer">
                    {favoriteTools?.length || 0} favorites
                  </span>
                </Link>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                {favoriteTools && favoriteTools.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {favoriteTools.slice(0, 8).filter((t): t is NonNullable<typeof t> => t !== null).map((tool) => (
                      <Link key={tool._id} href={`/tools/${tool.slug}`}>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="size-14 rounded-lg bg-background border border-border flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform overflow-hidden">
                            {tool.logoUrl ? (
                              <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 object-contain" />
                            ) : (
                              <ToolIcon toolSlug={tool.slug} className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[70px]">
                            {tool.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {favoriteTools.length > 8 && (
                      <Link href="/profile/favorites">
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="size-14 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
                            <span className="text-primary font-bold text-sm">+{favoriteTools.length - 8}</span>
                          </div>
                          <span className="text-xs text-primary group-hover:text-foreground transition-colors">
                            View All
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">No favorite tools yet</p>
                    <Link href="/tools">
                      <button className="mt-3 text-xs font-bold text-primary border border-primary/30 bg-primary/10 px-4 py-2 rounded hover:bg-primary hover:text-white transition-all">
                        Browse Tools
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Achievements
                </h2>
                <div className="flex items-center gap-2">
                  {achievementsData && (
                    <span className="text-xs bg-card border border-border px-3 py-1 rounded text-muted-foreground">
                      {achievementsData.stats.unlocked}/{achievementsData.stats.total} unlocked
                    </span>
                  )}
                  <Link href="/profile/achievements">
                    <button className="text-xs font-bold text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded hover:bg-primary hover:text-white transition-all">
                      View All
                    </button>
                  </Link>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-wrap gap-4">
                  {unlockedAchievements.map((achievement) => {
                    const IconComponent = ICON_MAP[achievement.icon] || Trophy;
                    const rarityColor = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
                    return (
                      <div key={achievement._id} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className={`size-12 rounded-full ${rarityColor.bg} border-2 ${rarityColor.border} flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center max-w-[80px] truncate">
                          {achievement.name}
                        </span>
                      </div>
                    );
                  })}
                  {lockedAchievements.map((achievement) => (
                    <div key={achievement._id} className="flex flex-col items-center gap-2 opacity-40">
                      <div className="size-12 rounded-full bg-secondary border-2 border-white/10 flex items-center justify-center shadow-inner relative">
                        <Lock className="w-5 h-5 text-white/50" />
                        <div className="absolute -bottom-1 -right-1 bg-black/80 text-[10px] px-1 rounded text-muted-foreground">
                          {achievement.progressPercent.toFixed(0)}%
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                        {achievement.name}
                      </span>
                    </div>
                  ))}
                  {(!achievementsData || achievementsData.stats.total === 0) && (
                    <div className="w-full py-8 text-center">
                      <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground text-sm">No achievements available</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {affinities && affinities.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Tool Affinities
                  </h2>
                  <span className="text-xs bg-card border border-border px-3 py-1 rounded text-muted-foreground">
                    {affinities.length} bonds
                  </span>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {affinities.slice(0, 4).map((affinity) => (
                      <div key={affinity._id} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                        <div className="size-12 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden">
                          {affinity.tool?.logoUrl ? (
                            <img src={affinity.tool.logoUrl} alt={affinity.tool?.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <ToolIcon toolSlug={affinity.tool?.slug || ''} className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground truncate">{affinity.tool?.name || "Unknown"}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary capitalize">
                              {affinity.affinityLevel}
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                                style={{ width: `${affinity.progress}%` }}
                              />
                            </div>
                            {affinity.nextLevel && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {affinity.progress}% to {affinity.nextLevel}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
