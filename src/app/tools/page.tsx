"use client";

import { useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardDescription, PixelCardContent } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import { 
  Gamepad2, 
  Wrench, 
  Compass, 
  Package, 
  Search, 
  Star, 
  Unlock,
  ArrowLeft,
  ChevronRight,
  Scale
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#60a5fa] text-sm">LOADING...</div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  
  const categories = useQuery(api.categories.list);
  const tools = useQuery(api.tools.list, { 
    categorySlug: categoryFilter || undefined,
    limit: 50 
  });
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );

  const displayTools = searchQuery.length > 2 ? searchResults : tools;
  const activeCategory = categories?.find(c => c.slug === categoryFilter);

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="border-b-4 border-[#1e3a5f] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#3b82f6]" />
            <h1 className="text-[#60a5fa] text-sm pixel-glow">VIBEBUFF</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/tools" className="text-[#60a5fa] text-[10px] uppercase flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Tools
            </Link>
            <Link href="/compare" className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1">
              <Scale className="w-3 h-3" />
              Compare
            </Link>
            <Link href="/quest" className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Quest
            </Link>
            <ThemeSwitcher />
            <UserNav />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[#60a5fa] text-lg mb-2 flex items-center gap-2">
            <Package className="w-5 h-5" /> INVENTORY
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
            {activeCategory 
              ? `BROWSING: ${activeCategory.name.toUpperCase()}`
              : "ALL TOOLS IN YOUR ARSENAL"}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#3b82f6]" />
          <PixelInput
            placeholder="SEARCH TOOLS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/tools">
            <PixelBadge 
              variant={!categoryFilter ? "default" : "outline"}
              className="cursor-pointer hover:bg-[#3b82f6] hover:text-[#000000]"
            >
              ALL
            </PixelBadge>
          </Link>
          {categories?.map((category) => (
            <Link key={category._id} href={`/tools?category=${category.slug}`}>
              <PixelBadge 
                variant={categoryFilter === category.slug ? "default" : "outline"}
                className="cursor-pointer hover:bg-[#3b82f6] hover:text-[#000000]"
              >
                {category.icon} {category.name}
              </PixelBadge>
            </Link>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTools?.map((tool) => (
            <Link key={tool._id} href={`/tools/${tool.slug}`}>
              <PixelCard className="h-full cursor-pointer">
                <PixelCardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <PixelCardTitle className="flex-1">{tool.name}</PixelCardTitle>
                    <PixelBadge variant="default" className="shrink-0">
                      {tool.pricingModel === "free" ? "FREE" : 
                       tool.pricingModel === "freemium" ? "FREEMIUM" : 
                       tool.pricingModel === "open_source" ? "OSS" : "PAID"}
                    </PixelBadge>
                  </div>
                  <PixelCardDescription>{tool.tagline}</PixelCardDescription>
                </PixelCardHeader>
                <PixelCardContent>
                  {/* Pros */}
                  <div className="mb-3">
                    <p className="text-[#60a5fa] text-[8px] mb-1">+ STRENGTHS</p>
                    <ul className="text-[#3b82f6] text-[8px] space-y-1">
                      {tool.pros.slice(0, 2).map((pro, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-2 h-2 mt-0.5 shrink-0" /> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {tool.tags.slice(0, 4).map((tag) => (
                      <PixelBadge key={tag} variant="outline" className="text-[6px]">
                        {tag}
                      </PixelBadge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-[8px] text-[#3b82f6]">
                    {tool.githubStars && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {(tool.githubStars / 1000).toFixed(0)}K
                      </span>
                    )}
                    {tool.isOpenSource && (
                      <span className="flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> OPEN SOURCE
                      </span>
                    )}
                  </div>
                </PixelCardContent>
              </PixelCard>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {displayTools?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#60a5fa] text-sm mb-4">NO ITEMS FOUND</p>
            <p className="text-[#3b82f6] text-[10px]">TRY A DIFFERENT SEARCH OR CATEGORY</p>
          </div>
        )}

        {/* Loading State */}
        {!displayTools && (
          <div className="text-center py-12">
            <p className="text-[#60a5fa] text-sm pixel-loading">LOADING...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#1e3a5f] p-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-3 h-3 mr-1" /> BACK TO HOME
            </PixelButton>
          </Link>
        </div>
      </footer>
    </div>
  );
}
