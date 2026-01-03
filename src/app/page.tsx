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
    <div className="min-h-screen bg-background ">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-16">
          {/* Elegant Fantasy Title */}
          <div className="mb-10">
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl text-foreground tracking-wide mb-2">
              VIBEBUFF
            </h1>
            <div className="ornate-divider w-48 mx-auto my-4" />
            <p className="font-heading text-xl sm:text-2xl text-primary tracking-widest">
              Tech Stack Compendium
            </p>
          </div>

          <p className="text-muted-foreground text-base mb-10 max-w-xl mx-auto leading-relaxed">
            Choose your tech stack wisely, Adventurer!
            <br />
            <span className="text-primary font-medium">AI-Powered Recommendations for Your Quest</span>
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
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-border bg-card rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {searchResults.slice(0, 6).map((tool) => (
                      <Link
                        key={tool._id}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setShowSearchResults(false)}
                        className="block p-3 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                      >
                        <p className="text-foreground text-sm font-medium">{tool.name}</p>
                        <p className="text-muted-foreground text-xs">{tool.tagline}</p>
                      </Link>
                    ))}
                    {searchResults.length > 6 && (
                      <Link
                        href={`/tools?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSearchResults(false)}
                        className="block p-3 text-center hover:bg-secondary transition-colors"
                      >
                        <p className="text-primary text-xs font-medium">View all {searchResults.length} results</p>
                      </Link>
                    )}
                  </div>
                )}
                {showSearchResults && searchQuery.length > 1 && searchResults && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-border bg-card rounded-lg p-4 text-center shadow-lg">
                    <p className="text-muted-foreground text-sm">No tools found</p>
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
              <p className="text-foreground text-sm mb-4">
                Database empty - Initialize game data?
              </p>
              <PixelButton onClick={handleSeed} disabled={isSeeding}>
                <Database className="w-4 h-4 mr-2" />
                {isSeeding ? "Loading..." : "Seed Database"}
              </PixelButton>
            </PixelCard>
          </div>
        )}

        {/* Categories Grid */}
        <section className="mb-16 md:mb-20">
          <h2 className="font-heading text-foreground text-xl md:text-2xl mb-6 md:mb-8 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Select Your Class
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {categories?.map((category) => (
              <Link key={category._id} href={`/tools?category=${category.slug}`}>
                <PixelCard className="text-center p-5 md:p-6 cursor-pointer hover:border-primary transition-all group min-h-[120px] md:min-h-[140px] flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <p className="text-sm md:text-base text-foreground group-hover:text-primary font-medium">
                    {category.name}
                  </p>
                </PixelCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Tools */}
        <section className="mb-16 md:mb-20">
          <h2 className="font-heading text-foreground text-xl md:text-2xl mb-6 md:mb-8 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Legendary Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredTools?.slice(0, 6).map((tool) => (
              <Link key={tool._id} href={`/tools/${tool.slug}`}>
                <PixelCard className="h-full" rarity="rare">
                  <PixelCardHeader>
                    <div className="flex items-start justify-between">
                      <PixelCardTitle>{tool.name}</PixelCardTitle>
                      <PixelBadge variant="default">
                        {tool.pricingModel === "free" ? "Free" : 
                         tool.pricingModel === "freemium" ? "Freemium" : 
                         tool.pricingModel === "open_source" ? "OSS" : "Paid"}
                      </PixelBadge>
                    </div>
                    <PixelCardDescription>{tool.tagline}</PixelCardDescription>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <PixelBadge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </PixelBadge>
                      ))}
                    </div>
                    {tool.githubStars && (
                      <p className="text-sm text-primary mt-3 flex items-center gap-1">
                        <Star className="w-4 h-4" /> {(tool.githubStars / 1000).toFixed(0)}K Stars
                      </p>
                    )}
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16 md:mb-20">
          <h2 className="font-heading text-foreground text-xl md:text-2xl mb-6 md:mb-8 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" /> How To Play
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <PixelCard className="text-center p-8 md:p-10">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="font-heading text-primary text-lg md:text-xl mb-2 md:mb-3">Step 1</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Describe your quest in plain English
              </p>
            </PixelCard>
            <PixelCard className="text-center p-8 md:p-10">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="font-heading text-primary text-lg md:text-xl mb-2 md:mb-3">Step 2</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                AI analyzes your requirements
              </p>
            </PixelCard>
            <PixelCard className="text-center p-8 md:p-10">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="font-heading text-primary text-lg md:text-xl mb-2 md:mb-3">Step 3</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Receive your optimal loadout
              </p>
            </PixelCard>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-2 border-border rounded-xl p-6 md:p-8 bg-gradient-to-r from-card via-background to-card mb-16 md:mb-20 shadow-sm">
          <div className="flex flex-wrap justify-around gap-6 md:gap-10 text-center">
            <div>
              <p className="font-heading text-primary text-2xl md:text-3xl">500+</p>
              <p className="text-muted-foreground text-sm md:text-base">Tools</p>
            </div>
            <div className="ornate-divider w-px h-12 bg-gradient-to-b from-transparent via-primary to-transparent" />
            <div>
              <p className="font-heading text-primary text-2xl md:text-3xl">15+</p>
              <p className="text-muted-foreground text-sm md:text-base">Categories</p>
            </div>
            <div className="ornate-divider w-px h-12 md:h-14 bg-gradient-to-b from-transparent via-primary to-transparent hidden sm:block" />
            <div>
              <p className="font-heading text-primary text-2xl md:text-3xl">AI</p>
              <p className="text-muted-foreground text-sm md:text-base">Powered</p>
            </div>
            <div className="ornate-divider w-px h-12 md:h-14 bg-gradient-to-b from-transparent via-primary to-transparent hidden sm:block" />
            <div>
              <p className="font-heading text-primary text-2xl md:text-3xl">2025</p>
              <p className="text-muted-foreground text-sm md:text-base">Updated</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section - Why VIBEBUFF */}
        <section className="mb-16 md:mb-20">
          <h2 className="font-heading text-foreground text-xl md:text-2xl mb-6 md:mb-8 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Why Use Vibebuff?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <PixelCard className="p-6 md:p-8">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4 md:mb-5">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="font-heading text-foreground text-base md:text-lg mb-3">Stay Ahead of Trends</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Our database is continuously updated with the latest frameworks, libraries, and developer tools. 
                From React and Next.js to emerging technologies, we track what&apos;s trending in the developer community.
              </p>
            </PixelCard>
            <PixelCard className="p-6 md:p-8">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center mb-4 md:mb-5">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="font-heading text-foreground text-base md:text-lg mb-3">Community Insights</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                See what other developers are using. Our recommendations are based on real-world usage, 
                GitHub stars, npm downloads, and community feedback from thousands of projects.
              </p>
            </PixelCard>
            <PixelCard className="p-6 md:p-8">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 md:mb-5">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="font-heading text-foreground text-base md:text-lg mb-3">Expert Curation</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Every tool in our database is vetted by experienced developers. We evaluate documentation quality, 
                maintenance status, performance benchmarks, and long-term viability.
              </p>
            </PixelCard>
            <PixelCard className="p-6 md:p-8">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4 md:mb-5">
                <Bot className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="font-heading text-foreground text-base md:text-lg mb-3">AI-Powered Matching</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Describe your project in plain English and our AI analyzes your requirements to suggest 
                the optimal tech stack. No more endless research or decision paralysis.
              </p>
            </PixelCard>
          </div>
        </section>

        {/* Popular Comparisons - SEO Keywords */}
        <section className="mb-16 md:mb-20">
          <h2 className="font-heading text-foreground text-xl md:text-2xl mb-6 md:mb-8 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Popular Comparisons
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            <Link href="/compare?tools=nextjs,remix" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">Next.js vs Remix</p>
            </Link>
            <Link href="/compare?tools=react,vue" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">React vs Vue</p>
            </Link>
            <Link href="/compare?tools=postgresql,mongodb" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">PostgreSQL vs MongoDB</p>
            </Link>
            <Link href="/compare?tools=tailwind,bootstrap" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">Tailwind vs Bootstrap</p>
            </Link>
            <Link href="/compare?tools=prisma,drizzle" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">Prisma vs Drizzle</p>
            </Link>
            <Link href="/compare?tools=vercel,netlify" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">Vercel vs Netlify</p>
            </Link>
            <Link href="/compare?tools=supabase,firebase" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">Supabase vs Firebase</p>
            </Link>
            <Link href="/compare?tools=typescript,javascript" className="border-2 border-border bg-card rounded-lg p-4 md:p-5 text-center hover:border-primary hover:shadow-md transition-all min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              <p className="text-foreground text-sm md:text-base font-medium">TypeScript vs JavaScript</p>
            </Link>
          </div>
        </section>

        {/* Latest from Blog - Internal Linking */}
        <section className="mb-16">
          <h2 className="font-heading text-foreground text-xl mb-6 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 text-primary" /> Latest Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/blog/best-react-frameworks-2025">
              <PixelCard className="p-6 h-full hover:border-primary transition-all">
                <p className="font-heading text-foreground text-base mb-2">Best React Frameworks in 2025</p>
                <p className="text-muted-foreground text-sm">Compare Next.js, Remix, and Gatsby for your next project.</p>
              </PixelCard>
            </Link>
            <Link href="/blog/choosing-database-for-startup">
              <PixelCard className="p-6 h-full hover:border-primary transition-all">
                <p className="font-heading text-foreground text-base mb-2">Choosing a Database for Your Startup</p>
                <p className="text-muted-foreground text-sm">PostgreSQL, MongoDB, or something else? Find out.</p>
              </PixelCard>
            </Link>
            <Link href="/blog/tech-stack-for-saas">
              <PixelCard className="p-6 h-full hover:border-primary transition-all">
                <p className="font-heading text-foreground text-base mb-2">Ultimate Tech Stack for SaaS in 2025</p>
                <p className="text-muted-foreground text-sm">Complete guide from frontend to deployment.</p>
              </PixelCard>
            </Link>
          </div>
          <div className="text-center mt-6">
            <Link href="/blog" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              View All Articles
            </Link>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="mb-16">
          <h2 className="font-heading text-foreground text-xl mb-6 flex items-center gap-3">
            <ChevronRight className="w-5 h-5 text-primary" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="border-2 border-border bg-card rounded-lg p-5 group">
              <summary className="font-heading text-foreground text-sm cursor-pointer list-none flex justify-between items-center">
                What is VIBEBUFF?
                <span className="text-primary text-lg">+</span>
              </summary>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                VIBEBUFF is an AI-powered platform that helps developers discover and compare tech stacks. 
                Whether you&apos;re building a SaaS, mobile app, or web application, we provide personalized 
                recommendations based on your project requirements, team expertise, and scalability needs.
              </p>
            </details>
            <details className="border-2 border-border bg-card rounded-lg p-5">
              <summary className="font-heading text-foreground text-sm cursor-pointer list-none flex justify-between items-center">
                How does the AI recommendation work?
                <span className="text-primary text-lg">+</span>
              </summary>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                Simply describe your project in plain English - what you&apos;re building, your team size, 
                performance requirements, and budget. Our AI analyzes your input against our database of 
                500+ tools to suggest the optimal combination of frameworks, databases, and services.
              </p>
            </details>
            <details className="border-2 border-border bg-card rounded-lg p-5">
              <summary className="font-heading text-foreground text-sm cursor-pointer list-none flex justify-between items-center">
                Is VIBEBUFF free to use?
                <span className="text-primary text-lg">+</span>
              </summary>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                Yes! VIBEBUFF is completely free to use. You can browse our tool database, compare technologies, 
                and get AI recommendations without any cost. Create an account to save your favorite stacks 
                and access personalized features.
              </p>
            </details>
            <details className="border-2 border-border bg-card rounded-lg p-5">
              <summary className="font-heading text-foreground text-sm cursor-pointer list-none flex justify-between items-center">
                What categories of tools do you cover?
                <span className="text-primary text-lg">+</span>
              </summary>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
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
