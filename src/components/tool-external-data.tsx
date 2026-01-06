"use client";

import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { PixelButton } from "./pixel-button";
import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  Scale,
  Code,
  Calendar,
  Clock,
  Package,
  Download,
  Users,
  Tag,
  FileCode,
  Layers,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  GitBranch,
  Archive,
  BookOpen,
  Box,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalData {
  github?: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    license?: string;
    language?: string;
    topics?: string[];
    createdAt?: string;
    updatedAt?: string;
    pushedAt?: string;
    description?: string;
    homepage?: string;
    size?: number;
    defaultBranch?: string;
    hasWiki?: boolean;
    hasIssues?: boolean;
    archived?: boolean;
    contributors?: number;
    commits?: number;
    releases?: number;
    latestRelease?: {
      tagName: string;
      name?: string;
      publishedAt?: string;
    };
  };
  npm?: {
    downloadsWeekly: number;
    downloadsMonthly?: number;
    downloadsYearly?: number;
    version?: string;
    license?: string;
    dependencies?: number;
    devDependencies?: number;
    maintainers?: number;
    lastPublished?: string;
    firstPublished?: string;
    types?: boolean;
    unpackedSize?: number;
    keywords?: string[];
  };
  bundlephobia?: {
    size: number;
    gzip: number;
    dependencyCount?: number;
    hasJSModule?: boolean;
    hasJSNext?: boolean;
    hasSideEffects?: boolean;
  };
  lastFetched: number;
}

