"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import {
  Play,
  Clock,
  Eye,
  Bookmark,
  BookmarkCheck,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

type VideoCategory = "setup" | "prompting" | "build-along" | "tips" | "deep-dive" | "mcp";
type Difficulty = "beginner" | "intermediate" | "advanced";

const categories: { value: VideoCategory | "all"; label: string }[] = [
  { value: "all", label: "All Videos" },
  { value: "setup", label: "Setup Guides" },
  { value: "prompting", label: "Prompting" },
  { value: "build-along", label: "Build Along" },
  { value: "tips", label: "Tips & Tricks" },
  { value: "deep-dive", label: "Deep Dives" },
  { value: "mcp", label: "MCP Tutorials" },
];

const difficulties: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

interface VideoCardProps {
  video: {
    _id: Id<"videoTutorials">;
    title: string;
    description: string;
    youtubeId: string;
    thumbnailUrl?: string;
    duration: number;
    difficulty: Difficulty;
    category: VideoCategory;
    authorName: string;
    views: number;
    isFeatured: boolean;
    tools?: { name: string }[];
  };
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onPlay?: () => void;
}

function VideoCard({ video, isBookmarked, onBookmark, onPlay }: VideoCardProps) {
  const thumbnailUrl = video.thumbnailUrl || 
    `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  return (
    <PixelCard 
      rarity={video.isFeatured ? "rare" : "common"}
      className="group cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onPlay}
            className="w-16 h-16 rounded-full bg-[#60a5fa] flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
          {formatDuration(video.duration)}
        </div>
        <div className="absolute top-2 left-2">
          <PixelBadge className={cn(
            video.difficulty === "beginner" && "bg-green-500/20 text-green-400",
            video.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-400",
            video.difficulty === "advanced" && "bg-red-500/20 text-red-400"
          )}>
            {video.difficulty}
          </PixelBadge>
        </div>
      </div>
      
      <PixelCardContent className="p-4">
        <h3 className="text-[#60a5fa] font-bold text-sm line-clamp-2 mb-2">
          {video.title}
        </h3>
        <p className="text-[#3b82f6] text-xs line-clamp-2 mb-3">
          {video.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-[#3b82f6]">
          <span>{video.authorName}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(video.views)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.();
              }}
              className="hover:text-[#60a5fa] transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-[#fbbf24]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {video.tools && video.tools.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {video.tools.slice(0, 3).map((tool, i) => (
              <PixelBadge key={i} className="text-[8px]">
                {tool.name}
              </PixelBadge>
            ))}
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  );
}

interface VideoPlayerModalProps {
  video: {
    youtubeId: string;
    title: string;
    description: string;
    authorName: string;
    authorChannel?: string;
  };
  onClose: () => void;
}

function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCard rarity="legendary">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-t-lg"
            />
          </div>
          <PixelCardContent className="p-4">
            <h3 className="text-[#60a5fa] font-bold text-lg mb-2">
              {video.title}
            </h3>
            <p className="text-[#3b82f6] text-sm mb-3">{video.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[#3b82f6] text-sm">
                By {video.authorName}
              </span>
              {video.authorChannel && (
                <a
                  href={video.authorChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#60a5fa] text-sm flex items-center gap-1 hover:underline"
                >
                  Visit Channel
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </PixelCardContent>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

export function VideoTutorialHub() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoCardProps["video"] | null>(null);

  const videos = useQuery(api.videoTutorials.list, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
  });

  const featuredVideos = useQuery(api.videoTutorials.getFeatured, { limit: 3 });
  
  const userProgress = useQuery(
    api.videoTutorials.getUserProgress,
    user?.id ? { userId: user.id } : "skip"
  );

  const toggleBookmark = useMutation(api.videoTutorials.toggleBookmark);
  const incrementViews = useMutation(api.videoTutorials.incrementViews);

  const handleBookmark = async (videoId: Id<"videoTutorials">) => {
    if (!user?.id) return;
    await toggleBookmark({ userId: user.id, videoId });
  };

  const handlePlay = async (video: VideoCardProps["video"]) => {
    await incrementViews({ videoId: video._id });
    setSelectedVideo(video);
  };

  const isBookmarked = (videoId: Id<"videoTutorials">) => {
    return userProgress?.some((p) => p.videoId === videoId && p.isBookmarked) ?? false;
  };

  const filteredVideos = videos?.filter((video) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.authorName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#60a5fa] flex items-center gap-2">
            <Play className="w-6 h-6" />
            Video Tutorial Hub
          </h1>
          <p className="text-[#3b82f6] text-sm mt-1">
            Learn vibe coding through curated video tutorials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b82f6]" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0d1f3c] border-2 border-[#1e3a5f] rounded-lg text-[#60a5fa] text-sm placeholder:text-[#3b82f6]/50 focus:border-[#60a5fa] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#3b82f6]" />
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
                selectedCategory === cat.value
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => setSelectedDifficulty(diff.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
                selectedDifficulty === diff.value
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
              )}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {featuredVideos && featuredVideos.length > 0 && selectedCategory === "all" && !searchQuery && (
        <section>
          <h2 className="text-lg font-bold text-[#60a5fa] mb-4 flex items-center gap-2">
            Featured Videos
            <ChevronRight className="w-4 h-4" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video as VideoCardProps["video"]}
                isBookmarked={isBookmarked(video._id)}
                onBookmark={() => handleBookmark(video._id)}
                onPlay={() => handlePlay(video as VideoCardProps["video"])}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-[#60a5fa] mb-4">
          {selectedCategory === "all" ? "All Videos" : categories.find((c) => c.value === selectedCategory)?.label}
          {filteredVideos && ` (${filteredVideos.length})`}
        </h2>
        
        {!filteredVideos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-[#1e3a5f] rounded-lg mb-2" />
                <div className="h-4 bg-[#1e3a5f] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#1e3a5f] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <PixelCard>
            <PixelCardContent className="text-center py-12">
              <Play className="w-12 h-12 text-[#3b82f6] mx-auto mb-4" />
              <p className="text-[#60a5fa] font-bold">No videos found</p>
              <p className="text-[#3b82f6] text-sm">
                Try adjusting your filters or search query
              </p>
            </PixelCardContent>
          </PixelCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video as VideoCardProps["video"]}
                isBookmarked={isBookmarked(video._id)}
                onBookmark={() => handleBookmark(video._id)}
                onPlay={() => handlePlay(video as VideoCardProps["video"])}
              />
            ))}
          </div>
        )}
      </section>

      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
