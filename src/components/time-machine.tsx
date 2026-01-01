"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Clock, 
  Rewind,
  FastForward,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Trophy,
  ThumbsUp
} from "lucide-react";

interface TimeMachineProps {
  className?: string;
}

const YEARS = [2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];

export function TimeMachine({ className }: TimeMachineProps) {
  const [selectedYear, setSelectedYear] = useState(2020);
  
  const yearSnapshot = useQuery(api.timeMachine.getYearSnapshot, { year: selectedYear, limit: 20 });
  const challenges = useQuery(api.timeMachine.getTimeMachineChallenges, {});

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" /> TIME MACHINE
        </h2>
      </div>

      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <PixelButton size="sm" onClick={() => setSelectedYear(Math.max(2010, selectedYear - 2))}>
            <Rewind className="w-4 h-4" />
          </PixelButton>
          <div className="text-center">
            <p className="text-[#60a5fa] text-2xl">{selectedYear}</p>
            <p className="text-[#3b82f6] text-[8px]">TECH LANDSCAPE</p>
          </div>
          <PixelButton size="sm" onClick={() => setSelectedYear(Math.min(2024, selectedYear + 2))}>
            <FastForward className="w-4 h-4" />
          </PixelButton>
        </div>

        <div className="flex justify-center gap-1 mb-4">
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "px-2 py-1 text-[8px] border",
                selectedYear === year
                  ? "border-[#3b82f6] bg-[#3b82f6]/20 text-[#60a5fa]"
                  : "border-[#1e3a5f] text-[#3b82f6] hover:border-[#3b82f6]"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </PixelCard>

      <div>
        <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> TOP TOOLS IN {selectedYear}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {yearSnapshot?.map((snapshot: any, index: number) => (
            <ToolSnapshotCard key={snapshot._id} snapshot={snapshot} rank={index + 1} />
          ))}
          {(!yearSnapshot || yearSnapshot.length === 0) && (
            <PixelCard className="col-span-full p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
              <p className="text-[#3b82f6] text-[10px]">NO DATA FOR {selectedYear}</p>
            </PixelCard>
          )}
        </div>
      </div>

      {challenges && challenges.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> NOSTALGIA CHALLENGES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge: any) => (
              <ChallengeCard key={challenge._id} challenge={challenge} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolSnapshotCard({ snapshot, rank }: { snapshot: any; rank: number }) {
  return (
    <PixelCard className={cn(
      "p-3",
      rank === 1 && "border-yellow-400",
      rank === 2 && "border-gray-400",
      rank === 3 && "border-orange-400"
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className={cn(
          "text-lg",
          rank === 1 && "text-yellow-400",
          rank === 2 && "text-gray-400",
          rank === 3 && "text-orange-400",
          rank > 3 && "text-[#3b82f6]"
        )}>
          #{rank}
        </span>
        <PixelBadge variant="outline" className="text-[6px]">
          v{snapshot.majorVersion || "?"}
        </PixelBadge>
      </div>
      <p className="text-[#60a5fa] text-[10px] mb-1">{snapshot.tool?.name}</p>
      <div className="flex items-center gap-2 text-[8px] text-[#3b82f6]">
        <Star className="w-3 h-3" />
        {snapshot.githubStars?.toLocaleString() || "N/A"}
      </div>
      <div className="mt-2 h-2 bg-[#0a1628] border border-[#1e3a5f]">
        <div 
          className="h-full bg-[#3b82f6]"
          style={{ width: `${snapshot.popularity}%` }}
        />
      </div>
    </PixelCard>
  );
}

function ChallengeCard({ challenge }: { challenge: any }) {
  return (
    <PixelCard className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-[#3b82f6]" />
        <PixelBadge variant="outline" className="text-[6px]">
          {challenge.targetYear}
        </PixelBadge>
      </div>
      <h4 className="text-[#60a5fa] text-[12px] mb-2">{challenge.title}</h4>
      <p className="text-[#3b82f6] text-[10px] mb-3">{challenge.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {challenge.requirements.slice(0, 3).map((req: string, i: number) => (
          <PixelBadge key={i} variant="outline" className="text-[6px]">
            {req}
          </PixelBadge>
        ))}
      </div>
      <Link href={`/time-machine/${challenge.slug}`}>
        <PixelButton size="sm" className="w-full">
          <Clock className="w-3 h-3 mr-1" /> TRAVEL BACK
        </PixelButton>
      </Link>
    </PixelCard>
  );
}

interface ToolTimelineProps {
  toolId: Id<"tools">;
}

export function ToolTimeline({ toolId }: ToolTimelineProps) {
  const timeline = useQuery(api.timeMachine.getToolTimeline, { toolId });

  if (!timeline || !timeline.snapshots.length) {
    return (
      <PixelCard className="p-4 text-center">
        <Clock className="w-8 h-8 mx-auto mb-2 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">NO HISTORICAL DATA</p>
      </PixelCard>
    );
  }

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" /> {timeline.tool?.name} THROUGH TIME
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[#1e3a5f]" />
        <div className="space-y-4">
          {timeline.snapshots.map((snapshot: any, index: number) => {
            const prevSnapshot = timeline.snapshots[index - 1];
            const starsChange = prevSnapshot 
              ? (snapshot.githubStars || 0) - (prevSnapshot.githubStars || 0)
              : 0;

            return (
              <div key={snapshot._id} className="flex items-start gap-4 pl-8 relative">
                <div className="absolute left-2 w-4 h-4 rounded-full bg-[#3b82f6] border-2 border-[#0a1628]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#60a5fa] text-[12px]">{snapshot.year}</span>
                    {snapshot.majorVersion && (
                      <PixelBadge variant="outline" className="text-[6px]">
                        v{snapshot.majorVersion}
                      </PixelBadge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[8px]">
                    <span className="text-[#3b82f6] flex items-center gap-1">
                      <Star className="w-3 h-3" /> {snapshot.githubStars?.toLocaleString() || "N/A"}
                    </span>
                    {starsChange !== 0 && (
                      <span className={cn(
                        "flex items-center gap-1",
                        starsChange > 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {starsChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {starsChange > 0 ? "+" : ""}{starsChange.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {snapshot.notableEvents && snapshot.notableEvents.length > 0 && (
                    <div className="mt-2">
                      {snapshot.notableEvents.map((event: string, i: number) => (
                        <p key={i} className="text-[#1e3a5f] text-[8px]">{event}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PixelCard>
  );
}
