"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import {
  Layers,
  ThumbsUp,
  Download,
  Eye,
  Clock,
  Crown,
  Medal,
  Award,
  ChevronDown,
  Users,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "upvotes" | "imports" | "views" | "newest";

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "upvotes", label: "Most Upvoted", icon: <ThumbsUp className="w-4 h-4" /> },
  { value: "imports", label: "Most Imported", icon: <Download className="w-4 h-4" /> },
  { value: "views", label: "Most Viewed", icon: <Eye className="w-4 h-4" /> },
  { value: "newest", label: "Newest", icon: <Clock className="w-4 h-4" /> },
];

const difficultyColors: Record<string, string> = {
  beginner: "text-green-400 bg-green-500/20",
  intermediate: "text-yellow-400 bg-yellow-500/20",
  advanced: "text-red-400 bg-red-500/20",
};

const projectTypeColors: Record<string, string> = {
  "landing-page": "text-blue-400 bg-blue-500/20",
  saas: "text-purple-400 bg-purple-500/20",
  "e-commerce": "text-green-400 bg-green-500/20",
  blog: "text-cyan-400 bg-cyan-500/20",
  dashboard: "text-orange-400 bg-orange-500/20",
  "mobile-app": "text-pink-400 bg-pink-500/20",
  api: "text-indigo-400 bg-indigo-500/20",
  other: "text-gray-400 bg-gray-500/20",
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
}

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50";
  if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-transparent border-amber-600/50";
  return "border-border";
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface StacksLeaderboardProps {
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export function StacksLeaderboard({ limit = 25, showFilters = true, compact = false }: StacksLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortOption>("upvotes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const stacks = useQuery(api.toolsLeaderboard.getStacksLeaderboard, {
    sortBy,
    limit,
  });

  const currentSort = sortOptions.find((o) => o.value === sortBy);

  if (!stacks) {
    return (
      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Stack Builder Leaderboard
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </PixelCardContent>
      </PixelCard>
    );
  }

  if (stacks.length === 0) {
    return (
      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Stack Builder Leaderboard
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No stacks published yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Be the first to publish your stack!</p>
          </div>
        </PixelCardContent>
      </PixelCard>
    );
  }

  return (
    <PixelCard>
      <PixelCardHeader>
        <div className="flex items-center justify-between">
          <PixelCardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Stack Builder Leaderboard
          </PixelCardTitle>
          {showFilters && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {currentSort?.icon}
                <span className="hidden sm:inline">{currentSort?.label}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[160px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg",
                        sortBy === option.value && "text-primary bg-primary/10"
                      )}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PixelCardHeader>
      <PixelCardContent className="p-0">
        <div className="divide-y divide-border">
          {stacks.map((stack, index) => (
            <motion.div
              key={stack._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/stack-builder/marketplace/${stack._id}`}>
                <div
                  className={cn(
                    "flex items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer border-l-2",
                    getRankStyle(stack.rank)
                  )}
                >
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {getRankIcon(stack.rank) || (
                      <span className="text-muted-foreground font-mono text-sm">#{stack.rank}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Layers className="w-5 h-5 text-purple-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground truncate">{stack.title}</span>
                      {stack.isFeatured && (
                        <PixelBadge className="text-[10px] bg-yellow-500/20 text-yellow-400">
                          Featured
                        </PixelBadge>
                      )}
                      {stack.projectType && (
                        <PixelBadge
                          className={cn("text-[10px] hidden sm:inline-flex", projectTypeColors[stack.projectType])}
                        >
                          {stack.projectType.replace("-", " ")}
                        </PixelBadge>
                      )}
                      {stack.difficulty && (
                        <PixelBadge
                          className={cn("text-[10px] hidden md:inline-flex", difficultyColors[stack.difficulty])}
                        >
                          {stack.difficulty}
                        </PixelBadge>
                      )}
                    </div>
                    {!compact && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {stack.toolCount} tools
                        </span>
                        {stack.toolNames.length > 0 && (
                          <>
                            <span className="text-muted-foreground/50">-</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {stack.toolNames.join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
                    <div className="flex items-center gap-1 text-green-400" title="Upvotes">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatNumber(stack.upvotes)}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-blue-400" title="Imports">
                      <Download className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatNumber(stack.importCount)}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-muted-foreground" title="Views">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatNumber(stack.views)}</span>
                    </div>
                    {sortBy === "newest" && (
                      <span className="text-muted-foreground hidden sm:inline">
                        {formatDate(stack.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
