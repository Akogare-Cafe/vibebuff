"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Star,
  Store,
  LayoutGrid,
  Paintbrush,
  Server,
  Cloud,
  Wrench,
  Stars,
  Coins,
  SlidersHorizontal,
  ArrowUpDown,
  Bot,
  Bookmark,
  Heart,
  ChevronLeft,
  ChevronRight,
  Home,
  Backpack,
  Play,
  MessageSquare,
  User,
  Lock,
  Globe,
  Github,
  ExternalLink,
  Package,
  Database,
  Cpu,
  Layers,
  Zap,
  Code,
  Terminal,
} from "lucide-react";
import { ToolIcon } from "@/components/dynamic-icon";
import { AdDisplay } from "@/components/ad-display";

type PricingModel = "free" | "freemium" | "paid" | "open_source" | "enterprise";

const pricingStyles: Record<PricingModel, { border: string; label: string; labelColor: string; hoverBtn: string }> = {
  free: { border: "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]", label: "Free", labelColor: "text-green-500", hoverBtn: "hover:bg-green-600" },
  freemium: { border: "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]", label: "Freemium", labelColor: "text-blue-500", hoverBtn: "hover:bg-blue-600" },
  paid: { border: "border-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]", label: "Paid", labelColor: "text-yellow-500", hoverBtn: "hover:bg-yellow-600" },
  open_source: { border: "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]", label: "Open Source", labelColor: "text-purple-500", hoverBtn: "hover:bg-purple-600" },
  enterprise: { border: "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]", label: "Enterprise", labelColor: "text-orange-500", hoverBtn: "hover:bg-orange-600" },
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  frontend: Paintbrush,
  backend: Server,
  database: Database,
  infrastructure: Cloud,
  devops: Cpu,
  utilities: Wrench,
  ai: Bot,
  default: Package,
};

const rarityFilters = [
  { id: "free", label: "Free", color: "border-green-500", textColor: "text-green-400" },
  { id: "freemium", label: "Freemium", color: "border-blue-500", textColor: "text-blue-400" },
  { id: "open_source", label: "Open Source", color: "border-purple-500", textColor: "text-purple-400" },
  { id: "paid", label: "Paid", color: "border-yellow-500", textColor: "text-yellow-500" },
];

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}

function ToolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  const categoryFilter = searchParams.get("category");
  const urlSearchQuery = searchParams.get("search");
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery || "");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || "all");
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "stars" | "featured">("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = useQuery(api.categories.list);
  const tools = useQuery(api.tools.list, {
    categorySlug: selectedCategory !== "all" ? selectedCategory : undefined,
    limit: 100
  });
  const featuredTools = useQuery(api.tools.featured);
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 1 ? { query: searchQuery } : "skip"
  );
  const stats = useQuery(api.tools.getStats);

  const favorites = useQuery(
    api.toolUsage.getFavorites,
    user?.id ? { userId: user.id } : "skip"
  );

  const toggleFavorite = useMutation(api.toolUsage.toggleFavorite);
  const trackUsage = useMutation(api.toolUsage.trackUsage);

  const favoriteIds = new Set(favorites?.filter((f) => f !== null).map((f) => f._id) ?? []);

  const baseTools = searchQuery.length > 1 ? searchResults : tools;
  
  const filteredTools = baseTools?.filter((tool) => {
    if (selectedPricing.length > 0 && !selectedPricing.includes(tool.pricingModel)) {
      return false;
    }
    return true;
  });

  const sortedTools = [...(filteredTools ?? [])].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "stars") return (b.githubStars ?? 0) - (a.githubStars ?? 0);
    if (sortBy === "featured") return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    return 0;
  });

  const totalPages = Math.ceil((sortedTools?.length ?? 0) / itemsPerPage);
  const paginatedTools = sortedTools?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const featuredTool = featuredTools?.[0];

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    if (categorySlug === "all") {
      router.push("/tools");
    } else {
      router.push(`/tools?category=${categorySlug}`);
    }
  };

  const handleToggleFavorite = async (toolId: Id<"tools">) => {
    if (!user?.id) return;
    await toggleFavorite({ userId: user.id, toolId });
  };

  const handleToolClick = async (toolId: Id<"tools">, slug: string) => {
    if (user?.id) {
      await trackUsage({ userId: user.id, toolId });
    }
    router.push(`/tools/${slug}`);
  };

  const togglePricingFilter = (pricing: string) => {
    setSelectedPricing((prev) =>
      prev.includes(pricing)
        ? prev.filter((p) => p !== pricing)
        : [...prev, pricing]
    );
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Store className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {stats ? `${stats.toolsCount} Tools Available` : "Loading..."}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Tech Stack Armory</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Equip yourself with legendary frameworks and libraries. Check requirements before acquiring.</p>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "stars" | "featured")}
              className="px-4 py-2 bg-transparent border border-border hover:border-primary text-foreground text-sm font-medium rounded transition-colors cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="name">Sort: Name</option>
              <option value="stars">Sort: Stars</option>
            </select>
          </div>
        </div>

        <div className="flex-1 max-w-lg py-4 hidden sm:block">
          <label className="flex w-full items-stretch rounded-lg h-10 group focus-within:ring-2 focus-within:ring-primary/50 transition-all border border-border">
            <div className="text-muted-foreground flex border-none items-center justify-center pl-4 rounded-l-lg">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none text-foreground focus:outline-0 bg-transparent border-none h-full placeholder:text-muted-foreground/50 px-4 pl-2 text-sm font-normal"
              placeholder="Search armory for tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
          <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-24">
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  Categories
                </h3>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex justify-between items-center transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary/20 border border-primary/40 text-foreground font-bold"
                      : "hover:bg-white/5 text-muted-foreground group"
                  }`}
                >
                  <span className={`flex items-center gap-2 ${selectedCategory !== "all" ? "group-hover:text-foreground" : ""}`}>
                    <LayoutGrid className="w-4 h-4" />
                    All Tools
                  </span>
                  <span className={`text-xs ${selectedCategory === "all" ? "bg-black/40 px-1.5 rounded text-primary" : "text-gray-600 group-hover:text-gray-400"}`}>
                    {stats?.toolsCount ?? 0}
                  </span>
                </button>
                {categories?.map((cat) => {
                  const IconComponent = categoryIcons[cat.slug] || categoryIcons.default;
                  return (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex justify-between items-center transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-primary/20 border border-primary/40 text-foreground font-bold"
                          : "hover:bg-white/5 text-muted-foreground group"
                      }`}
                    >
                      <span className={`flex items-center gap-2 ${selectedCategory !== cat.slug ? "group-hover:text-foreground" : ""}`}>
                        <IconComponent className="w-4 h-4" />
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  Pricing
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {rarityFilters.map((pricing) => (
                  <label key={pricing.id} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      className={`size-4 rounded border ${pricing.color} bg-transparent flex items-center justify-center group-hover:border-white`}
                      onClick={() => togglePricingFilter(pricing.id)}
                    >
                      {selectedPricing.includes(pricing.id) && (
                        <div className={`size-2 ${pricing.color.replace("border-", "bg-")} rounded-sm`} />
                      )}
                    </div>
                    <span 
                      className={`${pricing.textColor} text-sm group-hover:brightness-125 ${selectedPricing.includes(pricing.id) ? "font-bold" : ""}`}
                      onClick={() => togglePricingFilter(pricing.id)}
                    >
                      {pricing.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdDisplay placement="sidebar" />
          </aside>

          <section className="lg:col-span-9 flex flex-col gap-8">
            {featuredTool && (
              <div 
                className="bg-card border border-primary/30 rounded-xl p-1 relative overflow-hidden group shadow-[0_0_40px_rgba(127,19,236,0.1)] cursor-pointer"
                onClick={() => handleToolClick(featuredTool._id, featuredTool.slug)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="relative bg-card rounded-lg p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative shrink-0">
                    <div className="size-32 md:size-40 bg-background rounded-xl border border-primary/50 flex items-center justify-center shadow-lg relative z-10">
                      {featuredTool.logoUrl ? (
                        <img src={featuredTool.logoUrl} alt={featuredTool.name} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                      ) : (
                        <Package className="w-16 h-16 md:w-20 md:h-20 text-primary drop-shadow-[0_0_15px_rgba(127,19,236,0.8)]" />
                      )}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full border border-dashed border-primary/20 pointer-events-none z-0" style={{ animation: "spin 20s linear infinite" }} />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-primary/50 px-3 py-1 rounded-full text-xs text-primary font-bold whitespace-nowrap z-20 shadow-lg">
                      FEATURED
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{featuredTool.name}</h2>
                          <span className="px-2 py-0.5 rounded text-sm font-bold bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                            {featuredTool.pricingModel === "open_source" ? "OSS" : featuredTool.pricingModel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-purple-300 text-sm font-medium">{featuredTool.tagline}</p>
                      </div>
                      {featuredTool.githubStars && (
                        <div className="hidden sm:block text-right">
                          <div className="text-xs text-muted-foreground mb-1">GitHub Stars</div>
                          <div className="text-xl font-bold text-yellow-400 font-mono flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {(featuredTool.githubStars / 1000).toFixed(1)}K
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-muted-foreground text-sm leading-relaxed border-l-2 border-primary/30 pl-4">
                      {featuredTool.description}
                    </div>
                    {featuredTool.stats && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3 mt-6">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">HP</span>
                            <span className="text-red-400 font-mono font-bold">{featuredTool.stats.hp}</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-sm overflow-hidden">
                            <div className="h-full bg-red-500 rounded-sm" style={{ width: `${featuredTool.stats.hp}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">ATK</span>
                            <span className="text-orange-400 font-mono font-bold">{featuredTool.stats.attack}</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-sm overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-sm" style={{ width: `${featuredTool.stats.attack}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">DEF</span>
                            <span className="text-blue-400 font-mono font-bold">{featuredTool.stats.defense}</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-sm overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-sm" style={{ width: `${featuredTool.stats.defense}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">SPD</span>
                            <span className="text-green-400 font-mono font-bold">{featuredTool.stats.speed}</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-sm overflow-hidden">
                            <div className="h-full bg-green-500 rounded-sm" style={{ width: `${featuredTool.stats.speed}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">MANA</span>
                            <span className="text-purple-400 font-mono font-bold">{featuredTool.stats.mana}</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-sm overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-sm" style={{ width: `${featuredTool.stats.mana}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <Link href={`/tools/${featuredTool.slug}`}>
                        <button className="quest-btn py-2 px-6 font-bold flex items-center gap-2">
                          <ExternalLink className="w-5 h-5" />
                          View Details
                        </button>
                      </Link>
                      {user && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(featuredTool._id);
                          }}
                          className={`bg-card border hover:bg-white/5 font-bold py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                            favoriteIds.has(featuredTool._id) 
                              ? "border-red-500 text-red-500" 
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${favoriteIds.has(featuredTool._id) ? "fill-current" : ""}`} />
                          {favoriteIds.has(featuredTool._id) ? "Favorited" : "Favorite"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  Available Tools
                </h3>
                <span className="text-xs text-muted-foreground">
                  Showing {paginatedTools?.length ?? 0} of {sortedTools?.length ?? 0} items
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedTools?.map((tool) => {
                  const style = pricingStyles[tool.pricingModel] || pricingStyles.free;
                  const isFavorited = favoriteIds.has(tool._id);
                  return (
                    <div
                      key={tool._id}
                      className={`bg-card rounded-lg p-4 border ${style.border} hover:bg-secondary transition-all cursor-pointer group flex flex-col gap-3 relative`}
                      onClick={() => handleToolClick(tool._id, tool.slug)}
                    >
                      {user && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(tool._id);
                          }}
                          className={`absolute top-3 right-3 p-1.5 rounded transition-colors ${
                            isFavorited 
                              ? "text-red-500" 
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                        </button>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="size-14 bg-background rounded-lg border border-white/10 flex items-center justify-center shrink-0">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <ToolIcon toolSlug={tool.slug} className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-foreground font-bold transition-colors truncate pr-6">{tool.name}</h4>
                          <p className={`text-xs ${style.labelColor} font-bold uppercase tracking-wider`}>{style.label}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="p-1.5 rounded text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Stars</div>
                          <div className="text-green-400 font-bold text-xs flex items-center justify-center gap-1">
                            <Star className="w-3 h-3" />
                            {tool.githubStars ? `${(tool.githubStars / 1000).toFixed(1)}K` : "N/A"}
                          </div>
                        </div>
                        <div className="p-1.5 rounded text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Type</div>
                          <div className="text-blue-400 font-bold text-xs">
                            {tool.isOpenSource ? "OSS" : "Closed"}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{tool.tagline}</p>
                      <button className={`mt-auto w-full py-1.5 rounded bg-secondary text-xs text-foreground font-bold ${style.hoverBtn} transition-colors`}>
                        Inspect
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <button 
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="size-8 rounded bg-secondary flex items-center justify-center text-gray-400 hover:text-foreground hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-8 rounded text-sm flex items-center justify-center transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-white font-bold shadow-[0_0_10px_rgba(127,19,236,0.5)]"
                          : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="size-8 rounded bg-secondary flex items-center justify-center text-gray-400 hover:text-foreground hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

    </div>
  );
}
