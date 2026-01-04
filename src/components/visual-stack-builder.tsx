"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

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
  ai: "#a855f7",
  frontend: "#ec4899",
  backend: "#f59e0b",
  database: "#6366f1",
  deployment: "#14b8a6",
  tool: "#7f13ec",
};

interface ToolNodeData {
  label: string;
  toolId?: Id<"tools">;
  category: string;
  description?: string;
  tool?: { name: string; tagline: string; logoUrl?: string };
}

function ToolNode({ data }: { data: ToolNodeData }) {
  const color = categoryColors[data.category] || "#7f13ec";
  const icon = categoryIcons[data.category] || <Wrench className="w-4 h-4" />;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-[#261933]"
      />
      <div
        className="px-4 py-3 rounded-lg border-2 min-w-[150px] bg-[#261933]"
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
        {data.description && (
          <p className="text-muted-foreground text-xs">{data.description}</p>
        )}
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
        className="!w-3 !h-3 !bg-primary !border-2 !border-[#261933]"
      />
    </div>
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

function ToolPalette({
  onAddNode,
}: {
  onAddNode: (category: string, label: string) => void;
}) {
  const tools = useQuery(api.tools.list, { limit: 100 });

  const toolsByCategory = useMemo(() => {
    if (!tools) return {};
    return tools.reduce((acc, tool) => {
      const category = tool.tags?.[0] || "tool";
      if (!acc[category]) acc[category] = [];
      acc[category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);
  }, [tools]);

  return (
    <div className="w-64 bg-[#191022] border-2 border-border rounded-lg p-4 max-h-[500px] overflow-y-auto">
      <h3 className="text-primary font-bold text-sm mb-4 flex items-center gap-2">
        <Wrench className="w-4 h-4" />
        Tool Palette
      </h3>

      <div className="space-y-4">
        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <div key={category}>
            <h4
              className="text-xs font-bold mb-2 flex items-center gap-1"
              style={{ color: categoryColors[category] || "#7f13ec" }}
            >
              {categoryIcons[category] || <Wrench className="w-3 h-3" />}
              {category}
            </h4>
            <div className="space-y-1">
              {categoryTools.slice(0, 5).map((tool) => (
                <button
                  key={tool._id}
                  onClick={() => onAddNode(category, tool.name)}
                  className="w-full text-left px-2 py-1 rounded text-xs text-muted-foreground hover:bg-card hover:text-primary transition-colors"
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-primary text-xs font-bold mb-2">Custom Node</h4>
        <div className="grid grid-cols-3 gap-1">
          {Object.keys(categoryColors).map((cat) => (
            <button
              key={cat}
              onClick={() => onAddNode(cat, `New ${cat}`)}
              className="p-2 rounded text-sm transition-colors"
              style={{
                backgroundColor: `${categoryColors[cat]}20`,
                color: categoryColors[cat],
              }}
            >
              <Plus className="w-3 h-3 mx-auto" />
            </button>
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";
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
      console.error("Error making build public:", error);
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

function MyBuildsPanel({
  builds,
  onLoadBuild,
  onDeleteBuild,
  onShareBuild,
}: {
  builds: UserBuild[] | undefined;
  onLoadBuild: (build: UserBuild) => void;
  onDeleteBuild: (buildId: Id<"userStackBuilds">) => void;
  onShareBuild: (build: UserBuild) => void;
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

export function VisualStackBuilder() {
  const { user } = useUser();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showPalette, setShowPalette] = useState(true);
  const [buildTitle, setBuildTitle] = useState("My Stack");
  const [buildDescription, setBuildDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("builder");
  const [currentBuildId, setCurrentBuildId] = useState<Id<"userStackBuilds"> | null>(null);
  const [shareModalBuild, setShareModalBuild] = useState<UserBuild | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const blueprints = useQuery(api.stackBuilder.getFeaturedBlueprints, { limit: 6 });
  const userBuilds = useQuery(
    api.stackBuilder.getUserBuilds,
    user?.id ? { userId: user.id } : "skip"
  );
  const createBuild = useMutation(api.stackBuilder.createBuild);
  const updateBuild = useMutation(api.stackBuilder.updateBuild);
  const deleteBuild = useMutation(api.stackBuilder.deleteBuild);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds: Edge[]) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#7f13ec" },
            style: { stroke: "#7f13ec", strokeWidth: 2 },
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (category: string, label: string) => {
      const newNode: Node<ToolNodeData> = {
        id: `node-${Date.now()}`,
        type: "tool",
        position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label, category, description: "" },
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
      console.error("Error saving build:", error);
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
        backgroundColor: "#191022",
        quality: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${buildTitle.replace(/\s+/g, "-").toLowerCase()}-stack.png`;
      a.click();
    } catch (error) {
      console.error("Error exporting image:", error);
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

        <div className="flex items-center gap-2">
          <PixelButton variant="outline" onClick={handleNewStack}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </PixelButton>
          {user && (
            <PixelButton
              variant={activeTab === "my-builds" ? "default" : "outline"}
              onClick={() => setActiveTab(activeTab === "my-builds" ? "builder" : "my-builds")}
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              My Stacks
              {userBuilds && userBuilds.length > 0 && (
                <span className="ml-1 text-xs">({userBuilds.length})</span>
              )}
            </PixelButton>
          )}
          {user && (
            <PixelButton
              variant={activeTab === "contracts" ? "default" : "outline"}
              onClick={() => setActiveTab(activeTab === "contracts" ? "builder" : "contracts")}
            >
              <FileText className="w-4 h-4 mr-1" />
              Contracts
            </PixelButton>
          )}
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
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={buildTitle}
                onChange={(e) => setBuildTitle(e.target.value)}
                className="px-3 py-2 bg-[#261933] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
                placeholder="Stack name..."
              />
              <input
                type="text"
                value={buildDescription}
                onChange={(e) => setBuildDescription(e.target.value)}
                className="px-3 py-2 bg-[#261933] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none flex-1"
                placeholder="Description (optional)..."
              />
            </div>

            <div className="flex items-center gap-2">
              <PixelButton
                variant="outline"
                onClick={() => setShowPalette(!showPalette)}
              >
                <Wrench className="w-4 h-4" />
              </PixelButton>
              <PixelButton variant="outline" onClick={handleClear}>
                <Trash2 className="w-4 h-4" />
              </PixelButton>
              <div className="relative group">
                <PixelButton variant="outline">
                  <Download className="w-4 h-4" />
                </PixelButton>
                <div className="absolute right-0 top-full mt-1 bg-[#261933] border-2 border-border rounded-lg p-2 hidden group-hover:block z-10 min-w-[120px]">
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
              <PixelButton onClick={handleSave} disabled={isSaving || !user}>
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : currentBuildId ? "Update" : "Save"}
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

          {blueprints && blueprints.length > 0 && nodes.length === 0 && (
            <div>
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                Start from a Template
                <ChevronRight className="w-4 h-4" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <div className="flex gap-4">
            {showPalette && <ToolPalette onAddNode={handleAddNode} />}

            <div
              ref={flowRef}
              className="flex-1 h-[600px] bg-[#191022] border-2 border-border rounded-lg overflow-hidden"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#191022]"
              >
                <Background color="#362348" gap={20} />
                <Controls className="bg-[#261933] border-border [&_button]:!bg-[#362348] [&_button]:!border-border [&_button]:!text-primary [&_button:hover]:!bg-[#4a3060] [&_svg]:!fill-primary" />
                <Panel
                  position="top-right"
                  className="bg-[#261933] p-2 rounded-lg border border-border"
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
    </div>
  );
}
