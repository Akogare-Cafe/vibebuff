"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
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
} from "lucide-react";
import { UserMenu } from "@/components/auth";
import { useUser } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/logo";
import { GlobalSearch } from "@/components/global-search";

const navLinks = [
  { href: "/tools", label: "Tools", icon: Package },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/stack-builder", label: "Builder", icon: Layers },
  { href: "/forum", label: "Forum", icon: MessagesSquare },
  { href: "/community", label: "Community", icon: Users },
];

export function Header() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 max-w-md px-4 hidden md:block">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            className="flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border"
            aria-label="Toggle theme"
          >
            {mode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link href="/docs" className="hidden sm:flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border" aria-label="Documentation">
            <BookOpen className="w-5 h-5" />
          </Link>
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
        <nav className="lg:hidden border-t border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Help & Docs
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
