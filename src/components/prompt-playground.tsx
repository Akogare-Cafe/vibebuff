"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
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
  MessageSquare,
  Copy,
  Check,
  Zap,
  Trophy,
  Lightbulb,
  ChevronRight,
  Filter,
  Star,
  Eye,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

type PromptCategory = "landing-page" | "authentication" | "database" | "api" | "styling" | "debugging" | "refactoring" | "testing";
type Difficulty = "beginner" | "intermediate" | "advanced";

const categoryLabels: Record<PromptCategory, string> = {
  "landing-page": "Landing Pages",
  "authentication": "Authentication",
  "database": "Database",
  "api": "API",
  "styling": "Styling",
  "debugging": "Debugging",
  "refactoring": "Refactoring",
  "testing": "Testing",
};

interface PromptTemplate {
  _id: Id<"promptTemplates">;
  slug: string;
  title: string;
  description: string;
  category: PromptCategory;
  prompt: string;
  exampleOutput?: string;
  difficulty: Difficulty;
  usageCount: number;
  rating: number;
  isOfficial: boolean;
  tools?: { name: string }[];
}

interface PromptChallenge {
  _id: Id<"promptChallenges">;
  slug: string;
  title: string;
  description: string;
  task: string;
  hints: string[];
  solutionPrompt: string;
  difficulty: Difficulty;
  xpReward: number;
}

