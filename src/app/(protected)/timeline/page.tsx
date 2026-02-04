"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PageHeader } from "@/components/page-header";
import { PageLayout, Section, Grid } from "@/components/page-layout";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Star,
  Download,
  GitFork,
  Users,
  Package,
  ArrowRight,
  Clock,
  Filter,
  ChevronDown,
  Unlock,
  Globe,
  Github,
  Tag,
  Sparkles,
  History,
  Plus,
} from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";

type TimelineTool = {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  pricingModel: string;
  githubStars?: number;
  npmDownloadsWeekly?: number;
  isOpenSource: boolean;
  isFeatured: boolean;
  category?: { name: string; slug: string; icon?: string };
  websiteUrl: string;
  githubUrl?: string;
  releaseDate: string | null;
  releaseDateTimestamp: number | null;
  latestRelease?: { tagName: string; name?: string; publishedAt?: string };
  license?: string;
  language?: string;
  forks?: number;
  contributors?: number;
  isRecentlyAdded?: boolean;
  addedToDbAt?: number;
};

function TimelineItem({ tool, index }: { tool: TimelineTool; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isLeft = index % 2 === 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getYearFromDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).getFullYear();
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-border" />
      
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`w-full flex ${isLeft ? "justify-end pr-8 md:pr-12" : "justify-start pl-8 md:pl-12"} md:w-1/2 ${isLeft ? "md:pr-8" : "md:pl-8"}`}
        style={{ marginLeft: isLeft ? "0" : "auto", marginRight: isLeft ? "auto" : "0" }}
      >
        <Link href={`/tools/${tool.slug}`} className="block w-full max-w-md group">
          <PixelCard 
            rarity={tool.isFeatured ? "legendary" : tool.isOpenSource ? "rare" : "common"}
            className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            <PixelCardContent className="relative z-10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-card border border-border rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-primary font-semibold truncate">{tool.name}</h3>
                    {tool.isFeatured && (
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    )}
                    {tool.isRecentlyAdded && (
                      <PixelBadge variant="default" className="flex items-center gap-1 bg-green-500 text-white border-green-600">
                        <Plus className="w-3 h-3" />
                        NEW
                      </PixelBadge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-1">{tool.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-xs">
                <PixelBadge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(tool.releaseDate)}
                </PixelBadge>
                {tool.category && (
                  <PixelBadge variant="secondary" className="flex items-center gap-1">
                    <DynamicIcon name={tool.category.icon || "Package"} className="w-3 h-3" />
                    {tool.category.name}
                  </PixelBadge>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {tool.githubStars && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{formatNumber(tool.githubStars)}</span>
                  </div>
                )}
                {tool.npmDownloadsWeekly && (
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-green-500" />
                    <span>{formatNumber(tool.npmDownloadsWeekly)}/wk</span>
                  </div>
                )}
                {tool.forks && (
                  <div className="flex items-center gap-1">
                    <GitFork className="w-3 h-3 text-blue-500" />
                    <span>{formatNumber(tool.forks)}</span>
                  </div>
                )}
                {tool.contributors && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-500" />
                    <span>{tool.contributors}</span>
                  </div>
                )}
                {tool.isOpenSource && (
                  <div className="flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-primary" />
                    <span>OSS</span>
                  </div>
                )}
              </div>

              {tool.latestRelease && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Latest:</span>
                    <span className="text-primary font-mono">{tool.latestRelease.tagName}</span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-end">
                <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </PixelCardContent>
          </PixelCard>
        </Link>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="absolute left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-1/2 ml-6 md:ml-8" : "right-1/2 mr-6 md:mr-8"}`}
      >
        <span className="text-xs font-mono text-primary bg-background px-2 py-1 border border-border rounded">
          {getYearFromDate(tool.releaseDate)}
        </span>
      </motion.div>
    </div>
  );
}

function YearMarker({ year }: { year: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative flex items-center justify-center py-8">
      <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-border" />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-lg shadow-lg"
      >
        {year}
      </motion.div>
    </div>
  );
}

export default function TimelinePage() {
  const tools = useQuery(api.tools.getToolsForTimeline);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = tools
    ? Array.from(new Set(tools.map((t) => t.category?.slug).filter(Boolean)))
    : [];

  const filteredTools = tools?.filter((tool) => {
    if (selectedCategory && tool.category?.slug !== selectedCategory) return false;
    return true;
  });

  const toolsByYear = filteredTools?.reduce((acc, tool) => {
    const year = tool.releaseDate ? new Date(tool.releaseDate).getFullYear() : 0;
    if (!acc[year]) acc[year] = [];
    acc[year].push(tool);
    return acc;
  }, {} as Record<number, TimelineTool[]>);

  const sortedYears = toolsByYear ? Object.keys(toolsByYear).map(Number).sort((a, b) => b - a) : [];

  if (tools === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
          </motion.div>
          <p className="text-primary text-sm">LOADING TIMELINE...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="TOOL TIMELINE"
        description="Explore the history of developer tools. See when each tool was released and track the evolution of the development ecosystem."
        icon={History}
        badge={`${filteredTools?.length || 0} Tools`}
      />

        <Section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <PixelButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter by Category
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </PixelButton>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <PixelBadge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </PixelBadge>
                  {categories.map((cat) => {
                    const category = tools?.find((t) => t.category?.slug === cat)?.category;
                    return (
                      <PixelBadge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
                        onClick={() => setSelectedCategory(cat as string)}
                      >
                        {category?.icon && <DynamicIcon name={category.icon} className="w-3 h-3" />}
                        {category?.name}
                      </PixelBadge>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {sortedYears.map((year) => (
            <div key={year}>
              <YearMarker year={year} />
              <div className="space-y-8">
                {toolsByYear?.[year]?.map((tool, index) => (
                  <TimelineItem key={tool._id} tool={tool} index={index} />
                ))}
              </div>
            </div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative flex items-center justify-center py-12"
          >
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-border to-transparent" />
            <div className="relative z-10 bg-card border border-border px-4 py-2 rounded-full text-muted-foreground text-sm">
              Beginning of Time
            </div>
          </motion.div>
        </div>

        {filteredTools?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tools found with release dates in this category.</p>
            <PixelButton
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedCategory(null)}
            >
              Clear Filters
            </PixelButton>
          </motion.div>
        )}
    </PageLayout>
  );
}
