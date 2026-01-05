"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { BeginnerOnboarding, OnboardingResults } from "@/components/beginner-onboarding";

export default function GetStartedPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showResults, setShowResults] = useState(false);

  const onboardingState = useQuery(
    api.onboarding.getOnboardingState,
    user?.id ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </main>
    );
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
