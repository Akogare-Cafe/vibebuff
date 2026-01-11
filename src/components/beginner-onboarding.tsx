"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import {
  Sparkles,
  Code,
  Rocket,
  BookOpen,
  Wrench,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Monitor,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: 0,
    title: "Welcome to Vibe Coding",
    description: "Let's find the perfect tools for your journey",
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    id: 1,
    title: "Your Experience Level",
    description: "How familiar are you with coding?",
    icon: <Code className="w-8 h-8" />,
  },
  {
    id: 2,
    title: "Your Goal",
    description: "What do you want to achieve?",
    icon: <Rocket className="w-8 h-8" />,
  },
  {
    id: 3,
    title: "Project Type",
    description: "What kind of project interests you?",
    icon: <Laptop className="w-8 h-8" />,
  },
  {
    id: 4,
    title: "Budget",
    description: "How much are you willing to spend?",
    icon: <DollarSign className="w-8 h-8" />,
  },
];

const experienceLevels = [
  {
    value: "no-coding" as const,
    label: "Complete Beginner",
    description: "I've never written code before",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    value: "some-coding" as const,
    label: "Some Experience",
    description: "I've done some tutorials or small projects",
    icon: <Code className="w-6 h-6" />,
  },
  {
    value: "experienced" as const,
    label: "Experienced Developer",
    description: "I code regularly and want to try AI tools",
    icon: <Wrench className="w-6 h-6" />,
  },
];

const goals = [
  {
    value: "learn" as const,
    label: "Learn Vibe Coding",
    description: "I want to understand how AI-assisted coding works",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    value: "build-project" as const,
    label: "Build a Project",
    description: "I have an idea I want to bring to life",
    icon: <Rocket className="w-6 h-6" />,
  },
  {
    value: "explore-tools" as const,
    label: "Explore Tools",
    description: "I want to find the best AI coding tools",
    icon: <Wrench className="w-6 h-6" />,
  },
];

const projectTypes = [
  { value: "landing-page", label: "Landing Page", icon: <Monitor className="w-5 h-5" /> },
  { value: "web-app", label: "Web Application", icon: <Laptop className="w-5 h-5" /> },
  { value: "mobile-app", label: "Mobile App", icon: <Laptop className="w-5 h-5" /> },
  { value: "saas", label: "SaaS Product", icon: <Rocket className="w-5 h-5" /> },
  { value: "blog", label: "Blog / Portfolio", icon: <BookOpen className="w-5 h-5" /> },
  { value: "api", label: "API / Backend", icon: <Code className="w-5 h-5" /> },
];

const budgetOptions = [
  { value: "free" as const, label: "Free Only", description: "I want to use free tools" },
  { value: "low" as const, label: "Low Budget", description: "Up to $20/month" },
  { value: "medium" as const, label: "Medium Budget", description: "Up to $50/month" },
  { value: "high" as const, label: "Flexible Budget", description: "I'll pay for the best tools" },
];

