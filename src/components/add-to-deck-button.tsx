"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelButton } from "./pixel-button";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import {
  Plus,
  Package,
  Check,
  X,
  FolderPlus,
  Loader2,
  Lock,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddToDeckButtonProps {
  toolId: Id<"tools">;
  toolName: string;
  onAddedToDeck?: () => void;
}

export function AddToDeckButton({ toolId, toolName, onAddedToDeck }: AddToDeckButtonProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckPublic, setNewDeckPublic] = useState(false);
  const [addingToDeckId, setAddingToDeckId] = useState<Id<"userDecks"> | null>(null);
  const [successDeckId, setSuccessDeckId] = useState<Id<"userDecks"> | null>(null);

  const userDecks = useQuery(
    api.decks.getUserDecks,
    user?.id ? {} : "skip"
  );

  const addToolToDeck = useMutation(api.decks.addToolToDeck);
  const createDeck = useMutation(api.decks.createDeck);
  const recordMasteryInteraction = useMutation(api.mastery.recordInteraction);

  const handleAddToDeck = async (deckId: Id<"userDecks">) => {
    if (!user?.id) return;
    
    setAddingToDeckId(deckId);
    try {
      await addToolToDeck({ deckId, toolId });
      await recordMasteryInteraction({
        userId: user.id,
        toolId,
        interactionType: "deckAdd",
      });
      setSuccessDeckId(deckId);
      setTimeout(() => {
        setSuccessDeckId(null);
      }, 2000);
      onAddedToDeck?.();
    } catch (error) {
    } finally {
      setAddingToDeckId(null);
    }
  };

  const handleCreateDeck = async () => {
    if (!user?.id || !newDeckName.trim()) return;

    setIsCreating(true);
    try {
      const deckId = await createDeck({
        name: newDeckName.trim(),
        toolIds: [toolId],
        isPublic: newDeckPublic,
      });
      await recordMasteryInteraction({
        userId: user.id,
        toolId,
        interactionType: "deckAdd",
      });
      setNewDeckName("");
      setNewDeckPublic(false);
      setSuccessDeckId(deckId);
      setTimeout(() => {
        setSuccessDeckId(null);
        setIsOpen(false);
      }, 1500);
      onAddedToDeck?.();
    } catch (error) {
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <PixelButton variant="outline" size="sm" disabled>
        <Plus className="w-4 h-4 mr-2" /> ADD TO DECK
      </PixelButton>
    );
  }

  return (
    <div className="relative">
      <PixelButton
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="w-4 h-4 mr-2" /> ADD TO DECK
      </PixelButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 w-72"
            >
              <PixelCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-primary text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" /> ADD TO DECK
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {userDecks === undefined && (
                    <div className="text-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  )}

                  {userDecks && userDecks.length === 0 && (
                    <p className="text-muted-foreground text-xs text-center py-2">
                      NO DECKS YET
                    </p>
                  )}

                  {userDecks?.map((deck) => {
                    const isInDeck = deck.toolIds.includes(toolId);
                    const isAdding = addingToDeckId === deck._id;
                    const isSuccess = successDeckId === deck._id;

                    return (
                      <button
                        key={deck._id}
                        onClick={() => !isInDeck && handleAddToDeck(deck._id)}
                        disabled={isInDeck || isAdding}
                        className={`w-full flex items-center gap-2 p-2 border transition-colors text-left ${
                          isInDeck
                            ? "border-green-500/50 bg-green-500/10 cursor-default"
                            : isSuccess
                            ? "border-green-500 bg-green-500/20"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-primary text-xs truncate">
                            {deck.name}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            {deck.toolIds.length} TOOLS
                          </p>
                        </div>
                        {isAdding ? (
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        ) : isInDeck || isSuccess ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Plus className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground text-[10px] mb-2 flex items-center gap-1">
                    <FolderPlus className="w-3 h-3" /> CREATE NEW DECK
                  </p>
                  <div className="space-y-2">
                    <PixelInput
                      placeholder="Deck name..."
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      className="text-xs"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setNewDeckPublic(!newDeckPublic)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"
                      >
                        {newDeckPublic ? (
                          <>
                            <Globe className="w-3 h-3" /> PUBLIC
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" /> PRIVATE
                          </>
                        )}
                      </button>
                      <PixelButton
                        size="sm"
                        onClick={handleCreateDeck}
                        disabled={!newDeckName.trim() || isCreating}
                      >
                        {isCreating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" /> CREATE
                          </>
                        )}
                      </PixelButton>
                    </div>
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
