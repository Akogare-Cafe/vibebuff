"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
  useReactFlow,
} = xyflow;

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
  Copy,
  Check,
  X,
  FileJson,
  Image,
  Users,
  Link2,
  UserPlus,
  Crown,
  Circle,
  Gauge,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

function ToolNode({ data }: { data: ToolNodeData }) {
  const color = categoryColors[data.category] || "#3b82f6";
  const icon = categoryIcons[data.category] || <Wrench className="w-4 h-4" />;

  const nodeContent = (
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
        <div className="flex items-center gap-2">
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
  );

  if (data.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{nodeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">{data.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return nodeContent;
}

const nodeTypes = {
  tool: ToolNode,
};

interface Participant {
  _id: Id<"stackBuilderParticipants">;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  cursorPosition?: { x: number; y: number };
  cursorColor: string;
  isActive: boolean;
}

interface AiScore {
  overall: number;
  completeness: number;
  coherence: number;
  scalability: number;
  costEfficiency: number;
  feedback: string[];
  lastUpdated: number;
}

function RemoteCursor({ participant, currentUserId }: { participant: Participant; currentUserId: string }) {
  if (!participant.cursorPosition || participant.userId === currentUserId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="absolute pointer-events-none z-50"
      style={{
        left: participant.cursorPosition.x,
        top: participant.cursorPosition.y,
        transform: "translate(-2px, -2px)",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
          fill={participant.cursorColor}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: participant.cursorColor }}
      >
        {participant.userName}
      </div>
    </motion.div>
  );
}

function ParticipantsList({ participants, hostUserId }: { participants: Participant[]; hostUserId: string }) {
  return (
    <div className="flex items-center gap-1">
      {participants.slice(0, 5).map((p) => (
        <Tooltip key={p._id}>
          <TooltipTrigger asChild>
            <div
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white relative"
              style={{ borderColor: p.cursorColor, backgroundColor: p.cursorColor }}
            >
              {p.userAvatarUrl ? (
                <img src={p.userAvatarUrl} alt={p.userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                p.userName.charAt(0).toUpperCase()
              )}
              {p.userId === hostUserId && (
                <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{p.userName} {p.userId === hostUserId ? "(Host)" : ""}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {participants.length > 5 && (
        <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center text-xs text-muted-foreground">
          +{participants.length - 5}
        </div>
      )}
    </div>
  );
}

function AiScorePanel({ score, isCalculating }: { score?: AiScore; isCalculating: boolean }) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-yellow-400";
    if (value >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreIcon = (value: number) => {
    if (value >= 80) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (value >= 60) return <TrendingUp className="w-4 h-4 text-yellow-400" />;
    return <AlertCircle className="w-4 h-4 text-orange-400" />;
  };

  if (isCalculating) {
    return (
      <PixelCard className="p-4 w-64">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-primary text-sm font-bold">AI STACK SCORE</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-muted-foreground text-xs">Analyzing...</span>
        </div>
      </PixelCard>
    );
  }

  if (!score) {
    return (
      <PixelCard className="p-4 w-64">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-bold">AI STACK SCORE</span>
        </div>
        <p className="text-muted-foreground text-xs">Add tools to get AI feedback</p>
      </PixelCard>
    );
  }

  return (
    <PixelCard className="p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-bold">AI STACK SCORE</span>
        </div>
        <div className={cn("text-2xl font-bold", getScoreColor(score.overall))}>
          {score.overall}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Completeness</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${score.completeness}%` }}
              />
            </div>
            <span className={getScoreColor(score.completeness)}>{score.completeness}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Coherence</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all"
                style={{ width: `${score.coherence}%` }}
              />
            </div>
            <span className={getScoreColor(score.coherence)}>{score.coherence}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Scalability</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${score.scalability}%` }}
              />
            </div>
            <span className={getScoreColor(score.scalability)}>{score.scalability}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Cost Efficiency</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${score.costEfficiency}%` }}
              />
            </div>
            <span className={getScoreColor(score.costEfficiency)}>{score.costEfficiency}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-2">
        <p className="text-xs text-muted-foreground mb-1">Feedback:</p>
        <ul className="space-y-1">
          {score.feedback.slice(0, 3).map((fb, i) => (
            <li key={i} className="text-xs text-primary flex items-start gap-1">
              {getScoreIcon(score.overall)}
              <span>{fb}</span>
            </li>
          ))}
        </ul>
      </div>
    </PixelCard>
  );
}

function ShareSessionModal({
  shareCode,
  onClose,
}: {
  shareCode: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  const shareUrl = `${siteUrl}/stack-builder/collab/${shareCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <PixelCard className="p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> INVITE COLLABORATORS
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-primary text-xs mb-2">SESSION CODE</p>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-muted rounded-lg text-center">
                <span className="text-2xl font-mono font-bold text-primary tracking-widest">
                  {shareCode}
                </span>
              </div>
              <PixelButton size="sm" onClick={handleCopyCode}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </PixelButton>
            </div>
          </div>

          <div>
            <p className="text-primary text-xs mb-2">SHARE LINK</p>
            <div className="flex gap-2">
              <PixelInput value={shareUrl} readOnly className="flex-1 text-xs" />
              <PixelButton size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </PixelButton>
            </div>
          </div>

          <p className="text-muted-foreground text-xs text-center">
            Share this code or link with your team to collaborate in real-time
          </p>
        </div>
      </PixelCard>
    </div>
  );
}

function ToolPalette({
  onAddNode,
}: {
  onAddNode: (category: string, label: string, description?: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const tools = useQuery(api.tools.list, { limit: 500 });

  const filteredToolsByCategory = useMemo(() => {
    if (!tools) return {};
    
    const filtered = tools.filter((tool) => {
      return searchQuery === "" || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.reduce((acc, tool) => {
      const category = tool.tags?.[0] || "tool";
      if (!acc[category]) acc[category] = [];
      acc[category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);
  }, [tools, searchQuery]);

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

  return (
    <div className="w-64 bg-card border-2 border-border rounded-lg p-3 max-h-[500px] flex flex-col">
      <h3 className="text-primary font-bold text-xs mb-2 flex items-center gap-2">
        <Wrench className="w-3 h-3" />
        TOOL PALETTE
      </h3>

      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <PixelInput
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {Object.entries(filteredToolsByCategory).map(([category, categoryTools]) => {
          const isExpanded = expandedCategories.has(category) || searchQuery !== "";
          const displayTools = isExpanded ? categoryTools : categoryTools.slice(0, 3);

          return (
            <div key={category} className="border border-border/50 rounded p-1.5">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between"
              >
                <span
                  className="text-[10px] font-bold flex items-center gap-1"
                  style={{ color: categoryColors[category] || "#3b82f6" }}
                >
                  {categoryIcons[category] || <Wrench className="w-3 h-3" />}
                  {category} ({categoryTools.length})
                </span>
                <ChevronRight
                  className={cn(
                    "w-3 h-3 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>
              <div className="mt-1 space-y-0.5">
                {displayTools.map((tool) => (
                  <button
                    key={tool._id}
                    onClick={() => onAddNode(category, tool.name, tool.tagline)}
                    className="w-full text-left px-1.5 py-1 rounded text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2 h-2" />
                    <span className="truncate">{tool.name}</span>
                  </button>
                ))}
                {categoryTools.length > 3 && !isExpanded && (
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full text-left px-1.5 py-0.5 text-[9px] text-primary/70 hover:text-primary"
                  >
                    +{categoryTools.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CollaborativeStackBuilderProps {
  sessionId: Id<"stackBuilderSessions">;
  isHost: boolean;
}

export function CollaborativeStackBuilder({ sessionId, isHost }: CollaborativeStackBuilderProps) {
  const { user } = useUser();
  const flowRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  const session = useQuery(api.stackBuilderCollab.getSession, { sessionId });
  const participants = useQuery(api.stackBuilderCollab.getParticipants, { sessionId });

  const updateNodes = useMutation(api.stackBuilderCollab.updateNodes);
  const updateEdges = useMutation(api.stackBuilderCollab.updateEdges);
  const updateCursor = useMutation(api.stackBuilderCollab.updateCursor);
  const heartbeat = useMutation(api.stackBuilderCollab.heartbeat);
  const leaveSession = useMutation(api.stackBuilderCollab.leaveSession);
  const endSession = useMutation(api.stackBuilderCollab.endSession);
  const calculateScore = useAction(api.stackBuilderCollab.calculateStackScore);

  const [nodes, setNodes, onNodesChange] = useNodesState(session?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(session?.edges || []);

  useEffect(() => {
    if (session && Date.now() - lastUpdateRef.current > 500) {
      setNodes(session.nodes as Node<ToolNodeData>[]);
      setEdges(session.edges as Edge[]);
    }
  }, [session, setNodes, setEdges]);

  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      heartbeat({ sessionId, userId: user.id });
    }, 10000);

    return () => clearInterval(interval);
  }, [sessionId, user?.id, heartbeat]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.id) {
        leaveSession({ sessionId, userId: user.id });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId, user?.id, leaveSession]);

  const handleNodesChange = useCallback(
    (changes: unknown[]) => {
      onNodesChange(changes);
      lastUpdateRef.current = Date.now();

      const timeout = setTimeout(() => {
        const currentNodes = nodes.map((n: Node) => ({
          id: n.id,
          type: n.type || "tool",
          position: n.position,
          data: n.data,
        }));
        updateNodes({ sessionId, nodes: currentNodes });
      }, 100);

      return () => clearTimeout(timeout);
    },
    [onNodesChange, nodes, sessionId, updateNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: unknown[]) => {
      onEdgesChange(changes);
      lastUpdateRef.current = Date.now();

      const timeout = setTimeout(() => {
        const currentEdges = edges.map((e: Edge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: typeof e.label === "string" ? e.label : undefined,
          animated: e.animated,
        }));
        updateEdges({ sessionId, edges: currentEdges });
      }, 100);

      return () => clearTimeout(timeout);
    },
    [onEdgesChange, edges, sessionId, updateEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) => {
        const newEdges = addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
            style: { stroke: "#3b82f6", strokeWidth: 2 },
            animated: true,
          },
          eds
        );
        
        lastUpdateRef.current = Date.now();
        const edgeData = newEdges.map((e: Edge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: typeof e.label === "string" ? e.label : undefined,
          animated: e.animated,
        }));
        updateEdges({ sessionId, edges: edgeData });
        
        return newEdges;
      });
    },
    [setEdges, sessionId, updateEdges]
  );

  const handleAddNode = useCallback(
    (category: string, label: string, description?: string) => {
      const newNode: Node<ToolNodeData> = {
        id: `node-${Date.now()}`,
        type: "tool",
        position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label, category, description: description || "" },
      };
      
      setNodes((nds: Node[]) => {
        const newNodes = [...nds, newNode];
        lastUpdateRef.current = Date.now();
        
        const nodeData = newNodes.map((n) => ({
          id: n.id,
          type: n.type || "tool",
          position: n.position,
          data: {
            label: (n.data as ToolNodeData).label,
            category: (n.data as ToolNodeData).category,
            description: (n.data as ToolNodeData).description,
            toolId: (n.data as ToolNodeData).toolId,
          },
        }));
        updateNodes({ sessionId, nodes: nodeData });
        
        return newNodes;
      });
    },
    [setNodes, sessionId, updateNodes]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!user?.id || !flowRef.current) return;

      const rect = flowRef.current.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      updateCursor({ sessionId, userId: user.id, position });
    },
    [sessionId, user?.id, updateCursor]
  );

  const handleCalculateScore = useCallback(async () => {
    setIsCalculatingScore(true);
    try {
      await calculateScore({ sessionId });
    } catch (error) {
      console.error("Error calculating score:", error);
    } finally {
      setIsCalculatingScore(false);
    }
  }, [sessionId, calculateScore]);

  useEffect(() => {
    if (nodes.length > 0) {
      const debounce = setTimeout(() => {
        handleCalculateScore();
      }, 2000);
      return () => clearTimeout(debounce);
    }
  }, [nodes.length, edges.length]);

  const handleExportImage = async () => {
    if (!flowRef.current) return;
    try {
      const dataUrl = await toPng(flowRef.current, {
        backgroundColor: "#0a0f1a",
        quality: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${session?.name || "stack"}-collab.png`;
      a.click();
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };

  const handleLeave = async () => {
    if (!user?.id) return;
    await leaveSession({ sessionId, userId: user.id });
    window.location.href = "/stack-builder";
  };

  const handleEndSession = async () => {
    if (!user?.id || !isHost) return;
    if (confirm("Are you sure you want to end this session for everyone?")) {
      await endSession({ sessionId, userId: user.id });
      window.location.href = "/stack-builder";
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Layers className="w-5 h-5" />
              {session.name}
            </h1>
            <PixelBadge className="text-xs bg-green-500/20 text-green-400">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              LIVE
            </PixelBadge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time collaborative stack building
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ParticipantsList
            participants={(participants || []) as Participant[]}
            hostUserId={session.hostUserId}
          />

          <div className="h-6 w-px bg-border" />

          <PixelButton variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Invite
          </PixelButton>

          <PixelButton variant="outline" size="sm" onClick={handleExportImage}>
            <Image className="w-4 h-4" />
          </PixelButton>

          {isHost ? (
            <PixelButton variant="outline" size="sm" onClick={handleEndSession}>
              <X className="w-4 h-4 mr-1" />
              End
            </PixelButton>
          ) : (
            <PixelButton variant="outline" size="sm" onClick={handleLeave}>
              <LogOut className="w-4 h-4 mr-1" />
              Leave
            </PixelButton>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {showPalette && <ToolPalette onAddNode={handleAddNode} />}

        <div className="flex-1 relative">
          <div
            ref={flowRef}
            className="h-[600px] bg-muted border-2 border-border rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="[&_.react-flow__pane]:bg-muted"
            >
              <Background color="#1e3a5f" gap={20} />
              <Controls className="!bg-card border-border [&_button]:!bg-muted [&_button]:!border-border [&_button]:!text-primary [&_button:hover]:!bg-accent [&_svg]:!fill-primary" />
              
              <Panel position="top-left" className="!m-2">
                <PixelButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPalette(!showPalette)}
                >
                  <Wrench className="w-4 h-4" />
                </PixelButton>
              </Panel>

              <Panel position="top-right" className="!m-2">
                <AiScorePanel score={session.aiScore} isCalculating={isCalculatingScore} />
              </Panel>
            </ReactFlow>

            <AnimatePresence>
              {participants?.map((p) => (
                <RemoteCursor
                  key={p._id}
                  participant={p as Participant}
                  currentUserId={user?.id || ""}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {nodes.length > 0 && (
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="text-sm">Stack Summary</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="flex flex-wrap gap-2">
              {nodes.map((node: Node<ToolNodeData>) => (
                <PixelBadge
                  key={node.id}
                  style={{
                    backgroundColor: `${categoryColors[node.data.category]}20`,
                    color: categoryColors[node.data.category],
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

      {showShareModal && (
        <ShareSessionModal
          shareCode={session.shareCode}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