function TemplateCard({
  template,
  onUse,
}: {
  template: PromptTemplate;
  onUse: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PixelCard rarity={template.isOfficial ? "rare" : "common"}>
      <PixelCardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#60a5fa]" />
            <h3 className="text-[#60a5fa] font-bold text-sm">{template.title}</h3>
          </div>
          {template.isOfficial && (
            <PixelBadge className="text-[8px] bg-[#fbbf24]/20 text-[#fbbf24]">
              Official
            </PixelBadge>
          )}
        </div>

        <p className="text-[#3b82f6] text-xs mb-3">{template.description}</p>

        <div className="bg-[#0a1628] rounded-lg p-3 mb-3 border border-[#1e3a5f]">
          <p className="text-[#60a5fa] text-xs font-mono line-clamp-3">
            {template.prompt}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            <PixelBadge className={cn(
              "text-[8px]",
              template.difficulty === "beginner" && "bg-green-500/20 text-green-400",
              template.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-400",
              template.difficulty === "advanced" && "bg-red-500/20 text-red-400"
            )}>
              {template.difficulty}
            </PixelBadge>
            <PixelBadge className="text-[8px]">
              {categoryLabels[template.category]}
            </PixelBadge>
          </div>
          <div className="flex items-center gap-2 text-[#3b82f6] text-xs">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {template.usageCount}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <PixelButton
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </PixelButton>
          <PixelButton className="flex-1" onClick={onUse}>
            <Play className="w-3 h-3 mr-1" />
            Use
          </PixelButton>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function ChallengeCard({
  challenge,
  isCompleted,
  onStart,
}: {
  challenge: PromptChallenge;
  isCompleted: boolean;
  onStart: () => void;
}) {
  return (
    <PixelCard rarity={isCompleted ? "legendary" : "common"}>
      <PixelCardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Trophy className="w-4 h-4 text-[#fbbf24]" />
            ) : (
              <Zap className="w-4 h-4 text-[#60a5fa]" />
            )}
            <h3 className="text-[#60a5fa] font-bold text-sm">{challenge.title}</h3>
          </div>
          <span className="text-[#fbbf24] text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {challenge.xpReward} XP
          </span>
        </div>

        <p className="text-[#3b82f6] text-xs mb-3">{challenge.description}</p>

        <div className="flex items-center justify-between">
          <PixelBadge className={cn(
            "text-[8px]",
            challenge.difficulty === "beginner" && "bg-green-500/20 text-green-400",
            challenge.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-400",
            challenge.difficulty === "advanced" && "bg-red-500/20 text-red-400"
          )}>
            {challenge.difficulty}
          </PixelBadge>

          <PixelButton onClick={onStart} disabled={isCompleted}>
            {isCompleted ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Completed
              </>
            ) : (
              <>
                Start
                <ChevronRight className="w-3 h-3 ml-1" />
              </>
            )}
          </PixelButton>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function ChallengeModal({
  challenge,
  onClose,
  onComplete,
}: {
  challenge: PromptChallenge;
  onClose: () => void;
  onComplete: (prompt: string) => void;
}) {
  const [userPrompt, setUserPrompt] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const handleSubmit = () => {
    onComplete(userPrompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCard rarity="rare">
          <PixelCardHeader>
            <div className="flex items-center justify-between">
              <PixelCardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {challenge.title}
              </PixelCardTitle>
              <span className="text-[#fbbf24] text-sm flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {challenge.xpReward} XP
              </span>
            </div>
          </PixelCardHeader>

          <PixelCardContent className="space-y-4">
            <div>
              <h4 className="text-[#60a5fa] font-bold text-sm mb-2">Your Task</h4>
              <p className="text-[#3b82f6] text-sm">{challenge.task}</p>
            </div>

            <div>
              <h4 className="text-[#60a5fa] font-bold text-sm mb-2">
                Write Your Prompt
              </h4>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Type your prompt here..."
                className="w-full h-32 p-3 bg-[#0a1628] border-2 border-[#1e3a5f] rounded-lg text-[#60a5fa] text-sm placeholder:text-[#3b82f6]/50 focus:border-[#60a5fa] outline-none resize-none font-mono"
              />
            </div>

            <div className="flex gap-2">
              <PixelButton
                variant="outline"
                onClick={() => {
                  setShowHints(!showHints);
                  if (!showHints) setHintsUsed(Math.min(hintsUsed + 1, challenge.hints.length));
                }}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {showHints ? "Hide Hints" : `Show Hint (${hintsUsed}/${challenge.hints.length})`}
              </PixelButton>
              <PixelButton
                variant="outline"
                onClick={() => setShowSolution(!showSolution)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {showSolution ? "Hide Solution" : "Show Solution"}
              </PixelButton>
            </div>

            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-3"
                >
                  <h5 className="text-[#fbbf24] font-bold text-xs mb-2">Hints</h5>
                  <ul className="space-y-1">
                    {challenge.hints.slice(0, hintsUsed).map((hint, i) => (
                      <li key={i} className="text-[#fbbf24]/80 text-xs">
                        {i + 1}. {hint}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg p-3"
                >
                  <h5 className="text-[#22c55e] font-bold text-xs mb-2">
                    Example Solution
                  </h5>
                  <p className="text-[#22c55e]/80 text-xs font-mono">
                    {challenge.solutionPrompt}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1e3a5f]">
              <PixelButton variant="outline" onClick={onClose}>
                Cancel
              </PixelButton>
              <PixelButton onClick={handleSubmit} disabled={!userPrompt.trim()}>
                <Check className="w-4 h-4 mr-1" />
                Submit
              </PixelButton>
            </div>
          </PixelCardContent>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

export function PromptPlayground() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"templates" | "challenges">("templates");
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [activeChallenge, setActiveChallenge] = useState<PromptChallenge | null>(null);

  const templates = useQuery(api.promptPlayground.listTemplates, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
  });

  const challenges = useQuery(api.promptPlayground.listChallenges, {
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
  });

  const completedChallenges = useQuery(
    api.promptPlayground.getCompletedChallenges,
    user?.id ? { userId: user.id } : "skip"
  );

  const useTemplate = useMutation(api.promptPlayground.useTemplate);
  const submitAttempt = useMutation(api.promptPlayground.submitAttempt);

  const handleUseTemplate = async (templateId: Id<"promptTemplates">) => {
    await useTemplate({ templateId });
  };

  const handleChallengeComplete = async (prompt: string) => {
    if (!user?.id || !activeChallenge) return;

    await submitAttempt({
      userId: user.id,
      challengeId: activeChallenge._id,
      prompt,
      isSuccessful: true,
    });

    setActiveChallenge(null);
  };

  const isChallengeCompleted = (challengeId: Id<"promptChallenges">) => {
    return completedChallenges?.includes(challengeId) ?? false;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#60a5fa] flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Prompt Playground
          </h1>
          <p className="text-[#3b82f6] text-sm mt-1">
            Learn to write effective prompts for AI coding assistants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("templates")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-colors",
              activeTab === "templates"
                ? "bg-[#60a5fa] text-white"
                : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
            )}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-colors",
              activeTab === "challenges"
                ? "bg-[#60a5fa] text-white"
                : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
            )}
          >
            Challenges
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-[#3b82f6]" />
        
        {activeTab === "templates" && (
          <>
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
                selectedCategory === "all"
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
              )}
            >
              All
            </button>
            {(Object.keys(categoryLabels) as PromptCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs transition-colors",
                  selectedCategory === cat
                    ? "bg-[#60a5fa] text-white"
                    : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
                )}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </>
        )}

        <div className="ml-4 flex gap-2">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
                selectedDifficulty === diff
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
              )}
            >
              {diff === "all" ? "All Levels" : diff}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "templates" && (
        <>
          {!templates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-[#1e3a5f] rounded-lg" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <PixelCard>
              <PixelCardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-[#3b82f6] mx-auto mb-4" />
                <p className="text-[#60a5fa] font-bold">No templates found</p>
                <p className="text-[#3b82f6] text-sm">
                  Try adjusting your filters
                </p>
              </PixelCardContent>
            </PixelCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template as PromptTemplate}
                  onUse={() => handleUseTemplate(template._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "challenges" && (
        <>
          {completedChallenges && completedChallenges.length > 0 && (
            <PixelCard rarity="rare">
              <PixelCardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#fbbf24]" />
                    <span className="text-[#60a5fa] font-bold">
                      {completedChallenges.length} Challenges Completed
                    </span>
                  </div>
                  <span className="text-[#fbbf24] text-sm">
                    Keep going!
                  </span>
                </div>
              </PixelCardContent>
            </PixelCard>
          )}

          {!challenges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-[#1e3a5f] rounded-lg" />
                </div>
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <PixelCard>
              <PixelCardContent className="text-center py-12">
                <Zap className="w-12 h-12 text-[#3b82f6] mx-auto mb-4" />
                <p className="text-[#60a5fa] font-bold">No challenges found</p>
                <p className="text-[#3b82f6] text-sm">
                  Check back soon for new challenges
                </p>
              </PixelCardContent>
            </PixelCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge as PromptChallenge}
                  isCompleted={isChallengeCompleted(challenge._id)}
                  onStart={() => setActiveChallenge(challenge as PromptChallenge)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {activeChallenge && (
          <ChallengeModal
            challenge={activeChallenge}
            onClose={() => setActiveChallenge(null)}
            onComplete={handleChallengeComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
