"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { use, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Star,
  Unlock,
  Globe,
  Github,
  BookOpen,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  Zap,
  DollarSign,
  Tag,
  Share2,
  Download,
  ExternalLink,
  Calendar,
  GitFork,
  Users,
  Code,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  Package
} from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";
import { AdDisplay } from "@/components/ad-display";
import { ShareButton } from "@/components/share-modal";
import { SuggestEditModal } from "@/components/suggest-edit-modal";

export default function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const tool = useQuery(api.tools.getBySlug, { slug });
  const trackEvent = useMutation(api.popularity.trackEvent);
  const hasTrackedView = useRef(false);
  
  const relatedTools = useQuery(
    api.synergies.getToolSynergies,
    tool?._id ? { toolId: tool._id } : "skip"
  );

  useEffect(() => {
    if (tool && tool._id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackEvent({
        toolId: tool._id,
        eventType: "view",
        sessionId: typeof window !== "undefined" ? sessionStorage.getItem("sessionId") || undefined : undefined,
      });
    }
  }, [tool, trackEvent]);

  if (tool === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-sm pixel-loading">LOADING...</p>
      </div>
    );
  }

  if (tool === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary text-lg mb-4">ITEM NOT FOUND</p>
          <Link href="/tools">
            <PixelButton><ArrowLeft className="w-3 h-3 mr-1" /> BACK TO INVENTORY</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm flex items-center gap-1">
          <Link href="/tools" className="text-muted-foreground hover:text-primary">
            INVENTORY
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          {tool.category && (
            <>
              <Link 
                href={`/tools?category=${tool.category.slug}`} 
                className="text-muted-foreground hover:text-primary"
              >
                {tool.category.name.toUpperCase()}
              </Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </>
          )}
          <span className="text-primary">{tool.name.toUpperCase()}</span>
        </div>

        {/* Tool Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-primary text-2xl mb-2 pixel-glow">{tool.name}</h1>
              <p className="text-muted-foreground text-base">{tool.tagline}</p>
            </div>
            <div className="flex gap-2">
              <PixelBadge variant="default">
                {tool.pricingModel === "free" ? "FREE" : 
                 tool.pricingModel === "freemium" ? "FREEMIUM" : 
                 tool.pricingModel === "open_source" ? "OSS" : "PAID"}
              </PixelBadge>
              {tool.isOpenSource && (
                <PixelBadge variant="secondary" className="flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> OPEN SOURCE
                </PixelBadge>
              )}
              <ShareButton
                shareType="tool"
                resourceId={tool._id}
                title={tool.name}
                description={`Check out ${tool.name} - ${tool.tagline}`}
                shareUrl={`${typeof window !== "undefined" ? window.location.origin : "https://vibebuff.com"}/tools/${slug}`}
              />
              <SuggestEditModal tool={tool} />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <PixelCard className="mb-8">
          <PixelCardContent className="py-4">
            <div className="flex flex-wrap justify-around gap-4 text-center">
              {tool.githubStars && (
                <div>
                  <p className="text-primary text-lg flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" /> {tool.githubStars >= 1000 ? `${(tool.githubStars / 1000).toFixed(1)}K` : tool.githubStars}
                  </p>
                  <p className="text-muted-foreground text-xs">GITHUB STARS</p>
                </div>
              )}
              {tool.npmDownloadsWeekly && (
                <div>
                  <p className="text-primary text-lg flex items-center justify-center gap-1">
                    <Download className="w-4 h-4" /> {tool.npmDownloadsWeekly >= 1000000 ? `${(tool.npmDownloadsWeekly / 1000000).toFixed(1)}M` : tool.npmDownloadsWeekly >= 1000 ? `${(tool.npmDownloadsWeekly / 1000).toFixed(0)}K` : tool.npmDownloadsWeekly}
                  </p>
                  <p className="text-muted-foreground text-xs">NPM WEEKLY</p>
                </div>
              )}
              {tool.category && (
                <div>
                  <p className="text-primary text-lg flex items-center justify-center">
                    <DynamicIcon name={tool.category.icon || "Package"} className="w-5 h-5" />
                  </p>
                  <p className="text-muted-foreground text-xs">{tool.category.name.toUpperCase()}</p>
                </div>
              )}
              <div>
                <p className="text-primary text-lg flex items-center justify-center">
                  {tool.isFeatured ? <Star className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                </p>
                <p className="text-muted-foreground text-xs">
                  {tool.isFeatured ? "LEGENDARY" : "COMMON"}
                </p>
              </div>
              <div>
                <p className="text-primary text-lg flex items-center justify-center">
                  {tool.isOpenSource ? <Unlock className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                </p>
                <p className="text-muted-foreground text-xs">
                  {tool.isOpenSource ? "OPEN SOURCE" : "PROPRIETARY"}
                </p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Quick Links */}
        {(tool.githubUrl || tool.websiteUrl || tool.docsUrl) && (
          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> QUICK LINKS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tool.githubUrl && (
                  <a
                    href={tool.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent({ toolId: tool._id, eventType: "click" })}
                    className="flex items-center gap-3 p-3 border-2 border-border hover:border-primary transition-colors group"
                  >
                    <div className="p-2 bg-card border border-border group-hover:border-primary">
                      <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-sm font-medium">GITHUB</p>
                      <p className="text-muted-foreground text-xs truncate">
                        {tool.githubUrl.replace('https://github.com/', '')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </a>
                )}
                {tool.websiteUrl && (
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent({ toolId: tool._id, eventType: "click" })}
                    className="flex items-center gap-3 p-3 border-2 border-border hover:border-primary transition-colors group"
                  >
                    <div className="p-2 bg-card border border-border group-hover:border-primary">
                      <Globe className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-sm font-medium">WEBSITE</p>
                      <p className="text-muted-foreground text-xs truncate">
                        {tool.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </a>
                )}
                {tool.docsUrl && (
                  <a
                    href={tool.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent({ toolId: tool._id, eventType: "click" })}
                    className="flex items-center gap-3 p-3 border-2 border-border hover:border-primary transition-colors group"
                  >
                    <div className="p-2 bg-card border border-border group-hover:border-primary">
                      <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-sm font-medium">DOCUMENTATION</p>
                      <p className="text-muted-foreground text-xs truncate">
                        {tool.docsUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </a>
                )}
              </div>
            </PixelCardContent>
          </PixelCard>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Description */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> DESCRIPTION
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tool.description}
              </p>
            </PixelCardContent>
          </PixelCard>

          {/* Best For */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4" /> BEST FOR
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <ul className="space-y-2">
                {tool.bestFor.map((item, i) => (
                  <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </PixelCardContent>
          </PixelCard>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pros */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="text-primary flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> STRENGTHS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <ul className="space-y-2">
                {tool.pros.map((pro, i) => (
                  <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                    <span className="text-primary">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </PixelCardContent>
          </PixelCard>

          {/* Cons */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> WEAKNESSES
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <ul className="space-y-2">
                {tool.cons.map((con, i) => (
                  <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* Features */}
        <PixelCard className="mb-8">
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> ABILITIES
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="flex flex-wrap gap-2">
              {tool.features.map((feature) => (
                <PixelBadge key={feature} variant="secondary">
                  {feature}
                </PixelBadge>
              ))}
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Version History */}
        {tool.majorVersions && tool.majorVersions.length > 0 && (
          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> VERSION HISTORY
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-4">
                {tool.majorVersions.map((version, i) => (
                  <div key={i} className="border-l-2 border-primary pl-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <PixelBadge variant="default" className="text-xs">
                        v{version.version}
                      </PixelBadge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(version.releasedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {version.highlights.map((highlight, j) => (
                        <li key={j} className="text-muted-foreground text-sm flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>
        )}

        {/* Pricing Tiers */}
        {tool.pricingTiers && tool.pricingTiers.length > 0 && (
          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> PRICING
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tool.pricingTiers.map((tier) => (
                  <div 
                    key={tier._id}
                    className={`border-4 p-4 ${
                      tier.isPopular 
                        ? "border-primary bg-card" 
                        : "border-border"
                    }`}
                  >
                    {tier.isPopular && (
                      <PixelBadge variant="default" className="mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3" /> POPULAR
                      </PixelBadge>
                    )}
                    <h4 className="text-primary text-sm mb-2">{tier.name}</h4>
                    <p className="text-primary text-lg mb-3">
                      {tier.priceMonthly === 0 ? "FREE" : `$${tier.priceMonthly}/MO`}
                    </p>
                    <ul className="space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-muted-foreground text-xs flex items-start gap-1">
                          <ChevronRight className="w-2 h-2 mt-0.5 shrink-0" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>
        )}

        {/* Tags */}
        <div className="mb-8">
          <p className="text-primary text-sm mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" /> TAGS:
          </p>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <PixelBadge key={tag} variant="outline">
                #{tag}
              </PixelBadge>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        {relatedTools && relatedTools.length > 0 && (
          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> RELATED TOOLS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedTools.map((synergy) => {
                  if (!synergy.otherTool) return null;
                  const synergyColors: Record<string, { border: string; bg: string; text: string }> = {
                    combo: { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-400" },
                    integration: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-400" },
                    alternative: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
                    conflict: { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-400" },
                  };
                  const colors = synergyColors[synergy.synergyType] || synergyColors.combo;
                  return (
                    <Link
                      key={synergy._id}
                      href={`/tools/${synergy.otherTool.slug}`}
                      className={`flex items-center gap-3 p-3 border-2 ${colors.border} hover:${colors.bg} transition-colors group`}
                    >
                      <div className="size-10 bg-card border border-border flex items-center justify-center shrink-0">
                        {synergy.otherTool.logoUrl ? (
                          <img src={synergy.otherTool.logoUrl} alt={synergy.otherTool.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary text-sm font-medium truncate">{synergy.otherTool.name}</p>
                        <div className="flex items-center gap-2">
                          <PixelBadge variant="outline" className={`text-[10px] ${colors.text} border-current`}>
                            {synergy.synergyType.toUpperCase()}
                          </PixelBadge>
                          {synergy.synergyScore > 0 && (
                            <span className="text-green-400 text-xs font-mono">+{synergy.synergyScore}</span>
                          )}
                          {synergy.synergyScore < 0 && (
                            <span className="text-red-400 text-xs font-mono">{synergy.synergyScore}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    </Link>
                  );
                })}
              </div>
              {relatedTools.length > 0 && relatedTools[0].description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-muted-foreground text-xs">
                    <span className="text-primary font-medium">TIP:</span> Tools with high synergy scores work well together. Negative scores indicate conflicts or alternatives.
                  </p>
                </div>
              )}
            </PixelCardContent>
          </PixelCard>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {tool.websiteUrl && (
            <a 
              href={tool.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackEvent({ toolId: tool._id, eventType: "click" })}
            >
              <PixelButton>
                <Globe className="w-4 h-4 mr-2" /> VISIT WEBSITE
              </PixelButton>
            </a>
          )}
          {tool.githubUrl && (
            <a 
              href={tool.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackEvent({ toolId: tool._id, eventType: "click" })}
            >
              <PixelButton variant="secondary">
                <Github className="w-4 h-4 mr-2" /> GITHUB
              </PixelButton>
            </a>
          )}
          {tool.docsUrl && (
            <a 
              href={tool.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackEvent({ toolId: tool._id, eventType: "click" })}
            >
              <PixelButton variant="outline">
                <BookOpen className="w-4 h-4 mr-2" /> DOCS
              </PixelButton>
            </a>
          )}
        </div>

        {/* Sponsored Tool Ad */}
        <AdDisplay placement="tool_page" className="mt-8" />
      </main>
    </div>
  );
}
