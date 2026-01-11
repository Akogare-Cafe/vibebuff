import { Map, Filter } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { QuestGridSkeleton } from "@/components/skeletons";

export default function QuestsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">QUESTS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Complete quests to earn XP, unlock achievements, and level up.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <PixelButton variant="outline" size="sm" disabled>
            All Quests
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            Daily
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            Weekly
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            Special
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            <Filter className="w-4 h-4" />
          </PixelButton>
        </div>

        <QuestGridSkeleton count={9} />
      </main>
    </div>
  );
}
