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
  Copy,
  Users,
  Building2,
  Briefcase,
  Rocket,
  Gamepad2,
  DollarSign,
  Star,
  ExternalLink,
  Check
} from "lucide-react";

interface StackTemplatesProps {
  userId?: string;
  className?: string;
}

const CATEGORY_CONFIG = {
  indie: { icon: Rocket, label: "Indie Hacker", color: "text-green-400" },
  startup: { icon: Briefcase, label: "Startup", color: "text-blue-400" },
  enterprise: { icon: Building2, label: "Enterprise", color: "text-purple-400" },
  agency: { icon: Users, label: "Agency", color: "text-orange-400" },
  hobby: { icon: Gamepad2, label: "Hobby", color: "text-pink-400" },
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "BEGINNER", color: "text-green-400 border-green-400" },
  intermediate: { label: "INTERMEDIATE", color: "text-yellow-400 border-yellow-400" },
  advanced: { label: "ADVANCED", color: "text-red-400 border-red-400" },
};

export function StackTemplates({ userId, className }: StackTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const templates = useQuery(api.templates.list, {
    category: selectedCategory as any,
    featured: !selectedCategory,
  });

  if (!templates) {
    return (
      <div className="text-center p-4">
        <div className="text-[#3b82f6] text-[10px] pixel-loading">LOADING TEMPLATES...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> STACK TEMPLATES
        </h2>
        <PixelBadge variant="default">
          {templates.length} TEMPLATES
        </PixelBadge>
      </div>

      <div className="flex flex-wrap gap-2">
        <PixelButton 
          variant={!selectedCategory ? "default" : "ghost"} 
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          <Star className="w-3 h-3 mr-1" /> FEATURED
        </PixelButton>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <PixelButton
              key={key}
              variant={selectedCategory === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              <Icon className="w-3 h-3 mr-1" /> {config.label.toUpperCase()}
            </PixelButton>
          );
        })}
      </div>

      {templates.length === 0 ? (
        <PixelCard className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO TEMPLATES FOUND</p>
          <p className="text-[#1e3a5f] text-[8px]">Try a different category</p>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template: any) => (
            <TemplateCard key={template._id} template={template} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: {
    _id: Id<"stackTemplates">;
    slug: string;
    name: string;
    description: string;
    category: keyof typeof CATEGORY_CONFIG;
    difficulty: keyof typeof DIFFICULTY_CONFIG;
    estimatedMonthlyCost: number;
    usageCount: number;
    isFeatured: boolean;
    tools: { name: string; slug: string }[];
    caseStudy?: {
      projectName: string;
      description: string;
      outcome: string;
    };
    tags: string[];
  };
  userId?: string;
}

function TemplateCard({ template, userId }: TemplateCardProps) {
  const [copied, setCopied] = useState(false);
  const cloneToDeck = useMutation(api.templates.cloneToDeck);

  const categoryConfig = CATEGORY_CONFIG[template.category];
  const difficultyConfig = DIFFICULTY_CONFIG[template.difficulty];
  const CategoryIcon = categoryConfig.icon;

  const handleClone = async () => {
    if (!userId) return;
    await cloneToDeck({ userId, templateId: template._id });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PixelCard 
      className={cn("p-4", template.isFeatured && "border-yellow-400")}
      rarity={template.isFeatured ? "legendary" : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryIcon className={cn("w-5 h-5", categoryConfig.color)} />
          <div>
            <h3 className="text-[#60a5fa] text-[12px]">{template.name}</h3>
            <p className="text-[#3b82f6] text-[8px]">{template.description}</p>
          </div>
        </div>
        {template.isFeatured && (
          <Star className="w-4 h-4 text-yellow-400" />
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {template.tools.slice(0, 5).map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`}>
            <PixelBadge variant="outline" className="text-[6px] hover:border-[#3b82f6]">
              {tool.name}
            </PixelBadge>
          </Link>
        ))}
        {template.tools.length > 5 && (
          <PixelBadge variant="outline" className="text-[6px]">
            +{template.tools.length - 5}
          </PixelBadge>
        )}
      </div>

      {template.caseStudy && (
        <div className="border border-[#1e3a5f] p-2 mb-3 bg-[#0a1628]">
          <p className="text-[#60a5fa] text-[8px]">{template.caseStudy.projectName}</p>
          <p className="text-[#3b82f6] text-[6px]">{template.caseStudy.outcome}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PixelBadge variant="outline" className={cn("text-[6px]", difficultyConfig.color)}>
            {difficultyConfig.label}
          </PixelBadge>
          <div className="flex items-center gap-1 text-[#3b82f6] text-[8px]">
            <DollarSign className="w-3 h-3" />
            ${template.estimatedMonthlyCost}/mo
          </div>
        </div>
        <span className="text-[#1e3a5f] text-[8px]">{template.usageCount} uses</span>
      </div>

      <div className="flex gap-2">
        <Link href={`/templates/${template.slug}`} className="flex-1">
          <PixelButton variant="ghost" size="sm" className="w-full">
            <ExternalLink className="w-3 h-3 mr-1" /> VIEW
          </PixelButton>
        </Link>
        <PixelButton 
          size="sm" 
          onClick={handleClone}
          disabled={!userId || copied}
          className="flex-1"
        >
          {copied ? (
            <><Check className="w-3 h-3 mr-1" /> CLONED</>
          ) : (
            <><Copy className="w-3 h-3 mr-1" /> CLONE</>
          )}
        </PixelButton>
      </div>
    </PixelCard>
  );
}

export function FeaturedTemplates({ userId }: { userId?: string }) {
  const templates = useQuery(api.templates.list, { featured: true, limit: 3 });

  if (!templates || templates.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[#60a5fa] text-[10px] uppercase flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> META STACKS
      </h3>
      {templates.map((template: any) => (
        <Link key={template._id} href={`/templates/${template.slug}`}>
          <PixelCard className="p-3 hover:border-[#3b82f6] transition-colors">
            <p className="text-[#60a5fa] text-[10px]">{template.name}</p>
            <p className="text-[#3b82f6] text-[8px]">{template.tools.length} tools</p>
          </PixelCard>
        </Link>
      ))}
    </div>
  );
}
