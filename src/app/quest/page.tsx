"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import {
  Gamepad2,
  Wrench,
  Compass,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Star,
  Swords,
  RefreshCw,
  Package,
  Play,
  Scale
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

type Step = "intro" | "type" | "scale" | "budget" | "features" | "results";

interface QuestAnswers {
  projectType: string;
  scale: string;
  budget: string;
  features: string[];
}

const PROJECT_TYPES = [
  { id: "saas", name: "SaaS App", icon: "💼", description: "Subscription-based software" },
  { id: "ecommerce", name: "E-Commerce", icon: "🛒", description: "Online store or marketplace" },
  { id: "blog", name: "Blog/Portfolio", icon: "📝", description: "Content site or personal page" },
  { id: "dashboard", name: "Dashboard", icon: "📊", description: "Data visualization & admin" },
  { id: "realtime", name: "Realtime App", icon: "⚡", description: "Chat, collaboration, gaming" },
  { id: "mobile", name: "Mobile App", icon: "📱", description: "iOS/Android application" },
  { id: "api", name: "API/Backend", icon: "🔧", description: "Backend service or API" },
  { id: "ai", name: "AI/ML App", icon: "🤖", description: "AI-powered application" },
];

const SCALES = [
  { id: "hobby", name: "Hobby", icon: "🏠", users: "< 100 users", budget: "Free - $20/mo" },
  { id: "startup", name: "Startup", icon: "🚀", users: "100 - 10K users", budget: "$20 - $200/mo" },
  { id: "growth", name: "Growth", icon: "📈", users: "10K - 100K users", budget: "$200 - $2K/mo" },
  { id: "enterprise", name: "Enterprise", icon: "🏢", users: "100K+ users", budget: "$2K+/mo" },
];

const BUDGETS = [
  { id: "free", name: "Free Only", icon: "🆓", range: "$0/mo" },
  { id: "low", name: "Budget", icon: "💵", range: "$1 - $50/mo" },
  { id: "medium", name: "Standard", icon: "💰", range: "$50 - $200/mo" },
  { id: "high", name: "Premium", icon: "💎", range: "$200+/mo" },
];

