"use client";

import { useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import {
  Trophy,
  Eye,
  MousePointer,
  Heart,
  TrendingUp,
  ArrowLeft,
  Crown,
  Medal,
  Star,
  Flame,
  ChevronRight,
} from "lucide-react";

type SortOption = "trend" | "views" | "clicks" | "favorites";

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#60a5fa] text-sm">LOADING...</div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}

function LeaderboardContent() {
  const [sortBy, setSortBy] = useState<SortOption>("trend");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useQuery(api.categories.list);
  const leaderboard = useQuery(api.popularity.getLeaderboard, {
    sortBy,
    limit: 20,
    categoryId: selectedCategory ? (selectedCategory as any) : undefined,
  });
  const trending = useQuery(api.popularity.getTrendingTools, { limit: 5 });

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "trend", label: "TRENDING", icon: <TrendingUp className="w-3 h-3" /> },
    { value: "views", label: "MOST VIEWED", icon: <Eye className="w-3 h-3" /> },
    { value: "clicks", label: "MOST CLICKED", icon: <MousePointer className="w-3 h-3" /> },
    { value: "favorites", label: "MOST LOVED", icon: <Heart className="w-3 h-3" /> },
  ];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-[#3b82f6] text-sm w-5 text-center">{index + 1}</span>;
    }
  };

  const getRankBorder = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-400 bg-yellow-400/5";
      case 1:
        return "border-gray-300 bg-gray-300/5";
      case 2:
        return "border-amber-600 bg-amber-600/5";
      default:
        return "border-[#1e3a5f]";
    }
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[#60a5fa] text-xl mb-2 flex items-center gap-2 pixel-glow">
            <Trophy className="w-6 h-6" /> TOOL LEADERBOARD
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
            DISCOVER THE MOST POPULAR TOOLS IN THE ARENA
          </p>
        </div>

        {trending && trending.length > 0 && (
          <PixelCard className="mb-8 border-[#f97316]">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2 text-[#f97316]">
                <Flame className="w-4 h-4" /> HOT RIGHT NOW
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="flex flex-wrap gap-2">
                {trending.map((tool: any) => (
                  <Link key={tool._id} href={`/tools/${tool.slug}`}>
                    <PixelBadge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-[#f97316] hover:text-black hover:border-[#f97316] transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {tool.name}
                    </PixelBadge>
                  </Link>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <PixelButton
              key={option.value}
              variant={sortBy === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(option.value)}
            >
              {option.icon}
              <span className="ml-1">{option.label}</span>
            </PixelButton>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <PixelBadge
            variant={!selectedCategory ? "default" : "outline"}
            className="cursor-pointer hover:bg-[#3b82f6] hover:text-black"
            onClick={() => setSelectedCategory(null)}
          >
            ALL CATEGORIES
          </PixelBadge>
          {categories?.map((category) => (
            <PixelBadge
              key={category._id}
              variant={selectedCategory === category._id ? "default" : "outline"}
              className="cursor-pointer hover:bg-[#3b82f6] hover:text-black"
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.name}
            </PixelBadge>
          ))}
        </div>

        <div className="space-y-3">
          {leaderboard?.map((tool: any, index: number) => (
            <Link key={tool._id} href={`/tools/${tool.slug}`}>
              <PixelCard className={`cursor-pointer hover:border-[#60a5fa] transition-colors ${getRankBorder(index)}`}>
                <PixelCardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#60a5fa] text-sm truncate">{tool.name}</h3>
                        {tool.isFeatured && (
                          <Star className="w-3 h-3 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[#3b82f6] text-[8px] truncate">{tool.tagline}</p>
                      {tool.category && (
                        <PixelBadge variant="outline" className="mt-1 text-[6px]">
                          {tool.category.name}
                        </PixelBadge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[8px] text-[#3b82f6] shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-[#60a5fa]">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(tool.popularity?.views || 0)}</span>
                        </div>
                        <p className="text-[6px]">VIEWS</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-[#60a5fa]">
                          <MousePointer className="w-3 h-3" />
                          <span>{formatNumber(tool.popularity?.clicks || 0)}</span>
                        </div>
                        <p className="text-[6px]">CLICKS</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-[#60a5fa]">
                          <Heart className="w-3 h-3" />
                          <span>{formatNumber(tool.popularity?.favorites || 0)}</span>
                        </div>
                        <p className="text-[6px]">FAVS</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1 text-[#f97316]">
                          <TrendingUp className="w-3 h-3" />
                          <span>{formatNumber(tool.popularity?.trendScore || 0)}</span>
                        </div>
                        <p className="text-[6px]">SCORE</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#3b82f6] shrink-0" />
                  </div>
                </PixelCardContent>
              </PixelCard>
            </Link>
          ))}
        </div>

        {leaderboard?.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-[#1e3a5f] mx-auto mb-4" />
            <p className="text-[#60a5fa] text-sm mb-2">NO RANKINGS YET</p>
            <p className="text-[#3b82f6] text-[10px]">
              START EXPLORING TOOLS TO BUILD THE LEADERBOARD
            </p>
            <Link href="/tools" className="inline-block mt-4">
              <PixelButton>
                BROWSE TOOLS
              </PixelButton>
            </Link>
          </div>
        )}

        {!leaderboard && (
          <div className="text-center py-12">
            <p className="text-[#60a5fa] text-sm pixel-loading">LOADING RANKINGS...</p>
          </div>
        )}
      </main>

      <footer className="border-t-4 border-[#1e3a5f] p-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-3 h-3 mr-1" /> BACK TO HOME
            </PixelButton>
          </Link>
        </div>
      </footer>
    </div>
  );
}
