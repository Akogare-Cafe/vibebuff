"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import {
  Scale,
  Eye,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";

export default function ComparisonsPage() {
  const comparisons = useQuery(api.seo.listComparisons, { limit: 100 });

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/community">
            <PixelButton variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO COMMUNITY
            </PixelButton>
          </Link>
          <h1 className="text-primary text-2xl mb-2 flex items-center gap-2">
            <Scale className="w-6 h-6" /> ALL COMPARISONS
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse all tool comparisons and find the best fit for your needs
          </p>
        </div>

        {!comparisons && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PixelCard key={i} className="h-[160px] animate-pulse">
                <PixelCardContent className="p-4">
                  <div className="h-4 bg-card rounded w-3/4 mb-2" />
                  <div className="h-3 bg-card rounded w-full mb-2" />
                  <div className="h-3 bg-card rounded w-1/2" />
                </PixelCardContent>
              </PixelCard>
            ))}
          </div>
        )}

        {comparisons && comparisons.length === 0 && (
          <PixelCard>
            <PixelCardContent className="p-8 text-center">
              <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-primary text-lg mb-2">NO COMPARISONS YET</p>
              <p className="text-muted-foreground text-sm">
                Check back later for tool comparisons
              </p>
            </PixelCardContent>
          </PixelCard>
        )}

        {comparisons && comparisons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison) => (
              <Link key={comparison._id} href={`/compare/${comparison.slug}`}>
                <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                  <PixelCardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <PixelBadge variant="outline" className="text-[10px]">
                        <Eye className="w-3 h-3 mr-1" />
                        {comparison.views} views
                      </PixelBadge>
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-primary text-sm mb-2 font-medium">
                      {comparison.tool1?.name} vs {comparison.tool2?.name}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-3 mb-3">
                      {comparison.metaDescription}
                    </p>
                    <div className="flex items-center text-primary text-xs">
                      <span>READ COMPARISON</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
