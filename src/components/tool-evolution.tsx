"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Sparkles, 
  Star,
  TrendingUp,
  Award,
  Gem,
  Crown,
  Clock
} from "lucide-react";

const TIER_CONFIG = {
  bronze: { color: "text-orange-600 border-orange-600", bg: "bg-orange-600/10", icon: Star },
  silver: { color: "text-gray-400 border-gray-400", bg: "bg-gray-400/10", icon: Star },
  gold: { color: "text-yellow-400 border-yellow-400", bg: "bg-yellow-400/10", icon: Award },
  diamond: { color: "text-cyan-400 border-cyan-400", bg: "bg-cyan-400/10", icon: Gem },
  legendary: { color: "text-purple-400 border-purple-400", bg: "bg-purple-400/10", icon: Crown },
};

interface ToolEvolutionProps {
  toolId: Id<"tools">;
  className?: string;
}

export function ToolEvolutionDisplay({ toolId, className }: ToolEvolutionProps) {
  const evolution = useQuery(api.evolution.getToolEvolution, { toolId });
  const history = useQuery(api.evolution.getEvolutionHistory, { toolId });

  if (!evolution) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground text-[10px] pixel-loading">LOADING...</div>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[evolution.currentTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze;
  const TierIcon = tierConfig.icon;

  return (
    <div className={cn("space-y-4", className)}>
      <PixelCard className={cn("p-4", tierConfig.color, tierConfig.bg)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <TierIcon className={cn("w-10 h-10", tierConfig.color.split(" ")[0])} />
            <div>
              <h3 className="text-primary text-[12px]">{evolution.tool?.name}</h3>
              <PixelBadge variant="outline" className={cn("text-[8px]", tierConfig.color)}>
                {evolution.currentTier.toUpperCase()} TIER
              </PixelBadge>
            </div>
          </div>
          <Sparkles className={cn("w-6 h-6", tierConfig.color.split(" ")[0])} />
        </div>

        {evolution.evolution && (
          <div className="text-[8px] text-muted-foreground">
            <p>Evolved via: {evolution.evolution.milestone.type}</p>
            <p>Value: {evolution.evolution.milestone.value.toLocaleString()}</p>
          </div>
        )}
      </PixelCard>

      {history && history.length > 0 && (
        <div>
          <h4 className="text-primary text-[10px] uppercase mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> EVOLUTION HISTORY
          </h4>
          <div className="space-y-2">
            {history.map((e: any) => {
              const config = TIER_CONFIG[e.tier as keyof typeof TIER_CONFIG];
              return (
                <div key={e._id} className={cn("flex items-center gap-3 p-2 border", config.color)}>
                  <config.icon className={cn("w-4 h-4", config.color.split(" ")[0])} />
                  <div className="flex-1">
                    <span className="text-primary text-[10px]">{e.tier.toUpperCase()}</span>
                    <span className="text-muted-foreground text-[8px] ml-2">
                      {new Date(e.evolvedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[8px]">
                    {e.milestone.type}: {e.milestone.value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function EvolvingToolsFeed({ limit = 5 }: { limit?: number }) {
  const evolvingTools = useQuery(api.evolution.getEvolvingTools, { limit });

  if (!evolvingTools || evolvingTools.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> RECENTLY EVOLVED
      </h3>
      <div className="space-y-2">
        {evolvingTools.map((e: any) => {
          const config = TIER_CONFIG[e.tier as keyof typeof TIER_CONFIG];
          return (
            <Link key={e._id} href={`/tools/${e.tool?.slug}`}>
              <div className={cn("flex items-center gap-2 p-2 border hover:border-primary", config.color)}>
                <config.icon className={cn("w-4 h-4", config.color.split(" ")[0])} />
                <span className="text-primary text-[10px] flex-1">{e.tool?.name}</span>
                <PixelBadge variant="outline" className={cn("text-[6px]", config.color)}>
                  {e.tier.toUpperCase()}
                </PixelBadge>
              </div>
            </Link>
          );
        })}
      </div>
    </PixelCard>
  );
}

export function TierDistribution() {
  const distribution = useQuery(api.evolution.getTierDistribution);

  if (!distribution) return null;

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <Gem className="w-4 h-4" /> TIER DISTRIBUTION
      </h3>
      <div className="space-y-2">
        {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG.bronze][]).map(([tier, config]) => {
          const count = distribution[tier] || 0;
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={tier} className="flex items-center gap-2">
              <config.icon className={cn("w-4 h-4", config.color.split(" ")[0])} />
              <span className={cn("w-20 text-[8px]", config.color.split(" ")[0])}>
                {tier.toUpperCase()}
              </span>
              <div className="flex-1 h-2 bg-[#191022] border border-border">
                <div 
                  className={cn("h-full", config.bg.replace("/10", ""))}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-muted-foreground text-[8px] w-8">{count}</span>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}

export function OGBadges({ userId }: { userId: string }) {
  const badges = useQuery(api.evolution.getUserOGBadges, { userId });

  if (!badges || badges.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-[10px] uppercase mb-3 flex items-center gap-2">
        <Award className="w-4 h-4" /> OG COLLECTOR BADGES
      </h3>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge: any) => {
          const currentConfig = TIER_CONFIG[badge.currentTier as keyof typeof TIER_CONFIG];
          return (
            <Link key={badge._id} href={`/tools/${badge.tool?.slug}`}>
              <div className={cn("p-2 border text-center", currentConfig.color, currentConfig.bg)}>
                <currentConfig.icon className={cn("w-6 h-6 mx-auto", currentConfig.color.split(" ")[0])} />
                <p className="text-primary text-[8px] mt-1">{badge.tool?.name}</p>
                <PixelBadge variant="outline" className="text-[6px] mt-1">
                  OG @ {badge.tierAtCollection.toUpperCase()}
                </PixelBadge>
              </div>
            </Link>
          );
        })}
      </div>
    </PixelCard>
  );
}
