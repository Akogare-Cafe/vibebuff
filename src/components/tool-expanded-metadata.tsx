"use client";

import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelBadge } from "./pixel-badge";
import { PixelButton } from "./pixel-button";
import {
  Twitter,
  MessageCircle,
  Youtube,
  Terminal,
  Copy,
  CheckCircle,
  FileText,
  BookOpen,
  Users,
  History,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { useState } from "react";

interface SocialLinks {
  twitter?: string;
  discord?: string;
  slack?: string;
  youtube?: string;
  reddit?: string;
}

interface InstallCommands {
  npm?: string;
  yarn?: string;
  pnpm?: string;
  bun?: string;
  brew?: string;
  other?: string;
}

interface ReadmeInfo {
  excerpt?: string;
  badges?: string[];
  hasQuickStart?: boolean;
  hasContributing?: boolean;
  hasChangelog?: boolean;
}

interface ChangelogEntry {
  version: string;
  date?: string;
  changes: string[];
  isBreaking?: boolean;
}

interface ToolExpandedMetadataProps {
  socialLinks?: SocialLinks;
  installCommands?: InstallCommands;
  readme?: ReadmeInfo;
  changelog?: ChangelogEntry[];
  npmPackageName?: string;
  className?: string;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 w-full p-2 bg-[#0a0f1a] border border-border hover:border-primary transition-colors text-left group"
    >
      <Terminal className="w-4 h-4 text-muted-foreground shrink-0" />
      <code className="text-primary text-xs font-mono flex-1 truncate">{text}</code>
      {copied ? (
        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
      )}
    </button>
  );
}

export function ToolSocialLinks({ socialLinks, className }: { socialLinks?: SocialLinks; className?: string }) {
  if (!socialLinks) return null;

  const links = [
    { key: "twitter", icon: Twitter, label: "Twitter", url: socialLinks.twitter, color: "text-blue-400" },
    { key: "discord", icon: MessageCircle, label: "Discord", url: socialLinks.discord, color: "text-indigo-400" },
    { key: "slack", icon: MessageCircle, label: "Slack", url: socialLinks.slack, color: "text-purple-400" },
    { key: "youtube", icon: Youtube, label: "YouTube", url: socialLinks.youtube, color: "text-red-400" },
    { key: "reddit", icon: MessageCircle, label: "Reddit", url: socialLinks.reddit, color: "text-orange-400" },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-[#0a0f1a] border border-border hover:border-primary transition-colors"
        >
          <link.icon className={cn("w-4 h-4", link.color)} />
          <span className="text-primary text-xs">{link.label.toUpperCase()}</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </a>
      ))}
    </div>
  );
}

export function ToolInstallCommands({
  installCommands,
  npmPackageName,
  className,
}: {
  installCommands?: InstallCommands;
  npmPackageName?: string;
  className?: string;
}) {
  const commands = installCommands || {};
  
  const defaultCommands = npmPackageName
    ? {
        npm: commands.npm || `npm install ${npmPackageName}`,
        yarn: commands.yarn || `yarn add ${npmPackageName}`,
        pnpm: commands.pnpm || `pnpm add ${npmPackageName}`,
        bun: commands.bun || `bun add ${npmPackageName}`,
      }
    : commands;

  const availableCommands = Object.entries(defaultCommands).filter(([, cmd]) => cmd);

  if (availableCommands.length === 0) return null;

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Terminal className="w-4 h-4" /> INSTALL
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="space-y-2">
          {availableCommands.map(([manager, command]) => (
            <div key={manager}>
              <p className="text-muted-foreground text-[10px] mb-1">{manager.toUpperCase()}</p>
              <CopyButton text={command!} label={manager} />
            </div>
          ))}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

export function ToolReadmeInfo({ readme, className }: { readme?: ReadmeInfo; className?: string }) {
  if (!readme) return null;

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <FileText className="w-4 h-4" /> README
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        {readme.excerpt && (
          <MarkdownRenderer content={readme.excerpt} className="text-sm leading-relaxed mb-4 [&_p]:mb-2 [&_p:last-child]:mb-0" />
        )}

        <div className="flex flex-wrap gap-2">
          {readme.hasQuickStart && (
            <PixelBadge variant="secondary" className="text-xs flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Quick Start
            </PixelBadge>
          )}
          {readme.hasContributing && (
            <PixelBadge variant="secondary" className="text-xs flex items-center gap-1">
              <Users className="w-3 h-3" /> Contributing Guide
            </PixelBadge>
          )}
          {readme.hasChangelog && (
            <PixelBadge variant="secondary" className="text-xs flex items-center gap-1">
              <History className="w-3 h-3" /> Changelog
            </PixelBadge>
          )}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

export function ToolChangelog({
  changelog,
  className,
}: {
  changelog?: ChangelogEntry[];
  className?: string;
}) {
  const [showAll, setShowAll] = useState(false);

  if (!changelog || changelog.length === 0) return null;

  const displayedChangelog = showAll ? changelog : changelog.slice(0, 3);

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <History className="w-4 h-4" /> CHANGELOG
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <div className="space-y-4">
          {displayedChangelog.map((entry, i) => (
            <div key={i} className="border-l-2 border-primary pl-4">
              <div className="flex items-center gap-2 mb-2">
                <PixelBadge
                  variant="default"
                  className={cn("text-xs", entry.isBreaking && "bg-red-500/20 text-red-400 border-red-500")}
                >
                  {entry.version}
                </PixelBadge>
                {entry.isBreaking && (
                  <PixelBadge variant="outline" className="text-xs flex items-center gap-1 text-orange-400 border-orange-400">
                    <AlertTriangle className="w-3 h-3" /> BREAKING
                  </PixelBadge>
                )}
                {entry.date && (
                  <span className="text-muted-foreground text-xs">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <ul className="space-y-1">
                {entry.changes.slice(0, 5).map((change, j) => (
                  <li key={j} className="text-muted-foreground text-sm flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {changelog.length > 3 && (
          <div className="mt-4 pt-3 border-t border-border">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? "SHOW LESS" : `SHOW ALL ${changelog.length} RELEASES`}
            </PixelButton>
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  );
}

export function ToolExpandedMetadata({
  socialLinks,
  installCommands,
  readme,
  changelog,
  npmPackageName,
  className,
}: ToolExpandedMetadataProps) {
  const hasAnyData = socialLinks || installCommands || readme || changelog || npmPackageName;

  if (!hasAnyData) return null;

  return (
    <div className={cn("space-y-6", className)}>
      <ToolSocialLinks socialLinks={socialLinks} />
      <ToolInstallCommands installCommands={installCommands} npmPackageName={npmPackageName} />
      <ToolReadmeInfo readme={readme} />
      <ToolChangelog changelog={changelog} />
    </div>
  );
}
