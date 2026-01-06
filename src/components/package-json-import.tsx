"use client";

import { useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useAction } from "convex/react";
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
import {
  Upload,
  FileJson,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  Cpu,
  Globe,
  Database,
  Server,
  Wrench,
  Code,
  Cloud,
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
  unknown: <Package className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  ide: "#22c55e",
  ai: "#3b82f6",
  frontend: "#ef4444",
  backend: "#f59e0b",
  database: "#6366f1",
  deployment: "#14b8a6",
  tool: "#3b82f6",
  unknown: "#6b7280",
};

interface MatchedTool {
  packageName: string;
  toolId?: string;
  toolName: string;
  toolSlug: string;
  category: string;
  confidence: number;
  tagline: string;
}

interface ImportResult {
  detectedPackages: Array<{ name: string; version: string; isDev: boolean }>;
  matchedTools: MatchedTool[];
  unmatchedPackages: string[];
  aiAnalysis: string;
  suggestedStackName: string;
}

interface PackageJsonImportProps {
  onImportComplete?: (tools: Array<{ name: string; category: string; tagline: string }>) => void;
  onClose?: () => void;
}

export function PackageJsonImport({ onImportComplete, onClose }: PackageJsonImportProps) {
  const { user } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobId, setJobId] = useState<Id<"packageImportJobs"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createImportJob = useMutation(api.packageImport.createImportJob);
  const analyzePackageJson = useAction(api.packageImport.analyzePackageJson);
  const importJob = useQuery(
    api.packageImport.getImportJob,
    jobId ? { jobId } : "skip"
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!user?.id) {
      setError("Please sign in to import your package.json");
      return;
    }

    if (file.name !== "package.json") {
      setError("Please upload a package.json file");
      return;
    }

    try {
      const content = await file.text();
      JSON.parse(content);
      
      setFileContent(content);
      setFileName(file.name);
      setError(null);

      const newJobId = await createImportJob({
        userId: user.id,
        packageJsonContent: content,
      });
      setJobId(newJobId);

      await analyzePackageJson({
        jobId: newJobId,
        packageJsonContent: content,
      });
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format in package.json");
      } else {
        setError("Failed to process file. Please try again.");
      }
    }
  }, [user?.id, createImportJob, analyzePackageJson]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleBuildStack = useCallback(() => {
    if (importJob?.result?.matchedTools && onImportComplete) {
      const tools = importJob.result.matchedTools.map((tool) => ({
        name: tool.toolName,
        category: tool.category.toLowerCase(),
        tagline: tool.tagline,
      }));
      onImportComplete(tools);
    }
  }, [importJob, onImportComplete]);

  const handleReset = useCallback(() => {
    setFileContent(null);
    setFileName(null);
    setJobId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const isProcessing = importJob?.status === "pending" || importJob?.status === "processing";
  const isCompleted = importJob?.status === "completed";
  const isFailed = importJob?.status === "failed";

  return (
    <PixelCard className="w-full max-w-2xl mx-auto">
      <PixelCardHeader className="flex flex-row items-center justify-between">
        <PixelCardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          IMPORT PACKAGE.JSON
        </PixelCardTitle>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </PixelCardHeader>
      <PixelCardContent className="space-y-4">
        {!fileContent && !isProcessing && !isCompleted && (
          <>
            <p className="text-muted-foreground text-sm">
              Upload your package.json to automatically detect your tech stack and build a visual representation.
            </p>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-card"
              )}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-primary font-bold mb-2">
                DROP PACKAGE.JSON HERE
              </p>
              <p className="text-muted-foreground text-sm">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-primary font-bold mb-2">ANALYZING STACK...</p>
            <p className="text-muted-foreground text-sm">
              AI is detecting tools from your dependencies
            </p>
          </div>
        )}

        {isFailed && (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-400 font-bold mb-2">ANALYSIS FAILED</p>
            <p className="text-muted-foreground text-sm mb-4">
              {importJob?.error || "An error occurred during analysis"}
            </p>
            <PixelButton variant="outline" onClick={handleReset}>
              TRY AGAIN
            </PixelButton>
          </div>
        )}

        {isCompleted && importJob?.result && (
          <ImportResults
            result={importJob.result as ImportResult}
            suggestedName={importJob.result.suggestedStackName}
            onBuildStack={handleBuildStack}
            onReset={handleReset}
          />
        )}
      </PixelCardContent>
    </PixelCard>
  );
}

function ImportResults({
  result,
  suggestedName,
  onBuildStack,
  onReset,
}: {
  result: ImportResult;
  suggestedName: string;
  onBuildStack: () => void;
  onReset: () => void;
}) {
  const groupedTools = result.matchedTools.reduce((acc, tool) => {
    const cat = tool.category.toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, MatchedTool[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div>
          <p className="text-green-400 font-bold text-sm">ANALYSIS COMPLETE</p>
          <p className="text-muted-foreground text-xs">
            Found {result.matchedTools.length} tools from {result.detectedPackages.length} packages
          </p>
        </div>
      </div>

      {result.aiAnalysis && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-xs font-bold">AI ANALYSIS</span>
          </div>
          <p className="text-muted-foreground text-sm">{result.aiAnalysis}</p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-primary text-sm font-bold flex items-center gap-2">
          <Package className="w-4 h-4" />
          DETECTED TOOLS ({result.matchedTools.length})
        </h4>
        
        {Object.entries(groupedTools).map(([category, tools]) => (
          <div key={category} className="space-y-2">
            <div
              className="flex items-center gap-2 text-xs font-bold"
              style={{ color: categoryColors[category] || categoryColors.unknown }}
            >
              {categoryIcons[category] || categoryIcons.unknown}
              {category.toUpperCase()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tools.map((tool) => (
                <div
                  key={tool.packageName}
                  className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${categoryColors[category] || categoryColors.unknown}20` }}
                  >
                    {categoryIcons[category] || categoryIcons.unknown}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary text-sm font-bold truncate">
                      {tool.toolName}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {tool.packageName}
                    </p>
                  </div>
                  <PixelBadge
                    className="text-[8px] shrink-0"
                    style={{
                      backgroundColor: `${categoryColors[category] || categoryColors.unknown}20`,
                      color: categoryColors[category] || categoryColors.unknown,
                    }}
                  >
                    {tool.confidence}%
                  </PixelBadge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result.unmatchedPackages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-muted-foreground text-xs font-bold">
            UNMATCHED PACKAGES ({result.unmatchedPackages.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {result.unmatchedPackages.slice(0, 20).map((pkg) => (
              <PixelBadge key={pkg} variant="outline" className="text-[8px]">
                {pkg}
              </PixelBadge>
            ))}
            {result.unmatchedPackages.length > 20 && (
              <PixelBadge variant="outline" className="text-[8px]">
                +{result.unmatchedPackages.length - 20} more
              </PixelBadge>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-border">
        <PixelButton onClick={onBuildStack} className="flex-1">
          <Sparkles className="w-4 h-4 mr-2" />
          BUILD STACK: {suggestedName.toUpperCase()}
        </PixelButton>
        <PixelButton variant="outline" onClick={onReset}>
          RESET
        </PixelButton>
      </div>
    </div>
  );
}

export function PackageJsonImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (tools: Array<{ name: string; category: string; tagline: string }>) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <PackageJsonImport
        onClose={onClose}
        onImportComplete={(tools) => {
          onImportComplete(tools);
          onClose();
        }}
      />
    </div>
  );
}
