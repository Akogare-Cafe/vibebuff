"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  ChevronLeft,
  Medal,
  Users,
  Globe,
  MapPin,
} from "lucide-react";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useQuery(
    api.companies.search,
    searchQuery.length > 1 ? { query: searchQuery, limit: 20 } : "skip"
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="font-heading text-foreground text-2xl">COMPANIES</h1>
            </div>
            <Link href="/companies/new">
              <PixelButton>
                <Plus className="w-4 h-4 mr-2" /> Create Company
              </PixelButton>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            Discover company tech stacks and connect with teams using similar tools.
          </p>
        </div>

        <div className="mb-8">
          <div className="max-w-md relative">
            <PixelInput
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {searchQuery.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults?.map((company) => (
              <Link key={company._id} href={`/companies/${company.slug}`}>
                <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                  <PixelCardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-7 h-7 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-foreground font-bold truncate">{company.name}</h3>
                          {company.isVerified && (
                            <Medal className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                          {company.description || "No description"}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {company.memberCount}
                          </span>
                          {company.industry && (
                            <PixelBadge variant="outline" className="text-[8px]">
                              {company.industry}
                            </PixelBadge>
                          )}
                        </div>
                        {company.location && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {company.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
            {searchResults?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No companies found matching your search</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-bold text-foreground mb-2">Discover Company Tech Stacks</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Search for companies to see their tech stacks, or create your own company profile to share your stack with your team.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/companies/new">
                <PixelButton>
                  <Plus className="w-4 h-4 mr-2" /> Create Company
                </PixelButton>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
