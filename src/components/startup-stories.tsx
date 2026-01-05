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
  Building2, 
  Users,
  Calendar,
  DollarSign,
  ThumbsUp,
  Eye,
  Quote,
  ArrowRight,
  CheckCircle,
  Layers
} from "lucide-react";

interface StartupStoriesProps {
  className?: string;
}

const STAGE_CONFIG = {
  idea: { color: "text-gray-400 border-gray-400", label: "IDEA" },
  mvp: { color: "text-green-400 border-green-400", label: "MVP" },
  seed: { color: "text-blue-400 border-blue-400", label: "SEED" },
  series_a: { color: "text-purple-400 border-purple-400", label: "SERIES A" },
  series_b_plus: { color: "text-orange-400 border-orange-400", label: "SERIES B+" },
  public: { color: "text-yellow-400 border-yellow-400", label: "PUBLIC" },
};

export function StartupStories({ className }: StartupStoriesProps) {
  const [filter, setFilter] = useState<string | null>(null);
  
  const stories = useQuery(api.startupStories.getStories, { limit: 20 });
  const topStories = useQuery(api.startupStories.getTopStories, { limit: 5 });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" /> STARTUP STACK STORIES
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <PixelButton
          size="sm"
          variant={filter === null ? "default" : "ghost"}
          onClick={() => setFilter(null)}
        >
          ALL
        </PixelButton>
        {Object.entries(STAGE_CONFIG).map(([stage, config]) => (
          <PixelButton
            key={stage}
            size="sm"
            variant={filter === stage ? "default" : "ghost"}
            onClick={() => setFilter(stage)}
          >
            {config.label}
          </PixelButton>
        ))}
      </div>

      {topStories && topStories.length > 0 && !filter && (
        <div>
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" /> TOP STORIES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topStories.slice(0, 3).map((story: any) => (
              <StoryCard key={story._id} story={story} featured />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories
          ?.filter((s: any) => !filter || s.stage === filter)
          .map((story: any) => (
            <StoryCard key={story._id} story={story} />
          ))}
      </div>
    </div>
  );
}

function StoryCard({ story, featured }: { story: any; featured?: boolean }) {
  const upvoteStory = useMutation(api.startupStories.upvoteStory);
  const config = STAGE_CONFIG[story.stage as keyof typeof STAGE_CONFIG];

  return (
    <PixelCard className={cn("p-4", featured && "border-yellow-400", config?.color)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-primary text-base">{story.companyName}</h3>
            {story.isVerified && <CheckCircle className="w-3 h-3 text-green-400" />}
          </div>
          <p className="text-muted-foreground text-xs">{story.industry}</p>
        </div>
        <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
          {config?.label}
        </PixelBadge>
      </div>

      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{story.description}</p>

      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {story.foundedYear}
        </span>
        {story.teamSize && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {story.teamSize}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" /> {story.stackEvolution.length} phases
        </span>
      </div>

      {story.costBreakdown && (
        <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
          <DollarSign className="w-3 h-3" /> ${story.costBreakdown.monthly}/mo
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button 
            onClick={() => upvoteStory({ storyId: story._id })}
            className="flex items-center gap-1 hover:text-primary"
          >
            <ThumbsUp className="w-3 h-3" /> {story.upvotes}
          </button>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {story.views}
          </span>
        </div>
        <Link href={`/stories/${story.slug}`}>
          <PixelButton size="sm">
            READ <ArrowRight className="w-3 h-3 ml-1" />
          </PixelButton>
        </Link>
      </div>
    </PixelCard>
  );
}

interface StoryDetailProps {
  storySlug: string;
}

export function StoryDetail({ storySlug }: StoryDetailProps) {
  const story = useQuery(api.startupStories.getStory, { slug: storySlug });
  const recordView = useMutation(api.startupStories.recordView);

  if (!story) {
    return (
      <PixelCard className="p-8 text-center">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">LOADING STORY...</p>
      </PixelCard>
    );
  }

  const config = STAGE_CONFIG[story.stage as keyof typeof STAGE_CONFIG];

  return (
    <div className="space-y-6">
      <PixelCard className={cn("p-6", config?.color)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-muted-foreground" />
              <div>
                <h1 className="text-primary text-xl">{story.companyName}</h1>
                <p className="text-muted-foreground text-sm">{story.industry}</p>
              </div>
              {story.isVerified && (
                <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" /> VERIFIED
                </PixelBadge>
              )}
            </div>
          </div>
          <PixelBadge variant="outline" className={cn("text-xs", config?.color)}>
            {config?.label}
          </PixelBadge>
        </div>

        <p className="text-muted-foreground text-base mb-4">{story.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Founded {story.foundedYear}
          </span>
          {story.teamSize && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {story.teamSize} people
            </span>
          )}
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" /> {story.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {story.views}
          </span>
        </div>
      </PixelCard>

      <div>
        <h2 className="text-primary text-base uppercase mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" /> STACK EVOLUTION
        </h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-card" />
          <div className="space-y-6">
            {story.stackEvolution.map((phase: any, index: number) => (
              <div key={index} className="flex items-start gap-4 pl-8 relative">
                <div className="absolute left-2 w-4 h-4 rounded-full bg-primary border-2 border-[#0a0f1a]" />
                <PixelCard className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-primary text-base">{phase.phase}</h3>
                    <PixelBadge variant="outline" className="text-[6px]">
                      {phase.year}
                    </PixelBadge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{phase.reasoning}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {phase.tools?.map((tool: any) => (
                      <Link key={tool._id} href={`/tools/${tool.slug}`}>
                        <PixelBadge variant="outline" className="text-xs hover:border-primary">
                          {tool.name}
                        </PixelBadge>
                      </Link>
                    ))}
                  </div>
                  {phase.lessonsLearned && (
                    <p className="text-muted-foreground text-xs italic">
                      Lesson: {phase.lessonsLearned}
                    </p>
                  )}
                </PixelCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {story.costBreakdown && (
        <PixelCard className="p-4">
          <h2 className="text-primary text-base uppercase mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> COST BREAKDOWN
          </h2>
          <p className="text-primary text-2xl mb-4">${story.costBreakdown.monthly}/month</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {story.costBreakdown.breakdown.map((item: any, i: number) => (
              <div key={i} className="text-center p-2 border border-border">
                <p className="text-primary text-lg">${item.amount}</p>
                <p className="text-muted-foreground text-xs">{item.category}</p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {story.founderQuotes && story.founderQuotes.length > 0 && (
        <PixelCard className="p-4">
          <h2 className="text-primary text-base uppercase mb-4 flex items-center gap-2">
            <Quote className="w-4 h-4" /> FOUNDER INSIGHTS
          </h2>
          <div className="space-y-4">
            {story.founderQuotes.map((quote: any, i: number) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <p className="text-primary text-base italic mb-2">"{quote.quote}"</p>
                <p className="text-muted-foreground text-sm">
                  - {quote.author}, {quote.role}
                </p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
