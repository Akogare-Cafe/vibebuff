import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { SkeletonPulse, StatCardSkeleton, CardSkeleton } from "@/components/skeletons";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <PixelCard>
            <PixelCardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <SkeletonPulse className="size-24 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <SkeletonPulse className="h-8 w-48" />
                  <SkeletonPulse className="h-4 w-32" />
                  <SkeletonPulse className="h-4 w-full max-w-md" />
                  <div className="flex gap-2 pt-2">
                    <SkeletonPulse className="h-8 w-24" />
                    <SkeletonPulse className="h-8 w-24" />
                  </div>
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PixelCard>
            <PixelCardContent className="p-4">
              <SkeletonPulse className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonPulse className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <SkeletonPulse className="h-4 w-3/4" />
                      <SkeletonPulse className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>

          <PixelCard>
            <PixelCardContent className="p-4">
              <SkeletonPulse className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonPulse className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <SkeletonPulse className="h-4 w-3/4" />
                      <SkeletonPulse className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>

        <div>
          <SkeletonPulse className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
