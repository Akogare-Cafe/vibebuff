import { Activity, ChevronLeft } from "lucide-react";
import { StatCardSkeleton, ActivityItemSkeleton, SkeletonPulse } from "@/components/skeletons";
import { PixelCard } from "@/components/pixel-card";
import Link from "next/link";

export default function ActivityLoading() {
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <SkeletonPulse className="w-5 h-5" />
              <SkeletonPulse className="h-6 w-32" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          </div>

          <aside className="w-full lg:w-[300px] flex-shrink-0 space-y-6">
            <PixelCard className="p-4">
              <SkeletonPulse className="h-5 w-40 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <SkeletonPulse className="h-4 w-24" />
                      <SkeletonPulse className="h-3 w-8" />
                    </div>
                    <SkeletonPulse className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <SkeletonPulse className="h-5 w-32 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <SkeletonPulse className="h-4 w-24" />
                    <SkeletonPulse className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </PixelCard>
          </aside>
        </div>
      </main>
    </div>
  );
}
