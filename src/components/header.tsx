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
  ChevronDown,
  Trophy,
  Compass,
  Users,
  Command,
  Sparkles,
} from "lucide-react";
import { UserMenu } from "@/components/auth";
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
}

const navItems: NavItem[] = [
  { href: "/tools", label: "Tools", icon: Package },
  { href: "/stack-builder", label: "Build", icon: Layers, badge: "New" },
  { 
    label: "Play",
    icon: Trophy,
  },
  { href: "/community", label: "Community", icon: Users },
];

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
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
                const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
                
                if (item.label === "Play") {
                  return (
                    <Link
                      key="play"
                      href="/quests"
                      className="relative group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                          pathname.startsWith("/quests") || pathname.startsWith("/leaderboards")
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        <Sparkles className="w-3 h-3" />
                      </motion.div>
                    </Link>
                  );
                }
                
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
              <Link href="/sign-in">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center rounded-xl h-9 sm:h-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white gap-2 px-3 sm:px-4 text-sm font-bold transition-all shadow-lg shadow-primary/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect</span>
                </motion.button>
              </Link>
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
                    const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
                    return (
                      <Link
                        key={item.href || item.label}
                        href={item.href || (item.label === "Play" ? "/quests" : "#")}
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
    </>
  );
}
