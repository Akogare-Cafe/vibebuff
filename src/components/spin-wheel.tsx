"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  Gift,
  Zap,
  Star,
  Package,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";

interface SpinWheelProps {
  userId: string;
  className?: string;
}

export function SpinWheel({ userId, className }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{
    reward: { name: string; rewardType: string; rewardValue: number; rarity: string };
  } | null>(null);
  const [rotation, setRotation] = useState(0);

  const rewards = useQuery(api.spinWheel.getRewards);
  const canSpin = useQuery(api.spinWheel.canSpinToday, { userId });
  const spinHistory = useQuery(api.spinWheel.getSpinHistory, { userId, limit: 5 });
  const spin = useMutation(api.spinWheel.spin);

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const spins = 5 + Math.random() * 3;
    const newRotation = rotation + spins * 360 + Math.random() * 360;
    setRotation(newRotation);

    try {
      const spinResult = await spin({ userId });
      
      setTimeout(() => {
        setResult(spinResult);
        setIsSpinning(false);
      }, 3000);
    } catch (error) {
      setIsSpinning(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-400 border-yellow-400";
      case "rare":
        return "text-purple-400 border-purple-400";
      case "uncommon":
        return "text-blue-400 border-blue-400";
      default:
        return "text-primary border-border";
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "xp":
        return <Zap className="w-6 h-6" />;
      case "pack":
        return <Package className="w-6 h-6" />;
      case "tool_reveal":
        return <Star className="w-6 h-6" />;
      case "title":
      case "badge":
        return <Award className="w-6 h-6" />;
      case "multiplier":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-sm flex items-center gap-2">
            <RotateCw className="w-5 h-5" /> DAILY SPIN WHEEL
          </h2>
          {!canSpin && (
            <PixelBadge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" /> COME BACK TOMORROW
            </PixelBadge>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6">
            <motion.div
              className="w-full h-full rounded-full border-4 border-primary bg-gradient-to-br from-[#191022] to-[#362348] flex items-center justify-center"
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              {rewards?.map((reward, index) => {
                const angle = (index / (rewards.length || 1)) * 360;
                const radian = (angle - 90) * (Math.PI / 180);
                const x = Math.cos(radian) * 80;
                const y = Math.sin(radian) * 80;

                return (
                  <div
                    key={reward._id}
                    className={cn(
                      "absolute w-12 h-12 flex items-center justify-center rounded-full border-2 bg-[#191022]",
                      getRarityColor(reward.rarity)
                    )}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    {getRewardIcon(reward.rewardType)}
                  </div>
                );
              })}
              <div className="absolute w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            </motion.div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-400" />
            </div>
          </div>

          <PixelButton
            size="lg"
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
            className={cn(isSpinning && "animate-pulse")}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-5 h-5 mr-2 animate-spin" /> SPINNING...
              </>
            ) : canSpin ? (
              <>
                <Gift className="w-5 h-5 mr-2" /> SPIN NOW
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" /> ALREADY SPUN
              </>
            )}
          </PixelButton>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 text-center"
            >
              <div
                className={cn(
                  "border-4 p-6 bg-[#191022]",
                  getRarityColor(result.reward.rarity)
                )}
              >
                <div className={cn("mb-2", getRarityColor(result.reward.rarity))}>
                  {getRewardIcon(result.reward.rewardType)}
                </div>
                <p className="text-primary text-lg mb-1">{result.reward.name}</p>
                <PixelBadge
                  variant="outline"
                  className={cn("text-xs", getRarityColor(result.reward.rarity))}
                >
                  {result.reward.rarity.toUpperCase()}
                </PixelBadge>
                {result.reward.rewardType === "xp" && (
                  <p className="text-green-400 text-xl mt-2">
                    +{result.reward.rewardValue} XP
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PixelCard>

      {spinHistory && spinHistory.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-sm uppercase mb-4">
            RECENT SPINS
          </h3>
          <div className="space-y-2">
            {spinHistory.map((spin) => (
              <div
                key={spin._id}
                className="flex items-center justify-between p-2 border border-border"
              >
                <div className="flex items-center gap-2">
                  <span className={getRarityColor(spin.reward?.rarity ?? "common")}>
                    {getRewardIcon(spin.rewardType)}
                  </span>
                  <span className="text-primary text-sm">
                    {spin.reward?.name ?? "Unknown"}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {new Date(spin.spunAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
