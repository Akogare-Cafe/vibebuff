"use client";

import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { cn } from "@/lib/utils";
import { LayoutGrid, Coins, TrendingUp, Sparkles, Star } from "lucide-react";

export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={cn("bg-muted rounded animate-pulse", className)} />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <PixelCard className={cn("h-full", className)}>
      <PixelCardContent className="p-4">
        <div className="flex items-start gap-3">
          <SkeletonPulse className="size-14 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <SkeletonPulse className="h-5 w-3/4" />
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-2/3" />
            <div className="flex items-center gap-2 mt-3">
              <SkeletonPulse className="h-5 w-16" />
              <SkeletonPulse className="h-5 w-20" />
            </div>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <SkeletonPulse className="w-8 h-8 rounded-full" />
      <SkeletonPulse className="size-10 rounded-full" />
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-3 w-1/4" />
      </div>
      <div className="text-right space-y-2">
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-3 w-16" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <PixelCard className="p-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="size-10 rounded-lg" />
        <div className="space-y-2">
          <SkeletonPulse className="h-8 w-16" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
      </div>
    </PixelCard>
  );
}

export function ActivityItemSkeleton() {
  return (
    <PixelCard className="p-4">
      <div className="flex items-start gap-4">
        <SkeletonPulse className="size-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-12" />
          </div>
          <SkeletonPulse className="h-4 w-full" />
          <div className="flex items-center gap-3 mt-2">
            <SkeletonPulse className="h-3 w-16" />
            <SkeletonPulse className="h-3 w-20" />
          </div>
        </div>
        <SkeletonPulse className="size-10 rounded-full flex-shrink-0" />
      </div>
    </PixelCard>
  );
}

export function ToolCardSkeleton() {
  return (
    <PixelCard className="h-full">
      <PixelCardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <SkeletonPulse className="size-12 rounded-lg" />
            <SkeletonPulse className="h-5 w-16" />
          </div>
          <SkeletonPulse className="h-5 w-3/4" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
          <div className="flex items-center gap-2 pt-2">
            <SkeletonPulse className="h-6 w-20" />
            <SkeletonPulse className="h-6 w-16" />
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

export function LeaderboardPodiumSkeleton() {
  return (
    <PixelCard className="h-full">
      <PixelCardContent className="p-4 text-center">
        <SkeletonPulse className="w-12 h-12 mx-auto mb-3 rounded-full" />
        <SkeletonPulse className="size-16 mx-auto mb-3 rounded-full" />
        <SkeletonPulse className="h-4 w-24 mx-auto mb-2" />
        <SkeletonPulse className="h-3 w-20 mx-auto mb-2" />
        <SkeletonPulse className="h-6 w-28 mx-auto" />
      </PixelCardContent>
    </PixelCard>
  );
}

export function TrendingToolItemSkeleton({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg">
      <span className="text-orange-500/30 font-bold text-sm w-5">{index + 1}</span>
      <SkeletonPulse className="size-8 rounded" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-3 w-16" />
      </div>
      <SkeletonPulse className="h-3 w-14" />
    </div>
  );
}

export function NewToolItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg">
      <SkeletonPulse className="size-8 rounded" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <SkeletonPulse className="h-4 w-28" />
        <SkeletonPulse className="h-3 w-16" />
      </div>
      <SkeletonPulse className="h-3 w-16" />
    </div>
  );
}

export function TrendingSectionSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-orange-500/10 to-transparent">
        <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          Trending This Week
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <TrendingToolItemSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

