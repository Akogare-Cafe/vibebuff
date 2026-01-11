"use client";

import { Wrench, Hammer, Cog, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolMasteryIconProps {
  className?: string;
  level?: "initiate" | "journeyman" | "expert";
}

export function ToolMasteryIcon({ className, level = "initiate" }: ToolMasteryIconProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div className="tool-mastery-orbit">
        <Wrench className="tool-mastery-tool tool-mastery-tool-1 w-[40%] h-[40%] absolute" />
        <Hammer className="tool-mastery-tool tool-mastery-tool-2 w-[40%] h-[40%] absolute" />
        <Cog className="tool-mastery-tool tool-mastery-tool-3 w-[40%] h-[40%] absolute" />
      </div>
      <div className="tool-mastery-center">
        <Sparkles className="w-[50%] h-[50%] tool-mastery-sparkle" />
      </div>
    </div>
  );
}

export function MasteryInitiateIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <Wrench className="w-full h-full tool-mastery-swing" />
    </div>
  );
}

export function MasteryJourneymanIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Hammer className="w-full h-full tool-mastery-hammer" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center tool-mastery-impact">
        <Sparkles className="w-[60%] h-[60%] opacity-0" />
      </div>
    </div>
  );
}

export function MasteryExpertIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <Cog className="w-full h-full tool-mastery-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[30%] h-[30%] rounded-full bg-current tool-mastery-pulse opacity-50" />
      </div>
    </div>
  );
}
