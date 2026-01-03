"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Timer, 
  Trophy,
  Play,
  Pause,
  Flag,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  Medal
} from "lucide-react";

interface SpeedrunModeProps {
  userId?: string;
  className?: string;
}

const CATEGORY_TYPE_CONFIG = {
  any_percent: { color: "text-green-400 border-green-400", label: "ANY%" },
  full_stack: { color: "text-blue-400 border-blue-400", label: "FULL STACK" },
  category_specific: { color: "text-purple-400 border-purple-400", label: "CATEGORY" },
  glitchless: { color: "text-yellow-400 border-yellow-400", label: "GLITCHLESS" },
};

export function SpeedrunMode({ userId, className }: SpeedrunModeProps) {
  const categories = useQuery(api.speedruns.getCategories, {});
  const worldRecords = useQuery(api.speedruns.getWorldRecords);
  const activeRaces = useQuery(api.speedruns.getActiveRaces);
  const upcomingRaces = useQuery(api.speedruns.getUpcomingRaces);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Timer className="w-4 h-4" /> SPEEDRUN MODE
        </h2>
      </div>

      {activeRaces && activeRaces.length > 0 && (
        <div>
          <h3 className="text-red-400 text-[10px] uppercase mb-3 flex items-center gap-2 animate-pulse">
            <Zap className="w-4 h-4" /> LIVE RACES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRaces.map((race: any) => (
              <RaceCard key={race._id} race={race} userId={userId} isLive />
            ))}
          </div>
        </div>
      )}

      {upcomingRaces && upcomingRaces.length > 0 && (
        <div>
          <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> UPCOMING RACES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingRaces.map((race: any) => (
              <RaceCard key={race._id} race={race} userId={userId} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
          <Flag className="w-4 h-4" /> CATEGORIES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category: any) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </div>

      {worldRecords && worldRecords.length > 0 && (
        <div>
          <h3 className="text-yellow-400 text-[10px] uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> WORLD RECORDS
          </h3>
          <div className="space-y-2">
            {worldRecords.map((record: any) => (
              <WorldRecordCard key={record._id} record={record} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category }: { category: any }) {
  const config = CATEGORY_TYPE_CONFIG[category.categoryType as keyof typeof CATEGORY_TYPE_CONFIG];

  return (
    <PixelCard className={cn("p-4", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-primary text-[12px]">{category.name}</h3>
          <PixelBadge variant="outline" className={cn("text-[6px] mt-1", config?.color)}>
            {config?.label}
          </PixelBadge>
        </div>
        <Timer className="w-5 h-5 text-muted-foreground" />
      </div>

      <p className="text-muted-foreground text-[10px] mb-3">{category.description}</p>

      <div className="space-y-1 mb-3">
        <p className="text-primary text-[8px]">REQUIREMENTS:</p>
        {category.requirements.map((req: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[8px] text-muted-foreground">
            <CheckCircle className="w-3 h-3" /> {req.count}x {req.category}
          </div>
        ))}
      </div>

      {category.worldRecord && (
        <div className="p-2 border border-yellow-400 bg-yellow-400/10 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-yellow-400 text-[8px]">WORLD RECORD</span>
            <span className="text-yellow-400 text-[12px]">{formatTime(category.worldRecord)}</span>
          </div>
          {category.worldRecordHolder && (
            <p className="text-muted-foreground text-[8px]">by {category.worldRecordHolder.slice(-6)}</p>
          )}
        </div>
      )}

      <Link href={`/speedrun/${category.slug}`}>
        <PixelButton size="sm" className="w-full">
          <Play className="w-3 h-3 mr-1" /> START RUN
        </PixelButton>
      </Link>
    </PixelCard>
  );
}

function RaceCard({ race, userId, isLive }: { race: any; userId?: string; isLive?: boolean }) {
  const joinRace = useMutation(api.speedruns.joinRace);
  const isRegistered = race.participants.includes(userId);

  const handleJoin = async () => {
    if (!userId) return;
    await joinRace({ raceId: race._id, userId });
  };

  const startsIn = Math.max(0, Math.ceil((race.startTime - Date.now()) / (1000 * 60)));

  return (
    <PixelCard className={cn("p-4", isLive && "border-red-400")}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-primary text-[12px]">{race.category?.name}</h3>
        {isLive ? (
          <PixelBadge variant="outline" className="text-[6px] text-red-400 border-red-400 animate-pulse">
            LIVE
          </PixelBadge>
        ) : (
          <span className="text-muted-foreground text-[8px]">Starts in {startsIn}min</span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 text-[8px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {race.participants.length} runners
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {race.category?.categoryType}
        </span>
      </div>

      {isLive && race.results.length > 0 && (
        <div className="space-y-1 mb-3">
          {race.results.slice(0, 3).map((result: any) => (
            <div key={result.oderId} className="flex items-center justify-between text-[8px]">
              <span className={cn(
                result.rank === 1 && "text-yellow-400",
                result.rank === 2 && "text-gray-400",
                result.rank === 3 && "text-orange-400",
                result.rank > 3 && "text-muted-foreground"
              )}>
                #{result.rank} {result.oderId.slice(-6)}
              </span>
              <span className="text-primary">{formatTime(result.timeMs)}</span>
            </div>
          ))}
        </div>
      )}

      {!isLive && userId && (
        <PixelButton 
          size="sm" 
          onClick={handleJoin} 
          disabled={isRegistered}
          className="w-full"
        >
          {isRegistered ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> REGISTERED</>
          ) : (
            <><Users className="w-3 h-3 mr-1" /> JOIN RACE</>
          )}
        </PixelButton>
      )}
    </PixelCard>
  );
}

function WorldRecordCard({ record }: { record: any }) {
  return (
    <div className="flex items-center justify-between p-3 border border-yellow-400 bg-yellow-400/10">
      <div className="flex items-center gap-3">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <div>
          <p className="text-primary text-[10px]">{record.category?.name}</p>
          <p className="text-muted-foreground text-[8px]">by {record.userId.slice(-6)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-yellow-400 text-lg">{formatTime(record.timeMs)}</p>
        {record.isVerified && (
          <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400">
            <CheckCircle className="w-2 h-2 mr-1" /> VERIFIED
          </PixelBadge>
        )}
      </div>
    </div>
  );
}

interface SpeedrunTimerProps {
  categorySlug: string;
  userId: string;
}

export function SpeedrunTimer({ categorySlug, userId }: SpeedrunTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [splits, setSplits] = useState<{ name: string; timeMs: number; toolId?: Id<"tools"> }[]>([]);
  const [selectedTools, setSelectedTools] = useState<Id<"tools">[]>([]);

  const category = useQuery(api.speedruns.getCategory, { slug: categorySlug });
  const submitSpeedrun = useMutation(api.speedruns.submitSpeedrun);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setElapsed(0);
    setSplits([]);
  };

  const handleSplit = (name: string, toolId?: Id<"tools">) => {
    if (!startTime) return;
    setSplits([...splits, { name, timeMs: Date.now() - startTime, toolId }]);
  };

  const handleFinish = async () => {
    if (!category || !startTime) return;
    setIsRunning(false);
    
    const finalTime = Date.now() - startTime;
    
    await submitSpeedrun({
      categoryId: category._id,
      userId,
      toolIds: selectedTools,
      timeMs: finalTime,
      splits,
    });
  };

  if (!category) {
    return (
      <PixelCard className="p-8 text-center">
        <Timer className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-[10px]">LOADING CATEGORY...</p>
      </PixelCard>
    );
  }

  const config = CATEGORY_TYPE_CONFIG[category.categoryType as keyof typeof CATEGORY_TYPE_CONFIG];

  return (
    <div className="space-y-6">
      <PixelCard className={cn("p-6 text-center", config?.color)}>
        <h2 className="text-primary text-lg mb-2">{category.name}</h2>
        <PixelBadge variant="outline" className={cn("text-[8px]", config?.color)}>
          {config?.label}
        </PixelBadge>

        <div className="my-8">
          <p className={cn(
            "text-5xl font-mono",
            isRunning ? "text-green-400" : "text-primary"
          )}>
            {formatTime(elapsed)}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {!isRunning && elapsed === 0 && (
            <PixelButton onClick={handleStart}>
              <Play className="w-4 h-4 mr-2" /> START
            </PixelButton>
          )}
          {isRunning && (
            <>
              <PixelButton onClick={() => handleSplit("Split " + (splits.length + 1))}>
                <Flag className="w-4 h-4 mr-2" /> SPLIT
              </PixelButton>
              <PixelButton onClick={handleFinish}>
                <CheckCircle className="w-4 h-4 mr-2" /> FINISH
              </PixelButton>
            </>
          )}
          {!isRunning && elapsed > 0 && (
            <PixelButton onClick={handleStart}>
              <Play className="w-4 h-4 mr-2" /> RESTART
            </PixelButton>
          )}
        </div>
      </PixelCard>

      {splits.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-[10px] uppercase mb-3">SPLITS</h3>
          <div className="space-y-2">
            {splits.map((split, i) => (
              <div key={i} className="flex items-center justify-between p-2 border border-border">
                <span className="text-muted-foreground text-[10px]">{split.name}</span>
                <span className="text-primary text-[10px]">{formatTime(split.timeMs)}</span>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      <PixelCard className="p-4">
        <h3 className="text-primary text-[10px] uppercase mb-3">REQUIREMENTS</h3>
        <div className="space-y-2">
          {category.requirements.map((req: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <CheckCircle className="w-4 h-4" /> {req.count}x {req.category}
            </div>
          ))}
        </div>
      </PixelCard>
    </div>
  );
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

export function CategoryLeaderboard({ categoryId }: { categoryId: Id<"speedrunCategories"> }) {
  const leaderboard = useQuery(api.speedruns.getCategoryLeaderboard, { categoryId, limit: 20 });

  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <Medal className="w-4 h-4" /> LEADERBOARD
      </h3>
      <div className="space-y-2">
        {leaderboard.map((entry: any) => (
          <div 
            key={entry._id}
            className={cn(
              "flex items-center justify-between p-2 border",
              entry.rank === 1 && "border-yellow-400 bg-yellow-400/10",
              entry.rank === 2 && "border-gray-400 bg-gray-400/10",
              entry.rank === 3 && "border-orange-400 bg-orange-400/10",
              entry.rank > 3 && "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-6 text-center text-[10px]",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-gray-400",
                entry.rank === 3 && "text-orange-400",
                entry.rank > 3 && "text-muted-foreground"
              )}>
                #{entry.rank}
              </span>
              <span className="text-primary text-[10px]">{entry.userId.slice(-6)}</span>
              {entry.isVerified && <CheckCircle className="w-3 h-3 text-green-400" />}
            </div>
            <span className="text-primary text-[12px]">{formatTime(entry.timeMs)}</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
