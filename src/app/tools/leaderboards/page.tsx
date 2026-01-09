"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { ToolsLeaderboard } from "@/components/tools-leaderboard";
import { StacksLeaderboard } from "@/components/stacks-leaderboard";
import {
  PixelCard,
  PixelCardContent,
} from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import {
  Trophy,
  Layers,
  Star,
  Download,
  ThumbsUp,
  Eye,
  ArrowLeft,
  TrendingUp,
  Package,
  Wrench,
} from "lucide-react";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function StatsOverview() {
  const stats = useQuery(api.toolsLeaderboard.getLeaderboardStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    { label: "Total Tools", value: stats.toolsCount, icon: <Package className="w-4 h-4" />, color: "text-blue-400" },
    { label: "Total Stacks", value: stats.stacksCount, icon: <Layers className="w-4 h-4" />, color: "text-purple-400" },
    { label: "GitHub Stars", value: formatNumber(stats.totalStars), icon: <Star className="w-4 h-4" />, color: "text-yellow-400" },
    { label: "Weekly Downloads", value: formatNumber(stats.totalDownloads), icon: <Download className="w-4 h-4" />, color: "text-green-400" },
    { label: "Stack Upvotes", value: formatNumber(stats.totalUpvotes), icon: <ThumbsUp className="w-4 h-4" />, color: "text-emerald-400" },
    { label: "Stack Imports", value: formatNumber(stats.totalImports), icon: <Download className="w-4 h-4" />, color: "text-cyan-400" },
    { label: "Total Views", value: formatNumber(stats.totalViews), icon: <Eye className="w-4 h-4" />, color: "text-pink-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {statItems.map((stat, i) => (
        <PixelCard key={i}>
          <PixelCardContent className="p-4 text-center">
            <div className={`flex items-center justify-center gap-1.5 mb-1 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </PixelCardContent>
        </PixelCard>
      ))}
    </div>
  );
}

function TopToolsByCategory() {
  const topByCategory = useQuery(api.toolsLeaderboard.getTopToolsByCategory, { limit: 3 });

  if (!topByCategory) {
    return (
      <PixelCard>
        <PixelCardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </PixelCardContent>
      </PixelCard>
    );
  }

  const categories = Object.entries(topByCategory);

  if (categories.length === 0) {
    return null;
  }

  return (
    <PixelCard>
      <PixelCardContent className="p-4 sm:p-6">
        <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Tools by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.slice(0, 8).map(([categorySlug, tools]) => (
            <div key={categorySlug} className="bg-secondary/50 rounded-lg p-3 border border-border">
              <h4 className="text-primary font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                {categorySlug.replace("-", " ")}
              </h4>
              <div className="space-y-2">
                {tools.map((tool) => (
                  <Link key={tool._id} href={`/tools/${tool.slug}`}>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary transition-colors cursor-pointer group">
                      <span className="text-xs text-muted-foreground font-mono w-4">#{tool.rank}</span>
                      <div className="w-6 h-6 bg-muted rounded flex items-center justify-center shrink-0">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-4 h-4 object-contain" />
                        ) : (
                          <Package className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate flex-1">
                        {tool.name}
                      </span>
                      {tool.githubStars > 0 && (
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                          <Star className="w-3 h-3" />
                          {formatNumber(tool.githubStars)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

export default function LeaderboardsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6 mb-8">
          <div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary text-sm mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tools
            </Link>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Rankings
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              Leaderboards
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Discover the most popular tools and community-built stacks. Make informed decisions at a glance.
            </p>
          </div>
          <div className="flex gap-2">
            <PixelBadge className="bg-yellow-500/20 text-yellow-400">
              <Star className="w-3 h-3 mr-1" />
              Live Rankings
            </PixelBadge>
          </div>
        </div>

        <div className="space-y-8">
          <StatsOverview />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ToolsLeaderboard limit={15} />
            <StacksLeaderboard limit={15} />
          </div>

          <TopToolsByCategory />
        </div>
      </main>
    </div>
  );
}
