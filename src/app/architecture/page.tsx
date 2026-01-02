"use client";

import Link from "next/link";
import { 
  Gamepad2, 
  Wrench, 
  Compass, 
  Layers,
  Database,
  Globe,
  Code,
  Palette,
  Server,
  Zap,
  Box,
  FileCode,
  Layout
} from "lucide-react";
import { PixelCard } from "@/components/pixel-card";

const techStack = [
  { name: "Next.js 16", description: "React Framework with App Router", icon: Layout, color: "text-white", tech: ["RSC", "App Router", "Turbopack"] },
  { name: "React 19", description: "UI Component Library", icon: Code, color: "text-cyan-400", tech: ["Hooks", "Server Components"] },
  { name: "Tailwind CSS", description: "Utility-First Styling", icon: Palette, color: "text-teal-400", tech: ["v4", "JIT", "Custom Theme"] },
  { name: "Radix UI", description: "Headless Components", icon: Box, color: "text-purple-400", tech: ["Dialog", "Tabs", "Tooltip"] },
  { name: "Convex", description: "Backend-as-a-Service", icon: Server, color: "text-red-400", tech: ["Realtime", "TypeScript", "Serverless"] },
  { name: "Convex DB", description: "Document Database", icon: Database, color: "text-emerald-400", tech: ["Tools", "Categories", "Pricing"] },
  { name: "Vercel", description: "Edge Deployment Platform", icon: Globe, color: "text-white", tech: ["Edge Functions", "CDN", "Analytics"] },
  { name: "Lucide Icons", description: "Icon Library", icon: Zap, color: "text-yellow-400", tech: ["500+ Icons", "Tree-shakable"] },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-[#60a5fa] text-lg mb-2 flex items-center justify-center gap-2">
            <Layers className="w-5 h-5" /> SYSTEM ARCHITECTURE
          </h1>
          <p className="text-[#3b82f6] text-[10px]">
            HOW VIBEBUFF WAS BUILT
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <PixelCard key={tech.name} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <tech.icon className={`w-5 h-5 ${tech.color}`} />
                <span className="text-[#60a5fa] text-[10px] font-bold uppercase">
                  {tech.name}
                </span>
              </div>
              <p className="text-[#3b82f6] text-[8px] mb-2">{tech.description}</p>
              <div className="flex flex-wrap gap-1">
                {tech.tech.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 bg-[#1e3a5f] text-[#60a5fa] text-[6px] rounded uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </PixelCard>
          ))}
        </div>
      </main>
    </div>
  );
}
