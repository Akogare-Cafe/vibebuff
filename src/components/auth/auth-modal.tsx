"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "sign-in" | "sign-up";
}

export function AuthModal({ open, onOpenChange, defaultMode = "sign-in" }: AuthModalProps) {
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  const [mode, setMode] = useState<"sign-in" | "sign-up">(defaultMode);
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
        onOpenChange(false);
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
        onOpenChange(false);
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

  const toggleMode = () => {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
    setError("");
    setVerificationPending(false);
  };

  if (!isLoaded) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          
          <div className="relative p-6">
            <DialogHeader className="text-center space-y-3 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
                </div>
              </motion.div>
              
              <DialogTitle className="text-2xl font-bold">
                {verificationPending ? "Verify Email" : mode === "sign-in" ? "Welcome Back" : "Join VibeBuff"}
              </DialogTitle>
              
              <p className="text-sm text-muted-foreground">
                {verificationPending 
                  ? `Code sent to ${email}` 
                  : mode === "sign-in" 
                    ? "Sign in to continue your journey" 
                    : "Create your account to get started"}
              </p>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {verificationPending ? (
                <motion.form
                  key="verification"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerification}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium mb-2 block">Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length < 6}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Verify & Continue
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationPending(false)}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign up
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "sign-in" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "sign-in" ? 20 : -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleOAuth("oauth_github")}
                      className="w-full py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Github className="w-5 h-5" />
                      Continue with GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuth("oauth_google")}
                      className="w-full py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Chrome className="w-5 h-5" />
                      Continue with Google
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-4 text-sm text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={mode === "sign-in" ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
                    {mode === "sign-up" && (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Username
                          </label>
                          <input
                            type="text"
                            placeholder="Choose your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            Display Name
                          </label>
                          <input
                            type="text"
                            placeholder="Your display name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={mode === "sign-up" ? "Create a strong password" : "Enter your password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {mode === "sign-up" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Min 8 characters with numbers & symbols
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : mode === "sign-in" ? (
                        <>
                          Sign In
                          <ArrowRight className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Create Account
                          <Sparkles className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {mode === "sign-in" ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                      onClick={toggleMode}
                      className="text-primary hover:text-primary/80 font-semibold text-sm mt-1 transition-colors"
                    >
                      {mode === "sign-in" ? "Create account" : "Sign in"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
