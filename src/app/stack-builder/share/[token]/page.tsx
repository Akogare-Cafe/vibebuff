"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import {
  Layers,
  ArrowLeft,
  Globe,
  Server,
  Database,
  Cloud,
  Code,
  Cpu,
  Wrench,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const xyflow = require("@xyflow/react");
const { ReactFlow, Controls, Background } = xyflow;
import "@xyflow/react/dist/style.css";

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
  category: string;
  description?: string;
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
        className="mt-2 text-xs"
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

export default function SharedStackPage() {
  const params = useParams();
  const token = params.token as string;

  const build = useQuery(api.stackBuilder.getBuildByShareToken, {
    shareToken: token,
  });

  if (build === undefined) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading stack...</p>
          </div>
        </div>
      </main>
    );
  }

  if (build === null) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <PixelCard className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h1 className="text-primary text-lg font-bold mb-2">
              Stack Not Found
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              This stack may have been deleted or made private.
            </p>
            <Link href="/stack-builder">
              <PixelButton>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Stack Builder
              </PixelButton>
            </Link>
          </PixelCard>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <Link
              href="/stack-builder"
              className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stack Builder
            </Link>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Layers className="w-6 h-6" />
              {build.title}
            </h1>
            {build.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {build.description}
              </p>
            )}
          </div>

          <Link href="/stack-builder">
            <PixelButton>
              <Layers className="w-4 h-4 mr-2" />
              Create Your Own
            </PixelButton>
          </Link>
        </div>

        <div className="h-[500px] bg-[#191022] border-2 border-border rounded-lg overflow-hidden">
          <ReactFlow
            nodes={build.nodes}
            edges={build.edges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            className="bg-[#191022]"
          >
            <Background color="#362348" gap={20} />
            <Controls className="bg-[#261933] border-border" />
          </ReactFlow>
        </div>

        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle>Stack Summary</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="flex flex-wrap gap-2">
              {build.nodes.map((node: { id: string; data: ToolNodeData }) => (
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
              {build.nodes.length} tools connected with {build.edges.length}{" "}
              relationships
            </p>
          </PixelCardContent>
        </PixelCard>
      </div>
    </main>
  );
}
