"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardDescription, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight,
  Star, 
  TrendingUp, 
  Users, 
  CheckCircle,
  XCircle,
  ExternalLink,
  Shuffle
} from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AlternativesPage() {
  const params = useParams();
  const toolSlug = params.tool as string;

  const toolData = useQuery(api.tools.getBySlug, { slug: toolSlug });
  const tool = toolData ? { ...toolData, icon: (toolData as { icon?: string }).icon } : null;
  const allTools = useQuery(api.tools.list, { limit: 100 });

  const alternatives = allTools?.filter(t => 
    t.slug !== toolSlug && 
    tool?.categoryId && 
    t.categoryId === tool.categoryId
  ).map(t => ({ ...t, icon: (t as { icon?: string }).icon }))
  .sort((a, b) => {
    const aScore = (a.githubStars || 0) + (a.stats?.speed || 50) * 100;
    const bScore = (b.githubStars || 0) + (b.stats?.speed || 50) * 100;
    return bScore - aScore;
  });

  const toolName = tool?.name || formatSlug(toolSlug);
  const pageTitle = `Best ${toolName} Alternatives in 2025`;

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Link href="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tools</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-muted-foreground">Loading alternatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <PixelBadge variant="secondary">
              <Shuffle className="w-3 h-3 mr-1" />
              Alternatives
            </PixelBadge>
          </div>
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Looking for alternatives to {toolName}? We&apos;ve compiled the best options 
            based on features, pricing, and community feedback.
          </p>
        </div>

        <section className="mb-12">
          <PixelCard className="border-primary/50">
            <PixelCardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <DynamicIcon name={tool.icon || "Package"} className="w-8 h-8" />
                </div>
                <div>
                  <PixelCardTitle className="text-2xl">{tool.name}</PixelCardTitle>
                  <PixelCardDescription className="text-base">{tool.tagline}</PixelCardDescription>
                </div>
              </div>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {tool.pros.slice(0, 4).map((pro, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Limitations
                  </h4>
                  <ul className="space-y-2">
                    {tool.cons.slice(0, 4).map((con, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <XCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tool.githubStars ? `${(tool.githubStars / 1000).toFixed(1)}K stars` : "Active community"}
                  </span>
                  <PixelBadge variant="outline">{tool.pricingModel.replace("_", " ")}</PixelBadge>
                </div>
                <Link href={`/tools/${tool.slug}`}>
                  <PixelButton variant="outline" size="sm">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </PixelButton>
                </Link>
              </div>
            </PixelCardContent>
          </PixelCard>
        </section>

        {alternatives && alternatives.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Top {alternatives.length} Alternatives to {toolName}
            </h2>
            <div className="grid gap-6">
              {alternatives.map((alt, index) => (
                <PixelCard key={alt._id} className="hover:border-primary/50 transition-colors">
                  <PixelCardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <DynamicIcon name={alt.icon || "Package"} className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{alt.name}</h3>
                          <PixelBadge variant="outline" className="text-xs">
                            {alt.pricingModel.replace("_", " ")}
                          </PixelBadge>
                          {index === 0 && (
                            <PixelBadge variant="default" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Top Pick
                            </PixelBadge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{alt.tagline}</p>
                        <div className="grid gap-2 md:grid-cols-2 mb-3">
                          <div>
                            <span className="text-xs font-medium text-green-600">Pros:</span>
                            <ul className="text-sm text-muted-foreground">
                              {alt.pros.slice(0, 2).map((pro, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                  <span className="truncate">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-red-600">Cons:</span>
                            <ul className="text-sm text-muted-foreground">
                              {alt.cons.slice(0, 2).map((con, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <XCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                                  <span className="truncate">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link href={`/tools/${alt.slug}`}>
                            <PixelButton variant="default" size="sm">
                              View Details
                            </PixelButton>
                          </Link>
                          <Link href={`/compare/${[tool.slug, alt.slug].sort().join("-vs-")}`}>
                            <PixelButton variant="outline" size="sm">
                              Compare with {toolName}
                            </PixelButton>
                          </Link>
                          {alt.websiteUrl && (
                            <a href={alt.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <PixelButton variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </PixelButton>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {alt.githubStars ? `${(alt.githubStars / 1000).toFixed(1)}K` : "-"}
                        </span>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle>How to Choose the Right Alternative</PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold mb-2">1. Define Your Needs</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider what features are must-haves vs nice-to-haves for your project.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Evaluate Trade-offs</h4>
                  <p className="text-sm text-muted-foreground">
                    Each tool has strengths and weaknesses. Find the best balance for your use case.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Try Before Committing</h4>
                  <p className="text-sm text-muted-foreground">
                    Most tools offer free tiers or trials. Test with a small project first.
                  </p>
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Quick Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {alternatives?.slice(0, 5).map((alt) => (
              <Link 
                key={alt._id}
                href={`/compare/${[tool.slug, alt.slug].sort().join("-vs-")}`}
              >
                <PixelBadge variant="outline" className="cursor-pointer hover:bg-muted">
                  {toolName} vs {alt.name}
                </PixelBadge>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
