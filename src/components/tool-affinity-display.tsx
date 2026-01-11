"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Eye,
  Layers,
  Swords,
  MessageSquare,
  Share2,
  Star,
  Users,
  Sparkles,
  TrendingUp,
  Gift,
  Lock,
  ChevronRight,
} from "lucide-react";

interface ToolAffinityDisplayProps {
  userId: string;
  className?: string;
}

export function ToolAffinityDisplay({ userId, className }: ToolAffinityDisplayProps) {
  const affinities = useQuery(api.toolAffinity.getUserAffinities, { userId });

  const getAffinityColor = (level: string) => {
    switch (level) {
      case "soulmate":
        return "text-pink-400 border-pink-400 bg-pink-400/10";
      case "companion":
        return "text-purple-400 border-purple-400 bg-purple-400/10";
      case "friend":
        return "text-blue-400 border-blue-400 bg-blue-400/10";
      case "acquaintance":
        return "text-green-400 border-green-400 bg-green-400/10";
      default:
        return "text-muted-foreground border-border";
    }
  };

  const getAffinityIcon = (level: string) => {
    switch (level) {
      case "soulmate":
        return <Sparkles className="w-5 h-5" />;
      case "companion":
        return <Heart className="w-5 h-5" />;
      case "friend":
        return <Users className="w-5 h-5" />;
      case "acquaintance":
        return <Star className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-sm flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" /> TOOL AFFINITIES
          </h2>
          <PixelBadge variant="outline" className="text-xs">
            {affinities?.length ?? 0} TOOLS
          </PixelBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {affinities?.slice(0, 9).map((affinity) => (
            <motion.div
              key={affinity._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "border-2 p-4 transition-all",
                getAffinityColor(affinity.affinityLevel)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-primary text-base mb-1">
                    {affinity.tool?.slug ? (
                      <Link href={`/tools/${affinity.tool.slug}`} className="hover:underline">
                        {affinity.tool.name}
                      </Link>
                    ) : (
                      "Unknown Tool"
                    )}
                  </h3>
                  <PixelBadge
                    variant="outline"
                    className={cn("text-[6px]", getAffinityColor(affinity.affinityLevel))}
                  >
                    {affinity.affinityLevel.toUpperCase()}
                  </PixelBadge>
                </div>
                <span className={getAffinityColor(affinity.affinityLevel)}>
                  {getAffinityIcon(affinity.affinityLevel)}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">AFFINITY PROGRESS</span>
                  <span className="text-primary">{affinity.progress}%</span>
                </div>
                <div className="h-2 bg-[#0a0f1a] border border-border">
                  <motion.div
                    className={cn(
                      "h-full",
                      getAffinityColor(affinity.affinityLevel).split(" ")[0].replace("text-", "bg-")
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${affinity.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {affinity.nextLevel && (
                  <p className="text-muted-foreground text-[6px] mt-1">
                    Next: {affinity.nextLevel}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1 text-center">
                <InteractionStat
                  icon={<Eye className="w-3 h-3" />}
                  value={affinity.interactions.views}
                  label="Views"
                />
                <InteractionStat
                  icon={<Layers className="w-3 h-3" />}
                  value={affinity.interactions.deckAdds}
                  label="Decks"
                />
                <InteractionStat
                  icon={<Swords className="w-3 h-3" />}
                  value={affinity.interactions.battleWins}
                  label="Wins"
                />
                <InteractionStat
                  icon={<MessageSquare className="w-3 h-3" />}
                  value={affinity.interactions.reviews}
                  label="Reviews"
                />
                <InteractionStat
                  icon={<Share2 className="w-3 h-3" />}
                  value={affinity.interactions.recommendations}
                  label="Recs"
                />
              </div>

              <div className="mt-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-xs">
                    {affinity.affinityPoints} Affinity Points
                  </span>
                  {affinity.perks && affinity.perks.length > 0 && (
                    <span className="text-primary text-[6px] flex items-center gap-1">
                      <Gift className="w-3 h-3" /> {affinity.perks.length} PERKS
                    </span>
                  )}
                </div>
                {affinity.nextPerks && affinity.nextPerks.length > 0 && (
                  <div className="text-[6px] text-muted-foreground flex items-center gap-1">
                    <Lock className="w-2 h-2" />
                    <span>Next: {affinity.nextPerks[0]?.name}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {(!affinities || affinities.length === 0) && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No tool affinities yet. Interact with tools to build relationships!
            </p>
          </div>
        )}
      </PixelCard>

      <PixelCard className="p-4">
        <h3 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> AFFINITY LEVELS
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {["stranger", "acquaintance", "friend", "companion", "soulmate"].map((level) => (
            <div
              key={level}
              className={cn(
                "border-2 p-2 text-center",
                getAffinityColor(level)
              )}
            >
              <span className={getAffinityColor(level)}>
                {getAffinityIcon(level)}
              </span>
              <p className="text-primary text-[6px] uppercase mt-1">{level}</p>
            </div>
          ))}
        </div>
      </PixelCard>
    </div>
  );
}

function InteractionStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="text-center">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-primary text-xs">{value}</p>
      <p className="text-muted-foreground text-[4px]">{label}</p>
    </div>
  );
}
