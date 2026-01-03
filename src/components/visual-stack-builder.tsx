"use client";

import { useState, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
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
        className="mt-2 text-[8px]"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {data.category}
      </PixelBadge>
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
            <PixelBadge className="text-[8px]">{blueprint.projectType}</PixelBadge>
            <PixelBadge className="text-[8px]">{blueprint.difficulty}</PixelBadge>
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
  const tools = useQuery(api.tools.list);

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
              className="p-2 rounded text-[10px] transition-colors"
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

export function VisualStackBuilder() {
  const { user } = useUser();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ToolNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showPalette, setShowPalette] = useState(true);
  const [buildTitle, setBuildTitle] = useState("My Stack");

  const blueprints = useQuery(api.stackBuilder.getFeaturedBlueprints, { limit: 6 });
  const createBuild = useMutation(api.stackBuilder.createBuild);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
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
      setNodes((nds) => [...nds, newNode]);
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

    await createBuild({
      userId: user.id,
      title: buildTitle,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || "tool",
        position: n.position,
        data: {
          label: n.data.label,
          category: n.data.category,
          description: n.data.description,
          toolId: n.data.toolId,
        },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === "string" ? e.label : undefined,
        animated: e.animated,
      })),
      isPublic: false,
    });
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setBuildTitle("My Stack");
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
          <input
            type="text"
            value={buildTitle}
            onChange={(e) => setBuildTitle(e.target.value)}
            className="px-3 py-2 bg-[#261933] border-2 border-border rounded-lg text-primary text-sm focus:border-primary outline-none"
            placeholder="Stack name..."
          />
          <PixelButton variant="outline" onClick={() => setShowPalette(!showPalette)}>
            <Wrench className="w-4 h-4" />
          </PixelButton>
          <PixelButton variant="outline" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
          </PixelButton>
          <PixelButton onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </PixelButton>
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

        <div className="flex-1 h-[600px] bg-[#191022] border-2 border-border rounded-lg overflow-hidden">
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
            <Controls className="bg-[#261933] border-border" />
            <Panel position="top-right" className="bg-[#261933] p-2 rounded-lg border border-border">
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
              {nodes.map((node) => (
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
    </div>
  );
}
