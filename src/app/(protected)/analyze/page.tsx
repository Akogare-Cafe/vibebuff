"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Upload,
  FileJson,
  Star,
  Download,
  Unlock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Heart,
  Layers,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Activity,
  BarChart3,
  Plus,
  ExternalLink,
} from "lucide-react";

interface AnalysisResult {
  score: number;
  grade: string;
  matchedTools: Array<{
    _id: string;
    name: string;
    slug: string;
    tagline: string;
    logoUrl?: string;
    pricingModel: string;
    githubStars?: number;
    npmDownloadsWeekly?: number;
    isOpenSource: boolean;
    isFeatured: boolean;
    categoryName?: string;
    packageName: string;
  }>;
  unmatchedPackages: string[];
  stats: {
    totalDependencies: number;
    matchedCount: number;
    unmatchedCount: number;
    openSourceCount: number;
    featuredCount: number;
    categoryBreakdown: Record<string, number>;
    healthScore: number;
    modernityScore: number;
    popularityScore: number;
  };
  recommendations: string[];
}

const GRADE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  S: { bg: "bg-yellow-500", text: "text-yellow-500", glow: "shadow-[0_0_20px_rgba(234,179,8,0.5)]" },
  A: { bg: "bg-green-500", text: "text-green-500", glow: "shadow-[0_0_20px_rgba(34,197,94,0.5)]" },
  B: { bg: "bg-blue-500", text: "text-blue-500", glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]" },
  C: { bg: "bg-orange-500", text: "text-orange-500", glow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]" },
  D: { bg: "bg-red-400", text: "text-red-400", glow: "shadow-[0_0_20px_rgba(248,113,113,0.5)]" },
  F: { bg: "bg-red-600", text: "text-red-600", glow: "shadow-[0_0_20px_rgba(220,38,38,0.5)]" },
};

