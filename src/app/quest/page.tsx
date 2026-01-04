"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Star,
  Swords,
  RefreshCw,
  Package,
  Play,
  Briefcase,
  ShoppingCart,
  FileText,
  LayoutDashboard,
  Zap,
  Smartphone,
  Wrench,
  Bot,
  Home,
  Rocket,
  TrendingUp,
  Building2,
  CircleDollarSign,
  Banknote,
  Wallet,
  Gem,
  Lock,
  Database,
  HardDrive,
  CreditCard,
  Mail,
  Search,
  BarChart3,
  FileEdit,
  Layers,
  type LucideIcon
} from "lucide-react";
import { LoadoutStackVisual } from "@/components/loadout-stack-visual";

type Step = "intro" | "type" | "scale" | "budget" | "features" | "results";

interface QuestAnswers {
  projectType: string;
  scale: string;
  budget: string;
  features: string[];
}

const PROJECT_TYPES: { id: string; name: string; icon: LucideIcon; description: string }[] = [
  { id: "saas", name: "SaaS App", icon: Briefcase, description: "Subscription-based software" },
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingCart, description: "Online store or marketplace" },
  { id: "blog", name: "Blog/Portfolio", icon: FileText, description: "Content site or personal page" },
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, description: "Data visualization & admin" },
  { id: "realtime", name: "Realtime App", icon: Zap, description: "Chat, collaboration, gaming" },
  { id: "mobile", name: "Mobile App", icon: Smartphone, description: "iOS/Android application" },
  { id: "api", name: "API/Backend", icon: Wrench, description: "Backend service or API" },
  { id: "ai", name: "AI/ML App", icon: Bot, description: "AI-powered application" },
];

const SCALES: { id: string; name: string; icon: LucideIcon; users: string; budget: string }[] = [
  { id: "hobby", name: "Hobby", icon: Home, users: "< 100 users", budget: "Free - $20/mo" },
  { id: "startup", name: "Startup", icon: Rocket, users: "100 - 10K users", budget: "$20 - $200/mo" },
  { id: "growth", name: "Growth", icon: TrendingUp, users: "10K - 100K users", budget: "$200 - $2K/mo" },
  { id: "enterprise", name: "Enterprise", icon: Building2, users: "100K+ users", budget: "$2K+/mo" },
];

const BUDGETS: { id: string; name: string; icon: LucideIcon; range: string }[] = [
  { id: "free", name: "Free Only", icon: CircleDollarSign, range: "$0/mo" },
  { id: "low", name: "Budget", icon: Banknote, range: "$1 - $50/mo" },
  { id: "medium", name: "Standard", icon: Wallet, range: "$50 - $200/mo" },
  { id: "high", name: "Premium", icon: Gem, range: "$200+/mo" },
];

const FEATURES: { id: string; name: string; icon: LucideIcon }[] = [
  { id: "auth", name: "Authentication", icon: Lock },
  { id: "database", name: "Database", icon: Database },
  { id: "realtime", name: "Realtime", icon: Zap },
  { id: "storage", name: "File Storage", icon: HardDrive },
  { id: "payments", name: "Payments", icon: CreditCard },
  { id: "email", name: "Email", icon: Mail },
  { id: "search", name: "Search", icon: Search },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "ai", name: "AI/LLM", icon: Bot },
  { id: "cms", name: "CMS", icon: FileEdit },
];

