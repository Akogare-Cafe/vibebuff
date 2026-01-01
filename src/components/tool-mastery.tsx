"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Award, 
  Star,
  TrendingUp,
  Eye,
  Layers,
  Swords,
  MessageSquare,
  BarChart3
} from "lucide-react";

interface ToolMasteryProps {
  userId: string;
  className?: string;
}

const MASTERY_LEVELS = {
  novice: { color: "text-gray-400 border-gray-400", label: "NOVICE", minXp: 0 },
  apprentice: { color: "text-green-400 border-green-400", label: "APPRENTICE", minXp: 100 },
  journeyman: { color: "text-blue-400 border-blue-400", label: "JOURNEYMAN", minXp: 500 },
  expert: { color: "text-purple-400 border-purple-400", label: "EXPERT", minXp: 1000 },
  master: { color: "text-orange-400 border-orange-400", label: "MASTER", minXp: 5000 },
  grandmaster: { color: "text-yellow-400 border-yellow-400", label: "GRANDMASTER", minXp: 10000 },
};

export function ToolMasteryDisplay({ userId, className }: ToolMasteryProps) {
  const masteries = useQuery(api.mastery.getUserMasteries, { userId });
  const stats = useQuery(api.mastery.getMasteryStats, { userId });

  if (!masteries) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING MASTERY...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Award className="w-4 h-4" /> TOOL MASTERY
        </h2>
        <PixelBadge variant="default">
          {masteries.length} TOOLS
        </PixelBadge>
      </div>

      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(MASTERY_LEVELS).map(([level, config]) => (
            <PixelCard key={level} className={cn("p-2 text-center", config.color)}>
              <p className="text-lg">{stats.byLevel[level as keyof typeof stats.byLevel]}</p>
              <p className="text-[6px]">{config.label}</p>
            </PixelCard>
          ))}
        </div>
      )}

      {stats && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> INTERACTION STATS
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <StatItem icon={<Eye className="w-4 h-4" />} label="Views" value={stats.totalInteractions.views} />
            <StatItem icon={<Layers className="w-4 h-4" />} label="Deck Adds" value={stats.totalInteractions.deckAdds} />
            <StatItem icon={<Swords className="w-4 h-4" />} label="Battle Wins" value={stats.totalInteractions.battleWins} />
            <StatItem icon={<Swords className="w-4 h-4 opacity-50" />} label="Battle Losses" value={stats.totalInteractions.battleLosses} />
            <StatItem icon={<TrendingUp className="w-4 h-4" />} label="Comparisons" value={stats.totalInteractions.comparisons} />
            <StatItem icon={<MessageSquare className="w-4 h-4" />} label="Reviews" value={stats.totalInteractions.reviews} />
          </div>
        </PixelCard>
      )}

      {masteries.length === 0 ? (
        <PixelCard className="p-8 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO MASTERY YET</p>
          <p className="text-[#1e3a5f] text-[8px]">Start exploring tools to build mastery!</p>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {masteries.map((mastery: any) => (
            <MasteryCard key={mastery._id} mastery={mastery} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[#3b82f6] mb-1">{icon}</div>
      <p className="text-[#60a5fa] text-sm">{value}</p>
      <p className="text-[#3b82f6] text-[6px]">{label}</p>
    </div>
  );
}

interface MasteryCardProps {
  mastery: {
    _id: string;
    toolId: Id<"tools">;
    xp: number;
    level: keyof typeof MASTERY_LEVELS;
    tool: { name: string; slug: string; tagline: string } | null;
    interactions: {
      views: number;
      deckAdds: number;
      battleWins: number;
    };
  };
}

function MasteryCard({ mastery }: MasteryCardProps) {
  const levelConfig = MASTERY_LEVELS[mastery.level];
  const nextLevel = getNextLevel(mastery.level);
  const nextLevelConfig = nextLevel ? MASTERY_LEVELS[nextLevel] : null;
  
  const progressPercent = nextLevelConfig 
    ? ((mastery.xp - levelConfig.minXp) / (nextLevelConfig.minXp - levelConfig.minXp)) * 100
    : 100;

  if (!mastery.tool) return null;

  return (
    <Link href={`/tools/${mastery.tool.slug}`}>
      <PixelCard className={cn("p-3 h-full hover:scale-105 transition-transform", levelConfig.color)}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[#60a5fa] text-[10px]">{mastery.tool.name}</p>
            <p className="text-[#3b82f6] text-[8px] truncate">{mastery.tool.tagline}</p>
          </div>
          <PixelBadge variant="outline" className={cn("text-[6px]", levelConfig.color)}>
            {levelConfig.label}
          </PixelBadge>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-[6px] mb-1">
            <span className="text-[#3b82f6]">{mastery.xp} XP</span>
            {nextLevelConfig && (
              <span className="text-[#1e3a5f]">{nextLevelConfig.minXp} XP</span>
            )}
          </div>
          <div className="h-1 bg-[#0a1628] border border-[#1e3a5f]">
            <div 
              className={cn("h-full", levelConfig.color.includes("yellow") ? "bg-yellow-400" : "bg-[#3b82f6]")}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 text-[6px] text-[#3b82f6]">
          <span className="flex items-center gap-1">
            <Eye className="w-2 h-2" /> {mastery.interactions.views}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-2 h-2" /> {mastery.interactions.deckAdds}
          </span>
          <span className="flex items-center gap-1">
            <Swords className="w-2 h-2" /> {mastery.interactions.battleWins}
          </span>
        </div>
      </PixelCard>
    </Link>
  );
}

function getNextLevel(current: keyof typeof MASTERY_LEVELS): keyof typeof MASTERY_LEVELS | null {
  const levels = Object.keys(MASTERY_LEVELS) as (keyof typeof MASTERY_LEVELS)[];
  const currentIndex = levels.indexOf(current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

export function MasteryBadge({ level }: { level: keyof typeof MASTERY_LEVELS }) {
  const config = MASTERY_LEVELS[level];
  return (
    <PixelBadge variant="outline" className={cn("text-[6px]", config.color)}>
      <Star className="w-2 h-2 mr-1" />
      {config.label}
    </PixelBadge>
  );
}
