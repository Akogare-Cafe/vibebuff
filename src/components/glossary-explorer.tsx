"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import {
  BookOpen,
  Search,
  Brain,
  Lightbulb,
  ChevronRight,
  X,
  Layers,
  Code,
  Database,
  Globe,
  Server,
  Cpu,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

type GlossaryCategory = "general" | "ai" | "ide" | "backend" | "frontend" | "devops" | "database";

const categoryConfig: Record<GlossaryCategory, { label: string; icon: React.ReactNode; color: string }> = {
  general: { label: "General", icon: <BookOpen className="w-4 h-4" />, color: "#60a5fa" },
  ai: { label: "AI & ML", icon: <Brain className="w-4 h-4" />, color: "#a855f7" },
  ide: { label: "IDEs & Editors", icon: <Code className="w-4 h-4" />, color: "#22c55e" },
  backend: { label: "Backend", icon: <Server className="w-4 h-4" />, color: "#f59e0b" },
  frontend: { label: "Frontend", icon: <Globe className="w-4 h-4" />, color: "#ec4899" },
  devops: { label: "DevOps", icon: <Cpu className="w-4 h-4" />, color: "#14b8a6" },
  database: { label: "Database", icon: <Database className="w-4 h-4" />, color: "#6366f1" },
};

interface GlossaryTerm {
  _id: Id<"glossaryTerms">;
  slug: string;
  term: string;
  shortDefinition: string;
  fullDefinition: string;
  eli5Definition: string;
  category: GlossaryCategory;
  relatedTerms: string[];
  examples: string[];
  icon?: string;
  tools?: { name: string }[];
}

