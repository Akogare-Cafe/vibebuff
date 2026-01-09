"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { Newspaper, ExternalLink, BookOpen, FileText, Scale, Lightbulb } from "lucide-react";

interface RelatedArticlesProps {
  toolId: Id<"tools">;
  toolName: string;
  className?: string;
}

const articleTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  tutorial: { icon: BookOpen, label: "TUTORIAL", color: "text-blue-400" },
  guide: { icon: FileText, label: "GUIDE", color: "text-green-400" },
  comparison: { icon: Scale, label: "COMPARISON", color: "text-yellow-400" },
  review: { icon: Lightbulb, label: "REVIEW", color: "text-purple-400" },
  news: { icon: Newspaper, label: "NEWS", color: "text-cyan-400" },
  blog: { icon: FileText, label: "BLOG", color: "text-orange-400" },
  documentation: { icon: BookOpen, label: "DOCS", color: "text-emerald-400" },
  other: { icon: FileText, label: "ARTICLE", color: "text-muted-foreground" },
};

export function RelatedArticles({ toolId, toolName, className }: RelatedArticlesProps) {
  const articles = useQuery(api.articles.getArticlesForTool, { toolId });

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <PixelCard className={className}>
      <PixelCardHeader>
        <PixelCardTitle className="flex items-center gap-2">
          <Newspaper className="w-4 h-4" /> RELATED ARTICLES
        </PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent>
        <p className="text-muted-foreground text-xs mb-4">
          Tutorials, guides, and articles about {toolName}
        </p>
        <div className="space-y-3">
          {articles.map((article) => {
            if (!article) return null;
            const config = articleTypeConfig[article.articleType] || articleTypeConfig.other;
            const IconComponent = config.icon;
            
            return (
              <a
                key={article._id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 border-2 border-border hover:border-primary transition-colors group"
              >
                <div className={`p-2 bg-card border border-border group-hover:border-primary shrink-0 ${config.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <PixelBadge variant="outline" className={`text-[10px] ${config.color} border-current`}>
                      {config.label}
                    </PixelBadge>
                    {article.source && (
                      <span className="text-muted-foreground text-[10px] truncate">
                        {article.source}
                      </span>
                    )}
                  </div>
                  <p className="text-primary text-sm font-medium line-clamp-2 group-hover:underline">
                    {article.title}
                  </p>
                  {article.description && (
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
              </a>
            );
          })}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}
