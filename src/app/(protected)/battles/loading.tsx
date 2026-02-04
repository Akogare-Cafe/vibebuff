import { Swords, Plus, Filter } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { BattleGridSkeleton } from "@/components/skeletons";

export default function BattlesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Swords className="w-8 h-8 text-red-500" />
              <h1 className="font-heading text-foreground text-2xl">BATTLES</h1>
            </div>
            <PixelButton disabled>
              <Plus className="w-4 h-4 mr-2" /> Create Battle
            </PixelButton>
          </div>
          <p className="text-muted-foreground text-sm">
            Challenge the community to vote on the best tools.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <PixelButton variant="outline" size="sm" disabled>
            All Battles
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            Active
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            Completed
          </PixelButton>
          <PixelButton variant="outline" size="sm" disabled>
            <Filter className="w-4 h-4" />
          </PixelButton>
        </div>

        <BattleGridSkeleton count={6} />
      </main>
    </div>
  );
}
