"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Swords,
  Plus,
  Package,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  Wrench,
  Globe,
  Lock,
  Search,
  Zap,
  Target,
  Crown,
  Vote,
  Eye,
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TourTrigger } from "@/components/page-tour";
import { battlesTourConfig } from "@/lib/tour-configs";

type BattleStatus = "pending" | "active" | "voting" | "completed" | "cancelled";

const statusStyles: Record<BattleStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "WAITING" },
  active: { bg: "bg-green-500/20", text: "text-green-400", label: "ACTIVE" },
  voting: { bg: "bg-blue-500/20", text: "text-blue-400", label: "VOTING" },
  completed: { bg: "bg-purple-500/20", text: "text-purple-400", label: "COMPLETED" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "CANCELLED" },
};

export default function BattlesPage() {
  const { user, isLoaded } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<Id<"userDecks"> | null>(null);
  const [battlePrompt, setBattlePrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"open" | "active" | "my">("open");

  const userDecks = useQuery(api.decks.getUserDecks, user?.id ? {} : "skip");
  const pendingBattles = useQuery(api.battles.getPendingBattles, { limit: 20 });
  const activeBattles = useQuery(api.battles.getPublicBattles, { limit: 20 });
  const myBattles = useQuery(api.battles.getUserBattles, user?.id ? {} : "skip");

  const createBattle = useMutation(api.battles.createBattle);

  const publicDecks = userDecks?.filter((d) => d.isPublic) || [];

  const handleCreateBattle = async () => {
    if (!selectedDeckId || !battlePrompt.trim()) return;

    setIsCreating(true);
    try {
      const result = await createBattle({
        deckId: selectedDeckId,
        prompt: battlePrompt.trim(),
      });
      setShowCreateModal(false);
      setSelectedDeckId(null);
      setBattlePrompt("");
      if (result.shareToken) {
        setCopiedToken(result.shareToken);
        await navigator.clipboard.writeText(
          `${window.location.origin}/battles/${result.shareToken}`
        );
        setTimeout(() => setCopiedToken(null), 3000);
      }
    } catch (error) {
      console.error("Failed to create battle:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async (shareToken: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/battles/${shareToken}`
    );
    setCopiedToken(shareToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">LOADING ARENA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={battlesTourConfig} />
      </div>

      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <Swords className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Stack Battles</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Battle Arena
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Challenge other developers to compare tech stacks. Create a battle with a prompt and let the community vote!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8" data-tour="battle-card">
          <div className="flex gap-2">
            <PixelButton
              variant={activeTab === "open" ? "default" : "outline"}
              onClick={() => setActiveTab("open")}
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" /> OPEN CHALLENGES
            </PixelButton>
            <PixelButton
              variant={activeTab === "active" ? "default" : "outline"}
              onClick={() => setActiveTab("active")}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" /> ACTIVE BATTLES
            </PixelButton>
            {user && (
              <PixelButton
                variant={activeTab === "my" ? "default" : "outline"}
                onClick={() => setActiveTab("my")}
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" /> MY BATTLES
              </PixelButton>
            )}
          </div>

          {user && (
            <PixelButton onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> CREATE BATTLE
            </PixelButton>
          )}
        </div>

        {activeTab === "open" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Open Challenges - Accept to Battle!</span>
            </div>

            {pendingBattles === undefined && (
              <div className="text-center py-12">
                <div className="text-primary text-sm animate-pulse">LOADING CHALLENGES...</div>
              </div>
            )}

            {pendingBattles && pendingBattles.length === 0 && (
              <PixelCard className="text-center p-12">
                <Swords className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-primary text-lg mb-4">NO OPEN CHALLENGES</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Be the first to create a battle and challenge other developers!
                </p>
                {user && (
                  <PixelButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> CREATE FIRST BATTLE
                  </PixelButton>
                )}
              </PixelCard>
            )}

            {pendingBattles && pendingBattles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="battle-stats">
                {pendingBattles.map((battle) => (
                  <BattleCard
                    key={battle._id}
                    battle={battle}
                    onCopyLink={handleCopyLink}
                    copiedToken={copiedToken}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Active Battles - Vote Now!</span>
            </div>

            {activeBattles === undefined && (
              <div className="text-center py-12">
                <div className="text-primary text-sm animate-pulse">LOADING BATTLES...</div>
              </div>
            )}

            {activeBattles && activeBattles.length === 0 && (
              <PixelCard className="text-center p-12">
                <Trophy className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-primary text-lg mb-4">NO ACTIVE BATTLES</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Check out open challenges and accept one to start a battle!
                </p>
                <PixelButton variant="outline" onClick={() => setActiveTab("open")}>
                  <Target className="w-4 h-4 mr-2" /> VIEW OPEN CHALLENGES
                </PixelButton>
              </PixelCard>
            )}

            {activeBattles && activeBattles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBattles.map((battle) => (
                  <BattleCard
                    key={battle._id}
                    battle={battle}
                    onCopyLink={handleCopyLink}
                    copiedToken={copiedToken}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "my" && user && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Your Battles</span>
            </div>

            {myBattles === undefined && (
              <div className="text-center py-12">
                <div className="text-primary text-sm animate-pulse">LOADING YOUR BATTLES...</div>
              </div>
            )}

            {myBattles && myBattles.length === 0 && (
              <PixelCard className="text-center p-12">
                <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-primary text-lg mb-4">NO BATTLES YET</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Create your first battle or accept an open challenge!
                </p>
                <div className="flex gap-4 justify-center">
                  <PixelButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> CREATE BATTLE
                  </PixelButton>
                  <PixelButton variant="outline" onClick={() => setActiveTab("open")}>
                    <Target className="w-4 h-4 mr-2" /> BROWSE CHALLENGES
                  </PixelButton>
                </div>
              </PixelCard>
            )}

            {myBattles && myBattles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBattles.map((battle) => (
                  <BattleCard
                    key={battle._id}
                    battle={battle}
                    onCopyLink={handleCopyLink}
                    copiedToken={copiedToken}
                    currentUserId={user?.id}
                    showOwnership
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!user && (
          <PixelCard className="mt-8 p-6 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h3 className="text-primary text-sm mb-2">SIGN IN TO BATTLE</h3>
            <p className="text-muted-foreground text-xs mb-4">
              Create battles, accept challenges, and vote on the best tech stacks
            </p>
            <Link href="/sign-in">
              <PixelButton>
                <Users className="w-4 h-4 mr-2" /> SIGN IN
              </PixelButton>
            </Link>
          </PixelCard>
        )}
      </section>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PixelCard className="w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-primary text-lg flex items-center gap-2">
                    <Swords className="w-5 h-5" /> CREATE BATTLE
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-foreground text-sm mb-2 block">
                      SELECT YOUR DECK
                    </label>
                    {publicDecks.length === 0 ? (
                      <div className="text-center p-6 border border-dashed border-border rounded-lg">
                        <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs mb-3">
                          You need a public deck to create a battle
                        </p>
                        <Link href="/decks/new">
                          <PixelButton size="sm" variant="outline">
                            <Plus className="w-3 h-3 mr-1" /> CREATE DECK
                          </PixelButton>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {publicDecks.map((deck) => (
                          <button
                            key={deck._id}
                            onClick={() => setSelectedDeckId(deck._id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedDeckId === deck._id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground text-sm font-medium truncate">
                                  {deck.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {deck.tools?.length || 0} tools
                                </p>
                              </div>
                              {selectedDeckId === deck._id && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-foreground text-sm mb-2 block">
                      BATTLE PROMPT
                    </label>
                    <PixelInput
                      placeholder="e.g., Best stack for a real-time chat app..."
                      value={battlePrompt}
                      onChange={(e) => setBattlePrompt(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs mt-2">
                      Describe the use case or project type for this battle
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <PixelButton
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      CANCEL
                    </PixelButton>
                    <PixelButton
                      onClick={handleCreateBattle}
                      disabled={!selectedDeckId || !battlePrompt.trim() || isCreating}
                      className="flex-1"
                    >
                      {isCreating ? (
                        "CREATING..."
                      ) : (
                        <>
                          <Swords className="w-4 h-4 mr-2" /> CREATE
                        </>
                      )}
                    </PixelButton>
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BattleCardProps {
  battle: {
    _id: Id<"deckBattles">;
    prompt: string;
    status: BattleStatus;
    shareToken: string;
    votesForCreator: number;
    votesForChallenger: number;
    createdAt: number;
    creatorUserId: string;
    challengerUserId?: string;
    creatorDeck: {
      _id: Id<"userDecks">;
      name: string;
      tools?: ({ _id: Id<"tools">; name: string; logoUrl?: string } | null)[];
    } | null;
    challengerDeck?: {
      _id: Id<"userDecks">;
      name: string;
      tools?: ({ _id: Id<"tools">; name: string; logoUrl?: string } | null)[];
    } | null;
  };
  onCopyLink: (token: string) => void;
  copiedToken: string | null;
  currentUserId?: string;
  showOwnership?: boolean;
}

function BattleCard({ battle, onCopyLink, copiedToken, currentUserId, showOwnership }: BattleCardProps) {
  const status = battle.status as BattleStatus;
  const style = statusStyles[status];
  const isCreator = currentUserId === battle.creatorUserId;
  const isChallenger = currentUserId === battle.challengerUserId;
  const totalVotes = battle.votesForCreator + battle.votesForChallenger;

  return (
    <PixelCard className="flex flex-col">
      <PixelCardHeader>
        <div className="flex items-start justify-between gap-2">
          <PixelCardTitle className="flex items-center gap-2 text-sm">
            <Swords className="w-4 h-4" />
            BATTLE
          </PixelCardTitle>
          <PixelBadge className={`${style.bg} ${style.text}`}>
            {style.label}
          </PixelBadge>
        </div>
      </PixelCardHeader>
      <PixelCardContent className="flex-1 flex flex-col">
        <p className="text-foreground text-sm mb-4 line-clamp-2">{battle.prompt}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
            <Package className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-xs font-medium truncate">
                {battle.creatorDeck?.name || "Unknown Deck"}
              </p>
              <div className="flex gap-1 mt-1">
                {battle.creatorDeck?.tools?.filter((t): t is NonNullable<typeof t> => t !== null).slice(0, 3).map((tool) => (
                  <div
                    key={tool._id}
                    className="w-5 h-5 rounded border border-border bg-card flex items-center justify-center"
                    title={tool.name}
                  >
                    {tool.logoUrl ? (
                      <img src={tool.logoUrl} alt={tool.name} className="w-3 h-3 object-contain" />
                    ) : (
                      <Wrench className="w-2 h-2 text-muted-foreground" />
                    )}
                  </div>
                ))}
                {(battle.creatorDeck?.tools?.filter(Boolean).length || 0) > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{(battle.creatorDeck?.tools?.filter(Boolean).length || 0) - 3}
                  </span>
                )}
              </div>
            </div>
            {showOwnership && isCreator && (
              <PixelBadge variant="outline" className="text-[10px]">YOU</PixelBadge>
            )}
          </div>

          {battle.challengerDeck ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
              <Package className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-xs font-medium truncate">
                  {battle.challengerDeck.name}
                </p>
                <div className="flex gap-1 mt-1">
                  {battle.challengerDeck.tools?.filter((t): t is NonNullable<typeof t> => t !== null).slice(0, 3).map((tool) => (
                    <div
                      key={tool._id}
                      className="w-5 h-5 rounded border border-border bg-card flex items-center justify-center"
                      title={tool.name}
                    >
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={tool.name} className="w-3 h-3 object-contain" />
                      ) : (
                        <Wrench className="w-2 h-2 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                  {(battle.challengerDeck.tools?.filter(Boolean).length || 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{(battle.challengerDeck.tools?.filter(Boolean).length || 0) - 3}
                    </span>
                  )}
                </div>
              </div>
              {showOwnership && isChallenger && (
                <PixelBadge variant="outline" className="text-[10px]">YOU</PixelBadge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-border">
              <Target className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground text-xs">Waiting for challenger...</p>
            </div>
          )}
        </div>

        {totalVotes > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Votes</span>
              <span>{totalVotes} total</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden flex">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${(battle.votesForCreator / totalVotes) * 100}%` }}
              />
              <div
                className="bg-orange-400 h-full transition-all"
                style={{ width: `${(battle.votesForChallenger / totalVotes) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <Link href={`/battles/${battle.shareToken}`} className="flex-1">
            <PixelButton size="sm" variant="outline" className="w-full">
              <Eye className="w-3 h-3 mr-1" /> VIEW
            </PixelButton>
          </Link>
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => onCopyLink(battle.shareToken)}
          >
            {copiedToken === battle.shareToken ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Share2 className="w-3 h-3" />
            )}
          </PixelButton>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
