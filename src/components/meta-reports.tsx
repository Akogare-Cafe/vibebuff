"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Newspaper, 
  TrendingUp,
  TrendingDown,
  Minus,
  Coins,
  Target,
  Calendar,
  ChevronRight
} from "lucide-react";

interface MetaReportsProps {
  userId?: string;
  className?: string;
}

export function MetaReports({ userId, className }: MetaReportsProps) {
  const report = useQuery(api.metaReports.getLatestReport);

  if (!report) {
    return (
      <PixelCard className="p-8 text-center">
        <Newspaper className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">NO META REPORT YET</p>
        <p className="text-[#1e3a5f] text-[8px]">Check back soon!</p>
      </PixelCard>
    );
  }

  const weekStart = new Date(report.weekStart).toLocaleDateString();
  const weekEnd = new Date(report.weekEnd).toLocaleDateString();

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Newspaper className="w-4 h-4" /> WEEKLY META REPORT
        </h2>
        <PixelBadge variant="outline" className="text-[8px]">
          <Calendar className="w-3 h-3 mr-1" /> {weekStart} - {weekEnd}
        </PixelBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> TOOL TRENDS
          </h3>
          <div className="space-y-2">
            {report.toolTrends.slice(0, 10).map((trend: any) => (
              <TrendRow key={trend.toolId} trend={trend} />
            ))}
          </div>
        </PixelCard>

        <div className="space-y-4">
          <PixelCard className="p-4">
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> PREDICTIONS
            </h3>
            <div className="space-y-3">
              {report.predictions.map((pred: any, index: number) => (
                <PredictionCard 
                  key={index} 
                  prediction={pred} 
                  index={index}
                  reportId={report._id}
                  userId={userId}
                />
              ))}
            </div>
          </PixelCard>

          {report.categoryTrends.slice(0, 3).map((ct: any) => (
            <PixelCard key={ct.categoryId} className="p-3">
              <h4 className="text-[#60a5fa] text-[10px] mb-2">{ct.category?.name}</h4>
              <div className="flex flex-wrap gap-1">
                {ct.topTools.slice(0, 3).map((tool: any) => (
                  <Link key={tool?._id} href={`/tools/${tool?.slug}`}>
                    <PixelBadge variant="outline" className="text-[6px] hover:border-[#3b82f6]">
                      {tool?.name}
                    </PixelBadge>
                  </Link>
                ))}
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendRow({ trend }: { trend: any }) {
  const TrendIcon = trend.sentiment === "rising" 
    ? TrendingUp 
    : trend.sentiment === "falling" 
      ? TrendingDown 
      : Minus;

  const trendColor = trend.sentiment === "rising"
    ? "text-green-400"
    : trend.sentiment === "falling"
      ? "text-red-400"
      : "text-gray-400";

  const rankChange = trend.previousRank - trend.currentRank;

  return (
    <Link href={`/tools/${trend.tool?.slug}`}>
      <div className="flex items-center justify-between p-2 border border-[#1e3a5f] hover:border-[#3b82f6]">
        <div className="flex items-center gap-2">
          <span className="text-[#60a5fa] text-[10px] w-6">#{trend.currentRank}</span>
          <span className="text-[#60a5fa] text-[10px]">{trend.tool?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {rankChange !== 0 && (
            <span className={cn("text-[8px]", rankChange > 0 ? "text-green-400" : "text-red-400")}>
              {rankChange > 0 ? `+${rankChange}` : rankChange}
            </span>
          )}
          <TrendIcon className={cn("w-4 h-4", trendColor)} />
        </div>
      </div>
    </Link>
  );
}

function PredictionCard({ prediction, index, reportId, userId }: { 
  prediction: any; 
  index: number; 
  reportId: Id<"metaReports">;
  userId?: string;
}) {
  const [betAmount, setBetAmount] = useState("");
  const [showBet, setShowBet] = useState(false);
  const placeBet = useMutation(api.metaReports.placeBet);

  const handleBet = async () => {
    if (!userId || !betAmount) return;
    await placeBet({
      userId,
      reportId,
      predictionIndex: index,
      betAmount: parseInt(betAmount),
    });
    setBetAmount("");
    setShowBet(false);
  };

  const confidenceColor = prediction.confidence >= 0.7 
    ? "text-green-400 border-green-400"
    : prediction.confidence >= 0.5
      ? "text-yellow-400 border-yellow-400"
      : "text-red-400 border-red-400";

  return (
    <div className="p-3 border border-[#1e3a5f]">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[#60a5fa] text-[10px] flex-1">{prediction.prediction}</p>
        <PixelBadge variant="outline" className={cn("text-[6px] ml-2", confidenceColor)}>
          {Math.round(prediction.confidence * 100)}%
        </PixelBadge>
      </div>

      {userId && (
        <>
          {!showBet ? (
            <PixelButton size="sm" variant="ghost" onClick={() => setShowBet(true)}>
              <Coins className="w-3 h-3 mr-1" /> BET XP
            </PixelButton>
          ) : (
            <div className="flex gap-2 mt-2">
              <PixelInput
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="XP"
                type="number"
                className="flex-1"
              />
              <PixelButton size="sm" onClick={handleBet} disabled={!betAmount}>
                BET
              </PixelButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function TrendingToolsWidget() {
  const trending = useQuery(api.metaReports.getTrendingTools, { limit: 5 });

  if (!trending || trending.length === 0) return null;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px] flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> TRENDING
        </span>
        <Link href="/meta">
          <ChevronRight className="w-4 h-4 text-[#3b82f6]" />
        </Link>
      </div>
      <div className="space-y-1">
        {trending.map((t: any) => (
          <Link key={t.toolId} href={`/tools/${t.tool?.slug}`}>
            <div className="flex items-center justify-between text-[8px] p-1 hover:bg-[#1e3a5f]/50">
              <span className="text-[#60a5fa]">{t.tool?.name}</span>
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
          </Link>
        ))}
      </div>
    </PixelCard>
  );
}

export function UserBets({ userId }: { userId: string }) {
  const bets = useQuery(api.metaReports.getUserBets, { userId });

  if (!bets || bets.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <Coins className="w-4 h-4" /> YOUR BETS
      </h3>
      <div className="space-y-2">
        {bets.map((bet: any) => (
          <div 
            key={bet._id}
            className={cn(
              "flex items-center justify-between p-2 border",
              bet.outcome === "won" && "border-green-400 bg-green-400/10",
              bet.outcome === "lost" && "border-red-400 bg-red-400/10",
              !bet.outcome && "border-[#1e3a5f]"
            )}
          >
            <div>
              <p className="text-[#60a5fa] text-[8px]">{bet.prediction?.prediction}</p>
              <p className="text-[#3b82f6] text-[6px]">Bet: {bet.betAmount} XP</p>
            </div>
            {bet.outcome ? (
              <PixelBadge 
                variant="outline" 
                className={cn(
                  "text-[6px]",
                  bet.outcome === "won" ? "text-green-400 border-green-400" : "text-red-400 border-red-400"
                )}
              >
                {bet.outcome === "won" ? `+${bet.payout}` : "LOST"}
              </PixelBadge>
            ) : (
              <PixelBadge variant="outline" className="text-[6px]">
                PENDING
              </PixelBadge>
            )}
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
