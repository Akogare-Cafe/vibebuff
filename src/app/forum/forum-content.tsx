"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { 
  MessageSquare, 
  MessagesSquare, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Users,
  Flame,
  Lightbulb,
  HelpCircle,
  Megaphone,
  Wrench,
} from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { TourTrigger } from "@/components/page-tour";
import { forumTourConfig } from "@/lib/tour-configs";

const iconMap: Record<string, React.ElementType> = {
  Flame,
  Lightbulb,
  HelpCircle,
  Megaphone,
  Wrench,
  MessageSquare,
};

function formatTimeAgo(timestamp: number | undefined): string {
  if (!timestamp) return "No activity";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ForumContent() {
  const categories = useQuery(api.forum.getCategories);
  const recentThreads = useQuery(api.forum.getRecentThreads, { limit: 5 });
  const stats = useQuery(api.forum.getForumStats);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={forumTourConfig} />
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Forum</h1>
          <p className="text-muted-foreground">
            Discuss tools, share experiences, and connect with fellow developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-tour="forum-categories">
          <PixelCard>
            <PixelCardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessagesSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.threadCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Discussions</p>
              </div>
            </PixelCardContent>
          </PixelCard>
          <PixelCard>
            <PixelCardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.postCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Replies</p>
              </div>
            </PixelCardContent>
          </PixelCard>
          <PixelCard>
            <PixelCardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.categoryCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Categories</h2>
            {categories === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <PixelCard>
                <PixelCardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories yet. Check back soon!</p>
                </PixelCardContent>
              </PixelCard>
            ) : (
              categories.map((category: Doc<"forumCategories">) => {
                const IconComponent = iconMap[category.icon] || MessageSquare;
                return (
                  <Link key={category._id} href={`/forum/${category.slug}`}>
                    <PixelCard className="hover:border-primary/50 transition-colors cursor-pointer">
                      <PixelCardContent className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent 
                            className="w-6 h-6" 
                            style={{ color: category.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{category.threadCount}</p>
                            <p className="text-xs">Threads</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{category.postCount}</p>
                            <p className="text-xs">Posts</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </PixelCardContent>
                    </PixelCard>
                  </Link>
                );
              })
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recent Activity
              </h2>
              <PixelCard>
                <PixelCardContent className="p-0">
                  {recentThreads === undefined ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : recentThreads.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {recentThreads.map((thread: Doc<"forumThreads"> & { category: Doc<"forumCategories"> | null }) => (
                        <Link
                          key={thread._id}
                          href={`/forum/thread/${thread.slug}`}
                          className="block p-4 hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-medium text-foreground text-sm line-clamp-1">
                            {thread.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {thread.category && (
                              <PixelBadge variant="secondary" className="text-xs">
                                {thread.category.name}
                              </PixelBadge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(thread.createdAt)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </PixelCardContent>
              </PixelCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
