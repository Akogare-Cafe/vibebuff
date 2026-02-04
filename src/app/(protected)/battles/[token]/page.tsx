"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import {
  Swords,
  Package,
  Trophy,
  Clock,
  ChevronRight,
  Wrench,
  ArrowLeft,
  Vote,
  Check,
  X,
  Share2,
  Copy,
  Crown,
  Target,
  Users,
  Zap,
  Shield,
  Heart,
  Flame,
  Gauge,
  CheckCircle,
  XCircle,
  Plus,
  Globe,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BattleStatus = "pending" | "active" | "voting" | "completed" | "cancelled";

const statusStyles: Record<BattleStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "WAITING FOR CHALLENGER" },
  active: { bg: "bg-green-500/20", text: "text-green-400", label: "BATTLE ACTIVE" },
  voting: { bg: "bg-blue-500/20", text: "text-blue-400", label: "VOTING IN PROGRESS" },
  completed: { bg: "bg-purple-500/20", text: "text-purple-400", label: "BATTLE COMPLETED" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "CANCELLED" },
};

const statConfig = [
  { key: "hp", label: "HP", color: "bg-red-500", icon: Heart },
  { key: "attack", label: "ATK", color: "bg-orange-500", icon: Flame },
  { key: "defense", label: "DEF", color: "bg-blue-500", icon: Shield },
  { key: "speed", label: "SPD", color: "bg-green-500", icon: Gauge },
  { key: "mana", label: "MANA", color: "bg-purple-500", icon: Zap },
];

