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
  Grid3X3, 
  Check,
  X,
  AlertTriangle,
  ThumbsUp,
  FileText,
  ExternalLink,
  Star,
  Lightbulb
} from "lucide-react";

interface CompatibilityMatrixProps {
  toolId: Id<"tools">;
  className?: string;
}

const EXPERIENCE_CONFIG = {
  smooth: { color: "text-green-400 border-green-400", icon: Check, label: "SMOOTH" },
  minor_issues: { color: "text-yellow-400 border-yellow-400", icon: AlertTriangle, label: "MINOR ISSUES" },
  major_issues: { color: "text-orange-400 border-orange-400", icon: AlertTriangle, label: "MAJOR ISSUES" },
  incompatible: { color: "text-red-400 border-red-400", icon: X, label: "INCOMPATIBLE" },
};

export function CompatibilityMatrix({ toolId, className }: CompatibilityMatrixProps) {
  const compatibilities = useQuery(api.compatibility.getToolCompatibilities, { toolId, limit: 20 });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" /> COMPATIBILITY MATRIX
        </h2>
      </div>

      {compatibilities && compatibilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibilities.map((compat: any) => (
            <CompatibilityCard key={compat._id} compatibility={compat} />
          ))}
        </div>
      ) : (
        <PixelCard className="p-8 text-center">
          <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">NO COMPATIBILITY DATA YET</p>
          <p className="text-muted-foreground text-xs">Be the first to report!</p>
        </PixelCard>
      )}
    </div>
  );
}

function CompatibilityCard({ compatibility }: { compatibility: any }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = compatibility.overallScore >= 80 
    ? "text-green-400" 
    : compatibility.overallScore >= 60 
      ? "text-yellow-400" 
      : compatibility.overallScore >= 40 
        ? "text-orange-400" 
        : "text-red-400";

  return (
    <PixelCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/tools/${compatibility.otherTool?.slug}`}>
          <p className="text-primary text-base hover:underline">{compatibility.otherTool?.name}</p>
        </Link>
        <span className={cn("text-lg", scoreColor)}>{compatibility.overallScore}</span>
      </div>

      <div className="h-2 bg-[#0a0f1a] border border-border mb-3">
        <div 
          className={cn("h-full", scoreColor.replace("text-", "bg-"))}
          style={{ width: `${compatibility.overallScore}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <ScoreItem label="Setup" score={compatibility.breakdown.setupEase} />
        <ScoreItem label="Docs" score={compatibility.breakdown.documentation} />
        <ScoreItem label="Community" score={compatibility.breakdown.communitySupport} />
        <ScoreItem label="Performance" score={compatibility.breakdown.performanceTogether} />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <span>{compatibility.reportCount} reports</span>
        {compatibility.integrationGuide && (
          <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400">
            <FileText className="w-2 h-2 mr-1" /> GUIDE
          </PixelBadge>
        )}
        {compatibility.boilerplateUrl && (
          <PixelBadge variant="outline" className="text-[6px] text-blue-400 border-blue-400">
            <ExternalLink className="w-2 h-2 mr-1" /> STARTER
          </PixelBadge>
        )}
      </div>

      <PixelButton size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="w-full">
        {expanded ? "HIDE" : "DETAILS"}
      </PixelButton>

      {expanded && compatibility.integrationGuide && (
        <div className="mt-3 p-3 border border-border bg-[#0a0f1a]">
          <p className="text-primary text-xs mb-2">INTEGRATION GUIDE:</p>
          <p className="text-muted-foreground text-xs">{compatibility.integrationGuide}</p>
          {compatibility.boilerplateUrl && (
            <a 
              href={compatibility.boilerplateUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-muted-foreground text-xs hover:text-primary"
            >
              <ExternalLink className="w-3 h-3" /> View Boilerplate
            </a>
          )}
        </div>
      )}
    </PixelCard>
  );
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center p-1 border border-border">
      <p className="text-primary text-sm">{score}</p>
      <p className="text-muted-foreground text-[6px]">{label}</p>
    </div>
  );
}

interface CompatibilityCheckerProps {
  tool1Id: Id<"tools">;
  tool2Id: Id<"tools">;
}

