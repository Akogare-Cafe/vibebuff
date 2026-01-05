"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
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
  style?: Record<string, unknown>;
};

type Connection = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

import "@xyflow/react/dist/style.css";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import {
  Layers,
  Plus,
  Save,
  Download,
  Wrench,
  Database,
  Globe,
  Server,
  Code,
  Cloud,
  Cpu,
  X,
  FileJson,
  Image as ImageIcon,
  Edit3,
  Lock,
  Zap,
  HardDrive,
  CreditCard,
  Mail,
  Search,
  BarChart3,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ReactNode> = {
  ide: <Code className="w-4 h-4" />,
  ai: <Cpu className="w-4 h-4" />,
  frontend: <Globe className="w-4 h-4" />,
  backend: <Server className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  deployment: <Cloud className="w-4 h-4" />,
  tool: <Wrench className="w-4 h-4" />,
  authentication: <Lock className="w-4 h-4" />,
  auth: <Lock className="w-4 h-4" />,
  realtime: <Zap className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
  payments: <CreditCard className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  search: <Search className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  cms: <FileEdit className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  ide: "#22c55e",
  ai: "#a855f7",
  frontend: "#ec4899",
  backend: "#f59e0b",
  database: "#6366f1",
  deployment: "#14b8a6",
  tool: "#3b82f6",
  authentication: "#ef4444",
  auth: "#ef4444",
  realtime: "#eab308",
  storage: "#06b6d4",
  payments: "#10b981",
  email: "#f97316",
  search: "#8b5cf6",
  analytics: "#3b82f6",
  cms: "#84cc16",
};

interface ToolNodeData {
  label: string;
  toolId?: string;
  category: string;
  description?: string;
  confidence?: number;
  slug?: string;
}

function ToolNode({ data }: { data: ToolNodeData }) {
  const categoryKey = data.category.toLowerCase().replace(/[^a-z]/g, "");
  const color = categoryColors[categoryKey] || "#3b82f6";
  const icon = categoryIcons[categoryKey] || <Wrench className="w-4 h-4" />;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-[#111827]"
      />
      <div
        className="px-4 py-3 rounded-lg border-2 min-w-[150px] bg-[#111827]"
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
          <p className="text-muted-foreground text-xs line-clamp-2">{data.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <PixelBadge
            className="text-xs"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {data.category}
          </PixelBadge>
          {data.confidence && (
            <span className="text-xs text-muted-foreground">{data.confidence}%</span>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-[#111827]"
      />
    </div>
  );
}

const nodeTypes = {
  tool: ToolNode,
};

interface LoadoutRecommendation {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  reasoning: string;
  confidence: number;
}

interface LoadoutStackVisualProps {
  recommendations: Record<string, LoadoutRecommendation[]>;
  projectType: string;
  scale: string;
  budget: string;
  estimatedCost?: string;
  onSave?: (nodes: Node<ToolNodeData>[], edges: Edge[], title: string) => void;
  className?: string;
}

export function LoadoutStackVisual({
  recommendations,
  projectType,
  scale,
  budget,
  estimatedCost,
  onSave,
  className,
}: LoadoutStackVisualProps) {
  const { user } = useUser();
  const flowRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stackTitle, setStackTitle] = useState(`${projectType} Stack`);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const tools = useQuery(api.tools.list, { limit: 100 });
  const createBuild = useMutation(api.stackBuilder.createBuild);

  const initialNodesAndEdges = useMemo(() => {
    const nodes: Node<ToolNodeData>[] = [];
    const edges: Edge[] = [];
    
    const categories = Object.keys(recommendations);
    const columnWidth = 220;
    const startX = 50;
    const startY = 50;
    
    let nodeIndex = 0;
    const categoryNodeMap: Record<string, string[]> = {};
    
    categories.forEach((category, colIndex) => {
      const categoryTools = recommendations[category];
      categoryNodeMap[category] = [];
      
      const topTool = categoryTools[0];
      if (topTool) {
        const nodeId = `node-${nodeIndex}`;
        nodes.push({
          id: nodeId,
          type: "tool",
          position: {
            x: startX + colIndex * columnWidth,
            y: startY,
          },
          data: {
            label: topTool.name,
            toolId: topTool.id,
            category: category,
            description: topTool.tagline,
            confidence: topTool.confidence,
            slug: topTool.slug,
          },
        });
        categoryNodeMap[category].push(nodeId);
        nodeIndex++;
      }
    });

    const categoryOrder = ["Frontend", "Backend", "Database", "Deployment", "Authentication", "AI"];
    const orderedCategories = categories.sort((a, b) => {
      const aIndex = categoryOrder.findIndex(c => a.toLowerCase().includes(c.toLowerCase()));
      const bIndex = categoryOrder.findIndex(c => b.toLowerCase().includes(c.toLowerCase()));
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    for (let i = 0; i < orderedCategories.length - 1; i++) {
      const currentCat = orderedCategories[i];
      const nextCat = orderedCategories[i + 1];
      const currentNodes = categoryNodeMap[currentCat];
      const nextNodes = categoryNodeMap[nextCat];
      
      if (currentNodes?.length > 0 && nextNodes?.length > 0) {
        edges.push({
          id: `edge-${currentNodes[0]}-${nextNodes[0]}`,
          source: currentNodes[0],
          target: nextNodes[0],
          animated: true,
          style: { stroke: "#3b82f6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }
    }

    return { nodes, edges };
  }, [recommendations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges);

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
      setNodes((nds: Node<ToolNodeData>[]) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds: Node<ToolNodeData>[]) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds: Edge[]) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const handleSaveStack = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const nodeData = nodes.map((n: Node<ToolNodeData>) => ({
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

      await createBuild({
        userId: user.id,
        title: stackTitle,
        description: `Generated for ${projectType} project at ${scale} scale with ${budget} budget`,
        nodes: nodeData,
        edges: edgeData,
        isPublic: false,
      });

      setSaveMessage("Stack saved!");
      if (onSave) {
        onSave(nodes, edges, stackTitle);
      }
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving stack:", error);
      setSaveMessage("Error saving stack");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      title: stackTitle,
      projectType,
      scale,
      budget,
      estimatedCost,
      nodes: nodes.map((n: Node<ToolNodeData>) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e: Edge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
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
    a.download = `${stackTitle.replace(/\s+/g, "-").toLowerCase()}-stack.json`;
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
      a.download = `${stackTitle.replace(/\s+/g, "-").toLowerCase()}-stack.png`;
      a.click();
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };

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
    <div className={cn("space-y-4", className)}>
      <PixelCard>
        <PixelCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              {isEditing ? (
                <input
                  type="text"
                  value={stackTitle}
                  onChange={(e) => setStackTitle(e.target.value)}
                  className="px-2 py-1 bg-[#111827] border-2 border-border rounded text-primary text-sm focus:border-primary outline-none"
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                />
              ) : (
                <PixelCardTitle className="flex items-center gap-2">
                  {stackTitle}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </PixelCardTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <PixelButton variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </PixelButton>
                <div className="absolute right-0 top-full mt-1 bg-[#111827] border-2 border-border rounded-lg p-2 hidden group-hover:block z-10 min-w-[120px]">
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
                    <ImageIcon className="w-3 h-3" /> PNG
                  </button>
                </div>
              </div>
              {user && (
                <PixelButton size="sm" onClick={handleSaveStack} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </PixelButton>
              )}
              {saveMessage && (
                <span
                  className={cn(
                    "text-xs",
                    saveMessage.includes("Error") ? "text-red-400" : "text-green-400"
                  )}
                >
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="flex gap-4">
            <div className="w-48 bg-[#0a0f1a] border-2 border-border rounded-lg p-3 max-h-[400px] overflow-y-auto shrink-0">
              <h4 className="text-primary font-bold text-xs mb-3 flex items-center gap-2">
                <Plus className="w-3 h-3" />
                ADD TOOLS
              </h4>
              <div className="space-y-3">
                {Object.entries(toolsByCategory).slice(0, 6).map(([category, categoryTools]) => (
                  <div key={category}>
                    <h5
                      className="text-xs font-bold mb-1 flex items-center gap-1"
                      style={{ color: categoryColors[category] || "#3b82f6" }}
                    >
                      {categoryIcons[category] || <Wrench className="w-3 h-3" />}
                      {category}
                    </h5>
                    <div className="space-y-1">
                      {categoryTools.slice(0, 3).map((tool) => (
                        <button
                          key={tool._id}
                          onClick={() => handleAddNode(category, tool.name, tool.tagline)}
                          className="w-full text-left px-2 py-1 rounded text-xs text-muted-foreground hover:bg-card hover:text-primary transition-colors truncate"
                        >
                          {tool.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={flowRef}
              className="flex-1 h-[400px] bg-[#0a0f1a] border-2 border-border rounded-lg overflow-hidden"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0a0f1a]"
              >
                <Background color="#1e293b" gap={20} />
                <Controls className="bg-[#111827] border-border [&_button]:!bg-[#1e293b] [&_button]:!border-border [&_button]:!text-primary [&_button:hover]:!bg-[#334155] [&_svg]:!fill-primary" />
                <Panel
                  position="top-right"
                  className="bg-[#111827] p-2 rounded-lg border border-border"
                >
                  <div className="text-muted-foreground text-xs">
                    <p>Drag to move nodes</p>
                    <p>Connect by dragging edges</p>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </div>

          {nodes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-primary text-xs font-bold mb-2">STACK SUMMARY</h4>
              <div className="flex flex-wrap gap-2">
                {nodes.map((node: Node<ToolNodeData>) => {
                  const categoryKey = node.data.category.toLowerCase().replace(/[^a-z]/g, "");
                  return (
                    <div key={node.id} className="flex items-center gap-1">
                      <PixelBadge
                        style={{
                          backgroundColor: `${categoryColors[categoryKey] || "#3b82f6"}20`,
                          color: categoryColors[categoryKey] || "#3b82f6",
                        }}
                      >
                        {node.data.label}
                      </PixelBadge>
                      <button
                        onClick={() => handleDeleteNode(node.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                {nodes.length} tools connected with {edges.length} relationships
              </p>
            </div>
          )}
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
