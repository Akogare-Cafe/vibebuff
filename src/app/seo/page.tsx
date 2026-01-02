"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Search,
  Zap,
  FileText,
  BarChart3,
  Image,
  Link2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Scale,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";

export default function SEODashboardPage() {
  const [activeTab, setActiveTab] = useState<"comparisons" | "keywords" | "content" | "blog">("comparisons");
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const comparisons = useQuery(api.seo.listComparisons, { limit: 20 });
  const keywordClusters = useQuery(api.seo.getKeywordClusters, {});
  const blogOutlines = useQuery(api.seo.getBlogOutlines, {});
  const toolPairs = useQuery(api.seo.getAllToolPairs, {});

  const generateComparison = useAction(api.seo.generateAIComparison);
  const generateBulkComparisons = useAction(api.seo.generateBulkComparisons);

  const handleGenerateComparison = async (tool1Slug: string, tool2Slug: string) => {
    setGenerating(true);
    try {
      await generateComparison({ tool1Slug, tool2Slug });
    } catch (error) {
      console.error("Failed to generate comparison:", error);
    }
    setGenerating(false);
  };

  const handleBulkGenerate = async () => {
    setGenerating(true);
    try {
      await generateBulkComparisons({ limit: 5 });
    } catch (error) {
      console.error("Failed to generate bulk comparisons:", error);
    }
    setGenerating(false);
  };

  const existingComparisonSlugs = new Set(comparisons?.map((c) => c.slug) || []);
  const missingComparisons = toolPairs?.filter((p) => !existingComparisonSlugs.has(p.slug)) || [];

  return (
    <div className="min-h-screen bg-[#000000]">
      <section className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-[#60a5fa] text-lg mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> AI SEO DASHBOARD
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
            MANAGE AI-GENERATED SEO CONTENT FOR VIBEBUFF
          </p>
        </header>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <PixelButton
            variant={activeTab === "comparisons" ? "default" : "outline"}
            onClick={() => setActiveTab("comparisons")}
          >
            <Scale className="w-4 h-4 mr-1" /> COMPARISONS
          </PixelButton>
          <PixelButton
            variant={activeTab === "keywords" ? "default" : "outline"}
            onClick={() => setActiveTab("keywords")}
          >
            <Target className="w-4 h-4 mr-1" /> KEYWORDS
          </PixelButton>
          <PixelButton
            variant={activeTab === "content" ? "default" : "outline"}
            onClick={() => setActiveTab("content")}
          >
            <BarChart3 className="w-4 h-4 mr-1" /> CONTENT SCORES
          </PixelButton>
          <PixelButton
            variant={activeTab === "blog" ? "default" : "outline"}
            onClick={() => setActiveTab("blog")}
          >
            <BookOpen className="w-4 h-4 mr-1" /> BLOG OUTLINES
          </PixelButton>
        </div>

        {activeTab === "comparisons" && (
          <div className="space-y-6">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" /> GENERATE COMPARISONS
                  </span>
                  <PixelButton
                    onClick={handleBulkGenerate}
                    disabled={generating}
                    size="sm"
                  >
                    {generating ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    GENERATE 5 NEW
                  </PixelButton>
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <p className="text-[#3b82f6] text-[8px] mb-4">
                  {missingComparisons.length} TOOL PAIRS AVAILABLE FOR COMPARISON GENERATION
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {missingComparisons.slice(0, 12).map((pair) => (
                    <div
                      key={pair.slug}
                      className="border-2 border-[#1e3a5f] p-2 flex items-center justify-between"
                    >
                      <span className="text-[#3b82f6] text-[8px]">
                        {pair.tool1.name} vs {pair.tool2.name}
                      </span>
                      <PixelButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateComparison(pair.tool1.slug, pair.tool2.slug)}
                        disabled={generating}
                      >
                        <Zap className="w-2 h-2" />
                      </PixelButton>
                    </div>
                  ))}
                </div>
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> EXISTING COMPARISONS ({comparisons?.length || 0})
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                {comparisons && comparisons.length > 0 ? (
                  <div className="space-y-2">
                    {comparisons.map((comparison) => (
                      <Link
                        key={comparison._id}
                        href={`/compare/${comparison.slug}`}
                        className="block border-2 border-[#1e3a5f] p-3 hover:border-[#3b82f6] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[#60a5fa] text-[10px]">{comparison.title}</p>
                            <p className="text-[#3b82f6] text-[8px]">
                              {comparison.tool1?.name} vs {comparison.tool2?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PixelBadge variant="outline" className="text-[6px]">
                              <Eye className="w-2 h-2 mr-1" />
                              {comparison.views}
                            </PixelBadge>
                            <PixelBadge variant="default" className="text-[6px]">
                              {comparison.comparisonPoints.length} POINTS
                            </PixelBadge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#3b82f6] text-[10px] text-center py-8">
                    NO COMPARISONS GENERATED YET. CLICK GENERATE TO CREATE SOME.
                  </p>
                )}
              </PixelCardContent>
            </PixelCard>
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="space-y-6">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" /> KEYWORD CLUSTERS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                {keywordClusters && keywordClusters.length > 0 ? (
                  <div className="space-y-4">
                    {keywordClusters.map((cluster) => (
                      <div key={cluster._id} className="border-2 border-[#1e3a5f] p-4">
                        <h3 className="text-[#60a5fa] text-[10px] mb-2">
                          {cluster.primaryKeyword}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {cluster.relatedKeywords.slice(0, 8).map((kw, i) => (
                            <PixelBadge key={i} variant="outline" className="text-[6px]">
                              {kw.keyword}
                            </PixelBadge>
                          ))}
                        </div>
                        <p className="text-[#3b82f6] text-[8px]">
                          {cluster.suggestedContent.length} CONTENT SUGGESTIONS
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-8 h-8 mx-auto mb-4 text-[#3b82f6]" />
                    <p className="text-[#3b82f6] text-[10px]">
                      NO KEYWORD CLUSTERS YET
                    </p>
                    <p className="text-[#1e3a5f] text-[8px]">
                      KEYWORD CLUSTERS HELP ORGANIZE CONTENT AROUND TOPICS
                    </p>
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> TARGET KEYWORDS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[#60a5fa] text-[8px] mb-2">PRIMARY KEYWORDS</h4>
                    <div className="space-y-1">
                      {[
                        "tech stack builder",
                        "best tech stack 2025",
                        "developer tools comparison",
                        "AI tech stack recommendations",
                        "framework comparison",
                      ].map((kw) => (
                        <div key={kw} className="flex items-center gap-2">
                          <CheckCircle className="w-2 h-2 text-[#60a5fa]" />
                          <span className="text-[#3b82f6] text-[8px]">{kw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#60a5fa] text-[8px] mb-2">LONG-TAIL KEYWORDS</h4>
                    <div className="space-y-1">
                      {[
                        "how to choose tech stack for saas",
                        "best frontend framework for beginners",
                        "which database should i use",
                        "ai tools for software developers 2025",
                        "next.js vs remix comparison",
                      ].map((kw) => (
                        <div key={kw} className="flex items-center gap-2">
                          <TrendingUp className="w-2 h-2 text-[#3b82f6]" />
                          <span className="text-[#3b82f6] text-[8px]">{kw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> CONTENT OPTIMIZATION SCORES
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 mx-auto mb-4 text-[#3b82f6]" />
                  <p className="text-[#60a5fa] text-[10px] mb-2">
                    CONTENT SCORING SYSTEM
                  </p>
                  <p className="text-[#3b82f6] text-[8px] max-w-md mx-auto">
                    ANALYZE YOUR CONTENT FOR SEO BEST PRACTICES INCLUDING KEYWORD DENSITY,
                    READABILITY, STRUCTURE, AND INTERNAL LINKING.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mt-6">
                  <div className="border-2 border-[#1e3a5f] p-4 text-center">
                    <p className="text-[#60a5fa] text-lg">85</p>
                    <p className="text-[#3b82f6] text-[8px]">KEYWORD SCORE</p>
                  </div>
                  <div className="border-2 border-[#1e3a5f] p-4 text-center">
                    <p className="text-[#60a5fa] text-lg">72</p>
                    <p className="text-[#3b82f6] text-[8px]">READABILITY</p>
                  </div>
                  <div className="border-2 border-[#1e3a5f] p-4 text-center">
                    <p className="text-[#60a5fa] text-lg">90</p>
                    <p className="text-[#3b82f6] text-[8px]">STRUCTURE</p>
                  </div>
                  <div className="border-2 border-[#1e3a5f] p-4 text-center">
                    <p className="text-[#60a5fa] text-lg">65</p>
                    <p className="text-[#3b82f6] text-[8px]">INTERNAL LINKS</p>
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> OPTIMIZATION SUGGESTIONS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 border-2 border-[#1e3a5f] p-3">
                    <PixelBadge variant="default" className="text-[6px] shrink-0">HIGH</PixelBadge>
                    <div>
                      <p className="text-[#60a5fa] text-[10px]">Add more internal links</p>
                      <p className="text-[#3b82f6] text-[8px]">
                        Link to related tool pages and comparisons to improve site structure
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-2 border-[#1e3a5f] p-3">
                    <PixelBadge variant="outline" className="text-[6px] shrink-0">MEDIUM</PixelBadge>
                    <div>
                      <p className="text-[#60a5fa] text-[10px]">Improve meta descriptions</p>
                      <p className="text-[#3b82f6] text-[8px]">
                        Some pages have generic meta descriptions that could be more keyword-rich
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-2 border-[#1e3a5f] p-3">
                    <PixelBadge variant="outline" className="text-[6px] shrink-0">LOW</PixelBadge>
                    <div>
                      <p className="text-[#60a5fa] text-[10px]">Add alt text to images</p>
                      <p className="text-[#3b82f6] text-[8px]">
                        Tool logos should have descriptive alt text for accessibility and SEO
                      </p>
                    </div>
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>
        )}

        {activeTab === "blog" && (
          <div className="space-y-6">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> AI BLOG OUTLINES
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                {blogOutlines && blogOutlines.length > 0 ? (
                  <div className="space-y-4">
                    {blogOutlines.map((outline) => (
                      <div key={outline._id} className="border-2 border-[#1e3a5f] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[#60a5fa] text-[10px]">{outline.title}</h3>
                          <PixelBadge
                            variant={outline.status === "published" ? "default" : "outline"}
                            className="text-[6px]"
                          >
                            {outline.status.toUpperCase()}
                          </PixelBadge>
                        </div>
                        <p className="text-[#3b82f6] text-[8px] mb-2">
                          Target: {outline.targetKeyword}
                        </p>
                        <div className="flex items-center gap-4 text-[#1e3a5f] text-[8px]">
                          <span>{outline.outline.length} SECTIONS</span>
                          <span>{outline.estimatedWordCount} WORDS</span>
                          <span>{outline.difficulty.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-8 h-8 mx-auto mb-4 text-[#3b82f6]" />
                    <p className="text-[#60a5fa] text-[10px] mb-2">
                      NO BLOG OUTLINES YET
                    </p>
                    <p className="text-[#3b82f6] text-[8px]">
                      AI-GENERATED BLOG OUTLINES HELP YOU CREATE SEO-OPTIMIZED CONTENT
                    </p>
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> INTERNAL LINKING SUGGESTIONS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="space-y-3">
                  <div className="border-2 border-[#1e3a5f] p-3">
                    <p className="text-[#60a5fa] text-[10px] mb-1">Blog: Best React Frameworks 2025</p>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-2 h-2 text-[#3b82f6]" />
                      <span className="text-[#3b82f6] text-[8px]">
                        Link to: /compare/nextjs-vs-remix, /tools/react, /tools/nextjs
                      </span>
                    </div>
                  </div>
                  <div className="border-2 border-[#1e3a5f] p-3">
                    <p className="text-[#60a5fa] text-[10px] mb-1">Blog: Choosing Database for Startup</p>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-2 h-2 text-[#3b82f6]" />
                      <span className="text-[#3b82f6] text-[8px]">
                        Link to: /compare/postgresql-vs-mongodb, /tools/supabase, /tools/planetscale
                      </span>
                    </div>
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>
        )}
      </section>
    </div>
  );
}
