"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
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
  Plus,
  X,
  Search,
  Github,
  Globe,
  Package,
  Layers,
  ArrowUp,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Send,
  Trash2,
  Edit3,
  ExternalLink,
  Star,
  GitFork,
  Code,
  Tag,
} from "lucide-react";

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

const difficultyColors: Record<string, string> = {
  beginner: "text-green-400 border-green-400",
  intermediate: "text-yellow-400 border-yellow-400",
  advanced: "text-red-400 border-red-400",
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "text-yellow-400", icon: <Clock className="w-3 h-3" />, label: "Pending Review" },
  under_review: { color: "text-blue-400", icon: <AlertCircle className="w-3 h-3" />, label: "Under Review" },
  approved: { color: "text-green-400", icon: <CheckCircle className="w-3 h-3" />, label: "Approved" },
  rejected: { color: "text-red-400", icon: <XCircle className="w-3 h-3" />, label: "Rejected" },
  published: { color: "text-primary", icon: <CheckCircle className="w-3 h-3" />, label: "Published" },
};

interface ToolInStack {
  toolId?: Id<"tools">;
  customToolId?: Id<"communityToolSuggestions">;
  category: string;
  notes?: string;
  tool?: {
    _id: Id<"tools">;
    name: string;
    tagline: string;
    logoUrl?: string;
  } | null;
  customTool?: {
    _id: Id<"communityToolSuggestions">;
    name: string;
    description: string;
    githubUrl?: string;
    fetchedData?: {
      stars?: number;
      description?: string;
    };
  } | null;
}

interface StackSubmission {
  _id: Id<"communityStackSubmissions">;
  userId: string;
  title: string;
  description: string;
  projectType: string;
  difficulty: string;
  tools: ToolInStack[];
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: string;
  upvotes: number;
  views: number;
  createdAt: number;
}

