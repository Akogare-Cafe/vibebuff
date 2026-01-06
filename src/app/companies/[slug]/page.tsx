"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  Medal,
  Users,
  Globe,
  MapPin,
  Brain,
  Loader2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Cpu,
  Database,
  Bot,
  Wrench,
  Cloud,
  Zap,
} from "lucide-react";
import { CompanySchema, BreadcrumbSchema } from "@/components/seo-structured-data";

const categoryIcons: Record<string, React.ReactNode> = {
  "LLM Provider": <Brain className="w-4 h-4" />,
  "ML Framework": <Cpu className="w-4 h-4" />,
  "Vector Database": <Database className="w-4 h-4" />,
  "AI Platform": <Sparkles className="w-4 h-4" />,
  "AI Assistant": <Bot className="w-4 h-4" />,
  "AI Infrastructure": <Cloud className="w-4 h-4" />,
  "AI API": <Zap className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  "LLM Provider": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "ML Framework": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Vector Database": "bg-green-500/20 text-green-400 border-green-500/30",
  "AI Platform": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "AI Assistant": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "AI Infrastructure": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "AI API": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const company = useQuery(api.companies.getBySlug, { slug });
  const aiTechStack = useQuery(
    api.companies.getAiTechStack,
    company?._id ? { companyId: company._id } : "skip"
  );
  const techStack = useQuery(
    api.companies.getTechStack,
    company?._id ? { companyId: company._id } : "skip"
  );
  const members = useQuery(
    api.companies.getMembers,
    company?._id ? { companyId: company._id } : "skip"
  );

  const scrapeAiTechStack = useAction(api.companies.scrapeAiTechStack);

  const handleScrape = async () => {
    if (!company || !user) return;

    setIsScraping(true);
    setScrapeMessage(null);

    try {
      const result = await scrapeAiTechStack({
        companyId: company._id,
        userId: user.id,
        websiteUrl: company.websiteUrl,
        companyName: company.name,
      });

      setScrapeMessage(result.message);
    } catch (error) {
      setScrapeMessage(
        error instanceof Error ? error.message : "Failed to scrape"
      );
    } finally {
      setIsScraping(false);
    }
  };

  if (company === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/companies"
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Companies
          </Link>
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Company Not Found
            </h1>
            <p className="text-muted-foreground">
              The company you are looking for does not exist.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isOwnerOrAdmin =
    user &&
    members?.some(
      (m) =>
        m.userId === user.id && (m.role === "owner" || m.role === "admin")
    );

  const groupedAiTools =
    aiTechStack?.aiTools?.reduce(
      (acc, tool) => {
        const category = tool.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
      },
      {} as Record<string, typeof aiTechStack.aiTools>
    ) || {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

  return (
    <div className="min-h-screen bg-background">
      <CompanySchema
        company={{
          name: company.name,
          description: company.description,
          url: `${siteUrl}/companies/${company.slug}`,
          logoUrl: company.logoUrl,
          websiteUrl: company.websiteUrl,
          industry: company.industry,
          location: company.location,
          memberCount: company.memberCount,
          aiTools: aiTechStack?.aiTools?.map((t) => ({
            name: t.name,
            category: t.category,
          })),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: siteUrl },
          { name: "Companies", url: `${siteUrl}/companies` },
          { name: company.name, url: `${siteUrl}/companies/${company.slug}` },
        ]}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/companies"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Companies
        </Link>

        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="size-20 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-foreground text-2xl">
                  {company.name}
                </h1>
                {company.isVerified && (
                  <Medal className="w-5 h-5 text-primary" />
                )}
              </div>
              {company.description && (
                <p className="text-muted-foreground text-sm mb-2">
                  {company.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {company.memberCount} members
                </span>
                {company.industry && (
                  <PixelBadge variant="outline">{company.industry}</PixelBadge>
                )}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {company.location}
                  </span>
                )}
                {company.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4" /> Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PixelCard>
              <PixelCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-foreground text-lg">
                      AI TECH STACK
                    </h2>
                  </div>
                  {isOwnerOrAdmin && (
                    <PixelButton
                      onClick={handleScrape}
                      disabled={isScraping}
                      variant="outline"
                      size="sm"
                    >
                      {isScraping ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : aiTechStack ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Rescan
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Discover AI Stack
                        </>
                      )}
                    </PixelButton>
                  )}
                </div>

                {scrapeMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      scrapeMessage.includes("Found")
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {scrapeMessage}
                  </div>
                )}

                {aiTechStack?.status === "scraping" && (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Discovering AI tech stack...</span>
                  </div>
                )}

                {aiTechStack?.status === "failed" && (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">
                      Failed to discover AI stack
                    </p>
                    {aiTechStack.error && (
                      <p className="text-red-400 text-xs mt-2">
                        {aiTechStack.error}
                      </p>
                    )}
                  </div>
                )}

                {aiTechStack?.status === "completed" &&
                  aiTechStack.aiTools.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground text-sm">
                        No AI tools discovered for this company
                      </p>
                    </div>
                  )}

                {aiTechStack?.status === "completed" &&
                  aiTechStack.aiTools.length > 0 && (
                    <div className="space-y-4">
                      {Object.entries(groupedAiTools).map(
                        ([category, tools]) => (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-2">
                              {categoryIcons[category] || (
                                <Cpu className="w-4 h-4" />
                              )}
                              <h3 className="text-sm font-medium text-foreground">
                                {category}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                ({tools.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {tools.map((tool, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg border ${
                                    categoryColors[category] ||
                                    "bg-muted/50 border-border"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      {tool.matchedTool?.logoUrl ? (
                                        <img
                                          src={tool.matchedTool.logoUrl}
                                          alt={tool.name}
                                          className="w-6 h-6 rounded"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded bg-background/50 flex items-center justify-center">
                                          <Cpu className="w-3 h-3" />
                                        </div>
                                      )}
                                      <div>
                                        {tool.matchedTool ? (
                                          <Link
                                            href={`/tools/${tool.matchedTool.slug}`}
                                            className="font-medium text-sm hover:underline"
                                          >
                                            {tool.name}
                                          </Link>
                                        ) : (
                                          <span className="font-medium text-sm">
                                            {tool.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <PixelBadge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {tool.confidence}%
                                    </PixelBadge>
                                  </div>
                                  {tool.description && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                      {tool.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}

                      {aiTechStack.rawData && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground italic">
                            {aiTechStack.rawData}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-4">
                        Last updated:{" "}
                        {new Date(aiTechStack.scrapedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                {!aiTechStack && !isScraping && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm mb-4">
                      Discover what AI tools this company uses
                    </p>
                    {isOwnerOrAdmin ? (
                      <PixelButton onClick={handleScrape}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Discover AI Stack
                      </PixelButton>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Only company admins can discover the AI stack
                      </p>
                    )}
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>

            {techStack && Object.keys(techStack).length > 0 && (
              <PixelCard>
                <PixelCardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-foreground text-lg">
                      FULL TECH STACK
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(techStack).map(([category, tools]) => (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {tools.map((entry) =>
                            entry.tool ? (
                              <Link
                                key={entry._id}
                                href={`/tools/${entry.tool.slug}`}
                              >
                                <PixelBadge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-primary/20"
                                >
                                  {entry.tool.logoUrl && (
                                    <img
                                      src={entry.tool.logoUrl}
                                      alt={entry.tool.name}
                                      className="w-4 h-4 rounded mr-1"
                                    />
                                  )}
                                  {entry.tool.name}
                                </PixelBadge>
                              </Link>
                            ) : null
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </PixelCardContent>
              </PixelCard>
            )}
          </div>

          <div className="space-y-6">
            <PixelCard>
              <PixelCardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-heading text-foreground text-lg">
                    TEAM
                  </h2>
                </div>
                <div className="space-y-3">
                  {members?.slice(0, 10).map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3"
                    >
                      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.username || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role}
                          {member.title && ` - ${member.title}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {members && members.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{members.length - 10} more members
                    </p>
                  )}
                </div>
              </PixelCardContent>
            </PixelCard>

            {company.size && (
              <PixelCard>
                <PixelCardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Company Size
                  </h3>
                  <p className="text-2xl font-bold text-foreground">
                    {company.size}
                  </p>
                  <p className="text-xs text-muted-foreground">employees</p>
                </PixelCardContent>
              </PixelCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
