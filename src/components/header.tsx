"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  LogIn,
  Menu,
  X,
  Layers,
  Sun,
  Moon,
  Trophy,
  Users,
  Command,
  ChevronDown,
  Scale,
  Swords,
  Store,
  BarChart3,
  History,
  MessagesSquare,
  BookOpen,
  Building2,
  UsersRound,
  FileText,
  Zap,
} from "lucide-react";
import { UserMenu } from "@/components/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useUser } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/logo";
import { GlobalSearch } from "@/components/global-search";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { CommandPalette } from "@/components/command-palette";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; description?: string }[];
}

const navItems: NavItem[] = [
  { href: "/tools", label: "Tools", icon: Package },
  {
    label: "Build",
    icon: Layers,
    children: [
      { href: "/stack-builder", label: "Stack Builder", icon: Layers, description: "Build your perfect tech stack" },
      { href: "/compare", label: "Compare Tools", icon: Scale, description: "Side-by-side comparison" },
      { href: "/battles", label: "Stack Battles", icon: Swords, description: "Vote on the best stacks" },
      { href: "/analyze", label: "Stack Analyzer", icon: BarChart3, description: "Analyze your package.json" },
      { href: "/stack-marketplace", label: "Marketplace", icon: Store, description: "Community stacks" },
      { href: "/timeline", label: "Tool Timeline", icon: History, description: "History of dev tools" },
    ],
  },
  {
    label: "Community",
    icon: Users,
    children: [
      { href: "/community", label: "Community Hub", icon: Users, description: "Connect with developers" },
      { href: "/forum", label: "Forum", icon: MessagesSquare, description: "Discuss tools & stacks" },
      { href: "/blog", label: "Blog", icon: BookOpen, description: "Articles & guides" },
      { href: "/companies", label: "Companies", icon: Building2, description: "Company tech stacks" },
      { href: "/groups", label: "Groups", icon: UsersRound, description: "Join developer groups" },
    ],
  },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/docs", label: "Docs", icon: FileText },
];

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

function NavDropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const isChildActive = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          isChildActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        }`}
      >
        <item.icon className="w-4 h-4" />
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
          <div className="p-2">
            {item.children?.map((child) => {
              const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-primary/30" : "bg-secondary"
                  }`}>
                    <child.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{child.label}</div>
                    {child.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">{child.description}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MagneticButton({ children, className, onClick, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Header() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { mode, toggleMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <CommandPalette />
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
        <motion.div 
          initial={false}
          animate={{
            y: scrolled ? -4 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`mx-auto max-w-7xl flex items-center justify-between gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-2xl border border-border/50 transition-all duration-300 ${
            scrolled 
              ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5" 
              : "bg-background/60 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center text-foreground group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Logo size="md" showText className="hidden sm:flex" />
                <Logo size="sm" showText={false} className="sm:hidden" />
              </motion.div>
            </Link>

            <div className="hidden lg:block w-px h-6 bg-border/50" />

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.children) {
                  return <NavDropdown key={item.label} item={item} pathname={pathname} />;
                }
                
                const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
                
                return (
                  <Link
                    key={item.href || item.label}
                    href={item.href || "#"}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 max-w-md px-2 hidden md:block">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all group border border-border/50"
            >
              <Command className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Quick search...</span>
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-mono bg-background/50 rounded border border-border/50">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <MagneticButton
              onClick={toggleMode}
              className="flex items-center justify-center rounded-xl size-9 sm:size-10 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-border/50"
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: mode === "dark" ? 0 : 180 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </MagneticButton>
            
            <div className="hidden sm:block">
              <NotificationBell />
            </div>
            
            <MagneticButton
              className="lg:hidden flex items-center justify-center rounded-xl size-9 sm:size-10 bg-secondary/50 hover:bg-secondary text-foreground transition-all border border-border/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <motion.div
                initial={false}
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.div>
            </MagneticButton>

            {isLoaded && user ? (
              <UserMenu />
            ) : (
              <motion.button
                onClick={() => setAuthModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center rounded-xl h-9 sm:h-10 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white gap-2 px-4 sm:px-5 text-sm font-bold transition-all shadow-lg shadow-primary/30 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Zap className="w-4 h-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">Connect</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </header>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[72px] left-3 right-3 sm:left-4 sm:right-4 z-50 lg:hidden bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="p-3">
                <div className="md:hidden mb-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all border border-border/50"
                  >
                    <Command className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Quick search...</span>
                    <kbd className="ml-auto inline-flex items-center gap-0.5 px-2 py-1 text-xs font-mono bg-background/50 rounded border border-border/50">
                      ⌘K
                    </kbd>
                  </button>
                </div>
                
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    if (item.children) {
                      return (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </div>
                          {item.children.map((child) => {
                            const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 ml-4 rounded-xl text-sm font-medium transition-all ${
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                }`}
                              >
                                <child.icon className="w-4 h-4" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }
                    
                    const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
                    return (
                      <Link
                        key={item.href || item.label}
                        href={item.href || "#"}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultMode="sign-in"
      />
    </>
  );
}
