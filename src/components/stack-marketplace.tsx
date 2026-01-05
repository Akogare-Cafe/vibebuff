"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import {
  Store,
  Search,
  TrendingUp,
  Clock,
  Download,
  ArrowUp,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Eye,
  Filter,
  ChevronDown,
  X,
  Send,
  Trash2,
  Edit3,
  MoreVertical,
  Layers,
  Code,
  Globe,
  Server,
  Database,
  Cloud,
  Cpu,
  Wrench,
  Heart,
  Share2,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  ide: "#22c55e",
  ai: "#a855f7",
  frontend: "#ec4899",
  backend: "#f59e0b",
  database: "#6366f1",
  deployment: "#14b8a6",
  tool: "#7f13ec",
};

const categoryIcons: Record<string, React.ReactNode> = {
  ide: <Code className="w-3 h-3" />,
  ai: <Cpu className="w-3 h-3" />,
  frontend: <Globe className="w-3 h-3" />,
  backend: <Server className="w-3 h-3" />,
  database: <Database className="w-3 h-3" />,
  deployment: <Cloud className="w-3 h-3" />,
  tool: <Wrench className="w-3 h-3" />,
};

const projectTypeLabels: Record<string, string> = {
  "landing-page": "Landing Page",
  saas: "SaaS",
  "e-commerce": "E-Commerce",
  blog: "Blog",
  dashboard: "Dashboard",
  "mobile-app": "Mobile App",
  api: "API",
  other: "Other",
};

interface MarketplaceStack {
  _id: Id<"marketplaceStacks">;
  buildId: Id<"userStackBuilds">;
  userId: string;
  title: string;
  description?: string;
  tags: string[];
  projectType?: string;
  difficulty?: string;
  toolCount: number;
  upvotes: number;
  commentCount: number;
  importCount: number;
  views: number;
  isFeatured: boolean;
  publishedAt: number;
  nodes: Array<{
    id: string;
    data: { label: string; category: string };
  }>;
  edges: Array<{ id: string }>;
}

interface Comment {
  _id: Id<"marketplaceComments">;
  stackId: Id<"marketplaceStacks">;
  userId: string;
  content: string;
  parentId?: Id<"marketplaceComments">;
  upvotes: number;
  isEdited: boolean;
  createdAt: number;
}

