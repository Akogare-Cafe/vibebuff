import { HeroSkeleton, CategoryGridSkeleton, SkeletonPulse } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/30 py-3">
        <div className="h-[72px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
      
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <HeroSkeleton />
        
        <section className="mb-16">
          <SkeletonPulse className="h-8 w-48 rounded mb-8" />
          <CategoryGridSkeleton count={10} />
        </section>
      </section>
    </div>
  );
}
