"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import {
  Gift,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  Users,
  Zap,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    xpEarned?: number;
  } | null>(null);

  const validation = useQuery(api.referrals.validateReferralCode, { code: code?.toUpperCase() || "" });
  const applyCode = useMutation(api.referrals.applyReferralCode);

  useEffect(() => {
    if (code) {
      localStorage.setItem("vibebuff_referral_code", code.toUpperCase());
    }
  }, [code]);

  const handleApplyCode = async () => {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect=/r/${code}`);
      return;
    }

    setApplying(true);
    try {
      const response = await applyCode({ code: code.toUpperCase() });
      setResult({
        success: response.success,
        message: response.message || response.error || "",
        xpEarned: response.xpEarned,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred. Please try again.",
      });
    } finally {
      setApplying(false);
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
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">You&apos;ve Been Invited!</h1>
          <p className="text-muted-foreground">
            Someone wants you to join VibeBuff
          </p>
        </div>

        <PixelCard rarity="rare" className="mb-8">
          <PixelCardContent className="p-6">
            {result ? (
              <div className="text-center py-4">
                {result.success ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Welcome to VibeBuff!</h2>
                    <p className="text-muted-foreground mb-4">{result.message}</p>
                    {result.xpEarned && (
                      <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg mb-6">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-bold text-primary">+{result.xpEarned} XP</span>
                      </div>
                    )}
                    <div className="flex justify-center gap-4">
                      <Link href="/">
                        <PixelButton>
                          AI STACK BUILDER <ArrowRight className="w-4 h-4 ml-2" />
                        </PixelButton>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Oops!</h2>
                    <p className="text-muted-foreground mb-4">{result.message}</p>
                    <Link href="/">
                      <PixelButton variant="outline">
                        GO TO HOME
                      </PixelButton>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">REFERRAL CODE</p>
                  <code className="text-2xl font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                    {code?.toUpperCase()}
                  </code>
                </div>

                {validation?.valid === false && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-center">
                    <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 text-sm">{validation.error}</p>
                  </div>
                )}

                {validation?.valid && (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-lg font-bold">250</p>
                        <p className="text-xs text-muted-foreground">BONUS XP</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-lg font-bold">FREE</p>
                        <p className="text-xs text-muted-foreground">TO JOIN</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-lg font-bold">100+</p>
                        <p className="text-xs text-muted-foreground">DEV TOOLS</p>
                      </div>
                    </div>

                    <div className="text-center">
                      {isSignedIn ? (
                        <PixelButton
                          onClick={handleApplyCode}
                          disabled={applying}
                          className="w-full"
                        >
                          {applying ? (
                            "APPLYING..."
                          ) : (
                            <>
                              CLAIM YOUR BONUS <Gift className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </PixelButton>
                      ) : (
                        <div className="space-y-3">
                          <Link href={`/sign-up?redirect=/r/${code}`} className="block">
                            <PixelButton className="w-full">
                              SIGN UP & CLAIM BONUS <ArrowRight className="w-4 h-4 ml-2" />
                            </PixelButton>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Already have an account?{" "}
                            <Link href={`/sign-in?redirect=/r/${code}`} className="text-primary hover:underline">
                              Sign in
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </PixelCardContent>
        </PixelCard>

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">What is VibeBuff?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            VibeBuff is the ultimate platform for discovering, comparing, and mastering 
            developer tools. Build your perfect tech stack, compete in battles, and 
            level up your development skills.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/tools">
              <PixelButton variant="outline" size="sm">
                EXPLORE TOOLS
              </PixelButton>
            </Link>
            <Link href="/about">
              <PixelButton variant="ghost" size="sm">
                LEARN MORE
              </PixelButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
