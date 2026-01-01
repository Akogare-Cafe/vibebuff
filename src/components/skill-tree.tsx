"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Lock, 
  ChevronRight,
  Zap,
  Atom,
  Layers,
  Palette,
  Wrench,
  Database,
  KeyRound,
  Cloud,
  Bot,
  Monitor
} from "lucide-react";

interface SkillTreeProps {
  selectedToolIds: Id<"tools">[];
  onSelectCategory?: (categorySlug: string) => void;
  className?: string;
}

// Define the skill tree structure
const SKILL_TREE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  frontend: Atom,
  "meta-frameworks": Layers,
  styling: Palette,
  backend: Wrench,
  databases: Database,
  auth: KeyRound,
  hosting: Cloud,
  realtime: Zap,
  "ai-assistants": Bot,
  ides: Monitor,
};

const SKILL_TREE_STRUCTURE = [
  {
    id: "frontend",
    name: "Frontend",
    x: 50,
    y: 10,
    children: ["meta-frameworks", "styling"],
  },
  {
    id: "meta-frameworks",
    name: "Meta-Framework",
    x: 30,
    y: 25,
    children: ["backend"],
    requires: ["frontend"],
  },
  {
    id: "styling",
    name: "Styling",
    x: 70,
    y: 25,
    children: [],
    requires: ["frontend"],
  },
  {
    id: "backend",
    name: "Backend",
    x: 30,
    y: 45,
    children: ["databases", "auth"],
    requires: ["meta-frameworks"],
  },
  {
    id: "databases",
    name: "Database",
    x: 20,
    y: 65,
    children: ["hosting"],
    requires: ["backend"],
  },
  {
    id: "auth",
    name: "Auth",
    x: 50,
    y: 65,
    children: ["hosting"],
    requires: ["backend"],
  },
  {
    id: "hosting",
    name: "Hosting",
    x: 35,
    y: 85,
    children: [],
    requires: ["databases", "auth"],
  },
  {
    id: "realtime",
    name: "Realtime",
    x: 70,
    y: 45,
    children: [],
    requires: ["backend"],
  },
  {
    id: "ai-assistants",
    name: "AI Tools",
    x: 85,
    y: 65,
    children: [],
    requires: [],
  },
  {
    id: "ides",
    name: "IDE",
    x: 85,
    y: 85,
    children: [],
    requires: [],
  },
];

export function SkillTree({ selectedToolIds, onSelectCategory, className }: SkillTreeProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const categories = useQuery(api.categories.list);
  const allTools = useQuery(api.tools.list, { limit: 200 });

  if (!categories || !allTools) {
    return (
      <div className="text-center p-8">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING SKILL TREE...</div>
      </div>
    );
  }

  // Map selected tools to their categories
  const selectedCategories = new Set<string>();
  selectedToolIds.forEach((toolId) => {
    const tool = allTools.find((t) => t._id === toolId);
    if (tool) {
      const category = categories.find((c) => c._id === tool.categoryId);
      if (category) {
        selectedCategories.add(category.slug);
      }
    }
  });

  // Check if a node is unlocked (all requirements met)
  const isNodeUnlocked = (nodeId: string): boolean => {
    const node = SKILL_TREE_STRUCTURE.find((n) => n.id === nodeId);
    if (!node || !node.requires || node.requires.length === 0) return true;
    return node.requires.some((req) => selectedCategories.has(req));
  };

  // Check if a node is completed (has a tool selected)
  const isNodeCompleted = (nodeId: string): boolean => {
    return selectedCategories.has(nodeId);
  };

  return (
    <PixelCard className={cn("p-6 relative", className)}>
      <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
        <Zap className="w-4 h-4" /> SKILL TREE
      </h2>

      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <PixelBadge variant="default">
          {selectedCategories.size} / {SKILL_TREE_STRUCTURE.length} UNLOCKED
        </PixelBadge>
        <div className="h-2 flex-1 mx-4 bg-[#0a1628] border border-[#1e3a5f]">
          <div 
            className="h-full bg-[#3b82f6] transition-all duration-500"
            style={{ width: `${(selectedCategories.size / SKILL_TREE_STRUCTURE.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="relative h-[500px] border-2 border-[#1e3a5f] bg-[#0a1628]/50">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {SKILL_TREE_STRUCTURE.map((node) =>
            node.children.map((childId) => {
              const child = SKILL_TREE_STRUCTURE.find((n) => n.id === childId);
              if (!child) return null;
              
              const isActive = isNodeCompleted(node.id) || isNodeCompleted(childId);
              
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={`${node.x}%`}
                  y1={`${node.y + 3}%`}
                  x2={`${child.x}%`}
                  y2={`${child.y - 3}%`}
                  stroke={isActive ? "#3b82f6" : "#1e3a5f"}
                  strokeWidth="2"
                  strokeDasharray={isActive ? "0" : "4"}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {SKILL_TREE_STRUCTURE.map((node) => {
          const unlocked = isNodeUnlocked(node.id);
          const completed = isNodeCompleted(node.id);
          const isHovered = hoveredNode === node.id;

          return (
            <button
              key={node.id}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
                "w-16 h-16 flex flex-col items-center justify-center",
                "border-4 bg-[#0a1628]",
                completed && "border-[#3b82f6] bg-[#3b82f6]/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                unlocked && !completed && "border-[#1e3a5f] hover:border-[#3b82f6]",
                !unlocked && "border-[#1e3a5f]/50 opacity-50 cursor-not-allowed",
                isHovered && "scale-110 z-10"
              )}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => unlocked && onSelectCategory?.(node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              disabled={!unlocked}
            >
              {(() => {
                const NodeIcon = SKILL_TREE_ICONS[node.id] || Zap;
                return <NodeIcon className="w-6 h-6 text-[#60a5fa]" />;
              })()}
              {completed && (
                <Check className="absolute -top-1 -right-1 w-4 h-4 text-[#60a5fa] bg-[#0a1628] rounded-full" />
              )}
              {!unlocked && (
                <Lock className="absolute -top-1 -right-1 w-4 h-4 text-[#1e3a5f]" />
              )}
            </button>
          );
        })}

        {/* Tooltip */}
        {hoveredNode && (
          <div 
            className="absolute z-20 bg-[#0a1628] border-2 border-[#3b82f6] p-3 pointer-events-none"
            style={{
              left: `${SKILL_TREE_STRUCTURE.find((n) => n.id === hoveredNode)?.x}%`,
              top: `${(SKILL_TREE_STRUCTURE.find((n) => n.id === hoveredNode)?.y || 0) + 10}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[#60a5fa] text-[10px] font-bold">
              {SKILL_TREE_STRUCTURE.find((n) => n.id === hoveredNode)?.name}
            </p>
            <p className="text-[#3b82f6] text-[8px]">
              {isNodeCompleted(hoveredNode) ? "Completed" : 
               isNodeUnlocked(hoveredNode) ? "Click to select" : "Locked"}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#3b82f6] bg-[#3b82f6]/20" />
          <span className="text-[#3b82f6] text-[8px]">COMPLETED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#1e3a5f]" />
          <span className="text-[#3b82f6] text-[8px]">AVAILABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#1e3a5f]/50 opacity-50" />
          <span className="text-[#3b82f6] text-[8px]">LOCKED</span>
        </div>
      </div>
    </PixelCard>
  );
}
