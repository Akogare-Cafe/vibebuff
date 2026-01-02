"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { DeckSynergyDisplay } from "./synergy-matrix";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Save, 
  Share2, 
  Copy, 
  Check,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  Swords
} from "lucide-react";
import { DeckLoadout } from "./deck-loadout";

interface DeckBuilderProps {
  userId: string;
  deckId?: Id<"userDecks">;
  className?: string;
}

export function DeckBuilder({ userId, deckId, className }: DeckBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedToolIds, setSelectedToolIds] = useState<Id<"tools">[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const existingDeck = useQuery(
    api.decks.getDeck,
    deckId ? { deckId } : "skip"
  );

  const allTools = useQuery(api.tools.list, { limit: 100 });
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );

  const createDeck = useMutation(api.decks.createDeck);
  const updateDeck = useMutation(api.decks.updateDeck);
  const addToolToDeck = useMutation(api.decks.addToolToDeck);
  const removeToolFromDeck = useMutation(api.decks.removeToolFromDeck);

  useEffect(() => {
    if (existingDeck) {
      setName(existingDeck.name);
      setDescription(existingDeck.description || "");
      setSelectedToolIds(existingDeck.toolIds);
      setIsPublic(existingDeck.isPublic);
    }
  }, [existingDeck]);

  const handleAddTool = async (toolId: Id<"tools">) => {
    if (selectedToolIds.includes(toolId)) return;
    
    if (deckId) {
      await addToolToDeck({ deckId, toolId });
    }
    setSelectedToolIds([...selectedToolIds, toolId]);
    setSearchQuery("");
  };

  const handleRemoveTool = async (toolId: Id<"tools">) => {
    if (deckId) {
      await removeToolFromDeck({ deckId, toolId });
    }
    setSelectedToolIds(selectedToolIds.filter((id) => id !== toolId));
  };

  const handleSave = async () => {
    if (deckId) {
      await updateDeck({
        deckId,
        name,
        description,
        toolIds: selectedToolIds,
        isPublic,
      });
    } else {
      await createDeck({
        userId,
        name,
        description,
        toolIds: selectedToolIds,
        isPublic,
      });
    }
  };

  const handleCopyShareLink = () => {
    if (existingDeck?.shareToken) {
      navigator.clipboard.writeText(
        `${window.location.origin}/decks/${existingDeck.shareToken}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedTools = allTools?.filter((t) => selectedToolIds.includes(t._id)) || [];
  const availableTools = searchResults || allTools?.slice(0, 20) || [];

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Deck Info */}
      <div className="lg:col-span-2 space-y-4">
        <PixelCard className="p-4">
          <h2 className="text-[#60a5fa] text-sm mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 
            {deckId ? "EDIT DECK" : "CREATE NEW DECK"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[#3b82f6] text-[10px] block mb-1">DECK NAME</label>
              <PixelInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="MY AWESOME STACK"
              />
            </div>

            <div>
              <label className="text-[#3b82f6] text-[10px] block mb-1">DESCRIPTION</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this stack for?"
                className="w-full bg-[#0a1628] border-4 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] focus:border-[#3b82f6] outline-none resize-none h-20"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="accent-[#3b82f6]"
                />
                <span className="text-[#3b82f6] text-[10px]">PUBLIC DECK</span>
              </label>

              {existingDeck?.shareToken && (
                <PixelButton variant="ghost" size="sm" onClick={handleCopyShareLink}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="ml-1">{copied ? "COPIED!" : "COPY LINK"}</span>
                </PixelButton>
              )}
            </div>
          </div>
        </PixelCard>

        {/* Selected Tools */}
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center justify-between">
            <span>DECK CONTENTS ({selectedTools.length})</span>
            <PixelBadge variant="outline">{selectedTools.length} TOOLS</PixelBadge>
          </h3>

          {selectedTools.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
              <p className="text-[#3b82f6] text-[10px]">NO TOOLS ADDED YET</p>
              <p className="text-[#1e3a5f] text-[8px]">Search below to add tools</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedTools.map((tool) => (
                <div
                  key={tool._id}
                  className="border-2 border-[#1e3a5f] p-3 bg-[#0a1628] group relative"
                >
                  <button
                    onClick={() => handleRemoveTool(tool._id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  
                  <p className="text-[#60a5fa] text-[10px] mb-1">{tool.name}</p>
                  <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                  
                  <div className="flex gap-1 mt-2">
                    <PixelBadge variant="outline" className="text-[6px]">
                      {tool.pricingModel}
                    </PixelBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PixelCard>

        {/* Tool Search */}
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">ADD TOOLS</h3>
          
          <PixelInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH TOOLS..."
            className="mb-4"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {availableTools
              .filter((t) => !selectedToolIds.includes(t._id))
              .slice(0, 16)
              .map((tool) => (
                <button
                  key={tool._id}
                  onClick={() => handleAddTool(tool._id)}
                  className="border-2 border-[#1e3a5f] p-2 bg-[#0a1628] hover:border-[#3b82f6] transition-colors text-left"
                >
                  <p className="text-[#60a5fa] text-[8px]">{tool.name}</p>
                  <p className="text-[#3b82f6] text-[6px] truncate">{tool.tagline}</p>
                </button>
              ))}
          </div>
        </PixelCard>

        {/* Save Button */}
        <div className="flex gap-4">
          <PixelButton onClick={handleSave} disabled={!name || selectedToolIds.length === 0}>
            <Save className="w-4 h-4 mr-2" /> SAVE DECK
          </PixelButton>
        </div>
      </div>

      {/* Synergy Panel */}
      <div className="space-y-4">
        <DeckSynergyDisplay toolIds={selectedToolIds} />
        
        {/* Quick Stats */}
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">DECK STATS</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#3b82f6]">Total Tools</span>
              <span className="text-[#60a5fa]">{selectedTools.length}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#3b82f6]">Open Source</span>
              <span className="text-[#60a5fa]">
                {selectedTools.filter((t) => t.isOpenSource).length}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#3b82f6]">Free Tools</span>
              <span className="text-[#60a5fa]">
                {selectedTools.filter((t) => t.pricingModel === "free" || t.pricingModel === "open_source").length}
              </span>
            </div>
          </div>
        </PixelCard>

        {/* Loadout Slots - RPG Style */}
        {deckId && (
          <PixelCard className="p-4">
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> EQUIP LOADOUT
            </h3>
            <p className="text-[#3b82f6] text-[8px] mb-4">
              Assign tools to category slots for your battle loadout
            </p>
            <DeckLoadout deckId={deckId} userId={userId} />
          </PixelCard>
        )}
      </div>
    </div>
  );
}

// Deck Card for listing
interface DeckCardProps {
  deck: {
    _id: Id<"userDecks">;
    name: string;
    description?: string;
    toolIds: Id<"tools">[];
    isPublic: boolean;
    totalSynergyScore?: number;
    tools?: { name: string; slug: string }[];
  };
  showActions?: boolean;
  onDelete?: () => void;
}

export function DeckCard({ deck, showActions, onDelete }: DeckCardProps) {
  return (
    <PixelCard className="p-4 h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[#60a5fa] text-[12px]">{deck.name}</h3>
          {deck.description && (
            <p className="text-[#3b82f6] text-[8px] mt-1">{deck.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {deck.isPublic && (
            <Share2 className="w-3 h-3 text-[#3b82f6]" />
          )}
          {deck.totalSynergyScore !== undefined && (
            <PixelBadge 
              variant={deck.totalSynergyScore >= 50 ? "default" : "outline"}
              className="text-[6px]"
            >
              <Sparkles className="w-2 h-2 mr-1" />
              {deck.totalSynergyScore > 0 ? "+" : ""}{deck.totalSynergyScore}
            </PixelBadge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {deck.tools?.slice(0, 5).map((tool) => (
          <PixelBadge key={tool.slug} variant="outline" className="text-[6px]">
            {tool.name}
          </PixelBadge>
        ))}
        {deck.toolIds.length > 5 && (
          <PixelBadge variant="outline" className="text-[6px]">
            +{deck.toolIds.length - 5} more
          </PixelBadge>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Link href={`/decks/${deck._id}`}>
            <PixelButton variant="ghost" size="sm">
              <ExternalLink className="w-3 h-3 mr-1" /> VIEW
            </PixelButton>
          </Link>
          {onDelete && (
            <PixelButton variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-3 h-3 mr-1" /> DELETE
            </PixelButton>
          )}
        </div>
      )}
    </PixelCard>
  );
}
