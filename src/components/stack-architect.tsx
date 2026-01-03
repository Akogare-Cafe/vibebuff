"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Puzzle, 
  Clock,
  Trophy,
  Star,
  Zap,
  Flame,
  Target,
  Check,
  X,
  Plus,
  DollarSign,
  Gauge,
  Lightbulb,
  Layers
} from "lucide-react";

interface StackArchitectProps {
  userId?: string;
  className?: string;
}

const DIFFICULTY_CONFIG = {
  easy: { color: "text-green-400 border-green-400", icon: Star, label: "EASY" },
  medium: { color: "text-yellow-400 border-yellow-400", icon: Zap, label: "MEDIUM" },
  hard: { color: "text-orange-400 border-orange-400", icon: Flame, label: "HARD" },
  expert: { color: "text-red-400 border-red-400", icon: Target, label: "EXPERT" },
};

export function StackArchitect({ userId, className }: StackArchitectProps) {
  const dailyPuzzle = useQuery(api.architect.getDailyPuzzle);
  const puzzles = useQuery(api.architect.getPuzzles, { limit: 10 });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Puzzle className="w-4 h-4" /> STACK ARCHITECT
        </h2>
      </div>

      {dailyPuzzle && (
        <PixelCard className="p-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-[10px] uppercase">DAILY PUZZLE</span>
          </div>
          <PuzzleCard puzzle={dailyPuzzle} userId={userId} isDaily />
        </PixelCard>
      )}

      <div>
        <h3 className="text-primary text-[10px] uppercase mb-3">ALL PUZZLES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puzzles?.map((puzzle: any) => (
            <PuzzleCard key={puzzle._id} puzzle={puzzle} userId={userId} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PuzzleCard({ puzzle, userId, isDaily }: { puzzle: any; userId?: string; isDaily?: boolean }) {
  const config = DIFFICULTY_CONFIG[puzzle.difficulty as keyof typeof DIFFICULTY_CONFIG];
  const DifficultyIcon = config?.icon || Star;

  return (
    <PixelCard className={cn("p-4", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-primary text-[12px]">{puzzle.title}</h3>
          <PixelBadge variant="outline" className={cn("text-[6px] mt-1", config?.color)}>
            <DifficultyIcon className="w-3 h-3 mr-1" /> {config?.label}
          </PixelBadge>
        </div>
        {isDaily && <Clock className="w-5 h-5 text-yellow-400" />}
      </div>

      <p className="text-muted-foreground text-[10px] mb-3">{puzzle.description}</p>

      {puzzle.constraints && (
        <div className="space-y-1 mb-3">
          {puzzle.constraints.maxBudget !== undefined && (
            <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <DollarSign className="w-3 h-3" /> Max Budget: ${puzzle.constraints.maxBudget}
            </div>
          )}
          {puzzle.constraints.maxTools && (
            <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <Layers className="w-3 h-3" /> Max Tools: {puzzle.constraints.maxTools}
            </div>
          )}
          {puzzle.constraints.customConstraints?.slice(0, 2).map((c: string, i: number) => (
            <div key={i} className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <Target className="w-3 h-3" /> {c}
            </div>
          ))}
        </div>
      )}

      <Link href={`/architect/${puzzle.slug}`}>
        <PixelButton size="sm" className="w-full">
          <Puzzle className="w-3 h-3 mr-1" /> SOLVE
        </PixelButton>
      </Link>
    </PixelCard>
  );
}

interface PuzzleSolverProps {
  puzzleSlug: string;
  userId: string;
}

export function PuzzleSolver({ puzzleSlug, userId }: PuzzleSolverProps) {
  const [selectedTools, setSelectedTools] = useState<Id<"tools">[]>([]);
  const [startTime] = useState(Date.now());
  
  const puzzle = useQuery(api.architect.getPuzzle, { slug: puzzleSlug });
  const submitSolution = useMutation(api.architect.submitSolution);

  const handleSubmit = async () => {
    if (!puzzle || selectedTools.length === 0) return;
    
    const timeSpent = Date.now() - startTime;
    const result = await submitSolution({
      userId,
      puzzleId: puzzle._id,
      toolIds: selectedTools,
      timeSpent,
    });

    alert(`Score: ${result.score}\nCost: ${result.breakdown.costScore}\nPerformance: ${result.breakdown.performanceScore}\nSimplicity: ${result.breakdown.simplicityScore}\nInnovation: ${result.breakdown.innovationScore}`);
  };

  if (!puzzle) {
    return (
      <PixelCard className="p-8 text-center">
        <Puzzle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-[10px]">LOADING PUZZLE...</p>
      </PixelCard>
    );
  }

  const config = DIFFICULTY_CONFIG[puzzle.difficulty as keyof typeof DIFFICULTY_CONFIG];

  return (
    <div className="space-y-6">
      <PixelCard className={cn("p-4", config?.color)}>
        <h2 className="text-primary text-lg mb-2">{puzzle.title}</h2>
        <p className="text-muted-foreground text-[10px] mb-4">{puzzle.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <ScoreWeight label="COST" weight={puzzle.scoringCriteria.costWeight} icon={<DollarSign className="w-4 h-4" />} />
          <ScoreWeight label="PERF" weight={puzzle.scoringCriteria.performanceWeight} icon={<Gauge className="w-4 h-4" />} />
          <ScoreWeight label="SIMPLE" weight={puzzle.scoringCriteria.simplicityWeight} icon={<Layers className="w-4 h-4" />} />
          <ScoreWeight label="INNOV" weight={puzzle.scoringCriteria.innovationWeight} icon={<Lightbulb className="w-4 h-4" />} />
        </div>

        {puzzle.constraints?.customConstraints && (
          <div className="p-3 border border-border bg-[#191022] mb-4">
            <p className="text-primary text-[8px] mb-2">CONSTRAINTS:</p>
            <ul className="space-y-1">
              {puzzle.constraints.customConstraints.map((c: string, i: number) => (
                <li key={i} className="text-muted-foreground text-[8px] flex items-center gap-1">
                  <Target className="w-3 h-3" /> {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </PixelCard>

      <PixelCard className="p-4">
        <h3 className="text-primary text-[10px] uppercase mb-3">YOUR STACK ({selectedTools.length} tools)</h3>
        <div className="flex flex-wrap gap-2 mb-4 min-h-[60px] p-3 border border-dashed border-border">
          {selectedTools.length === 0 ? (
            <p className="text-muted-foreground text-[10px]">Add tools to your stack...</p>
          ) : (
            selectedTools.map((toolId, i) => (
              <PixelBadge key={i} variant="outline" className="text-[8px]">
                Tool {i + 1}
                <button onClick={() => setSelectedTools(selectedTools.filter((_, idx) => idx !== i))}>
                  <X className="w-3 h-3 ml-1" />
                </button>
              </PixelBadge>
            ))
          )}
        </div>

        <PixelButton onClick={handleSubmit} disabled={selectedTools.length === 0} className="w-full">
          <Check className="w-4 h-4 mr-2" /> SUBMIT SOLUTION
        </PixelButton>
      </PixelCard>
    </div>
  );
}

function ScoreWeight({ label, weight, icon }: { label: string; weight: number; icon: React.ReactNode }) {
  return (
    <div className="text-center p-2 border border-border">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <p className="text-primary text-lg">{weight}</p>
      <p className="text-muted-foreground text-[6px]">{label}</p>
    </div>
  );
}

export function PuzzleLeaderboard({ puzzleId }: { puzzleId: Id<"architectPuzzles"> }) {
  const leaderboard = useQuery(api.architect.getPuzzleLeaderboard, { puzzleId, limit: 10 });

  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> LEADERBOARD
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
              entry.rank > 3 && "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-6 text-center text-[10px]",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-gray-400",
                entry.rank === 3 && "text-orange-400",
                entry.rank > 3 && "text-muted-foreground"
              )}>
                #{entry.rank}
              </span>
              <span className="text-primary text-[10px]">{entry.userId.slice(-6)}</span>
            </div>
            <span className="text-muted-foreground text-[10px]">{entry.score} pts</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