function SubmissionCard({
  submission,
  onView,
  onUpvote,
  hasUpvoted,
  isOwner,
}: {
  submission: StackSubmission;
  onView: () => void;
  onUpvote: () => void;
  hasUpvoted: boolean;
  isOwner: boolean;
}) {
  const status = statusConfig[submission.status] || statusConfig.pending;

  return (
    <PixelCard className="hover:border-primary/50 transition-colors cursor-pointer" onClick={onView}>
      <PixelCardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-primary font-bold text-sm line-clamp-1">
                {submission.title}
              </h3>
              <PixelBadge className={cn("text-[6px]", status.color)}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </PixelBadge>
            </div>
            <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
              {submission.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <PixelBadge variant="outline" className="text-[8px]">
            {projectTypeLabels[submission.projectType] || submission.projectType}
          </PixelBadge>
          <PixelBadge
            variant="outline"
            className={cn("text-[8px]", difficultyColors[submission.difficulty])}
          >
            {submission.difficulty.toUpperCase()}
          </PixelBadge>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {submission.tools.slice(0, 4).map((tool, idx) => (
            <PixelBadge key={idx} variant="outline" className="text-[8px]">
              <Package className="w-2 h-2 mr-1" />
              {tool.tool?.name || tool.customTool?.name || "Custom Tool"}
            </PixelBadge>
          ))}
          {submission.tools.length > 4 && (
            <span className="text-muted-foreground text-[10px] px-1">
              +{submission.tools.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {submission.tools.length} tools
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {submission.views}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(submission.createdAt).toLocaleDateString()}
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
            {submission.upvotes}
          </PixelButton>
          <PixelButton size="sm" variant="outline" onClick={onView}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </PixelButton>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function AddToolModal({
  onClose,
  onAddExisting,
  onAddCustom,
}: {
  onClose: () => void;
  onAddExisting: (toolId: Id<"tools">, category: string) => void;
  onAddCustom: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const searchResults = useQuery(
    api.communityStacks.searchExistingTools,
    searchQuery.length > 1 ? { query: searchQuery, limit: 10 } : "skip"
  );
  const categories = useQuery(api.communityStacks.getCategories);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PixelCard className="max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <PixelCardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Add Tool to Stack
            </PixelCardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </PixelCardHeader>

        <PixelCardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Search Existing Tools</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PixelInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Select a tool:</label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {searchResults.map((tool) => (
                  <div
                    key={tool._id}
                    className="flex items-center justify-between p-2 bg-[#111827] rounded-lg hover:bg-[#1f2937] cursor-pointer"
                    onClick={() => {
                      if (selectedCategory) {
                        onAddExisting(tool._id, selectedCategory);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 rounded" />
                      ) : (
                        <Package className="w-6 h-6 text-primary" />
                      )}
                      <div>
                        <p className="text-primary text-sm font-medium">{tool.name}</p>
                        <p className="text-muted-foreground text-xs line-clamp-1">{tool.tagline}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
            >
              <option value="">Select category...</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-muted-foreground text-xs mb-3">
              Can&apos;t find the tool you&apos;re looking for?
            </p>
            <PixelButton variant="outline" onClick={onAddCustom} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Suggest a New Tool
            </PixelButton>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

function CreateToolModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (toolId: Id<"communityToolSuggestions">, category: string) => void;
}) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [category, setCategory] = useState("");
  const [pricingModel, setPricingModel] = useState<string>("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<{
    stars?: number;
    forks?: number;
    description?: string;
    language?: string;
    topics?: string[];
  } | null>(null);

  const categories = useQuery(api.communityStacks.getCategories);
  const createToolSuggestion = useMutation(api.communityStacks.createToolSuggestion);
  const fetchGithubData = useAction(api.communityStacks.fetchGithubData);

  const handleFetchGithub = async () => {
    if (!githubUrl) return;
    setIsFetching(true);
    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error("Invalid GitHub URL");
      }
      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, "").split("/")[0].split("?")[0].split("#")[0];

      const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "VibeBuff-App",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setFetchedData({
        stars: data.stargazers_count,
        forks: data.forks_count,
        description: data.description,
        language: data.language,
        topics: data.topics,
      });

      if (!description && data.description) {
        setDescription(data.description);
      }
      if (!name && data.name) {
        setName(data.name.charAt(0).toUpperCase() + data.name.slice(1));
      }
      if (data.topics && data.topics.length > 0 && !tags) {
        setTags(data.topics.slice(0, 5).join(", "));
      }
    } catch {
      setFetchedData(null);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !name || !description || !category) return;
    setIsSubmitting(true);

    try {
      const toolId = await createToolSuggestion({
        userId: user.id,
        name,
        description,
        websiteUrl: websiteUrl || undefined,
        githubUrl: githubUrl || undefined,
        category,
        pricingModel: pricingModel as "free" | "freemium" | "paid" | "open_source" | "enterprise" | undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      if (githubUrl) {
        fetchGithubData({ suggestionId: toolId, githubUrl });
      }

      onCreated(toolId, category);
    } catch (error) {
      console.error("Failed to create tool suggestion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PixelCard className="max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <PixelCardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Suggest New Tool
            </PixelCardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </PixelCardHeader>

        <PixelCardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">GitHub URL (optional)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <PixelInput
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="pl-10 w-full"
                />
              </div>
              <PixelButton
                variant="outline"
                onClick={handleFetchGithub}
                disabled={!githubUrl || isFetching}
              >
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
              </PixelButton>
            </div>
            <p className="text-muted-foreground text-[10px] mt-1">
              Enter a GitHub URL to auto-fill tool details
            </p>
          </div>

          {fetchedData && (
            <div className="bg-[#111827] rounded-lg p-3 space-y-2">
              <p className="text-primary text-xs font-medium">Fetched from GitHub:</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" /> {fetchedData.stars?.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" /> {fetchedData.forks?.toLocaleString()}
                </span>
                {fetchedData.language && (
                  <span className="flex items-center gap-1">
                    <Code className="w-3 h-3" /> {fetchedData.language}
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tool Name *</label>
            <PixelInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., React, Next.js, Tailwind CSS"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this tool does..."
              className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm resize-none focus:border-primary outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
            >
              <option value="">Select category...</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Website URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PixelInput
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pricing Model</label>
            <select
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value)}
              className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
            >
              <option value="">Select pricing...</option>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
              <option value="open_source">Open Source</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tags (comma separated)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PixelInput
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, frontend, ui"
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <PixelButton variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </PixelButton>
            <PixelButton
              onClick={handleSubmit}
              disabled={!name || !description || !category || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Tool
            </PixelButton>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

function SubmissionForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [tools, setTools] = useState<Array<{
    toolId?: Id<"tools">;
    customToolId?: Id<"communityToolSuggestions">;
    category: string;
    notes?: string;
    name?: string;
  }>>([]);
  const [tags, setTags] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showCreateTool, setShowCreateTool] = useState(false);

  const createSubmission = useMutation(api.communityStacks.createSubmission);

  const handleAddExistingTool = (toolId: Id<"tools">, category: string) => {
    setTools([...tools, { toolId, category }]);
    setShowAddTool(false);
  };

  const handleAddCustomTool = (toolId: Id<"communityToolSuggestions">, category: string) => {
    setTools([...tools, { customToolId: toolId, category }]);
    setShowCreateTool(false);
    setShowAddTool(false);
  };

  const handleRemoveTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user?.id || !title || !description || !projectType || !difficulty || tools.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubmission({
        userId: user.id,
        title,
        description,
        projectType: projectType as "landing-page" | "saas" | "e-commerce" | "blog" | "dashboard" | "mobile-app" | "api" | "other",
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        tools: tools.map((t) => ({
          toolId: t.toolId,
          customToolId: t.customToolId,
          category: t.category,
          notes: t.notes,
        })),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        githubUrl: githubUrl || undefined,
        liveUrl: liveUrl || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to submit stack:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PixelCard className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <PixelCardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Submit Your Stack
            </PixelCardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </PixelCardHeader>

        <PixelCardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Stack Title *</label>
            <PixelInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Modern SaaS Starter Stack"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your stack, what it's good for, and why you chose these tools..."
              className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm resize-none focus:border-primary outline-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Project Type *</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
              >
                <option value="">Select type...</option>
                {Object.entries(projectTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
              >
                <option value="">Select difficulty...</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Tools in Stack *</label>
              <PixelButton size="sm" variant="outline" onClick={() => setShowAddTool(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Add Tool
              </PixelButton>
            </div>

            {tools.length === 0 ? (
              <div className="bg-[#111827] rounded-lg p-4 text-center">
                <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-xs">
                  No tools added yet. Click &quot;Add Tool&quot; to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tools.map((tool, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#111827] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-primary text-sm">
                          {tool.name || (tool.toolId ? "Existing Tool" : "Custom Tool")}
                        </p>
                        <p className="text-muted-foreground text-xs">{tool.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTool(index)}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tags (comma separated)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PixelInput
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, typescript, tailwind"
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">GitHub URL (optional)</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <PixelInput
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Live URL (optional)</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <PixelInput
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <PixelButton variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </PixelButton>
            <PixelButton
              onClick={handleSubmit}
              disabled={!title || !description || !projectType || !difficulty || tools.length === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Stack
            </PixelButton>
          </div>
        </PixelCardContent>
      </PixelCard>

      {showAddTool && (
        <AddToolModal
          onClose={() => setShowAddTool(false)}
          onAddExisting={handleAddExistingTool}
          onAddCustom={() => {
            setShowAddTool(false);
            setShowCreateTool(true);
          }}
        />
      )}

      {showCreateTool && (
        <CreateToolModal
          onClose={() => setShowCreateTool(false)}
          onCreated={handleAddCustomTool}
        />
      )}
    </div>
  );
}

type TabType = "browse" | "my-submissions";

export function CommunityStackSubmission() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("browse");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<StackSubmission | null>(null);

  const submissions = useQuery(api.communityStacks.listSubmissions, {
    status: "pending",
    sortBy: "popular",
    limit: 20,
  });

  const userSubmissions = useQuery(
    api.communityStacks.getUserSubmissions,
    user?.id ? { userId: user.id } : "skip"
  );

  const upvoteSubmission = useMutation(api.communityStacks.upvoteSubmission);

  const handleUpvote = async (submissionId: Id<"communityStackSubmissions">) => {
    if (!user?.id) return;
    await upvoteSubmission({ submissionId, userId: user.id });
  };

  const displaySubmissions = useMemo(() => {
    if (activeTab === "my-submissions") {
      return (userSubmissions || []) as StackSubmission[];
    }
    return (submissions || []) as StackSubmission[];
  }, [activeTab, submissions, userSubmissions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Share Your Stack
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Submit your tech stack to share with the community
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PixelButton
            variant={activeTab === "browse" ? "default" : "outline"}
            onClick={() => setActiveTab("browse")}
          >
            <Layers className="w-4 h-4 mr-1" />
            Browse
          </PixelButton>
          {user && (
            <PixelButton
              variant={activeTab === "my-submissions" ? "default" : "outline"}
              onClick={() => setActiveTab("my-submissions")}
            >
              <Package className="w-4 h-4 mr-1" />
              My Submissions
              {userSubmissions && userSubmissions.length > 0 && (
                <span className="ml-1 text-xs">({userSubmissions.length})</span>
              )}
            </PixelButton>
          )}
          {user && (
            <PixelButton onClick={() => setShowSubmitForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Submit Stack
            </PixelButton>
          )}
        </div>
      </div>

      {!user && (
        <PixelCard className="p-6 text-center">
          <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm mb-4">
            Sign in to submit your stack and share it with the community
          </p>
        </PixelCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displaySubmissions.map((submission) => (
          <SubmissionCard
            key={submission._id}
            submission={submission}
            onView={() => setSelectedSubmission(submission)}
            onUpvote={() => handleUpvote(submission._id)}
            hasUpvoted={false}
            isOwner={user?.id === submission.userId}
          />
        ))}
      </div>

      {displaySubmissions.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            {activeTab === "browse" && "No stack submissions yet. Be the first to share your stack!"}
            {activeTab === "my-submissions" && "You haven't submitted any stacks yet."}
          </p>
          {user && activeTab === "my-submissions" && (
            <PixelButton className="mt-4" onClick={() => setShowSubmitForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Stack
            </PixelButton>
          )}
        </div>
      )}

      {showSubmitForm && (
        <SubmissionForm
          onClose={() => setShowSubmitForm(false)}
          onSuccess={() => {
            setShowSubmitForm(false);
            setActiveTab("my-submissions");
          }}
        />
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PixelCard className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <PixelCardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <PixelCardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  {selectedSubmission.title}
                </PixelCardTitle>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </PixelCardHeader>

            <PixelCardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-muted-foreground text-sm">{selectedSubmission.description}</p>

              <div className="flex flex-wrap gap-2">
                <PixelBadge variant="outline">
                  {projectTypeLabels[selectedSubmission.projectType]}
                </PixelBadge>
                <PixelBadge
                  variant="outline"
                  className={difficultyColors[selectedSubmission.difficulty]}
                >
                  {selectedSubmission.difficulty.toUpperCase()}
                </PixelBadge>
                {selectedSubmission.tags.map((tag) => (
                  <PixelBadge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </PixelBadge>
                ))}
              </div>

              <div className="bg-[#0a0f1a] rounded-lg p-4">
                <h4 className="text-primary text-sm font-bold mb-3">Tools in this Stack</h4>
                <div className="space-y-2">
                  {selectedSubmission.tools.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-[#111827] rounded-lg">
                      <Package className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-primary text-sm">
                          {tool.tool?.name || tool.customTool?.name || "Custom Tool"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {tool.tool?.tagline || tool.customTool?.description || tool.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4" />
                  {selectedSubmission.upvotes} upvotes
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedSubmission.views} views
                </span>
              </div>

              {(selectedSubmission.githubUrl || selectedSubmission.liveUrl) && (
                <div className="flex gap-2">
                  {selectedSubmission.githubUrl && (
                    <a
                      href={selectedSubmission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PixelButton variant="outline" size="sm">
                        <Github className="w-4 h-4 mr-1" />
                        GitHub
                      </PixelButton>
                    </a>
                  )}
                  {selectedSubmission.liveUrl && (
                    <a
                      href={selectedSubmission.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PixelButton variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Live Demo
                      </PixelButton>
                    </a>
                  )}
                </div>
              )}
            </PixelCardContent>
          </PixelCard>
        </div>
      )}
    </div>
  );
}
