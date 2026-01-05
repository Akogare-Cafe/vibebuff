"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  X,
  Code,
  MessageCircle,
} from "lucide-react";

type ShareType = "tool" | "deck" | "profile" | "comparison" | "tier_list" | "stack" | "referral";

interface ShareModalProps {
  shareType: ShareType;
  resourceId?: string;
  title: string;
  description?: string;
  shareUrl: string;
  embedCode?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function ShareModal({
  shareType,
  resourceId,
  title,
  description,
  shareUrl,
  embedCode,
  trigger,
  children,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [open, setOpen] = useState(false);
  const trackShare = useMutation(api.referrals.trackShareEvent);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    await trackShare({
      shareType,
      platform: "copy_link",
      resourceId,
      shareUrl,
    });
  };

  const handleCopyEmbed = async () => {
    if (embedCode) {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
      await trackShare({
        shareType,
        platform: "embed",
        resourceId,
        shareUrl,
      });
    }
  };

  const shareText = description || `Check out ${title} on VibeBuff!`;

  const handleTwitterShare = async () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
    await trackShare({
      shareType,
      platform: "twitter",
      resourceId,
      shareUrl,
    });
  };

  const handleLinkedInShare = async () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
    await trackShare({
      shareType,
      platform: "linkedin",
      resourceId,
      shareUrl,
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        await trackShare({
          shareType,
          platform: "native_share",
          resourceId,
          shareUrl,
        });
      } catch {
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <PixelButton size="sm" variant="outline">
            <Share2 className="w-3 h-3 mr-1" /> SHARE
          </PixelButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" /> SHARE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground text-xs mb-2 uppercase">
              {title}
            </p>
          </div>

          <div>
            <p className="text-primary text-xs mb-2">SHARE LINK</p>
            <div className="flex gap-2">
              <PixelInput
                value={shareUrl}
                readOnly
                className="flex-1 text-xs"
              />
              <PixelButton size="sm" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </PixelButton>
            </div>
          </div>

          <div>
            <p className="text-primary text-xs mb-2">SHARE ON</p>
            <div className="flex gap-2 flex-wrap">
              <PixelButton size="sm" variant="outline" onClick={handleTwitterShare}>
                <Twitter className="w-3 h-3 mr-1" /> X
              </PixelButton>
              <PixelButton size="sm" variant="outline" onClick={handleLinkedInShare}>
                <Linkedin className="w-3 h-3 mr-1" /> LINKEDIN
              </PixelButton>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <PixelButton size="sm" variant="outline" onClick={handleNativeShare}>
                  <MessageCircle className="w-3 h-3 mr-1" /> MORE
                </PixelButton>
              )}
            </div>
          </div>

          {embedCode && (
            <div className="border-t border-border pt-4">
              <p className="text-primary text-xs mb-2">EMBED CODE</p>
              <div className="bg-[#0a0f1a] border-2 border-border p-3 rounded">
                <code className="text-muted-foreground text-[10px] break-all block max-h-20 overflow-auto">
                  {embedCode}
                </code>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-muted-foreground text-[10px]">
                  ADD TO YOUR README OR WEBSITE
                </p>
                <PixelButton size="sm" variant="ghost" onClick={handleCopyEmbed}>
                  {copiedEmbed ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Code className="w-3 h-3" />
                  )}
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShareButton({
  shareType,
  resourceId,
  title,
  description,
  shareUrl,
  embedCode,
  className,
  size = "sm",
  variant = "outline",
}: ShareModalProps & {
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost";
}) {
  return (
    <ShareModal
      shareType={shareType}
      resourceId={resourceId}
      title={title}
      description={description}
      shareUrl={shareUrl}
      embedCode={embedCode}
    >
      <PixelButton size={size} variant={variant} className={className}>
        <Share2 className="w-3 h-3 mr-1" /> SHARE
      </PixelButton>
    </ShareModal>
  );
}
