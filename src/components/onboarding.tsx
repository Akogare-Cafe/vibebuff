"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";
import Link from "next/link";
import {
  Package,
  Trophy,
  Users,
  Sparkles,
  ChevronRight,
  X,
  Gamepad2,
  Target,
  Layers,
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "WELCOME TO VIBEBUFF",
    description: "YOUR QUEST FOR THE PERFECT TECH STACK BEGINS HERE",
    icon: Gamepad2,
    content: "Discover, compare, and build your ideal development toolkit with our gamified platform.",
  },
  {
    id: "quest",
    title: "AI STACK BUILDER",
    description: "AI-POWERED RECOMMENDATIONS",
    icon: Sparkles,
    content: "Describe your project and our AI will recommend the perfect tools for your needs.",
    action: { label: "TRY IT", href: "/" },
  },
  {
    id: "browse",
    title: "BROWSE TOOLS",
    description: "500+ DEVELOPMENT TOOLS",
    icon: Package,
    content: "Explore our extensive database of frameworks, libraries, and services across 15+ categories.",
    action: { label: "BROWSE", href: "/tools" },
  },
  {
    id: "compare",
    title: "COMPARE TOOLS",
    description: "SIDE-BY-SIDE COMPARISON",
    icon: Target,
    content: "Compare tools head-to-head to see strengths, weaknesses, and which one fits your needs best.",
    action: { label: "COMPARE", href: "/compare" },
  },
  {
    id: "decks",
    title: "BUILD YOUR DECK",
    description: "CREATE & SHARE TECH STACKS",
    icon: Layers,
    content: "Assemble your favorite tools into shareable decks. Show off your stack to the world!",
  },
  {
    id: "rewards",
    title: "EARN REWARDS",
    description: "XP, ACHIEVEMENTS & MORE",
    icon: Trophy,
    content: "Level up by exploring tools, winning battles, and completing challenges. Unlock badges and titles!",
  },
];

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIcon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <PixelCard className="max-w-lg w-full p-6 relative">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-1 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 ${
                index <= currentStep ? "bg-primary" : "bg-card"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary bg-[#0a0f1a] flex items-center justify-center">
                <StepIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-primary text-sm mb-2">{step.title}</h2>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {step.content}
            </p>

            {step.action && (
              <Link href={step.action.href} onClick={onComplete}>
                <PixelButton variant="outline" size="sm" className="mb-4">
                  {step.action.label} <ChevronRight className="w-3 h-3 ml-1" />
                </PixelButton>
              </Link>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6">
          <PixelButton
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={currentStep === 0 ? "opacity-0" : ""}
          >
            BACK
          </PixelButton>

          <p className="text-muted-foreground text-xs">
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </p>

          <PixelButton size="sm" onClick={handleNext}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? "START" : "NEXT"}
          </PixelButton>
        </div>
      </PixelCard>
    </motion.div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("vibebuff_onboarding_complete");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    setHasChecked(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("vibebuff_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem("vibebuff_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("vibebuff_onboarding_complete");
    setShowOnboarding(true);
  };

  return {
    showOnboarding: hasChecked && showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
