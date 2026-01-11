import { Scale, Search } from "lucide-react";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { SkeletonPulse } from "@/components/skeletons";

export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">COMPARE TOOLS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Compare tools side-by-side to make informed decisions.
          </p>
        </div>

        <div className="mb-8">
          <div className="max-w-md relative">
            <PixelInput
              placeholder="Search comparisons..."
              disabled
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <PixelCard key={i}>
              <PixelCardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <SkeletonPulse className="size-10 rounded-lg" />
                    <SkeletonPulse className="w-6 h-6 rounded" />
                    <SkeletonPulse className="size-10 rounded-lg" />
                  </div>
                  <SkeletonPulse className="h-5 w-full" />
                  <SkeletonPulse className="h-4 w-3/4" />
                  <div className="flex items-center gap-2 pt-2">
                    <SkeletonPulse className="h-6 w-20" />
                    <SkeletonPulse className="h-6 w-16" />
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>
      </main>
    </div>
  );
}
