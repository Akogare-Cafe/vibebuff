"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Calendar, 
  Star,
  ChevronRight,
  Sparkles,
  ArrowUp
} from "lucide-react";

interface EvolutionTrackerProps {
  toolId: Id<"tools">;
  className?: string;
}

export function EvolutionTracker({ toolId, className }: EvolutionTrackerProps) {
  const tool = useQuery(api.tools.getBySlug, { slug: "" }); // We need to get by ID
  
  // For now, we'll use mock data since we need the tool details
  // In production, you'd fetch the tool by ID
  
  return (
    <PixelCard className={cn("p-4", className)}>
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> EVOLUTION HISTORY
      </h3>
      
      <div className="text-center py-4">
        <p className="text-[#3b82f6] text-[10px]">VERSION HISTORY COMING SOON</p>
        <p className="text-[#1e3a5f] text-[8px]">Track major updates and changes</p>
      </div>
    </PixelCard>
  );
}

// Evolution timeline component
interface EvolutionTimelineProps {
  versions: Array<{
    version: string;
    releasedAt: number;
    highlights: string[];
  }>;
  className?: string;
}

export function EvolutionTimeline({ versions, className }: EvolutionTimelineProps) {
  if (!versions || versions.length === 0) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-[#3b82f6] text-[10px]">NO VERSION HISTORY</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#1e3a5f]" />

      <div className="space-y-6">
        {versions.map((version, index) => (
          <div key={version.version} className="relative pl-10">
            {/* Timeline dot */}
            <div className={cn(
              "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
              index === 0 
                ? "border-yellow-400 bg-yellow-400/20" 
                : "border-[#3b82f6] bg-[#0a1628]"
            )}>
              {index === 0 ? (
                <Star className="w-3 h-3 text-yellow-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              )}
            </div>

            {/* Version card */}
            <PixelCard className={cn(
              "p-3",
              index === 0 && "border-yellow-400"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PixelBadge 
                    variant={index === 0 ? "default" : "outline"}
                    className="text-[8px]"
                  >
                    v{version.version}
                  </PixelBadge>
                  {index === 0 && (
                    <PixelBadge variant="secondary" className="text-[6px] bg-yellow-400 text-black">
                      LATEST
                    </PixelBadge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[#1e3a5f] text-[8px]">
                  <Calendar className="w-3 h-3" />
                  {new Date(version.releasedAt).toLocaleDateString()}
                </div>
              </div>

              {version.highlights.length > 0 && (
                <ul className="space-y-1">
                  {version.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-1 text-[8px]">
                      <Sparkles className="w-3 h-3 text-[#3b82f6] shrink-0 mt-0.5" />
                      <span className="text-[#60a5fa]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PixelCard>
          </div>
        ))}
      </div>
    </div>
  );
}

// Power level trajectory chart
interface PowerTrajectoryProps {
  toolName: string;
  data: Array<{
    date: string;
    stars: number;
    downloads?: number;
  }>;
  className?: string;
}

export function PowerTrajectory({ toolName, data, className }: PowerTrajectoryProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const maxStars = Math.max(...data.map(d => d.stars));
  const minStars = Math.min(...data.map(d => d.stars));
  const range = maxStars - minStars || 1;

  return (
    <PixelCard className={cn("p-4", className)}>
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> POWER TRAJECTORY
      </h3>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[#3b82f6] text-[8px]">{toolName}</span>
        <div className="flex items-center gap-1 text-green-400 text-[10px]">
          <ArrowUp className="w-3 h-3" />
          {((data[data.length - 1].stars - data[0].stars) / data[0].stars * 100).toFixed(1)}%
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end gap-1 h-20">
        {data.map((point, index) => {
          const height = ((point.stars - minStars) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-[#3b82f6] transition-all hover:bg-[#60a5fa]"
              style={{ height: `${Math.max(10, height)}%` }}
              title={`${point.date}: ${point.stars.toLocaleString()} stars`}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[#1e3a5f] text-[6px]">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[#3b82f6] text-[8px]">
          {data[0]?.stars.toLocaleString()} ⭐
        </span>
        <span className="text-[#60a5fa] text-[8px]">
          {data[data.length - 1]?.stars.toLocaleString()} ⭐
        </span>
      </div>
    </PixelCard>
  );
}

// Compact evolution badge for tool cards
export function EvolutionBadge({ 
  currentVersion, 
  previousVersion 
}: { 
  currentVersion: string; 
  previousVersion?: string;
}) {
  const isNewMajor = previousVersion && 
    parseInt(currentVersion.split('.')[0]) > parseInt(previousVersion.split('.')[0]);

  return (
    <div className="flex items-center gap-1">
      <PixelBadge variant="outline" className="text-[6px]">
        v{currentVersion}
      </PixelBadge>
      {isNewMajor && (
        <PixelBadge variant="secondary" className="text-[6px] bg-green-400 text-black">
          NEW MAJOR
        </PixelBadge>
      )}
    </div>
  );
}
