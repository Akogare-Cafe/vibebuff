"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ToolAffinityDisplay } from "@/components/tool-affinity-display";
import { ComboChainsDisplay } from "@/components/combo-chains-display";
import { PrestigePanel } from "@/components/prestige-panel";
import { PixelCard } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Heart,
  Crown,
  Star,
  Zap,
  Target,
  TrendingUp,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";

export default function StatsPage() {
  const { user, isLoaded } = useUser();
  const profile = useQuery(
    api.users.getProfile,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const userStats = useQuery(
    api.rateLimit.getUserStats,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#60a5fa] text-sm">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000]">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <PixelCard className="text-center p-8">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-[#3b82f6]" />
            <h1 className="text-[#60a5fa] text-lg mb-4">SIGN IN REQUIRED</h1>
            <p className="text-[#3b82f6] text-[10px] mb-6">
              YOU NEED TO BE SIGNED IN TO VIEW YOUR STATS.
            </p>
            <Link href="/sign-in">
              <PixelButton>SIGN IN</PixelButton>
            </Link>
          </PixelCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/profile"
            className="text-[#3b82f6] text-[10px] hover:text-[#60a5fa] flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> BACK TO PROFILE
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[#60a5fa] text-lg flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> PLAYER STATS
          </h1>
          {profile && (
            <div className="flex items-center gap-4">
              <PixelBadge variant="outline" className="text-[8px]">
                LEVEL {profile.level}
              </PixelBadge>
              <PixelBadge variant="default" className="text-[8px]">
                {profile.xp.toLocaleString()} XP
              </PixelBadge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6 text-blue-400" />}
            label="TOTAL ACTIONS"
            value={userStats?.totalActions ?? 0}
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            label="TODAY"
            value={userStats?.todayActions ?? 0}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            label="THIS WEEK"
            value={userStats?.weekActions ?? 0}
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-purple-400" />}
            label="DECKS CREATED"
            value={profile?.decksCreated ?? 0}
          />
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> PRESTIGE
            </h2>
            <PrestigePanel userId={user.id} />
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> COMBO CHAINS
            </h2>
            <ComboChainsDisplay userId={user.id} />
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" /> TOOL AFFINITIES
            </h2>
            <ToolAffinityDisplay userId={user.id} />
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <PixelCard className="p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-[#60a5fa] text-lg mb-1">{value.toLocaleString()}</p>
      <p className="text-[#3b82f6] text-[8px]">{label}</p>
    </PixelCard>
  );
}