export function CompatibilityChecker({ tool1Id, tool2Id }: CompatibilityCheckerProps) {
  const compatibility = useQuery(api.compatibility.getCompatibilityScore, { tool1Id, tool2Id });
  const reports = useQuery(api.compatibility.getCompatibilityReports, { tool1Id, tool2Id, limit: 5 });

  if (!compatibility) {
    return (
      <PixelCard className="p-4 text-center">
        <Grid3X3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">NO COMPATIBILITY DATA</p>
        <p className="text-muted-foreground text-xs">Be the first to report!</p>
      </PixelCard>
    );
  }

  const scoreColor = compatibility.overallScore >= 80 
    ? "border-green-400" 
    : compatibility.overallScore >= 60 
      ? "border-yellow-400" 
      : compatibility.overallScore >= 40 
        ? "border-orange-400" 
        : "border-red-400";

  return (
    <div className="space-y-4">
      <PixelCard className={cn("p-4", scoreColor)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-base">{compatibility.tool1?.name}</span>
            <span className="text-muted-foreground">+</span>
            <span className="text-primary text-base">{compatibility.tool2?.name}</span>
          </div>
          <span className={cn("text-2xl", scoreColor.replace("border-", "text-"))}>
            {compatibility.overallScore}%
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <ScoreItem label="Setup" score={compatibility.breakdown.setupEase} />
          <ScoreItem label="Docs" score={compatibility.breakdown.documentation} />
          <ScoreItem label="Community" score={compatibility.breakdown.communitySupport} />
          <ScoreItem label="Performance" score={compatibility.breakdown.performanceTogether} />
        </div>
      </PixelCard>

      {reports && reports.length > 0 && (
        <div>
          <h3 className="text-primary text-sm uppercase mb-3">COMMUNITY REPORTS</h3>
          <div className="space-y-2">
            {reports.map((report: any) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  const upvoteReport = useMutation(api.compatibility.upvoteReport);
  const config = EXPERIENCE_CONFIG[report.experience as keyof typeof EXPERIENCE_CONFIG];
  const ExpIcon = config?.icon || Check;

  return (
    <PixelCard className={cn("p-3", config?.color)}>
      <div className="flex items-center justify-between mb-2">
        <PixelBadge variant="outline" className={cn("text-[6px]", config?.color)}>
          <ExpIcon className="w-3 h-3 mr-1" /> {config?.label}
        </PixelBadge>
        <button 
          onClick={() => upvoteReport({ reportId: report._id })}
          className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary"
        >
          <ThumbsUp className="w-3 h-3" /> {report.upvotes}
        </button>
      </div>

      {report.gotchas.length > 0 && (
        <div className="mb-2">
          <p className="text-orange-400 text-xs mb-1">GOTCHAS:</p>
          <ul className="space-y-1">
            {report.gotchas.map((gotcha: string, i: number) => (
              <li key={i} className="text-muted-foreground text-xs flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0" /> {gotcha}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.tips.length > 0 && (
        <div>
          <p className="text-green-400 text-xs mb-1">TIPS:</p>
          <ul className="space-y-1">
            {report.tips.map((tip: string, i: number) => (
              <li key={i} className="text-muted-foreground text-xs flex items-start gap-1">
                <Lightbulb className="w-3 h-3 text-green-400 flex-shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.projectContext && (
        <p className="text-muted-foreground text-xs mt-2 italic">Context: {report.projectContext}</p>
      )}
    </PixelCard>
  );
}

export function TopCompatiblePairs() {
  const topPairs = useQuery(api.compatibility.getTopCompatiblePairs, { limit: 10 });

  if (!topPairs || topPairs.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
        <Star className="w-4 h-4" /> TOP COMPATIBLE PAIRS
      </h3>
      <div className="space-y-2">
        {topPairs.map((pair: any, i: number) => (
          <div 
            key={pair._id}
            className={cn(
              "flex items-center justify-between p-2 border",
              i === 0 && "border-yellow-400 bg-yellow-400/10",
              i === 1 && "border-gray-400 bg-gray-400/10",
              i === 2 && "border-orange-400 bg-orange-400/10",
              i > 2 && "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">#{i + 1}</span>
              <span className="text-primary text-sm">{pair.tool1?.name}</span>
              <span className="text-muted-foreground">+</span>
              <span className="text-primary text-sm">{pair.tool2?.name}</span>
            </div>
            <span className="text-green-400 text-sm">{pair.overallScore}%</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
