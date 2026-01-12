"use client";

import { useEffect, useRef } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Gamepad2 } from "lucide-react";

export function SSOCallback() {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;

    async function handleCallback() {
      try {
        if (signIn?.firstFactorVerification?.status === "transferable") {
          hasHandled.current = true;
          const result = await signIn.create({ transfer: true });
          if (result.status === "complete" && setSignInActive) {
            await setSignInActive({ session: result.createdSessionId });
            router.push("/");
          }
        } else if (signUp?.verifications?.externalAccount?.status === "transferable") {
          hasHandled.current = true;
          const result = await signUp.create({ transfer: true });
          if (result.status === "complete" && setSignUpActive) {
            await setSignUpActive({ session: result.createdSessionId });
            router.push("/");
          }
        } else if (signIn?.status === "complete" && setSignInActive) {
          hasHandled.current = true;
          await setSignInActive({ session: signIn.createdSessionId });
          router.push("/");
        } else if (signUp?.status === "complete" && setSignUpActive) {
          hasHandled.current = true;
          await setSignUpActive({ session: signUp.createdSessionId });
          router.push("/");
        }
      } catch (err) {
        hasHandled.current = true;
        router.push("/sign-in?error=sso_failed");
      }
    }

    handleCallback();
  }, [signIn, signUp, setSignInActive, setSignUpActive, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <Gamepad2 className="w-16 h-16 text-muted-foreground animate-pulse" />
        </div>
        <div className="flex items-center gap-3 text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">COMPLETING LOGIN...</span>
        </div>
        <p className="text-muted-foreground text-xs mt-4">
          PLEASE WAIT WHILE WE VERIFY YOUR CREDENTIALS
        </p>
      </div>
    </div>
  );
}
