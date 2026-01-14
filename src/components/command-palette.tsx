"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Package, 
  Layers, 
  Scale, 
  Users, 
  Trophy,
  Compass,
  FileText,
  Swords,
  Store,
  BarChart3,
  Building2,
  MessagesSquare,
  BookOpen,
  History,
  Home,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "@/components/providers/theme-provider";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { mode, toggleMode } = useTheme();

  const commands: CommandItem[] = useMemo(() => [
    { id: "home", label: "Home", icon: Home, href: "/", category: "Navigation" },
    { id: "tools", label: "Browse Tools", icon: Package, href: "/tools", category: "Navigation", keywords: ["browse", "explore", "discover"] },
    { id: "stack-builder", label: "Stack Builder", icon: Layers, href: "/stack-builder", category: "Build", keywords: ["create", "build", "design"] },
    { id: "compare", label: "Compare Tools", icon: Scale, href: "/compare", category: "Build", keywords: ["vs", "versus", "comparison"] },
    { id: "battles", label: "Stack Battles", icon: Swords, href: "/battles", category: "Build", keywords: ["vote", "battle", "fight"] },
    { id: "marketplace", label: "Stack Marketplace", icon: Store, href: "/stack-marketplace", category: "Build", keywords: ["buy", "sell", "community"] },
    { id: "analyze", label: "Stack Analyzer", icon: BarChart3, href: "/analyze", category: "Build", keywords: ["analyze", "check", "review"] },
    { id: "timeline", label: "Tool Timeline", icon: History, href: "/timeline", category: "Build", keywords: ["history", "evolution"] },
    { id: "leaderboards", label: "Leaderboards", icon: Trophy, href: "/leaderboards", category: "Play", keywords: ["ranking", "top", "best"] },
    { id: "quests", label: "Quests", icon: Compass, href: "/quests", category: "Play", keywords: ["missions", "tasks", "challenges"] },
    { id: "community", label: "Community Hub", icon: Users, href: "/community", category: "Community", keywords: ["people", "social"] },
    { id: "forum", label: "Forum", icon: MessagesSquare, href: "/forum", category: "Community", keywords: ["discuss", "talk", "chat"] },
    { id: "blog", label: "Blog", icon: BookOpen, href: "/blog", category: "Community", keywords: ["articles", "posts", "news"] },
    { id: "companies", label: "Companies", icon: Building2, href: "/companies", category: "Community", keywords: ["startups", "tech stacks"] },
    { id: "docs", label: "Documentation", icon: FileText, href: "/docs", category: "Help", keywords: ["help", "guide", "api"] },
    ...(user ? [
      { id: "profile", label: "My Profile", icon: User, href: "/profile", category: "Account" },
      { id: "settings", label: "Settings", icon: Settings, href: "/settings", category: "Account" },
      { id: "signout", label: "Sign Out", icon: LogOut, action: () => signOut(), category: "Account" },
    ] : []),
    { 
      id: "theme", 
      label: mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode", 
      icon: mode === "dark" ? Sun : Moon, 
      action: toggleMode, 
      category: "Preferences" 
    },
  ], [user, mode, toggleMode, signOut]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    
    const query = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query) ||
      cmd.keywords?.some(kw => kw.toLowerCase().includes(query))
    );
  }, [search, commands]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const handleSelect = useCallback((item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
    setIsOpen(false);
    setSearch("");
  }, [router]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-secondary rounded border border-border">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {Object.keys(groupedCommands).length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="mb-3 last:mb-0">
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-secondary group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                              <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="flex-1 text-left font-medium">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">⌘K</kbd>
                  <span>Toggle</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
