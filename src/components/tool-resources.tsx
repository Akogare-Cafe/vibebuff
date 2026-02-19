"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  BookOpen,
  FileText,
  Lightbulb,
  ExternalLink,
  RefreshCw,
  Eye,
  Clock,
  Video,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolResourcesProps {
  toolId: Id<"tools">;
  toolName: string;
  className?: string;
}

const resourceTypeConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  youtube: { icon: Play, label: "VIDEO", color: "text-red-400", bgColor: "bg-red-500/10" },
  documentation: { icon: BookOpen, label: "DOCS", color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  howto: { icon: Lightbulb, label: "HOW-TO", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  article: { icon: FileText, label: "ARTICLE", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  tutorial: { icon: GraduationCap, label: "TUTORIAL", color: "text-purple-400", bgColor: "bg-purple-500/10" },
};

function formatViewCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function ToolResources({ toolId, toolName, className }: ToolResourcesProps) {
  const resources = useQuery(api.toolResourcesInternal.getResourcesForTool, { toolId });
  const fetchStatus = useQuery(api.toolResourcesInternal.getResourceFetchStatus, { toolId });
  const fetchResources = useAction(api.toolResources.fetchToolResources);
  const [isFetching, setIsFetching] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    if (resources === undefined || fetchStatus === undefined) return;

    const shouldAutoFetch =
      !fetchStatus ||
      Date.now() - fetchStatus.lastFetchedAt > 7 * 24 * 60 * 60 * 1000;

    if (shouldAutoFetch && !isFetching) {
      hasFetchedRef.current = true;
      setIsFetching(true);
      fetchResources({ toolId })
        .catch((err) => console.error("Auto-fetch resources failed:", err))
        .finally(() => setIsFetching(false));
    }
  }, [resources, fetchStatus, toolId, fetchResources, isFetching]);

  const handleManualFetch = async () => {
    setIsFetching(true);
    try {
      await fetchResources({ toolId });
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setIsFetching(false);
    }
  };

  if (resources === undefined) {
    return null;
  }

  if (resources.length === 0 && !isFetching) {
    return null;
  }

  const youtubeVideos = resources.filter((r) => r.resourceType === "youtube");
  const articles = resources.filter((r) => r.resourceType !== "youtube");

  const displayedVideos = showAll ? youtubeVideos : youtubeVideos.slice(0, 4);
  const displayedArticles = showAll ? articles : articles.slice(0, 4);
  const totalHidden =
    youtubeVideos.length - displayedVideos.length + articles.length - displayedArticles.length;

  return (
    <div className={cn("space-y-6", className)}>
      {(youtubeVideos.length > 0 || isFetching) && (
        <PixelCard>
          <PixelCardHeader>
            <div className="flex items-center justify-between">
              <PixelCardTitle className="flex items-center gap-2">
                <Video className="w-4 h-4" /> VIDEOS & TUTORIALS
              </PixelCardTitle>
              <PixelButton
                onClick={handleManualFetch}
                disabled={isFetching}
                size="sm"
                variant="ghost"
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", isFetching && "animate-spin")} />
                {isFetching ? "FETCHING..." : "REFRESH"}
              </PixelButton>
            </div>
          </PixelCardHeader>
          <PixelCardContent>
            {isFetching && youtubeVideos.length === 0 ? (
              <div className="text-center py-6">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Fetching videos about {toolName}...
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {displayedVideos.map((video) => (
                  <a
                    key={video._id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border-2 border-border hover:border-red-500/50 transition-colors overflow-hidden"
                  >
                    {video.thumbnailUrl && (
                      <div className="relative aspect-video bg-[#0a0f1a] overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-red-600/90 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          </div>
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5">
                            <span className="text-white text-[10px] font-mono">
                              {video.duration}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-primary text-sm font-medium line-clamp-2 group-hover:underline mb-1">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
                        {video.channelName && <span>{video.channelName}</span>}
                        {video.viewCount && (
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {formatViewCount(video.viewCount)}
                          </span>
                        )}
                        {video.publishedAt && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {timeAgo(video.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      )}

      {articles.length > 0 && (
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> ARTICLES & HOW-TOS
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="space-y-2">
              {displayedArticles.map((article) => {
                const config =
                  resourceTypeConfig[article.resourceType] || resourceTypeConfig.article;
                const IconComponent = config.icon;

                return (
                  <a
                    key={article._id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 border-2 border-border hover:border-primary transition-colors group"
                  >
                    <div
                      className={cn(
                        "p-2 border border-border group-hover:border-primary shrink-0",
                        config.bgColor
                      )}
                    >
                      <IconComponent className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PixelBadge
                          variant="outline"
                          className={cn("text-[10px]", config.color, "border-current")}
                        >
                          {config.label}
                        </PixelBadge>
                        {article.source && (
                          <span className="text-muted-foreground text-[10px]">
                            {article.source}
                          </span>
                        )}
                        {article.publishedAt && (
                          <span className="text-muted-foreground text-[10px]">
                            {timeAgo(article.publishedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-primary text-sm font-medium line-clamp-2 group-hover:underline">
                        {article.title}
                      </p>
                      {article.description && (
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                          {article.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                  </a>
                );
              })}
            </div>
          </PixelCardContent>
        </PixelCard>
      )}

      {totalHidden > 0 && (
        <div className="flex justify-center">
          <PixelButton
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" /> SHOW LESS
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" /> SHOW {totalHidden} MORE RESOURCES
              </>
            )}
          </PixelButton>
        </div>
      )}

      {fetchStatus && (
        <div className="flex items-center justify-center text-[10px] text-muted-foreground gap-1">
          <Clock className="w-3 h-3" />
          <span>
            Resources last updated: {timeAgo(new Date(fetchStatus.lastFetchedAt).toISOString())}
          </span>
        </div>
      )}
    </div>
  );
}
