"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { DynamicIcon } from "./dynamic-icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Layers,
  Plus,
  X,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Shield,
  Swords,
  Zap
} from "lucide-react";

interface DeckLoadoutProps {
  deckId: Id<"userDecks">;
  userId: string;
  className?: string;
}

const SLOT_ICONS: Record<string, string> = {
  "frontend-frameworks": "Layout",
  "meta-frameworks": "Layers",
  "backend": "Server",
  "databases": "Database",
  "auth": "Shield",
  "hosting": "Cloud",
  "styling": "Palette",
  "state-management": "GitBranch",
  "testing": "TestTube",
  "ai-ml": "Bot",
  "devops": "Container",
  "monitoring": "Activity",
};

export function DeckLoadout({ deckId, userId, className }: DeckLoadoutProps) {
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  
  const deckWithCategories = useQuery(api.decks.getDeckWithCategories, { deckId });
  const assignToolToSlot = useMutation(api.decks.assignToolToSlot);
  const removeToolFromSlot = useMutation(api.decks.removeToolFromSlot);

  if (!deckWithCategories) {
    return (
      <PixelCard className="p-6 text-center">
        <div className="text-muted-foreground text-sm pixel-loading">LOADING LOADOUT...</div>
      </PixelCard>
    );
  }

  const { slots } = deckWithCategories;
  const filledSlots = slots.filter((s) => s.assignedTool).length;
  const totalSlots = slots.length;
  const loadoutScore = Math.round((filledSlots / Math.max(totalSlots, 1)) * 100);

  const handleAssign = async (categorySlug: string, toolId: Id<"tools">) => {
    await assignToolToSlot({ deckId, categorySlug, toolId });
    setExpandedSlot(null);
  };

  const handleRemove = async (categorySlug: string) => {
    await removeToolFromSlot({ deckId, categorySlug });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-primary text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" /> LOADOUT SLOTS
          </h2>
          <div className="flex items-center gap-2">
            <PixelBadge 
              variant={loadoutScore >= 80 ? "default" : "outline"}
              className={cn(
                "text-xs",
                loadoutScore >= 80 && "bg-green-400 text-black"
              )}
            >
              {filledSlots}/{totalSlots} EQUIPPED
            </PixelBadge>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">LOADOUT COMPLETION</span>
            <span className="text-primary">{loadoutScore}%</span>
          </div>
          <div className="h-3 bg-[#0a0f1a] border border-border">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                loadoutScore >= 80 ? "bg-green-400" : 
                loadoutScore >= 50 ? "bg-yellow-400" : "bg-primary"
              )}
              style={{ width: `${loadoutScore}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {slots.map((slot) => (
            <LoadoutSlot
              key={slot.category._id}
              slot={slot}
              isExpanded={expandedSlot === slot.category.slug}
              onToggle={() => setExpandedSlot(
                expandedSlot === slot.category.slug ? null : slot.category.slug
              )}
              onAssign={(toolId) => handleAssign(slot.category.slug, toolId)}
              onRemove={() => handleRemove(slot.category.slug)}
            />
          ))}
        </div>

        {slots.length === 0 && (
          <div className="text-center py-8">
            <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">NO TOOLS IN DECK</p>
            <p className="text-muted-foreground text-xs">Add tools to see available slots</p>
          </div>
        )}
      </PixelCard>

      {loadoutScore === 100 && (
        <PixelCard className="p-4 border-yellow-400 bg-yellow-400/10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-yellow-400 text-base">LOADOUT COMPLETE!</p>
              <p className="text-muted-foreground text-xs">All slots equipped - ready for battle!</p>
            </div>
          </div>
        </PixelCard>
      )}
    </div>
  );
}

interface LoadoutSlotProps {
  slot: {
    category: {
      _id: Id<"categories">;
      name: string;
      slug: string;
      icon?: string;
    };
    assignedTool: {
      _id: Id<"tools">;
      name: string;
      tagline: string;
      pricingModel: string;
    } | null;
    availableTools: Array<{
      _id: Id<"tools">;
      name: string;
      tagline: string;
      pricingModel: string;
    } | null>;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onAssign: (toolId: Id<"tools">) => void;
  onRemove: () => void;
}

function LoadoutSlot({ slot, isExpanded, onToggle, onAssign, onRemove }: LoadoutSlotProps) {
  const iconName = SLOT_ICONS[slot.category.slug] || slot.category.icon || "Package";
  const hasAssigned = !!slot.assignedTool;
  const validTools = slot.availableTools.filter((t): t is NonNullable<typeof t> => t !== null);
  const hasOptions = validTools.length > 0;

  return (
    <div className={cn(
      "border-2 transition-all",
      hasAssigned ? "border-green-400 bg-green-400/5" : "border-border",
      isExpanded && "border-primary"
    )}>
      <button
        onClick={onToggle}
        disabled={!hasOptions && !hasAssigned}
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 border-2 flex items-center justify-center",
            hasAssigned ? "border-green-400 bg-green-400/20" : "border-border bg-[#0a0f1a]"
          )}>
            <DynamicIcon 
              name={iconName} 
              className={cn(
                "w-5 h-5",
                hasAssigned ? "text-green-400" : "text-muted-foreground"
              )} 
            />
          </div>
          <div>
            <p className="text-primary text-sm uppercase">{slot.category.name}</p>
            {hasAssigned ? (
              <p className="text-green-400 text-sm">{slot.assignedTool!.name}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                {hasOptions ? `${slot.availableTools.length} available` : "No tools available"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAssigned && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {(hasOptions || hasAssigned) && (
            isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </div>
      </button>

      {isExpanded && hasOptions && (
        <div className="border-t border-border p-3 bg-[#0a0f1a]">
          <p className="text-muted-foreground text-xs mb-2">SELECT TOOL FOR THIS SLOT:</p>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {validTools.map((tool) => (
              <button
                key={tool._id}
                onClick={() => onAssign(tool._id)}
                className={cn(
                  "flex items-center justify-between p-2 border text-left transition-colors",
                  slot.assignedTool?._id === tool._id 
                    ? "border-green-400 bg-green-400/10" 
                    : "border-border hover:border-primary"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm truncate">{tool.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{tool.tagline}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <PixelBadge variant="outline" className="text-[6px]">
                    {tool.pricingModel}
                  </PixelBadge>
                  {slot.assignedTool?._id === tool._id && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LoadoutPreview({ deckId }: { deckId: Id<"userDecks"> }) {
  const deckWithCategories = useQuery(api.decks.getDeckWithCategories, { deckId });

  if (!deckWithCategories) return null;

  const { slots } = deckWithCategories;
  const equippedSlots = slots.filter((s) => s.assignedTool);

  if (equippedSlots.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {equippedSlots.slice(0, 6).map((slot) => (
        <div 
          key={slot.category._id}
          className="border border-green-400 bg-green-400/10 p-1"
          title={`${slot.category.name}: ${slot.assignedTool?.name}`}
        >
          <DynamicIcon 
            name={SLOT_ICONS[slot.category.slug] || "Package"} 
            className="w-4 h-4 text-green-400" 
          />
        </div>
      ))}
      {equippedSlots.length > 6 && (
        <PixelBadge variant="outline" className="text-[6px]">
          +{equippedSlots.length - 6}
        </PixelBadge>
      )}
    </div>
  );
}

export function LoadoutStats({ deckId }: { deckId: Id<"userDecks"> }) {
  const deckWithCategories = useQuery(api.decks.getDeckWithCategories, { deckId });

  if (!deckWithCategories) return null;

  const { slots, tools } = deckWithCategories;
  const equippedCount = slots.filter((s) => s.assignedTool).length;
  const totalSlots = slots.length;
  
  const openSourceCount = tools.filter((t: any) => t?.isOpenSource).length;
  const freeCount = tools.filter((t: any) => 
    t?.pricingModel === "free" || t?.pricingModel === "open_source"
  ).length;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" /> LOADOUT STATS
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Slots Equipped</span>
          <PixelBadge 
            variant={equippedCount === totalSlots ? "default" : "outline"}
            className={cn(
              "text-xs",
              equippedCount === totalSlots && "bg-green-400 text-black"
            )}
          >
            {equippedCount}/{totalSlots}
          </PixelBadge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Total Tools</span>
          <span className="text-primary text-sm">{tools.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Open Source</span>
          <span className="text-primary text-sm">{openSourceCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Free Tools</span>
          <span className="text-primary text-sm">{freeCount}</span>
        </div>

        {equippedCount === totalSlots && totalSlots > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-green-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">LOADOUT COMPLETE!</span>
            </div>
          </div>
        )}
      </div>
    </PixelCard>
  );
}
