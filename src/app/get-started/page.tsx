"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BeginnerOnboarding, OnboardingResults } from "@/components/beginner-onboarding";
import { redirect } from "next/navigation";

export default function GetStartedPage() {
  const { user, isLoaded } = useUser();
  const [showResults, setShowResults] = useState(false);

  const onboardingState = useQuery(
    api.onboarding.getOnboardingState,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!isLoaded) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-[#60a5fa]">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  if (onboardingState?.isCompleted || showResults) {
    return (
      <main className="container mx-auto px-4 py-8">
        <OnboardingResults />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <BeginnerOnboarding onComplete={() => setShowResults(true)} />
    </main>
  );
}
