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
  Clock,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";

interface ComboChainsDisplayProps {
  userId: string;
  className?: string;
}

const CHAIN_CONFIG = {
  battle_win: { icon: Swords, label: "BATTLE WINS", color: "text-red-400" },
  deck_create: { icon: Layers, label: "DECK CREATES", color: "text-purple-400" },
  tool_view: { icon: Eye, label: "TOOL VIEWS", color: "text-blue-400" },
  review_write: { icon: MessageSquare, label: "REVIEWS", color: "text-green-400" },
  daily_login: { icon: Calendar, label: "DAILY LOGIN", color: "text-yellow-400" },
};

export function ComboChainsDisplay({ userId, className }: ComboChainsDisplayProps) {
  const chains = useQuery(api.comboChains.getUserChains, { userId });
  const history = useQuery(api.comboChains.getChainHistory, { userId, limit: 5 });

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> COMBO CHAINS
          </h2>
          <PixelBadge variant="outline" className="text-[8px]">
            {chains?.filter((c) => c.isActive).length ?? 0} ACTIVE
          </PixelBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CHAIN_CONFIG).map(([type, config]) => {
            const chain = chains?.find((c) => c.chainType === type);
            const ChainIcon = config.icon;
            const isActive = chain?.isActive ?? false;

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "border-2 p-4 transition-all",
                  isActive
                    ? `${config.color} border-current bg-current/10`
                    : "border-[#1e3a5f] opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ChainIcon className={cn("w-5 h-5", config.color)} />
                    <span className="text-[#60a5fa] text-[10px]">{config.label}</span>
                  </div>
                  {isActive && (
                    <PixelBadge variant="default" className="text-[6px]">
                      ACTIVE
                    </PixelBadge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Flame className={cn("w-4 h-4", isActive ? "text-orange-400" : "text-[#3b82f6]")} />
                    <span className={cn("text-lg", isActive ? config.color : "text-[#3b82f6]")}>
                      x{chain?.currentCount ?? 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[#60a5fa] text-[10px]">
                      {((chain?.multiplier ?? 1) * 100 - 100).toFixed(0)}% BONUS
                    </p>
                  </div>
                </div>

                {isActive && chain && (
                  <div className="flex items-center gap-1 text-[8px] text-[#3b82f6]">
                    <Clock className="w-3 h-3" />
                    <span>Expires in {formatTimeRemaining(chain.timeRemaining)}</span>
                  </div>
                )}

                {chain?.bestChain && chain.bestChain > 1 && (
                  <div className="mt-2 pt-2 border-t border-[#1e3a5f] flex items-center gap-1 text-[8px]">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span className="text-[#3b82f6]">Best: x{chain.bestChain}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {(!chains || chains.length === 0) && (
          <div className="text-center py-8">
            <Flame className="w-12 h-12 mx-auto text-[#1e3a5f] mb-4" />
            <p className="text-[#3b82f6] text-[10px]">
              No combo chains yet. Start performing actions to build combos!
            </p>
          </div>
        )}
      </PixelCard>

      <PixelCard className="p-4">
        <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> HOW COMBOS WORK
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[8px]">
          <div className="border border-[#1e3a5f] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-[#60a5fa]">BUILD CHAINS</span>
            </div>
            <p className="text-[#3b82f6]">
              Repeat the same action within 24 hours to build your combo chain.
            </p>
          </div>
          <div className="border border-[#1e3a5f] p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-[#60a5fa]">EARN BONUS XP</span>
            </div>
            <p className="text-[#3b82f6]">
              Each chain level adds +10% XP bonus, up to 5x multiplier.
            </p>
          </div>
          <div className="border border-[#1e3a5f] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-[#60a5fa]">KEEP IT ALIVE</span>
            </div>
            <p className="text-[#3b82f6]">
              Chains expire after 24 hours of inactivity. Stay active!
            </p>
          </div>
        </div>
      </PixelCard>

      {history && history.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> RECENT CHAIN HISTORY
          </h3>
          <div className="space-y-2">
            {history.map((entry, index) => {
              const config = CHAIN_CONFIG[entry.chainType as keyof typeof CHAIN_CONFIG];
              const ChainIcon = config?.icon || Flame;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border border-[#1e3a5f]"
                >
                  <div className="flex items-center gap-2">
                    <ChainIcon className={cn("w-4 h-4", config?.color || "text-[#3b82f6]")} />
                    <span className="text-[#60a5fa] text-[10px]">
                      {config?.label || entry.chainType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#3b82f6] text-[8px]">
                      x{entry.chainLength} chain
                    </span>
                    <span className="text-[#1e3a5f] text-[8px]">
                      {new Date(entry.brokenAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
