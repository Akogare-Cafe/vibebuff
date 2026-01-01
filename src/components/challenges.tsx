"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Target, 
  Clock, 
  Check, 
  Gift,
  Flame,
  Trophy,
  Swords,
  Eye,
  Layers,
  Users,
  Star,
  Zap
} from "lucide-react";

interface ChallengesProps {
  userId?: string;
  className?: string;
}

const DIFFICULTY_CONFIG = {
  easy: { color: "text-green-400 border-green-400", icon: Star, label: "EASY" },
  medium: { color: "text-yellow-400 border-yellow-400", icon: Zap, label: "MEDIUM" },
  hard: { color: "text-orange-400 border-orange-400", icon: Flame, label: "HARD" },
  legendary: { color: "text-purple-400 border-purple-400", icon: Trophy, label: "LEGENDARY" },
};

const CATEGORY_ICONS = {
  building: Layers,
  exploration: Eye,
  social: Users,
  battle: Swords,
};

export function ChallengesBoard({ userId, className }: ChallengesProps) {
  const challenges = useQuery(
    api.challenges.getActiveChallengesWithProgress,
    { userId }
  );

  if (!challenges) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING BOUNTY BOARD...</div>
      </div>
    );
  }

  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");
  const specialChallenges = challenges.filter((c) => c.type === "special");

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Target className="w-4 h-4" /> BOUNTY BOARD
        </h2>
        <PixelBadge variant="default">
          {challenges.filter((c) => c.isCompleted).length} / {challenges.length} COMPLETE
        </PixelBadge>
      </div>

      {dailyChallenges.length > 0 && (
        <ChallengeSection 
          title="DAILY CHALLENGES" 
          icon={<Clock className="w-4 h-4" />}
          challenges={dailyChallenges} 
          userId={userId}
        />
      )}

      {weeklyChallenges.length > 0 && (
        <ChallengeSection 
          title="WEEKLY CHALLENGES" 
          icon={<Flame className="w-4 h-4" />}
          challenges={weeklyChallenges} 
          userId={userId}
        />
      )}

      {specialChallenges.length > 0 && (
        <ChallengeSection 
          title="SPECIAL EVENTS" 
          icon={<Trophy className="w-4 h-4" />}
          challenges={specialChallenges} 
          userId={userId}
        />
      )}

      {challenges.length === 0 && (
        <PixelCard className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO ACTIVE CHALLENGES</p>
          <p className="text-[#1e3a5f] text-[8px]">Check back soon for new bounties!</p>
        </PixelCard>
      )}
    </div>
  );
}

interface ChallengeSectionProps {
  title: string;
  icon: React.ReactNode;
  challenges: any[];
  userId?: string;
}

function ChallengeSection({ title, icon, challenges, userId }: ChallengeSectionProps) {
  return (
    <div>
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge._id} challenge={challenge} userId={userId} />
        ))}
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: {
    _id: Id<"challenges">;
    title: string;
    description: string;
    type: "daily" | "weekly" | "special";
    category: "building" | "exploration" | "social" | "battle";
    requirement: { type: string; target: number };
    rewards: { xp: number; badge?: string; title?: string };
    difficulty: "easy" | "medium" | "hard" | "legendary";
    progress: number;
    isCompleted: boolean;
    isClaimed: boolean;
    activeUntil: number;
  };
  userId?: string;
}

function ChallengeCard({ challenge, userId }: ChallengeCardProps) {
  const [now, setNow] = useState(() => Date.now());
  const claimReward = useMutation(api.challenges.claimReward);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty];
  const DifficultyIcon = difficultyConfig.icon;
  const CategoryIcon = CATEGORY_ICONS[challenge.category];

  const progressPercent = Math.min(100, (challenge.progress / challenge.requirement.target) * 100);
  const timeLeft = challenge.activeUntil - now;
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  const handleClaim = async () => {
    if (!userId) return;
    await claimReward({ userId, challengeId: challenge._id });
  };

  return (
    <PixelCard 
      className={cn(
        "p-4 relative",
        challenge.isCompleted && !challenge.isClaimed && "border-yellow-400",
        challenge.isClaimed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryIcon className={cn("w-5 h-5", difficultyConfig.color.split(" ")[0])} />
          <div>
            <h4 className="text-[#60a5fa] text-[11px]">{challenge.title}</h4>
            <p className="text-[#3b82f6] text-[8px]">{challenge.description}</p>
          </div>
        </div>
        <PixelBadge variant="outline" className={cn("text-[6px]", difficultyConfig.color)}>
          <DifficultyIcon className="w-2 h-2 mr-1" />
          {difficultyConfig.label}
        </PixelBadge>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[8px] mb-1">
          <span className="text-[#3b82f6]">PROGRESS</span>
          <span className="text-[#60a5fa]">{challenge.progress} / {challenge.requirement.target}</span>
        </div>
        <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              challenge.isCompleted ? "bg-green-400" : "bg-[#3b82f6]"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PixelBadge variant="outline" className="text-[6px]">
            +{challenge.rewards.xp} XP
          </PixelBadge>
          {challenge.rewards.badge && (
            <span className="text-sm">{challenge.rewards.badge}</span>
          )}
        </div>

        {challenge.isClaimed ? (
          <PixelBadge variant="secondary" className="text-[6px]">
            <Check className="w-2 h-2 mr-1" /> CLAIMED
          </PixelBadge>
        ) : challenge.isCompleted ? (
          <PixelButton size="sm" onClick={handleClaim} disabled={!userId}>
            <Gift className="w-3 h-3 mr-1" /> CLAIM
          </PixelButton>
        ) : (
          <div className="flex items-center gap-1 text-[#1e3a5f] text-[8px]">
            <Clock className="w-3 h-3" />
            {hoursLeft}h left
          </div>
        )}
      </div>
    </PixelCard>
  );
}

export function ChallengeWidget({ userId }: { userId?: string }) {
  const challenges = useQuery(
    api.challenges.getActiveChallengesWithProgress,
    { userId }
  );

  if (!challenges || challenges.length === 0) return null;

  const incomplete = challenges.filter((c) => !c.isCompleted);
  const claimable = challenges.filter((c) => c.isCompleted && !c.isClaimed);

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <Target className="w-3 h-3" /> CHALLENGES
        </span>
        {claimable.length > 0 && (
          <PixelBadge variant="default" className="text-[6px] bg-yellow-400 text-black">
            {claimable.length} READY
          </PixelBadge>
        )}
      </div>
      
      <div className="space-y-1">
        {incomplete.slice(0, 3).map((c) => (
          <div key={c._id} className="flex items-center justify-between text-[8px]">
            <span className="text-[#3b82f6] truncate flex-1">{c.title}</span>
            <span className="text-[#60a5fa] ml-2">{c.progress}/{c.requirement.target}</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
