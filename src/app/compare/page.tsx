"use client";

import { useState, Suspense, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Wrench,
  Scale,
  Plus,
  X,
  Star,
  Unlock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Github,
  Globe,
  Search,
  ChevronRight,
  TrendingUp,
  Eye,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Gauge,
  Flame,
  Save,
  Share2,
  Trophy,
  Target,
  Users,
  Package,
  ArrowRight,
  Swords,
  Crown,
  Medal
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { DynamicIcon, ToolIcon } from "@/components/dynamic-icon";
import { motion, AnimatePresence } from "framer-motion";
import { AutoLinkTools } from "@/components/auto-link-tools";
import { TourTrigger } from "@/components/page-tour";
import { compareTourConfig } from "@/lib/tour-configs";

type PricingModel = "free" | "freemium" | "paid" | "open_source" | "enterprise";

const pricingStyles: Record<PricingModel, { bg: string; text: string; label: string }> = {
  free: { bg: "bg-green-500/20", text: "text-green-400", label: "FREE" },
  freemium: { bg: "bg-blue-500/20", text: "text-blue-400", label: "FREEMIUM" },
  paid: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "PAID" },
  open_source: { bg: "bg-purple-500/20", text: "text-purple-400", label: "OSS" },
  enterprise: { bg: "bg-orange-500/20", text: "text-orange-400", label: "ENTERPRISE" },
};

