"use client";

import { useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Store,
  LayoutGrid,
  Paintbrush,
  Server,
  Cloud,
  Wrench,
  Stars,
  Coins,
  ShoppingBag,
  SlidersHorizontal,
  ArrowUpDown,
  Bot,
  Bookmark,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Home,
  Backpack,
  Play,
  MessageSquare,
  User,
  Lock,
  Blocks,
  Palette,
  Terminal,
  Code,
  FileCode,
  Container,
  GitBranch,
  FileEdit,
  Sparkles,
} from "lucide-react";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface ToolItem {
  id: string;
  name: string;
  type: string;
  rarity: Rarity;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  stat1: { label: string; value: string; color: string };
  stat2: { label: string; value: string; color: string };
  description: string;
}

const rarityStyles: Record<Rarity, { border: string; label: string; labelColor: string; hoverBtn: string }> = {
  common: { border: "border-gray-500", label: "Common Scroll", labelColor: "text-gray-500", hoverBtn: "hover:bg-gray-600" },
  rare: { border: "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]", label: "Rare", labelColor: "text-blue-500", hoverBtn: "hover:bg-blue-600" },
  epic: { border: "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]", label: "Epic", labelColor: "text-purple-500", hoverBtn: "hover:bg-purple-600" },
  legendary: { border: "border-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]", label: "Legendary", labelColor: "text-yellow-500", hoverBtn: "hover:bg-yellow-600 hover:text-black" },
};

const mockTools: ToolItem[] = [
  { id: "react", name: "React.js", type: "Legendary Staff", rarity: "legendary", icon: Blocks, iconBg: "bg-[#20232a]", iconColor: "text-[#61dafb]", stat1: { label: "Speed", value: "+15 AGI", color: "text-green-400" }, stat2: { label: "Req", value: "Lvl 5 JS", color: "text-red-400" }, description: "Dominant UI library for building interactive interfaces." },
  { id: "tailwind", name: "Tailwind CSS", type: "Epic Light Armor", rarity: "epic", icon: Palette, iconBg: "bg-[#0b1120]", iconColor: "text-[#38bdf8]", stat1: { label: "Style", value: "+20 CHA", color: "text-pink-400" }, stat2: { label: "Req", value: "None", color: "text-gray-400" }, description: "Utility-first framework for rapid UI development." },
  { id: "nodejs", name: "Node.js", type: "Rare Blade", rarity: "rare", icon: Terminal, iconBg: "bg-[#303030]", iconColor: "text-[#68a063]", stat1: { label: "Power", value: "+12 STR", color: "text-red-400" }, stat2: { label: "Req", value: "Lvl 3 JS", color: "text-red-400" }, description: "JavaScript runtime built on Chrome's V8 engine." },
  { id: "typescript", name: "TypeScript", type: "Legendary Rune", rarity: "legendary", icon: Code, iconBg: "bg-[#007acc]", iconColor: "text-white", stat1: { label: "Intellect", value: "+25 INT", color: "text-blue-300" }, stat2: { label: "Req", value: "Lvl 8 JS", color: "text-red-400" }, description: "Strongly typed programming language that builds on JS." },
  { id: "docker", name: "Docker", type: "Epic Chest", rarity: "epic", icon: Container, iconBg: "bg-[#0db7ed]", iconColor: "text-white", stat1: { label: "Defense", value: "+18 DEF", color: "text-orange-400" }, stat2: { label: "Req", value: "Lvl 4 OS", color: "text-red-400" }, description: "Platform for developing, shipping, and running applications." },
  { id: "git", name: "Git", type: "Common Scroll", rarity: "common", icon: GitBranch, iconBg: "bg-[#f05032]", iconColor: "text-white", stat1: { label: "Safety", value: "+100 SAF", color: "text-green-400" }, stat2: { label: "Req", value: "Essential", color: "text-gray-400" }, description: "Distributed version control system." },
  { id: "vscode", name: "VS Code", type: "Rare Hammer", rarity: "rare", icon: FileEdit, iconBg: "bg-[#0078d7]", iconColor: "text-white", stat1: { label: "Crafting", value: "+50 SPD", color: "text-yellow-400" }, stat2: { label: "Req", value: "None", color: "text-gray-400" }, description: "Code editor redefined and optimized for building." },
  { id: "python", name: "Python", type: "Epic Flute", rarity: "epic", icon: Sparkles, iconBg: "bg-[#3776ab]", iconColor: "text-[#ffd343]", stat1: { label: "Versatile", value: "+40 WIS", color: "text-cyan-400" }, stat2: { label: "Req", value: "Lvl 1 Logic", color: "text-gray-400" }, description: "Language that lets you work quickly and integrate systems." },
];

