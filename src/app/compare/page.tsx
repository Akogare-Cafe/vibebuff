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
  ChevronRight
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#60a5fa] text-sm">LOADING...</div>
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
    <div className="min-h-screen bg-[#000000]">
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-[#60a5fa] text-lg mb-2 flex items-center justify-center gap-2">
            <Scale className="w-5 h-5" /> COMPARE TOOLS
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
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
                  <span className="text-[#60a5fa] text-[10px]">
                    {tool?.name || slug}
                  </span>
                  <button
                    onClick={() => handleRemoveTool(slug)}
                    className="text-[#3b82f6] hover:text-[#60a5fa]"
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
                <Search className="w-4 h-4 text-[#3b82f6]" />
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
                      className="w-full text-left p-2 border-2 border-[#1e3a5f] hover:border-[#3b82f6] hover:bg-[#0a1628] transition-colors"
                    >
                      <p className="text-[#60a5fa] text-[10px]">{tool.name}</p>
                      <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length > 2 && displayedSearchResults?.length === 0 && (
                <p className="text-[#3b82f6] text-[10px] text-center">
                  NO TOOLS FOUND
                </p>
              )}

              {searchQuery.length <= 2 && (
                <p className="text-[#1e3a5f] text-[8px] text-center">
                  TYPE AT LEAST 3 CHARACTERS TO SEARCH
                </p>
              )}
            </PixelCard>
          )}
        </div>

        {/* Comparison Table */}
        {validCompareTools.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-[#1e3a5f]">
              {/* Header Row */}
              <thead>
                <tr className="bg-[#0a1628]">
                  <th className="p-4 text-left text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f] w-32">
                    ATTRIBUTE
                  </th>
                  {validCompareTools.map((tool) => (
                    <th key={tool._id} className="p-4 text-center border-r-2 border-[#1e3a5f] last:border-r-0">
                      <Link href={`/tools/${tool.slug}`} className="hover:text-[#60a5fa]">
                        <p className="text-[#60a5fa] text-[12px] mb-1">{tool.name}</p>
                        <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Pricing */}
                <tr className="border-t-2 border-[#1e3a5f]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f]">
                    <DollarSign className="w-3 h-3 inline mr-1" /> PRICING
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center border-r-2 border-[#1e3a5f] last:border-r-0">
                      <PixelBadge variant="default">
                        {tool.pricingModel === "free" ? "FREE" : 
                         tool.pricingModel === "freemium" ? "FREEMIUM" : 
                         tool.pricingModel === "open_source" ? "OSS" : "PAID"}
                      </PixelBadge>
                    </td>
                  ))}
                </tr>

                {/* Open Source */}
                <tr className="border-t-2 border-[#1e3a5f] bg-[#0a1628]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f]">
                    <Unlock className="w-3 h-3 inline mr-1" /> OPEN SOURCE
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center border-r-2 border-[#1e3a5f] last:border-r-0">
                      {tool.isOpenSource ? (
                        <CheckCircle className="w-5 h-5 text-[#60a5fa] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#1e3a5f] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* GitHub Stars */}
                <tr className="border-t-2 border-[#1e3a5f]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f]">
                    <Star className="w-3 h-3 inline mr-1" /> GITHUB STARS
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center text-[#3b82f6] text-[10px] border-r-2 border-[#1e3a5f] last:border-r-0">
                      {tool.githubStars ? `${(tool.githubStars / 1000).toFixed(0)}K` : "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-t-2 border-[#1e3a5f] bg-[#0a1628]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f]">
                    CATEGORY
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center text-[#3b82f6] text-[10px] border-r-2 border-[#1e3a5f] last:border-r-0">
                      {tool.category?.icon} {tool.category?.name}
                    </td>
                  ))}
                </tr>

                {/* Strengths */}
                <tr className="border-t-2 border-[#1e3a5f]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f] align-top">
                    <CheckCircle className="w-3 h-3 inline mr-1" /> STRENGTHS
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-[#1e3a5f] last:border-r-0 align-top">
                      <ul className="space-y-1">
                        {tool.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="text-[#3b82f6] text-[8px] flex items-start gap-1">
                            <span className="text-[#60a5fa]">+</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Weaknesses */}
                <tr className="border-t-2 border-[#1e3a5f] bg-[#0a1628]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f] align-top">
                    <AlertTriangle className="w-3 h-3 inline mr-1" /> WEAKNESSES
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-[#1e3a5f] last:border-r-0 align-top">
                      <ul className="space-y-1">
                        {tool.cons.slice(0, 3).map((con, i) => (
                          <li key={i} className="text-[#3b82f6] text-[8px] flex items-start gap-1">
                            <span className="text-[#1e3a5f]">-</span> {con}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Best For */}
                <tr className="border-t-2 border-[#1e3a5f]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f] align-top">
                    BEST FOR
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-[#1e3a5f] last:border-r-0 align-top">
                      <ul className="space-y-1">
                        {tool.bestFor.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-[#3b82f6] text-[8px] flex items-start gap-1">
                            <ChevronRight className="w-2 h-2 mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr className="border-t-2 border-[#1e3a5f] bg-[#0a1628]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f] align-top">
                    FEATURES
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 border-r-2 border-[#1e3a5f] last:border-r-0 align-top">
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
                <tr className="border-t-2 border-[#1e3a5f]">
                  <td className="p-4 text-[#60a5fa] text-[10px] border-r-2 border-[#1e3a5f]">
                    LINKS
                  </td>
                  {validCompareTools.map((tool) => (
                    <td key={tool._id} className="p-4 text-center border-r-2 border-[#1e3a5f] last:border-r-0">
                      <div className="flex justify-center gap-2">
                        {tool.websiteUrl && (
                          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 text-[#3b82f6] hover:text-[#60a5fa]" />
                          </a>
                        )}
                        {tool.githubUrl && (
                          <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 text-[#3b82f6] hover:text-[#60a5fa]" />
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
            <Scale className="w-12 h-12 mx-auto mb-4 text-[#3b82f6]" />
            <p className="text-[#60a5fa] text-sm mb-2">SELECT TOOLS TO COMPARE</p>
            <p className="text-[#3b82f6] text-[10px] mb-4">
              ADD AT LEAST 2 TOOLS TO START COMPARING
            </p>
            <Link href="/tools">
              <PixelButton>
                <Wrench className="w-4 h-4 mr-2" /> BROWSE TOOLS
              </PixelButton>
            </Link>
          </PixelCard>
        )}
      </section>
    </div>
  );
}
