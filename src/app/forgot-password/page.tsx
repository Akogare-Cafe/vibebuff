"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle,
  KeyRound,
  Shield
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        setStep("success");
        setTimeout(() => router.push("/sign-in"), 2000);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PixelCard className="w-full max-w-md mx-auto text-center">
          <PixelCardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <PixelCardTitle>PASSWORD RESET!</PixelCardTitle>
            <p className="text-muted-foreground text-[8px] mt-2">
              YOUR PASSWORD HAS BEEN SUCCESSFULLY CHANGED
            </p>
          </PixelCardHeader>
          <PixelCardContent>
            <p className="text-primary text-[10px]">
              REDIRECTING TO LOGIN...
            </p>
          </PixelCardContent>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <PixelCard className="w-full max-w-md mx-auto">
        <PixelCardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <KeyRound className="w-12 h-12 text-muted-foreground" />
          </div>
          <PixelCardTitle>
            {step === "email" ? "FORGOT PASSWORD?" : "ENTER RESET CODE"}
          </PixelCardTitle>
          <p className="text-muted-foreground text-[8px] mt-2">
            {step === "email"
              ? "ENTER YOUR EMAIL TO RECEIVE A RESET CODE"
              : `WE SENT A CODE TO ${email.toUpperCase()}`}
          </p>
        </PixelCardHeader>

        <PixelCardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="text-primary text-[8px] block mb-2">
                  <Mail className="w-3 h-3 inline mr-1" />
                  EMAIL ADDRESS
                </label>
                <PixelInput
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[8px] bg-red-900/20 p-2 border-2 border-red-500/50">
                  <AlertTriangle className="w-3 h-3" />
                  {error.toUpperCase()}
                </div>
              )}

              <PixelButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    SEND RESET CODE
                  </>
                )}
              </PixelButton>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-primary text-[8px] block mb-2">
                  <Shield className="w-3 h-3 inline mr-1" />
                  VERIFICATION CODE
                </label>
                <PixelInput
                  type="text"
                  placeholder="ENTER 6-DIGIT CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center tracking-[0.5em] text-lg"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="text-primary text-[8px] block mb-2">
                  <Lock className="w-3 h-3 inline mr-1" />
                  NEW PASSWORD
                </label>
                <PixelInput
                  type="password"
                  placeholder="ENTER NEW PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-[6px] mt-1">
                  MIN 8 CHARACTERS WITH NUMBERS & SYMBOLS
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[8px] bg-red-900/20 p-2 border-2 border-red-500/50">
                  <AlertTriangle className="w-3 h-3" />
                  {error.toUpperCase()}
                </div>
              )}

              <PixelButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    RESET PASSWORD
                  </>
                )}
              </PixelButton>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-muted-foreground hover:text-primary text-[8px] w-full text-center"
              >
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                BACK TO EMAIL
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="text-muted-foreground hover:text-primary text-[8px] flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO LOGIN
            </Link>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
