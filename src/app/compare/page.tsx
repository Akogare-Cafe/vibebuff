"use client";

import { useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Sparkles
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm">LOADING...</div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const initialSlugs = searchParams.get("tools")?.split(",") || [];
  
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const allTools = useQuery(api.tools.list, { limit: 100 });
  const compareTools = useQuery(
    api.compare.getToolsBySlug,
    selectedSlugs.length > 0 ? { slugs: selectedSlugs } : "skip"
  );

  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );

  const popularComparisons = useQuery(api.seo.getPopularComparisons, { limit: 8 });

  const handleAddTool = (slug: string) => {
    if (!selectedSlugs.includes(slug) && selectedSlugs.length < 4) {
      const newSlugs = [...selectedSlugs, slug];
      setSelectedSlugs(newSlugs);
      setSearchQuery("");
      setShowSearch(false);
      // Update URL
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

  const displayedSearchResults = searchResults?.filter(
    (tool) => !selectedSlugs.includes(tool.slug)
  );

  // Filter out null values and get valid tools for comparison
  const validCompareTools = compareTools?.filter((t): t is NonNullable<typeof t> => t !== null) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-primary text-lg mb-2 flex items-center justify-center gap-2">
            <Scale className="w-5 h-5" /> COMPARE TOOLS
          </h1>
          <p className="text-muted-foreground text-[10px]">
            SELECT UP TO 4 TOOLS TO COMPARE SIDE BY SIDE
          </p>
        </div>

        {/* Tool Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
            {selectedSlugs.map((slug) => {
              const tool = compareTools?.find((t) => t && t.slug === slug);
              return (
                <PixelCard key={slug} className="p-4 flex items-center gap-2">
                  <span className="text-primary text-[10px]">
                    {tool?.name || slug}
                  </span>
                  <button
                    onClick={() => handleRemoveTool(slug)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </PixelCard>
              );
            })}
            
            {selectedSlugs.length < 4 && (
              <PixelButton
                variant="outline"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Plus className="w-4 h-4 mr-1" /> ADD TOOL
              </PixelButton>
            )}
          </div>

          {/* Search Panel */}
          {showSearch && (
            <PixelCard className="p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <PixelInput
                  placeholder="SEARCH TOOLS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
              </div>
              
              {displayedSearchResults && displayedSearchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {displayedSearchResults.slice(0, 10).map((tool) => (
                    <button
                      key={tool._id}
                      onClick={() => handleAddTool(tool.slug)}
                      className="w-full text-left p-2 border-2 border-border hover:border-primary hover:bg-card transition-colors"
                    >
                      <p className="text-primary text-[10px]">{tool.name}</p>
                      <p className="text-muted-foreground text-[8px]">{tool.tagline}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length > 2 && displayedSearchResults?.length === 0 && (
                <p className="text-muted-foreground text-[10px] text-center">
                  NO TOOLS FOUND
                </p>
              )}

              {searchQuery.length <= 2 && (
                <p className="text-muted-foreground text-[8px] text-center">
                  TYPE AT LEAST 3 CHARACTERS TO SEARCH
                </p>
              )}
            </PixelCard>
          )}
        </div>

        {/* Comparison Table */}
        {validCompareTools.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-border">
              {/* Header Row */}
              <thead>
                <tr className="bg-card">
                  <th className="p-4 text-left text-primary text-[10px] border-r-2 border-border w-32">
                    ATTRIBUTE
                  </th>
                  {validCompareTools.map((tool) => (
                    <th key={tool._id} className="p-4 text-center border-r-2 border-border last:border-r-0">
                      <Link href={`/tools/${tool.slug}`} className="hover:text-primary">
                        <p className="text-primary text-[12px] mb-1">{tool.name}</p>
                        <p className="text-muted-foreground text-[8px]">{tool.tagline}</p>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Pricing */}
                <tr className="border-t-2 border-border">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border">
                    <DollarSign className="w-3 h-3 inline mr-1" /> PRICING
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center border-r-2 border-border last:border-r-0">
                      <PixelBadge variant="default">
                        {tool.pricingModel === "free" ? "FREE" : 
                         tool.pricingModel === "freemium" ? "FREEMIUM" : 
                         tool.pricingModel === "open_source" ? "OSS" : "PAID"}
                      </PixelBadge>
                    </td>
                  ))}
                </tr>

                {/* Open Source */}
                <tr className="border-t-2 border-border bg-card">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border">
                    <Unlock className="w-3 h-3 inline mr-1" /> OPEN SOURCE
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center border-r-2 border-border last:border-r-0">
                      {tool.isOpenSource ? (
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* GitHub Stars */}
                <tr className="border-t-2 border-border">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border">
                    <Star className="w-3 h-3 inline mr-1" /> GITHUB STARS
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center text-muted-foreground text-[10px] border-r-2 border-border last:border-r-0">
                      {tool.githubStars ? `${(tool.githubStars / 1000).toFixed(0)}K` : "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-t-2 border-border bg-card">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border">
                    CATEGORY
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center text-muted-foreground text-[10px] border-r-2 border-border last:border-r-0">
                      {tool.category?.icon} {tool.category?.name}
                    </td>
                  ))}
                </tr>

                {/* Strengths */}
                <tr className="border-t-2 border-border">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border align-top">
                    <CheckCircle className="w-3 h-3 inline mr-1" /> STRENGTHS
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-border last:border-r-0 align-top">
                      <ul className="space-y-1">
                        {tool.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="text-muted-foreground text-[8px] flex items-start gap-1">
                            <span className="text-primary">+</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Weaknesses */}
                <tr className="border-t-2 border-border bg-card">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border align-top">
                    <AlertTriangle className="w-3 h-3 inline mr-1" /> WEAKNESSES
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-border last:border-r-0 align-top">
                      <ul className="space-y-1">
                        {tool.cons.slice(0, 3).map((con, i) => (
                          <li key={i} className="text-muted-foreground text-[8px] flex items-start gap-1">
                            <span className="text-muted-foreground">-</span> {con}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Best For */}
                <tr className="border-t-2 border-border">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border align-top">
                    BEST FOR
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-border last:border-r-0 align-top">
                      <ul className="space-y-1">
                        {tool.bestFor.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-muted-foreground text-[8px] flex items-start gap-1">
                            <ChevronRight className="w-2 h-2 mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr className="border-t-2 border-border bg-card">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border align-top">
                    FEATURES
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-border last:border-r-0 align-top">
                      <div className="flex flex-wrap gap-1">
                        {tool.features.slice(0, 5).map((feature) => (
                          <PixelBadge key={feature} variant="outline" className="text-[6px]">
                            {feature}
                          </PixelBadge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Links */}
                <tr className="border-t-2 border-border">
                  <td className="p-4 text-primary text-[10px] border-r-2 border-border">
                    LINKS
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center border-r-2 border-border last:border-r-0">
                      <div className="flex justify-center gap-2">
                        {tool.websiteUrl && (
                          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                        {tool.githubUrl && (
                          <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
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
        )}

        {/* Empty State */}
        {selectedSlugs.length < 2 && (
          <PixelCard className="text-center p-8">
            <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-primary text-sm mb-2">SELECT TOOLS TO COMPARE</p>
            <p className="text-muted-foreground text-[10px] mb-4">
              ADD AT LEAST 2 TOOLS TO START COMPARING
            </p>
            <Link href="/tools">
              <PixelButton>
                <Wrench className="w-4 h-4 mr-2" /> BROWSE TOOLS
              </PixelButton>
            </Link>
          </PixelCard>
        )}

        {/* Popular AI-Generated Comparisons */}
        {popularComparisons && popularComparisons.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <h2 className="text-primary text-sm mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> AI-GENERATED COMPARISONS
              </h2>
              <p className="text-muted-foreground text-[10px]">
                IN-DEPTH TOOL COMPARISONS POWERED BY AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularComparisons.map((comparison) => (
                <Link
                  key={comparison._id}
                  href={`/compare/${comparison.slug}`}
                  className="block"
                >
                  <PixelCard className="h-full hover:border-primary transition-colors">
                    <PixelCardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <PixelBadge variant="outline" className="text-[6px]">
                          <Eye className="w-2 h-2 mr-1" />
                          {comparison.views}
                        </PixelBadge>
                        <TrendingUp className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-primary text-[10px] mb-1">
                        {comparison.tool1?.name} vs {comparison.tool2?.name}
                      </p>
                      <p className="text-muted-foreground text-[8px] line-clamp-2">
                        {comparison.metaDescription}
                      </p>
                      <div className="mt-2 flex items-center text-muted-foreground text-[8px]">
                        <span>READ COMPARISON</span>
                        <ChevronRight className="w-2 h-2 ml-1" />
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>

            <div className="text-center mt-6">
              <Link href="/blog">
                <PixelButton variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" /> VIEW MORE COMPARISONS
                </PixelButton>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
