"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Network, 
  Link2,
  Swords,
  ArrowRight,
  Lightbulb,
  Puzzle,
  AlertTriangle,
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ToolRelationshipMapProps {
  toolId: Id<"tools">;
  className?: string;
}

const RELATIONSHIP_CONFIG = {
  pairs_with: { color: "text-green-400 border-green-400", icon: Link2, label: "PAIRS WITH" },
  competes_with: { color: "text-red-400 border-red-400", icon: Swords, label: "COMPETES WITH" },
  replaces: { color: "text-orange-400 border-orange-400", icon: ArrowRight, label: "REPLACES" },
  inspired_by: { color: "text-purple-400 border-purple-400", icon: Lightbulb, label: "INSPIRED BY" },
  extends: { color: "text-blue-400 border-blue-400", icon: Puzzle, label: "EXTENDS" },
  requires: { color: "text-yellow-400 border-yellow-400", icon: AlertTriangle, label: "REQUIRES" },
};

export function ToolRelationshipMap({ toolId, className }: ToolRelationshipMapProps) {
  const relationships = useQuery(api.relationships.getToolRelationships, { toolId });
  const migrationPaths = useQuery(api.relationships.getMigrationPaths, { fromToolId: toolId });

  const groupedRelationships = relationships?.reduce((acc: any, r: any) => {
    const type = r.relationshipType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(r);
    return acc;
  }, {});

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Network className="w-4 h-4" /> TOOL RELATIONSHIPS
        </h2>
      </div>

      {groupedRelationships && Object.keys(groupedRelationships).length > 0 ? (
        Object.entries(groupedRelationships).map(([type, rels]: [string, any]) => {
          const config = RELATIONSHIP_CONFIG[type as keyof typeof RELATIONSHIP_CONFIG];
          const RelIcon = config?.icon || Link2;

          return (
            <div key={type}>
              <h3 className={cn("text-sm uppercase mb-3 flex items-center gap-2", config?.color)}>
                <RelIcon className="w-4 h-4" /> {config?.label}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rels.map((rel: any) => (
                  <RelationshipCard key={rel._id} relationship={rel} config={config} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <PixelCard className="p-8 text-center">
          <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">NO RELATIONSHIPS FOUND</p>
        </PixelCard>
      )}

      {migrationPaths && migrationPaths.length > 0 && (
        <div>
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> MIGRATION PATHS
          </h3>
          <div className="space-y-3">
            {migrationPaths.map((path: any) => (
              <MigrationPathCard key={path._id} path={path} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelationshipCard({ relationship, config }: { relationship: any; config: any }) {
  const voteOnRelationship = useMutation(api.relationships.voteOnRelationship);

  return (
    <PixelCard className={cn("p-3", config?.color)}>
      <Link href={`/tools/${relationship.relatedTool?.slug}`}>
        <p className="text-primary text-sm mb-2 hover:underline">
          {relationship.relatedTool?.name}
        </p>
      </Link>
      
      <div className="h-2 bg-[#191022] border border-border mb-2">
        <div 
          className={cn("h-full", config?.color.includes("green") ? "bg-green-400" : "bg-primary")}
          style={{ width: `${relationship.strength}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{relationship.strength}% match</span>
        <button 
          onClick={() => voteOnRelationship({ relationshipId: relationship._id })}
          className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary"
        >
          <ThumbsUp className="w-3 h-3" /> {relationship.communityVotes}
        </button>
      </div>
    </PixelCard>
  );
}

const DIFFICULTY_COLORS = {
  easy: "text-green-400 border-green-400",
  moderate: "text-yellow-400 border-yellow-400",
  hard: "text-orange-400 border-orange-400",
  painful: "text-red-400 border-red-400",
};

function MigrationPathCard({ path }: { path: any }) {
  const [expanded, setExpanded] = useState(false);
  const reportSuccess = useMutation(api.relationships.reportMigrationSuccess);

  const difficultyColor = DIFFICULTY_COLORS[path.difficulty as keyof typeof DIFFICULTY_COLORS];

  return (
    <PixelCard className={cn("p-4", difficultyColor)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <Link href={`/tools/${path.toTool?.slug}`}>
            <span className="text-primary text-base hover:underline">{path.toTool?.name}</span>
          </Link>
        </div>
        <PixelBadge variant="outline" className={cn("text-[6px]", difficultyColor)}>
          {path.difficulty.toUpperCase()}
        </PixelBadge>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> ~{path.estimatedHours}h
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> {path.successRate}% success
        </span>
        <span>{path.reports} reports</span>
      </div>

      <PixelButton size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
        {expanded ? "HIDE DETAILS" : "SHOW DETAILS"}
      </PixelButton>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-primary text-xs mb-2">STEPS:</p>
            <ol className="space-y-1">
              {path.steps.map((step: string, i: number) => (
                <li key={i} className="text-muted-foreground text-xs flex items-start gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>

          {path.gotchas.length > 0 && (
            <div>
              <p className="text-orange-400 text-xs mb-2">GOTCHAS:</p>
              <ul className="space-y-1">
                {path.gotchas.map((gotcha: string, i: number) => (
                  <li key={i} className="text-muted-foreground text-xs flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0" /> {gotcha}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {path.resources.length > 0 && (
            <div>
              <p className="text-primary text-xs mb-2">RESOURCES:</p>
              <div className="flex flex-wrap gap-2">
                {path.resources.map((resource: any, i: number) => (
                  <a 
                    key={i} 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground text-xs underline hover:text-primary"
                  >
                    {resource.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-border">
            <PixelButton 
              size="sm" 
              onClick={() => reportSuccess({ pathId: path._id, wasSuccessful: true })}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> SUCCESS
            </PixelButton>
            <PixelButton 
              size="sm" 
              variant="ghost"
              onClick={() => reportSuccess({ pathId: path._id, wasSuccessful: false })}
            >
              <XCircle className="w-3 h-3 mr-1" /> FAILED
            </PixelButton>
          </div>
        </div>
      )}
    </PixelCard>
  );
}

export function RelationshipGraphWidget({ toolId }: { toolId: Id<"tools"> }) {
  const graph = useQuery(api.relationships.getRelationshipGraph, { centerToolId: toolId, depth: 1 });

  if (!graph || graph.nodes.length <= 1) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
        <Network className="w-4 h-4" /> ECOSYSTEM
      </h3>
      <div className="flex flex-wrap gap-2">
        {graph.nodes.slice(1, 7).map((node: any) => (
          <Link key={node.id} href={`/tools/${node.data?.slug}`}>
            <PixelBadge variant="outline" className="text-xs hover:border-primary">
              {node.data?.name}
            </PixelBadge>
          </Link>
        ))}
        {graph.nodes.length > 7 && (
          <PixelBadge variant="outline" className="text-xs">
            +{graph.nodes.length - 7} more
          </PixelBadge>
        )}
      </div>
    </PixelCard>
  );
}
