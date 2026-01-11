import { Users } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { SkeletonPulse } from "@/components/skeletons";

export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">COMMUNITY</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Connect with developers, share knowledge, and grow together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PixelCard key={i}>
              <PixelCardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <SkeletonPulse className="size-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-5 w-32" />
                    <SkeletonPulse className="h-3 w-24" />
                  </div>
                </div>
                <SkeletonPulse className="h-4 w-full mb-2" />
                <SkeletonPulse className="h-4 w-3/4" />
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>
      </main>
    </div>
  );
}
