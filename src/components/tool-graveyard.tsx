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
  Skull, 
  Heart,
  Sparkles,
  Calendar,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  Eye,
  Clock,
  AlertTriangle,
  ThumbsUp,
  Send
} from "lucide-react";

interface ToolGraveyardProps {
  className?: string;
}

const CAUSE_CONFIG = {
  abandoned: { color: "text-gray-400 border-gray-400", label: "ABANDONED" },
  acquired_killed: { color: "text-purple-400 border-purple-400", label: "ACQUIRED & KILLED" },
  superseded: { color: "text-blue-400 border-blue-400", label: "SUPERSEDED" },
  security_issues: { color: "text-red-400 border-red-400", label: "SECURITY ISSUES" },
  company_shutdown: { color: "text-orange-400 border-orange-400", label: "COMPANY SHUTDOWN" },
  community_exodus: { color: "text-yellow-400 border-yellow-400", label: "COMMUNITY EXODUS" },
  other: { color: "text-gray-400 border-gray-400", label: "OTHER" },
};

export function ToolGraveyard({ className }: ToolGraveyardProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const entries = useQuery(api.graveyard.getGraveyardEntries, { 
    cause: activeFilter || undefined,
    limit: 20 
  });
  const recentDeaths = useQuery(api.graveyard.getRecentDeaths, { limit: 5 });
  const resurrected = useQuery(api.graveyard.getResurrectedTools);
  const resurrectionWatch = useQuery(api.graveyard.getResurrectionWatch, { limit: 5 });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Skull className="w-4 h-4" /> TOOL GRAVEYARD
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <PixelButton
          size="sm"
          variant={activeFilter === null ? "default" : "ghost"}
          onClick={() => setActiveFilter(null)}
        >
          ALL
        </PixelButton>
        {Object.entries(CAUSE_CONFIG).slice(0, 5).map(([cause, config]) => (
          <PixelButton
            key={cause}
            size="sm"
            variant={activeFilter === cause ? "default" : "ghost"}
            onClick={() => setActiveFilter(cause)}
          >
            {config.label}
          </PixelButton>
        ))}
      </div>

      {resurrected && resurrected.length > 0 && (
        <div>
          <h3 className="text-green-400 text-sm uppercase mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> PHOENIX AWARDS (Resurrected)
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {resurrected.map((entry: any) => (
              <ResurrectedCard key={entry._id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {resurrectionWatch && resurrectionWatch.length > 0 && (
        <div>
          <h3 className="text-yellow-400 text-sm uppercase mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" /> RESURRECTION WATCH
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {resurrectionWatch.map((watch: any) => (
              <ResurrectionWatchCard key={watch._id} watch={watch} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
          <Skull className="w-4 h-4" /> REST IN PEACE
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries?.map((entry: any) => (
            <GraveyardCard key={entry._id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GraveyardCard({ entry }: { entry: any }) {
  const config = CAUSE_CONFIG[entry.causeOfDeath as keyof typeof CAUSE_CONFIG];

  return (
    <PixelCard className={cn("p-4", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-primary text-base">{entry.name}</h3>
          <p className="text-muted-foreground text-xs">{entry.tagline}</p>
        </div>
        <Skull className="w-5 h-5 text-muted-foreground" />
      </div>

      <PixelBadge variant="outline" className={cn("text-[6px] mb-3", config?.color)}>
        {config?.label}
      </PixelBadge>

      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Peak: {entry.peakYear}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Died: {entry.deathYear}
        </span>
      </div>

      <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{entry.obituary}</p>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> {entry.memorialMessages} memorials
        </span>
        <Link href={`/graveyard/${entry._id}`}>
          <PixelButton size="sm">
            <Heart className="w-3 h-3 mr-1" /> PAY RESPECTS
          </PixelButton>
        </Link>
      </div>
    </PixelCard>
  );
}

function ResurrectedCard({ entry }: { entry: any }) {
  return (
    <PixelCard className="p-3 min-w-[180px] border-green-400">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-green-400" />
        <span className="text-green-400 text-sm">{entry.name}</span>
      </div>
      <p className="text-muted-foreground text-xs">
        Died {entry.deathYear}, Resurrected {new Date(entry.resurrectionDate).getFullYear()}
      </p>
    </PixelCard>
  );
}

function ResurrectionWatchCard({ watch }: { watch: any }) {
  const watchResurrection = useMutation(api.graveyard.watchResurrection);

  return (
    <PixelCard className="p-3 border-yellow-400">
      <div className="flex items-center justify-between mb-2">
        <span className="text-primary text-sm">{watch.name}</span>
        <PixelBadge variant="outline" className="text-[6px] text-yellow-400 border-yellow-400">
          {watch.hopeLevel}% HOPE
        </PixelBadge>
      </div>
      
      <div className="h-2 bg-[#191022] border border-border mb-2">
        <div className="h-full bg-yellow-400" style={{ width: `${watch.hopeLevel}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{watch.signs.length} signs</span>
        <button 
          onClick={() => watchResurrection({ watchId: watch._id })}
          className="flex items-center gap-1 hover:text-primary"
        >
          <Eye className="w-3 h-3" /> {watch.watchers} watching
        </button>
      </div>
    </PixelCard>
  );
}

interface GraveyardDetailProps {
  entryId: Id<"toolGraveyard">;
  userId?: string;
}

export function GraveyardDetail({ entryId, userId }: GraveyardDetailProps) {
  const [message, setMessage] = useState("");
  const [yearsUsed, setYearsUsed] = useState<number | undefined>();
  const [fondestMemory, setFondestMemory] = useState("");
  
  const entry = useQuery(api.graveyard.getGraveyardEntry, { entryId });
  const migrationGuides = useQuery(
    api.graveyard.getMigrationGuides,
    entry ? { fromToolName: entry.name } : "skip"
  );
  const addMemorial = useMutation(api.graveyard.addMemorial);

  const handleSubmitMemorial = async () => {
    if (!userId || !message) return;
    await addMemorial({
      graveyardEntryId: entryId,
      oderId: userId,
      message,
      yearsUsed,
      fondestMemory: fondestMemory || undefined,
    });
    setMessage("");
    setYearsUsed(undefined);
    setFondestMemory("");
  };

  if (!entry) {
    return (
      <PixelCard className="p-8 text-center">
        <Skull className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">LOADING...</p>
      </PixelCard>
    );
  }

  const config = CAUSE_CONFIG[entry.causeOfDeath as keyof typeof CAUSE_CONFIG];

  return (
    <div className="space-y-6">
      <PixelCard className={cn("p-6", config?.color)}>
        <div className="text-center mb-6">
          <Skull className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-primary text-2xl mb-2">{entry.name}</h1>
          <p className="text-muted-foreground text-base mb-4">{entry.tagline}</p>
          <p className="text-muted-foreground text-sm">
            {entry.peakYear} - {entry.deathYear}
          </p>
        </div>

        <PixelBadge variant="outline" className={cn("text-xs mx-auto block w-fit mb-4", config?.color)}>
          {config?.label}
        </PixelBadge>

        <div className="border-t border-border pt-4">
          <h2 className="text-primary text-sm uppercase mb-3">OBITUARY</h2>
          <p className="text-muted-foreground text-base">{entry.obituary}</p>
        </div>
      </PixelCard>

      {entry.lessonsLearned.length > 0 && (
        <PixelCard className="p-4">
          <h2 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> LESSONS LEARNED
          </h2>
          <ul className="space-y-2">
            {entry.lessonsLearned.map((lesson: string, i: number) => (
              <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                <span className="text-muted-foreground">{i + 1}.</span> {lesson}
              </li>
            ))}
          </ul>
        </PixelCard>
      )}

      {entry.successors && entry.successors.length > 0 && (
        <PixelCard className="p-4">
          <h2 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> SUCCESSORS
          </h2>
          <div className="flex flex-wrap gap-2">
            {entry.successors.map((successor: any) => (
              <Link key={successor._id} href={`/tools/${successor.slug}`}>
                <PixelBadge variant="outline" className="text-xs hover:border-primary">
                  {successor.name}
                </PixelBadge>
              </Link>
            ))}
          </div>
        </PixelCard>
      )}

      {migrationGuides && migrationGuides.length > 0 && (
        <PixelCard className="p-4">
          <h2 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> ESCAPE ROUTES
          </h2>
          <div className="space-y-3">
            {migrationGuides.map((guide: any) => (
              <MigrationGuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        </PixelCard>
      )}

      <PixelCard className="p-4">
        <h2 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" /> MEMORIALS ({entry.memorials?.length || 0})
        </h2>
        
        {userId && (
          <div className="mb-4 p-3 border border-border bg-[#191022]">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your memories..."
              className="w-full bg-transparent border-none text-primary text-sm h-20 resize-none focus:outline-none"
            />
            <div className="flex items-center gap-3 mt-2">
              <input
                type="number"
                value={yearsUsed || ""}
                onChange={(e) => setYearsUsed(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Years used"
                className="w-24 bg-[#191022] border border-border p-1 text-primary text-xs"
              />
              <input
                type="text"
                value={fondestMemory}
                onChange={(e) => setFondestMemory(e.target.value)}
                placeholder="Fondest memory..."
                className="flex-1 bg-[#191022] border border-border p-1 text-primary text-xs"
              />
              <PixelButton size="sm" onClick={handleSubmitMemorial} disabled={!message}>
                <Send className="w-3 h-3" />
              </PixelButton>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {entry.memorials?.map((memorial: any) => (
            <div key={memorial._id} className="p-3 border border-border">
              <p className="text-primary text-sm mb-2">"{memorial.message}"</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>- {memorial.oderId.slice(-6)}</span>
                {memorial.yearsUsed && <span>{memorial.yearsUsed} years</span>}
              </div>
              {memorial.fondestMemory && (
                <p className="text-muted-foreground text-xs mt-1 italic">
                  Fondest memory: {memorial.fondestMemory}
                </p>
              )}
            </div>
          ))}
        </div>
      </PixelCard>
    </div>
  );
}

const DIFFICULTY_COLORS = {
  easy: "text-green-400 border-green-400",
  moderate: "text-yellow-400 border-yellow-400",
  hard: "text-orange-400 border-orange-400",
  nightmare: "text-red-400 border-red-400",
};

function MigrationGuideCard({ guide }: { guide: any }) {
  const upvoteGuide = useMutation(api.graveyard.upvoteMigrationGuide);
  const difficultyColor = DIFFICULTY_COLORS[guide.difficulty as keyof typeof DIFFICULTY_COLORS];

  return (
    <div className={cn("p-3 border", difficultyColor)}>
      <div className="flex items-center justify-between mb-2">
        <Link href={`/tools/${guide.toTool?.slug}`}>
          <span className="text-primary text-sm hover:underline flex items-center gap-1">
            <ArrowRight className="w-3 h-3" /> {guide.toTool?.name}
          </span>
        </Link>
        <PixelBadge variant="outline" className={cn("text-[6px]", difficultyColor)}>
          {guide.difficulty.toUpperCase()}
        </PixelBadge>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> ~{guide.estimatedHours}h
        </span>
        <button 
          onClick={() => upvoteGuide({ guideId: guide._id })}
          className="flex items-center gap-1 hover:text-primary"
        >
          <ThumbsUp className="w-3 h-3" /> {guide.upvotes}
        </button>
      </div>
    </div>
  );
}