export function NewToolsSectionSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-green-500/10 to-transparent">
        <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-green-500" />
          Recently Added
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <NewToolItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
          <LayoutGrid className="w-4 h-4 text-primary" />
          Categories
        </h3>
      </div>
      <div className="p-2 space-y-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="size-4 rounded" />
              <SkeletonPulse className="h-4 w-20" />
            </div>
            <SkeletonPulse className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingFilterSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
          <Coins className="w-4 h-4 text-yellow-500" />
          Pricing
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonPulse className="size-4 rounded" />
            <SkeletonPulse className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturedToolSkeleton() {
  return (
    <div className="bg-card border border-primary/30 rounded-xl p-1 relative overflow-hidden shadow-[0_0_40px_rgba(127,19,236,0.1)]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="relative bg-card rounded-lg p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="relative shrink-0">
          <div className="size-32 md:size-40 bg-background rounded-xl border border-primary/50 flex items-center justify-center">
            <SkeletonPulse className="w-16 h-16 md:w-20 md:h-20 rounded-lg" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-primary/50 px-3 py-1 rounded-full text-xs text-primary font-bold whitespace-nowrap z-20 shadow-lg">
            FEATURED
          </div>
        </div>
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SkeletonPulse className="h-8 w-40" />
                <SkeletonPulse className="h-6 w-16 rounded" />
              </div>
              <SkeletonPulse className="h-4 w-56" />
            </div>
            <div className="hidden sm:block text-right space-y-1">
              <SkeletonPulse className="h-3 w-20 ml-auto" />
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-4 h-4 text-yellow-400/30" />
                <SkeletonPulse className="h-6 w-12" />
              </div>
            </div>
          </div>
          <div className="border-l-2 border-primary/30 pl-4 space-y-2">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-5/6" />
            <SkeletonPulse className="h-4 w-4/6" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3">
            {["HP", "ATK", "DEF", "SPD", "MANA"].map((stat) => (
              <div key={stat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{stat}</span>
                  <SkeletonPulse className="h-3 w-6" />
                </div>
                <SkeletonPulse className="h-1.5 w-full rounded-sm" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <SkeletonPulse className="h-10 w-32 rounded" />
            <SkeletonPulse className="h-10 w-28 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolGridCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 border border-border flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="size-14 rounded-lg" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <SkeletonPulse className="h-5 w-28" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="p-1.5 rounded text-center space-y-1">
          <SkeletonPulse className="h-2 w-10 mx-auto" />
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3 text-green-400/30" />
            <SkeletonPulse className="h-3 w-8" />
          </div>
        </div>
        <div className="p-1.5 rounded text-center space-y-1">
          <SkeletonPulse className="h-2 w-8 mx-auto" />
          <SkeletonPulse className="h-3 w-10 mx-auto" />
        </div>
      </div>
      <SkeletonPulse className="h-3 w-full" />
      <SkeletonPulse className="h-3 w-4/5" />
      <SkeletonPulse className="h-7 w-full rounded mt-auto" />
    </div>
  );
}

export function ToolsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ToolGridCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="text-center mb-16">
      <div className="mb-10">
        <SkeletonPulse className="h-16 w-64 mx-auto rounded" />
        <SkeletonPulse className="h-1 w-48 mx-auto my-4 rounded" />
        <SkeletonPulse className="h-8 w-80 mx-auto rounded" />
      </div>
      <SkeletonPulse className="h-6 w-96 mx-auto mb-10 rounded" />
      <div className="max-w-2xl mx-auto mb-8">
        <SkeletonPulse className="h-12 w-full rounded-lg" />
      </div>
      <div className="flex gap-4 justify-center">
        <SkeletonPulse className="h-12 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export function CategoryGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

export function ForumThreadSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-3/4" />
          <div className="flex items-center gap-2">
            <SkeletonPulse className="size-6 rounded-full" />
            <SkeletonPulse className="h-3 w-24" />
            <SkeletonPulse className="h-3 w-20" />
          </div>
        </div>
        <SkeletonPulse className="h-8 w-16 rounded" />
      </div>
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-5/6" />
    </div>
  );
}

export function ForumThreadListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ForumThreadSkeleton key={i} />
      ))}
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <SkeletonPulse className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-28" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center space-y-1">
          <SkeletonPulse className="h-6 w-12 mx-auto" />
          <SkeletonPulse className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <SkeletonPulse className="h-6 w-12 mx-auto" />
          <SkeletonPulse className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <SkeletonPulse className="h-6 w-12 mx-auto" />
          <SkeletonPulse className="h-3 w-16 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function UserGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LeaderboardEntrySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
      <SkeletonPulse className="w-8 h-6 rounded" />
      <SkeletonPulse className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-3 w-24" />
      </div>
      <div className="text-right space-y-2">
        <SkeletonPulse className="h-5 w-16" />
        <SkeletonPulse className="h-3 w-12" />
      </div>
    </div>
  );
}

export function LeaderboardListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <LeaderboardEntrySkeleton key={i} />
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
      <SkeletonPulse className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-3/4" />
        <SkeletonPulse className="h-3 w-24" />
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

export function QuestCardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-48" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
        </div>
        <SkeletonPulse className="size-12 rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
        <SkeletonPulse className="h-2 w-full rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <SkeletonPulse className="h-6 w-24 rounded" />
        <SkeletonPulse className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

export function QuestGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <QuestCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BattleCardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <SkeletonPulse className="h-6 w-32" />
        <SkeletonPulse className="h-5 w-20 rounded" />
      </div>
      <div className="flex items-center justify-center gap-8 my-6">
        <div className="text-center space-y-2">
          <SkeletonPulse className="size-16 rounded-lg mx-auto" />
          <SkeletonPulse className="h-4 w-24 mx-auto" />
        </div>
        <SkeletonPulse className="h-8 w-8 rounded-full" />
        <div className="text-center space-y-2">
          <SkeletonPulse className="size-16 rounded-lg mx-auto" />
          <SkeletonPulse className="h-4 w-24 mx-auto" />
        </div>
      </div>
      <SkeletonPulse className="h-10 w-full rounded" />
    </div>
  );
}

export function BattleGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BattleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <SkeletonPulse className="size-16 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-40" />
          <SkeletonPulse className="h-3 w-32" />
          <SkeletonPulse className="h-4 w-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonPulse className="h-6 w-16 rounded" />
        <SkeletonPulse className="h-6 w-20 rounded" />
      </div>
    </div>
  );
}

export function CompanyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <SkeletonPulse className="size-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-36" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      </div>
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-4/5" />
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <SkeletonPulse className="size-6 rounded-full" />
          <SkeletonPulse className="size-6 rounded-full" />
          <SkeletonPulse className="h-3 w-12" />
        </div>
        <SkeletonPulse className="h-8 w-16 rounded" />
      </div>
    </div>
  );
}

export function GroupGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <GroupCardSkeleton key={i} />
      ))}
    </div>
  );
}