function StackCard({
  stack,
  onView,
  onImport,
  onUpvote,
  onFavorite,
  hasUpvoted,
  hasFavorited,
  isOwner,
}: {
  stack: MarketplaceStack;
  onView: () => void;
  onImport: () => void;
  onUpvote: () => void;
  onFavorite: () => void;
  hasUpvoted: boolean;
  hasFavorited: boolean;
  isOwner: boolean;
}) {
  const uniqueCategories = useMemo(() => {
    const cats = new Set(stack.nodes.map((n) => n.data.category));
    return Array.from(cats).slice(0, 4);
  }, [stack.nodes]);

  return (
    <PixelCard className="hover:border-primary/50 transition-colors cursor-pointer" onClick={onView}>
      <PixelCardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-primary font-bold text-sm line-clamp-1">
                {stack.title}
              </h3>
              {stack.isFeatured && (
                <PixelBadge className="text-[6px] bg-yellow-500/20 text-yellow-400">
                  FEATURED
                </PixelBadge>
              )}
            </div>
            {stack.description && (
              <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                {stack.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {uniqueCategories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: `${categoryColors[cat] || "#7f13ec"}20`,
                color: categoryColors[cat] || "#7f13ec",
              }}
            >
              {categoryIcons[cat]}
              <span>{cat}</span>
            </div>
          ))}
          {stack.nodes.length > 4 && (
            <span className="text-muted-foreground text-[10px] px-1">
              +{stack.nodes.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          {stack.projectType && (
            <PixelBadge variant="outline" className="text-[8px]">
              {projectTypeLabels[stack.projectType] || stack.projectType}
            </PixelBadge>
          )}
          {stack.difficulty && (
            <PixelBadge
              variant="outline"
              className={cn(
                "text-[8px]",
                stack.difficulty === "beginner" && "text-green-400 border-green-400",
                stack.difficulty === "intermediate" && "text-yellow-400 border-yellow-400",
                stack.difficulty === "advanced" && "text-red-400 border-red-400"
              )}
            >
              {stack.difficulty.toUpperCase()}
            </PixelBadge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {stack.toolCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {stack.views}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {stack.importCount}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(stack.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <PixelButton
            size="sm"
            variant={hasUpvoted ? "default" : "outline"}
            onClick={onUpvote}
            className="flex-1"
          >
            <ArrowUp className={cn("w-3 h-3 mr-1", hasUpvoted && "text-primary-foreground")} />
            {stack.upvotes}
          </PixelButton>
          <PixelButton size="sm" variant="outline" onClick={onView}>
            <MessageSquare className="w-3 h-3 mr-1" />
            {stack.commentCount}
          </PixelButton>
          <PixelButton
            size="sm"
            variant={hasFavorited ? "default" : "outline"}
            onClick={onFavorite}
          >
            {hasFavorited ? (
              <BookmarkCheck className="w-3 h-3" />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
          </PixelButton>
          {!isOwner && (
            <PixelButton size="sm" variant="outline" onClick={onImport}>
              <Download className="w-3 h-3" />
            </PixelButton>
          )}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onUpvote,
  onDelete,
  onEdit,
}: {
  comment: Comment;
  currentUserId?: string;
  onUpvote: () => void;
  onDelete: () => void;
  onEdit: (content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = currentUserId === comment.userId;

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-[#261933] rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xs">
              {comment.userId.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-muted-foreground text-xs">
            {new Date(comment.createdAt).toLocaleDateString()}
            {comment.isEdited && " (edited)"}
          </span>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-muted-foreground hover:text-primary p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#191022] border border-border rounded-lg p-1 z-10 min-w-[100px]">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-primary flex items-center gap-2"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-red-400 hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 bg-[#191022] border border-border rounded-lg text-primary text-sm resize-none focus:border-primary outline-none"
            rows={3}
          />
          <div className="flex gap-2">
            <PixelButton size="sm" onClick={handleSaveEdit}>
              Save
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              Cancel
            </PixelButton>
          </div>
        </div>
      ) : (
        <p className="text-primary text-sm mb-2">{comment.content}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onUpvote}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary text-xs"
        >
          <ArrowUp className="w-3 h-3" />
          {comment.upvotes}
        </button>
      </div>
    </div>
  );
}

function StackDetailModal({
  stack,
  onClose,
  onImport,
}: {
  stack: MarketplaceStack;
  onClose: () => void;
  onImport: () => void;
}) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");

  const comments = useQuery(api.stackMarketplace.getComments, {
    stackId: stack._id,
  });
  const hasUpvoted = useQuery(
    api.stackMarketplace.hasUpvoted,
    user?.id ? { stackId: stack._id, userId: user.id } : "skip"
  );
  const hasFavorited = useQuery(
    api.stackMarketplace.hasFavorited,
    user?.id ? { stackId: stack._id, userId: user.id } : "skip"
  );

  const upvoteStack = useMutation(api.stackMarketplace.upvoteStack);
  const favoriteStack = useMutation(api.stackMarketplace.favoriteStack);
  const addComment = useMutation(api.stackMarketplace.addComment);
  const updateComment = useMutation(api.stackMarketplace.updateComment);
  const deleteComment = useMutation(api.stackMarketplace.deleteComment);
  const upvoteComment = useMutation(api.stackMarketplace.upvoteComment);
  const incrementViews = useMutation(api.stackMarketplace.incrementViews);

  useState(() => {
    incrementViews({ stackId: stack._id });
  });

  const handleUpvote = async () => {
    if (!user?.id) return;
    await upvoteStack({ stackId: stack._id, userId: user.id });
  };

  const handleFavorite = async () => {
    if (!user?.id) return;
    await favoriteStack({ stackId: stack._id, userId: user.id });
  };

  const handleAddComment = async () => {
    if (!user?.id || !newComment.trim()) return;
    await addComment({
      stackId: stack._id,
      userId: user.id,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const handleEditComment = async (commentId: Id<"marketplaceComments">, content: string) => {
    if (!user?.id) return;
    await updateComment({ commentId, userId: user.id, content });
  };

  const handleDeleteComment = async (commentId: Id<"marketplaceComments">) => {
    if (!user?.id) return;
    await deleteComment({ commentId, userId: user.id });
  };

  const handleUpvoteComment = async (commentId: Id<"marketplaceComments">) => {
    if (!user?.id) return;
    await upvoteComment({ commentId, userId: user.id });
  };

  const isOwner = user?.id === stack.userId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PixelCard className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <PixelCardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              {stack.title}
            </PixelCardTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </PixelCardHeader>

        <PixelCardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {stack.description && (
            <p className="text-muted-foreground text-sm">{stack.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {stack.projectType && (
              <PixelBadge variant="outline">
                {projectTypeLabels[stack.projectType] || stack.projectType}
              </PixelBadge>
            )}
            {stack.difficulty && (
              <PixelBadge
                variant="outline"
                className={cn(
                  stack.difficulty === "beginner" && "text-green-400 border-green-400",
                  stack.difficulty === "intermediate" && "text-yellow-400 border-yellow-400",
                  stack.difficulty === "advanced" && "text-red-400 border-red-400"
                )}
              >
                {stack.difficulty.toUpperCase()}
              </PixelBadge>
            )}
            {stack.tags.map((tag) => (
              <PixelBadge key={tag} variant="outline" className="text-xs">
                {tag}
              </PixelBadge>
            ))}
          </div>

          <div className="bg-[#191022] rounded-lg p-4">
            <h4 className="text-primary text-sm font-bold mb-3">Tools in this Stack</h4>
            <div className="flex flex-wrap gap-2">
              {stack.nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${categoryColors[node.data.category] || "#7f13ec"}20`,
                    color: categoryColors[node.data.category] || "#7f13ec",
                  }}
                >
                  {categoryIcons[node.data.category]}
                  <span>{node.data.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              {stack.upvotes} upvotes
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {stack.importCount} imports
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {stack.views} views
            </span>
          </div>

          <div className="flex gap-2">
            <PixelButton
              variant={hasUpvoted ? "default" : "outline"}
              onClick={handleUpvote}
              disabled={!user}
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              {hasUpvoted ? "Upvoted" : "Upvote"}
            </PixelButton>
            <PixelButton
              variant={hasFavorited ? "default" : "outline"}
              onClick={handleFavorite}
              disabled={!user}
            >
              {hasFavorited ? (
                <BookmarkCheck className="w-4 h-4 mr-1" />
              ) : (
                <Bookmark className="w-4 h-4 mr-1" />
              )}
              {hasFavorited ? "Saved" : "Save"}
            </PixelButton>
            {!isOwner && (
              <PixelButton onClick={onImport} disabled={!user}>
                <Download className="w-4 h-4 mr-1" />
                Import to My Stacks
              </PixelButton>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-primary text-sm font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments?.length || 0})
            </h4>

            {user && (
              <div className="flex gap-2 mb-4">
                <PixelInput
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <PixelButton onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4" />
                </PixelButton>
              </div>
            )}

            <div className="space-y-3">
              {comments?.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUserId={user?.id}
                  onUpvote={() => handleUpvoteComment(comment._id)}
                  onDelete={() => handleDeleteComment(comment._id)}
                  onEdit={(content) => handleEditComment(comment._id, content)}
                />
              ))}
              {(!comments || comments.length === 0) && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

type SortOption = "newest" | "popular" | "most_imported";
type TabType = "browse" | "favorites" | "my-published";

export function StackMarketplace() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStack, setSelectedStack] = useState<MarketplaceStack | null>(null);

  const marketplaceStacks = useQuery(api.stackMarketplace.listMarketplaceStacks, {
    sortBy,
    projectType: projectTypeFilter || undefined,
    difficulty: difficultyFilter || undefined,
    searchQuery: searchQuery || undefined,
    limit: 50,
  });

  const featuredStacks = useQuery(api.stackMarketplace.getFeaturedStacks, {
    limit: 3,
  });

  const userFavorites = useQuery(
    api.stackMarketplace.getUserFavorites,
    user?.id ? { userId: user.id } : "skip"
  );

  const userPublished = useQuery(
    api.stackMarketplace.getUserPublishedStacks,
    user?.id ? { userId: user.id } : "skip"
  );

  const upvoteStack = useMutation(api.stackMarketplace.upvoteStack);
  const favoriteStack = useMutation(api.stackMarketplace.favoriteStack);
  const importStack = useMutation(api.stackMarketplace.importStack);

  const handleUpvote = async (stackId: Id<"marketplaceStacks">) => {
    if (!user?.id) return;
    await upvoteStack({ stackId, userId: user.id });
  };

  const handleFavorite = async (stackId: Id<"marketplaceStacks">) => {
    if (!user?.id) return;
    await favoriteStack({ stackId, userId: user.id });
  };

  const handleImport = async (stackId: Id<"marketplaceStacks">) => {
    if (!user?.id) return;
    await importStack({ stackId, userId: user.id });
    setSelectedStack(null);
  };

  const displayStacks = useMemo((): MarketplaceStack[] => {
    if (activeTab === "favorites") {
      return (userFavorites || []).filter((s) => s !== null) as MarketplaceStack[];
    }
    if (activeTab === "my-published") return (userPublished || []) as MarketplaceStack[];
    return (marketplaceStacks || []) as MarketplaceStack[];
  }, [activeTab, marketplaceStacks, userFavorites, userPublished]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Store className="w-6 h-6" />
            Stack Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover, share, and import community tech stacks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PixelButton
            variant={activeTab === "browse" ? "default" : "outline"}
            onClick={() => setActiveTab("browse")}
          >
            <Store className="w-4 h-4 mr-1" />
            Browse
          </PixelButton>
          {user && (
            <>
              <PixelButton
                variant={activeTab === "favorites" ? "default" : "outline"}
                onClick={() => setActiveTab("favorites")}
              >
                <Bookmark className="w-4 h-4 mr-1" />
                Saved
                {userFavorites && userFavorites.length > 0 && (
                  <span className="ml-1 text-xs">({userFavorites.length})</span>
                )}
              </PixelButton>
              <PixelButton
                variant={activeTab === "my-published" ? "default" : "outline"}
                onClick={() => setActiveTab("my-published")}
              >
                <Share2 className="w-4 h-4 mr-1" />
                My Published
                {userPublished && userPublished.length > 0 && (
                  <span className="ml-1 text-xs">({userPublished.length})</span>
                )}
              </PixelButton>
            </>
          )}
        </div>
      </div>

      {activeTab === "browse" && featuredStacks && featuredStacks.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Featured Stacks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredStacks.map((stack) => (
              <StackCard
                key={stack._id}
                stack={stack as MarketplaceStack}
                onView={() => setSelectedStack(stack as MarketplaceStack)}
                onImport={() => handleImport(stack._id)}
                onUpvote={() => handleUpvote(stack._id)}
                onFavorite={() => handleFavorite(stack._id)}
                hasUpvoted={false}
                hasFavorited={false}
                isOwner={user?.id === stack.userId}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "browse" && (
        <PixelCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PixelInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stacks..."
                className="pl-10 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-[#261933] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="most_imported">Most Imported</option>
              </select>

              <PixelButton
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showFilters && "rotate-180")} />
              </PixelButton>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Project Type
                </label>
                <select
                  value={projectTypeFilter}
                  onChange={(e) => setProjectTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-[#261933] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
                >
                  <option value="">All Types</option>
                  <option value="landing-page">Landing Page</option>
                  <option value="saas">SaaS</option>
                  <option value="e-commerce">E-Commerce</option>
                  <option value="blog">Blog</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="api">API</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-2 bg-[#261933] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {(projectTypeFilter || difficultyFilter) && (
                <PixelButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProjectTypeFilter("");
                    setDifficultyFilter("");
                  }}
                  className="self-end"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </PixelButton>
              )}
            </div>
          )}
        </PixelCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayStacks.map((stack) => (
          <StackCard
            key={stack._id}
            stack={stack as MarketplaceStack}
            onView={() => setSelectedStack(stack as MarketplaceStack)}
            onImport={() => handleImport(stack._id)}
            onUpvote={() => handleUpvote(stack._id)}
            onFavorite={() => handleFavorite(stack._id)}
            hasUpvoted={false}
            hasFavorited={activeTab === "favorites"}
            isOwner={user?.id === stack.userId}
          />
        ))}
      </div>

      {displayStacks.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            {activeTab === "browse" && "No stacks found. Try adjusting your filters."}
            {activeTab === "favorites" && "You haven't saved any stacks yet."}
            {activeTab === "my-published" && "You haven't published any stacks yet."}
          </p>
        </div>
      )}

      {selectedStack && (
        <StackDetailModal
          stack={selectedStack}
          onClose={() => setSelectedStack(null)}
          onImport={() => handleImport(selectedStack._id)}
        />
      )}
    </div>
  );
}