const statConfig = [
  { key: "hp", label: "HP", color: "bg-red-500", icon: Heart, description: "Community strength & longevity. Based on GitHub stars, open source status, and features." },
  { key: "attack", label: "ATK", color: "bg-orange-500", icon: Flame, description: "Capability & power. Based on pros, npm downloads, and feature count." },
  { key: "defense", label: "DEF", color: "bg-blue-500", icon: Shield, description: "Stability & reliability. Based on open source status, pricing model, and community trust." },
  { key: "speed", label: "SPD", color: "bg-green-500", icon: Gauge, description: "Ease of adoption. Based on pricing, popularity, and simplicity." },
  { key: "mana", label: "MANA", color: "bg-purple-500", icon: Zap, description: "Versatility & extensibility. Based on features, open source status, and ecosystem." },
];

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">LOADING ARENA...</div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const initialSlugs = searchParams.get("tools")?.split(",").filter(Boolean) || [];
  const { user } = useUser();
  
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickPick, setShowQuickPick] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const allTools = useQuery(api.tools.list, { limit: 100 });
  const featuredTools = useQuery(api.tools.featured);
  const compareTools = useQuery(
    api.compare.getToolsBySlug,
    selectedSlugs.length > 0 ? { slugs: selectedSlugs } : "skip"
  );

  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );

  const popularComparisons = useQuery(api.seo.getPopularComparisons, { limit: 8 });
  
  const saveComparison = useMutation(api.compare.saveComparison);
  const recordMasteryInteraction = useMutation(api.mastery.recordInteraction);

  const handleAddTool = (slug: string) => {
    if (!selectedSlugs.includes(slug) && selectedSlugs.length < 4) {
      const newSlugs = [...selectedSlugs, slug];
      setSelectedSlugs(newSlugs);
      setSearchQuery("");
      setShowSearch(false);
      setShowQuickPick(false);
      window.history.replaceState({}, "", `/compare?tools=${newSlugs.join(",")}`);
    }
  };

  const handleRemoveTool = (slug: string) => {
    const newSlugs = selectedSlugs.filter((s) => s !== slug);
    setSelectedSlugs(newSlugs);
    if (newSlugs.length > 0) {
      window.history.replaceState({}, "", `/compare?tools=${newSlugs.join(",")}`);
    } else {
      window.history.replaceState({}, "", "/compare");
    }
  };

  const handleSaveComparison = async () => {
    if (!user?.id || validCompareTools.length < 2) return;
    
    const toolIds = validCompareTools.map(t => t._id);
    const name = validCompareTools.map(t => t.name).join(" vs ");
    
    await saveComparison({
      userId: user.id,
      toolIds,
      name,
    });

    for (const toolId of toolIds) {
      await recordMasteryInteraction({
        userId: user.id,
        toolId,
        interactionType: "comparison",
      });
    }
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const displayedSearchResults = searchResults?.filter(
    (tool) => !selectedSlugs.includes(tool.slug)
  );

  const quickPickTools = useMemo(() => {
    const featured = featuredTools?.slice(0, 4) || [];
    const popular = allTools?.filter(t => !featuredTools?.some(f => f._id === t._id)).slice(0, 8) || [];
    return [...featured, ...popular].filter(t => !selectedSlugs.includes(t.slug)).slice(0, 12);
  }, [featuredTools, allTools, selectedSlugs]);

  const validCompareTools = compareTools?.filter((t): t is NonNullable<typeof t> => t !== null) ?? [];

  const comparisonStats = useMemo(() => {
    if (validCompareTools.length < 2) return null;
    
    const stats = validCompareTools.map(tool => ({
      tool,
      totalScore: tool.stats 
        ? tool.stats.hp + tool.stats.attack + tool.stats.defense + tool.stats.speed + tool.stats.mana 
        : 0,
    }));
    
    const winner = stats.reduce((a, b) => a.totalScore > b.totalScore ? a : b);
    const openSourceCount = validCompareTools.filter(t => t.isOpenSource).length;
    const freeCount = validCompareTools.filter(t => t.pricingModel === "free" || t.pricingModel === "open_source").length;
    const avgStars = validCompareTools.reduce((sum, t) => sum + (t.githubStars || 0), 0) / validCompareTools.length;
    
    return {
      winner: winner.tool,
      winnerScore: winner.totalScore,
      openSourceCount,
      freeCount,
      avgStars,
      totalTools: validCompareTools.length,
    };
  }, [validCompareTools]);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={compareTourConfig} />
      </div>
      
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <Swords className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Tool Arena</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Compare Tools
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Select up to 4 tools to compare stats, features, and find the best fit for your stack
          </p>
        </div>

        {/* Tool Selection Area */}
        <div className="mb-8" data-tour="compare-search">
          <div className="flex flex-wrap gap-3 items-center justify-center mb-4">
            <AnimatePresence mode="popLayout">
              {selectedSlugs.map((slug, index) => {
                const tool = compareTools?.find((t) => t && t.slug === slug);
                const pricing = tool?.pricingModel as PricingModel;
                const style = pricing ? pricingStyles[pricing] : pricingStyles.free;
                
                return (
                  <motion.div
                    key={slug}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    <div className={`relative bg-card border border-border rounded-lg p-3 pr-8 flex items-center gap-3 group hover:border-primary transition-colors`}>
                      <div className="size-10 bg-background rounded-lg border border-border flex items-center justify-center shrink-0">
                        {tool?.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <ToolIcon toolSlug={slug} className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold text-sm truncate">
                          {tool?.name || slug}
                        </p>
                        <span className={`text-[10px] font-bold uppercase ${style.text}`}>
                          {style.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveTool(slug)}
                        className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && validCompareTools.length >= 2 && comparisonStats?.winner?._id === tool?._id && (
                        <div className="absolute -top-2 -right-2">
                          <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {selectedSlugs.length < 4 && (
              <div className="flex gap-2">
                <PixelButton
                  variant="outline"
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setShowQuickPick(false);
                  }}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" /> Search
                </PixelButton>
                <PixelButton
                  variant="ghost"
                  onClick={() => {
                    setShowQuickPick(!showQuickPick);
                    setShowSearch(false);
                  }}
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" /> Quick Pick
                </PixelButton>
              </div>
            )}
          </div>

          {/* Search Panel */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <PixelCard className="p-4 max-w-lg mx-auto">
                  <div className="flex items-center gap-2 mb-4 bg-background rounded-lg border border-border px-3">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {displayedSearchResults && displayedSearchResults.length > 0 && (
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {displayedSearchResults.slice(0, 10).map((tool) => {
                        const pricing = tool.pricingModel as PricingModel;
                        const style = pricingStyles[pricing];
                        return (
                          <button
                            key={tool._id}
                            onClick={() => handleAddTool(tool.slug)}
                            className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-card/50 transition-all flex items-center gap-3"
                          >
                            <div className="size-8 bg-background rounded border border-border flex items-center justify-center shrink-0">
                              {tool.logoUrl ? (
                                <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 object-contain" />
                              ) : (
                                <ToolIcon toolSlug={tool.slug} className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-sm font-medium truncate">{tool.name}</p>
                              <p className="text-muted-foreground text-xs truncate">{tool.tagline}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {searchQuery.length > 2 && displayedSearchResults?.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No tools found for "{searchQuery}"
                    </p>
                  )}

                  {searchQuery.length <= 2 && (
                    <p className="text-muted-foreground text-xs text-center py-2">
                      Type at least 3 characters to search
                    </p>
                  )}
                </PixelCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Pick Panel */}
          <AnimatePresence>
            {showQuickPick && quickPickTools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <PixelCard className="p-4 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Popular Tools</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {quickPickTools.map((tool) => {
                      const pricing = tool.pricingModel as PricingModel;
                      const style = pricingStyles[pricing];
                      return (
                        <button
                          key={tool._id}
                          onClick={() => handleAddTool(tool.slug)}
                          className="p-2 rounded-lg border border-border hover:border-primary hover:bg-card/50 transition-all flex items-center gap-2 text-left"
                        >
                          <div className="size-7 bg-background rounded border border-border flex items-center justify-center shrink-0">
                            {tool.logoUrl ? (
                              <img src={tool.logoUrl} alt={tool.name} className="w-4 h-4 object-contain" />
                            ) : (
                              <ToolIcon toolSlug={tool.slug} className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-xs font-medium truncate">{tool.name}</p>
                            <span className={`text-[8px] font-bold ${style.text}`}>{style.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </PixelCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison Stats Summary */}
        {comparisonStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary/10 via-card to-primary/10 border border-primary/30 rounded-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Stats Leader</p>
                    <Link href={`/tools/${comparisonStats.winner.slug}`} className="text-xl font-bold text-foreground hover:text-primary transition-colors">{comparisonStats.winner.name}</Link>
                    <p className="text-xs text-primary">Total Score: {comparisonStats.winnerScore}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{comparisonStats.totalTools}</p>
                    <p className="text-xs text-muted-foreground">Tools</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{comparisonStats.openSourceCount}</p>
                    <p className="text-xs text-muted-foreground">Open Source</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">{(comparisonStats.avgStars / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">Avg Stars</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {user && (
                    <PixelButton
                      variant="outline"
                      size="sm"
                      onClick={handleSaveComparison}
                      className="gap-2"
                    >
                      {saveSuccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
                      {saveSuccess ? "Saved!" : "Save"}
                    </PixelButton>
                  )}
                  <PixelButton
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    {shareSuccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                    {shareSuccess ? "Copied!" : "Share"}
                  </PixelButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Visual Stats Comparison */}
        {validCompareTools.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-foreground font-bold text-sm uppercase tracking-wide">Battle Stats</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="grid gap-4">
                {statConfig.map(({ key, label, color, icon: Icon, description }) => {
                  const maxValue = Math.max(...validCompareTools.map(t => t.stats?.[key as keyof typeof t.stats] || 0));
                  
                  return (
                    <div key={key} className="space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-muted-foreground cursor-help w-fit">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">{label}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p>{description}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="grid gap-2">
                        {validCompareTools.map((tool) => {
                          const value = tool.stats?.[key as keyof typeof tool.stats] || 0;
                          const percentage = maxValue > 0 ? (value / 100) * 100 : 0;
                          const isMax = value === maxValue && maxValue > 0;
                          
                          return (
                            <div key={tool._id} className="flex items-center gap-3">
                              <div className="w-20 md:w-28 text-xs text-foreground font-medium truncate">
                                {tool.name}
                              </div>
                              <div className="flex-1 h-4 bg-background rounded-full overflow-hidden border border-border">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                  className={`h-full ${color} ${isMax ? "shadow-[0_0_10px_rgba(255,255,255,0.3)]" : ""}`}
                                />
                              </div>
                              <div className={`w-10 text-right text-xs font-mono font-bold ${isMax ? "text-primary" : "text-muted-foreground"}`}>
                                {value}
                              </div>
                              {isMax && <Medal className="w-4 h-4 text-yellow-500" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Detailed Comparison Table */}
        {validCompareTools.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="text-foreground font-bold text-sm uppercase tracking-wide">Detailed Comparison</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-card">
                    <th className="p-4 text-left text-muted-foreground text-xs font-medium uppercase border-r border-border w-32">
                      Attribute
                    </th>
                    {validCompareTools.map((tool, idx) => (
                      <th key={tool._id} className={`p-4 text-center border-r border-border last:border-r-0 ${idx === 0 ? "bg-primary/5" : ""}`}>
                        <Link href={`/tools/${tool.slug}`} className="hover:text-primary transition-colors">
                          <div className="flex flex-col items-center gap-2">
                            <div className="size-10 bg-background rounded-lg border border-border flex items-center justify-center">
                              {tool.logoUrl ? (
                                <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" />
                              ) : (
                                <ToolIcon toolSlug={tool.slug} className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-foreground font-semibold text-sm">{tool.name}</p>
                              <p className="text-muted-foreground text-[10px] line-clamp-1">{tool.tagline}</p>
                            </div>
                          </div>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {/* Pricing */}
                  <tr className="border-t border-border">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Pricing
                      </div>
                    </td>
                    {validCompareTools.map((tool) => {
                      const pricing = tool.pricingModel as PricingModel;
                      const style = pricingStyles[pricing];
                      return (
                        <td key={tool._id} className="p-4 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Open Source */}
                  <tr className="border-t border-border bg-card/50">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border">
                      <div className="flex items-center gap-2">
                        <Unlock className="w-3 h-3" /> Open Source
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 text-center border-r border-border last:border-r-0">
                        {tool.isOpenSource ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* GitHub Stars */}
                  <tr className="border-t border-border">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" /> GitHub Stars
                      </div>
                    </td>
                    {validCompareTools.map((tool) => {
                      const maxStars = Math.max(...validCompareTools.map(t => t.githubStars || 0));
                      const isMax = tool.githubStars === maxStars && maxStars > 0;
                      return (
                        <td key={tool._id} className="p-4 text-center border-r border-border last:border-r-0">
                          <span className={`text-sm font-mono font-bold ${isMax ? "text-yellow-400" : "text-muted-foreground"}`}>
                            {tool.githubStars ? `${(tool.githubStars / 1000).toFixed(1)}K` : "N/A"}
                          </span>
                          {isMax && <Star className="w-3 h-3 text-yellow-400 inline ml-1" />}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Category */}
                  <tr className="border-t border-border bg-card/50">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border">
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" /> Category
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 text-center border-r border-border last:border-r-0">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <DynamicIcon name={tool.category?.icon || "Package"} className="w-4 h-4" />
                          {tool.category?.name}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Strengths */}
                  <tr className="border-t border-border">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border align-top">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Strengths
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 border-r border-border last:border-r-0 align-top">
                        <ul className="space-y-1.5">
                          {tool.pros.slice(0, 3).map((pro, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <Plus className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              <AutoLinkTools text={pro} />
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Weaknesses */}
                  <tr className="border-t border-border bg-card/50">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border align-top">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" /> Weaknesses
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 border-r border-border last:border-r-0 align-top">
                        <ul className="space-y-1.5">
                          {tool.cons.slice(0, 3).map((con, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                              <AutoLinkTools text={con} />
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Best For */}
                  <tr className="border-t border-border">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border align-top">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" /> Best For
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 border-r border-border last:border-r-0 align-top">
                        <ul className="space-y-1.5">
                          {tool.bestFor.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <AutoLinkTools text={item} />
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Features */}
                  <tr className="border-t border-border bg-card/50">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border align-top">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Features
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 border-r border-border last:border-r-0 align-top">
                        <div className="flex flex-wrap gap-1">
                          {tool.features.slice(0, 5).map((feature) => (
                            <span key={feature} className="text-[10px] px-2 py-0.5 bg-background border border-border rounded text-muted-foreground">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Links */}
                  <tr className="border-t border-border">
                    <td className="p-4 text-muted-foreground text-xs font-medium border-r border-border">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Links
                      </div>
                    </td>
                    {validCompareTools.map((tool) => (
                      <td key={tool._id} className="p-4 text-center border-r border-border last:border-r-0">
                        <div className="flex justify-center gap-3">
                          {tool.websiteUrl && (
                            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background border border-border hover:border-primary transition-colors">
                              <Globe className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                          {tool.githubUrl && (
                            <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background border border-border hover:border-primary transition-colors">
                              <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {selectedSlugs.length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PixelCard className="text-center p-8 md:p-12 max-w-2xl mx-auto">
              <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Swords className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Enter the Arena</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                Select at least 2 tools to start comparing their stats, features, and find the perfect fit for your tech stack
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <PixelButton onClick={() => setShowQuickPick(true)} className="gap-2">
                  <Zap className="w-4 h-4" /> Quick Pick Tools
                </PixelButton>
                <Link href="/tools">
                  <PixelButton variant="outline" className="gap-2 w-full sm:w-auto">
                    <Wrench className="w-4 h-4" /> Browse All Tools
                  </PixelButton>
                </Link>
              </div>
            </PixelCard>
          </motion.div>
        )}

        {/* Popular AI-Generated Comparisons */}
        {popularComparisons && popularComparisons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Comparisons</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">In-Depth Analysis</h2>
              </div>
              <Link href="/blog">
                <PixelButton variant="ghost" size="sm" className="gap-2">
                  View All <ChevronRight className="w-4 h-4" />
                </PixelButton>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularComparisons.map((comparison) => (
                <Link
                  key={comparison._id}
                  href={`/compare/${comparison.slug}`}
                  className="block group"
                >
                  <PixelCard className="h-full hover:border-primary transition-all hover:-translate-y-1">
                    <PixelCardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span className="text-[10px]">{comparison.views}</span>
                        </div>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="size-8 bg-background rounded border border-border flex items-center justify-center">
                          {comparison.tool1?.logoUrl ? (
                            <img src={comparison.tool1.logoUrl} alt="" className="w-5 h-5 object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs">vs</span>
                        <div className="size-8 bg-background rounded border border-border flex items-center justify-center">
                          {comparison.tool2?.logoUrl ? (
                            <img src={comparison.tool2.logoUrl} alt="" className="w-5 h-5 object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-foreground font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {comparison.tool1?.name} vs {comparison.tool2?.name}
                      </p>
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                        {comparison.metaDescription}
                      </p>
                      
                      <div className="flex items-center text-primary text-xs font-medium">
                        <span>Read Analysis</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
