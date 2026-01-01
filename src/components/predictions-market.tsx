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
  TrendingUp, 
  TrendingDown,
  Clock,
  Trophy,
  Star,
  Target,
  Zap,
  Check,
  X,
  DollarSign,
  Users
} from "lucide-react";

interface PredictionsMarketProps {
  userId?: string;
  className?: string;
}

const CATEGORY_CONFIG = {
  tool_growth: { color: "text-green-400 border-green-400", icon: TrendingUp, label: "GROWTH" },
  tool_decline: { color: "text-red-400 border-red-400", icon: TrendingDown, label: "DECLINE" },
  new_release: { color: "text-blue-400 border-blue-400", icon: Zap, label: "NEW RELEASE" },
  acquisition: { color: "text-purple-400 border-purple-400", icon: DollarSign, label: "ACQUISITION" },
  trend: { color: "text-yellow-400 border-yellow-400", icon: Target, label: "TREND" },
  custom: { color: "text-gray-400 border-gray-400", icon: Star, label: "CUSTOM" },
};

export function PredictionsMarket({ userId, className }: PredictionsMarketProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const predictions = useQuery(api.predictions.getOpenPredictions, { 
    category: activeCategory || undefined,
    limit: 20 
  });
  const upcomingResolutions = useQuery(api.predictions.getUpcomingResolutions, { limit: 5 });
  const leaderboard = useQuery(api.predictions.getPredictionLeaderboard, { limit: 10 });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> PREDICTIONS MARKET
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <PixelButton
          size="sm"
          variant={activeCategory === null ? "default" : "ghost"}
          onClick={() => setActiveCategory(null)}
        >
          ALL
        </PixelButton>
        {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
          const CatIcon = config.icon;
          return (
            <PixelButton
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "ghost"}
              onClick={() => setActiveCategory(cat)}
            >
              <CatIcon className="w-3 h-3 mr-1" /> {config.label}
            </PixelButton>
          );
        })}
      </div>

      {upcomingResolutions && upcomingResolutions.length > 0 && !activeCategory && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> RESOLVING SOON
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {upcomingResolutions.map((pred: any) => (
              <MiniPredictionCard key={pred._id} prediction={pred} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions?.map((prediction: any) => (
          <PredictionCard key={prediction._id} prediction={prediction} userId={userId} />
        ))}
      </div>

      {leaderboard && leaderboard.length > 0 && (
        <PredictionLeaderboard leaderboard={leaderboard} />
      )}
    </div>
  );
}

function MiniPredictionCard({ prediction }: { prediction: any }) {
  const daysLeft = Math.ceil((prediction.resolutionDate - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <PixelCard className="p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <Clock className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 text-[10px]">{daysLeft}d left</span>
      </div>
      <p className="text-[#60a5fa] text-[10px] line-clamp-2">{prediction.title}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-green-400 text-[10px]">{prediction.yesPercent}%</span>
        <div className="flex-1 h-2 bg-[#0a1628] border border-[#1e3a5f]">
          <div className="h-full bg-green-400" style={{ width: `${prediction.yesPercent}%` }} />
        </div>
        <span className="text-red-400 text-[10px]">{prediction.noPercent}%</span>
      </div>
    </PixelCard>
  );
}

function PredictionCard({ prediction, userId }: { prediction: any; userId?: string }) {
  const [showBet, setShowBet] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [betPosition, setBetPosition] = useState<"yes" | "no">("yes");
  
  const placeBet = useMutation(api.predictions.placeBet);
  const config = CATEGORY_CONFIG[prediction.category as keyof typeof CATEGORY_CONFIG];
  const CatIcon = config?.icon || Star;

  const handlePlaceBet = async () => {
    if (!userId) return;
    await placeBet({
      predictionId: prediction._id,
      oderId: userId,
      position: betPosition,
      stakeAmount: betAmount,
      confidence: betAmount / 100,
    });
    setShowBet(false);
  };

  const daysLeft = Math.ceil((prediction.resolutionDate - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <PixelCard className={cn("p-4", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
          <CatIcon className="w-3 h-3 mr-1" /> {config?.label}
        </PixelBadge>
        <div className="flex items-center gap-1 text-[#3b82f6] text-[8px]">
          <Clock className="w-3 h-3" /> {daysLeft}d
        </div>
      </div>

      <h3 className="text-[#60a5fa] text-[12px] mb-2">{prediction.title}</h3>
      <p className="text-[#3b82f6] text-[10px] mb-3">{prediction.description}</p>

      {prediction.tool && (
        <Link href={`/tools/${prediction.tool.slug}`}>
          <PixelBadge variant="outline" className="text-[6px] mb-3">
            {prediction.tool.name}
          </PixelBadge>
        </Link>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-green-400 text-[10px] flex items-center gap-1">
            <Check className="w-3 h-3" /> YES {prediction.yesPercent}%
          </span>
          <span className="text-red-400 text-[10px] flex items-center gap-1">
            NO {prediction.noPercent}% <X className="w-3 h-3" />
          </span>
        </div>
        <div className="h-3 bg-[#0a1628] border border-[#1e3a5f] flex overflow-hidden">
          <div className="bg-green-400 h-full" style={{ width: `${prediction.yesPercent}%` }} />
          <div className="bg-red-400 h-full" style={{ width: `${prediction.noPercent}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1 text-[8px] text-[#3b82f6]">
          <span>{prediction.totalYesStake} XP staked</span>
          <span>{prediction.totalNoStake} XP staked</span>
        </div>
      </div>

      {prediction.isExpertPrediction && (
        <PixelBadge variant="outline" className="text-[6px] text-yellow-400 border-yellow-400 mb-3">
          <Star className="w-3 h-3 mr-1" /> EXPERT PREDICTION
        </PixelBadge>
      )}

      {userId && !showBet && (
        <PixelButton size="sm" onClick={() => setShowBet(true)} className="w-full">
          <Target className="w-3 h-3 mr-1" /> PLACE BET
        </PixelButton>
      )}

      {showBet && (
        <div className="space-y-3 p-3 border border-[#1e3a5f] bg-[#0a1628]">
          <div className="flex gap-2">
            <PixelButton
              size="sm"
              variant={betPosition === "yes" ? "default" : "ghost"}
              onClick={() => setBetPosition("yes")}
              className="flex-1"
            >
              <Check className="w-3 h-3 mr-1" /> YES
            </PixelButton>
            <PixelButton
              size="sm"
              variant={betPosition === "no" ? "default" : "ghost"}
              onClick={() => setBetPosition("no")}
              className="flex-1"
            >
              <X className="w-3 h-3 mr-1" /> NO
            </PixelButton>
          </div>
          <div>
            <p className="text-[#3b82f6] text-[8px] mb-1">STAKE (XP)</p>
            <div className="flex gap-2">
              {[50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={cn(
                    "flex-1 p-2 text-[10px] border",
                    betAmount === amount
                      ? "border-[#3b82f6] bg-[#3b82f6]/20 text-[#60a5fa]"
                      : "border-[#1e3a5f] text-[#3b82f6]"
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <PixelButton size="sm" onClick={handlePlaceBet} className="flex-1">
              CONFIRM
            </PixelButton>
            <PixelButton size="sm" variant="ghost" onClick={() => setShowBet(false)}>
              CANCEL
            </PixelButton>
          </div>
        </div>
      )}
    </PixelCard>
  );
}

function PredictionLeaderboard({ leaderboard }: { leaderboard: any[] }) {
  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> TOP PREDICTORS
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
            <div className="flex items-center gap-3">
              <span className={cn(
                "w-6 text-center text-[10px]",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-gray-400",
                entry.rank === 3 && "text-orange-400",
                entry.rank > 3 && "text-[#3b82f6]"
              )}>
                #{entry.rank}
              </span>
              <span className="text-[#60a5fa] text-[10px]">{entry.oderId.slice(-6)}</span>
            </div>
            <div className="flex items-center gap-4 text-[8px]">
              <span className="text-green-400">{entry.accuracy}% acc</span>
              <span className="text-[#3b82f6]">{entry.totalPredictions} bets</span>
              <span className={cn(
                entry.totalProfit >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {entry.totalProfit >= 0 ? "+" : ""}{entry.totalProfit} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}

export function UserBets({ userId }: { userId: string }) {
  const bets = useQuery(api.predictions.getUserBets, { oderId: userId });

  if (!bets || bets.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" /> YOUR BETS
      </h3>
      <div className="space-y-2">
        {bets.map((bet: any) => (
          <div key={bet._id} className="flex items-center justify-between p-2 border border-[#1e3a5f]">
            <div>
              <p className="text-[#60a5fa] text-[10px]">{bet.prediction?.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <PixelBadge 
                  variant="outline" 
                  className={cn(
                    "text-[6px]",
                    bet.position === "yes" ? "text-green-400 border-green-400" : "text-red-400 border-red-400"
                  )}
                >
                  {bet.position.toUpperCase()}
                </PixelBadge>
                <span className="text-[#3b82f6] text-[8px]">{bet.stakeAmount} XP</span>
              </div>
            </div>
            {bet.payout !== undefined && (
              <span className={cn(
                "text-[12px]",
                bet.payout > 0 ? "text-green-400" : "text-red-400"
              )}>
                {bet.payout > 0 ? "+" : ""}{bet.payout} XP
              </span>
            )}
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
