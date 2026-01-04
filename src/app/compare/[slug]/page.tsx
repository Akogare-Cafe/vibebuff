import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Star,
  CheckCircle,
  XCircle,
  Scale,
  Zap,
  Users,
  DollarSign,
  BookOpen,
  Globe,
  Github,
  ChevronRight,
  HelpCircle,
  Trophy,
  Target,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { ComparisonViewTracker } from "./view-tracker";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await fetchQuery(api.seo.getComparisonBySlug, { slug });

  if (!comparison) {
    return {
      title: "Comparison Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

  return {
    title: comparison.title,
    description: comparison.metaDescription,
    keywords: [
      `${comparison.tool1?.name} vs ${comparison.tool2?.name}`,
      `${comparison.tool1?.name} comparison`,
      `${comparison.tool2?.name} comparison`,
      "developer tools comparison",
      "tech stack comparison",
    ],
    openGraph: {
      title: comparison.title,
      description: comparison.metaDescription,
      type: "article",
      url: `${siteUrl}/compare/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: comparison.title,
      description: comparison.metaDescription,
    },
    alternates: {
      canonical: `${siteUrl}/compare/${slug}`,
    },
  };
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 truncate">{label}</span>
      <div className="flex-1 h-2 bg-card border border-border">
        <div
          className="h-full bg-primary"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-primary w-8 text-right">{score}</span>
    </div>
  );
}

function ComparisonCategory({
  category,
  tool1Name,
  tool2Name,
  tool1Score,
  tool2Score,
  tool1Reason,
  tool2Reason,
}: {
  category: string;
  tool1Name: string;
  tool2Name: string;
  tool1Score: number;
  tool2Score: number;
  tool1Reason: string;
  tool2Reason: string;
}) {
  const winner = tool1Score > tool2Score ? tool1Name : tool2Score > tool1Score ? tool2Name : "Tie";

  return (
    <div className="border-2 border-border p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-primary text-sm font-bold">{category.toUpperCase()}</h3>
        {winner !== "Tie" && (
          <PixelBadge variant="default" className="text-[6px]">
            <Trophy className="w-2 h-2 mr-1" />
            {winner}
          </PixelBadge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground text-xs">{tool1Name}</span>
            <span className="text-primary text-sm font-bold">{tool1Score}/100</span>
          </div>
          <div className="h-2 bg-[#000] border border-border mb-2">
            <div
              className="h-full bg-primary"
              style={{ width: `${tool1Score}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">{tool1Reason}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground text-xs">{tool2Name}</span>
            <span className="text-primary text-sm font-bold">{tool2Score}/100</span>
          </div>
          <div className="h-2 bg-[#000] border border-border mb-2">
            <div
              className="h-full bg-primary"
              style={{ width: `${tool2Score}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">{tool2Reason}</p>
        </div>
      </div>
    </div>
  );
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = await fetchQuery(api.seo.getComparisonBySlug, { slug });

  if (!comparison || !comparison.tool1 || !comparison.tool2) {
    notFound();
  }

  const { tool1, tool2 } = comparison;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comparison.title,
    description: comparison.metaDescription,
    datePublished: new Date(comparison.generatedAt).toISOString(),
    dateModified: new Date(comparison.lastUpdated).toISOString(),
    author: {
      "@type": "Organization",
      name: "VIBEBUFF",
    },
    publisher: {
      "@type": "Organization",
      name: "VIBEBUFF",
    },
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparison.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <ComparisonViewTracker slug={slug} />

      <div className="min-h-screen bg-background">
        <section className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/compare"
            className="inline-flex items-center text-muted-foreground hover:text-primary text-sm mb-6"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            BACK TO COMPARISONS
          </Link>

          <header className="text-center mb-8">
            <h1 className="text-primary text-lg mb-4">{comparison.title}</h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              {comparison.introduction}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  {tool1.name}
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <p className="text-muted-foreground text-sm mb-4">{tool1.tagline}</p>
                <p className="text-muted-foreground text-xs mb-4">{comparison.tool1Summary}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <PixelBadge variant={tool1.isOpenSource ? "default" : "outline"}>
                    {tool1.isOpenSource ? "OPEN SOURCE" : "PROPRIETARY"}
                  </PixelBadge>
                  <PixelBadge variant="outline">
                    {tool1.pricingModel.toUpperCase().replace("_", " ")}
                  </PixelBadge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-primary text-xs">STRENGTHS:</p>
                  {tool1.pros.slice(0, 3).map((pro, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-xs">{pro}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-primary text-xs">WEAKNESSES:</p>
                  {tool1.cons.slice(0, 3).map((con, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-xs">{con}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  {tool1.websiteUrl && (
                    <a href={tool1.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <PixelButton variant="outline" size="sm">
                        <Globe className="w-3 h-3 mr-1" /> WEBSITE
                      </PixelButton>
                    </a>
                  )}
                  {tool1.githubUrl && (
                    <a href={tool1.githubUrl} target="_blank" rel="noopener noreferrer">
                      <PixelButton variant="outline" size="sm">
                        <Github className="w-3 h-3 mr-1" /> GITHUB
                      </PixelButton>
                    </a>
                  )}
                </div>
              </PixelCardContent>
            </PixelCard>

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  {tool2.name}
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent>
                <p className="text-muted-foreground text-sm mb-4">{tool2.tagline}</p>
                <p className="text-muted-foreground text-xs mb-4">{comparison.tool2Summary}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <PixelBadge variant={tool2.isOpenSource ? "default" : "outline"}>
                    {tool2.isOpenSource ? "OPEN SOURCE" : "PROPRIETARY"}
                  </PixelBadge>
                  <PixelBadge variant="outline">
                    {tool2.pricingModel.toUpperCase().replace("_", " ")}
                  </PixelBadge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-primary text-xs">STRENGTHS:</p>
                  {tool2.pros.slice(0, 3).map((pro, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-xs">{pro}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-primary text-xs">WEAKNESSES:</p>
                  {tool2.cons.slice(0, 3).map((con, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-xs">{con}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  {tool2.websiteUrl && (
                    <a href={tool2.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <PixelButton variant="outline" size="sm">
                        <Globe className="w-3 h-3 mr-1" /> WEBSITE
                      </PixelButton>
                    </a>
                  )}
                  {tool2.githubUrl && (
                    <a href={tool2.githubUrl} target="_blank" rel="noopener noreferrer">
                      <PixelButton variant="outline" size="sm">
                        <Github className="w-3 h-3 mr-1" /> GITHUB
                      </PixelButton>
                    </a>
                  )}
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>

          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                HEAD-TO-HEAD COMPARISON
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-4">
                {comparison.comparisonPoints.map((point, i) => (
                  <ComparisonCategory
                    key={i}
                    category={point.category}
                    tool1Name={tool1.name}
                    tool2Name={tool2.name}
                    tool1Score={point.tool1Score}
                    tool2Score={point.tool2Score}
                    tool1Reason={point.tool1Reason}
                    tool2Reason={point.tool2Reason}
                  />
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                VERDICT
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="text-muted-foreground text-sm">{comparison.verdict}</p>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                USE CASE RECOMMENDATIONS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-4">
                {comparison.useCaseRecommendations.map((rec, i) => (
                  <div key={i} className="border-2 border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-primary text-sm">{rec.useCase}</h4>
                      <PixelBadge variant="default">{rec.recommendedTool}</PixelBadge>
                    </div>
                    <p className="text-muted-foreground text-xs">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="mb-8">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FREQUENTLY ASKED QUESTIONS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-4">
                {comparison.faqs.map((faq, i) => (
                  <div key={i} className="border-b-2 border-border pb-4 last:border-b-0">
                    <h4 className="text-primary text-sm mb-2">{faq.question}</h4>
                    <p className="text-muted-foreground text-xs">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>

          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-4">
              WANT TO COMPARE MORE TOOLS?
            </p>
            <Link href="/compare">
              <PixelButton>
                <Scale className="w-4 h-4 mr-2" />
                EXPLORE ALL COMPARISONS
              </PixelButton>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
