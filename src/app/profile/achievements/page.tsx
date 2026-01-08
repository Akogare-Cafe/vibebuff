"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Home,
  User,
  Lock,
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
  ChevronLeft,
  Filter,
  Sparkles,
  Target,
  CheckCircle,
  Clock,
  Zap,
  Award,
  TrendingUp,
  Compass,
  Binoculars,
  BookOpen,
  GraduationCap,
  Brain,
  Lightbulb,
  Shuffle,
  Eye,
  GitCompare,
  Scale,
  LayoutGrid,
  Boxes,
  Library,
  Warehouse,
  Castle,
  Package,
  PackagePlus,
  Gem,
  Heart,
  HeartHandshake,
  Bookmark,
  ShieldCheck,
  Gift,
  Github,
  Building,
  Wrench,
  Hammer,
  Cog,
  UserPlus,
  UsersRound,
  ThumbsUp,
  Megaphone,
  Share2,
  Globe,
  Copy,
} from "lucide-react";

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
  Compass,
  Sparkles,
  Binoculars,
  BookOpen,
  GraduationCap,
  Brain,
  Lightbulb,
  Shuffle,
  Eye,
  GitCompare,
  Scale,
  LayoutGrid,
  Boxes,
  Library,
  Warehouse,
  Castle,
  Package,
  PackagePlus,
  Gem,
  Heart,
  HeartHandshake,
  Bookmark,
  ShieldCheck,
  Award,
  TrendingUp,
  Zap,
  Gift,
  Github,
  Building,
  Wrench,
  Hammer,
  Cog,
  UserPlus,
  UsersRound,
  ThumbsUp,
  Megaphone,
  Share2,
  Globe,
  Copy,
};

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { 
    bg: "bg-gray-600/20", 
    border: "border-gray-500", 
    text: "text-gray-300",
    glow: ""
  },
  uncommon: { 
    bg: "bg-green-600/20", 
    border: "border-green-500", 
    text: "text-green-400",
    glow: "shadow-[0_0_10px_rgba(34,197,94,0.3)]"
  },
  rare: { 
    bg: "bg-blue-600/20", 
    border: "border-blue-500", 
    text: "text-blue-400",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.3)]"
  },
  epic: { 
    bg: "bg-purple-600/20", 
    border: "border-purple-500", 
    text: "text-purple-400",
    glow: "shadow-[0_0_10px_rgba(168,85,247,0.3)]"
  },
  legendary: { 
    bg: "bg-yellow-600/20", 
    border: "border-yellow-500", 
    text: "text-yellow-400",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.4)]"
  },
};

const CATEGORY_INFO: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  exploration: { icon: Map, color: "text-blue-400", label: "Exploration" },
  collection: { icon: Layers, color: "text-green-400", label: "Collection" },
  social: { icon: Users, color: "text-pink-400", label: "Social" },
  mastery: { icon: Crown, color: "text-yellow-400", label: "Mastery" },
};

type FilterCategory = "all" | "exploration" | "collection" | "social" | "mastery";
type FilterStatus = "all" | "unlocked" | "locked";