export default function AnalyzePage() {
  const { user } = useUser();
  const [packageJsonContent, setPackageJsonContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTool, setCopiedTool] = useState<string | null>(null);
  const [addingToFavorites, setAddingToFavorites] = useState<Set<string>>(new Set());
  const [favoritedTools, setFavoritedTools] = useState<Set<string>>(new Set());

  const analyzePackageJson = useAction(api.packageAnalyzer.analyzePackageJson);
  const toggleFavorite = useMutation(api.toolUsage.toggleFavorite);
  const createDeck = useMutation(api.decks.createDeck);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setPackageJsonContent(content);
        setError(null);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!packageJsonContent.trim()) {
      setError("Please paste or upload a package.json file");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzePackageJson({
        packageJsonContent,
        userId: user?.id,
      });
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze package.json");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToFavorites = async (toolId: string) => {
    if (!user?.id) return;
    
    setAddingToFavorites((prev) => new Set(prev).add(toolId));
    try {
      await toggleFavorite({ userId: user.id, toolId: toolId as Id<"tools"> });
      setFavoritedTools((prev) => new Set(prev).add(toolId));
    } catch (err) {
      console.error("Failed to add to favorites:", err);
    } finally {
      setAddingToFavorites((prev) => {
        const next = new Set(prev);
        next.delete(toolId);
        return next;
      });
    }
  };

  const handleCreateDeck = async () => {
    if (!user?.id || !result) return;

    try {
      const toolIds = result.matchedTools.map((t) => t._id as Id<"tools">);
      await createDeck({
        name: "Imported from package.json",
        description: `Stack imported from package.json analysis. Score: ${result.score}/100 (${result.grade})`,
        toolIds,
        isPublic: false,
      });
      alert("Deck created successfully! Check your profile to view it.");
    } catch (err) {
      console.error("Failed to create deck:", err);
      alert("Failed to create deck. Please try again.");
    }
  };

  const handleCopyPackageName = (packageName: string) => {
    navigator.clipboard.writeText(packageName);
    setCopiedTool(packageName);
    setTimeout(() => setCopiedTool(null), 2000);
  };

  const gradeColors = result ? GRADE_COLORS[result.grade] || GRADE_COLORS.F : null;

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="STACK ANALYZER"
        description="Upload or paste your package.json to get a detailed analysis of your tech stack, including scores, recommendations, and the ability to save tools to your deck."
        icon={BarChart3}
        badge="Package.json"
      />

        {!result && (
          <PixelCard className="max-w-2xl mx-auto mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> IMPORT PACKAGE.JSON
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-primary text-sm mb-2">DROP YOUR PACKAGE.JSON HERE</p>
                    <p className="text-muted-foreground text-xs">or click to browse</p>
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs">OR PASTE JSON</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <textarea
                  value={packageJsonContent}
                  onChange={(e) => {
                    setPackageJsonContent(e.target.value);
                    setError(null);
                  }}
                  placeholder='{"name": "my-project", "dependencies": {...}}'
                  className="w-full h-48 p-4 bg-background border border-border rounded-lg text-foreground text-sm font-mono resize-none focus:outline-none focus:border-primary"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <PixelButton
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !packageJsonContent.trim()}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-pulse" /> ANALYZING...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" /> ANALYZE STACK
                    </>
                  )}
                </PixelButton>
              </div>
            </PixelCardContent>
          </PixelCard>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <PixelButton variant="outline" onClick={() => setResult(null)}>
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> ANALYZE ANOTHER
                </PixelButton>
                <div className="flex gap-2">
                  {user && (
                    <>
                      <PixelButton variant="outline" onClick={handleCreateDeck}>
                        <Layers className="w-4 h-4 mr-2" /> SAVE AS DECK
                      </PixelButton>
                      <Link href="/">
                        <PixelButton>
                          <Sparkles className="w-4 h-4 mr-2" /> AI STACK BUILDER
                        </PixelButton>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PixelCard className={`lg:col-span-1 ${gradeColors?.glow}`}>
                  <PixelCardContent className="p-8 text-center">
                    <div className={`w-24 h-24 mx-auto mb-4 rounded-lg ${gradeColors?.bg} flex items-center justify-center`}>
                      <span className="text-5xl font-bold text-black">{result.grade}</span>
                    </div>
                    <p className="text-primary text-2xl mb-2">{result.score}/100</p>
                    <p className="text-muted-foreground text-xs uppercase">OVERALL SCORE</p>

                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Health</span>
                        <span className="text-primary">{result.stats.healthScore}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${result.stats.healthScore}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Modernity</span>
                        <span className="text-primary">{result.stats.modernityScore}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${result.stats.modernityScore}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Popularity</span>
                        <span className="text-primary">{result.stats.popularityScore}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${result.stats.popularityScore}%` }}
                        />
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>

                <PixelCard className="lg:col-span-2">
                  <PixelCardHeader>
                    <PixelCardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> STACK STATISTICS
                    </PixelCardTitle>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <p className="text-primary text-2xl">{result.stats.totalDependencies}</p>
                        <p className="text-muted-foreground text-xs">TOTAL DEPS</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <p className="text-green-500 text-2xl">{result.stats.matchedCount}</p>
                        <p className="text-muted-foreground text-xs">MATCHED</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <p className="text-primary text-2xl">{result.stats.openSourceCount}</p>
                        <p className="text-muted-foreground text-xs">OPEN SOURCE</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <p className="text-yellow-500 text-2xl">{result.stats.featuredCount}</p>
                        <p className="text-muted-foreground text-xs">FEATURED</p>
                      </div>
                    </div>

                    <h4 className="text-primary text-sm mb-3">CATEGORY BREAKDOWN</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.stats.categoryBreakdown).map(([category, count]) => (
                        <PixelBadge key={category} variant="outline">
                          {category}: {count}
                        </PixelBadge>
                      ))}
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </div>

              {result.recommendations.length > 0 && (
                <PixelCard>
                  <PixelCardHeader>
                    <PixelCardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4" /> RECOMMENDATIONS
                    </PixelCardTitle>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </PixelCardContent>
                </PixelCard>
              )}

              <PixelCard>
                <PixelCardHeader>
                  <div className="flex items-center justify-between">
                    <PixelCardTitle className="flex items-center gap-2">
                      <Package className="w-4 h-4" /> MATCHED TOOLS ({result.matchedTools.length})
                    </PixelCardTitle>
                    {user && (
                      <PixelButton size="sm" variant="outline" onClick={handleCreateDeck}>
                        <Plus className="w-3 h-3 mr-1" /> ADD ALL TO DECK
                      </PixelButton>
                    )}
                  </div>
                </PixelCardHeader>
                <PixelCardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.matchedTools.map((tool) => (
                      <div
                        key={tool._id}
                        className="p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded border border-border bg-card flex items-center justify-center shrink-0 overflow-hidden">
                            {tool.logoUrl ? (
                              <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <Package className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/tools/${tool.slug}`} className="text-primary text-sm font-medium hover:underline truncate">
                                {tool.name}
                              </Link>
                              {tool.isFeatured && <Star className="w-3 h-3 text-yellow-500 shrink-0" />}
                            </div>
                            <p className="text-muted-foreground text-xs truncate">{tool.tagline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {tool.githubStars && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {tool.githubStars >= 1000 ? `${(tool.githubStars / 1000).toFixed(1)}K` : tool.githubStars}
                                </span>
                              )}
                              {tool.isOpenSource && (
                                <PixelBadge variant="secondary" className="text-[8px] px-1 py-0">
                                  <Unlock className="w-2 h-2 mr-0.5" /> OSS
                                </PixelBadge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                          <button
                            onClick={() => handleCopyPackageName(tool.packageName)}
                            className="flex-1 text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 py-1"
                          >
                            {copiedTool === tool.packageName ? (
                              <><Check className="w-3 h-3" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> {tool.packageName}</>
                            )}
                          </button>
                          {user && (
                            <button
                              onClick={() => handleAddToFavorites(tool._id)}
                              disabled={addingToFavorites.has(tool._id) || favoritedTools.has(tool._id)}
                              className="p-1 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Heart className={`w-4 h-4 ${favoritedTools.has(tool._id) ? "fill-red-400 text-red-400" : ""}`} />
                            </button>
                          )}
                          <Link href={`/tools/${tool.slug}`} className="p-1 hover:text-primary transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </PixelCardContent>
              </PixelCard>

              {result.unmatchedPackages.length > 0 && (
                <PixelCard>
                  <PixelCardHeader>
                    <PixelCardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> UNMATCHED PACKAGES ({result.unmatchedPackages.length})
                    </PixelCardTitle>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <p className="text-muted-foreground text-xs mb-3">
                      These packages are not in our database yet. They may be internal packages, less common tools, or utility libraries.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.unmatchedPackages.slice(0, 30).map((pkg) => (
                        <PixelBadge key={pkg} variant="outline" className="text-xs">
                          {pkg}
                        </PixelBadge>
                      ))}
                      {result.unmatchedPackages.length > 30 && (
                        <PixelBadge variant="outline" className="text-xs">
                          +{result.unmatchedPackages.length - 30} more
                        </PixelBadge>
                      )}
                    </div>
                  </PixelCardContent>
                </PixelCard>
              )}

              {!user && (
                <PixelCard className="border-primary/50">
                  <PixelCardContent className="p-6 text-center">
                    <Shield className="w-10 h-10 mx-auto mb-4 text-primary" />
                    <h3 className="text-primary text-lg mb-2">SIGN IN TO SAVE</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Create an account to save your analysis, add tools to your deck, and get personalized recommendations.
                    </p>
                    <Link href="/sign-in">
                      <PixelButton>
                        <ArrowRight className="w-4 h-4 mr-2" /> SIGN IN
                      </PixelButton>
                    </Link>
                  </PixelCardContent>
                </PixelCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
    </PageLayout>
  );
}
