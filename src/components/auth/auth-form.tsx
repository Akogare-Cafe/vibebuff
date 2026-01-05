"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertTriangle,
  Github,
  Chrome,
  Gamepad2,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const isLoaded = mode === "sign-in" ? signInLoaded : signUpLoaded;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Additional verification required");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        username,
        firstName,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationPending(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "oauth_github" | "oauth_google") => {
    if (!signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "OAuth sign in failed");
    }
  };

  const handleOAuthSignUp = async (provider: "oauth_github" | "oauth_google") => {
    if (!signUp) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "OAuth sign up failed");
    }
  };

  const handleOAuth = mode === "sign-in" ? handleOAuthSignIn : handleOAuthSignUp;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  // Verification screen for sign-up
  if (verificationPending) {
    return (
      <PixelCard className="w-full max-w-md mx-auto">
        <PixelCardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="w-12 h-12 text-muted-foreground" />
              <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <PixelCardTitle>CHECK YOUR EMAIL</PixelCardTitle>
          <p className="text-muted-foreground text-xs mt-2">
            WE SENT A VERIFICATION CODE TO {email.toUpperCase()}
          </p>
        </PixelCardHeader>
        <PixelCardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label className="text-primary text-xs block mb-2">
                VERIFICATION CODE
              </label>
              <PixelInput
                type="text"
                placeholder="ENTER 6-DIGIT CODE"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center tracking-[0.5em] text-lg"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 border-2 border-red-500/50">
                <AlertTriangle className="w-3 h-3" />
                {error.toUpperCase()}
              </div>
            )}

            <PixelButton
              type="submit"
              className="w-full"
              disabled={isLoading || verificationCode.length < 6}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  VERIFY & CONTINUE
                </>
              )}
            </PixelButton>

            <button
              type="button"
              onClick={() => setVerificationPending(false)}
              className="text-muted-foreground hover:text-primary text-xs w-full text-center"
            >
              ← BACK TO SIGN UP
            </button>
          </form>
        </PixelCardContent>
      </PixelCard>
    );
  }

  return (
    <PixelCard className="w-full max-w-md mx-auto">
      <PixelCardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Gamepad2 className="w-12 h-12 text-muted-foreground" />
            <Zap className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <PixelCardTitle>
          {mode === "sign-in" ? "WELCOME BACK" : "JOIN THE QUEST"}
        </PixelCardTitle>
        <p className="text-muted-foreground text-xs mt-2">
          {mode === "sign-in" 
            ? "ENTER YOUR CREDENTIALS TO CONTINUE" 
            : "CREATE YOUR ADVENTURER PROFILE"}
        </p>
      </PixelCardHeader>

      <PixelCardContent>
        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <PixelButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("oauth_github")}
          >
            <Github className="w-4 h-4 mr-2" />
            CONTINUE WITH GITHUB
          </PixelButton>
          <PixelButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("oauth_google")}
          >
            <Chrome className="w-4 h-4 mr-2" />
            CONTINUE WITH GOOGLE
          </PixelButton>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0a0f1a] px-4 text-muted-foreground text-xs">
              OR USE EMAIL
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={mode === "sign-in" ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
          {mode === "sign-up" && (
            <>
              <div>
                <label className="text-primary text-xs block mb-2">
                  <User className="w-3 h-3 inline mr-1" />
                  USERNAME
                </label>
                <PixelInput
                  type="text"
                  placeholder="CHOOSE YOUR HANDLE"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-primary text-xs block mb-2">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  DISPLAY NAME
                </label>
                <PixelInput
                  type="text"
                  placeholder="YOUR ADVENTURER NAME"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-primary text-xs block mb-2">
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

          <div>
            <label className="text-primary text-xs block mb-2">
              <Lock className="w-3 h-3 inline mr-1" />
              PASSWORD
            </label>
            <div className="relative">
              <PixelInput
                type={showPassword ? "text" : "password"}
                placeholder={mode === "sign-up" ? "CREATE A STRONG PASSWORD" : "ENTER YOUR PASSWORD"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "sign-up" && (
              <p className="text-muted-foreground text-[6px] mt-1">
                MIN 8 CHARACTERS WITH NUMBERS & SYMBOLS
              </p>
            )}
          </div>

          {mode === "sign-in" && (
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-muted-foreground hover:text-primary text-xs"
              >
                FORGOT PASSWORD?
              </Link>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 border-2 border-red-500/50">
              <AlertTriangle className="w-3 h-3" />
              {error.toUpperCase()}
            </div>
          )}

          <PixelButton
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "sign-in" ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                LOGIN
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                CREATE ACCOUNT
              </>
            )}
          </PixelButton>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-xs">
            {mode === "sign-in" ? "NEW TO VIBEBUFF?" : "ALREADY HAVE AN ACCOUNT?"}
          </p>
          <Link
            href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
            className="text-primary hover:text-muted-foreground text-sm font-bold"
          >
            {mode === "sign-in" ? "CREATE ACCOUNT →" : "← LOGIN HERE"}
          </Link>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