function TermCard({
  term,
  onClick,
  isSimpleMode,
}: {
  term: GlossaryTerm;
  onClick: () => void;
  isSimpleMode: boolean;
}) {
  const config = categoryConfig[term.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PixelCard className="cursor-pointer h-full" onClick={onClick}>
        <PixelCardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <span style={{ color: config.color }}>{config.icon}</span>
            </div>
            <PixelBadge
              className="text-[8px]"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {config.label}
            </PixelBadge>
          </div>

          <h3 className="text-[#60a5fa] font-bold text-sm mb-2">{term.term}</h3>
          <p className="text-[#3b82f6] text-xs line-clamp-2">
            {isSimpleMode ? term.eli5Definition : term.shortDefinition}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[#3b82f6]/60 text-[10px]">
              {term.relatedTerms.length} related terms
            </span>
            <ChevronRight className="w-4 h-4 text-[#3b82f6]" />
          </div>
        </PixelCardContent>
      </PixelCard>
    </motion.div>
  );
}

function TermDetailModal({
  term,
  onClose,
  isSimpleMode,
  relatedTerms,
  onRelatedTermClick,
}: {
  term: GlossaryTerm;
  onClose: () => void;
  isSimpleMode: boolean;
  relatedTerms: GlossaryTerm[];
  onRelatedTermClick: (term: GlossaryTerm) => void;
}) {
  const config = categoryConfig[term.category];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCard rarity="rare">
          <PixelCardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <span style={{ color: config.color }} className="scale-150">
                    {config.icon}
                  </span>
                </div>
                <div>
                  <PixelCardTitle className="text-lg">{term.term}</PixelCardTitle>
                  <PixelBadge
                    className="mt-1"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    {config.label}
                  </PixelBadge>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </PixelCardHeader>

          <PixelCardContent className="space-y-6">
            <div>
              <h4 className="text-[#60a5fa] font-bold text-sm mb-2 flex items-center gap-2">
                {isSimpleMode ? (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Simple Explanation
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Definition
                  </>
                )}
              </h4>
              <p className="text-[#3b82f6] text-sm leading-relaxed">
                {isSimpleMode ? term.eli5Definition : term.fullDefinition}
              </p>
            </div>

            {term.examples.length > 0 && (
              <div>
                <h4 className="text-[#60a5fa] font-bold text-sm mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Examples
                </h4>
                <ul className="space-y-2">
                  {term.examples.map((example, i) => (
                    <li
                      key={i}
                      className="text-[#3b82f6] text-sm pl-4 border-l-2 border-[#1e3a5f]"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {term.tools && term.tools.length > 0 && (
              <div>
                <h4 className="text-[#60a5fa] font-bold text-sm mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Related Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  {term.tools.map((tool, i) => (
                    <PixelBadge key={i}>{tool.name}</PixelBadge>
                  ))}
                </div>
              </div>
            )}

            {relatedTerms.length > 0 && (
              <div>
                <h4 className="text-[#60a5fa] font-bold text-sm mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Related Terms
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relatedTerms.map((related) => (
                    <button
                      key={related._id}
                      onClick={() => onRelatedTermClick(related)}
                      className="p-3 rounded-lg border-2 border-[#1e3a5f] bg-[#0d1f3c]/30 hover:border-[#60a5fa] transition-colors text-left"
                    >
                      <p className="text-[#60a5fa] font-bold text-xs">
                        {related.term}
                      </p>
                      <p className="text-[#3b82f6] text-[10px] line-clamp-1">
                        {related.shortDefinition}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

export function GlossaryExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  const terms = useQuery(api.glossary.listTerms, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery || undefined,
  });

  const selectedTermDetails = useQuery(
    api.glossary.getBySlug,
    selectedTerm ? { slug: selectedTerm.slug } : "skip"
  );

  const relatedTerms = selectedTermDetails?.relatedTermsData ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#60a5fa] flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Glossary & Concepts
          </h1>
          <p className="text-[#3b82f6] text-sm mt-1">
            Learn vibe coding terminology in plain English
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b82f6]" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0d1f3c] border-2 border-[#1e3a5f] rounded-lg text-[#60a5fa] text-sm placeholder:text-[#3b82f6]/50 focus:border-[#60a5fa] outline-none"
            />
          </div>

          <button
            onClick={() => setIsSimpleMode(!isSimpleMode)}
            className={cn(
              "px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2 text-sm",
              isSimpleMode
                ? "border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]"
                : "border-[#1e3a5f] text-[#3b82f6] hover:border-[#60a5fa]"
            )}
          >
            <Lightbulb className="w-4 h-4" />
            Simple Mode
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-3 py-1 rounded-full text-xs transition-colors",
            selectedCategory === "all"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
          )}
        >
          All Categories
        </button>
        {(Object.keys(categoryConfig) as GlossaryCategory[]).map((cat) => {
          const config = categoryConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1",
                selectedCategory === cat
                  ? "text-white"
                  : "text-[#3b82f6] hover:bg-[#60a5fa]/20"
              )}
              style={{
                backgroundColor:
                  selectedCategory === cat ? config.color : `${config.color}20`,
              }}
            >
              {config.icon}
              {config.label}
            </button>
          );
        })}
      </div>

      {!terms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-[#1e3a5f] rounded-lg" />
            </div>
          ))}
        </div>
      ) : terms.length === 0 ? (
        <PixelCard>
          <PixelCardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[#3b82f6] mx-auto mb-4" />
            <p className="text-[#60a5fa] font-bold">No terms found</p>
            <p className="text-[#3b82f6] text-sm">
              Try adjusting your search or category filter
            </p>
          </PixelCardContent>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {terms.map((term) => (
              <TermCard
                key={term._id}
                term={term as GlossaryTerm}
                onClick={() => setSelectedTerm(term as GlossaryTerm)}
                isSimpleMode={isSimpleMode}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedTerm && (
          <TermDetailModal
            term={selectedTerm}
            onClose={() => setSelectedTerm(null)}
            isSimpleMode={isSimpleMode}
            relatedTerms={relatedTerms as GlossaryTerm[]}
            onRelatedTermClick={(term) => setSelectedTerm(term)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
