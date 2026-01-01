"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Briefcase, 
  Clock,
  Trophy,
  Star,
  Building2,
  Timer,
  Check,
  MessageSquare,
  Send,
  Users
} from "lucide-react";

interface InterviewPrepProps {
  userId?: string;
  className?: string;
}

const DIFFICULTY_CONFIG = {
  junior: { color: "text-green-400 border-green-400", label: "JUNIOR" },
  mid: { color: "text-yellow-400 border-yellow-400", label: "MID-LEVEL" },
  senior: { color: "text-orange-400 border-orange-400", label: "SENIOR" },
  staff: { color: "text-red-400 border-red-400", label: "STAFF" },
};

export function InterviewPrep({ userId, className }: InterviewPrepProps) {
  const scenarios = useQuery(api.interviews.getScenarios, { limit: 10 });
  const userAttempts = useQuery(
    api.interviews.getUserAttempts,
    userId ? { userId } : "skip"
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> INTERVIEW PREP
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios?.map((scenario: any) => (
          <ScenarioCard key={scenario._id} scenario={scenario} />
        ))}
      </div>

      {userAttempts && userAttempts.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> YOUR ATTEMPTS
          </h3>
          <div className="space-y-2">
            {userAttempts.map((attempt: any) => (
              <AttemptCard key={attempt._id} attempt={attempt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: any }) {
  const config = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG];

  return (
    <PixelCard className={cn("p-4", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[#60a5fa] text-[12px]">{scenario.title}</h3>
          {scenario.company && (
            <div className="flex items-center gap-1 mt-1 text-[#3b82f6] text-[8px]">
              <Building2 className="w-3 h-3" /> {scenario.company}
            </div>
          )}
        </div>
        <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
          {config?.label}
        </PixelBadge>
      </div>

      <p className="text-[#3b82f6] text-[10px] mb-3">{scenario.description}</p>

      <div className="flex items-center gap-3 mb-3 text-[8px] text-[#3b82f6]">
        <span className="flex items-center gap-1">
          <Timer className="w-3 h-3" /> {Math.floor(scenario.timeLimit / 60000)}min
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> {scenario.followUpQuestions.length} Q&A
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {scenario.requirements.slice(0, 3).map((req: any, i: number) => (
          <PixelBadge key={i} variant="outline" className="text-[6px]">
            {req.category}
          </PixelBadge>
        ))}
      </div>

      <Link href={`/interview/${scenario.slug}`}>
        <PixelButton size="sm" className="w-full">
          <Briefcase className="w-3 h-3 mr-1" /> START
        </PixelButton>
      </Link>
    </PixelCard>
  );
}

function AttemptCard({ attempt }: { attempt: any }) {
  return (
    <div className="flex items-center justify-between p-3 border border-[#1e3a5f]">
      <div className="flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-[#3b82f6]" />
        <div>
          <p className="text-[#60a5fa] text-[10px]">{attempt.scenario?.title}</p>
          <p className="text-[#3b82f6] text-[8px]">
            {Math.floor(attempt.timeSpent / 60000)}min spent
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[#60a5fa] text-lg">{attempt.score}</p>
        <p className="text-[#3b82f6] text-[8px]">SCORE</p>
      </div>
    </div>
  );
}

interface InterviewSessionProps {
  scenarioSlug: string;
  userId: string;
}

export function InterviewSession({ scenarioSlug, userId }: InterviewSessionProps) {
  const [selectedTools, setSelectedTools] = useState<Id<"tools">[]>([]);
  const [answers, setAnswers] = useState<{ questionIndex: number; answer: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; breakdown: { scalabilityScore: number; costScore: number; maintainabilityScore: number; innovationScore: number } } | null>(null);

  const scenario = useQuery(api.interviews.getScenario, { slug: scenarioSlug });
  const submitInterview = useMutation(api.interviews.submitInterview);

  const handleSubmit = useCallback(async () => {
    if (!scenario || submitted) return;
    
    setSubmitted(true);
    const timeSpent = Date.now() - startTime;
    
    const submitResult = await submitInterview({
      scenarioId: scenario._id,
      userId,
      toolIds: selectedTools,
      answers,
      timeSpent,
    });
    
    setResult(submitResult);
  }, [scenario, submitted, startTime, submitInterview, userId, selectedTools, answers]);

  useEffect(() => {
    if (!scenario) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, scenario.timeLimit - elapsed);
      setTimeLeft(remaining);
      
      if (remaining === 0 && !submitted) {
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scenario, startTime, submitted, handleSubmit]);

  if (!scenario) {
    return (
      <PixelCard className="p-8 text-center">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">LOADING SCENARIO...</p>
      </PixelCard>
    );
  }

  if (result) {
    return (
      <PixelCard className="p-6 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h2 className="text-[#60a5fa] text-lg mb-4">INTERVIEW COMPLETE</h2>
        <p className="text-[#60a5fa] text-3xl mb-2">{result.score}</p>
        <p className="text-[#3b82f6] text-[10px] mb-4">FINAL SCORE</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ScoreBreakdown label="SCALABILITY" score={result.breakdown.scalabilityScore} />
          <ScoreBreakdown label="COST" score={result.breakdown.costScore} />
          <ScoreBreakdown label="MAINTAIN" score={result.breakdown.maintainabilityScore} />
          <ScoreBreakdown label="INNOVATION" score={result.breakdown.innovationScore} />
        </div>
      </PixelCard>
    );
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const config = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG];

  return (
    <div className="space-y-6">
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#60a5fa] text-lg">{scenario.title}</h2>
            <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
              {config?.label}
            </PixelBadge>
          </div>
          <div className={cn(
            "text-center p-3 border",
            timeLeft < 60000 ? "border-red-400 text-red-400" : "border-[#1e3a5f] text-[#60a5fa]"
          )}>
            <Timer className="w-5 h-5 mx-auto mb-1" />
            <p className="text-lg">{minutes}:{seconds.toString().padStart(2, "0")}</p>
          </div>
        </div>

        <p className="text-[#3b82f6] text-[10px] mb-4">{scenario.description}</p>

        <div className="space-y-2 mb-4">
          <p className="text-[#60a5fa] text-[10px] uppercase">REQUIREMENTS:</p>
          {scenario.requirements.map((req: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-2 border border-[#1e3a5f]">
              <div>
                <PixelBadge variant="outline" className="text-[6px]">{req.category}</PixelBadge>
                <p className="text-[#3b82f6] text-[8px] mt-1">{req.description}</p>
              </div>
              <span className="text-[#1e3a5f] text-[8px]">{req.weight}%</span>
            </div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-4">
        <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">YOUR STACK ({selectedTools.length} tools)</h3>
        <div className="flex flex-wrap gap-2 mb-4 min-h-[60px] p-3 border border-dashed border-[#1e3a5f]">
          {selectedTools.length === 0 ? (
            <p className="text-[#1e3a5f] text-[10px]">Select tools for your architecture...</p>
          ) : (
            selectedTools.map((toolId, i) => (
              <PixelBadge key={i} variant="outline" className="text-[8px]">
                Tool {i + 1}
              </PixelBadge>
            ))
          )}
        </div>
      </PixelCard>

      {scenario.followUpQuestions.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> FOLLOW-UP QUESTIONS
          </h3>
          <div className="flex gap-2 mb-3">
            {scenario.followUpQuestions.map((_: any, i: number) => (
              <PixelButton
                key={i}
                size="sm"
                variant={currentQuestion === i ? "default" : "ghost"}
                onClick={() => setCurrentQuestion(i)}
              >
                Q{i + 1}
              </PixelButton>
            ))}
          </div>
          <div className="p-3 border border-[#1e3a5f] bg-[#0a1628] mb-3">
            <p className="text-[#60a5fa] text-[10px]">
              {scenario.followUpQuestions[currentQuestion]?.question}
            </p>
          </div>
          <textarea
            value={answers.find((a) => a.questionIndex === currentQuestion)?.answer || ""}
            onChange={(e) => {
              const existing = answers.filter((a) => a.questionIndex !== currentQuestion);
              setAnswers([...existing, { questionIndex: currentQuestion, answer: e.target.value }]);
            }}
            placeholder="Your answer..."
            className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] h-24 resize-none"
          />
        </PixelCard>
      )}

      <PixelButton onClick={handleSubmit} className="w-full">
        <Send className="w-4 h-4 mr-2" /> SUBMIT INTERVIEW
      </PixelButton>
    </div>
  );
}

function ScoreBreakdown({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center p-2 border border-[#1e3a5f]">
      <p className="text-[#60a5fa] text-lg">{score}</p>
      <p className="text-[#3b82f6] text-[6px]">{label}</p>
    </div>
  );
}

export function InterviewLeaderboard({ scenarioId }: { scenarioId: Id<"interviewScenarios"> }) {
  const leaderboard = useQuery(api.interviews.getScenarioLeaderboard, { scenarioId, limit: 10 });

  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> TOP PERFORMERS
      </h3>
      <div className="space-y-2">
        {leaderboard.map((entry: any) => (
          <div 
            key={entry._id}
            className={cn(
              "flex items-center justify-between p-2 border",
              entry.rank === 1 && "border-yellow-400 bg-yellow-400/10",
              entry.rank === 2 && "border-gray-400 bg-gray-400/10",
              entry.rank === 3 && "border-orange-400 bg-orange-400/10",
              entry.rank > 3 && "border-[#1e3a5f]"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-6 text-center text-[10px]",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-gray-400",
                entry.rank === 3 && "text-orange-400",
                entry.rank > 3 && "text-[#3b82f6]"
              )}>
                #{entry.rank}
              </span>
              <span className="text-[#60a5fa] text-[10px]">{entry.userId.slice(-6)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#3b82f6] text-[10px]">{entry.score} pts</span>
              {entry.peerReviews.length > 0 && (
                <PixelBadge variant="outline" className="text-[6px]">
                  <Users className="w-2 h-2 mr-1" /> {entry.peerReviews.length}
                </PixelBadge>
              )}
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
