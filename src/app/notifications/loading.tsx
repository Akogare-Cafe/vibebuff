import { Bell } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { SkeletonPulse } from "@/components/skeletons";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">NOTIFICATIONS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Stay updated with your latest activity and interactions.
          </p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <PixelCard key={i}>
              <PixelCardContent className="p-4">
                <div className="flex items-start gap-4">
                  <SkeletonPulse className="size-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <SkeletonPulse className="h-4 w-3/4" />
                    <SkeletonPulse className="h-3 w-1/2" />
                    <SkeletonPulse className="h-3 w-24" />
                  </div>
                  <SkeletonPulse className="w-2 h-2 rounded-full flex-shrink-0" />
                </div>
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>
      </main>
    </div>
  );
}
