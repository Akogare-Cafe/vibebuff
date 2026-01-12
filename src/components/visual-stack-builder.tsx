"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toPng } from "html-to-image";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const xyflow = require("@xyflow/react");
const {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  Controls,
  Background,
  Handle,
  Position,
} = xyflow;

type Node<T = Record<string, unknown>> = {
  id: string;
  position: { x: number; y: number };
  data: T;
  type?: string;
};

type Edge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  markerEnd?: { type: typeof MarkerType };
  label?: string;
};

type Connection = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};
import "@xyflow/react/dist/style.css";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import {
  Layers,
  Plus,
  Save,
  Share2,
  Download,
  Trash2,
  ChevronRight,
  Wrench,
  Database,
  Globe,
  Server,
  Code,
  Cloud,
  Cpu,
  FolderOpen,
  Copy,
  Check,
  Twitter,
  Linkedin,
  X,
  FileJson,
  Image,
  Clock,
  Edit3,
  FileText,
  Zap,
  Store,
  Tag,
  Upload,
  Sparkles,
  HelpCircle,
  MousePointer2,
  Move,
  Link2,
  GripVertical,
  Search,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Id } from "../../convex/_generated/dataModel";
import { PackageJsonImportModal } from "./package-json-import";

interface PopularStack {
  name: string;
  description: string;
  tools: Array<{ name: string; category: string; tagline: string }>;
  tags: string[];
}

