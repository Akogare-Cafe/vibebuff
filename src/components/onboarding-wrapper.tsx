"use client";

import { AnimatePresence } from "framer-motion";
import { Onboarding, useOnboarding } from "./onboarding";

export function OnboardingWrapper() {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <AnimatePresence>
      {showOnboarding && (
        <Onboarding
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </AnimatePresence>
  );
}
