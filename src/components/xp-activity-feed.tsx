"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Zap,
  Swords,
  Target,
  Eye,
  Layers,
  Vote,
  Trophy,
  Package,
  Flame,
  Star,
  Clock
} from "lucide-react";

interface XpActivityFeedProps {
  userId: string;
  limit?: number;
  className?: string;
}

interface XpActivity {
  _id: string;
  userId: string;
  amount: number;
  source: string;
  description?: string;
  timestamp: number;
}

const XP_SOURCE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  battle_win: { icon: Swords, color: "text-green-400", label: "Battle Won" },
  battle_loss: { icon: Swords, color: "text-red-400", label: "Battle Lost" },
  challenge_complete: { icon: Target, color: "text-yellow-400", label: "Challenge Complete" },
  tool_view: { icon: Eye, color: "text-blue-400", label: "Tool Viewed" },
  deck_create: { icon: Layers, color: "text-purple-400", label: "Deck Created" },
  vote_cast: { icon: Vote, color: "text-orange-400", label: "Vote Cast" },
  achievement_unlock: { icon: Trophy, color: "text-yellow-400", label: "Achievement Unlocked" },
  pack_open: { icon: Package, color: "text-pink-400", label: "Pack Opened" },
  daily_login: { icon: Flame, color: "text-orange-400", label: "Daily Login" },
  quest_complete: { icon: Star, color: "text-yellow-400", label: "Quest Complete" },
  duplicate_bonus: { icon: Package, color: "text-yellow-400", label: "Duplicate Bonus" },
};

export function XpActivityFeed({ userId, limit = 10, className }: XpActivityFeedProps) {
  const activities = useQuery(api.xpActivity.getRecentActivity, { userId, limit });

  if (!activities || activities.length === 0) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <h3 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" /> XP ACTIVITY
        </h3>
        <div className="text-center py-4">
          <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">NO RECENT ACTIVITY</p>
          <p className="text-muted-foreground text-[6px]">Start playing to earn XP!</p>
        </div>
      </PixelCard>
    );
  }

  const totalXp = activities.reduce((sum: number, a: { amount: number }) => sum + a.amount, 0);

  return (
    <PixelCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary text-sm uppercase flex items-center gap-2">
          <Zap className="w-4 h-4" /> XP ACTIVITY
        </h3>
        <PixelBadge variant="default" className="text-[6px]">
          +{totalXp} XP TODAY
        </PixelBadge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {(activities as XpActivity[]).map((activity) => {
          const config = XP_SOURCE_CONFIG[activity.source] || { 
            icon: Zap, 
            color: "text-muted-foreground", 
            label: activity.source 
          };
          const Icon = config.icon;
          const timeAgo = getTimeAgo(activity.timestamp);

          return (
            <div
              key={activity._id}
              className="flex items-center justify-between p-2 border border-border bg-[#191022]"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <div>
                  <p className="text-primary text-[9px]">{config.label}</p>
                  {activity.description && (
                    <p className="text-muted-foreground text-[7px]">{activity.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm",
                  activity.amount > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {activity.amount > 0 ? "+" : ""}{activity.amount} XP
                </p>
                <p className="text-muted-foreground text-[6px] flex items-center gap-1">
                  <Clock className="w-2 h-2" /> {timeAgo}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function XpActivityWidget({ userId }: { userId: string }) {
  const activities = useQuery(api.xpActivity.getRecentActivity, { userId, limit: 3 });

  if (!activities || activities.length === 0) return null;

  const totalXp = activities.reduce((sum: number, a: { amount: number }) => sum + a.amount, 0);

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-primary text-sm flex items-center gap-1">
          <Zap className="w-3 h-3" /> RECENT XP
        </span>
        <PixelBadge variant="default" className="text-[6px] bg-green-400 text-black">
          +{totalXp}
        </PixelBadge>
      </div>
      <div className="space-y-1">
        {(activities as XpActivity[]).slice(0, 3).map((activity) => {
          const config = XP_SOURCE_CONFIG[activity.source] || { 
            icon: Zap, 
            color: "text-muted-foreground", 
            label: activity.source 
          };
          return (
            <div key={activity._id} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate flex-1">{config.label}</span>
              <span className="text-green-400 ml-2">+{activity.amount}</span>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}
