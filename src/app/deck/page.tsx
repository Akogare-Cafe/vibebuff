"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Package,
  Plus,
  Star,
  ChevronRight,
  Trash2,
  Share2,
  Copy,
  Check,
  Lock,
  Globe,
  Layers,
  User,
  Sparkles,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function DeckPage() {
  const { user, isLoaded } = useUser();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const userDecks = useQuery(
    api.decks.getUserDecks,
    user?.id ? { userId: user.id } : "skip"
  );

  const deleteDeck = useMutation(api.decks.deleteDeck);
  const updateDeck = useMutation(api.decks.updateDeck);

  const handleCopyShareLink = async (shareToken: string, deckId: string) => {
    const url = `${window.location.origin}/deck/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(deckId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (deckId: Id<"userDecks">) => {
    if (confirm("Are you sure you want to delete this deck?")) {
      await deleteDeck({ deckId });
    }
  };

  const handleToggleVisibility = async (deckId: Id<"userDecks">, isPublic: boolean) => {
    await updateDeck({ deckId, isPublic: !isPublic });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-primary text-xl mb-2 flex items-center gap-2">
              <Package className="w-6 h-6" /> MY DECKS
            </h1>
            <p className="text-muted-foreground text-sm">
              YOUR SAVED TECH STACKS AND TOOL COLLECTIONS
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/stack-builder">
              <PixelButton variant="outline">
                <Layers className="w-4 h-4 mr-2" /> STACK BUILDER
              </PixelButton>
            </Link>
            <Link href="/">
              <PixelButton>
                <Sparkles className="w-4 h-4 mr-2" /> AI STACK BUILDER
              </PixelButton>
            </Link>
          </div>
        </div>

        {!user && (
          <PixelCard className="text-center p-12 mb-8">
            <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-primary text-lg mb-4">SIGN IN TO SAVE DECKS</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              CREATE AN ACCOUNT TO SAVE YOUR TECH STACKS AND ACCESS THEM ANYWHERE.
              YOU CAN STILL EXPLORE TOOLS AND USE THE STACK BUILDER AS A GUEST.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-in">
                <PixelButton>
                  <User className="w-4 h-4 mr-2" /> SIGN IN
                </PixelButton>
              </Link>
              <Link href="/stack-builder">
                <PixelButton variant="outline">
                  <Layers className="w-4 h-4 mr-2" /> STACK BUILDER
                </PixelButton>
              </Link>
            </div>
          </PixelCard>
        )}

        {user && userDecks === undefined && (
          <div className="text-center py-12">
            <div className="text-primary text-sm animate-pulse">LOADING DECKS...</div>
          </div>
        )}

        {user && userDecks && userDecks.length === 0 && (
          <PixelCard className="text-center p-12">
            <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-primary text-lg mb-4">NO DECKS YET</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              START YOUR QUEST TO GET AI-POWERED TECH STACK RECOMMENDATIONS, 
              OR USE THE VISUAL STACK BUILDER TO CREATE YOUR OWN.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/">
                <PixelButton>
                  <Sparkles className="w-4 h-4 mr-2" /> AI STACK BUILDER
                </PixelButton>
              </Link>
              <Link href="/stack-builder">
                <PixelButton variant="outline">
                  <Layers className="w-4 h-4 mr-2" /> STACK BUILDER
                </PixelButton>
              </Link>
            </div>
          </PixelCard>
        )}

        {user && userDecks && userDecks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDecks.map((deck) => (
              <PixelCard key={deck._id} className="flex flex-col">
                <PixelCardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <PixelCardTitle className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {deck.name}
                    </PixelCardTitle>
                    <PixelBadge variant={deck.isPublic ? "default" : "outline"}>
                      {deck.isPublic ? (
                        <><Globe className="w-2 h-2 mr-1" /> PUBLIC</>
                      ) : (
                        <><Lock className="w-2 h-2 mr-1" /> PRIVATE</>
                      )}
                    </PixelBadge>
                  </div>
                </PixelCardHeader>
                <PixelCardContent className="flex-1 flex flex-col">
                  {deck.description && (
                    <p className="text-muted-foreground text-xs mb-4">{deck.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {deck.tools?.slice(0, 5).filter((t): t is NonNullable<typeof t> => t !== null).map((tool) => (
                      <PixelBadge key={tool._id} variant="outline" className="text-[6px]">
                        {tool.name}
                      </PixelBadge>
                    ))}
                    {deck.tools && deck.tools.length > 5 && (
                      <PixelBadge variant="outline" className="text-[6px]">
                        +{deck.tools.length - 5} MORE
                      </PixelBadge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    {deck.tools?.length || 0} TOOLS
                    <span className="mx-2">|</span>
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    {deck.shareToken && (
                      <Link href={`/deck/${deck.shareToken}`}>
                        <PixelButton size="sm" variant="outline">
                          <ChevronRight className="w-3 h-3 mr-1" /> VIEW
                        </PixelButton>
                      </Link>
                    )}
                    {deck.shareToken && (
                      <PixelButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyShareLink(deck.shareToken!, deck._id)}
                      >
                        {copiedId === deck._id ? (
                          <><Check className="w-3 h-3 mr-1" /> COPIED</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> COPY LINK</>
                        )}
                      </PixelButton>
                    )}
                    <PixelButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(deck._id, deck.isPublic)}
                    >
                      {deck.isPublic ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(deck._id)}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>
            ))}

            <Link href="/">
              <PixelCard className="h-full min-h-[200px] border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <div className="text-center p-6">
                  <Plus className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">CREATE NEW DECK</p>
                </div>
              </PixelCard>
            </Link>
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> QUICK ACTIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="text-primary text-sm mb-2">AI STACK BUILDER</h3>
                <p className="text-muted-foreground text-xs">
                  GET PERSONALIZED TECH STACK RECOMMENDATIONS
                </p>
              </PixelCard>
            </Link>
            <Link href="/stack-builder">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Layers className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="text-primary text-sm mb-2">VISUAL BUILDER</h3>
                <p className="text-muted-foreground text-xs">
                  DESIGN YOUR STACK WITH DRAG-AND-DROP
                </p>
              </PixelCard>
            </Link>
            <Link href="/tools">
              <PixelCard className="p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Package className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="text-primary text-sm mb-2">BROWSE TOOLS</h3>
                <p className="text-muted-foreground text-xs">
                  EXPLORE 500+ DEVELOPER TOOLS
                </p>
              </PixelCard>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
