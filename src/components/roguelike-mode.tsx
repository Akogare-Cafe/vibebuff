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
  Gamepad2, 
  Heart,
  Skull,
  Trophy,
  Play,
  RotateCcw,
  Check,
  X,
  Star,
  Zap,
  Crown
} from "lucide-react";

interface RoguelikeModeProps {
  userId: string;
  className?: string;
}

export function RoguelikeMode({ userId, className }: RoguelikeModeProps) {
  const activeRun = useQuery(api.roguelike.getActiveRun, { userId });
  const runHistory = useQuery(api.roguelike.getRunHistory, { userId, limit: 5 });
  const leaderboard = useQuery(api.roguelike.getLeaderboard, { limit: 10 });
  const startRun = useMutation(api.roguelike.startRun);

  const handleStartRun = async () => {
    await startRun({ userId });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Gamepad2 className="w-4 h-4" /> ROGUELIKE MODE
        </h2>
      </div>

      {activeRun ? (
        <ActiveRunDisplay run={activeRun} userId={userId} />
      ) : (
        <PixelCard className="p-6 text-center">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-[#3b82f6]" />
          <h3 className="text-[#60a5fa] text-lg mb-2">STACK DUNGEON</h3>
          <p className="text-[#3b82f6] text-[10px] mb-4">
            Navigate through project challenges. Pick the right tools or lose HP!
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <div className="text-center">
              <Heart className="w-6 h-6 mx-auto text-red-400 mb-1" />
              <p className="text-[#3b82f6] text-[8px]">3 LIVES</p>
            </div>
            <div className="text-center">
              <Star className="w-6 h-6 mx-auto text-yellow-400 mb-1" />
              <p className="text-[#3b82f6] text-[8px]">10 ROOMS</p>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto text-purple-400 mb-1" />
              <p className="text-[#3b82f6] text-[8px]">SCORE XP</p>
            </div>
          </div>
          <PixelButton onClick={handleStartRun}>
            <Play className="w-4 h-4 mr-2" /> START RUN
          </PixelButton>
        </PixelCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {runHistory && runHistory.length > 0 && (
          <div>
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> RECENT RUNS
            </h3>
            <div className="space-y-2">
              {runHistory.map((run: any) => (
                <PixelCard 
                  key={run._id} 
                  className={cn(
                    "p-3",
                    run.status === "completed" && "border-green-400",
                    run.status === "failed" && "border-red-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {run.status === "completed" ? (
                        <Trophy className="w-4 h-4 text-green-400" />
                      ) : (
                        <Skull className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-[#60a5fa] text-[10px]">
                        Room {run.currentRoom - 1}/{run.maxRooms}
                      </span>
                    </div>
                    <PixelBadge variant="outline" className="text-[6px]">
                      {run.score} PTS
                    </PixelBadge>
                  </div>
                </PixelCard>
              ))}
            </div>
          </div>
        )}

        {leaderboard && leaderboard.length > 0 && (
          <div>
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4" /> LEADERBOARD
            </h3>
            <PixelCard className="p-3">
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
                      <span className="text-[#60a5fa] text-[10px]">
                        {entry.userId === userId ? "YOU" : entry.userId.slice(-6)}
                      </span>
                    </div>
                    <span className="text-[#3b82f6] text-[10px]">{entry.score} pts</span>
                  </div>
                ))}
              </div>
            </PixelCard>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveRunDisplay({ run, userId }: { run: any; userId: string }) {
  const [selectedTool, setSelectedTool] = useState<Id<"tools"> | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const currentRoom = useQuery(api.roguelike.getCurrentRoom, { runId: run._id });
  const submitAnswer = useMutation(api.roguelike.submitAnswer);
  const abandonRun = useMutation(api.roguelike.abandonRun);
  const heal = useMutation(api.roguelike.heal);

  const handleSubmit = async () => {
    if (!selectedTool) return;
    const result = await submitAnswer({ runId: run._id, toolId: selectedTool });
    setLastResult(result);
    setSelectedTool(null);
    
    setTimeout(() => setLastResult(null), 2000);
  };

  const handleAbandon = async () => {
    if (confirm("Are you sure you want to abandon this run?")) {
      await abandonRun({ runId: run._id, userId });
    }
  };

  const handleHeal = async () => {
    await heal({ runId: run._id, userId });
  };

  if (!currentRoom) {
    return (
      <PixelCard className="p-6 text-center">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING ROOM...</div>
      </PixelCard>
    );
  }

  return (
    <div className="space-y-4">
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: currentRoom.maxHp }).map((_, i) => (
                <Heart 
                  key={i} 
                  className={cn(
                    "w-5 h-5",
                    i < currentRoom.hp ? "text-red-400 fill-red-400" : "text-[#1e3a5f]"
                  )} 
                />
              ))}
            </div>
            <PixelBadge variant="default">
              ROOM {currentRoom.roomNumber}/{run.maxRooms}
            </PixelBadge>
          </div>
          <div className="flex items-center gap-2">
            <PixelBadge variant="outline" className="text-[8px]">
              <Star className="w-3 h-3 mr-1 text-yellow-400" /> {currentRoom.score}
            </PixelBadge>
            {currentRoom.score >= 500 && currentRoom.hp < currentRoom.maxHp && (
              <PixelButton size="sm" variant="ghost" onClick={handleHeal}>
                <Heart className="w-3 h-3 mr-1" /> HEAL (500)
              </PixelButton>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-[#60a5fa] text-lg mb-2">{currentRoom.challenge}</p>
          <PixelBadge 
            variant="outline" 
            className={cn(
              "text-[8px]",
              currentRoom.difficulty <= 2 && "text-green-400 border-green-400",
              currentRoom.difficulty === 3 && "text-yellow-400 border-yellow-400",
              currentRoom.difficulty >= 4 && "text-red-400 border-red-400"
            )}
          >
            DIFFICULTY: {currentRoom.difficulty}/5
          </PixelBadge>
        </div>

        {lastResult && (
          <div className={cn(
            "text-center p-4 mb-4 border-2",
            lastResult.isCorrect ? "border-green-400 bg-green-400/10" : "border-red-400 bg-red-400/10"
          )}>
            {lastResult.isCorrect ? (
              <div className="flex items-center justify-center gap-2">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-green-400">CORRECT! +{lastResult.xpGained} XP</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <X className="w-6 h-6 text-red-400" />
                <span className="text-red-400">WRONG! -1 HP</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentRoom.options.map((tool: any) => (
            <button
              key={tool._id}
              onClick={() => setSelectedTool(tool._id)}
              className={cn(
                "border-2 p-4 text-left transition-all",
                selectedTool === tool._id 
                  ? "border-[#3b82f6] bg-[#3b82f6]/10" 
                  : "border-[#1e3a5f] hover:border-[#3b82f6]"
              )}
            >
              <p className="text-[#60a5fa] text-[12px] mb-1">{tool.name}</p>
              <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
              {tool.githubStars && (
                <div className="flex items-center gap-1 mt-2 text-[#1e3a5f] text-[8px]">
                  <Star className="w-3 h-3" /> {tool.githubStars.toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <PixelButton onClick={handleSubmit} disabled={!selectedTool} className="flex-1">
            <Zap className="w-4 h-4 mr-2" /> SUBMIT ANSWER
          </PixelButton>
          <PixelButton variant="ghost" onClick={handleAbandon}>
            <Skull className="w-4 h-4" />
          </PixelButton>
        </div>
      </PixelCard>

      {run.tools && run.tools.length > 0 && (
        <PixelCard className="p-3">
          <p className="text-[#60a5fa] text-[10px] mb-2">YOUR PICKS:</p>
          <div className="flex flex-wrap gap-1">
            {run.tools.map((tool: any) => (
              <PixelBadge key={tool._id} variant="outline" className="text-[6px]">
                {tool.name}
              </PixelBadge>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

export function RoguelikeWidget({ userId }: { userId: string }) {
  const activeRun = useQuery(api.roguelike.getActiveRun, { userId });

  if (!activeRun) return null;

  return (
    <Link href="/roguelike">
      <PixelCard className="p-3 border-purple-400">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-400 text-[10px] flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" /> ACTIVE RUN
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: activeRun.maxHp }).map((_, i) => (
              <Heart 
                key={i} 
                className={cn(
                  "w-3 h-3",
                  i < activeRun.hp ? "text-red-400 fill-red-400" : "text-[#1e3a5f]"
                )} 
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-[8px]">
          <span className="text-[#3b82f6]">Room {activeRun.currentRoom}/{activeRun.maxRooms}</span>
          <span className="text-[#60a5fa]">{activeRun.score} pts</span>
        </div>
      </PixelCard>
    </Link>
  );
}
