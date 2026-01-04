"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  FlaskConical, 
  Play,
  Gauge,
  Shield,
  Zap,
  Heart,
  DollarSign,
  Trophy,
  RotateCcw
} from "lucide-react";

interface StackSimulatorProps {
  userId: string;
  deckId?: Id<"userDecks">;
  toolIds?: Id<"tools">[];
  className?: string;
}

const DIFFICULTY_CONFIG = {
  easy: { color: "text-green-400 border-green-400", label: "EASY" },
  medium: { color: "text-yellow-400 border-yellow-400", label: "MEDIUM" },
  hard: { color: "text-orange-400 border-orange-400", label: "HARD" },
  nightmare: { color: "text-red-400 border-red-400", label: "NIGHTMARE" },
};

export function StackSimulator({ userId, deckId, toolIds, className }: StackSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const scenarios = useQuery(api.simulator.getScenarios, {});
  const runSimulation = useMutation(api.simulator.runSimulation);

  const handleRun = async () => {
    if (!selectedScenario || !toolIds?.length) return;
    
    setIsRunning(true);
    setResults(null);

    setTimeout(async () => {
      const result = await runSimulation({
        userId,
        scenarioSlug: selectedScenario,
        toolIds,
        deckId,
      });
      setResults(result);
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <FlaskConical className="w-4 h-4" /> STACK SIMULATOR
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios?.map((scenario: any) => {
          const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG];
          return (
            <PixelCard
              key={scenario._id}
              className={cn(
                "p-4 cursor-pointer transition-all",
                selectedScenario === scenario.slug && "border-primary bg-primary/10"
              )}
              onClick={() => setSelectedScenario(scenario.slug)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-primary text-base">{scenario.name}</h3>
                <PixelBadge variant="outline" className={cn("text-[6px]", diffConfig.color)}>
                  {diffConfig.label}
                </PixelBadge>
              </div>
              <p className="text-muted-foreground text-xs mb-3">{scenario.description}</p>
              <div className="flex flex-wrap gap-1">
                {scenario.challenges.slice(0, 3).map((c: any, i: number) => (
                  <PixelBadge key={i} variant="outline" className="text-[6px]">
                    {c.name}
                  </PixelBadge>
                ))}
              </div>
            </PixelCard>
          );
        })}
      </div>

      <div className="flex justify-center">
        <PixelButton
          onClick={handleRun}
          disabled={!selectedScenario || !toolIds?.length || isRunning}
        >
          {isRunning ? (
            <>SIMULATING...</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> RUN SIMULATION</>
          )}
        </PixelButton>
      </div>

      {isRunning && (
        <PixelCard className="p-8 text-center">
          <FlaskConical className="w-16 h-16 mx-auto text-muted-foreground animate-pulse mb-4" />
          <p className="text-primary text-base">Running simulation...</p>
          <p className="text-muted-foreground text-xs">Testing your stack against challenges</p>
        </PixelCard>
      )}

      {results && <SimulationResults results={results} />}
    </div>
  );
}

function SimulationResults({ results }: { results: any }) {
  const { overallScore, scalability, security, performance, devExperience, costEfficiency } = results.results;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getGrade = (score: number) => {
    if (score >= 90) return "S";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  return (
    <PixelCard className="p-6">
      <div className="text-center mb-6">
        <div className={cn("text-6xl font-bold", getScoreColor(overallScore))}>
          {getGrade(overallScore)}
        </div>
        <p className="text-primary text-lg">{overallScore}/100</p>
        <PixelBadge variant="default" className="mt-2">
          +{results.xpEarned} XP EARNED
        </PixelBadge>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatBar icon={<Gauge className="w-4 h-4" />} label="SCALE" value={scalability} />
        <StatBar icon={<Shield className="w-4 h-4" />} label="SECURITY" value={security} />
        <StatBar icon={<Zap className="w-4 h-4" />} label="PERF" value={performance} />
        <StatBar icon={<Heart className="w-4 h-4" />} label="DX" value={devExperience} />
        <StatBar icon={<DollarSign className="w-4 h-4" />} label="COST" value={costEfficiency} />
      </div>
    </PixelCard>
  );
}

function StatBar({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return "bg-green-400";
    if (v >= 60) return "bg-yellow-400";
    if (v >= 40) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="text-center">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <div className="h-24 w-full bg-[#191022] border border-border relative mb-1">
        <div 
          className={cn("absolute bottom-0 w-full transition-all duration-1000", getColor(value))}
          style={{ height: `${value}%` }}
        />
      </div>
      <p className="text-primary text-sm">{value}</p>
      <p className="text-muted-foreground text-[6px]">{label}</p>
    </div>
  );
}

export function SimulationHistory({ userId }: { userId: string }) {
  const history = useQuery(api.simulator.getUserSimulations, { userId, limit: 5 });

  if (!history || history.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
        <RotateCcw className="w-4 h-4" /> RECENT SIMULATIONS
      </h3>
      <div className="space-y-2">
        {history.map((sim: any) => (
          <div key={sim._id} className="flex items-center justify-between p-2 border border-border">
            <div>
              <p className="text-primary text-sm">{sim.scenario.name}</p>
              <p className="text-muted-foreground text-xs">
                {new Date(sim.completedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary text-lg">{sim.results.overallScore}</p>
              <p className="text-muted-foreground text-xs">+{sim.xpEarned} XP</p>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
