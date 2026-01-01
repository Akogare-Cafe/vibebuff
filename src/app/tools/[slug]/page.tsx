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
  Tag
} from "lucide-react";

export default function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const tool = useQuery(api.tools.getBySlug, { slug });
  const trackEvent = useMutation(api.popularity.trackEvent);
  const hasTrackedView = useRef(false);

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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <p className="text-[#60a5fa] text-sm pixel-loading">LOADING...</p>
      </div>
    );
  }

  if (tool === null) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#60a5fa] text-lg mb-4">ITEM NOT FOUND</p>
          <Link href="/tools">
            <PixelButton><ArrowLeft className="w-3 h-3 mr-1" /> BACK TO INVENTORY</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-[10px] flex items-center gap-1">
          <Link href="/tools" className="text-[#3b82f6] hover:text-[#60a5fa]">
            INVENTORY
          </Link>
          <ChevronRight className="w-3 h-3 text-[#1e3a5f]" />
          {tool.category && (
            <>
              <Link 
                href={`/tools?category=${tool.category.slug}`} 
                className="text-[#3b82f6] hover:text-[#60a5fa]"
              >
                {tool.category.name.toUpperCase()}
              </Link>
              <ChevronRight className="w-3 h-3 text-[#1e3a5f]" />
            </>
          )}
          <span className="text-[#60a5fa]">{tool.name.toUpperCase()}</span>
        </div>

        {/* Tool Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[#60a5fa] text-xl mb-2 pixel-glow">{tool.name}</h1>
              <p className="text-[#3b82f6] text-[12px]">{tool.tagline}</p>
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
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <PixelCard className="mb-8">
          <PixelCardContent className="py-4">
            <div className="flex flex-wrap justify-around gap-4 text-center">
              {tool.githubStars && (
                <div>
                  <p className="text-[#60a5fa] text-lg flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" /> {(tool.githubStars / 1000).toFixed(0)}K
                  </p>
                  <p className="text-[#3b82f6] text-[8px]">GITHUB STARS</p>
                </div>
              )}
              {tool.category && (
                <div>
                  <p className="text-[#60a5fa] text-lg">{tool.category.icon}</p>
                  <p className="text-[#3b82f6] text-[8px]">{tool.category.name.toUpperCase()}</p>
                </div>
              )}
              <div>
                <p className="text-[#60a5fa] text-lg flex items-center justify-center">
                  {tool.isFeatured ? <Star className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                </p>
                <p className="text-[#3b82f6] text-[8px]">
                  {tool.isFeatured ? "LEGENDARY" : "COMMON"}
                </p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Description */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> DESCRIPTION
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="text-[#3b82f6] text-[10px] leading-relaxed">
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
                  <li key={i} className="text-[#3b82f6] text-[10px] flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-[#60a5fa] shrink-0" />
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
              <PixelCardTitle className="text-[#60a5fa] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> STRENGTHS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <ul className="space-y-2">
                {tool.pros.map((pro, i) => (
                  <li key={i} className="text-[#3b82f6] text-[10px] flex items-start gap-2">
                    <span className="text-[#60a5fa]">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </PixelCardContent>
          </PixelCard>

          {/* Cons */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="text-[#3b82f6] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> WEAKNESSES
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <ul className="space-y-2">
                {tool.cons.map((con, i) => (
                  <li key={i} className="text-[#3b82f6] text-[10px] flex items-start gap-2">
                    <span className="text-[#1e3a5f]">-</span>
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
                        ? "border-[#3b82f6] bg-[#0a1628]" 
                        : "border-[#1e3a5f]"
                    }`}
                  >
                    {tier.isPopular && (
                      <PixelBadge variant="default" className="mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3" /> POPULAR
                      </PixelBadge>
                    )}
                    <h4 className="text-[#60a5fa] text-[12px] mb-2">{tier.name}</h4>
                    <p className="text-[#60a5fa] text-lg mb-3">
                      {tier.priceMonthly === 0 ? "FREE" : `$${tier.priceMonthly}/MO`}
                    </p>
                    <ul className="space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-[#3b82f6] text-[8px] flex items-start gap-1">
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
          <p className="text-[#60a5fa] text-[10px] mb-2 flex items-center gap-1">
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
      </main>
    </div>
  );
}
