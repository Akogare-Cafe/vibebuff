import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { cn } from "@/lib/utils";

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