const featuredTool = {
  name: "OpenAI API",
  type: "Artificial Intelligence Core",
  rarity: "mythic" as const,
  price: "2,500 XP",
  description: "A powerful artifact that imbues your application with sentient capabilities. Allows for text generation, image creation, and complex reasoning. Warning: Consumes mana (tokens) rapidly.",
  stats: [
    { label: "Intelligence", value: "98/100", percent: 98, color: "bg-primary", textColor: "text-primary" },
    { label: "Latency", value: "High", percent: 75, color: "bg-orange-500", textColor: "text-orange-400" },
    { label: "Integration", value: "Easy", percent: 90, color: "bg-green-500", textColor: "text-green-400" },
    { label: "Cost", value: "Expensive", percent: 85, color: "bg-red-500", textColor: "text-red-400" },
  ],
};

const categoryFilters = [
  { id: "all", name: "All Items", icon: LayoutGrid, count: 124 },
  { id: "frontend", name: "Frontend", icon: Paintbrush, count: 42 },
  { id: "backend", name: "Backend", icon: Server, count: 38 },
  { id: "infrastructure", name: "Infrastructure", icon: Cloud, count: 15 },
  { id: "utilities", name: "Utilities", icon: Wrench, count: 29 },
];

const rarityFilters = [
  { id: "common", label: "Common", color: "border-gray-600", textColor: "text-gray-400" },
  { id: "rare", label: "Rare", color: "border-blue-500", textColor: "text-blue-400" },
  { id: "epic", label: "Epic", color: "border-purple-500", textColor: "text-purple-400", checked: true },
  { id: "legendary", label: "Legendary", color: "border-yellow-500", textColor: "text-yellow-500" },
];

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const urlSearchQuery = searchParams.get("search");
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  const categories = useQuery(api.categories.list);
  const tools = useQuery(api.tools.list, {
    categorySlug: categoryFilter || undefined,
    limit: 50
  });
  const searchResults = useQuery(
    api.tools.search,
    searchQuery.length > 1 ? { query: searchQuery } : "skip"
  );

  const displayTools = searchQuery.length > 1 ? searchResults : tools;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Store className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Merchant Level 5</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Tech Stack Armory</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Equip yourself with legendary frameworks and libraries. Check requirements before acquiring.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-card border border-border hover:border-primary text-foreground text-sm font-medium rounded transition-colors flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 bg-card border border-border hover:border-primary text-foreground text-sm font-medium rounded transition-colors flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort: Rarity
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-lg py-4 hidden sm:block">
          <label className="flex w-full items-stretch rounded-lg h-10 group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <div className="text-muted-foreground flex border-none bg-card items-center justify-center pl-4 rounded-l-lg">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none text-foreground focus:outline-0 bg-card border-none h-full placeholder:text-muted-foreground/50 px-4 pl-2 text-sm font-normal"
              placeholder="Search armory for tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
          <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-24">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              <div className="bg-secondary px-4 py-3 border-b border-border">
                <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  Equipment Type
                </h3>
              </div>
              <div className="p-2 space-y-1">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex justify-between items-center transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary/20 border border-primary/40 text-foreground font-bold"
                        : "hover:bg-white/5 text-muted-foreground group"
                    }`}
                  >
                    <span className={`flex items-center gap-2 ${selectedCategory !== cat.id ? "group-hover:text-foreground" : ""}`}>
                      <cat.icon className="w-4 h-4" />
                      {cat.name}
                    </span>
                    <span className={`text-xs ${selectedCategory === cat.id ? "bg-black/40 px-1.5 rounded text-primary" : "text-gray-600 group-hover:text-gray-400"}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              <div className="bg-secondary px-4 py-3 border-b border-border">
                <h3 className="text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Stars className="w-4 h-4 text-yellow-500" />
                  Rarity
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {rarityFilters.map((rarity) => (
                  <label key={rarity.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`size-4 rounded border ${rarity.color} bg-card flex items-center justify-center group-hover:border-white`}>
                      {rarity.checked && <div className={`size-2 ${rarity.color.replace("border-", "bg-")} rounded-sm`} />}
                    </div>
                    <span className={`${rarity.textColor} text-sm group-hover:brightness-125 ${rarity.checked ? "font-bold" : ""}`}>
                      {rarity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/40 to-card border border-yellow-700/30 rounded-xl p-4 relative overflow-hidden group cursor-pointer hover:border-yellow-500/50 transition-colors">
              <div className="absolute -right-4 -bottom-4 text-yellow-500/10 rotate-12 transition-transform group-hover:scale-110">
                <Coins className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="text-foreground font-bold text-sm uppercase tracking-wide">Daily Deal</h3>
                <span className="text-xs bg-red-500 text-white px-1.5 rounded font-bold">-50% XP</span>
              </div>
              <div className="flex items-center gap-3 relative z-10 mt-2">
                <div className="size-10 bg-black rounded border border-yellow-500/30 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-foreground font-bold text-sm">Vim Setup</div>
                  <div className="text-yellow-500 text-xs">Cost: 150 XP</div>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9 flex flex-col gap-8">
            <div className="bg-card border border-primary/30 rounded-xl p-1 relative overflow-hidden group shadow-[0_0_40px_rgba(127,19,236,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
              <div className="relative bg-card rounded-lg p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="relative shrink-0">
                  <div className="size-32 md:size-40 bg-background rounded-xl border border-primary/50 flex items-center justify-center shadow-lg relative z-10">
                    <Bot className="w-16 h-16 md:w-20 md:h-20 text-primary drop-shadow-[0_0_15px_rgba(127,19,236,0.8)]" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full border border-dashed border-primary/20 pointer-events-none z-0" style={{ animation: "spin 20s linear infinite" }} />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-primary/50 px-3 py-1 rounded-full text-xs text-primary font-bold whitespace-nowrap z-20 shadow-lg">
                    SELECTED ITEM
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{featuredTool.name}</h2>
                        <span className="px-2 py-0.5 rounded text-sm font-bold bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">MYTHIC</span>
                      </div>
                      <p className="text-purple-300 text-sm font-medium">{featuredTool.type}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-muted-foreground mb-1">Market Value</div>
                      <div className="text-xl font-bold text-yellow-400 font-mono">{featuredTool.price}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-muted-foreground text-sm leading-relaxed border-l-2 border-primary/30 pl-4">
                    {featuredTool.description}
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6">
                    {featuredTool.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{stat.label}</span>
                          <span className={`${stat.textColor} font-mono font-bold`}>{stat.value}</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-sm overflow-hidden">
                          <div className={`h-full ${stat.color} rounded-sm ${stat.label === "Intelligence" ? "shadow-[0_0_10px_rgba(127,19,236,0.6)]" : ""}`} style={{ width: `${stat.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button className="quest-btn py-2 px-6 font-bold flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Acquire Artifact
                    </button>
                    <button className="bg-card border border-border hover:bg-white/5 text-muted-foreground hover:text-foreground font-bold py-2 px-4 rounded transition-colors flex items-center gap-2">
                      <Bookmark className="w-5 h-5" />
                      Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  Available Loot
                </h3>
                <span className="text-xs text-muted-foreground">Showing {mockTools.length} of 124 items</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockTools.map((tool) => {
                  const style = rarityStyles[tool.rarity];
                  return (
                    <div
                      key={tool.id}
                      className={`bg-card rounded-lg p-4 border ${style.border} hover:bg-secondary transition-all cursor-pointer group flex flex-col gap-3 relative`}
                      onClick={() => setSelectedTool(tool)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-14 ${tool.iconBg} rounded-lg border border-white/10 flex items-center justify-center shrink-0`}>
                          <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
                        </div>
                        <div>
                          <h4 className={`text-foreground font-bold group-hover:${style.labelColor} transition-colors`}>{tool.name}</h4>
                          <p className={`text-xs ${style.labelColor} font-bold uppercase tracking-wider`}>{tool.type}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-black/20 p-1.5 rounded text-center">
                          <div className="text-sm text-gray-500 uppercase">{tool.stat1.label}</div>
                          <div className={`${tool.stat1.color} font-bold text-xs`}>{tool.stat1.value}</div>
                        </div>
                        <div className="bg-black/20 p-1.5 rounded text-center">
                          <div className="text-sm text-gray-500 uppercase">{tool.stat2.label}</div>
                          <div className={`${tool.stat2.color} font-bold text-xs`}>{tool.stat2.value}</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{tool.description}</p>
                      <button className={`mt-auto w-full py-1.5 rounded bg-secondary text-xs text-foreground font-bold ${style.hoverBtn} transition-colors`}>
                        Inspect
                      </button>
                    </div>
                  );
                })}
                <div className="bg-background rounded-lg p-4 border border-dashed border-border flex flex-col items-center justify-center gap-3 opacity-50 hover:opacity-100 hover:border-primary transition-all cursor-pointer min-h-[180px]">
                  <Lock className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Unlock Slot Lvl 10</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4 gap-2">
              <button className="size-8 rounded bg-secondary flex items-center justify-center text-gray-400 hover:text-foreground hover:bg-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="size-8 rounded bg-primary text-white font-bold text-sm flex items-center justify-center shadow-[0_0_10px_rgba(127,19,236,0.5)]">1</button>
              <button className="size-8 rounded bg-card border border-border text-muted-foreground text-sm flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors">2</button>
              <button className="size-8 rounded bg-card border border-border text-muted-foreground text-sm flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors">3</button>
              <button className="size-8 rounded bg-secondary flex items-center justify-center text-gray-400 hover:text-foreground hover:bg-primary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="skill-bar">
          <Link href="/">
            <button className="skill-btn">
              <Home className="w-5 h-5" />
              <span className="absolute -bottom-2 bg-black text-sm text-gray-400 px-1 rounded border border-gray-800">1</span>
            </button>
          </Link>
          <button className="skill-btn border-primary shadow-[0_0_15px_rgba(127,19,236,0.3)] bg-primary/20">
            <Backpack className="w-5 h-5 text-primary" />
            <span className="absolute -bottom-2 bg-black text-sm text-primary px-1 rounded border border-primary/30">2</span>
          </button>
          <div className="w-px h-8 bg-border mx-1" />
          <button className="skill-btn skill-btn-primary">
            <Play className="w-8 h-8" />
            <span className="absolute -bottom-2.5 bg-black text-sm text-primary font-bold px-1.5 rounded border border-primary/50">SPACE</span>
          </button>
          <div className="w-px h-8 bg-border mx-1" />
          <button className="skill-btn">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -bottom-2 bg-black text-sm text-gray-400 px-1 rounded border border-gray-800">3</span>
          </button>
          <Link href="/profile">
            <button className="skill-btn">
              <User className="w-5 h-5" />
              <span className="absolute -bottom-2 bg-black text-sm text-gray-400 px-1 rounded border border-gray-800">4</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
