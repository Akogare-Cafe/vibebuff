"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  MessageSquare, 
  Clock, 
  Eye,
  Pin,
  Lock,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";

function formatTimeAgo(timestamp: number | undefined): string {
  if (!timestamp) return "No activity";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const categorySlug = params.categorySlug as string;
  
  const category = useQuery(api.forum.getCategoryBySlug, { slug: categorySlug });
  const threads = useQuery(
    api.forum.getThreadsByCategory,
    category ? { categoryId: category._id } : "skip"
  );
  const createThread = useMutation(api.forum.createThread);

  const [showNewThread, setShowNewThread] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createThread({
        categoryId: category._id,
        title: title.trim(),
        content: content.trim(),
      });
      router.push(`/forum/thread/${result.slug}`);
    } catch (error) {
      console.error("Failed to create thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (category === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (category === null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-4">This category does not exist.</p>
          <Link href="/forum">
            <PixelButton>Back to Forum</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/forum" 
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Forum
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            {isLoaded && user && (
              <PixelButton onClick={() => setShowNewThread(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </PixelButton>
            )}
          </div>
        </div>

        {showNewThread && (
          <PixelCard className="mb-6">
            <PixelCardHeader className="flex flex-row items-center justify-between">
              <PixelCardTitle>Create New Thread</PixelCardTitle>
              <button 
                onClick={() => setShowNewThread(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </PixelCardHeader>
            <PixelCardContent>
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your topic about?"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or ideas..."
                    rows={6}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <PixelButton 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowNewThread(false)}
                  >
                    Cancel
                  </PixelButton>
                  <PixelButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Thread"}
                  </PixelButton>
                </div>
              </form>
            </PixelCardContent>
          </PixelCard>
        )}

        <div className="space-y-3">
          {threads === undefined ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-card rounded-lg animate-pulse" />
            ))
          ) : threads.length === 0 ? (
            <PixelCard>
              <PixelCardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No threads yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                {isLoaded && user && (
                  <PixelButton onClick={() => setShowNewThread(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Thread
                  </PixelButton>
                )}
              </PixelCardContent>
            </PixelCard>
          ) : (
            threads.map((thread) => (
              <Link key={thread._id} href={`/forum/thread/${thread.slug}`}>
                <PixelCard className="hover:border-primary/50 transition-colors cursor-pointer">
                  <PixelCardContent className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.isPinned && (
                          <Pin className="w-4 h-4 text-primary" />
                        )}
                        {thread.isLocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(thread.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {thread.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {thread.replyCount}
                        </span>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
