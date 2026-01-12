import { Trophy, ChevronLeft, Zap, Swords, Layers, Map, Star } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { LeaderboardPodiumSkeleton, LeaderboardListSkeleton } from "@/components/skeletons";
import Link from "next/link";

const LEADERBOARD_TABS = [
  { id: "xp", label: "XP", icon: <Zap className="w-4 h-4" /> },
  { id: "battles", label: "Battles", icon: <Swords className="w-4 h-4" /> },
  { id: "decks", label: "Decks", icon: <Layers className="w-4 h-4" /> },
  { id: "quests", label: "Quests", icon: <Map className="w-4 h-4" /> },
  { id: "mastery", label: "Mastery", icon: <Star className="w-4 h-4" /> },
];

export default function LeaderboardsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="font-heading text-foreground text-2xl">LEADERBOARDS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            See how you stack up against other adventurers in the VIBEBUFF community.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {LEADERBOARD_TABS.map((tab) => (
            <PixelButton
              key={tab.id}
              variant="outline"
              size="sm"
              disabled
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </PixelButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <LeaderboardPodiumSkeleton key={i} />
          ))}
        </div>

        <PixelCard>
          <PixelCardContent className="p-4">
            <LeaderboardListSkeleton count={10} />
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
