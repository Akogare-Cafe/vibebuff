"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Star,
  ChevronRight,
  Package,
  Scale,
  MessageSquare,
  Trophy,
  Flame,
  Eye,
  ThumbsUp,
  Sparkles,
  Globe,
  Swords,
} from "lucide-react";

export default function CommunityPage() {
  const popularComparisons = useQuery(api.seo.getPopularComparisons, { limit: 6 });
  const featuredTools = useQuery(api.tools.featured);
  const trendingTools = useQuery(api.popularity.getTrendingTools, { limit: 6 });

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
            <h1 className="text-primary text-xl">COMMUNITY HUB</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            DISCOVER WHAT THE DEVELOPER COMMUNITY IS EXPLORING. SEE TRENDING TOOLS, 
            POPULAR COMPARISONS, AND JOIN THE CONVERSATION.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Flame className="w-4 h-4" /> TRENDING THIS WEEK
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTools?.slice(0, 6).filter((tool): tool is NonNullable<typeof tool> => tool !== null).map((tool, index) => (
              <Link key={tool._id} href={`/tools/${tool.slug}`}>
                <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                  <PixelCardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-lg">#{index + 1}</span>
                        <div>
                          <h3 className="text-primary text-sm">{tool.name}</h3>
                          <p className="text-muted-foreground text-xs">{tool.tagline}</p>
                        </div>
                      </div>
                      <PixelBadge variant="outline" className="text-[6px]">
                        <TrendingUp className="w-2 h-2 mr-1" />
                        {tool.trendScore}
                      </PixelBadge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {tool.weeklyViews} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {tool.weeklyClicks} clicks
                      </span>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
            {!trendingTools && (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PixelCard key={i} className="h-[120px] animate-pulse">
                    <PixelCardContent className="p-4">
                      <div className="h-4 bg-card rounded w-3/4 mb-2" />
                      <div className="h-3 bg-card rounded w-1/2" />
                    </PixelCardContent>
                  </PixelCard>
                ))}
              </>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> POPULAR COMPARISONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularComparisons?.map((comparison) => (
              <Link key={comparison._id} href={`/compare/${comparison.slug}`}>
                <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                  <PixelCardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <PixelBadge variant="outline" className="text-[6px]">
                        <Eye className="w-2 h-2 mr-1" />
                        {comparison.views} views
                      </PixelBadge>
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-primary text-sm mb-2">
                      {comparison.tool1?.name} vs {comparison.tool2?.name}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {comparison.metaDescription}
                    </p>
                    <div className="mt-3 flex items-center text-muted-foreground text-xs">
                      <span>READ COMPARISON</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
            {!popularComparisons && (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PixelCard key={i} className="h-[140px] animate-pulse">
                    <PixelCardContent className="p-4">
                      <div className="h-4 bg-card rounded w-3/4 mb-2" />
                      <div className="h-3 bg-card rounded w-full mb-2" />
                      <div className="h-3 bg-card rounded w-1/2" />
                    </PixelCardContent>
                  </PixelCard>
                ))}
              </>
            )}
          </div>
          <div className="text-center mt-6">
            <Link href="/compare">
              <PixelButton variant="outline">
                <Scale className="w-4 h-4 mr-2" /> VIEW ALL COMPARISONS
              </PixelButton>
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Star className="w-4 h-4" /> LEGENDARY TOOLS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools?.slice(0, 6).map((tool) => (
              <Link key={tool._id} href={`/tools/${tool.slug}`}>
                <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer" rarity="rare">
                  <PixelCardHeader>
                    <div className="flex items-start justify-between">
                      <PixelCardTitle className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {tool.name}
                      </PixelCardTitle>
                      <PixelBadge variant="default">
                        {tool.pricingModel === "free" ? "FREE" : 
                         tool.pricingModel === "freemium" ? "FREEMIUM" : 
                         tool.pricingModel === "open_source" ? "OSS" : "PAID"}
                      </PixelBadge>
                    </div>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <p className="text-muted-foreground text-xs mb-3">{tool.tagline}</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <PixelBadge key={tag} variant="outline" className="text-[6px]">
                          {tag}
                        </PixelBadge>
                      ))}
                    </div>
                    {tool.githubStars && (
                      <p className="text-sm text-primary mt-3 flex items-center gap-1">
                        <Star className="w-3 h-3" /> {(tool.githubStars / 1000).toFixed(0)}K Stars
                      </p>
                    )}
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/tools">
              <PixelButton variant="outline">
                <Package className="w-4 h-4 mr-2" /> BROWSE ALL TOOLS
              </PixelButton>
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> COMMUNITY STATS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PixelCard className="text-center p-6">
              <Package className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-primary text-2xl font-bold mb-1">500+</p>
              <p className="text-muted-foreground text-xs">DEVELOPER TOOLS</p>
            </PixelCard>
            <PixelCard className="text-center p-6">
              <Scale className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-primary text-2xl font-bold mb-1">100+</p>
              <p className="text-muted-foreground text-xs">COMPARISONS</p>
            </PixelCard>
            <PixelCard className="text-center p-6">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-primary text-2xl font-bold mb-1">15+</p>
              <p className="text-muted-foreground text-xs">CATEGORIES</p>
            </PixelCard>
            <PixelCard className="text-center p-6">
              <Globe className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-primary text-2xl font-bold mb-1">2025</p>
              <p className="text-muted-foreground text-xs">UPDATED</p>
            </PixelCard>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> GET INVOLVED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/quest">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer h-full">
                <Swords className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-primary text-sm mb-2">START YOUR QUEST</h3>
                <p className="text-muted-foreground text-xs">
                  Get AI-powered tech stack recommendations tailored to your project needs.
                </p>
              </PixelCard>
            </Link>
            <Link href="/blog">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer h-full">
                <MessageSquare className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-primary text-sm mb-2">READ THE BLOG</h3>
                <p className="text-muted-foreground text-xs">
                  Expert guides, tutorials, and insights on choosing the right tech stack.
                </p>
              </PixelCard>
            </Link>
            <Link href="/contact">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer h-full">
                <Users className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-primary text-sm mb-2">SUGGEST A TOOL</h3>
                <p className="text-muted-foreground text-xs">
                  Know a great tool we&apos;re missing? Let us know and we&apos;ll add it to our database.
                </p>
              </PixelCard>
            </Link>
          </div>
        </section>

        <section className="border-4 border-primary bg-card p-8 text-center">
          <h2 className="text-primary text-sm mb-4">JOIN THE VIBEBUFF COMMUNITY</h2>
          <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
            Stay updated with the latest developer tools, framework comparisons, and tech stack recommendations.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/quest">
              <PixelButton>
                <Swords className="w-4 h-4 mr-2" /> START QUEST
              </PixelButton>
            </Link>
            <Link href="/tools">
              <PixelButton variant="outline">
                <Package className="w-4 h-4 mr-2" /> BROWSE TOOLS
              </PixelButton>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
