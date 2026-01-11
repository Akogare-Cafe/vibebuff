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
  Users,
  Search,
  UserPlus,
  ChevronLeft,
  Medal,
  Globe,
  Lock,
  Mail,
} from "lucide-react";

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularGroups = useQuery(api.groups.getPopular, { limit: 20 });
  const searchResults = useQuery(
    api.groups.search,
    searchQuery.length > 1 ? { query: searchQuery, limit: 20 } : "skip"
  );

  const displayGroups = searchQuery.length > 1 ? searchResults : popularGroups;

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Globe className="w-3 h-3" />;
      case "private":
        return <Lock className="w-3 h-3" />;
      case "invite_only":
        return <Mail className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="font-heading text-foreground text-2xl">GROUPS</h1>
            </div>
            <Link href="/groups/new">
              <PixelButton>
                <UserPlus className="w-4 h-4 mr-2" /> Create Group
              </PixelButton>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            Join groups to share tools, stacks, and decks with like-minded developers.
          </p>
        </div>

        <div className="mb-8">
          <div className="max-w-md relative">
            <PixelInput
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayGroups?.map((group) => (
            <Link key={group._id} href={`/groups/${group.slug}`}>
              <PixelCard className="h-full hover:border-primary transition-colors cursor-pointer">
                <PixelCardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {group.avatarUrl ? (
                        <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground font-bold truncate">{group.name}</h3>
                        {group.isVerified && (
                          <Medal className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                        {group.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" /> {group.memberCount} members
                        </span>
                        <PixelBadge variant="outline" className="text-[8px] flex items-center gap-1">
                          {getGroupTypeIcon(group.groupType)}
                          {group.groupType}
                        </PixelBadge>
                      </div>
                      {group.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.tags.slice(0, 3).map((tag) => (
                            <PixelBadge key={tag} variant="outline" className="text-[8px]">
                              {tag}
                            </PixelBadge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PixelCardContent>
              </PixelCard>
            </Link>
          ))}
          {!displayGroups && (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PixelCard key={i} className="h-[140px] animate-pulse">
                  <PixelCardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="size-14 rounded-lg bg-card" />
                      <div className="flex-1">
                        <div className="h-4 bg-card rounded w-3/4 mb-2" />
                        <div className="h-3 bg-card rounded w-full mb-2" />
                        <div className="h-3 bg-card rounded w-1/2" />
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
            </>
          )}
          {displayGroups?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No groups found matching your search" : "No groups yet"}
              </p>
              <Link href="/groups/new">
                <PixelButton>
                  <UserPlus className="w-4 h-4 mr-2" /> Create First Group
                </PixelButton>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
