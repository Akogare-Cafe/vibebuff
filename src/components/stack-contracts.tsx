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
  FileText,
  Clock,
  DollarSign,
  Layers,
  CheckCircle,
  XCircle,
  Send,
  Zap,
  Award,
  User,
  Target,
} from "lucide-react";

interface StackContractsProps {
  userId: string;
  className?: string;
}

export function StackContracts({ userId, className }: StackContractsProps) {
  const [selectedContract, setSelectedContract] = useState<Id<"stackContracts"> | null>(null);
  const [selectedTools, setSelectedTools] = useState<Id<"tools">[]>([]);

  const contracts = useQuery(api.stackContracts.getActiveContracts);
  const userSubmissions = useQuery(api.stackContracts.getUserSubmissions, { userId });
  const allTools = useQuery(api.tools.list, { limit: 50 });
  const submitContract = useMutation(api.stackContracts.submitContract);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "expert":
        return "text-red-400 border-red-400";
      case "hard":
        return "text-orange-400 border-orange-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      default:
        return "text-green-400 border-green-400";
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const handleSubmit = async () => {
    if (!selectedContract || selectedTools.length === 0) return;
    try {
      await submitContract({
        userId,
        contractId: selectedContract,
        toolIds: selectedTools,
      });
      setSelectedContract(null);
      setSelectedTools([]);
    } catch (error) {
    }
  };

  const toggleTool = (toolId: Id<"tools">) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter((id) => id !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const hasSubmitted = (contractId: Id<"stackContracts">) => {
    return userSubmissions?.some((s) => s.contractId === contractId);
  };

  const activeContract = contracts?.find((c) => c._id === selectedContract);

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-sm flex items-center gap-2">
            <FileText className="w-5 h-5" /> STACK CONTRACTS
          </h2>
          <PixelBadge variant="outline" className="text-xs">
            {contracts?.length ?? 0} AVAILABLE
          </PixelBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts?.map((contract) => {
            const submitted = hasSubmitted(contract._id);

            return (
              <div
                key={contract._id}
                onClick={() => !submitted && setSelectedContract(contract._id)}
                className={cn(
                  "border-2 p-4 transition-all cursor-pointer",
                  selectedContract === contract._id
                    ? "border-primary bg-primary/10"
                    : submitted
                      ? "border-green-400/50 opacity-60"
                      : "border-border hover:border-primary"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-primary text-base mb-1">
                      {contract.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <PixelBadge
                        variant="outline"
                        className={cn("text-[6px]", getDifficultyColor(contract.difficulty))}
                      >
                        {contract.difficulty.toUpperCase()}
                      </PixelBadge>
                      <PixelBadge variant="outline" className="text-[6px]">
                        {contract.contractType.toUpperCase()}
                      </PixelBadge>
                    </div>
                  </div>
                  {submitted ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <p className="text-muted-foreground text-xs mb-3">
                  {contract.description}
                </p>

                <div className="flex items-center gap-2 mb-3 p-2 bg-[#0a0f1a] border border-border">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-primary text-sm">
                    {contract.clientName}
                  </span>
                </div>

                <div className="space-y-1 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Categories: {contract.requirements.requiredCategories.join(", ")}
                    </span>
                  </div>
                  {contract.requirements.maxBudget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">
                        Max ${contract.requirements.maxBudget}/mo
                      </span>
                    </div>
                  )}
                  {contract.requirements.minTools && (
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Min {contract.requirements.minTools} tools
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">
                      +{contract.rewards.xp} XP
                    </span>
                    {contract.rewards.bonusTitle && (
                      <>
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-xs">
                          {contract.rewards.bonusTitle}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(contract.expiresAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(!contracts || contracts.length === 0) && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No active contracts. Check back later!
            </p>
          </div>
        )}
      </PixelCard>

      {activeContract && (
        <PixelCard className="p-6">
          <h3 className="text-primary text-sm uppercase mb-4">
            BUILD STACK FOR: {activeContract.title}
          </h3>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4 max-h-48 overflow-y-auto">
            {allTools?.map((tool) => (
              <button
                key={tool._id}
                onClick={() => toggleTool(tool._id)}
                className={cn(
                  "p-2 border-2 text-center transition-all",
                  selectedTools.includes(tool._id)
                    ? "border-green-400 bg-green-400/10"
                    : "border-border hover:border-primary"
                )}
              >
                <p className="text-primary text-[6px] truncate">{tool.name}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Selected: {selectedTools.length} tools
            </p>
            <div className="flex gap-2">
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedContract(null);
                  setSelectedTools([]);
                }}
              >
                CANCEL
              </PixelButton>
              <PixelButton
                size="sm"
                onClick={handleSubmit}
                disabled={selectedTools.length === 0}
              >
                <Send className="w-4 h-4 mr-1" /> SUBMIT
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {userSubmissions && userSubmissions.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-sm uppercase mb-4">
            YOUR SUBMISSIONS
          </h3>
          <div className="space-y-2">
            {userSubmissions.map((submission) => (
              <div
                key={submission._id}
                className="flex items-center justify-between p-2 border border-border"
              >
                <div className="flex items-center gap-2">
                  {submission.status === "approved" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : submission.status === "rejected" ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-primary text-sm">
                    {submission.contract?.title ?? "Unknown Contract"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    Score: {submission.score}
                  </span>
                  <PixelBadge
                    variant="outline"
                    className={cn(
                      "text-[6px]",
                      submission.status === "approved"
                        ? "text-green-400 border-green-400"
                        : submission.status === "rejected"
                          ? "text-red-400 border-red-400"
                          : "text-yellow-400 border-yellow-400"
                    )}
                  >
                    {submission.status.toUpperCase()}
                  </PixelBadge>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
