"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Flame,
  Swords,
  Layers,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  Trophy,
} from "lucide-react";

interface ComboTrackerProps {
  userId: string;
  className?: string;
}

export function ComboTracker({ userId, className }: ComboTrackerProps) {
  const chains = useQuery(api.comboChains.getUserChains, { userId });
  const history = useQuery(api.comboChains.getChainHistory, { userId, limit: 5 });

  const getChainIcon = (type: string) => {
    switch (type) {
      case "battle_win":
        return <Swords className="w-5 h-5" />;
      case "deck_create":
        return <Layers className="w-5 h-5" />;
      case "tool_view":
        return <Eye className="w-5 h-5" />;
      case "review_write":
        return <MessageSquare className="w-5 h-5" />;
      case "daily_login":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Flame className="w-5 h-5" />;
    }
  };

  const getChainLabel = (type: string) => {
    switch (type) {
      case "battle_win":
        return "Battle Wins";
      case "deck_create":
        return "Decks Created";
      case "tool_view":
        return "Tools Viewed";
      case "review_write":
        return "Reviews Written";
      case "daily_login":
        return "Daily Logins";
      default:
        return type;
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 4) return "text-yellow-400";
    if (multiplier >= 3) return "text-purple-400";
    if (multiplier >= 2) return "text-blue-400";
    if (multiplier > 1) return "text-green-400";
    return "text-[#60a5fa]";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> COMBO CHAINS
          </h2>
          <PixelBadge variant="outline" className="text-[8px]">
            <TrendingUp className="w-3 h-3 mr-1" /> XP MULTIPLIERS
          </PixelBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chains?.map((chain) => (
            <motion.div
              key={chain._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "border-2 p-4",
                chain.isActive
                  ? "border-orange-400 bg-orange-400/5"
                  : "border-[#1e3a5f]"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={chain.isActive ? "text-orange-400" : "text-[#3b82f6]"}>
                    {getChainIcon(chain.chainType)}
                  </span>
                  <span className="text-[#60a5fa] text-[10px]">
                    {getChainLabel(chain.chainType)}
                  </span>
                </div>
                {chain.isActive && (
                  <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-[#3b82f6] text-[8px]">CHAIN</p>
                  <p className="text-[#60a5fa] text-xl">{chain.currentCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[#3b82f6] text-[8px]">MULTIPLIER</p>
                  <p className={cn("text-xl", getMultiplierColor(chain.multiplier))}>
                    {chain.multiplier.toFixed(1)}x
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[#3b82f6] text-[8px]">BEST</p>
                  <p className="text-yellow-400 text-xl">{chain.bestChain}</p>
                </div>
              </div>

              {chain.isActive && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[8px] mb-1">
                    <span className="text-[#3b82f6] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> EXPIRES IN
                    </span>
                    <span className="text-orange-400">
                      {formatTimeRemaining(chain.timeRemaining)}
                    </span>
                  </div>
                  <div className="h-1 bg-[#0a1628] border border-[#1e3a5f]">
                    <motion.div
                      className="h-full bg-orange-400"
                      initial={{ width: "100%" }}
                      animate={{
                        width: `${(chain.timeRemaining / (24 * 60 * 60 * 1000)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {!chain.isActive && (
                <div className="mt-3 text-center">
                  <p className="text-red-400 text-[8px]">CHAIN BROKEN</p>
                  <p className="text-[#3b82f6] text-[8px]">
                    Start a new chain to earn bonus XP!
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {(!chains || chains.length === 0) && (
          <div className="text-center py-8">
            <Flame className="w-12 h-12 mx-auto text-[#1e3a5f] mb-4" />
            <p className="text-[#3b82f6] text-[10px]">
              No active chains yet. Start performing actions to build combos!
            </p>
          </div>
        )}
      </PixelCard>

      {history && history.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> CHAIN HISTORY
          </h3>
          <div className="space-y-2">
            {history.map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between p-2 border border-[#1e3a5f]"
              >
                <div className="flex items-center gap-2">
                  {getChainIcon(record.chainType)}
                  <span className="text-[#60a5fa] text-[10px]">
                    {getChainLabel(record.chainType)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400 text-[10px]">
                    x{record.chainLength}
                  </span>
                  <span className="text-[#3b82f6] text-[8px]">
                    {new Date(record.brokenAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
