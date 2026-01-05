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
  Calendar, 
  Clock,
  Trophy,
  Users,
  Flag,
  Swords,
  Zap,
  Star,
  Medal
} from "lucide-react";

interface SeasonalEventsProps {
  userId?: string;
  className?: string;
}

const EVENT_TYPE_CONFIG = {
  hackathon: { icon: Zap, color: "text-yellow-400 border-yellow-400", label: "HACKATHON" },
  retro_week: { icon: Clock, color: "text-purple-400 border-purple-400", label: "RETRO WEEK" },
  framework_war: { icon: Swords, color: "text-red-400 border-red-400", label: "FRAMEWORK WAR" },
  limited_mode: { icon: Star, color: "text-blue-400 border-blue-400", label: "LIMITED MODE" },
};

export function SeasonalEvents({ userId, className }: SeasonalEventsProps) {
  const activeEvents = useQuery(api.events.getActiveEvents);
  const userParticipation = useQuery(
    api.events.getUserEventParticipation,
    userId ? { userId } : "skip"
  );

  const joinedEventIds = new Set(userParticipation?.map((p: any) => p.eventId.toString()) || []);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" /> SEASONAL EVENTS
        </h2>
      </div>

      {activeEvents && activeEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeEvents.map((event: any) => (
            <EventCard 
              key={event._id} 
              event={event} 
              userId={userId}
              isJoined={joinedEventIds.has(event._id.toString())}
            />
          ))}
        </div>
      ) : (
        <PixelCard className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">NO ACTIVE EVENTS</p>
          <p className="text-muted-foreground text-xs">Check back soon for seasonal events!</p>
        </PixelCard>
      )}

      {userParticipation && userParticipation.length > 0 && (
        <div>
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4" /> YOUR EVENTS
          </h3>
          <div className="space-y-2">
            {userParticipation.map((participation: any) => (
              <ParticipationCard key={participation._id} participation={participation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface EventCardProps {
  event: any;
  userId?: string;
  isJoined: boolean;
}

function EventCard({ event, userId, isJoined }: EventCardProps) {
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const joinEvent = useMutation(api.events.joinEvent);

  const config = EVENT_TYPE_CONFIG[event.eventType as keyof typeof EVENT_TYPE_CONFIG];
  const EventIcon = config?.icon || Calendar;

  const timeLeft = event.endDate - Date.now();
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const handleJoin = async () => {
    if (!userId) return;
    await joinEvent({
      userId,
      eventId: event._id,
      faction: selectedFaction || undefined,
    });
  };

  return (
    <PixelCard className={cn("p-4", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <EventIcon className={cn("w-8 h-8", config?.color.split(" ")[0])} />
          <div>
            <h3 className="text-primary text-base">{event.name}</h3>
            <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
              {config?.label}
            </PixelBadge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="w-3 h-3" />
            {daysLeft}d {hoursLeft}h left
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-3">{event.description}</p>

      {event.rules?.factions && (
        <div className="mb-3">
          <p className="text-primary text-xs mb-2">CHOOSE YOUR FACTION:</p>
          <div className="flex flex-wrap gap-2">
            {event.rules.factions.map((faction: string) => (
              <PixelButton
                key={faction}
                size="sm"
                variant={selectedFaction === faction ? "default" : "ghost"}
                onClick={() => setSelectedFaction(faction)}
              >
                {faction}
              </PixelButton>
            ))}
          </div>
        </div>
      )}

      {event.rules?.customRules && (
        <div className="mb-3 p-2 border border-border bg-[#0a0f1a]">
          <p className="text-primary text-xs mb-1">RULES:</p>
          <ul className="text-muted-foreground text-xs space-y-1">
            {event.rules.customRules.map((rule: string, i: number) => (
              <li key={i}>- {rule}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {event.rewards.slice(0, 2).map((reward: any, i: number) => (
            <PixelBadge key={i} variant="outline" className="text-[6px]">
              #{reward.rank}: {reward.rewardValue}
            </PixelBadge>
          ))}
        </div>

        {userId && !isJoined && (
          <PixelButton size="sm" onClick={handleJoin}>
            <Flag className="w-3 h-3 mr-1" /> JOIN
          </PixelButton>
        )}

        {isJoined && (
          <PixelBadge variant="default" className="text-xs bg-green-400 text-black">
            JOINED
          </PixelBadge>
        )}
      </div>
    </PixelCard>
  );
}

function ParticipationCard({ participation }: { participation: any }) {
  const event = participation.event;
  if (!event) return null;

  const config = EVENT_TYPE_CONFIG[event.eventType as keyof typeof EVENT_TYPE_CONFIG];

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="flex items-center justify-between p-3 border border-border hover:border-primary">
        <div className="flex items-center gap-3">
          {config && <config.icon className={cn("w-5 h-5", config.color.split(" ")[0])} />}
          <div>
            <p className="text-primary text-sm">{event.name}</p>
            {participation.faction && (
              <PixelBadge variant="outline" className="text-[6px]">
                {participation.faction}
              </PixelBadge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-primary text-lg">{participation.score}</p>
          <p className="text-muted-foreground text-xs">POINTS</p>
        </div>
      </div>
    </Link>
  );
}

export function EventLeaderboard({ eventId }: { eventId: Id<"seasonalEvents"> }) {
  const leaderboard = useQuery(api.events.getEventLeaderboard, { eventId, limit: 10 });
  const factionScores = useQuery(api.events.getFactionScores, { eventId });

  return (
    <div className="space-y-4">
      {factionScores && factionScores.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4" /> FACTION STANDINGS
          </h3>
          <div className="space-y-2">
            {factionScores.map((faction: any, index: number) => (
              <div 
                key={faction.faction}
                className={cn(
                  "flex items-center justify-between p-2 border",
                  index === 0 && "border-yellow-400 bg-yellow-400/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm">{faction.faction}</span>
                  <span className="text-muted-foreground text-xs">({faction.members} members)</span>
                </div>
                <span className="text-primary text-sm">{faction.score} pts</span>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {leaderboard && leaderboard.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> TOP PARTICIPANTS
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
                  entry.rank > 3 && "border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-6 text-center text-sm",
                    entry.rank === 1 && "text-yellow-400",
                    entry.rank === 2 && "text-gray-400",
                    entry.rank === 3 && "text-orange-400",
                    entry.rank > 3 && "text-muted-foreground"
                  )}>
                    #{entry.rank}
                  </span>
                  <span className="text-primary text-sm">{entry.userId.slice(-6)}</span>
                  {entry.faction && (
                    <PixelBadge variant="outline" className="text-[6px]">
                      {entry.faction}
                    </PixelBadge>
                  )}
                </div>
                <span className="text-muted-foreground text-sm">{entry.score} pts</span>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

export function ActiveEventBanner() {
  const activeEvents = useQuery(api.events.getActiveEvents);

  if (!activeEvents || activeEvents.length === 0) return null;

  const event = activeEvents[0];
  const config = EVENT_TYPE_CONFIG[event.eventType as keyof typeof EVENT_TYPE_CONFIG];
  const EventIcon = config?.icon || Calendar;

  return (
    <Link href={`/events/${event.slug}`}>
      <PixelCard className={cn("p-3", config?.color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EventIcon className={cn("w-5 h-5", config?.color.split(" ")[0])} />
            <div>
              <p className="text-primary text-sm">{event.name}</p>
              <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
                LIVE NOW
              </PixelBadge>
            </div>
          </div>
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>
      </PixelCard>
    </Link>
  );
}
