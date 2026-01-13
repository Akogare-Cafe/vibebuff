"use client";

import { AnimatePresence } from "framer-motion";
import { Onboarding, useOnboarding } from "./onboarding";
import { useIsMobile } from "@/hooks/use-mobile";

export function OnboardingWrapper() {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {showOnboarding && !isMobile && (
        <Onboarding
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </AnimatePresence>
  );
}
