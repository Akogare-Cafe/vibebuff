"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ToolIcon } from "./dynamic-icon";
import { Crown, Sparkles, TrendingUp } from "lucide-react";

interface MasteryItem {
  _id: string;
  level: string;
  xp: number;
  tool?: {
    name: string;
    slug: string;
    logoUrl?: string;
  } | null;
}

interface ToolMasteryHeroProps {
  masteries: MasteryItem[];
  totalTools?: number;
  className?: string;
}

const MASTERY_RING_COLORS: Record<string, { ring: string; bg: string; glow: string }> = {
  novice: { 
    ring: "stroke-gray-500", 
    bg: "bg-gray-500/10 border-gray-500/30",
    glow: ""
  },
  apprentice: { 
    ring: "stroke-green-500", 
    bg: "bg-green-500/10 border-green-500/30",
    glow: "shadow-[0_0_12px_rgba(34,197,94,0.3)]"
  },
  journeyman: { 
    ring: "stroke-blue-500", 
    bg: "bg-blue-500/10 border-blue-500/30",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.3)]"
  },
  expert: { 
    ring: "stroke-purple-500", 
    bg: "bg-purple-500/10 border-purple-500/30",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.3)]"
  },
  master: { 
    ring: "stroke-orange-500", 
    bg: "bg-orange-500/10 border-orange-500/30",
    glow: "shadow-[0_0_12px_rgba(249,115,22,0.4)]"
  },
  grandmaster: { 
    ring: "stroke-yellow-400", 
    bg: "bg-yellow-400/10 border-yellow-400/40",
    glow: "shadow-[0_0_16px_rgba(250,204,21,0.5)]"
  },
};

const MASTERY_XP_THRESHOLDS: Record<string, number> = {
  novice: 0,
  apprentice: 100,
  journeyman: 500,
  expert: 1000,
  master: 5000,
  grandmaster: 10000,
};

function getProgressPercent(level: string, xp: number): number {
  const levels = Object.keys(MASTERY_XP_THRESHOLDS);
  const currentIndex = levels.indexOf(level);
  const currentThreshold = MASTERY_XP_THRESHOLDS[level] || 0;
  
  if (currentIndex >= levels.length - 1) return 100;
  
  const nextLevel = levels[currentIndex + 1];
  const nextThreshold = MASTERY_XP_THRESHOLDS[nextLevel];
  
  return Math.min(100, ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}

function CircularProgress({ percent, colorClass, size = 72 }: { percent: number; colorClass: string; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn("transition-all duration-700", colorClass)}
      />
    </svg>
  );
}

function MasteryNode({ mastery, index, total }: { mastery: MasteryItem; index: number; total: number }) {
  const colors = MASTERY_RING_COLORS[mastery.level] || MASTERY_RING_COLORS.novice;
  const progress = getProgressPercent(mastery.level, mastery.xp);
  const isMaxed = mastery.level === "grandmaster";
  const isLast = index === total - 1;

  return (
    <div className="flex items-center">
      <Link href={`/tools/${mastery.tool?.slug || ''}`} className="group">
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "relative size-[72px] rounded-full flex items-center justify-center transition-transform group-hover:scale-105",
            colors.glow
          )}>
            <CircularProgress percent={progress} colorClass={colors.ring} size={72} />
            
            <div className={cn(
              "absolute inset-[6px] rounded-full border-2 flex items-center justify-center overflow-hidden transition-all",
              colors.bg,
              "group-hover:border-primary/50"
            )}>
              {mastery.tool?.logoUrl ? (
                <img 
                  src={mastery.tool.logoUrl} 
                  alt={mastery.tool.name} 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <ToolIcon 
                  toolSlug={mastery.tool?.slug || ''} 
                  className={cn(
                    "w-7 h-7 transition-colors",
                    mastery.level === "grandmaster" ? "text-yellow-400" :
                    mastery.level === "master" ? "text-orange-400" :
                    mastery.level === "expert" ? "text-purple-400" :
                    mastery.level === "journeyman" ? "text-blue-400" :
                    mastery.level === "apprentice" ? "text-green-400" :
                    "text-gray-400"
                  )}
                />
              )}
            </div>

            {isMaxed && (
              <div className="absolute -top-1 -right-1 z-10">
                <div className="relative">
                  <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
                  <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            )}

            <div className={cn(
              "absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
              "bg-card border shadow-sm",
              mastery.level === "grandmaster" ? "border-yellow-400/50 text-yellow-400" :
              mastery.level === "master" ? "border-orange-400/50 text-orange-400" :
              mastery.level === "expert" ? "border-purple-400/50 text-purple-400" :
              mastery.level === "journeyman" ? "border-blue-400/50 text-blue-400" :
              mastery.level === "apprentice" ? "border-green-400/50 text-green-400" :
              "border-gray-400/50 text-gray-400"
            )}>
              {mastery.level.slice(0, 3).toUpperCase()}
            </div>
          </div>

          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors max-w-[80px] truncate text-center">
            {mastery.tool?.name || "Unknown"}
          </span>
        </div>
      </Link>

      {!isLast && (
        <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-primary/60 to-primary/20 mx-1 md:mx-2 rounded-full" />
      )}
    </div>
  );
}

export function ToolMasteryHero({ masteries, totalTools, className }: ToolMasteryHeroProps) {
  if (!masteries || masteries.length === 0) {
    return null;
  }

  const displayMasteries = masteries.slice(0, 4);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-center gap-1 md:gap-2 py-4 overflow-x-auto">
        {displayMasteries.map((mastery, index) => (
          <MasteryNode 
            key={mastery._id} 
            mastery={mastery} 
            index={index}
            total={displayMasteries.length}
          />
        ))}
      </div>

      {totalTools && totalTools > 4 && (
        <div className="flex justify-center mt-2">
          <Link href="/profile/mastery">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
              +{totalTools - 4} more tools
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
