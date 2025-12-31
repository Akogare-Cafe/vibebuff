"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Scroll, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  XCircle,
  Rocket,
  RotateCcw,
  Calendar,
  Target
} from "lucide-react";

interface QuestHistoryProps {
  userId: string;
  className?: string;
}

const PROJECT_TYPES: Record<string, { name: string; icon: string }> = {
  saas: { name: "SaaS App", icon: "💼" },
  ecommerce: { name: "E-Commerce", icon: "🛒" },
  blog: { name: "Blog/Portfolio", icon: "📝" },
  dashboard: { name: "Dashboard", icon: "📊" },
  realtime: { name: "Realtime App", icon: "⚡" },
  mobile: { name: "Mobile App", icon: "📱" },
  api: { name: "API/Backend", icon: "🔧" },
  ai: { name: "AI/ML App", icon: "🤖" },
};

const OUTCOME_CONFIG = {
  shipped: { label: "SHIPPED", icon: Rocket, color: "text-green-400 border-green-400" },
  in_progress: { label: "IN PROGRESS", icon: Clock, color: "text-yellow-400 border-yellow-400" },
  abandoned: { label: "ABANDONED", icon: XCircle, color: "text-red-400 border-red-400" },
  pending: { label: "PENDING", icon: Target, color: "text-[#3b82f6] border-[#3b82f6]" },
};

export function QuestHistory({ userId, className }: QuestHistoryProps) {
  const quests = useQuery(api.questHistory.getUserQuestHistory, { userId });
  const stats = useQuery(api.questHistory.getQuestStats, { userId });

  if (!quests) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING QUEST LOG...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Scroll className="w-4 h-4" /> QUEST LOG
        </h2>
        <PixelBadge variant="default">
          {quests.length} QUESTS
        </PixelBadge>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <PixelCard className="p-3 text-center">
            <Rocket className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-green-400 text-lg">{stats.shipped}</p>
            <p className="text-[#3b82f6] text-[8px]">SHIPPED</p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="text-yellow-400 text-lg">{stats.inProgress}</p>
            <p className="text-[#3b82f6] text-[8px]">IN PROGRESS</p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-[#60a5fa]" />
            <p className="text-[#60a5fa] text-lg">{stats.pending}</p>
            <p className="text-[#3b82f6] text-[8px]">PENDING</p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
            <p className="text-red-400 text-lg">{stats.abandoned}</p>
            <p className="text-[#3b82f6] text-[8px]">ABANDONED</p>
          </PixelCard>
        </div>
      )}

      {/* Quest List */}
      {quests.length === 0 ? (
        <PixelCard className="p-8 text-center">
          <Scroll className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO QUESTS YET</p>
          <p className="text-[#1e3a5f] text-[8px] mb-4">Start your first quest to get recommendations!</p>
          <Link href="/quest">
            <PixelButton>
              <Target className="w-4 h-4 mr-2" /> START QUEST
            </PixelButton>
          </Link>
        </PixelCard>
      ) : (
        <div className="space-y-4">
          {quests.map((quest: any) => (
            <QuestCard key={quest._id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuestCardProps {
  quest: {
    _id: Id<"questHistory">;
    answers: {
      projectType: string;
      scale: string;
      budget: string;
      features: string[];
    };
    tools: any[];
    toolCount: number;
    outcome?: string;
    outcomeNotes?: string;
    createdAt: number;
  };
}

function QuestCard({ quest }: QuestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(quest.outcome || "pending");
  const [notes, setNotes] = useState(quest.outcomeNotes || "");

  const updateOutcome = useMutation(api.questHistory.updateQuestOutcome);

  const projectType = PROJECT_TYPES[quest.answers.projectType] || { name: quest.answers.projectType, icon: "📦" };
  const outcomeConfig = OUTCOME_CONFIG[quest.outcome as keyof typeof OUTCOME_CONFIG] || OUTCOME_CONFIG.pending;
  const OutcomeIcon = outcomeConfig.icon;

  const handleSaveOutcome = async () => {
    await updateOutcome({
      questId: quest._id,
      outcome: selectedOutcome as any,
      notes,
    });
    setShowOutcomeForm(false);
  };

  return (
    <PixelCard className={cn("p-4", quest.outcome === "shipped" && "border-green-400")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{projectType.icon}</span>
          <div>
            <h3 className="text-[#60a5fa] text-[12px]">{projectType.name}</h3>
            <p className="text-[#3b82f6] text-[8px]">
              {quest.answers.scale} • {quest.answers.budget} budget
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PixelBadge 
            variant="outline" 
            className={cn("text-[8px]", outcomeConfig.color)}
          >
            <OutcomeIcon className="w-3 h-3 mr-1" />
            {outcomeConfig.label}
          </PixelBadge>
        </div>
      </div>

      {/* Tools Preview */}
      <div className="flex flex-wrap gap-1 mb-3">
        {quest.tools.slice(0, 5).map((tool: any) => (
          <Link key={tool._id} href={`/tools/${tool.slug}`}>
            <PixelBadge variant="outline" className="text-[6px] hover:border-[#3b82f6]">
              {tool.name}
            </PixelBadge>
          </Link>
        ))}
        {quest.toolCount > 5 && (
          <PixelBadge variant="outline" className="text-[6px]">
            +{quest.toolCount - 5} more
          </PixelBadge>
        )}
      </div>

      {/* Features */}
      {quest.answers.features.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {quest.answers.features.map((feature) => (
            <span key={feature} className="text-[#1e3a5f] text-[6px]">
              #{feature}
            </span>
          ))}
        </div>
      )}

      {/* Timestamp & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#1e3a5f] text-[8px]">
          <Calendar className="w-3 h-3" />
          {new Date(quest.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <PixelButton 
            variant="ghost" 
            size="sm"
            onClick={() => setShowOutcomeForm(!showOutcomeForm)}
          >
            UPDATE STATUS
          </PixelButton>
          <Link href="/quest">
            <PixelButton variant="ghost" size="sm">
              <RotateCcw className="w-3 h-3 mr-1" /> REPLAY
            </PixelButton>
          </Link>
        </div>
      </div>

      {/* Outcome Form */}
      {showOutcomeForm && (
        <div className="mt-4 pt-4 border-t-2 border-[#1e3a5f]">
          <p className="text-[#60a5fa] text-[10px] mb-2">UPDATE QUEST STATUS</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {Object.entries(OUTCOME_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedOutcome(key)}
                  className={cn(
                    "p-2 border-2 text-center transition-colors",
                    selectedOutcome === key 
                      ? `${config.color} bg-[#0a1628]` 
                      : "border-[#1e3a5f]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mx-auto mb-1", config.color.split(" ")[0])} />
                  <p className="text-[6px]">{config.label}</p>
                </button>
              );
            })}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this project..."
            className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] mb-3 h-16 resize-none"
          />
          <div className="flex gap-2">
            <PixelButton size="sm" onClick={handleSaveOutcome}>
              <CheckCircle className="w-3 h-3 mr-1" /> SAVE
            </PixelButton>
            <PixelButton variant="ghost" size="sm" onClick={() => setShowOutcomeForm(false)}>
              CANCEL
            </PixelButton>
          </div>
        </div>
      )}
    </PixelCard>
  );
}
