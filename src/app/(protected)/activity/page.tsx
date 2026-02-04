"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PixelCard } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import {
  Activity,
  Zap,
  Users,
  Clock,
  TrendingUp,
  Trophy,
  Swords,
  Layers,
  Map,
  Eye,
  Star,
  ChevronLeft,
  Flame,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  tool_view: { icon: Eye, color: "text-blue-400", label: "Tool View" },
  battle_win: { icon: Swords, color: "text-red-400", label: "Battle Win" },
  battle_loss: { icon: Swords, color: "text-gray-400", label: "Battle" },
  deck_create: { icon: Layers, color: "text-green-400", label: "Deck Created" },
  quest_complete: { icon: Map, color: "text-purple-400", label: "Quest Complete" },
  achievement: { icon: Trophy, color: "text-yellow-400", label: "Achievement" },
  level_up: { icon: TrendingUp, color: "text-cyan-400", label: "Level Up" },
  daily_login: { icon: Calendar, color: "text-orange-400", label: "Daily Login" },
  streak_bonus: { icon: Flame, color: "text-orange-500", label: "Streak Bonus" },
  review: { icon: Star, color: "text-yellow-500", label: "Review" },
  mastery: { icon: Star, color: "text-indigo-400", label: "Mastery" },
  spin_wheel: { icon: Star, color: "text-pink-400", label: "Spin Wheel" },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ActivityPage() {
  const activityData = useQuery(api.xpActivity.getGlobalActivity, { limit: 100 });
  const stats = useQuery(api.xpActivity.getGlobalActivityStats);

  const activities = activityData?.activities || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <Link href="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Community</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                Global Activity
              </h1>
              <p className="text-muted-foreground mt-1">
                See what everyone is doing on VibeBuff
              </p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <PixelCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.todayActivities}</div>
                  <div className="text-xs text-muted-foreground uppercase">Today</div>
                </div>
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.todayXp.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground uppercase">XP Today</div>
                </div>
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.uniqueUsersToday}</div>
                  <div className="text-xs text-muted-foreground uppercase">Active Today</div>
                </div>
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.weekActivities.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground uppercase">This Week</div>
                </div>
              </div>
            </PixelCard>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
            </div>

            {!activityData ? (
              <PixelCard className="p-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading activity...</div>
              </PixelCard>
            ) : activities.length === 0 ? (
              <PixelCard className="p-12 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No activity yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Be the first to explore tools!</p>
              </PixelCard>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const config = SOURCE_CONFIG[activity.source] || { 
                    icon: Zap, 
                    color: "text-primary", 
                    label: activity.source.replace(/_/g, " ") 
                  };
                  const Icon = config.icon;
                  const user = activity.user;

                  return (
                    <PixelCard key={activity._id} className="p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "size-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          "bg-card border border-border"
                        )}>
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {user ? (
                              <Link 
                                href={`/users/${activity.userId}`}
                                className="font-medium text-foreground hover:text-primary transition-colors"
                              >
                                {user.username || "Anonymous"}
                              </Link>
                            ) : (
                              <span className="font-medium text-muted-foreground">Anonymous</span>
                            )}
                            {user && (
                              <PixelBadge variant="outline" className="text-[10px]">
                                Lv.{user.level}
                              </PixelBadge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {activity.description || config.label}
                          </p>

                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              +{activity.amount} XP
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        {user?.avatarUrl && (
                          <Link href={`/users/${activity.userId}`}>
                            <div className="size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-border hover:border-primary transition-colors">
                              <img 
                                src={user.avatarUrl} 
                                alt={user.username || ""} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>
                        )}
                      </div>
                    </PixelCard>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-[300px] flex-shrink-0 space-y-6">
            {stats && Object.keys(stats.bySource).length > 0 && (
              <PixelCard className="p-4">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Activity Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.bySource)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 8)
                    .map(([source, data]) => {
                      const config = SOURCE_CONFIG[source] || { 
                        icon: Zap, 
                        color: "text-primary", 
                        label: source.replace(/_/g, " ") 
                      };
                      const Icon = config.icon;
                      const maxCount = Math.max(...Object.values(stats.bySource).map(d => d.count));
                      const percent = (data.count / maxCount) * 100;

                      return (
                        <div key={source}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-sm flex items-center gap-2 capitalize", config.color)}>
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{data.count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                              style={{ width: `${percent}%` }}
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
                <TrendingUp className="w-4 h-4 text-green-400" />
                Weekly Stats
              </h3>
              {stats && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Activities</span>
                    <span className="text-foreground font-medium">{stats.weekActivities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Earned</span>
                    <span className="text-green-400 font-medium">{stats.weekXp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="text-foreground font-medium">{stats.uniqueUsersWeek}</span>
                  </div>
                </div>
              )}
            </PixelCard>

            <PixelCard className="p-4 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/30">
              <h3 className="font-bold text-foreground mb-2">Join the Action</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Explore tools, create decks, and earn XP to appear in the activity feed!
              </p>
              <div className="flex gap-2">
                <Link href="/tools" className="flex-1">
                  <button className="w-full text-xs font-bold text-primary border border-primary/30 bg-primary/10 px-3 py-2 rounded hover:bg-primary hover:text-white transition-all">
                    Explore Tools
                  </button>
                </Link>
                <Link href="/quest" className="flex-1">
                  <button className="w-full text-xs font-bold text-white bg-primary px-3 py-2 rounded hover:bg-primary/80 transition-all">
                    Start Quest
                  </button>
                </Link>
              </div>
            </PixelCard>
          </aside>
        </div>
      </main>
    </div>
  );
}
