"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ChevronLeft,
  Clock,
  Package,
  Rocket,
  CheckCircle,
  AlertCircle,
  Loader2,
  Compass,
  Zap,
  ArrowRight,
  History,
  Target,
} from "lucide-react";
import { TourTrigger } from "@/components/page-tour";
import { questsTourConfig } from "@/lib/tour-configs";

const OUTCOME_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  shipped: { 
    bg: "bg-green-500/20", 
    text: "text-green-400",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Shipped"
  },
  in_progress: { 
    bg: "bg-blue-500/20", 
    text: "text-blue-400",
    icon: <Loader2 className="w-4 h-4" />,
    label: "In Progress"
  },
  abandoned: { 
    bg: "bg-red-500/20", 
    text: "text-red-400",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Abandoned"
  },
  pending: { 
    bg: "bg-yellow-500/20", 
    text: "text-yellow-400",
    icon: <Clock className="w-4 h-4" />,
    label: "Pending"
  },
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  saas: "SaaS Application",
  ecommerce: "E-Commerce Store",
  blog: "Blog / Portfolio",
  dashboard: "Dashboard / Admin",
  realtime: "Real-time App",
  mobile: "Mobile App",
  api: "API / Backend",
  ai: "AI Application",
};

export default function QuestsPage() {
  const { user, isLoaded } = useUser();

  const questHistory = useQuery(
    api.questHistory.getUserQuestHistory,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="fixed bottom-4 right-4 z-50">
        <TourTrigger tourConfig={questsTourConfig} />
      </div>

      <main className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Compass className="w-8 h-8 text-primary" />
                Quests
              </h1>
              <p className="text-muted-foreground mt-1">
                Start a new quest or view your quest history
              </p>
            </div>
          </div>
        </div>

        <PixelCard className="p-6 md:p-8 mb-8 border-primary bg-gradient-to-br from-card via-background to-card" data-tour="quest-list">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-heading text-foreground text-xl md:text-2xl mb-2">
                Start a New Quest
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mb-4 max-w-xl">
                Describe what you want to build and let our AI suggest the perfect tech stack for your project. 
                Earn XP and track your progress!
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/#ai-stack-builder">
                  <PixelButton size="lg">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Quest
                  </PixelButton>
                </Link>
                <Link href="/tools">
                  <PixelButton variant="outline" size="lg">
                    <Package className="w-4 h-4 mr-2" />
                    Browse Tools
                  </PixelButton>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-center gap-2 text-center">
              <div className="text-3xl font-bold text-primary">+25</div>
              <div className="text-xs text-muted-foreground uppercase">XP per Quest</div>
            </div>
          </div>
        </PixelCard>

        {!user ? (
          <PixelCard className="p-8 text-center">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In to Track Quests</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Create an account to save your quest history, track your progress, and earn XP rewards.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-in">
                <PixelButton>Connect</PixelButton>
              </Link>
              <Link href="/#ai-stack-builder">
                <PixelButton variant="outline">Try a Quest</PixelButton>
              </Link>
            </div>
          </PixelCard>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-foreground text-lg">Quest History</h2>
              {questHistory && questHistory.length > 0 && (
                <PixelBadge variant="outline" className="text-xs">
                  {questHistory.length} {questHistory.length === 1 ? "Quest" : "Quests"}
                </PixelBadge>
              )}
            </div>

            {!questHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : questHistory.length === 0 ? (
              <PixelCard className="p-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-bold text-foreground mb-2">No Quests Yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Start your first quest to get personalized tech stack recommendations and earn XP!
                </p>
                <Link href="/#ai-stack-builder">
                  <PixelButton>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Your First Quest
                  </PixelButton>
                </Link>
              </PixelCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questHistory.map((quest) => {
                    const outcomeStyle = OUTCOME_STYLES[quest.outcome ?? "pending"] || OUTCOME_STYLES.pending;
                  const projectTypeLabel = PROJECT_TYPE_LABELS[quest.answers.projectType] || quest.answers.projectType;

                  return (
                    <PixelCard key={quest._id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-foreground">{projectTypeLabel}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(quest.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <PixelBadge 
                          variant="outline" 
                          className={cn("text-xs flex items-center gap-1", outcomeStyle.text)}
                        >
                          {outcomeStyle.icon}
                          {outcomeStyle.label}
                        </PixelBadge>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <PixelBadge variant="outline" className="text-[10px]">
                          {quest.answers.scale}
                        </PixelBadge>
                        <PixelBadge variant="outline" className="text-[10px]">
                          {quest.answers.budget} budget
                        </PixelBadge>
                        {quest.answers.features.slice(0, 2).map((feature) => (
                          <PixelBadge key={feature} variant="outline" className="text-[10px]">
                            {feature}
                          </PixelBadge>
                        ))}
                        {quest.answers.features.length > 2 && (
                          <PixelBadge variant="outline" className="text-[10px]">
                            +{quest.answers.features.length - 2} more
                          </PixelBadge>
                        )}
                      </div>

                      {quest.tools && quest.tools.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Recommended Tools:</p>
                          <div className="flex flex-wrap gap-2">
                            {quest.tools.slice(0, 4).map((tool) => (
                              tool && (
                                <Link 
                                  key={tool._id} 
                                  href={`/tools/${tool.slug}`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {tool.name}
                                </Link>
                              )
                            ))}
                            {quest.toolCount > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{quest.toolCount - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          +25 XP
                        </span>
                        <Link 
                          href={`/stack-builder?quest=${quest._id}`}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View Stack
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </PixelCard>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
