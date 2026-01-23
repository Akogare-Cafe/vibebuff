"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { CommunityStackSubmission } from "@/components/community-stack-submission";
import { PageHeader } from "@/components/page-header";
import { PageLayout, Section, Grid } from "@/components/page-layout";
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
  Search,
  Crown,
  Building2,
  UserPlus,
  Medal,
  Zap,
  Layers,
} from "lucide-react";

export default function CommunityPage() {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"discover" | "leaderboards" | "groups" | "share-stacks">("discover");
  
  const popularComparisons = useQuery(api.seo.getPopularComparisons, { limit: 6 });
  const featuredTools = useQuery(api.tools.featured);
  const trendingTools = useQuery(api.popularity.getTrendingTools, { limit: 6 });
  const xpLeaderboard = useQuery(api.leaderboards.getXpLeaderboard, { limit: 10 });
  const popularGroups = useQuery(api.groups.getPopular, { limit: 6 });
  const userSearchResults = useQuery(
    api.friends.searchUsers,
    userSearchQuery.length > 1 ? { query: userSearchQuery, limit: 8 } : "skip"
  );

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="COMMUNITY HUB"
        description="Connect with developers, join groups, compete on leaderboards, and discover trending tools."
        icon={Users}
      />

        <Section>
          <div className="flex justify-center gap-2">
            <PixelButton
              variant={activeTab === "discover" ? "default" : "outline"}
              onClick={() => setActiveTab("discover")}
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Discover
            </PixelButton>
            <PixelButton
              variant={activeTab === "leaderboards" ? "default" : "outline"}
              onClick={() => setActiveTab("leaderboards")}
              size="sm"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboards
            </PixelButton>
            <PixelButton
              variant={activeTab === "groups" ? "default" : "outline"}
              onClick={() => setActiveTab("groups")}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Groups
            </PixelButton>
            <PixelButton
              variant={activeTab === "share-stacks" ? "default" : "outline"}
              onClick={() => setActiveTab("share-stacks")}
              size="sm"
            >
              <Layers className="w-4 h-4 mr-2" />
              Share Stacks
            </PixelButton>
          </div>
        </Section>

        <Section>
          <div className="max-w-md mx-auto relative">
            <PixelInput
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {userSearchResults && userSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-border bg-card rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {userSearchResults.map((user) => (
                  <Link
                    key={user.clerkId}
                    href={`/users/${user.clerkId}`}
                    onClick={() => setUserSearchQuery("")}
                    className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username || ""} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{user.username || "Unknown"}</p>
                      <p className="text-muted-foreground text-xs">Level {user.level} - {user.title || "Adventurer"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Section>

        {activeTab === "leaderboards" && (
          <Section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary text-lg flex items-center gap-2">
                <Crown className="w-5 h-5" /> TOP ADVENTURERS
              </h2>
              <Link href="/leaderboards">
                <PixelButton variant="outline" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </PixelButton>
              </Link>
            </div>
            <PixelCard>
              <PixelCardContent className="p-0">
                <div className="divide-y divide-border">
                  {xpLeaderboard?.map((user, index) => (
                    <Link key={user.clerkId} href={`/users/${user.clerkId}`}>
                      <div className="flex items-center gap-4 p-4 hover:bg-secondary transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? "bg-yellow-500 text-black" :
                          index === 1 ? "bg-gray-400 text-black" :
                          index === 2 ? "bg-orange-600 text-white" :
                          "bg-card text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username || ""} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate">{user.username || "Unknown"}</p>
                          <p className="text-muted-foreground text-xs">{user.title || "Adventurer"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold">{user.xp.toLocaleString()} XP</p>
                          <p className="text-muted-foreground text-xs">Level {user.level}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {!xpLeaderboard && (
                    <div className="p-8 text-center">
                      <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Loading leaderboard...</p>
                    </div>
                  )}
                </div>
              </PixelCardContent>
            </PixelCard>
          </Section>
        )}

        {activeTab === "share-stacks" && (
          <Section>
            <CommunityStackSubmission />
          </Section>
        )}

        {activeTab === "groups" && (
          <Section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary text-lg flex items-center gap-2">
                <Users className="w-5 h-5" /> POPULAR GROUPS
              </h2>
              <div className="flex gap-2">
                <Link href="/groups/new">
                  <PixelButton size="sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Create Group
                  </PixelButton>
                </Link>
                <Link href="/groups">
                  <PixelButton variant="outline" size="sm">
                    Browse All <ChevronRight className="w-4 h-4 ml-1" />
                  </PixelButton>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularGroups?.map((group) => (
                <Link key={group._id} href={`/groups/${group.slug}`}>
                  <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                    <PixelCardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {group.avatarUrl ? (
                            <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-foreground font-medium truncate">{group.name}</h3>
                            {group.isVerified && (
                              <Medal className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                            {group.description || "No description"}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {group.memberCount}
                            </span>
                            <PixelBadge variant="outline" className="text-[10px]">
                              {group.groupType}
                            </PixelBadge>
                          </div>
                        </div>
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
              {!popularGroups && (
                <>
                  {[1, 2, 3].map((i) => (
                    <PixelCard key={i} className="h-[120px] animate-pulse">
                      <PixelCardContent className="p-4">
                        <div className="h-4 bg-card rounded w-3/4 mb-2" />
                        <div className="h-3 bg-card rounded w-1/2" />
                      </PixelCardContent>
                    </PixelCard>
                  ))}
                </>
              )}
              {popularGroups?.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No groups yet. Be the first to create one!</p>
                  <Link href="/groups/new">
                    <PixelButton className="mt-4" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" /> Create Group
                    </PixelButton>
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-primary text-sm mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> COMPANIES & TEAMS
              </h3>
              <PixelCard className="p-6 text-center">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground text-sm mb-4">
                  Create a company profile to share your tech stack with your team
                </p>
                <Link href="/companies/new">
                  <PixelButton size="sm">
                    <Building2 className="w-4 h-4 mr-2" /> Create Company
                  </PixelButton>
                </Link>
              </PixelCard>
            </div>
          </Section>
        )}

        {activeTab === "discover" && (
          <>
            <Section>
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
                      <PixelBadge variant="outline" className="text-xs">
                        <TrendingUp className="w-4 h-4 mr-1" />
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
        </Section>

        <Section>
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> POPULAR COMPARISONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularComparisons?.map((comparison) => (
              <Link key={comparison._id} href={`/compare/${comparison.slug}`}>
                <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                  <PixelCardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <PixelBadge variant="outline" className="text-[10px]">
                        <Eye className="w-3 h-3 mr-1" />
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
            <Link href="/comparisons">
              <PixelButton variant="outline">
                <Scale className="w-4 h-4 mr-2" /> VIEW ALL COMPARISONS
              </PixelButton>
            </Link>
          </div>
        </Section>

        <Section>
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
                        <PixelBadge key={tag} variant="outline" className="text-[10px]">
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
        </Section>

        <Section>
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
        </Section>

        <Section>
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> GET INVOLVED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer h-full">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-primary text-sm mb-2">AI STACK BUILDER</h3>
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
        </Section>

        <Section>
          <h2 className="text-primary text-sm mb-4">JOIN THE VIBEBUFF COMMUNITY</h2>
          <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
            Stay updated with the latest developer tools, framework comparisons, and tech stack recommendations.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <PixelButton>
                <Sparkles className="w-4 h-4 mr-2" /> AI STACK BUILDER
              </PixelButton>
            </Link>
            <Link href="/tools">
              <PixelButton variant="outline">
                <Package className="w-4 h-4 mr-2" /> BROWSE TOOLS
              </PixelButton>
            </Link>
          </div>
        </Section>
          </>
        )}
    </PageLayout>
  );
}
