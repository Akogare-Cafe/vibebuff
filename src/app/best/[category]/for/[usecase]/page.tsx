"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardDescription, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";

const useCaseDescriptions: Record<string, { title: string; description: string; keywords: string[] }> = {
  "startups": {
    title: "Startups",
    description: "Fast-moving teams that need to ship quickly with limited resources",
    keywords: ["startup", "mvp", "lean", "agile"]
  },
  "enterprise": {
    title: "Enterprise",
    description: "Large organizations requiring scalability, security, and compliance",
    keywords: ["enterprise", "corporate", "large-scale", "compliance"]
  },
  "side-projects": {
    title: "Side Projects",
    description: "Personal projects and hobby development with minimal overhead",
    keywords: ["hobby", "personal", "learning", "side-project"]
  },
  "beginners": {
    title: "Beginners",
    description: "Developers just starting their journey who need gentle learning curves",
    keywords: ["beginner", "learning", "tutorial", "easy"]
  },
  "production": {
    title: "Production",
    description: "Battle-tested solutions for mission-critical applications",
    keywords: ["production", "reliable", "stable", "proven"]
  },
  "nextjs": {
    title: "Next.js",
    description: "Tools that integrate seamlessly with the Next.js ecosystem",
    keywords: ["nextjs", "react", "vercel", "ssr"]
  },
  "typescript": {
    title: "TypeScript",
    description: "First-class TypeScript support with excellent type definitions",
    keywords: ["typescript", "types", "type-safe", "intellisense"]
  },
  "serverless": {
    title: "Serverless",
    description: "Cloud-native solutions optimized for serverless architectures",
    keywords: ["serverless", "lambda", "edge", "cloud"]
  },
  "realtime": {
    title: "Realtime Apps",
    description: "Tools optimized for live updates and real-time collaboration",
    keywords: ["realtime", "websocket", "live", "sync"]
  },
  "mobile": {
    title: "Mobile Apps",
    description: "Cross-platform or native mobile development solutions",
    keywords: ["mobile", "ios", "android", "react-native"]
  }
};

const categoryMappings: Record<string, string> = {
  "database": "database",
  "databases": "database",
  "db": "database",
  "auth": "authentication",
  "authentication": "authentication",
  "hosting": "hosting",
  "deploy": "hosting",
  "deployment": "hosting",
  "frontend": "frontend",
  "ui": "frontend",
  "backend": "backend",
  "api": "backend",
  "orm": "database",
  "css": "frontend",
  "styling": "frontend",
  "testing": "testing",
  "analytics": "analytics",
  "payments": "payments",
  "cms": "cms",
  "devops": "devops",
  "monitoring": "monitoring",
  "ai": "ai-ml",
  "ml": "ai-ml",
  "security": "security"
};

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BestForPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const useCaseSlug = params.usecase as string;

  const mappedCategory = categoryMappings[categorySlug.toLowerCase()] || categorySlug;
  const tools = useQuery(api.tools.listByCategory, { categorySlug: mappedCategory });
  const category = useQuery(api.categories.getBySlug, { slug: mappedCategory });

  const useCaseInfo = useCaseDescriptions[useCaseSlug.toLowerCase()] || {
    title: formatSlug(useCaseSlug),
    description: `Tools optimized for ${formatSlug(useCaseSlug).toLowerCase()} use cases`,
    keywords: [useCaseSlug]
  };

  const categoryTitle = category?.name || formatSlug(categorySlug);
  const pageTitle = `Best ${categoryTitle} for ${useCaseInfo.title}`;

  const sortedTools = tools?.slice()
    .map(t => ({ ...t, icon: (t as { icon?: string }).icon }))
    .sort((a, b) => {
      const aScore = (a.githubStars || 0) + (a.stats?.speed || 50) * 100;
      const bScore = (b.githubStars || 0) + (b.stats?.speed || 50) * 100;
      return bScore - aScore;
    });

  const topPicks = sortedTools?.slice(0, 3);
  const otherOptions = sortedTools?.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <PixelBadge variant="secondary">{categoryTitle}</PixelBadge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <PixelBadge variant="outline">{useCaseInfo.title}</PixelBadge>
          </div>
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {useCaseInfo.description}. We&apos;ve analyzed the top {categoryTitle.toLowerCase()} tools 
            to help you find the perfect fit for your {useCaseInfo.title.toLowerCase()} needs.
          </p>
        </div>

        {topPicks && topPicks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Top Picks
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {topPicks.map((tool, index) => (
                <PixelCard key={tool._id} className="relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <PixelBadge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </PixelBadge>
                  </div>
                  <PixelCardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <DynamicIcon name={tool.icon || "Package"} className="w-6 h-6" />
                      </div>
                      <div>
                        <PixelCardTitle>{tool.name}</PixelCardTitle>
                        <PixelBadge variant="outline" className="text-xs">
                          {tool.pricingModel.replace("_", " ")}
                        </PixelBadge>
                      </div>
                    </div>
                    <PixelCardDescription>{tool.tagline}</PixelCardDescription>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{tool.githubStars ? `${(tool.githubStars / 1000).toFixed(1)}K stars` : "Growing community"}</span>
                      </div>
                      <div className="space-y-1">
                        {tool.pros.slice(0, 2).map((pro, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link href={`/tools/${tool.slug}`} className="flex-1">
                          <PixelButton variant="default" className="w-full">
                            View Details
                          </PixelButton>
                        </Link>
                        {tool.websiteUrl && (
                          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <PixelButton variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </PixelButton>
                          </a>
                        )}
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
            </div>
          </section>
        )}

        {otherOptions && otherOptions.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Other Options
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {otherOptions.map((tool) => (
                <Link key={tool._id} href={`/tools/${tool.slug}`}>
                  <PixelCard className="hover:border-primary transition-colors cursor-pointer h-full">
                    <PixelCardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <DynamicIcon name={tool.icon || "Package"} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{tool.tagline}</p>
                        </div>
                        <PixelBadge variant="outline" className="flex-shrink-0">
                          {tool.pricingModel.replace("_", " ")}
                        </PixelBadge>
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                How We Ranked These Tools
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold mb-2">Community & Adoption</h4>
                  <p className="text-sm text-muted-foreground">
                    GitHub stars, npm downloads, and community activity
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Developer Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Documentation quality, learning curve, and tooling
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Use Case Fit</h4>
                  <p className="text-sm text-muted-foreground">
                    How well the tool matches {useCaseInfo.title.toLowerCase()} requirements
                  </p>
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Related Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {topPicks?.slice(0, 2).map((tool1, i) => 
              topPicks?.slice(i + 1, 3).map((tool2) => (
                <Link 
                  key={`${tool1.slug}-${tool2.slug}`}
                  href={`/compare/${[tool1.slug, tool2.slug].sort().join("-vs-")}`}
                >
                  <PixelBadge variant="outline" className="cursor-pointer hover:bg-muted">
                    {tool1.name} vs {tool2.name}
                  </PixelBadge>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
