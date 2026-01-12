"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import { PixelBadge } from "@/components/pixel-badge";
import {
  Users,
  Copy,
  Check,
  Gift,
  Twitter,
  Linkedin,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";

interface ReferralCardProps {
  compact?: boolean;
}

export function ReferralCard({ compact = false }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const referralStats = useQuery(api.referrals.getReferralStats);
  const getOrCreateCode = useMutation(api.referrals.getOrCreateReferralCode);
  const trackShare = useMutation(api.referrals.trackShareEvent);
  const [isGenerating, setIsGenerating] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  const referralUrl = referralStats?.code
    ? `${siteUrl}/r/${referralStats.code}`
    : null;

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      await getOrCreateCode({});
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (referralUrl) {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await trackShare({
        shareType: "referral",
        platform: "copy_link",
        shareUrl: referralUrl,
      });
    }
  };

  const shareText = `Join me on VibeBuff - the ultimate platform for discovering and comparing dev tools! Use my referral link to get bonus XP:`;

  const handleTwitterShare = async () => {
    if (referralUrl) {
      const urlWithUtm = `${referralUrl}${referralUrl.includes('?') ? '&' : '?'}utm_source=twitter&utm_medium=social&utm_campaign=referral_share`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(urlWithUtm)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
      await trackShare({
        shareType: "referral",
        platform: "twitter",
        shareUrl: referralUrl,
      });
    }
  };

  const handleLinkedInShare = async () => {
    if (referralUrl) {
      const urlWithUtm = `${referralUrl}${referralUrl.includes('?') ? '&' : '?'}utm_source=linkedin&utm_medium=social&utm_campaign=referral_share`;
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlWithUtm)}`;
      window.open(linkedinUrl, "_blank", "noopener,noreferrer");
      await trackShare({
        shareType: "referral",
        platform: "linkedin",
        shareUrl: referralUrl,
      });
    }
  };

  if (compact) {
    return (
      <PixelCard className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Invite Friends</p>
              <p className="text-xs text-muted-foreground">
                Earn {referralStats?.rewardPerReferral || 500} XP per referral
              </p>
            </div>
          </div>
          {referralStats?.code ? (
            <PixelButton size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span className="ml-1">{referralStats.code}</span>
            </PixelButton>
          ) : (
            <PixelButton size="sm" onClick={handleGenerateCode} disabled={isGenerating}>
              {isGenerating ? "..." : "GET CODE"}
            </PixelButton>
          )}
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard rarity="rare">
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          INVITE FRIENDS
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-muted-foreground text-sm mb-2">
            Share VibeBuff with friends and both earn rewards!
          </p>
          <div className="flex justify-center gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {referralStats?.rewardPerReferral || 500}
              </p>
              <p className="text-xs text-muted-foreground">XP FOR YOU</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-primary">250</p>
              <p className="text-xs text-muted-foreground">XP FOR FRIEND</p>
            </div>
          </div>
        </div>

        {referralStats?.code ? (
          <>
            <div>
              <p className="text-primary text-xs mb-2">YOUR REFERRAL LINK</p>
              <div className="flex gap-2">
                <PixelInput
                  value={referralUrl || ""}
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
                <PixelButton size="sm" variant="outline" onClick={handleTwitterShare}>
                  <Twitter className="w-3 h-3 mr-1" /> X
                </PixelButton>
                <PixelButton size="sm" variant="outline" onClick={handleLinkedInShare}>
                  <Linkedin className="w-3 h-3 mr-1" /> LINKEDIN
                </PixelButton>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-primary text-xs mb-3">YOUR STATS</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold">{referralStats.totalReferrals}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Referrals</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold">{referralStats.completedReferrals}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Completed</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-primary">{referralStats.totalXpEarned}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">XP Earned</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <PixelButton onClick={handleGenerateCode} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "GENERATING..." : "GET YOUR REFERRAL CODE"}
            </PixelButton>
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  );
}

export function ReferralBanner() {
  const referralStats = useQuery(api.referrals.getReferralStats);
  const getOrCreateCode = useMutation(api.referrals.getOrCreateReferralCode);
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  const referralUrl = referralStats?.code
    ? `${siteUrl}/r/${referralStats.code}`
    : null;

  const handleCopyLink = async () => {
    if (referralUrl) {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateCode = async () => {
    await getOrCreateCode({});
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Invite friends, earn XP!</p>
            <p className="text-xs text-muted-foreground">
              Get {referralStats?.rewardPerReferral || 500} XP for each friend who joins
            </p>
          </div>
        </div>
        {referralStats?.code ? (
          <div className="flex items-center gap-2">
            <code className="bg-background px-3 py-1 rounded text-sm font-mono">
              {referralStats.code}
            </code>
            <PixelButton size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
            </PixelButton>
          </div>
        ) : (
          <PixelButton size="sm" onClick={handleGenerateCode}>
            GET CODE
          </PixelButton>
        )}
      </div>
    </div>
  );
}
