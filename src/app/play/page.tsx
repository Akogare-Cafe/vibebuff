"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { 
  Gamepad2, 
  Swords, 
  Trophy, 
  Package, 
  Vote, 
  Layers,
  ChevronRight,
  Flame,
  Calendar
} from "lucide-react";

import { BattleHistory, BattleLeaderboard, BattleStatsWidget } from "@/components/battle-history";
import { AchievementProgress, AchievementProgressWidget } from "@/components/achievement-progress";
import { CollectionManager, CollectionWidget } from "@/components/collection-manager";
import { ToolNomination, NominationWidget } from "@/components/tool-nomination";
import { DeckBuilder } from "@/components/deck-builder";
import { BattleArena } from "@/components/battle-arena";
import { PackOpening } from "@/components/pack-opening";
import { VotingSection } from "@/components/voting";
import { AchievementDisplay } from "@/components/achievement-display";
import { ChallengesBoard } from "@/components/challenges";
import { BattlePass } from "@/components/battle-pass";
import { RoguelikeMode } from "@/components/roguelike-mode";
import { DraftMode } from "@/components/draft-mode";
import { PlayerStats, PlayerStatsWidget } from "@/components/player-stats";
import { DailyRewards, DailyRewardsWidget } from "@/components/daily-rewards";

type Tab = "overview" | "battle" | "collection" | "achievements" | "voting" | "decks" | "packs" | "challenges" | "battlepass" | "roguelike" | "draft" | "daily";

export default function PlayPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <p className="text-[#60a5fa] text-sm pixel-loading">LOADING...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <PixelCard className="p-8 text-center">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-[#3b82f6]" />
          <p className="text-[#60a5fa] text-sm mb-4">LOGIN REQUIRED</p>
          <p className="text-[#3b82f6] text-[10px] mb-4">
            PLEASE LOGIN TO ACCESS THE GAME FEATURES
          </p>
          <Link href="/sign-in">
            <PixelButton>LOGIN TO PLAY</PixelButton>
          </Link>
        </PixelCard>
      </div>
    );
  }

  const tabs: { id: Tab; name: string; icon: React.ReactNode }[] = [
    { id: "overview", name: "OVERVIEW", icon: <Gamepad2 className="w-4 h-4" /> },
    { id: "battle", name: "BATTLE", icon: <Swords className="w-4 h-4" /> },
    { id: "collection", name: "COLLECTION", icon: <Package className="w-4 h-4" /> },
    { id: "achievements", name: "ACHIEVEMENTS", icon: <Trophy className="w-4 h-4" /> },
    { id: "voting", name: "VOTING", icon: <Vote className="w-4 h-4" /> },
    { id: "decks", name: "DECKS", icon: <Layers className="w-4 h-4" /> },
    { id: "packs", name: "PACKS", icon: <Package className="w-4 h-4" /> },
    { id: "challenges", name: "CHALLENGES", icon: <Trophy className="w-4 h-4" /> },
    { id: "battlepass", name: "BATTLE PASS", icon: <Trophy className="w-4 h-4" /> },
    { id: "roguelike", name: "ROGUELIKE", icon: <Swords className="w-4 h-4" /> },
    { id: "draft", name: "DRAFT", icon: <Layers className="w-4 h-4" /> },
    { id: "daily", name: "DAILY", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[#60a5fa] text-lg mb-2 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" /> GAME CENTER
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
            TEST ALL VIBEBUFF GAME FEATURES
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <PixelButton
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1"
            >
              {tab.icon}
              <span className="text-[8px]">{tab.name}</span>
            </PixelButton>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <PlayerStats userId={user.id} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <BattleStatsWidget userId={user.id} />
              <AchievementProgressWidget userId={user.id} />
              <CollectionWidget userId={user.id} />
              <NominationWidget userId={user.id} />
            </div>
            <BattleLeaderboard />
          </div>
        )}

        {activeTab === "battle" && (
          <div className="space-y-6">
            <BattleArena userId={user.id} />
            <BattleHistory userId={user.id} />
          </div>
        )}

        {activeTab === "collection" && (
          <CollectionManager userId={user.id} />
        )}

        {activeTab === "achievements" && (
          <AchievementProgress userId={user.id} showAll />
        )}

        {activeTab === "voting" && (
          <div className="space-y-6">
            <ToolNomination userId={user.id} />
            <VotingSection userId={user.id} />
          </div>
        )}

        {activeTab === "decks" && (
          <DeckBuilder userId={user.id} />
        )}

        {activeTab === "packs" && (
          <PackOpening userId={user.id} />
        )}

        {activeTab === "challenges" && (
          <ChallengesBoard userId={user.id} />
        )}

        {activeTab === "battlepass" && (
          <BattlePass userId={user.id} />
        )}

        {activeTab === "roguelike" && (
          <RoguelikeMode userId={user.id} />
        )}

        {activeTab === "draft" && (
          <DraftMode userId={user.id} />
        )}

        {activeTab === "daily" && (
          <DailyRewards userId={user.id} />
        )}
      </main>
    </div>
  );
}