export function BeginnerOnboarding({ onComplete }: { onComplete?: () => void }) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{
    experienceLevel?: "no-coding" | "some-coding" | "experienced";
    goal?: "learn" | "build-project" | "explore-tools";
    projectType?: string;
    budget?: "free" | "low" | "medium" | "high";
  }>({});

  const startOnboarding = useMutation(api.onboarding.startOnboarding);
  const updateStep = useMutation(api.onboarding.updateOnboardingStep);
  const generateRecommendations = useMutation(api.onboarding.generateRecommendations);

  const handleNext = async () => {
    if (!user?.id) return;

    if (currentStep === 0) {
      await startOnboarding({ userId: user.id });
    }

    if (currentStep > 0 && currentStep < steps.length - 1) {
      await updateStep({
        userId: user.id,
        step: currentStep,
        answers: answers,
      });
    }

    if (currentStep === steps.length - 1) {
      await updateStep({
        userId: user.id,
        step: currentStep,
        answers: answers,
      });
      await generateRecommendations({ userId: user.id });
      onComplete?.();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return !!answers.experienceLevel;
    if (currentStep === 2) return !!answers.goal;
    if (currentStep === 3) return !!answers.projectType;
    if (currentStep === 4) return !!answers.budget;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelCard rarity="rare" className="w-full max-w-2xl">
        <PixelCardHeader>
          <div className="flex items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              {steps[currentStep].icon}
              <span>{steps[currentStep].title}</span>
            </PixelCardTitle>
            <div className="flex gap-1">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i <= currentStep ? "bg-primary" : "bg-card"
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            {steps[currentStep].description}
          </p>
        </PixelCardHeader>

        <PixelCardContent className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <div className="text-center py-8">
                  <Zap className="w-16 h-16 text-[#fbbf24] mx-auto mb-4" />
                  <h3 className="text-xl text-primary font-bold mb-2">
                    Welcome to Vibe Coding
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Vibe coding is about using AI tools to build software without
                    needing to be an expert programmer. Let us help you find the
                    perfect setup.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <PixelBadge>AI-Powered</PixelBadge>
                    <PixelBadge>Beginner Friendly</PixelBadge>
                    <PixelBadge>Build Anything</PixelBadge>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          experienceLevel: level.value,
                        }))
                      }
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        "hover:border-primary hover:bg-[#111827]/50",
                        answers.experienceLevel === level.value
                          ? "border-primary bg-[#111827]/50"
                          : "border-border bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{level.icon}</div>
                        <div>
                          <p className="text-primary font-bold">{level.label}</p>
                          <p className="text-muted-foreground text-sm">
                            {level.description}
                          </p>
                        </div>
                        {answers.experienceLevel === level.value && (
                          <Check className="w-5 h-5 text-[#22c55e] ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, goal: goal.value }))
                      }
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        "hover:border-primary hover:bg-[#111827]/50",
                        answers.goal === goal.value
                          ? "border-primary bg-[#111827]/50"
                          : "border-border bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{goal.icon}</div>
                        <div>
                          <p className="text-primary font-bold">{goal.label}</p>
                          <p className="text-muted-foreground text-sm">
                            {goal.description}
                          </p>
                        </div>
                        {answers.goal === goal.value && (
                          <Check className="w-5 h-5 text-[#22c55e] ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          projectType: type.value,
                        }))
                      }
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-center",
                        "hover:border-primary hover:bg-[#111827]/50",
                        answers.projectType === type.value
                          ? "border-primary bg-[#111827]/50"
                          : "border-border bg-transparent"
                      )}
                    >
                      <div className="text-primary flex justify-center mb-2">
                        {type.icon}
                      </div>
                      <p className="text-primary font-bold text-sm">
                        {type.label}
                      </p>
                      {answers.projectType === type.value && (
                        <Check className="w-4 h-4 text-[#22c55e] mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-3">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, budget: option.value }))
                      }
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        "hover:border-primary hover:bg-[#111827]/50",
                        answers.budget === option.value
                          ? "border-primary bg-[#111827]/50"
                          : "border-border bg-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-primary font-bold">
                            {option.label}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {option.description}
                          </p>
                        </div>
                        {answers.budget === option.value && (
                          <Check className="w-5 h-5 text-[#22c55e]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </PixelCardContent>

        <div className="px-6 pb-6 flex justify-between">
          <PixelButton
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(currentStep === 0 && "opacity-50 cursor-not-allowed")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </PixelButton>

          <PixelButton
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(!canProceed() && "opacity-50 cursor-not-allowed")}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Recommendations
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
}

export function OnboardingResults() {
  const { user } = useUser();
  const recommendations = useQuery(
    api.onboarding.getRecommendations,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!recommendations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PixelCard rarity="legendary">
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Your Personalized Recommendations
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          {recommendations.path && (
            <div className="mb-6">
              <h3 className="text-primary font-bold mb-2">
                Recommended Learning Path
              </h3>
              <div className="p-4 rounded-lg border-2 border-border bg-[#111827]/30">
                <p className="text-primary font-bold">
                  {recommendations.path.title}
                </p>
                <p className="text-muted-foreground text-sm">
                  {recommendations.path.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <PixelBadge>{recommendations.path.difficulty}</PixelBadge>
                  <PixelBadge>
                    {recommendations.path.estimatedMinutes} min
                  </PixelBadge>
                </div>
              </div>
            </div>
          )}

          {recommendations.tools.length > 0 && (
            <div>
              <h3 className="text-primary font-bold mb-2">
                Recommended Tools
              </h3>
              <div className="grid gap-3">
                {recommendations.tools.filter((tool): tool is NonNullable<typeof tool> => tool !== null).map((tool) => (
                  <Link
                    key={tool._id}
                    href={`/tools/${tool.slug}`}
                    className="block p-4 rounded-lg border-2 border-border bg-[#111827]/30 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-primary font-bold">{tool.name}</p>
                        <p className="text-muted-foreground text-sm">{tool.tagline}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
