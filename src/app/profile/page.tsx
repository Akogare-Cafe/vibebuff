"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Wrench,
  Star,
  Heart,
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  
  const frequentlyUsedRaw = useQuery(
    api.toolUsage.getFrequentlyUsed,
    user?.id ? { userId: user.id, limit: 6 } : "skip"
  );
  
  const favoritesRaw = useQuery(
    api.toolUsage.getFavorites,
    user?.id ? { userId: user.id } : "skip"
  );
  
  const recommendationsRaw = useQuery(
    api.toolUsage.getRecommendations,
    user?.id ? { userId: user.id, limit: 6 } : "skip"
  );

  // Filter out null values
  const frequentlyUsed = frequentlyUsedRaw?.filter((t): t is NonNullable<typeof t> => t !== null) ?? [];
  const favorites = favoritesRaw?.filter((t): t is NonNullable<typeof t> => t !== null) ?? [];
  const recommendations = recommendationsRaw?.filter((t): t is NonNullable<typeof t> => t !== null) ?? [];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <p className="text-[#60a5fa] text-sm pixel-loading">LOADING...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <PixelCard className="p-8 text-center">
          <p className="text-[#60a5fa] text-sm mb-4">LOGIN REQUIRED</p>
          <p className="text-[#3b82f6] text-[10px] mb-4">
            PLEASE LOGIN TO VIEW YOUR PROFILE
          </p>
          <Link href="/sign-in">
            <PixelButton>LOGIN</PixelButton>
          </Link>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-[#60a5fa] text-lg mb-2">
            WELCOME, {user.firstName?.toUpperCase() || "ADVENTURER"}!
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
            YOUR PERSONAL TOOL ARSENAL
          </p>
        </div>

        {/* Favorites Section */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <Heart className="w-4 h-4" /> FAVORITE TOOLS
          </h2>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((tool) => (
                <Link key={tool._id} href={`/tools/${tool.slug}`}>
                  <PixelCard className="h-full">
                    <PixelCardHeader>
                      <PixelCardTitle>{tool.name}</PixelCardTitle>
                    </PixelCardHeader>
                    <PixelCardContent>
                      <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                      <p className="text-[#60a5fa] text-[8px] mt-2">
                        USED {tool.usageCount} TIMES
                      </p>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>
          ) : (
            <PixelCard className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-4 text-[#1e3a5f]" />
              <p className="text-[#3b82f6] text-[10px]">
                NO FAVORITES YET - EXPLORE TOOLS AND MARK YOUR FAVORITES!
              </p>
            </PixelCard>
          )}
        </section>

        {/* Frequently Used Section */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> FREQUENTLY USED
          </h2>
          {frequentlyUsed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {frequentlyUsed.map((tool) => (
                <Link key={tool._id} href={`/tools/${tool.slug}`}>
                  <PixelCard className="h-full">
                    <PixelCardHeader>
                      <div className="flex items-start justify-between">
                        <PixelCardTitle>{tool.name}</PixelCardTitle>
                        <PixelBadge variant="outline">
                          {tool.usageCount}x
                        </PixelBadge>
                      </div>
                    </PixelCardHeader>
                    <PixelCardContent>
                      <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                      {tool.isFavorite && (
                        <Heart className="w-3 h-3 text-[#60a5fa] mt-2" />
                      )}
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>
          ) : (
            <PixelCard className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-4 text-[#1e3a5f]" />
              <p className="text-[#3b82f6] text-[10px]">
                START EXPLORING TOOLS TO BUILD YOUR USAGE HISTORY!
              </p>
              <Link href="/tools" className="inline-block mt-4">
                <PixelButton size="sm">
                  <Wrench className="w-3 h-3 mr-1" /> BROWSE TOOLS
                </PixelButton>
              </Link>
            </PixelCard>
          )}
        </section>

        {/* Recommendations Section */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> RECOMMENDED FOR YOU
          </h2>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((tool) => (
                <Link key={tool._id} href={`/tools/${tool.slug}`}>
                  <PixelCard className="h-full border-[#3b82f6]">
                    <PixelCardHeader>
                      <div className="flex items-start justify-between">
                        <PixelCardTitle>
                          <Star className="w-3 h-3 inline mr-1" />
                          {tool.name}
                        </PixelCardTitle>
                        <PixelBadge variant="default">NEW</PixelBadge>
                      </div>
                    </PixelCardHeader>
                    <PixelCardContent>
                      <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tool.tags.slice(0, 2).map((tag) => (
                          <PixelBadge key={tag} variant="outline" className="text-[6px]">
                            {tag}
                          </PixelBadge>
                        ))}
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>
          ) : (
            <PixelCard className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-[#1e3a5f]" />
              <p className="text-[#3b82f6] text-[10px]">
                USE MORE TOOLS TO GET PERSONALIZED RECOMMENDATIONS!
              </p>
            </PixelCard>
          )}
        </section>
      </section>
    </div>
  );
}
