import { MessageSquare, Plus } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";
import { SkeletonPulse, ForumThreadListSkeleton } from "@/components/skeletons";

export default function ForumLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h1 className="font-heading text-foreground text-2xl">FORUM</h1>
            </div>
            <PixelButton disabled>
              <Plus className="w-4 h-4 mr-2" /> New Thread
            </PixelButton>
          </div>
          <p className="text-muted-foreground text-sm">
            Discuss tools, share knowledge, and connect with the community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <PixelCard key={i} className="p-4">
              <div className="flex items-center gap-3">
                <SkeletonPulse className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <SkeletonPulse className="h-6 w-12" />
                  <SkeletonPulse className="h-3 w-20" />
                </div>
              </div>
            </PixelCard>
          ))}
        </div>

        <ForumThreadListSkeleton count={8} />
      </main>
    </div>
  );
}