const FEATURES = [
  { id: "auth", name: "Authentication", icon: "🔐" },
  { id: "database", name: "Database", icon: "🗄️" },
  { id: "realtime", name: "Realtime", icon: "⚡" },
  { id: "storage", name: "File Storage", icon: "📁" },
  { id: "payments", name: "Payments", icon: "💳" },
  { id: "email", name: "Email", icon: "📧" },
  { id: "search", name: "Search", icon: "🔍" },
  { id: "analytics", name: "Analytics", icon: "📊" },
  { id: "ai", name: "AI/LLM", icon: "🤖" },
  { id: "cms", name: "CMS", icon: "📝" },
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

  const handleComplete = () => {
    setStep("results");
  };

  const getRecommendations = () => {
    if (!allTools || !categories) return null;

    const recommendations: Record<string, typeof allTools> = {};

    // Simple recommendation logic based on answers
    const categoryMap: Record<string, string[]> = {
      frontend: ["frontend", "meta-frameworks"],
      backend: ["backend", "databases"],
      hosting: ["hosting"],
      auth: ["auth"],
      ai: ["llms", "ai-assistants"],
    };

    // Filter tools based on budget
    const budgetFilter = (tool: (typeof allTools)[0]) => {
      if (answers.budget === "free") {
        return tool.pricingModel === "free" || tool.pricingModel === "open_source";
      }
      if (answers.budget === "low") {
        return tool.pricingModel !== "enterprise";
      }
      return true;
    };

    // Get tools by category
    categories.forEach((cat) => {
      const categoryTools = allTools
        .filter((t) => t.categoryId === cat._id)
        .filter(budgetFilter)
        .slice(0, 3);
      
      if (categoryTools.length > 0) {
        recommendations[cat.name] = categoryTools;
      }
    });

    return recommendations;
  };

  const recommendations = step === "results" ? getRecommendations() : null;

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="border-b-4 border-[#1e3a5f] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#3b82f6]" />
            <h1 className="text-[#60a5fa] text-sm pixel-glow">VIBEBUFF</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/tools" className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Tools
            </Link>
            <Link href="/compare" className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1">
              <Scale className="w-3 h-3" />
              Compare
            </Link>
            <Link href="/quest" className="text-[#60a5fa] text-[10px] uppercase flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Quest
            </Link>
            <ThemeSwitcher />
            <UserNav />
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        {step !== "intro" && step !== "results" && (
          <div className="mb-8">
            <div className="flex gap-2 mb-2">
              {["type", "scale", "budget", "features"].map((s, i) => (
                <div
                  key={s}
                  className={`h-4 flex-1 border-2 border-[#1e3a5f] ${
                    ["type", "scale", "budget", "features"].indexOf(step) >= i
                      ? "bg-[#3b82f6]"
                      : "bg-[#0a1628]"
                  }`}
                />
              ))}
            </div>
            <p className="text-[#3b82f6] text-[8px] text-center">
              STAGE {["type", "scale", "budget", "features"].indexOf(step) + 1} OF 4
            </p>
          </div>
        )}

        {/* Intro Step */}
        {step === "intro" && (
          <div className="text-center">
            <div className="mb-8">
              <pre className="text-[#60a5fa] text-[8px] leading-none inline-block mb-4">
{`
 ██████╗ ██╗   ██╗███████╗███████╗████████╗
██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
██║   ██║██║   ██║█████╗  ███████╗   ██║   
██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
╚██████╔╝╚██████╔╝███████╗███████║   ██║   
 ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   
`}
              </pre>
              <h1 className="text-[#60a5fa] text-lg mb-4">BEGIN YOUR QUEST</h1>
              <p className="text-[#3b82f6] text-[10px] max-w-md mx-auto leading-relaxed">
                ANSWER A FEW QUESTIONS AND OUR AI WILL RECOMMEND THE PERFECT TECH STACK FOR YOUR PROJECT.
              </p>
            </div>

            <PixelCard className="inline-block p-8 mb-8">
              <Swords className="w-12 h-12 mx-auto mb-4 text-[#3b82f6]" />
              <p className="text-[#60a5fa] text-[10px] mb-4">
                READY TO CHOOSE YOUR LOADOUT?
              </p>
              <PixelButton size="lg" onClick={() => setStep("type")}>
                <Play className="w-4 h-4 mr-2" /> START QUEST
              </PixelButton>
            </PixelCard>

            <div className="text-[#1e3a5f] text-[8px]">
              <p>ESTIMATED TIME: 2 MINUTES</p>
            </div>
          </div>
        )}

        {/* Project Type Step */}
        {step === "type" && (
          <div>
            <h2 className="text-[#60a5fa] text-sm mb-2 text-center">
              WHAT ARE YOU BUILDING?
            </h2>
            <p className="text-[#3b82f6] text-[10px] mb-8 text-center">
              SELECT YOUR PROJECT TYPE
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROJECT_TYPES.map((type) => (
                <PixelCard
                  key={type.id}
                  className={`cursor-pointer text-center p-4 ${
                    answers.projectType === type.id ? "bg-[#3b82f6]" : ""
                  }`}
                  onClick={() => handleSelectType(type.id)}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <p className={`text-[10px] mb-1 ${
                    answers.projectType === type.id ? "text-[#000000]" : "text-[#60a5fa]"
                  }`}>
                    {type.name}
                  </p>
                  <p className={`text-[8px] ${
                    answers.projectType === type.id ? "text-[#0a1628]" : "text-[#3b82f6]"
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
            <h2 className="text-[#60a5fa] text-sm mb-2 text-center">
              WHAT&apos;S YOUR SCALE?
            </h2>
            <p className="text-[#3b82f6] text-[10px] mb-8 text-center">
              SELECT YOUR EXPECTED USER BASE
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SCALES.map((scale) => (
                <PixelCard
                  key={scale.id}
                  className={`cursor-pointer text-center p-4 ${
                    answers.scale === scale.id ? "bg-[#3b82f6]" : ""
                  }`}
                  onClick={() => handleSelectScale(scale.id)}
                >
                  <div className="text-3xl mb-2">{scale.icon}</div>
                  <p className={`text-[10px] mb-1 ${
                    answers.scale === scale.id ? "text-[#000000]" : "text-[#60a5fa]"
                  }`}>
                    {scale.name}
                  </p>
                  <p className={`text-[8px] ${
                    answers.scale === scale.id ? "text-[#0a1628]" : "text-[#3b82f6]"
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
            <h2 className="text-[#60a5fa] text-sm mb-2 text-center">
              WHAT&apos;S YOUR BUDGET?
            </h2>
            <p className="text-[#3b82f6] text-[10px] mb-8 text-center">
              SELECT YOUR MONTHLY BUDGET FOR TOOLS
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BUDGETS.map((budget) => (
                <PixelCard
                  key={budget.id}
                  className={`cursor-pointer text-center p-4 ${
                    answers.budget === budget.id ? "bg-[#3b82f6]" : ""
                  }`}
                  onClick={() => handleSelectBudget(budget.id)}
                >
                  <div className="text-3xl mb-2">{budget.icon}</div>
                  <p className={`text-[10px] mb-1 ${
                    answers.budget === budget.id ? "text-[#000000]" : "text-[#60a5fa]"
                  }`}>
                    {budget.name}
                  </p>
                  <p className={`text-[8px] ${
                    answers.budget === budget.id ? "text-[#0a1628]" : "text-[#3b82f6]"
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
            <h2 className="text-[#60a5fa] text-sm mb-2 text-center">
              WHAT FEATURES DO YOU NEED?
            </h2>
            <p className="text-[#3b82f6] text-[10px] mb-8 text-center">
              SELECT ALL THAT APPLY
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {FEATURES.map((feature) => (
                <PixelCard
                  key={feature.id}
                  className={`cursor-pointer text-center p-4 ${
                    answers.features.includes(feature.id) ? "bg-[#3b82f6]" : ""
                  }`}
                  onClick={() => handleToggleFeature(feature.id)}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <p className={`text-[8px] ${
                    answers.features.includes(feature.id) ? "text-[#000000]" : "text-[#60a5fa]"
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
              <pre className="text-[#60a5fa] text-[6px] leading-none inline-block mb-4">
{`
██╗      ██████╗  █████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██║     ██╔═══██╗██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
██║     ██║   ██║███████║██║  ██║██║   ██║██║   ██║   ██║   
██║     ██║   ██║██╔══██║██║  ██║██║   ██║██║   ██║   ██║   
███████╗╚██████╔╝██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║   
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   
`}
              </pre>
              <h2 className="text-[#60a5fa] text-sm mb-2">YOUR RECOMMENDED LOADOUT</h2>
              <p className="text-[#3b82f6] text-[10px]">
                BASED ON: {PROJECT_TYPES.find(t => t.id === answers.projectType)?.name.toUpperCase()} | {SCALES.find(s => s.id === answers.scale)?.name.toUpperCase()} | {BUDGETS.find(b => b.id === answers.budget)?.name.toUpperCase()}
              </p>
            </div>

            {/* Summary Card */}
            <PixelCard className="mb-8 p-6">
              <div className="flex flex-wrap justify-around gap-4 text-center">
                <div>
                  <p className="text-3xl mb-2">
                    {PROJECT_TYPES.find(t => t.id === answers.projectType)?.icon}
                  </p>
                  <p className="text-[#3b82f6] text-[8px]">PROJECT</p>
                </div>
                <div>
                  <p className="text-3xl mb-2">
                    {SCALES.find(s => s.id === answers.scale)?.icon}
                  </p>
                  <p className="text-[#3b82f6] text-[8px]">SCALE</p>
                </div>
                <div>
                  <p className="text-3xl mb-2">
                    {BUDGETS.find(b => b.id === answers.budget)?.icon}
                  </p>
                  <p className="text-[#3b82f6] text-[8px]">BUDGET</p>
                </div>
                <div>
                  <p className="text-[#60a5fa] text-lg mb-2">{answers.features.length}</p>
                  <p className="text-[#3b82f6] text-[8px]">FEATURES</p>
                </div>
              </div>
            </PixelCard>

            {/* Recommendations by Category */}
            {recommendations && Object.entries(recommendations).map(([category, tools]) => (
              <div key={category} className="mb-8">
                <h3 className="text-[#60a5fa] text-[12px] mb-4 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 pixel-cursor" /> {category.toUpperCase()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tools.map((tool, index) => (
                    <Link key={tool._id} href={`/tools/${tool.slug}`}>
                      <PixelCard className={`h-full ${index === 0 ? "border-[#3b82f6]" : ""}`}>
                        <PixelCardHeader>
                          <div className="flex items-start justify-between">
                            <PixelCardTitle>
                              {index === 0 && <Star className="w-3 h-3 inline mr-1" />}
                              {tool.name}
                            </PixelCardTitle>
                            <PixelBadge variant={index === 0 ? "default" : "outline"}>
                              {index === 0 ? "TOP PICK" : `#${index + 1}`}
                            </PixelBadge>
                          </div>
                        </PixelCardHeader>
                        <PixelCardContent>
                          <p className="text-[#3b82f6] text-[8px] mb-2">{tool.tagline}</p>
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.slice(0, 2).map((tag) => (
                              <PixelBadge key={tag} variant="outline" className="text-[6px]">
                                {tag}
                              </PixelBadge>
                            ))}
                          </div>
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

      {/* Footer */}
      <footer className="border-t-4 border-[#1e3a5f] p-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-3 h-3 mr-1" /> BACK TO HOME
            </PixelButton>
          </Link>
        </div>
      </footer>
    </div>
  );
}