export default function BattlePage() {
  const params = useParams();
  const token = params.token as string;
  const { user, isLoaded } = useUser();
  const [copied, setCopied] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<Id<"userDecks"> | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const battle = useQuery(api.battles.getBattleByShareToken, { shareToken: token });
  const userVote = useQuery(
    api.battles.getUserVote,
    battle?._id ? { battleId: battle._id } : "skip"
  );
  const userDecks = useQuery(api.decks.getUserDecks, user?.id ? {} : "skip");

  const joinBattle = useMutation(api.battles.joinBattle);
  const voteForDeck = useMutation(api.battles.voteForDeck);
  const cancelBattle = useMutation(api.battles.cancelBattle);

  const publicDecks = userDecks?.filter((d) => d.isPublic) || [];

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinBattle = async () => {
    if (!battle || !selectedDeckId) return;

    setIsJoining(true);
    try {
      await joinBattle({
        battleId: battle._id,
        deckId: selectedDeckId,
      });
      setShowJoinModal(false);
      setSelectedDeckId(null);
    } catch (error) {
      console.error("Failed to join battle:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleVote = async (deckId: Id<"userDecks">) => {
    if (!battle || userVote) return;

    setIsVoting(true);
    try {
      await voteForDeck({
        battleId: battle._id,
        deckId,
      });
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCancel = async () => {
    if (!battle) return;
    if (confirm("Are you sure you want to cancel this battle?")) {
      await cancelBattle({ battleId: battle._id });
    }
  };

  if (!isLoaded || battle === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">LOADING BATTLE...</div>
      </div>
    );
  }

  if (battle === null) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <PixelCard className="text-center p-8">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h1 className="text-primary text-lg mb-4">BATTLE NOT FOUND</h1>
            <p className="text-muted-foreground text-sm mb-6">
              This battle may have been cancelled or does not exist.
            </p>
            <Link href="/battles">
              <PixelButton>
                <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO ARENA
              </PixelButton>
            </Link>
          </PixelCard>
        </main>
      </div>
    );
  }

  const status = battle.status as BattleStatus;
  const style = statusStyles[status];
  const isCreator = user?.id === battle.creatorUserId;
  const isChallenger = user?.id === battle.challengerUserId;
  const canJoin = status === "pending" && user && !isCreator;
  const canVote = (status === "active" || status === "voting") && !!user && !userVote;
  const totalVotes = battle.votesForCreator + battle.votesForChallenger;

  const creatorTools = battle.creatorDeck?.tools || [];
  const challengerTools = battle.challengerDeck?.tools || [];

  const calculateTotalStats = (tools: typeof creatorTools) => {
    return tools.reduce(
      (acc, tool) => {
        if (tool?.stats) {
          acc.hp += tool.stats.hp || 0;
          acc.attack += tool.stats.attack || 0;
          acc.defense += tool.stats.defense || 0;
          acc.speed += tool.stats.speed || 0;
          acc.mana += tool.stats.mana || 0;
        }
        return acc;
      },
      { hp: 0, attack: 0, defense: 0, speed: 0, mana: 0 }
    );
  };

  const creatorStats = calculateTotalStats(creatorTools);
  const challengerStats = calculateTotalStats(challengerTools);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-6">
          <Link href="/battles" className="text-muted-foreground text-sm hover:text-primary flex items-center gap-1 w-fit">
            <ArrowLeft className="w-3 h-3" /> BACK TO ARENA
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Swords className="w-6 h-6 text-primary" />
              <h1 className="text-primary text-2xl">STACK BATTLE</h1>
              <PixelBadge className={`${style.bg} ${style.text}`}>
                {style.label}
              </PixelBadge>
            </div>
            <p className="text-foreground text-lg max-w-2xl">{battle.prompt}</p>
          </div>
          <div className="flex gap-3">
            <PixelButton variant="outline" onClick={handleCopyLink}>
              {copied ? (
                <><Check className="w-4 h-4 mr-2" /> COPIED!</>
              ) : (
                <><Share2 className="w-4 h-4 mr-2" /> SHARE</>
              )}
            </PixelButton>
            {isCreator && status === "pending" && (
              <PixelButton variant="ghost" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" /> CANCEL
              </PixelButton>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <DeckPanel
              deck={battle.creatorDeck}
              tools={creatorTools}
              stats={creatorStats}
              label="CHALLENGER 1"
              color="primary"
              isOwner={isCreator}
              votes={battle.votesForCreator}
              totalVotes={totalVotes}
              canVote={canVote}
              hasVoted={userVote?.votedForDeckId === battle.creatorDeck?._id || false}
              onVote={() => battle.creatorDeck && handleVote(battle.creatorDeck._id)}
              isVoting={isVoting}
              isWinner={status === "completed" && battle.winnerId === battle.creatorDeck?._id}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {battle.challengerDeck ? (
              <DeckPanel
                deck={battle.challengerDeck}
                tools={challengerTools}
                stats={challengerStats}
                label="CHALLENGER 2"
                color="orange"
                isOwner={isChallenger}
                votes={battle.votesForChallenger}
                totalVotes={totalVotes}
                canVote={canVote}
                hasVoted={userVote?.votedForDeckId === battle.challengerDeck?._id || false}
                onVote={() => battle.challengerDeck && handleVote(battle.challengerDeck._id)}
                isVoting={isVoting}
                isWinner={status === "completed" && battle.winnerId === battle.challengerDeck?._id}
              />
            ) : (
              <PixelCard className="h-full min-h-[400px] border-dashed flex items-center justify-center">
                <div className="text-center p-6">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-primary text-sm mb-2">WAITING FOR CHALLENGER</h3>
                  <p className="text-muted-foreground text-xs mb-6 max-w-xs">
                    Share this battle link to invite someone to challenge you!
                  </p>
                  {canJoin && (
                    <PixelButton onClick={() => setShowJoinModal(true)}>
                      <Swords className="w-4 h-4 mr-2" /> ACCEPT CHALLENGE
                    </PixelButton>
                  )}
                  {!user && (
                    <Link href="/sign-in">
                      <PixelButton variant="outline">
                        <Users className="w-4 h-4 mr-2" /> SIGN IN TO JOIN
                      </PixelButton>
                    </Link>
                  )}
                </div>
              </PixelCard>
            )}
          </motion.div>
        </div>

        {battle.challengerDeck && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PixelCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-primary text-sm uppercase">Stats Comparison</h2>
              </div>

              <div className="space-y-4">
                {statConfig.map(({ key, label, color, icon: Icon }) => {
                  const creatorValue = creatorStats[key as keyof typeof creatorStats];
                  const challengerValue = challengerStats[key as keyof typeof challengerStats];
                  const maxValue = Math.max(creatorValue, challengerValue, 1);
                  const creatorWins = creatorValue > challengerValue;
                  const challengerWins = challengerValue > creatorValue;

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="uppercase">{label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono ${creatorWins ? "text-primary font-bold" : "text-muted-foreground"}`}>
                              {creatorValue}
                            </span>
                            <div className="flex-1 h-3 bg-background rounded-full overflow-hidden border border-border">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(creatorValue / maxValue) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-full ${color}`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-8 text-center">
                          {creatorWins && <Crown className="w-4 h-4 text-primary mx-auto" />}
                          {challengerWins && <Crown className="w-4 h-4 text-orange-400 mx-auto" />}
                          {!creatorWins && !challengerWins && <span className="text-xs text-muted-foreground">=</span>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-row-reverse">
                            <span className={`text-xs font-mono ${challengerWins ? "text-orange-400 font-bold" : "text-muted-foreground"}`}>
                              {challengerValue}
                            </span>
                            <div className="flex-1 h-3 bg-background rounded-full overflow-hidden border border-border">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(challengerValue / maxValue) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-orange-500 float-right"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PixelCard>
          </motion.div>
        )}

        {!user && (status === "active" || status === "voting") && (
          <PixelCard className="mt-8 p-6 text-center">
            <Vote className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h3 className="text-primary text-sm mb-2">SIGN IN TO VOTE</h3>
            <p className="text-muted-foreground text-xs mb-4">
              Cast your vote for the best tech stack!
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
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinModal(false)}
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
                    <Swords className="w-5 h-5" /> ACCEPT CHALLENGE
                  </h2>
                  <button
                    onClick={() => setShowJoinModal(false)}
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
                          You need a public deck to join this battle
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

                  <div className="flex gap-3">
                    <PixelButton
                      variant="outline"
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1"
                    >
                      CANCEL
                    </PixelButton>
                    <PixelButton
                      onClick={handleJoinBattle}
                      disabled={!selectedDeckId || isJoining}
                      className="flex-1"
                    >
                      {isJoining ? (
                        "JOINING..."
                      ) : (
                        <>
                          <Swords className="w-4 h-4 mr-2" /> JOIN BATTLE
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

interface DeckPanelProps {
  deck: {
    _id: Id<"userDecks">;
    name: string;
    description?: string;
  } | null;
  tools: ({ _id: Id<"tools">; name: string; logoUrl?: string; stats?: { hp: number; attack: number; defense: number; speed: number; mana: number } } | null)[];
  stats: { hp: number; attack: number; defense: number; speed: number; mana: number };
  label: string;
  color: "primary" | "orange";
  isOwner: boolean;
  votes: number;
  totalVotes: number;
  canVote: boolean;
  hasVoted: boolean;
  onVote: () => void;
  isVoting: boolean;
  isWinner: boolean;
}

function DeckPanel({
  deck,
  tools,
  stats,
  label,
  color,
  isOwner,
  votes,
  totalVotes,
  canVote,
  hasVoted,
  onVote,
  isVoting,
  isWinner,
}: DeckPanelProps) {
  const colorClass = color === "primary" ? "text-primary" : "text-orange-400";
  const bgClass = color === "primary" ? "bg-primary" : "bg-orange-400";
  const borderClass = color === "primary" ? "border-primary" : "border-orange-400";

  const totalScore = stats.hp + stats.attack + stats.defense + stats.speed + stats.mana;
  const votePercentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

  return (
    <PixelCard className={`h-full ${isWinner ? `border-2 ${borderClass}` : ""}`}>
      <PixelCardHeader>
        <div className="flex items-center justify-between">
          <PixelCardTitle className={`flex items-center gap-2 ${colorClass}`}>
            <Package className="w-4 h-4" />
            {label}
            {isOwner && (
              <PixelBadge variant="outline" className="text-[10px] ml-2">YOU</PixelBadge>
            )}
          </PixelCardTitle>
          {isWinner && (
            <div className="flex items-center gap-1">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-bold">WINNER</span>
            </div>
          )}
        </div>
      </PixelCardHeader>
      <PixelCardContent>
        <h3 className="text-foreground font-semibold mb-2">{deck?.name || "Unknown Deck"}</h3>
        {deck?.description && (
          <p className="text-muted-foreground text-xs mb-4 line-clamp-2">{deck.description}</p>
        )}

        <div className="mb-4">
          <p className="text-muted-foreground text-xs mb-2">TOOLS ({tools.filter(Boolean).length})</p>
          <div className="flex flex-wrap gap-2">
            {tools.filter((t): t is NonNullable<typeof t> => t !== null).map((tool) => (
              <div
                key={tool._id}
                className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border"
                title={tool.name}
              >
                <div className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center">
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-4 h-4 object-contain" />
                  ) : (
                    <Wrench className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-foreground text-xs">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-background border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs">TOTAL POWER</span>
            <span className={`font-mono font-bold ${colorClass}`}>{totalScore}</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {statConfig.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <Icon className="w-3 h-3 mx-auto text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground block">{label}</span>
                <span className="text-xs font-mono text-foreground">
                  {stats[key as keyof typeof stats]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {totalVotes > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>VOTES</span>
              <span>{votes} ({votePercentage.toFixed(0)}%)</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${votePercentage}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full ${bgClass}`}
              />
            </div>
          </div>
        )}

        {canVote && (
          <PixelButton
            onClick={onVote}
            disabled={isVoting}
            className="w-full"
            variant={color === "primary" ? "default" : "outline"}
          >
            {isVoting ? (
              "VOTING..."
            ) : (
              <>
                <Vote className="w-4 h-4 mr-2" /> VOTE FOR THIS STACK
              </>
            )}
          </PixelButton>
        )}

        {hasVoted && (
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${color === "primary" ? "bg-primary/10" : "bg-orange-400/10"}`}>
            <CheckCircle className={`w-4 h-4 ${colorClass}`} />
            <span className={`text-sm ${colorClass}`}>YOU VOTED FOR THIS STACK</span>
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  );
}