export default function QuestPage() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<QuestAnswers>({
    projectType: "",
    scale: "",
    budget: "",
    features: [],
  });

  const categories = useQuery(api.categories.list);
  const allTools = useQuery(api.tools.list, { limit: 100 });

  const handleSelectType = (type: string) => {
    setAnswers({ ...answers, projectType: type });
    setStep("scale");
  };

  const handleSelectScale = (scale: string) => {
    setAnswers({ ...answers, scale });
    setStep("budget");
  };

  const handleSelectBudget = (budget: string) => {
    setAnswers({ ...answers, budget });
    setStep("features");
  };

  const handleToggleFeature = (feature: string) => {
    const features = answers.features.includes(feature)
      ? answers.features.filter((f) => f !== feature)
      : [...answers.features, feature];
    setAnswers({ ...answers, features });
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<{
    recommendations: Record<string, Array<{
      id: string;
      name: string;
      slug: string;
      tagline: string;
      reasoning: string;
      confidence: number;
    }>>;
    aiReasoning: string;
    estimatedMonthlyCost: string;
  } | null>(null);

  const generateAIRecommendations = useAction(api.ai.generateRecommendations);

  const handleComplete = async () => {
    setIsGenerating(true);
    setStep("results");
    
    try {
      const result = await generateAIRecommendations({
        projectType: answers.projectType,
        scale: answers.scale,
        budget: answers.budget,
        features: answers.features,
      });
      setAiRecommendations(result);
    } catch (error) {
      console.error("AI recommendation error:", error);
      setAiRecommendations(getFallbackRecommendations());
    } finally {
      setIsGenerating(false);
    }
  };

  const getFallbackRecommendations = () => {
    if (!allTools || !categories) return null;

    const budgetFilter = (tool: (typeof allTools)[0]) => {
      if (answers.budget === "free") {
        return tool.pricingModel === "free" || tool.pricingModel === "open_source";
      }
      if (answers.budget === "low") {
        return tool.pricingModel !== "enterprise";
      }
      return true;
    };

    const recommendations: Record<string, Array<{
      id: string;
      name: string;
      slug: string;
      tagline: string;
      reasoning: string;
      confidence: number;
    }>> = {};

    categories.forEach((cat) => {
      const categoryTools = allTools
        .filter((t) => t.categoryId === cat._id)
        .filter(budgetFilter)
        .slice(0, 3);
      
      if (categoryTools.length > 0) {
        recommendations[cat.name] = categoryTools.map((tool, index) => ({
          id: tool._id as string,
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
          reasoning: tool.bestFor?.[0] || tool.pros?.[0] || "Popular choice",
          confidence: 90 - index * 10,
        }));
      }
    });

    const costEstimates: Record<string, string> = {
      free: "$0/month",
      low: "$10-50/month",
      medium: "$50-150/month",
      high: "$200-500/month",
    };

    return {
      recommendations,
      aiReasoning: `Based on your ${answers.projectType} project at ${answers.scale} scale with a ${answers.budget} budget, we've selected tools that balance cost, features, and scalability.`,
      estimatedMonthlyCost: costEstimates[answers.budget] || "Varies",
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Progress Bar */}
        {step !== "intro" && step !== "results" && (
          <div className="mb-8">
            <div className="flex gap-2 mb-2">
              {["type", "scale", "budget", "features"].map((s, i) => (
                <div
                  key={s}
                  className={`h-4 flex-1 border-2 border-border ${
                    ["type", "scale", "budget", "features"].indexOf(step) >= i
                      ? "bg-primary"
                      : "bg-card"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-xs text-center">
              STAGE {["type", "scale", "budget", "features"].indexOf(step) + 1} OF 4
            </p>
          </div>
        )}

        {/* Intro Step */}
        {step === "intro" && (
          <div className="text-center">
            <div className="mb-8">
              <pre className="text-primary text-xs leading-none inline-block mb-4">
{`
 ██████╗ ██╗   ██╗███████╗███████╗████████╗
██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
██║   ██║██║   ██║█████╗  ███████╗   ██║   
██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
╚██████╔╝╚██████╔╝███████╗███████║   ██║   
 ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   
`}
              </pre>
              <h1 className="text-primary text-lg mb-4">BEGIN YOUR QUEST</h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                ANSWER A FEW QUESTIONS AND OUR AI WILL RECOMMEND THE PERFECT TECH STACK FOR YOUR PROJECT.
              </p>
            </div>

            <PixelCard className="inline-block p-8 mb-8">
              <Swords className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-primary text-sm mb-4">
                READY TO CHOOSE YOUR LOADOUT?
              </p>
              <PixelButton size="lg" onClick={() => setStep("type")}>
                <Play className="w-4 h-4 mr-2" /> START QUEST
              </PixelButton>
            </PixelCard>

            <div className="text-muted-foreground text-xs">
              <p>ESTIMATED TIME: 2 MINUTES</p>
            </div>
          </div>
        )}

        {/* Project Type Step */}
        {step === "type" && (
          <div>
            <h2 className="text-primary text-sm mb-2 text-center">
              WHAT ARE YOU BUILDING?
            </h2>
            <p className="text-muted-foreground text-sm mb-8 text-center">
              SELECT YOUR PROJECT TYPE
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
              {PROJECT_TYPES.map((type) => (
                <PixelCard
                  key={type.id}
                  className={`cursor-pointer text-center p-4 md:p-5 min-h-[120px] md:min-h-[140px] ${
                    answers.projectType === type.id ? "bg-primary" : ""
                  }`}
                  onClick={() => handleSelectType(type.id)}
                >
                  <div className="flex justify-center mb-2 md:mb-3">
                    <type.icon className={`w-8 h-8 md:w-10 md:h-10 ${answers.projectType === type.id ? "text-background" : "text-primary"}`} />
                  </div>
                  <p className={`text-sm md:text-xs mb-1 ${
                    answers.projectType === type.id ? "text-background" : "text-primary"
                  }`}>
                    {type.name}
                  </p>
                  <p className={`text-xs ${
                    answers.projectType === type.id ? "text-[#191022]" : "text-muted-foreground"
                  }`}>
                    {type.description}
                  </p>
                </PixelCard>
              ))}
            </div>
          </div>
        )}

        {/* Scale Step */}
        {step === "scale" && (
          <div>
            <h2 className="text-primary text-sm mb-2 text-center">
              WHAT&apos;S YOUR SCALE?
            </h2>
            <p className="text-muted-foreground text-sm mb-8 text-center">
              SELECT YOUR EXPECTED USER BASE
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
              {SCALES.map((scale) => (
                <PixelCard
                  key={scale.id}
                  className={`cursor-pointer text-center p-4 md:p-5 min-h-[120px] md:min-h-[140px] ${
                    answers.scale === scale.id ? "bg-primary" : ""
                  }`}
                  onClick={() => handleSelectScale(scale.id)}
                >
                  <div className="flex justify-center mb-2 md:mb-3">
                    <scale.icon className={`w-8 h-8 md:w-10 md:h-10 ${answers.scale === scale.id ? "text-background" : "text-primary"}`} />
                  </div>
                  <p className={`text-sm md:text-xs mb-1 ${
                    answers.scale === scale.id ? "text-background" : "text-primary"
                  }`}>
                    {scale.name}
                  </p>
                  <p className={`text-xs ${
                    answers.scale === scale.id ? "text-[#191022]" : "text-muted-foreground"
                  }`}>
                    {scale.users}
                  </p>
                </PixelCard>
              ))}
            </div>

            <div className="mt-8 text-center">
              <PixelButton variant="ghost" onClick={() => setStep("type")}>
                <ArrowLeft className="w-3 h-3 mr-1" /> BACK
              </PixelButton>
            </div>
          </div>
        )}

        {/* Budget Step */}
        {step === "budget" && (
          <div>
            <h2 className="text-primary text-sm mb-2 text-center">
              WHAT&apos;S YOUR BUDGET?
            </h2>
            <p className="text-muted-foreground text-sm mb-8 text-center">
              SELECT YOUR MONTHLY BUDGET FOR TOOLS
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
              {BUDGETS.map((budget) => (
                <PixelCard
                  key={budget.id}
                  className={`cursor-pointer text-center p-4 md:p-5 min-h-[120px] md:min-h-[140px] ${
                    answers.budget === budget.id ? "bg-primary" : ""
                  }`}
                  onClick={() => handleSelectBudget(budget.id)}
                >
                  <div className="flex justify-center mb-2 md:mb-3">
                    <budget.icon className={`w-8 h-8 md:w-10 md:h-10 ${answers.budget === budget.id ? "text-background" : "text-primary"}`} />
                  </div>
                  <p className={`text-sm md:text-xs mb-1 ${
                    answers.budget === budget.id ? "text-background" : "text-primary"
                  }`}>
                    {budget.name}
                  </p>
                  <p className={`text-xs ${
                    answers.budget === budget.id ? "text-[#191022]" : "text-muted-foreground"
                  }`}>
                    {budget.range}
                  </p>
                </PixelCard>
              ))}
            </div>

            <div className="mt-8 text-center">
              <PixelButton variant="ghost" onClick={() => setStep("scale")}>
                <ArrowLeft className="w-3 h-3 mr-1" /> BACK
              </PixelButton>
            </div>
          </div>
        )}

        {/* Features Step */}
        {step === "features" && (
          <div>
            <h2 className="text-primary text-sm mb-2 text-center">
              WHAT FEATURES DO YOU NEED?
            </h2>
            <p className="text-muted-foreground text-sm mb-8 text-center">
              SELECT ALL THAT APPLY
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 mb-8">
              {FEATURES.map((feature) => (
                <PixelCard
                  key={feature.id}
                  className={`cursor-pointer text-center p-4 md:p-5 min-h-[100px] md:min-h-[110px] ${
                    answers.features.includes(feature.id) ? "bg-primary" : ""
                  }`}
                  onClick={() => handleToggleFeature(feature.id)}
                >
                  <div className="flex justify-center mb-2 md:mb-3">
                    <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${answers.features.includes(feature.id) ? "text-background" : "text-primary"}`} />
                  </div>
                  <p className={`text-xs ${
                    answers.features.includes(feature.id) ? "text-background" : "text-primary"
                  }`}>
                    {feature.name}
                  </p>
                </PixelCard>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <PixelButton variant="ghost" onClick={() => setStep("budget")}>
                <ArrowLeft className="w-3 h-3 mr-1" /> BACK
              </PixelButton>
              <PixelButton onClick={handleComplete}>
                GET RECOMMENDATIONS <ArrowRight className="w-3 h-3 ml-1" />
              </PixelButton>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === "results" && (
          <div>
            <div className="text-center mb-8">
              <pre className="text-primary text-[6px] leading-none inline-block mb-4">
{`
██╗      ██████╗  █████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██║     ██╔═══██╗██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
██║     ██║   ██║███████║██║  ██║██║   ██║██║   ██║   ██║   
██║     ██║   ██║██╔══██║██║  ██║██║   ██║██║   ██║   ██║   
███████╗╚██████╔╝██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║   
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   
`}
              </pre>
              <h2 className="text-primary text-sm mb-2">YOUR RECOMMENDED LOADOUT</h2>
              <p className="text-muted-foreground text-sm">
                BASED ON: {PROJECT_TYPES.find(t => t.id === answers.projectType)?.name.toUpperCase()} | {SCALES.find(s => s.id === answers.scale)?.name.toUpperCase()} | {BUDGETS.find(b => b.id === answers.budget)?.name.toUpperCase()}
              </p>
            </div>

            {/* Summary Card */}
            <PixelCard className="mb-8 p-6">
              <div className="flex flex-wrap justify-around gap-4 text-center">
                <div>
                  <div className="flex justify-center mb-2">
                    {(() => {
                      const ProjectIcon = PROJECT_TYPES.find(t => t.id === answers.projectType)?.icon;
                      return ProjectIcon ? <ProjectIcon className="w-8 h-8 text-primary" /> : null;
                    })()}
                  </div>
                  <p className="text-muted-foreground text-xs">PROJECT</p>
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    {(() => {
                      const ScaleIcon = SCALES.find(s => s.id === answers.scale)?.icon;
                      return ScaleIcon ? <ScaleIcon className="w-8 h-8 text-primary" /> : null;
                    })()}
                  </div>
                  <p className="text-muted-foreground text-xs">SCALE</p>
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    {(() => {
                      const BudgetIcon = BUDGETS.find(b => b.id === answers.budget)?.icon;
                      return BudgetIcon ? <BudgetIcon className="w-8 h-8 text-primary" /> : null;
                    })()}
                  </div>
                  <p className="text-muted-foreground text-xs">BUDGET</p>
                </div>
                <div>
                  <p className="text-primary text-lg mb-2">{answers.features.length}</p>
                  <p className="text-muted-foreground text-xs">FEATURES</p>
                </div>
              </div>
            </PixelCard>

            {/* Loading State */}
            {isGenerating && (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-primary text-sm mb-2">AI IS ANALYZING YOUR REQUIREMENTS...</p>
                <p className="text-muted-foreground text-xs">THIS MAY TAKE A FEW SECONDS</p>
              </div>
            )}

            {/* AI Reasoning */}
            {!isGenerating && aiRecommendations && (
              <PixelCard className="mb-8 p-4 border-primary">
                <div className="flex items-start gap-3">
                  <Bot className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
                  <div>
                    <p className="text-primary text-sm mb-2">AI ANALYSIS</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{aiRecommendations.aiReasoning}</p>
                    <p className="text-primary text-sm mt-3">
                      ESTIMATED COST: {aiRecommendations.estimatedMonthlyCost}
                    </p>
                  </div>
                </div>
              </PixelCard>
            )}

            {/* Visual Stack Builder */}
            {!isGenerating && aiRecommendations && (
              <div className="mb-8">
                <h3 className="text-primary text-base mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> YOUR STACK VISUAL
                </h3>
                <p className="text-muted-foreground text-xs mb-4">
                  DRAG NODES TO REARRANGE, ADD MORE TOOLS FROM THE PALETTE, OR CONNECT TOOLS BY DRAGGING BETWEEN NODES
                </p>
                <LoadoutStackVisual
                  recommendations={aiRecommendations.recommendations}
                  projectType={PROJECT_TYPES.find(t => t.id === answers.projectType)?.name || answers.projectType}
                  scale={SCALES.find(s => s.id === answers.scale)?.name || answers.scale}
                  budget={BUDGETS.find(b => b.id === answers.budget)?.name || answers.budget}
                  estimatedCost={aiRecommendations.estimatedMonthlyCost}
                />
              </div>
            )}

            {/* Recommendations by Category */}
            {!isGenerating && aiRecommendations && Object.entries(aiRecommendations.recommendations).map(([category, tools]) => (
              <div key={category} className="mb-8">
                <h3 className="text-primary text-base mb-4 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 pixel-cursor" /> {category.toUpperCase()}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {tools.map((tool, index) => (
                    <Link key={tool.id} href={`/tools/${tool.slug}`}>
                      <PixelCard className={`h-full ${index === 0 ? "border-primary" : ""}`}>
                        <PixelCardHeader>
                          <div className="flex items-start justify-between">
                            <PixelCardTitle>
                              {index === 0 && <Star className="w-3 h-3 inline mr-1" />}
                              {tool.name}
                            </PixelCardTitle>
                            <PixelBadge variant={index === 0 ? "default" : "outline"}>
                              {tool.confidence}%
                            </PixelBadge>
                          </div>
                        </PixelCardHeader>
                        <PixelCardContent>
                          <p className="text-muted-foreground text-xs mb-2">{tool.tagline}</p>
                          <p className="text-primary text-xs italic">{tool.reasoning}</p>
                        </PixelCardContent>
                      </PixelCard>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex justify-center gap-4 mt-8">
              <PixelButton variant="ghost" onClick={() => setStep("intro")}>
                <RefreshCw className="w-3 h-3 mr-1" /> START OVER
              </PixelButton>
              <Link href="/tools">
                <PixelButton>
                  <Package className="w-4 h-4 mr-2" /> BROWSE ALL TOOLS
                </PixelButton>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
