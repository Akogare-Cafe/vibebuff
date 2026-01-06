"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  MessageSquare, 
  Clock, 
  Eye,
  Pin,
  Lock,
  ChevronLeft,
  ThumbsUp,
  Send,
  User,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";

function formatTimeAgo(timestamp: number | undefined): string {
  if (!timestamp) return "Unknown";
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

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ThreadPage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const slug = params.slug as string;
  
  const thread = useQuery(api.forum.getThreadBySlug, { slug });
  const posts = useQuery(
    api.forum.getPostsByThread,
    thread ? { threadId: thread._id } : "skip"
  );
  const userVotes = useQuery(
    api.forum.getUserVotes,
    posts ? { postIds: posts.map((p: Doc<"forumPosts">) => p._id) } : "skip"
  );
  
  const createPost = useMutation(api.forum.createPost);
  const upvotePost = useMutation(api.forum.upvotePost);
  const incrementView = useMutation(api.forum.incrementViewCount);

  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (thread) {
      incrementView({ threadId: thread._id });
    }
  }, [thread?._id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thread || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        threadId: thread._id,
        content: replyContent.trim(),
      });
      setReplyContent("");
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (postId: Id<"forumPosts">) => {
    try {
      await upvotePost({ postId });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  if (thread === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-48 bg-card rounded-lg animate-pulse mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (thread === null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Thread Not Found</h1>
          <p className="text-muted-foreground mb-4">This thread does not exist or has been removed.</p>
          <Link href="/forum">
            <PixelButton>Back to Forum</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  const votedPostIds = new Set(userVotes ?? []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={thread.category ? `/forum/${thread.category.slug}` : "/forum"}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {thread.category?.name ?? "Forum"}
          </Link>
        </div>

        <PixelCard className="mb-6">
          <PixelCardHeader>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {thread.isPinned && (
                    <PixelBadge variant="outline" className="text-xs">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </PixelBadge>
                  )}
                  {thread.isLocked && (
                    <PixelBadge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </PixelBadge>
                  )}
                  {thread.category && (
                    <PixelBadge variant="secondary" className="text-xs">
                      {thread.category.name}
                    </PixelBadge>
                  )}
                </div>
                <PixelCardTitle className="text-xl">{thread.title}</PixelCardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(thread.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {thread.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {thread.replyCount} replies
                  </span>
                </div>
              </div>
            </div>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="flex gap-4">
              <div className="hidden sm:flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-foreground whitespace-pre-wrap">{thread.content}</p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        {posts && posts.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Replies ({posts.length})
            </h2>
            {posts.map((post: Doc<"forumPosts">) => (
              <PixelCard key={post._id}>
                <PixelCardContent>
                  <div className="flex gap-4">
                    <div className="hidden sm:flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <button
                        onClick={() => handleUpvote(post._id)}
                        disabled={!user}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                          votedPostIds.has(post._id)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        } ${!user ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-medium">{post.upvotes}</span>
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                          {post.isEdited && " (edited)"}
                        </span>
                        <button
                          onClick={() => handleUpvote(post._id)}
                          disabled={!user}
                          className={`sm:hidden flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            votedPostIds.has(post._id)
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">{post.upvotes}</span>
                        </button>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>
                </PixelCardContent>
              </PixelCard>
            ))}
          </div>
        )}

        {thread.isLocked ? (
          <PixelCard>
            <PixelCardContent className="text-center py-6">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">This thread is locked. No new replies can be added.</p>
            </PixelCardContent>
          </PixelCard>
        ) : isLoaded && user ? (
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle>Reply to this thread</PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <form onSubmit={handleReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
                  required
                />
                <div className="flex justify-end">
                  <PixelButton type="submit" disabled={isSubmitting || !replyContent.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post Reply"}
                  </PixelButton>
                </div>
              </form>
            </PixelCardContent>
          </PixelCard>
        ) : (
          <PixelCard>
            <PixelCardContent className="text-center py-6">
              <p className="text-muted-foreground mb-4">Sign in to reply to this thread</p>
              <Link href="/sign-in">
                <PixelButton>Sign In</PixelButton>
              </Link>
            </PixelCardContent>
          </PixelCard>
        )}
      </div>
    </div>
  );
}