interface ToolExternalDataProps {
  externalData?: ExternalData;
  githubUrl?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ToolExternalData({
  externalData,
  githubUrl,
  onRefresh,
  isRefreshing,
  className,
}: ToolExternalDataProps) {
  if (!externalData) {
    return (
      <PixelCard className={className}>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> LIVE DATA
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="text-center py-6">
            <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm mb-4">No external data available yet</p>
            {onRefresh && (
              <PixelButton onClick={onRefresh} disabled={isRefreshing} size="sm">
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                {isRefreshing ? "FETCHING..." : "FETCH DATA"}
              </PixelButton>
            )}
          </div>
        </PixelCardContent>
      </PixelCard>
    );
  }

  const { github, npm, bundlephobia, lastFetched } = externalData;

  return (
    <div className={cn("space-y-6", className)}>
      {github && (
        <PixelCard>
          <PixelCardHeader>
            <div className="flex items-center justify-between">
              <PixelCardTitle className="flex items-center gap-2">
                <Code className="w-4 h-4" /> GITHUB STATS
              </PixelCardTitle>
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <PixelBadge variant="outline" className="text-xs flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> VIEW
                  </PixelBadge>
                </a>
              )}
            </div>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <p className="text-primary text-lg font-mono">{formatNumber(github.stars)}</p>
                <p className="text-muted-foreground text-[10px]">STARS</p>
              </div>
              <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                <GitFork className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <p className="text-primary text-lg font-mono">{formatNumber(github.forks)}</p>
                <p className="text-muted-foreground text-[10px]">FORKS</p>
              </div>
              <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                <Eye className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-primary text-lg font-mono">{formatNumber(github.watchers)}</p>
                <p className="text-muted-foreground text-[10px]">WATCHERS</p>
              </div>
              <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <p className="text-primary text-lg font-mono">{formatNumber(github.openIssues)}</p>
                <p className="text-muted-foreground text-[10px]">ISSUES</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {github.contributors && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm font-mono">{formatNumber(github.contributors)}</p>
                    <p className="text-muted-foreground text-[10px]">CONTRIBUTORS</p>
                  </div>
                </div>
              )}
              {github.releases && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm font-mono">{github.releases}</p>
                    <p className="text-muted-foreground text-[10px]">RELEASES</p>
                  </div>
                </div>
              )}
              {github.language && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm">{github.language}</p>
                    <p className="text-muted-foreground text-[10px]">LANGUAGE</p>
                  </div>
                </div>
              )}
              {github.license && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm">{github.license}</p>
                    <p className="text-muted-foreground text-[10px]">LICENSE</p>
                  </div>
                </div>
              )}
              {github.defaultBranch && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm">{github.defaultBranch}</p>
                    <p className="text-muted-foreground text-[10px]">BRANCH</p>
                  </div>
                </div>
              )}
              {github.size && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Box className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm">{formatBytes(github.size * 1024)}</p>
                    <p className="text-muted-foreground text-[10px]">REPO SIZE</p>
                  </div>
                </div>
              )}
            </div>

            {github.latestRelease && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-mono">{github.latestRelease.tagName}</span>
                  {github.latestRelease.publishedAt && (
                    <span className="text-muted-foreground text-xs">
                      {timeAgo(github.latestRelease.publishedAt)}
                    </span>
                  )}
                </div>
                {github.latestRelease.name && (
                  <p className="text-muted-foreground text-xs">{github.latestRelease.name}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {github.archived && (
                <PixelBadge variant="outline" className="text-xs flex items-center gap-1 text-red-400 border-red-400">
                  <Archive className="w-3 h-3" /> ARCHIVED
                </PixelBadge>
              )}
              {github.hasWiki && (
                <PixelBadge variant="outline" className="text-xs flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> WIKI
                </PixelBadge>
              )}
              {github.hasIssues && (
                <PixelBadge variant="outline" className="text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> ISSUES
                </PixelBadge>
              )}
            </div>

            {github.topics && github.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {github.topics.slice(0, 10).map((topic) => (
                  <PixelBadge key={topic} variant="secondary" className="text-[10px]">
                    {topic}
                  </PixelBadge>
                ))}
                {github.topics.length > 10 && (
                  <PixelBadge variant="outline" className="text-[10px]">
                    +{github.topics.length - 10} more
                  </PixelBadge>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
              {github.createdAt && (
                <div>
                  <p className="text-muted-foreground text-[10px]">CREATED</p>
                  <p className="text-primary text-xs">{formatDate(github.createdAt)}</p>
                </div>
              )}
              {github.updatedAt && (
                <div>
                  <p className="text-muted-foreground text-[10px]">UPDATED</p>
                  <p className="text-primary text-xs">{timeAgo(github.updatedAt)}</p>
                </div>
              )}
              {github.pushedAt && (
                <div>
                  <p className="text-muted-foreground text-[10px]">LAST PUSH</p>
                  <p className="text-primary text-xs">{timeAgo(github.pushedAt)}</p>
                </div>
              )}
            </div>
          </PixelCardContent>
        </PixelCard>
      )}

      {npm && (
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" /> NPM STATS
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                <Download className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-primary text-lg font-mono">{formatNumber(npm.downloadsWeekly)}</p>
                <p className="text-muted-foreground text-[10px]">WEEKLY</p>
              </div>
              {npm.downloadsMonthly && (
                <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                  <Download className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                  <p className="text-primary text-lg font-mono">{formatNumber(npm.downloadsMonthly)}</p>
                  <p className="text-muted-foreground text-[10px]">MONTHLY</p>
                </div>
              )}
              {npm.downloadsYearly && (
                <div className="text-center p-3 bg-[#0a0f1a] border border-border">
                  <Download className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                  <p className="text-primary text-lg font-mono">{formatNumber(npm.downloadsYearly)}</p>
                  <p className="text-muted-foreground text-[10px]">YEARLY</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {npm.version && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm font-mono">v{npm.version}</p>
                    <p className="text-muted-foreground text-[10px]">VERSION</p>
                  </div>
                </div>
              )}
              {npm.license && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm">{npm.license}</p>
                    <p className="text-muted-foreground text-[10px]">LICENSE</p>
                  </div>
                </div>
              )}
              {npm.maintainers && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm font-mono">{npm.maintainers}</p>
                    <p className="text-muted-foreground text-[10px]">MAINTAINERS</p>
                  </div>
                </div>
              )}
              {npm.dependencies !== undefined && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm font-mono">{npm.dependencies}</p>
                    <p className="text-muted-foreground text-[10px]">DEPS</p>
                  </div>
                </div>
              )}
              {npm.unpackedSize && (
                <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                  <Box className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-primary text-sm">{formatBytes(npm.unpackedSize)}</p>
                    <p className="text-muted-foreground text-[10px]">UNPACKED</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-2 bg-[#0a0f1a] border border-border">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  {npm.types ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <p className="text-muted-foreground text-[10px]">TYPES</p>
                </div>
              </div>
            </div>

            {npm.keywords && npm.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {npm.keywords.slice(0, 8).map((keyword) => (
                  <PixelBadge key={keyword} variant="secondary" className="text-[10px]">
                    {keyword}
                  </PixelBadge>
                ))}
                {npm.keywords.length > 8 && (
                  <PixelBadge variant="outline" className="text-[10px]">
                    +{npm.keywords.length - 8} more
                  </PixelBadge>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-center">
              {npm.firstPublished && (
                <div>
                  <p className="text-muted-foreground text-[10px]">FIRST PUBLISHED</p>
                  <p className="text-primary text-xs">{formatDate(npm.firstPublished)}</p>
                </div>
              )}
              {npm.lastPublished && (
                <div>
                  <p className="text-muted-foreground text-[10px]">LAST PUBLISHED</p>
                  <p className="text-primary text-xs">{timeAgo(npm.lastPublished)}</p>
                </div>
              )}
            </div>
          </PixelCardContent>
        </PixelCard>
      )}

      {bundlephobia && (
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> BUNDLE SIZE
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-[#0a0f1a] border border-border">
                <Box className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-primary text-2xl font-mono">{formatBytes(bundlephobia.size)}</p>
                <p className="text-muted-foreground text-xs">MINIFIED</p>
              </div>
              <div className="text-center p-4 bg-[#0a0f1a] border border-border">
                <Zap className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-primary text-2xl font-mono">{formatBytes(bundlephobia.gzip)}</p>
                <p className="text-muted-foreground text-xs">GZIPPED</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {bundlephobia.dependencyCount !== undefined && (
                <PixelBadge variant="outline" className="text-xs">
                  {bundlephobia.dependencyCount} dependencies
                </PixelBadge>
              )}
              {bundlephobia.hasJSModule && (
                <PixelBadge variant="secondary" className="text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> ESM
                </PixelBadge>
              )}
              {bundlephobia.hasSideEffects === false && (
                <PixelBadge variant="secondary" className="text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Tree-shakeable
                </PixelBadge>
              )}
            </div>
          </PixelCardContent>
        </PixelCard>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Last updated: {timeAgo(new Date(lastFetched).toISOString())}</span>
        </div>
        {onRefresh && (
          <PixelButton onClick={onRefresh} disabled={isRefreshing} size="sm" variant="ghost">
            <RefreshCw className={cn("w-3 h-3 mr-1", isRefreshing && "animate-spin")} />
            {isRefreshing ? "REFRESHING..." : "REFRESH"}
          </PixelButton>
        )}
      </div>
    </div>
  );
}