const POPULAR_STACKS: PopularStack[] = [
  {
    name: "Next.js + Convex",
    description: "Modern full-stack with real-time database",
    tags: ["Full-Stack", "Real-time"],
    tools: [
      { name: "Next.js", category: "frontend", tagline: "React framework for production" },
      { name: "Convex", category: "backend", tagline: "Real-time backend platform" },
      { name: "Tailwind CSS", category: "frontend", tagline: "Utility-first CSS framework" },
      { name: "Clerk", category: "backend", tagline: "Authentication and user management" },
      { name: "Vercel", category: "deployment", tagline: "Frontend cloud platform" },
    ],
  },
  {
    name: "T3 Stack",
    description: "Type-safe full-stack with tRPC",
    tags: ["TypeScript", "Full-Stack"],
    tools: [
      { name: "Next.js", category: "frontend", tagline: "React framework for production" },
      { name: "tRPC", category: "backend", tagline: "End-to-end typesafe APIs" },
      { name: "Prisma", category: "database", tagline: "Next-gen Node.js ORM" },
      { name: "Tailwind CSS", category: "frontend", tagline: "Utility-first CSS framework" },
      { name: "NextAuth.js", category: "backend", tagline: "Authentication for Next.js" },
    ],
  },
  {
    name: "MERN Stack",
    description: "Classic JavaScript full-stack",
    tags: ["JavaScript", "Classic"],
    tools: [
      { name: "MongoDB", category: "database", tagline: "NoSQL document database" },
      { name: "Express.js", category: "backend", tagline: "Fast Node.js web framework" },
      { name: "React", category: "frontend", tagline: "UI component library" },
      { name: "Node.js", category: "backend", tagline: "JavaScript runtime" },
    ],
  },
  {
    name: "AI SaaS Stack",
    description: "Build AI-powered applications",
    tags: ["AI", "SaaS"],
    tools: [
      { name: "Next.js", category: "frontend", tagline: "React framework for production" },
      { name: "OpenAI", category: "ai", tagline: "GPT and AI models" },
      { name: "Vercel AI SDK", category: "ai", tagline: "AI streaming utilities" },
      { name: "Supabase", category: "database", tagline: "Open source Firebase alternative" },
      { name: "Stripe", category: "backend", tagline: "Payment processing" },
    ],
  },
  {
    name: "Indie Hacker Stack",
    description: "Ship fast with minimal setup",
    tags: ["Startup", "Fast"],
    tools: [
      { name: "Next.js", category: "frontend", tagline: "React framework for production" },
      { name: "Supabase", category: "database", tagline: "Open source Firebase alternative" },
      { name: "Tailwind CSS", category: "frontend", tagline: "Utility-first CSS framework" },
      { name: "Vercel", category: "deployment", tagline: "Frontend cloud platform" },
      { name: "Resend", category: "backend", tagline: "Email API for developers" },
    ],
  },
  {
    name: "Mobile-First Stack",
    description: "Cross-platform mobile development",
    tags: ["Mobile", "Cross-Platform"],
    tools: [
      { name: "React Native", category: "frontend", tagline: "Build native mobile apps" },
      { name: "Expo", category: "tool", tagline: "React Native development platform" },
      { name: "Firebase", category: "backend", tagline: "Google's app development platform" },
      { name: "NativeWind", category: "frontend", tagline: "Tailwind CSS for React Native" },
    ],
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  ide: <Code className="w-4 h-4" />,
  ai: <Cpu className="w-4 h-4" />,
  frontend: <Globe className="w-4 h-4" />,
  backend: <Server className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  deployment: <Cloud className="w-4 h-4" />,
  tool: <Wrench className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  ide: "#22c55e",
  ai: "#3b82f6",
  frontend: "#ef4444",
  backend: "#f59e0b",
  database: "#6366f1",
  deployment: "#14b8a6",
  tool: "#3b82f6",
};

interface ToolNodeData {
  label: string;
  toolId?: Id<"tools">;
  category: string;
  description?: string;
  tool?: { name: string; tagline: string; logoUrl?: string };
}

function ToolNode({ data }: { data: ToolNodeData }) {
  const color = categoryColors[data.category] || "#3b82f6";
  const icon = categoryIcons[data.category] || <Wrench className="w-4 h-4" />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Handle
            type="target"
            position={Position.Top}
            className="!w-3 !h-3 !bg-primary !border-2 !border-background"
          />
          <div
            className="px-4 py-3 rounded-lg border-2 min-w-[150px] bg-card"
            style={{ borderColor: color }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <span style={{ color }}>{icon}</span>
              </div>
              <span className="text-primary font-bold text-sm">{data.label}</span>
            </div>
            <PixelBadge
              className="mt-2 text-xs"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {data.category}
            </PixelBadge>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            className="!w-3 !h-3 !bg-primary !border-2 !border-background"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="bg-card border-2 border-border p-3 max-w-[250px]"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-primary font-bold text-sm">{data.label}</span>
          </div>
          {data.description && (
            <p className="text-muted-foreground text-xs">{data.description}</p>
          )}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <PixelBadge
              className="text-[10px]"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {data.category}
            </PixelBadge>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const nodeTypes = {
  tool: ToolNode,
};

interface Blueprint {
  _id: Id<"stackBlueprints">;
  slug: string;
  title: string;
  description: string;
  projectType: string;
  difficulty: string;
  nodes: Node<ToolNodeData>[];
  edges: Edge[];
  estimatedCost?: string;
  tools?: { name: string }[];
}

function BlueprintCard({
  blueprint,
  onSelect,
}: {
  blueprint: Blueprint;
  onSelect: () => void;
}) {
  return (
    <PixelCard className="cursor-pointer" onClick={onSelect}>
      <PixelCardContent className="p-4">
        <h3 className="text-primary font-bold text-sm mb-1">
          {blueprint.title}
        </h3>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
          {blueprint.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <PixelBadge className="text-xs">{blueprint.projectType}</PixelBadge>
            <PixelBadge className="text-xs">{blueprint.difficulty}</PixelBadge>
          </div>
          {blueprint.estimatedCost && (
            <span className="text-[#fbbf24] text-xs">{blueprint.estimatedCost}</span>
          )}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function PopularStackCard({
  stack,
  onSelect,
}: {
  stack: PopularStack;
  onSelect: () => void;
}) {
  return (
    <PixelCard 
      className="cursor-pointer hover:border-primary/50 transition-colors" 
      onClick={onSelect}
    >
      <PixelCardContent className="p-4">
        <h3 className="text-primary font-bold text-sm mb-1">
          {stack.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-3">
          {stack.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {stack.tools.slice(0, 4).map((tool) => (
            <PixelBadge
              key={tool.name}
              className="text-[6px]"
              style={{
                backgroundColor: `${categoryColors[tool.category]}20`,
                color: categoryColors[tool.category],
              }}
            >
              {tool.name}
            </PixelBadge>
          ))}
          {stack.tools.length > 4 && (
            <PixelBadge className="text-[6px]">
              +{stack.tools.length - 4}
            </PixelBadge>
          )}
        </div>
        <div className="flex gap-1">
          {stack.tags.map((tag) => (
            <PixelBadge key={tag} variant="outline" className="text-[6px]">
              {tag}
            </PixelBadge>
          ))}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function ToolPalette({
  onAddNode,
}: {
  onAddNode: (category: string, label: string, description?: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const tools = useQuery(api.tools.list, { limit: 500 });

  const allCategories = useMemo(() => {
    if (!tools) return [];
    const cats = new Set<string>();
    tools.forEach((tool) => {
      const category = tool.tags?.[0] || "tool";
      cats.add(category);
    });
    return Array.from(cats).sort();
  }, [tools]);

  const filteredToolsByCategory = useMemo(() => {
    if (!tools) return {};
    
    const filtered = tools.filter((tool) => {
      const matchesSearch = searchQuery === "" || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const category = tool.tags?.[0] || "tool";
      const matchesCategory = selectedCategory === null || category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    return filtered.reduce((acc, tool) => {
      const category = tool.tags?.[0] || "tool";
      if (!acc[category]) acc[category] = [];
      acc[category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);
  }, [tools, searchQuery, selectedCategory]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const totalResults = Object.values(filteredToolsByCategory).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="w-full sm:w-72 bg-card border-2 border-border rounded-lg p-3 sm:p-4 max-h-[400px] sm:max-h-[600px] flex flex-col">
      <h3 className="text-primary font-bold text-sm mb-3 flex items-center gap-2">
        <Wrench className="w-4 h-4" />
        Tool Palette
      </h3>

      <div className="space-y-3 mb-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <PixelInput
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] transition-colors",
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-primary"
            )}
          >
            All
          </button>
          {allCategories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] transition-colors",
                selectedCategory === cat
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-primary"
              )}
              style={{
                backgroundColor: selectedCategory === cat 
                  ? categoryColors[cat] || "#3b82f6"
                  : `${categoryColors[cat] || "#3b82f6"}20`,
                color: selectedCategory === cat ? "white" : categoryColors[cat] || "#3b82f6",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-[10px] text-muted-foreground">
            {totalResults} tool{totalResults !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {Object.entries(filteredToolsByCategory).length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">No tools found</p>
            <p className="text-[10px] text-muted-foreground/70">Try a different search term</p>
          </div>
        ) : (
          Object.entries(filteredToolsByCategory).map(([category, categoryTools]) => {
            const isExpanded = expandedCategories.has(category) || searchQuery !== "";
            const displayTools = isExpanded ? categoryTools : categoryTools.slice(0, 5);
            const hasMore = categoryTools.length > 5;

            return (
              <div key={category} className="border border-border/50 rounded-lg p-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between mb-1"
                >
                  <h4
                    className="text-xs font-bold flex items-center gap-1"
                    style={{ color: categoryColors[category] || "#3b82f6" }}
                  >
                    {categoryIcons[category] || <Wrench className="w-3 h-3" />}
                    {category}
                    <span className="text-muted-foreground font-normal ml-1">
                      ({categoryTools.length})
                    </span>
                  </h4>
                  {hasMore && !searchQuery && (
                    <ChevronRight
                      className={cn(
                        "w-3 h-3 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  )}
                </button>
                <div className="space-y-0.5">
                  {displayTools.map((tool) => (
                    <Tooltip key={tool._id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onAddNode(category, tool.name, tool.tagline)}
                          className="w-full text-left px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          <span className="truncate">{tool.name}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8} className="max-w-[200px]">
                        <p className="font-bold text-xs">{tool.name}</p>
                        {tool.tagline && (
                          <p className="text-[10px] text-muted-foreground mt-1">{tool.tagline}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {hasMore && !isExpanded && !searchQuery && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full text-left px-2 py-1 text-[10px] text-primary/70 hover:text-primary"
                    >
                      +{categoryTools.length - 5} more...
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <h4 className="text-primary text-xs font-bold mb-2">Add Custom Node</h4>
        <div className="grid grid-cols-4 gap-1">
          {Object.keys(categoryColors).slice(0, 8).map((cat) => (
            <Tooltip key={cat}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onAddNode(cat, `New ${cat}`, "")}
                  className="p-2 rounded text-sm transition-colors hover:scale-105"
                  style={{
                    backgroundColor: `${categoryColors[cat]}20`,
                    color: categoryColors[cat],
                  }}
                >
                  <Plus className="w-3 h-3 mx-auto" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                <p className="text-xs">Add {cat} node</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

type TabType = "builder" | "my-builds" | "contracts";

interface UserBuild {
  _id: Id<"userStackBuilds">;
  title: string;
  description?: string;
  nodes: Node<ToolNodeData>[];
  edges: Edge[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: number;
  updatedAt: number;
}

function ShareModal({
  build,
  onClose,
}: {
  build: UserBuild;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const updateBuild = useMutation(api.stackBuilder.updateBuild);
  const [isUpdating, setIsUpdating] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  const shareUrl = build.shareToken
    ? `${siteUrl}/stack-builder/share/${build.shareToken}`
    : null;

  const handleMakePublic = async () => {
    setIsUpdating(true);
    try {
      await updateBuild({
        buildId: build._id,
        isPublic: true,
      });
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `Check out my tech stack "${build.title}" with ${build.nodes.length} tools on VibeBuff!`;

  const twitterUrl = shareUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    : null;

  const linkedinUrl = shareUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <PixelCard className="p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" /> SHARE STACK
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-muted-foreground text-sm mb-4">
          STACK: {build.title.toUpperCase()}
        </p>

        {!build.isPublic ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-xs mb-4">
              THIS STACK IS PRIVATE. MAKE IT PUBLIC TO SHARE.
            </p>
            <PixelButton onClick={handleMakePublic} disabled={isUpdating}>
              <Share2 className="w-3 h-3 mr-2" />
              {isUpdating ? "UPDATING..." : "MAKE PUBLIC"}
            </PixelButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-primary text-xs mb-2">SHARE LINK</p>
              <div className="flex gap-2">
                <PixelInput
                  value={shareUrl || ""}
                  readOnly
                  className="flex-1 text-xs"
                />
                <PixelButton size="sm" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </PixelButton>
              </div>
            </div>

            <div>
              <p className="text-primary text-xs mb-2">SHARE ON</p>
              <div className="flex gap-2">
                {twitterUrl && (
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                    <PixelButton size="sm" variant="outline">
                      <Twitter className="w-3 h-3 mr-1" /> X
                    </PixelButton>
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PixelButton size="sm" variant="outline">
                      <Linkedin className="w-3 h-3 mr-1" /> LINKEDIN
                    </PixelButton>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </PixelCard>
    </div>
  );
}

function PublishToMarketplaceModal({
  build,
  onClose,
  onPublished,
}: {
  build: UserBuild;
  onClose: () => void;
  onPublished: () => void;
}) {
  const { user } = useUser();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [projectType, setProjectType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishToMarketplace = useMutation(api.stackMarketplace.publishToMarketplace);
  const isPublished = useQuery(api.stackMarketplace.isPublishedToMarketplace, {
    buildId: build._id,
  });

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePublish = async () => {
    if (!user?.id) return;
    
    if (tags.length === 0) {
      setError("Please add at least one tag to help others discover your stack.");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      await publishToMarketplace({
        buildId: build._id,
        userId: user.id,
        tags,
        projectType: projectType as "landing-page" | "saas" | "e-commerce" | "blog" | "dashboard" | "mobile-app" | "api" | "other" | undefined,
        difficulty: difficulty as "beginner" | "intermediate" | "advanced" | undefined,
      });
      onPublished();
      onClose();
    } catch (err) {
      setError("Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <PixelCard className="p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary text-sm flex items-center gap-2">
            <Store className="w-4 h-4" /> PUBLISH TO MARKETPLACE
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-muted-foreground text-sm mb-4">
          STACK: {build.title.toUpperCase()}
        </p>

        {isPublished && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-xs">
              This stack is already published to the marketplace. Publishing again will update it.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-primary text-xs mb-2 block">PROJECT TYPE</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full px-3 py-2 bg-card border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
            >
              <option value="">Select type...</option>
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
            <label className="text-primary text-xs mb-2 block">DIFFICULTY</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-card border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
            >
              <option value="">Select difficulty...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-primary text-xs mb-2 block">
              TAGS ({tags.length}/5)
            </label>
            <div className="flex gap-2 mb-2">
              <PixelInput
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <PixelButton
                size="sm"
                variant="outline"
                onClick={handleAddTag}
                disabled={tags.length >= 5}
              >
                <Tag className="w-3 h-3" />
              </PixelButton>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <PixelBadge
                    key={tag}
                    className="text-xs cursor-pointer hover:bg-red-500/20"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} <X className="w-2 h-2 ml-1 inline" />
                  </PixelBadge>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <PixelButton
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1"
            >
              <Store className="w-3 h-3 mr-2" />
              {isPublishing ? "PUBLISHING..." : isPublished ? "UPDATE" : "PUBLISH"}
            </PixelButton>
            <PixelButton variant="outline" onClick={onClose}>
              CANCEL
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}

function MyBuildsPanel({
  builds,
  onLoadBuild,
  onDeleteBuild,
  onShareBuild,
  onPublishBuild,
}: {
  builds: UserBuild[] | undefined;
  onLoadBuild: (build: UserBuild) => void;
  onDeleteBuild: (buildId: Id<"userStackBuilds">) => void;
  onShareBuild: (build: UserBuild) => void;
  onPublishBuild: (build: UserBuild) => void;
}) {
  if (!builds || builds.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm">No saved stacks yet.</p>
        <p className="text-muted-foreground text-xs mt-2">
          Create your first stack using the builder above!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {builds.map((build) => (
        <PixelCard key={build._id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-primary font-bold text-sm">{build.title}</h3>
              <p className="text-muted-foreground text-xs mt-1">
                {build.nodes.length} tools, {build.edges.length} connections
              </p>
            </div>
            <PixelBadge
              variant="outline"
              className={cn(
                "text-[6px]",
                build.isPublic
                  ? "text-green-400 border-green-400"
                  : "text-muted-foreground"
              )}
            >
              {build.isPublic ? "PUBLIC" : "PRIVATE"}
            </PixelBadge>
          </div>

          {build.description && (
            <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
              {build.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {build.nodes.slice(0, 4).map((node) => (
              <PixelBadge
                key={node.id}
                className="text-[6px]"
                style={{
                  backgroundColor: `${categoryColors[node.data.category]}20`,
                  color: categoryColors[node.data.category],
                }}
              >
                {node.data.label}
              </PixelBadge>
            ))}
            {build.nodes.length > 4 && (
              <PixelBadge className="text-[6px]">
                +{build.nodes.length - 4} more
              </PixelBadge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(build.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2">
            <PixelButton
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onLoadBuild(build)}
            >
              <Edit3 className="w-3 h-3 mr-1" /> EDIT
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => onPublishBuild(build)}
              title="Publish to Marketplace"
            >
              <Store className="w-3 h-3" />
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => onShareBuild(build)}
            >
              <Share2 className="w-3 h-3" />
            </PixelButton>
            <PixelButton
              size="sm"
              variant="ghost"
              onClick={() => onDeleteBuild(build._id)}
            >
              <Trash2 className="w-3 h-3" />
            </PixelButton>
          </div>
        </PixelCard>
      ))}
    </div>
  );
}

function ContractsPanel({ userId }: { userId: string }) {
  const contracts = useQuery(api.stackContracts.getActiveContracts);
  const userSubmissions = useQuery(api.stackContracts.getUserSubmissions, {
    userId,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "expert":
        return "text-red-400 border-red-400";
      case "hard":
        return "text-orange-400 border-orange-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      default:
        return "text-green-400 border-green-400";
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const hasSubmitted = (contractId: Id<"stackContracts">) => {
    return userSubmissions?.some((s) => s.contractId === contractId);
  };

  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm">
          No active contracts. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Complete stack contracts to earn XP and unlock rewards!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract) => {
          const submitted = hasSubmitted(contract._id);

          return (
            <PixelCard
              key={contract._id}
              className={cn(
                "p-4",
                submitted && "opacity-60 border-green-400/50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-primary font-bold text-sm">
                    {contract.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <PixelBadge
                      variant="outline"
                      className={cn(
                        "text-[6px]",
                        getDifficultyColor(contract.difficulty)
                      )}
                    >
                      {contract.difficulty.toUpperCase()}
                    </PixelBadge>
                    <PixelBadge variant="outline" className="text-[6px]">
                      {contract.contractType.toUpperCase()}
                    </PixelBadge>
                  </div>
                </div>
                {submitted && <Check className="w-5 h-5 text-green-400" />}
              </div>

              <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                {contract.description}
              </p>

              <div className="space-y-1 mb-3 text-xs">
                <p className="text-muted-foreground">
                  Categories:{" "}
                  {contract.requirements.requiredCategories.join(", ")}
                </p>
                {contract.requirements.maxBudget && (
                  <p className="text-green-400">
                    Max ${contract.requirements.maxBudget}/mo
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    +{contract.rewards.xp} XP
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(contract.expiresAt)}
                </div>
              </div>
            </PixelCard>
          );
        })}
      </div>
    </div>
  );
}

interface InitialTool {
  name: string;
  category: string;
  tagline: string;
}

interface HelpStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HELP_STEPS: HelpStep[] = [
  {
    icon: <MousePointer2 className="w-6 h-6" />,
    title: "Add Tools",
    description: "Click tools from the palette or select a template to get started",
  },
  {
    icon: <Move className="w-6 h-6" />,
    title: "Drag to Arrange",
    description: "Drag nodes to position them. Organize by category for clarity",
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: "Connect Tools",
    description: "Drag from the bottom handle of one node to the top of another",
  },
  {
    icon: <Save className="w-6 h-6" />,
    title: "Save & Share",
    description: "Save your stack, export as image, or share with the community",
  },
];

function HelpOverlay({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full"
      >
        <PixelCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-primary text-lg font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Use Stack Builder
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                >
                  {HELP_STEPS[currentStep].icon}
                </motion.div>
                <h4 className="text-primary font-bold text-lg mb-2">
                  {HELP_STEPS[currentStep].title}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {HELP_STEPS[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {HELP_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentStep === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <PixelButton
              variant="outline"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Previous
            </PixelButton>
            {currentStep < HELP_STEPS.length - 1 ? (
              <PixelButton
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex-1"
              >
                Next
              </PixelButton>
            ) : (
              <PixelButton onClick={onClose} className="flex-1">
                Get Started
              </PixelButton>
            )}
          </div>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

function QuickTips() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
    >
      {HELP_STEPS.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="flex items-center gap-2 p-3 bg-card/50 border border-border rounded-lg"
        >
          <div className="text-primary/70">{step.icon}</div>
          <div>
            <p className="text-primary text-xs font-bold">{step.title}</p>
            <p className="text-muted-foreground text-[10px] line-clamp-1">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface VisualStackBuilderProps {
  initialTools?: InitialTool[];
}

export function VisualStackBuilder({ initialTools }: VisualStackBuilderProps) {
  const { user } = useUser();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showPalette, setShowPalette] = useState(!initialTools || initialTools.length === 0);
  const [buildTitle, setBuildTitle] = useState("My Stack");
  const [buildDescription, setBuildDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("builder");
  const [currentBuildId, setCurrentBuildId] = useState<Id<"userStackBuilds"> | null>(null);
  const [shareModalBuild, setShareModalBuild] = useState<UserBuild | null>(null);
  const [publishModalBuild, setPublishModalBuild] = useState<UserBuild | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  const blueprints = useQuery(api.stackBuilder.getFeaturedBlueprints, { limit: 6 });
  const userBuilds = useQuery(
    api.stackBuilder.getUserBuilds,
    user?.id ? { userId: user.id } : "skip"
  );
  const createBuild = useMutation(api.stackBuilder.createBuild);
  const updateBuild = useMutation(api.stackBuilder.updateBuild);
  const deleteBuild = useMutation(api.stackBuilder.deleteBuild);

  useEffect(() => {
    if (initialTools && initialTools.length > 0) {
      const categoryPositions: Record<string, { x: number; y: number }> = {
        ide: { x: 50, y: 50 },
        ai: { x: 50, y: 350 },
        frontend: { x: 500, y: 50 },
        backend: { x: 500, y: 350 },
        database: { x: 500, y: 650 },
        deployment: { x: 950, y: 200 },
        tool: { x: 950, y: 500 },
        auth: { x: 50, y: 650 },
        payments: { x: 950, y: 650 },
        analytics: { x: 950, y: 50 },
        testing: { x: 50, y: 500 },
        monitoring: { x: 1200, y: 350 },
        unknown: { x: 300, y: 400 },
      };

      const categoryConnections: Record<string, string[]> = {
        ide: ["ai", "frontend", "backend"],
        ai: ["backend", "frontend"],
        frontend: ["backend", "deployment"],
        backend: ["database", "ai", "deployment", "auth", "payments"],
        database: [],
        deployment: [],
        auth: ["backend"],
        payments: [],
        analytics: ["frontend", "backend"],
        tool: ["frontend", "backend"],
        testing: ["frontend", "backend"],
        monitoring: ["backend", "deployment"],
      };

      const timestamp = Date.now();
      const categoryNodeMap: Record<string, string> = {};
      const usedPositions: Record<string, number> = {};
      
      const newNodes: Node<ToolNodeData>[] = initialTools.map((tool, index) => {
        const cat = tool.category.toLowerCase();
        const basePos = categoryPositions[cat] || categoryPositions.unknown || { x: 250 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 180 };
        const offset = usedPositions[cat] || 0;
        usedPositions[cat] = offset + 1;
        
        const nodeId = `node-${timestamp}-${index}`;
        if (!categoryNodeMap[cat]) {
          categoryNodeMap[cat] = nodeId;
        }
        
        return {
          id: nodeId,
          type: "tool",
          position: { x: basePos.x + offset * 280, y: basePos.y + offset * 120 },
          data: {
            label: tool.name,
            category: cat,
            description: tool.tagline,
          },
        };
      });

      const newEdges: Edge[] = [];
      const addedEdges = new Set<string>();

      for (const tool of initialTools) {
        const sourceCat = tool.category.toLowerCase();
        const sourceNodeId = categoryNodeMap[sourceCat];
        if (!sourceNodeId) continue;

        const targets = categoryConnections[sourceCat] || [];
        for (const targetCat of targets) {
          const targetNodeId = categoryNodeMap[targetCat];
          if (!targetNodeId) continue;
          
          const edgeKey = `${sourceNodeId}-${targetNodeId}`;
          if (addedEdges.has(edgeKey)) continue;
          addedEdges.add(edgeKey);

          newEdges.push({
            id: `edge-${edgeKey}`,
            source: sourceNodeId,
            target: targetNodeId,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);
      setBuildTitle("AI Recommended Stack");
    }
  }, [initialTools, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds: Edge[]) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
            style: { stroke: "#3b82f6", strokeWidth: 2 },
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (category: string, label: string, description?: string) => {
      const newNode: Node<ToolNodeData> = {
        id: `node-${Date.now()}`,
        type: "tool",
        position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label, category, description: description || "" },
      };
      setNodes((nds: Node[]) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleLoadBlueprint = useCallback(
    (blueprint: Blueprint) => {
      setNodes(blueprint.nodes as Node<ToolNodeData>[]);
      setEdges(blueprint.edges);
      setBuildTitle(blueprint.title);
    },
    [setNodes, setEdges]
  );

  const handleLoadPopularStack = useCallback(
    (stack: PopularStack) => {
      const categoryPositions: Record<string, { x: number; y: number }> = {
        ide: { x: 100, y: 100 },
        ai: { x: 100, y: 280 },
        frontend: { x: 400, y: 100 },
        backend: { x: 400, y: 280 },
        database: { x: 400, y: 460 },
        deployment: { x: 700, y: 190 },
        tool: { x: 700, y: 370 },
      };

      const categoryConnections: Record<string, string[]> = {
        frontend: ["backend", "deployment"],
        backend: ["database", "ai", "deployment"],
        database: [],
        deployment: [],
        ai: ["backend", "frontend"],
        tool: ["frontend", "backend"],
      };

      const timestamp = Date.now();
      const categoryNodeMap: Record<string, string> = {};
      const usedPositions: Record<string, number> = {};

      const newNodes: Node<ToolNodeData>[] = stack.tools.map((tool, index) => {
        const cat = tool.category.toLowerCase();
        const basePos = categoryPositions[cat] || { x: 250 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 180 };
        const offset = usedPositions[cat] || 0;
        usedPositions[cat] = offset + 1;

        const nodeId = `node-${timestamp}-${index}`;
        if (!categoryNodeMap[cat]) {
          categoryNodeMap[cat] = nodeId;
        }

        return {
          id: nodeId,
          type: "tool",
          position: { x: basePos.x + offset * 40, y: basePos.y + offset * 40 },
          data: {
            label: tool.name,
            category: cat,
            description: tool.tagline,
          },
        };
      });

      const newEdges: Edge[] = [];
      const addedEdges = new Set<string>();

      for (const tool of stack.tools) {
        const sourceCat = tool.category.toLowerCase();
        const sourceNodeId = categoryNodeMap[sourceCat];
        if (!sourceNodeId) continue;

        const targets = categoryConnections[sourceCat] || [];
        for (const targetCat of targets) {
          const targetNodeId = categoryNodeMap[targetCat];
          if (!targetNodeId) continue;

          const edgeKey = `${sourceNodeId}-${targetNodeId}`;
          if (addedEdges.has(edgeKey)) continue;
          addedEdges.add(edgeKey);

          newEdges.push({
            id: `edge-${edgeKey}`,
            source: sourceNodeId,
            target: targetNodeId,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);
      setBuildTitle(stack.name);
      setBuildDescription(stack.description);
      setCurrentBuildId(null);
    },
    [setNodes, setEdges]
  );

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const nodeData = nodes.map((n: Node) => ({
        id: n.id,
        type: n.type || "tool",
        position: n.position,
        data: {
          label: n.data.label,
          category: n.data.category,
          description: n.data.description,
          toolId: n.data.toolId,
        },
      }));

      const edgeData = edges.map((e: Edge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === "string" ? e.label : undefined,
        animated: e.animated,
      }));

      if (currentBuildId) {
        await updateBuild({
          buildId: currentBuildId,
          title: buildTitle,
          description: buildDescription || undefined,
          nodes: nodeData,
          edges: edgeData,
        });
        setSaveMessage("Stack updated!");
      } else {
        const newBuildId = await createBuild({
          userId: user.id,
          title: buildTitle,
          description: buildDescription || undefined,
          nodes: nodeData,
          edges: edgeData,
          isPublic: false,
        });
        setCurrentBuildId(newBuildId);
        setSaveMessage("Stack saved!");
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("Error saving stack");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadBuild = (build: UserBuild) => {
    setNodes(build.nodes as Node<ToolNodeData>[]);
    setEdges(build.edges);
    setBuildTitle(build.title);
    setBuildDescription(build.description || "");
    setCurrentBuildId(build._id);
    setActiveTab("builder");
  };

  const handleDeleteBuild = async (buildId: Id<"userStackBuilds">) => {
    if (confirm("Are you sure you want to delete this stack?")) {
      await deleteBuild({ buildId });
      if (currentBuildId === buildId) {
        handleClear();
      }
    }
  };

  const handleExportJSON = () => {
    const data = {
      title: buildTitle,
      description: buildDescription,
      nodes: nodes.map((n: Node) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e: Edge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.animated,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${buildTitle.replace(/\s+/g, "-").toLowerCase()}-stack.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    if (!flowRef.current) return;

    try {
      const dataUrl = await toPng(flowRef.current, {
        backgroundColor: "#0a0f1a",
        quality: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${buildTitle.replace(/\s+/g, "-").toLowerCase()}-stack.png`;
      a.click();
    } catch (error) {
    }
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setBuildTitle("My Stack");
    setBuildDescription("");
    setCurrentBuildId(null);
  };

  const handleNewStack = () => {
    handleClear();
    setActiveTab("builder");
  };

  const handleImportComplete = useCallback(
    (tools: Array<{ name: string; category: string; tagline: string }>) => {
      const categoryPositions: Record<string, { x: number; y: number }> = {
        ide: { x: 100, y: 100 },
        ai: { x: 100, y: 280 },
        frontend: { x: 400, y: 100 },
        backend: { x: 400, y: 280 },
        database: { x: 400, y: 460 },
        deployment: { x: 700, y: 190 },
        tool: { x: 700, y: 370 },
        auth: { x: 100, y: 460 },
        payments: { x: 700, y: 460 },
        analytics: { x: 700, y: 100 },
        unknown: { x: 250, y: 280 },
      };

      const categoryConnections: Record<string, string[]> = {
        ide: ["ai", "frontend", "backend"],
        ai: ["backend", "frontend"],
        frontend: ["backend", "deployment"],
        backend: ["database", "ai", "deployment", "auth", "payments"],
        database: [],
        deployment: [],
        auth: ["backend"],
        payments: [],
        analytics: ["frontend", "backend"],
        tool: ["frontend", "backend"],
      };

      const timestamp = Date.now();
      const categoryNodeMap: Record<string, string> = {};
      const usedPositions: Record<string, number> = {};

      const newNodes: Node<ToolNodeData>[] = tools.map((tool, index) => {
        const cat = tool.category.toLowerCase();
        const basePos = categoryPositions[cat] || categoryPositions.unknown;
        const offset = usedPositions[cat] || 0;
        usedPositions[cat] = offset + 1;
        
        const nodeId = `node-${timestamp}-${index}`;
        if (!categoryNodeMap[cat]) {
          categoryNodeMap[cat] = nodeId;
        }

        return {
          id: nodeId,
          type: "tool",
          position: { x: basePos.x + offset * 30, y: basePos.y + offset * 30 },
          data: {
            label: tool.name,
            category: cat,
            description: tool.tagline,
          },
        };
      });

      const newEdges: Edge[] = [];
      const addedEdges = new Set<string>();

      for (const tool of tools) {
        const sourceCat = tool.category.toLowerCase();
        const sourceNodeId = categoryNodeMap[sourceCat];
        if (!sourceNodeId) continue;

        const targets = categoryConnections[sourceCat] || [];
        for (const targetCat of targets) {
          const targetNodeId = categoryNodeMap[targetCat];
          if (!targetNodeId) continue;

          const edgeKey = `${sourceNodeId}-${targetNodeId}`;
          if (addedEdges.has(edgeKey)) continue;
          addedEdges.add(edgeKey);

          newEdges.push({
            id: `edge-${edgeKey}`,
            source: sourceNodeId,
            target: targetNodeId,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);
      setBuildTitle("Imported Stack");
      setCurrentBuildId(null);
      setActiveTab("builder");
    },
    [setNodes, setEdges]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Layers className="w-6 h-6" />
            Visual Stack Builder
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Design your tech stack visually with drag-and-drop
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <PixelButton variant="outline" size="sm" className="sm:size-auto" onClick={handleNewStack}>
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">New</span>
          </PixelButton>
          <PixelButton variant="outline" size="sm" className="sm:size-auto" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Import</span>
          </PixelButton>
          <a href="/stack-builder/collab/new">
            <PixelButton variant="outline" size="sm" className="sm:size-auto bg-primary/10 border-primary/50 hover:bg-primary/20">
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Collaborate</span>
            </PixelButton>
          </a>
          {user && (
            <PixelButton
              variant={activeTab === "my-builds" ? "default" : "outline"}
              size="sm"
              className="sm:size-auto"
              onClick={() => setActiveTab(activeTab === "my-builds" ? "builder" : "my-builds")}
            >
              <FolderOpen className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">My Stacks</span>
              {userBuilds && userBuilds.length > 0 && (
                <span className="ml-1 text-xs">({userBuilds.length})</span>
              )}
            </PixelButton>
          )}
          {user && (
            <PixelButton
              variant={activeTab === "contracts" ? "default" : "outline"}
              size="sm"
              className="hidden sm:flex"
              onClick={() => setActiveTab(activeTab === "contracts" ? "builder" : "contracts")}
            >
              <FileText className="w-4 h-4 mr-1" />
              Contracts
            </PixelButton>
          )}
          <a href="/stack-marketplace" className="hidden sm:block">
            <PixelButton variant="outline" size="sm">
              <Store className="w-4 h-4 mr-1" />
              Marketplace
            </PixelButton>
          </a>
          <PixelButton variant="outline" size="sm" onClick={() => setShowHelp(true)}>
            <HelpCircle className="w-4 h-4" />
          </PixelButton>
        </div>
      </div>

      {activeTab === "my-builds" && user && (
        <PixelCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-primary text-lg font-bold flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              My Saved Stacks
            </h2>
          </div>
          <MyBuildsPanel
            builds={userBuilds as UserBuild[] | undefined}
            onLoadBuild={handleLoadBuild}
            onDeleteBuild={handleDeleteBuild}
            onShareBuild={(build) => setShareModalBuild(build)}
            onPublishBuild={(build) => setPublishModalBuild(build)}
          />
        </PixelCard>
      )}

      {activeTab === "contracts" && user && (
        <PixelCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-primary text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stack Contracts
            </h2>
          </div>
          <ContractsPanel userId={user.id} />
        </PixelCard>
      )}

      {activeTab === "builder" && (
        <>
          <QuickTips />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={buildTitle}
                onChange={(e) => setBuildTitle(e.target.value)}
                className="px-3 py-2 bg-card border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none w-full sm:w-auto"
                placeholder="Stack name..."
              />
              <input
                type="text"
                value={buildDescription}
                onChange={(e) => setBuildDescription(e.target.value)}
                className="px-3 py-2 bg-card border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none flex-1"
                placeholder="Description (optional)..."
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <PixelButton
                variant="outline"
                size="sm"
                onClick={() => setShowPalette(!showPalette)}
              >
                <Wrench className="w-4 h-4" />
              </PixelButton>
              <PixelButton variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4" />
              </PixelButton>
              <div className="relative group">
                <PixelButton variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </PixelButton>
                <div className="absolute right-0 top-full mt-1 bg-card border-2 border-border rounded-lg p-2 hidden group-hover:block z-10 min-w-[120px]">
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-2 py-1 text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                  >
                    <FileJson className="w-3 h-3" /> JSON
                  </button>
                  <button
                    onClick={handleExportImage}
                    className="w-full text-left px-2 py-1 text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                  >
                    <Image className="w-3 h-3" /> PNG
                  </button>
                </div>
              </div>
              <PixelButton size="sm" onClick={handleSave} disabled={isSaving || !user}>
                <Save className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : currentBuildId ? "Update" : "Save"}</span>
              </PixelButton>
              {saveMessage && (
                <span
                  className={cn(
                    "text-xs",
                    saveMessage.includes("Error")
                      ? "text-red-400"
                      : "text-green-400"
                  )}
                >
                  {saveMessage}
                </span>
              )}
            </div>
          </div>

          {nodes.length === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Popular Stacks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {POPULAR_STACKS.map((stack) => (
                    <PopularStackCard
                      key={stack.name}
                      stack={stack}
                      onSelect={() => handleLoadPopularStack(stack)}
                    />
                  ))}
                </div>
              </div>

              {blueprints && blueprints.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    Start from a Template
                    <ChevronRight className="w-4 h-4" />
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {blueprints.map((blueprint) => (
                      <BlueprintCard
                        key={blueprint._id}
                        blueprint={blueprint as Blueprint}
                        onSelect={() => handleLoadBlueprint(blueprint as Blueprint)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {showPalette && <ToolPalette onAddNode={handleAddNode} />}

            <div
              ref={flowRef}
              className="flex-1 h-[400px] sm:h-[600px] bg-muted border-2 border-border rounded-lg overflow-hidden"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="[&_.react-flow__pane]:bg-muted"
              >
                <Background color="#1e3a5f" gap={20} />
                <Controls className="!bg-card border-border [&_button]:!bg-muted [&_button]:!border-border [&_button]:!text-primary [&_button:hover]:!bg-accent [&_svg]:!fill-primary" />
                <Panel
                  position="top-right"
                  className="bg-card p-2 rounded-lg border border-border"
                >
                  <div className="text-muted-foreground text-xs">
                    <p>Drag to move nodes</p>
                    <p>Connect by dragging from edges</p>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </div>

          {nodes.length > 0 && (
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle>Stack Summary</PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <div className="flex flex-wrap gap-2">
                  {nodes.map((node: Node<ToolNodeData>) => (
                    <PixelBadge
                      key={node.id}
                      style={{
                        backgroundColor: `${categoryColors[node.data.category as keyof typeof categoryColors]}20`,
                        color:
                          categoryColors[
                            node.data.category as keyof typeof categoryColors
                          ],
                      }}
                    >
                      {node.data.label}
                    </PixelBadge>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  {nodes.length} tools connected with {edges.length} relationships
                </p>
              </PixelCardContent>
            </PixelCard>
          )}
        </>
      )}

      {shareModalBuild && (
        <ShareModal
          build={shareModalBuild}
          onClose={() => setShareModalBuild(null)}
        />
      )}

      {publishModalBuild && (
        <PublishToMarketplaceModal
          build={publishModalBuild}
          onClose={() => setPublishModalBuild(null)}
          onPublished={() => {
            setPublishModalBuild(null);
            setSaveMessage("Stack published to marketplace!");
            setTimeout(() => setSaveMessage(null), 3000);
          }}
        />
      )}

      <PackageJsonImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      <AnimatePresence>
        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      </AnimatePresence>
    </div>
  );
}
