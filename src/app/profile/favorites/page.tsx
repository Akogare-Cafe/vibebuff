"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Heart,
  HeartOff,
  Search,
  Star,
  ArrowLeft,
  Home,
  Backpack,
  Play,
  MessageSquare,
  User,
  Wrench,
  ExternalLink,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Clock,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import { ToolIcon } from "@/components/dynamic-icon";

type SortOption = "name" | "recent" | "usage";
type ViewMode = "grid" | "list";

type PricingModel = "free" | "freemium" | "paid" | "open_source" | "enterprise";

const pricingStyles: Record<PricingModel, { border: string; label: string; labelColor: string }> = {
  free: { border: "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]", label: "Free", labelColor: "text-green-500" },
  freemium: { border: "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]", label: "Freemium", labelColor: "text-blue-500" },
  paid: { border: "border-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]", label: "Paid", labelColor: "text-yellow-500" },
  open_source: { border: "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]", label: "Open Source", labelColor: "text-purple-500" },
  enterprise: { border: "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]", label: "Enterprise", labelColor: "text-orange-500" },
};

export default function FavoritesPage() {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);

  const favoriteTools = useQuery(
    api.toolUsage.getFavorites,
    user?.id ? { userId: user.id } : "skip"
  );

  const frequentlyUsed = useQuery(
    api.toolUsage.getFrequentlyUsed,
    user?.id ? { userId: user.id, limit: 20 } : "skip"
  );

  const toggleFavorite = useMutation(api.toolUsage.toggleFavorite);

  const handleRemoveFavorite = async (toolId: Id<"tools">) => {
    if (!user?.id) return;
    await toggleFavorite({ userId: user.id, toolId });
  };

  const togglePricingFilter = (pricing: string) => {
    setSelectedPricing((prev) =>
      prev.includes(pricing)
        ? prev.filter((p) => p !== pricing)
        : [...prev, pricing]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPricing([]);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-card border border-border rounded-xl p-8 text-center max-w-md mx-auto">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In to Save Favorites</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an account to save your favorite tools and access them anywhere.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-in">
                <button className="quest-btn px-6 py-2 font-bold">
                  Connect
                </button>
              </Link>
              <Link href="/tools">
                <button className="quest-btn-outline px-6 py-2 font-bold">
                  Browse Tools
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const filteredTools = favoriteTools?.filter((tool) => {
    if (!tool) return false;
    const matchesSearch = searchQuery === "" || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPricing = selectedPricing.length === 0 || 
      selectedPricing.includes(tool.pricingModel);
    return matchesSearch && matchesPricing;
  }) ?? [];

  const sortedTools = [...filteredTools].sort((a, b) => {
    if (!a || !b) return 0;
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "recent":
        comparison = 0;
        break;
      case "usage":
        comparison = (b.usageCount ?? 0) - (a.usageCount ?? 0);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const hasActiveFilters = searchQuery !== "" || selectedPricing.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <button className="p-2 bg-card border border-border rounded-lg hover:bg-secondary hover:border-primary/30 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              Favorite Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              Your curated collection of {favoriteTools?.length ?? 0} tools
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="flex w-full items-stretch rounded-lg h-10 group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="text-muted-foreground flex border-none bg-background items-center justify-center pl-4 rounded-l-lg">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none text-foreground focus:outline-0 bg-background border-none h-full placeholder:text-muted-foreground/50 px-4 pl-2 text-sm font-normal"
                  placeholder="Search your favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="px-3 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid" 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list" 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-background border border-border hover:border-primary text-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                <option value="recent">Sort: Recent</option>
                <option value="name">Sort: Name</option>
                <option value="usage">Sort: Most Used</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 bg-background border border-border rounded-lg hover:border-primary transition-colors"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <SortDesc className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Pricing:</span>
            {Object.entries(pricingStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => togglePricingFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedPricing.includes(key)
                    ? `${style.border} ${style.labelColor} bg-card`
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {style.label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {sortedTools.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Showing {sortedTools.length} of {favoriteTools?.length ?? 0} favorites
              </span>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTools.map((tool) => {
                  if (!tool) return null;
                  const style = pricingStyles[tool.pricingModel as PricingModel] || pricingStyles.free;
                  return (
                    <div
                      key={tool._id}
                      className={`bg-card rounded-xl p-4 border ${style.border} hover:bg-secondary transition-all group relative`}
                    >
                      <button
                        onClick={() => handleRemoveFavorite(tool._id)}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                        title="Remove from favorites"
                      >
                        <HeartOff className="w-4 h-4" />
                      </button>

                      <Link href={`/tools/${tool.slug}`}>
                        <div className="flex items-start gap-4">
                          <div className="size-16 bg-background rounded-lg border border-white/10 flex items-center justify-center shrink-0">
                            {tool.logoUrl ? (
                              <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 object-contain" />
                            ) : (
                              <ToolIcon toolSlug={tool.slug} className="w-10 h-10 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <h3 className="text-foreground font-bold text-lg truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            <p className={`text-xs ${style.labelColor} font-bold uppercase tracking-wider`}>
                              {style.label}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {tool.tagline}
                        </p>

                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                          {tool.githubStars && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-bold">
                                {(tool.githubStars / 1000).toFixed(1)}K
                              </span>
                            </div>
                          )}
                          {tool.usageCount !== undefined && tool.usageCount > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm">
                                {tool.usageCount} views
                              </span>
                            </div>
                          )}
                          <div className="ml-auto">
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedTools.map((tool) => {
                  if (!tool) return null;
                  const style = pricingStyles[tool.pricingModel as PricingModel] || pricingStyles.free;
                  return (
                    <div
                      key={tool._id}
                      className={`bg-card rounded-lg p-4 border ${style.border} hover:bg-secondary transition-all group flex items-center gap-4`}
                    >
                      <div className="size-12 bg-background rounded-lg border border-white/10 flex items-center justify-center shrink-0">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <ToolIcon toolSlug={tool.slug} className="w-8 h-8 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-foreground font-bold truncate group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                          <span className={`text-xs ${style.labelColor} font-bold uppercase px-2 py-0.5 rounded bg-background`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {tool.tagline}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {tool.githubStars && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-bold">
                              {(tool.githubStars / 1000).toFixed(1)}K
                            </span>
                          </div>
                        )}
                        {tool.usageCount !== undefined && tool.usageCount > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">{tool.usageCount}</span>
                          </div>
                        )}
                        <Link href={`/tools/${tool.slug}`}>
                          <button className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                            View
                          </button>
                        </Link>
                        <button
                          onClick={() => handleRemoveFavorite(tool._id)}
                          className="p-2 rounded-lg border border-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                          title="Remove from favorites"
                        >
                          <HeartOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            {hasActiveFilters ? (
              <>
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-bold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-bold text-foreground mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring tools and add them to your favorites
                </p>
                <Link href="/tools">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
                    <Wrench className="w-5 h-5" />
                    Browse Tools
                  </button>
                </Link>
              </>
            )}
          </div>
        )}

        {frequentlyUsed && frequentlyUsed.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Frequently Used
            </h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-wrap gap-4">
                {frequentlyUsed.slice(0, 8).filter((t): t is NonNullable<typeof t> => t !== null).map((tool) => (
                  <Link key={tool._id} href={`/tools/${tool.slug}`}>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="size-14 rounded-lg bg-background border border-border flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform overflow-hidden relative">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <ToolIcon toolSlug={tool.slug} className="w-6 h-6 text-primary" />
                        )}
                        {tool.isFavorite && (
                          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                            <Heart className="w-2.5 h-2.5 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[70px] text-center">
                        {tool.name}
                      </span>
                      <span className="text-[10px] text-primary font-medium">
                        {tool.usageCount} views
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
