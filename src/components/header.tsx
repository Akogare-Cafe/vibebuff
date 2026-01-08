"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  Scale, 
  Users, 
  LogIn,
  Menu,
  X,
  Layers,
  BookOpen,
  Sun,
  Moon,
  MessagesSquare,
  ChevronDown,
  Trophy,
  Store,
  FileText,
} from "lucide-react";
import { UserMenu } from "@/components/auth";
import { useUser } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/logo";
import { GlobalSearch } from "@/components/global-search";
import { OnlineIndicator } from "@/components/online-indicator";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; description?: string }[];
}

const navItems: NavItem[] = [
  { href: "/tools", label: "Tools", icon: Package },
  {
    label: "Build",
    icon: Layers,
    children: [
      { href: "/stack-builder", label: "Stack Builder", icon: Layers, description: "Build your perfect tech stack" },
      { href: "/compare", label: "Compare Tools", icon: Scale, description: "Side-by-side tool comparison" },
      { href: "/stack-marketplace", label: "Marketplace", icon: Store, description: "Community-built stacks" },
    ],
  },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  {
    label: "Community",
    icon: Users,
    children: [
      { href: "/community", label: "Community Hub", icon: Users, description: "Connect with developers" },
      { href: "/forum", label: "Forum", icon: MessagesSquare, description: "Discuss tools & stacks" },
      { href: "/blog", label: "Blog", icon: BookOpen, description: "Latest articles & guides" },
    ],
  },
  { href: "/docs", label: "Docs", icon: FileText },
];

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
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isChildActive
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-card"
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

export function Header() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const { mode, toggleMode } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-solid border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between whitespace-nowrap px-4 lg:px-10 py-3">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center text-foreground">
            <Logo size="md" showText className="hidden sm:flex" />
            <Logo size="sm" showText={false} className="sm:hidden" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.href) {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              }
              return <NavDropdown key={item.label} item={item} pathname={pathname} />;
            })}
          </nav>
        </div>

        <div className="flex-1 max-w-md px-4 hidden md:block">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <OnlineIndicator />
          </div>
          <button
            onClick={toggleMode}
            className="flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border"
            aria-label="Toggle theme"
          >
            {mode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <NotificationBell />
          
          <button
            className="lg:hidden flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-foreground transition-colors border border-border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {isLoaded && user ? (
            <UserMenu />
          ) : (
            <Link href="/sign-in">
              <button className="flex items-center justify-center rounded-lg h-10 bg-primary hover:bg-primary/90 text-white gap-2 px-4 text-sm font-bold transition-all shadow-[0_0_15px_rgba(127,19,236,0.4)]">
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Connect</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-card px-4 py-3 max-h-[70vh] overflow-y-auto">
          <div className="sm:hidden mb-3 pb-3 border-b border-border">
            <OnlineIndicator />
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.href) {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              }

              const isExpanded = expandedMobileMenu === item.label;
              const isChildActive = item.children?.some(
                (child) => pathname === child.href || pathname.startsWith(child.href + "/")
              );

              return (
                <div key={item.label}>
                  <button
                    onClick={() => setExpandedMobileMenu(isExpanded ? null : item.label)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isChildActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 mb-2 pl-4 border-l-2 border-border">
                      {item.children?.map((child) => {
                        const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                              isActive
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <child.icon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
