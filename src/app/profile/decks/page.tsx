"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { DeckLoadout, LoadoutStats } from "@/components/deck-loadout";
import { DeckShare } from "@/components/deck-share";
import Link from "next/link";
import {
  Package,
  Plus,
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
  ArrowLeft,
  Edit3,
  X,
  Eye,
  Settings,
  Wrench,
  Calendar,
  Shield,
} from "lucide-react";

export default function ProfileDecksPage() {
  const { user, isLoaded } = useUser();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState<Id<"userDecks"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [sharingDeck, setSharingDeck] = useState<{
    id: Id<"userDecks">;
    name: string;
    shareToken?: string;
    isPublic: boolean;
    toolCount: number;
  } | null>(null);
  const [viewingLoadout, setViewingLoadout] = useState<Id<"userDecks"> | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

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
    if (confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      await deleteDeck({ deckId });
    }
  };

  const handleToggleVisibility = async (deckId: Id<"userDecks">, isPublic: boolean) => {
    await updateDeck({ deckId, isPublic: !isPublic });
  };

  const handleStartEdit = (deck: { _id: Id<"userDecks">; name: string; description?: string }) => {
    setEditingDeck(deck._id);
    setEditName(deck.name);
    setEditDescription(deck.description || "");
  };

  const handleSaveEdit = async () => {
    if (editingDeck && editName.trim()) {
      await updateDeck({
        deckId: editingDeck,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setEditingDeck(null);
      setEditName("");
      setEditDescription("");
    }
  };

  const handleCancelEdit = () => {
    setEditingDeck(null);
    setEditName("");
    setEditDescription("");
  };

  const filteredDecks = userDecks?.filter((deck) => {
    if (filter === "all") return true;
    if (filter === "public") return deck.isPublic;
    if (filter === "private") return !deck.isPublic;
    return true;
  });

  const publicCount = userDecks?.filter((d) => d.isPublic).length || 0;
  const privateCount = userDecks?.filter((d) => !d.isPublic).length || 0;

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
        <main className="max-w-4xl mx-auto px-4 py-12">
          <PixelCard className="text-center p-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-primary text-lg mb-4">SIGN IN TO MANAGE DECKS</h1>
            <p className="text-muted-foreground text-sm mb-6">
              CREATE AN ACCOUNT TO SAVE AND MANAGE YOUR TECH STACKS
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-6">
          <Link href="/profile" className="text-muted-foreground text-sm hover:text-primary flex items-center gap-1 w-fit">
            <ArrowLeft className="w-3 h-3" /> BACK TO PROFILE
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-primary text-2xl mb-2 flex items-center gap-3">
              <Package className="w-7 h-7" /> MY DECKS
            </h1>
            <p className="text-muted-foreground text-sm">
              MANAGE YOUR SAVED TECH STACKS AND TOOL COLLECTIONS
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <PixelBadge variant="secondary">
              {userDecks?.length || 0} TOTAL
            </PixelBadge>
            <PixelBadge variant="outline">
              <Globe className="w-3 h-3 mr-1" /> {publicCount} PUBLIC
            </PixelBadge>
            <PixelBadge variant="outline">
              <Lock className="w-3 h-3 mr-1" /> {privateCount} PRIVATE
            </PixelBadge>
          </div>
          <div className="flex gap-2">
            <PixelButton
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              ALL
            </PixelButton>
            <PixelButton
              size="sm"
              variant={filter === "public" ? "default" : "outline"}
              onClick={() => setFilter("public")}
            >
              <Globe className="w-3 h-3 mr-1" /> PUBLIC
            </PixelButton>
            <PixelButton
              size="sm"
              variant={filter === "private" ? "default" : "outline"}
              onClick={() => setFilter("private")}
            >
              <Lock className="w-3 h-3 mr-1" /> PRIVATE
            </PixelButton>
          </div>
        </div>

        {userDecks === undefined && (
          <div className="text-center py-12">
            <div className="text-primary text-sm animate-pulse">LOADING DECKS...</div>
          </div>
        )}

        {userDecks && userDecks.length === 0 && (
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

        {filteredDecks && filteredDecks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <PixelCard 
                key={deck._id} 
                className="flex flex-col"
                rarity={deck.tools && deck.tools.length >= 10 ? "rare" : deck.tools && deck.tools.length >= 5 ? "uncommon" : "common"}
              >
                <PixelCardHeader>
                  <div className="flex items-start justify-between gap-2">
                    {editingDeck === deck._id ? (
                      <div className="flex-1">
                        <PixelInput
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Deck name..."
                          className="mb-2"
                        />
                        <PixelInput
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description (optional)..."
                        />
                      </div>
                    ) : (
                      <PixelCardTitle className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {deck.name}
                      </PixelCardTitle>
                    )}
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
                  {editingDeck !== deck._id && deck.description && (
                    <p className="text-muted-foreground text-xs mb-4 line-clamp-2">{deck.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {deck.tools?.slice(0, 6).filter((t): t is NonNullable<typeof t> => t !== null).map((tool) => (
                      <div 
                        key={tool._id} 
                        className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center overflow-hidden"
                        title={tool.name}
                      >
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 object-contain" />
                        ) : (
                          <Wrench className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    {deck.tools && deck.tools.length > 6 && (
                      <div className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{deck.tools.length - 6}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> {deck.tools?.length || 0} TOOLS
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(deck.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-auto">
                    {editingDeck === deck._id ? (
                      <div className="flex gap-2">
                        <PixelButton size="sm" onClick={handleSaveEdit}>
                          <Check className="w-3 h-3 mr-1" /> SAVE
                        </PixelButton>
                        <PixelButton size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-3 h-3 mr-1" /> CANCEL
                        </PixelButton>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {deck.shareToken && (
                          <Link href={`/deck/${deck.shareToken}`}>
                            <PixelButton size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" /> VIEW
                            </PixelButton>
                          </Link>
                        )}
                        <PixelButton
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingLoadout(viewingLoadout === deck._id ? null : deck._id)}
                        >
                          <Shield className="w-3 h-3 mr-1" /> LOADOUT
                        </PixelButton>
                        <PixelButton
                          size="sm"
                          variant="outline"
                          onClick={() => setSharingDeck({
                            id: deck._id,
                            name: deck.name,
                            shareToken: deck.shareToken,
                            isPublic: deck.isPublic,
                            toolCount: deck.tools?.length || 0,
                          })}
                        >
                          <Share2 className="w-3 h-3 mr-1" /> SHARE
                        </PixelButton>
                        <PixelButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(deck)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </PixelButton>
                        <PixelButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleVisibility(deck._id, deck.isPublic)}
                          title={deck.isPublic ? "Make Private" : "Make Public"}
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
                    )}
                  </div>

                  {viewingLoadout === deck._id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <DeckLoadout deckId={deck._id} userId={user.id} />
                    </div>
                  )}
                </PixelCardContent>
              </PixelCard>
            ))}

            <Link href="/">
              <PixelCard className="h-full min-h-[280px] border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <div className="text-center p-6">
                  <Plus className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-primary text-sm mb-2">CREATE NEW DECK</p>
                  <p className="text-muted-foreground text-xs">Use the AI Stack Builder</p>
                </div>
              </PixelCard>
            </Link>
          </div>
        )}

        {filteredDecks && filteredDecks.length === 0 && userDecks && userDecks.length > 0 && (
          <PixelCard className="text-center p-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-primary text-base mb-2">NO {filter.toUpperCase()} DECKS</h2>
            <p className="text-muted-foreground text-sm">
              {filter === "public" 
                ? "Make some decks public to share them with others"
                : "All your decks are currently public"}
            </p>
          </PixelCard>
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

      {sharingDeck && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <DeckShare
            deckId={sharingDeck.id}
            deckName={sharingDeck.name}
            shareToken={sharingDeck.shareToken}
            isPublic={sharingDeck.isPublic}
            toolCount={sharingDeck.toolCount}
            onClose={() => setSharingDeck(null)}
          />
        </div>
      )}
    </div>
  );
}
