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
  BookOpen, 
  Scroll,
  Clock,
  User,
  Quote,
  Lightbulb,
  Link2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ToolLoreProps {
  toolId: Id<"tools">;
  userId?: string;
  className?: string;
}

export function ToolLore({ toolId, userId, className }: ToolLoreProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("origin");
  
  const lore = useQuery(api.lore.getToolLore, { toolId });
  const userUnlocks = useQuery(
    api.lore.getUserLoreUnlocks, 
    userId ? { userId, toolId } : "skip"
  );
  const unlockSection = useMutation(api.lore.unlockLoreSection);

  if (!lore) {
    return (
      <PixelCard className="p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
        <p className="text-[#3b82f6] text-[10px]">NO LORE AVAILABLE</p>
        <p className="text-[#1e3a5f] text-[8px]">This tool's story is yet to be written...</p>
      </PixelCard>
    );
  }

  const unlockedSections = userUnlocks?.[0]?.unlockedSections || [];
  const isUnlocked = (section: string) => !userId || unlockedSections.includes(section);

  const handleUnlock = async (section: string) => {
    if (!userId) return;
    await unlockSection({ userId, toolId, section });
  };

  const toggleSection = (section: string) => {
    if (isUnlocked(section)) {
      setExpandedSection(expandedSection === section ? null : section);
    } else {
      handleUnlock(section);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> TOOL LORE
        </h2>
        <PixelBadge variant="outline" className="text-[8px]">
          <Scroll className="w-3 h-3 mr-1" /> ENCYCLOPEDIA
        </PixelBadge>
      </div>

      <LoreSection
        title="ORIGIN STORY"
        icon={<Scroll className="w-4 h-4" />}
        isExpanded={expandedSection === "origin"}
        isUnlocked={isUnlocked("origin")}
        onToggle={() => toggleSection("origin")}
      >
        <p className="text-[#3b82f6] text-[10px] leading-relaxed">{lore.originStory}</p>
      </LoreSection>

      {lore.creatorInfo && (
        <LoreSection
          title="THE CREATOR"
          icon={<User className="w-4 h-4" />}
          isExpanded={expandedSection === "creator"}
          isUnlocked={isUnlocked("creator")}
          onToggle={() => toggleSection("creator")}
        >
          <div className="space-y-2">
            <p className="text-[#60a5fa] text-[12px]">{lore.creatorInfo.name}</p>
            <p className="text-[#3b82f6] text-[10px]">{lore.creatorInfo.bio}</p>
            {lore.creatorInfo.quote && (
              <div className="flex items-start gap-2 p-2 border-l-2 border-[#3b82f6] bg-[#0a1628]">
                <Quote className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                <p className="text-[#60a5fa] text-[10px] italic">"{lore.creatorInfo.quote}"</p>
              </div>
            )}
          </div>
        </LoreSection>
      )}

      <LoreSection
        title="ERAS & VERSIONS"
        icon={<Clock className="w-4 h-4" />}
        isExpanded={expandedSection === "eras"}
        isUnlocked={isUnlocked("eras")}
        onToggle={() => toggleSection("eras")}
      >
        <div className="space-y-3">
          {lore.eras.map((era: any, index: number) => (
            <div key={index} className="border-l-2 border-[#1e3a5f] pl-3">
              <div className="flex items-center gap-2 mb-1">
                <PixelBadge variant="outline" className="text-[6px]">
                  v{era.version}
                </PixelBadge>
                <span className="text-[#60a5fa] text-[10px]">{era.name}</span>
              </div>
              <p className="text-[#3b82f6] text-[8px] mb-1">{era.description}</p>
              <div className="flex flex-wrap gap-1">
                {era.majorChanges.map((change: string, i: number) => (
                  <PixelBadge key={i} variant="outline" className="text-[6px]">
                    {change}
                  </PixelBadge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </LoreSection>

      <LoreSection
        title="FUN FACTS"
        icon={<Lightbulb className="w-4 h-4" />}
        isExpanded={expandedSection === "facts"}
        isUnlocked={isUnlocked("facts")}
        onToggle={() => toggleSection("facts")}
      >
        <ul className="space-y-2">
          {lore.funFacts.map((fact: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-[#3b82f6] text-[10px]">{fact}</span>
            </li>
          ))}
        </ul>
      </LoreSection>

      {lore.relatedTools.length > 0 && (
        <LoreSection
          title="RELATED TOOLS"
          icon={<Link2 className="w-4 h-4" />}
          isExpanded={expandedSection === "related"}
          isUnlocked={isUnlocked("related")}
          onToggle={() => toggleSection("related")}
        >
          <div className="flex flex-wrap gap-2">
            {lore.relatedTools.map((tool: any) => (
              <Link key={tool._id} href={`/tools/${tool.slug}`}>
                <PixelBadge variant="outline" className="text-[8px] hover:border-[#3b82f6]">
                  {tool.name}
                </PixelBadge>
              </Link>
            ))}
          </div>
        </LoreSection>
      )}
    </div>
  );
}

interface LoreSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  isUnlocked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function LoreSection({ title, icon, isExpanded, isUnlocked, onToggle, children }: LoreSectionProps) {
  return (
    <PixelCard className={cn("overflow-hidden", !isUnlocked && "opacity-70")}>
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-[#1e3a5f]/30"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[#60a5fa] text-[10px] uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isUnlocked && <Lock className="w-3 h-3 text-[#3b82f6]" />}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#3b82f6]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#3b82f6]" />
          )}
        </div>
      </button>
      {isExpanded && isUnlocked && (
        <div className="p-3 pt-0 border-t border-[#1e3a5f]">
          {children}
        </div>
      )}
      {!isUnlocked && isExpanded && (
        <div className="p-3 pt-0 border-t border-[#1e3a5f] text-center">
          <Lock className="w-8 h-8 mx-auto text-[#1e3a5f] mb-2" />
          <p className="text-[#3b82f6] text-[8px]">Use this tool to unlock lore</p>
        </div>
      )}
    </PixelCard>
  );
}

export function EncyclopediaProgress({ userId }: { userId: string }) {
  const progress = useQuery(api.lore.getEncyclopediaProgress, { userId });

  if (!progress) return null;

  const percent = progress.completionPercent;

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> ENCYCLOPEDIA PROGRESS
      </h3>
      
      <div className="mb-3">
        <div className="flex justify-between text-[8px] mb-1">
          <span className="text-[#3b82f6]">COMPLETION</span>
          <span className="text-[#60a5fa]">{percent}%</span>
        </div>
        <div className="h-3 bg-[#0a1628] border border-[#1e3a5f]">
          <div 
            className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[8px]">
        <div className="text-center p-2 border border-[#1e3a5f]">
          <p className="text-[#60a5fa] text-lg">{progress.toolsDiscovered}</p>
          <p className="text-[#3b82f6]">/ {progress.totalTools} TOOLS</p>
        </div>
        <div className="text-center p-2 border border-[#1e3a5f]">
          <p className="text-[#60a5fa] text-lg">{progress.unlockedSections}</p>
          <p className="text-[#3b82f6]">/ {progress.totalSections} SECTIONS</p>
        </div>
      </div>
    </PixelCard>
  );
}
