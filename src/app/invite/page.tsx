"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import {
  Gift,
  Users,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Share2,
  Sparkles,
  Trophy,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function InvitePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralStats = useQuery(
    api.referrals.getReferralStats,
    isSignedIn ? {} : "skip"
  );
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
      const urlWithUtm = `${referralUrl}${referralUrl.includes('?') ? '&' : '?'}utm_source=twitter&utm_medium=social&utm_campaign=invite_page`;
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
      const urlWithUtm = `${referralUrl}${referralUrl.includes('?') ? '&' : '?'}utm_source=linkedin&utm_medium=social&utm_campaign=invite_page`;
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlWithUtm)}`;
      window.open(linkedinUrl, "_blank", "noopener,noreferrer");
      await trackShare({
        shareType: "referral",
        platform: "linkedin",
        shareUrl: referralUrl,
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Invite Friends</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Share VibeBuff with your developer friends and earn XP rewards when they join!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <PixelCard className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">1. Share Your Link</h3>
            <p className="text-sm text-muted-foreground">
              Copy your unique referral link and share it with friends
            </p>
          </PixelCard>

          <PixelCard className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">2. Friends Sign Up</h3>
            <p className="text-sm text-muted-foreground">
              When they join using your link, they get 250 bonus XP
            </p>
          </PixelCard>

          <PixelCard className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">3. Earn Rewards</h3>
            <p className="text-sm text-muted-foreground">
              You earn 500 XP for each friend who joins
            </p>
          </PixelCard>
        </div>

        {isSignedIn ? (
          <div className="grid md:grid-cols-2 gap-8">
            <PixelCard rarity="rare">
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> YOUR REFERRAL LINK
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent className="space-y-4">
                {referralStats?.code ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">REFERRAL CODE</p>
                      <code className="text-2xl font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg block text-center">
                        {referralStats.code}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">SHARE LINK</p>
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
                      <p className="text-xs text-muted-foreground mb-2">SHARE ON</p>
                      <div className="flex gap-2">
                        <PixelButton size="sm" variant="outline" onClick={handleTwitterShare} className="flex-1">
                          <Twitter className="w-3 h-3 mr-1" /> X / TWITTER
                        </PixelButton>
                        <PixelButton size="sm" variant="outline" onClick={handleLinkedInShare} className="flex-1">
                          <Linkedin className="w-3 h-3 mr-1" /> LINKEDIN
                        </PixelButton>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Generate your unique referral code to start inviting friends
                    </p>
                    <PixelButton onClick={handleGenerateCode} disabled={isGenerating}>
                      {isGenerating ? "GENERATING..." : "GET YOUR CODE"}
                    </PixelButton>
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> YOUR STATS
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {referralStats?.totalReferrals || 0}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase mt-1">
                      Total Referrals
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {referralStats?.completedReferrals || 0}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase mt-1">
                      Completed
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    Total XP Earned
                  </p>
                  <p className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6" />
                    {referralStats?.totalXpEarned || 0}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Earn <span className="text-primary font-bold">{referralStats?.rewardPerReferral || 500} XP</span> for each friend who joins using your link
                  </p>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>
        ) : (
          <PixelCard rarity="rare" className="max-w-md mx-auto">
            <PixelCardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Sign In to Get Started</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Create an account to get your unique referral link and start earning rewards
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/sign-up">
                  <PixelButton>
                    SIGN UP <ArrowRight className="w-4 h-4 ml-2" />
                  </PixelButton>
                </Link>
                <Link href="/sign-in">
                  <PixelButton variant="outline">
                    SIGN IN
                  </PixelButton>
                </Link>
              </div>
            </PixelCardContent>
          </PixelCard>
        )}
      </div>
    </div>
  );
}
