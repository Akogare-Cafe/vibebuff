"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardDescription, PixelCardContent } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import { PixelBadge } from "@/components/pixel-badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Swords, 
  Package, 
  Database, 
  FileText, 
  Bot, 
  Zap,
  Star,
  ChevronRight,
  TrendingUp,
  Users,
  Award
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const categories = useQuery(api.categories.list);
  const featuredTools = useQuery(api.tools.featured);
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 1 ? { query: searchQuery } : "skip"
  );
  const seedDatabase = useMutation(api.seed.seedDatabase);
  const [isSeeding, setIsSeeding] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
    } catch (e) {
      console.error(e);
    }
    setIsSeeding(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] screen-flicker">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {/* Pixel Art Title */}
          <div className="mb-8">
            <pre className="text-[#60a5fa] text-[6px] sm:text-[8px] leading-none inline-block">
{`
██╗   ██╗██╗██████╗ ███████╗██████╗ ██╗   ██╗███████╗███████╗
██║   ██║██║██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝██╔════╝
██║   ██║██║██████╔╝█████╗  ██████╔╝██║   ██║█████╗  █████╗  
╚██╗ ██╔╝██║██╔══██╗██╔══╝  ██╔══██╗██║   ██║██╔══╝  ██╔══╝  
 ╚████╔╝ ██║██████╔╝███████╗██████╔╝╚██████╔╝██║     ██║     
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝
`}
            </pre>
            <pre className="text-[#3b82f6] text-[4px] sm:text-[6px] leading-none inline-block mt-2">
{`
████████╗███████╗ ██████╗██╗  ██╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
╚══██╔══╝██╔════╝██╔════╝██║  ██║    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
   ██║   █████╗  ██║     ███████║    ███████╗   ██║   ███████║██║     █████╔╝ 
   ██║   ██╔══╝  ██║     ██╔══██║    ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ 
   ██║   ███████╗╚██████╗██║  ██║    ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
   ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ 
`}
            </pre>
          </div>

          <p className="text-[#3b82f6] text-[10px] mb-8 max-w-xl mx-auto leading-relaxed">
            CHOOSE YOUR TECH STACK WISELY, ADVENTURER!
            <br />
            <span className="text-[#60a5fa]">AI-POWERED RECOMMENDATIONS FOR YOUR QUEST</span>
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8" ref={searchRef}>
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="relative flex-1">
                <PixelInput
                  placeholder="SEARCH TOOLS..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full"
                />
                {showSearchResults && searchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 border-4 border-[#1e3a5f] bg-[#0a1628] max-h-64 overflow-y-auto">
                    {searchResults.slice(0, 6).map((tool) => (
                      <Link
                        key={tool._id}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setShowSearchResults(false)}
                        className="block p-3 hover:bg-[#1e3a5f] transition-colors border-b border-[#1e3a5f] last:border-b-0"
                      >
                        <p className="text-[#60a5fa] text-[10px]">{tool.name}</p>
                        <p className="text-[#3b82f6] text-[8px]">{tool.tagline}</p>
                      </Link>
                    ))}
                    {searchResults.length > 6 && (
                      <Link
                        href={`/tools?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSearchResults(false)}
                        className="block p-3 text-center hover:bg-[#1e3a5f] transition-colors"
                      >
                        <p className="text-[#3b82f6] text-[8px]">VIEW ALL {searchResults.length} RESULTS</p>
                      </Link>
                    )}
                  </div>
                )}
                {showSearchResults && searchQuery.length > 1 && searchResults && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center">
                    <p className="text-[#3b82f6] text-[8px]">NO TOOLS FOUND</p>
                  </div>
                )}
              </div>
              <PixelButton size="lg" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                SEARCH
              </PixelButton>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/quest">
              <PixelButton size="lg" variant="default">
                <Swords className="w-4 h-4 mr-2" />
                START QUEST
              </PixelButton>
            </Link>
            <Link href="/tools">
              <PixelButton size="lg" variant="secondary">
                <Package className="w-4 h-4 mr-2" />
                BROWSE TOOLS
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* Seed Button (for development) */}
        {(!categories || categories.length === 0) && (
          <div className="text-center mb-8">
            <PixelCard className="inline-block p-6">
              <p className="text-[#60a5fa] text-[10px] mb-4">
                DATABASE EMPTY - INITIALIZE GAME DATA?
              </p>
              <PixelButton onClick={handleSeed} disabled={isSeeding}>
                <Database className="w-4 h-4 mr-2" />
                {isSeeding ? "LOADING..." : "SEED DATABASE"}
              </PixelButton>
            </PixelCard>
          </div>
        )}

        {/* Categories Grid */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 pixel-cursor" /> SELECT YOUR CLASS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories?.map((category) => (
              <Link key={category._id} href={`/tools?category=${category.slug}`}>
                <PixelCard className="text-center p-4 cursor-pointer hover:bg-[#3b82f6] hover:text-[#000000] transition-colors group">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <p className="text-[8px] uppercase text-[#60a5fa] group-hover:text-[#000000]">
                    {category.name}
                  </p>
                </PixelCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Tools */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 pixel-cursor" /> LEGENDARY ITEMS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools?.slice(0, 6).map((tool) => (
              <Link key={tool._id} href={`/tools/${tool.slug}`}>
                <PixelCard className="h-full">
                  <PixelCardHeader>
                    <div className="flex items-start justify-between">
                      <PixelCardTitle>{tool.name}</PixelCardTitle>
                      <PixelBadge variant="default">
                        {tool.pricingModel === "free" ? "FREE" : 
                         tool.pricingModel === "freemium" ? "FREEMIUM" : 
                         tool.pricingModel === "open_source" ? "OSS" : "PAID"}
                      </PixelBadge>
                    </div>
                    <PixelCardDescription>{tool.tagline}</PixelCardDescription>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <PixelBadge key={tag} variant="outline" className="text-[6px]">
                          {tag}
                        </PixelBadge>
                      ))}
                    </div>
                    {tool.githubStars && (
                      <p className="text-[8px] text-[#3b82f6] mt-3 flex items-center gap-1">
                        <Star className="w-3 h-3" /> {(tool.githubStars / 1000).toFixed(0)}K STARS
                      </p>
                    )}
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 pixel-cursor" /> HOW TO PLAY
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PixelCard className="text-center p-6">
              <FileText className="w-10 h-10 mx-auto mb-4 text-[#3b82f6]" />
              <h3 className="text-[#60a5fa] text-[10px] mb-2">STEP 1</h3>
              <p className="text-[#3b82f6] text-[8px]">
                DESCRIBE YOUR QUEST IN PLAIN ENGLISH
              </p>
            </PixelCard>
            <PixelCard className="text-center p-6">
              <Bot className="w-10 h-10 mx-auto mb-4 text-[#3b82f6]" />
              <h3 className="text-[#60a5fa] text-[10px] mb-2">STEP 2</h3>
              <p className="text-[#3b82f6] text-[8px]">
                AI ANALYZES YOUR REQUIREMENTS
              </p>
            </PixelCard>
            <PixelCard className="text-center p-6">
              <Zap className="w-10 h-10 mx-auto mb-4 text-[#3b82f6]" />
              <h3 className="text-[#60a5fa] text-[10px] mb-2">STEP 3</h3>
              <p className="text-[#3b82f6] text-[8px]">
                RECEIVE YOUR OPTIMAL LOADOUT
              </p>
            </PixelCard>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-4 border-[#1e3a5f] p-4 bg-[#0a1628] mb-12">
          <div className="flex flex-wrap justify-around gap-4 text-center">
            <div>
              <p className="text-[#60a5fa] text-lg">500+</p>
              <p className="text-[#3b82f6] text-[8px]">TOOLS</p>
            </div>
            <div>
              <p className="text-[#60a5fa] text-lg">15+</p>
              <p className="text-[#3b82f6] text-[8px]">CATEGORIES</p>
            </div>
            <div>
              <p className="text-[#60a5fa] text-lg">AI</p>
              <p className="text-[#3b82f6] text-[8px]">POWERED</p>
            </div>
            <div>
              <p className="text-[#60a5fa] text-lg">2025</p>
              <p className="text-[#3b82f6] text-[8px]">UPDATED</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section - Why VIBEBUFF */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> WHY USE VIBEBUFF?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6">
              <TrendingUp className="w-8 h-8 text-[#3b82f6] mb-4" />
              <h3 className="text-[#60a5fa] text-[10px] mb-3">STAY AHEAD OF TRENDS</h3>
              <p className="text-[#3b82f6] text-[8px] leading-relaxed">
                Our database is continuously updated with the latest frameworks, libraries, and developer tools. 
                From React and Next.js to emerging technologies, we track what&apos;s trending in the developer community.
              </p>
            </div>
            <div className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6">
              <Users className="w-8 h-8 text-[#3b82f6] mb-4" />
              <h3 className="text-[#60a5fa] text-[10px] mb-3">COMMUNITY INSIGHTS</h3>
              <p className="text-[#3b82f6] text-[8px] leading-relaxed">
                See what other developers are using. Our recommendations are based on real-world usage, 
                GitHub stars, npm downloads, and community feedback from thousands of projects.
              </p>
            </div>
            <div className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6">
              <Award className="w-8 h-8 text-[#3b82f6] mb-4" />
              <h3 className="text-[#60a5fa] text-[10px] mb-3">EXPERT CURATION</h3>
              <p className="text-[#3b82f6] text-[8px] leading-relaxed">
                Every tool in our database is vetted by experienced developers. We evaluate documentation quality, 
                maintenance status, performance benchmarks, and long-term viability.
              </p>
            </div>
            <div className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6">
              <Bot className="w-8 h-8 text-[#3b82f6] mb-4" />
              <h3 className="text-[#60a5fa] text-[10px] mb-3">AI-POWERED MATCHING</h3>
              <p className="text-[#3b82f6] text-[8px] leading-relaxed">
                Describe your project in plain English and our AI analyzes your requirements to suggest 
                the optimal tech stack. No more endless research or decision paralysis.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Comparisons - SEO Keywords */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> POPULAR COMPARISONS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/compare?tools=nextjs,remix" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">Next.js vs Remix</p>
            </Link>
            <Link href="/compare?tools=react,vue" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">React vs Vue</p>
            </Link>
            <Link href="/compare?tools=postgresql,mongodb" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">PostgreSQL vs MongoDB</p>
            </Link>
            <Link href="/compare?tools=tailwind,bootstrap" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">Tailwind vs Bootstrap</p>
            </Link>
            <Link href="/compare?tools=prisma,drizzle" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">Prisma vs Drizzle</p>
            </Link>
            <Link href="/compare?tools=vercel,netlify" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">Vercel vs Netlify</p>
            </Link>
            <Link href="/compare?tools=supabase,firebase" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">Supabase vs Firebase</p>
            </Link>
            <Link href="/compare?tools=typescript,javascript" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 text-center hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[8px]">TypeScript vs JavaScript</p>
            </Link>
          </div>
        </section>

        {/* Latest from Blog - Internal Linking */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> LATEST GUIDES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/blog/best-react-frameworks-2025" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6 hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[10px] mb-2">Best React Frameworks in 2025</p>
              <p className="text-[#3b82f6] text-[8px]">Compare Next.js, Remix, and Gatsby for your next project.</p>
            </Link>
            <Link href="/blog/choosing-database-for-startup" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6 hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[10px] mb-2">Choosing a Database for Your Startup</p>
              <p className="text-[#3b82f6] text-[8px]">PostgreSQL, MongoDB, or something else? Find out.</p>
            </Link>
            <Link href="/blog/tech-stack-for-saas" className="border-4 border-[#1e3a5f] bg-[#0a1628] p-6 hover:border-[#3b82f6] transition-colors">
              <p className="text-[#60a5fa] text-[10px] mb-2">Ultimate Tech Stack for SaaS in 2025</p>
              <p className="text-[#3b82f6] text-[8px]">Complete guide from frontend to deployment.</p>
            </Link>
          </div>
          <div className="text-center mt-6">
            <Link href="/blog" className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px]">
              VIEW ALL ARTICLES
            </Link>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="mb-12">
          <h2 className="text-[#60a5fa] text-sm mb-6 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="space-y-4">
            <details className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4 group">
              <summary className="text-[#60a5fa] text-[10px] cursor-pointer list-none flex justify-between items-center">
                What is VIBEBUFF?
                <span className="text-[#3b82f6]">+</span>
              </summary>
              <p className="text-[#3b82f6] text-[8px] mt-4 leading-relaxed">
                VIBEBUFF is an AI-powered platform that helps developers discover and compare tech stacks. 
                Whether you&apos;re building a SaaS, mobile app, or web application, we provide personalized 
                recommendations based on your project requirements, team expertise, and scalability needs.
              </p>
            </details>
            <details className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4">
              <summary className="text-[#60a5fa] text-[10px] cursor-pointer list-none flex justify-between items-center">
                How does the AI recommendation work?
                <span className="text-[#3b82f6]">+</span>
              </summary>
              <p className="text-[#3b82f6] text-[8px] mt-4 leading-relaxed">
                Simply describe your project in plain English - what you&apos;re building, your team size, 
                performance requirements, and budget. Our AI analyzes your input against our database of 
                500+ tools to suggest the optimal combination of frameworks, databases, and services.
              </p>
            </details>
            <details className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4">
              <summary className="text-[#60a5fa] text-[10px] cursor-pointer list-none flex justify-between items-center">
                Is VIBEBUFF free to use?
                <span className="text-[#3b82f6]">+</span>
              </summary>
              <p className="text-[#3b82f6] text-[8px] mt-4 leading-relaxed">
                Yes! VIBEBUFF is completely free to use. You can browse our tool database, compare technologies, 
                and get AI recommendations without any cost. Create an account to save your favorite stacks 
                and access personalized features.
              </p>
            </details>
            <details className="border-4 border-[#1e3a5f] bg-[#0a1628] p-4">
              <summary className="text-[#60a5fa] text-[10px] cursor-pointer list-none flex justify-between items-center">
                What categories of tools do you cover?
                <span className="text-[#3b82f6]">+</span>
              </summary>
              <p className="text-[#3b82f6] text-[8px] mt-4 leading-relaxed">
                We cover 15+ categories including frontend frameworks (React, Vue, Svelte), backend technologies 
                (Node.js, Python, Go), databases (PostgreSQL, MongoDB, Redis), DevOps tools, AI/ML libraries, 
                authentication services, payment processors, and more.
              </p>
            </details>
          </div>
        </section>
      </section>
    </div>
  );
}
