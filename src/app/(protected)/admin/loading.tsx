import { Shield } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { StatCardSkeleton, SkeletonPulse } from "@/components/skeletons";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">ADMIN DASHBOARD</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage platform content and monitor activity.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <PixelCard key={i}>
              <PixelCardContent className="p-4">
                <SkeletonPulse className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <SkeletonPulse className="h-4 w-40" />
                      <SkeletonPulse className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>
      </main>
    </div>
  );
}
