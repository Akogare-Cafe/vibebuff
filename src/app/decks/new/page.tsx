"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Wrench,
  Globe,
  Lock,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "../../../../convex/_generated/dataModel";
import { TourTrigger } from "@/components/page-tour";
import { decksTourConfig } from "@/lib/tour-configs";

export default function NewDeckPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTools, setSelectedTools] = useState<Id<"tools">[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const allTools = useQuery(api.tools.list, { limit: 100 });
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );
  const categories = useQuery(api.categories.list);

  const createDeck = useMutation(api.decks.createDeck);

  const baseTools = searchQuery.length > 2 ? searchResults : allTools;
  const filteredTools = baseTools?.filter((tool) => {
    if (selectedCategory !== "all") {
      const category = categories?.find((c) => c.slug === selectedCategory);
      if (category && tool.categoryId !== category._id) return false;
    }
    return true;
  });
  const totalPages = Math.ceil((filteredTools?.length ?? 0) / itemsPerPage);
  const displayTools = filteredTools?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleTool = (toolId: Id<"tools">) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleCreateDeck = async () => {
    if (!user?.id || !deckName.trim()) return;

    setIsCreating(true);
    try {
      const deckId = await createDeck({
        name: deckName.trim(),
        description: deckDescription.trim() || undefined,
        toolIds: selectedTools,
        isPublic,
      });
      router.push(`/profile/decks`);
    } catch (error) {
      console.error("Failed to create deck:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PixelCard className="text-center p-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-primary text-lg mb-4">SIGN IN REQUIRED</h1>
            <p className="text-muted-foreground text-sm mb-6">
              You need to sign in to create a deck.
            </p>
            <Link href="/sign-in">
              <PixelButton>
                <Users className="w-4 h-4 mr-2" /> SIGN IN
              </PixelButton>
            </Link>
          </PixelCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={decksTourConfig} />
      </div>

      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Create Deck</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Build Your Tech Stack
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Create a deck of your favorite tools and share it with the community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> DECK DETAILS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent className="space-y-4">
                <div data-tour="deck-name">
                  <label className="text-foreground text-sm mb-2 block">DECK NAME *</label>
                  <PixelInput
                    placeholder="e.g., My Full-Stack Setup"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-foreground text-sm mb-2 block">DESCRIPTION</label>
                  <PixelInput
                    placeholder="What is this deck for?"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                  />
                </div>

                <div data-tour="deck-visibility">
                  <label className="text-foreground text-sm mb-2 block">VISIBILITY</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        isPublic
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">Public</span>
                    </button>
                    <button
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        !isPublic
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Private</span>
                    </button>
                  </div>
                  <p className="text-muted-foreground text-xs mt-2">
                    {isPublic
                      ? "Public decks can be shared and used in battles"
                      : "Private decks are only visible to you"}
                  </p>
                </div>
              </PixelCardContent>
            </PixelCard>

            <PixelCard data-tour="deck-tools">
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> ADD TOOLS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <PixelInput
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-40 h-10 pl-10 pr-3 rounded-lg border border-border bg-card text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Categories</option>
                      {categories?.map((cat) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-h-[200px]">
                  {displayTools?.map((tool) => {
                    const isSelected = selectedTools.includes(tool._id);
                    return (
                      <button
                        key={tool._id}
                        onClick={() => handleToggleTool(tool._id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded border border-border bg-card flex items-center justify-center shrink-0">
                          {tool.logoUrl ? (
                            <img
                              src={tool.logoUrl}
                              alt={tool.name}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <Wrench className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs text-foreground truncate flex-1">
                          {tool.name}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {(!displayTools || displayTools.length === 0) && (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                    {searchQuery.length > 2 || selectedCategory !== "all" ? "No tools found" : "Loading tools..."}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="col-span-full flex items-center justify-center gap-2 pt-4 border-t border-border mt-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>
          </div>

          <div className="space-y-6">
            <PixelCard className="sticky top-24" data-tour="deck-preview">
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Package className="w-4 h-4" /> YOUR DECK
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="mb-4">
                  <p className="text-foreground font-medium">
                    {deckName || "Untitled Deck"}
                  </p>
                  {deckDescription && (
                    <p className="text-muted-foreground text-xs mt-1">{deckDescription}</p>
                  )}
                  <PixelBadge
                    variant="outline"
                    className={`mt-2 ${isPublic ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {isPublic ? (
                      <><Globe className="w-3 h-3 mr-1" /> PUBLIC</>
                    ) : (
                      <><Lock className="w-3 h-3 mr-1" /> PRIVATE</>
                    )}
                  </PixelBadge>
                </div>

                <div className="mb-4">
                  <p className="text-muted-foreground text-xs mb-2">
                    SELECTED TOOLS ({selectedTools.length})
                  </p>
                  {selectedTools.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                      No tools selected yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedTools.map((toolId) => {
                        const tool = allTools?.find((t) => t._id === toolId);
                        return (
                          <div
                            key={toolId}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/30"
                          >
                            <span className="text-xs text-foreground">
                              {tool?.name || "..."}
                            </span>
                            <button
                              onClick={() => handleToggleTool(toolId)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <PixelButton
                  onClick={handleCreateDeck}
                  disabled={!deckName.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating ? (
                    "CREATING..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> CREATE DECK
                    </>
                  )}
                </PixelButton>

                <p className="text-muted-foreground text-xs mt-3 text-center">
                  You can add more tools later from tool pages
                </p>
              </PixelCardContent>
            </PixelCard>

          </div>
        </div>
      </section>
    </div>
  );
}
