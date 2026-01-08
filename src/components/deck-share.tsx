"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import { 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin,
  Link as LinkIcon,
  X
} from "lucide-react";

interface DeckShareProps {
  deckId: Id<"userDecks">;
  deckName: string;
  shareToken?: string;
  isPublic: boolean;
  toolCount: number;
  onClose?: () => void;
}

export function DeckShare({ 
  deckId, 
  deckName, 
  shareToken, 
  isPublic, 
  toolCount,
  onClose 
}: DeckShareProps) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateDeck = useMutation(api.decks.updateDeck);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  const shareUrl = shareToken ? `${siteUrl}/deck/${shareToken}` : null;

  const handleMakePublic = async () => {
    setIsUpdating(true);
    try {
      await updateDeck({
        deckId,
        isPublic: true,
      });
    } catch (error) {
      console.error("Error making deck public:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `Check out my tech stack "${deckName}" with ${toolCount} tools on VibeBuff!`;
  
  const twitterUrl = shareUrl 
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    : null;
  
  const linkedinUrl = shareUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : null;

  return (
    <PixelCard className="p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary text-sm flex items-center gap-2">
          <Share2 className="w-4 h-4" /> SHARE DECK
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-muted-foreground text-sm mb-4">
        DECK: {deckName.toUpperCase()}
      </p>

      {!isPublic ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs mb-4">
            THIS DECK IS PRIVATE. MAKE IT PUBLIC TO SHARE.
          </p>
          <PixelButton onClick={handleMakePublic} disabled={isUpdating}>
            <Share2 className="w-3 h-3 mr-2" />
            {isUpdating ? "UPDATING..." : "MAKE PUBLIC"}
          </PixelButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-primary text-xs mb-2">SHARE LINK</p>
            <div className="flex gap-2">
              <PixelInput 
                value={shareUrl || ""} 
                readOnly 
                className="flex-1 text-xs"
              />
              <PixelButton size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </PixelButton>
            </div>
          </div>

          <div>
            <p className="text-primary text-xs mb-2">SHARE ON</p>
            <div className="flex gap-2">
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                  <PixelButton size="sm" variant="outline">
                    <Twitter className="w-3 h-3 mr-1" /> X
                  </PixelButton>
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <PixelButton size="sm" variant="outline">
                    <Linkedin className="w-3 h-3 mr-1" /> LINKEDIN
                  </PixelButton>
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-primary text-xs mb-2">EMBED BADGE</p>
            <div className="bg-[#0a0f1a] border-2 border-border p-3">
              <code className="text-muted-foreground text-[6px] break-all">
                {`[![My Stack](${siteUrl}/api/badge/${shareToken})](${shareUrl})`}
              </code>
            </div>
            <p className="text-muted-foreground text-[6px] mt-2">
              ADD THIS TO YOUR README TO SHOW YOUR STACK
            </p>
          </div>
        </div>
      )}
    </PixelCard>
  );
}