export default function AchievementsPage() {
  const { user, isLoaded } = useUser();
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const getOrCreateProfile = useMutation(api.userProfiles.getOrCreateProfile);

  const achievementsData = useQuery(
    api.achievements.getAchievementsWithProgress,
    user?.id ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (user?.id && isLoaded) {
      getOrCreateProfile({
        clerkId: user.id,
        username: user.firstName || user.username || undefined,
        avatarUrl: user.imageUrl || undefined,
        email: user.primaryEmailAddress?.emailAddress || undefined,
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
          <PixelCard className="p-8 text-center max-w-md mx-auto">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In to Track Achievements</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an account to unlock achievements, track your progress, and earn XP rewards.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-in">
                <PixelButton>Connect</PixelButton>
              </Link>
              <Link href="/tools">
                <PixelButton variant="outline">Browse Tools</PixelButton>
              </Link>
            </div>
          </PixelCard>
        </main>
      </div>
    );
  }

  const achievements = achievementsData?.achievements || [];
  const stats = achievementsData?.stats || { total: 0, unlocked: 0, totalXpEarned: 0 };

  const filteredAchievements = achievements.filter((achievement) => {
    const categoryMatch = categoryFilter === "all" || achievement.category === categoryFilter;
    const statusMatch = 
      statusFilter === "all" || 
      (statusFilter === "unlocked" && achievement.isUnlocked) ||
      (statusFilter === "locked" && !achievement.isUnlocked);
    return categoryMatch && statusMatch;
  });

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const inProgressAchievements = achievements
    .filter(a => !a.isUnlocked && a.progressPercent > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent);

  const recentUnlocks = unlockedAchievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);

  const selectedAchievementData = selectedAchievement 
    ? achievements.find(a => a._id === selectedAchievement)
    : null;

  const completionPercent = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Profile</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Achievements
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your progress and unlock rewards
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <PixelCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.unlocked}</div>
                <div className="text-xs text-muted-foreground uppercase">Unlocked</div>
              </div>
            </div>
          </PixelCard>

          <PixelCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground uppercase">Total</div>
              </div>
            </div>
          </PixelCard>

          <PixelCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalXpEarned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground uppercase">XP Earned</div>
              </div>
            </div>
          </PixelCard>

          <PixelCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{completionPercent}%</div>
                <div className="text-xs text-muted-foreground uppercase">Complete</div>
              </div>
            </div>
          </PixelCard>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm text-primary font-bold">{stats.unlocked}/{stats.total}</span>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(["all", "exploration", "collection", "social", "mastery"] as FilterCategory[]).map((cat) => {
                  const info = cat === "all" ? null : CATEGORY_INFO[cat];
                  const Icon = info?.icon || Sparkles;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                        categoryFilter === cat
                          ? "bg-primary text-white"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat === "all" ? "All" : info?.label}
                    </button>
                  );
                })}
              </div>

              <div className="w-px h-6 bg-border hidden sm:block" />

              <div className="flex gap-2">
                {(["all", "unlocked", "locked"] as FilterStatus[]).map((status) => {
                  const Icon = status === "unlocked" ? CheckCircle : status === "locked" ? Lock : Sparkles;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                        statusFilter === status
                          ? "bg-primary text-white"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredAchievements.length === 0 ? (
              <PixelCard className="p-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No achievements found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
              </PixelCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => {
                  const IconComponent = ICON_MAP[achievement.icon] || Trophy;
                  const rarityStyle = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;
                  const categoryInfo = CATEGORY_INFO[achievement.category];
                  const CategoryIcon = categoryInfo?.icon || Trophy;
                  const isSelected = selectedAchievement === achievement._id;

                  return (
                    <PixelCard
                      key={achievement._id}
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        achievement.isUnlocked ? rarityStyle.glow : "opacity-70",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedAchievement(isSelected ? null : achievement._id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "size-12 rounded-lg flex items-center justify-center border-2 flex-shrink-0",
                          achievement.isUnlocked 
                            ? `${rarityStyle.bg} ${rarityStyle.border}` 
                            : "bg-secondary border-white/10"
                        )}>
                          {achievement.isUnlocked ? (
                            <IconComponent className={cn("w-6 h-6", rarityStyle.text)} />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn(
                              "font-bold text-sm truncate",
                              achievement.isUnlocked ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {achievement.name}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <PixelBadge variant="outline" className={cn("text-[10px]", rarityStyle.text)}>
                              {achievement.rarity.toUpperCase()}
                            </PixelBadge>
                            <span className={cn("text-[10px] flex items-center gap-1", categoryInfo?.color)}>
                              <CategoryIcon className="w-3 h-3" />
                              {categoryInfo?.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!achievement.isUnlocked && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-primary font-medium">
                              {achievement.currentProgress}/{achievement.requirement.count}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                              style={{ width: `${achievement.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-green-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            +{achievement.xpReward} XP
                          </span>
                        </div>
                      )}
                    </PixelCard>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            {selectedAchievementData && (
              <PixelCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Achievement Details</h3>
                </div>
                
                <div className="text-center mb-4">
                  {(() => {
                    const IconComponent = ICON_MAP[selectedAchievementData.icon] || Trophy;
                    const rarityStyle = RARITY_STYLES[selectedAchievementData.rarity] || RARITY_STYLES.common;
                    return (
                      <div className={cn(
                        "size-20 rounded-xl mx-auto flex items-center justify-center border-2 mb-3",
                        selectedAchievementData.isUnlocked 
                          ? `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}` 
                          : "bg-secondary border-white/10"
                      )}>
                        {selectedAchievementData.isUnlocked ? (
                          <IconComponent className={cn("w-10 h-10", rarityStyle.text)} />
                        ) : (
                          <Lock className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })()}
                  <h4 className="font-bold text-lg text-foreground">{selectedAchievementData.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedAchievementData.description}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rarity</span>
                    <PixelBadge variant="outline" className={RARITY_STYLES[selectedAchievementData.rarity]?.text}>
                      {selectedAchievementData.rarity.toUpperCase()}
                    </PixelBadge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className={CATEGORY_INFO[selectedAchievementData.category]?.color}>
                      {CATEGORY_INFO[selectedAchievementData.category]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Reward</span>
                    <span className="text-green-400 font-bold">+{selectedAchievementData.xpReward} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={selectedAchievementData.isUnlocked ? "text-green-400" : "text-yellow-400"}>
                      {selectedAchievementData.isUnlocked ? "Unlocked" : "In Progress"}
                    </span>
                  </div>
                  {!selectedAchievementData.isUnlocked && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">
                          {selectedAchievementData.currentProgress}/{selectedAchievementData.requirement.count}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-blue-400"
                          style={{ width: `${selectedAchievementData.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedAchievementData.remaining} more to unlock
                      </p>
                    </div>
                  )}
                </div>
              </PixelCard>
            )}

            {recentUnlocks.length > 0 && (
              <PixelCard className="p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Recent Unlocks
                </h3>
                <div className="space-y-3">
                  {recentUnlocks.map((achievement) => {
                    const IconComponent = ICON_MAP[achievement.icon] || Trophy;
                    const rarityStyle = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;
                    return (
                      <div 
                        key={achievement._id} 
                        className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedAchievement(achievement._id)}
                      >
                        <div className={cn(
                          "size-8 rounded flex items-center justify-center",
                          rarityStyle.bg, rarityStyle.border, "border"
                        )}>
                          <IconComponent className={cn("w-4 h-4", rarityStyle.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PixelCard>
            )}

            {inProgressAchievements.length > 0 && (
              <PixelCard className="p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Almost There
                </h3>
                <div className="space-y-3">
                  {inProgressAchievements.slice(0, 3).map((achievement) => {
                    const IconComponent = ICON_MAP[achievement.icon] || Trophy;
                    return (
                      <div 
                        key={achievement._id} 
                        className="p-2 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedAchievement(achievement._id)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-8 rounded bg-secondary border border-white/10 flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                          </div>
                          <span className="text-xs text-primary font-bold">
                            {achievement.progressPercent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1 w-full bg-black/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-blue-400"
                            style={{ width: `${achievement.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PixelCard>
            )}

            <PixelCard className="p-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                By Category
              </h3>
              <div className="space-y-3">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const Icon = info.icon;
                  const categoryAchievements = achievements.filter(a => a.category === key);
                  const unlockedCount = categoryAchievements.filter(a => a.isUnlocked).length;
                  const totalCount = categoryAchievements.length;
                  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-sm flex items-center gap-2", info.color)}>
                          <Icon className="w-4 h-4" />
                          {info.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{unlockedCount}/{totalCount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-500", 
                            key === "exploration" && "bg-blue-500",
                            key === "collection" && "bg-green-500",
                            key === "social" && "bg-pink-500",
                            key === "mastery" && "bg-yellow-500"
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </PixelCard>
          </aside>
        </div>
      </main>

    </div>
  );
}
