"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Swords, 
  Package, 
  Scale, 
  Users, 
  Bell, 
  Search, 
  LogIn,
  Menu,
  X,
  Layers,
  BookOpen,
} from "lucide-react";
import { UserMenu } from "@/components/auth";
import { useUser } from "@clerk/nextjs";

const navLinks = [
  { href: "/quest", label: "Quest", icon: Swords },
  { href: "/tools", label: "Tools", icon: Package },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/stack-builder", label: "Builder", icon: Layers },
  { href: "/community", label: "Community", icon: Users },
];

export function Header() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-solid border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between whitespace-nowrap px-4 lg:px-10 py-3">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-3 text-foreground">
            <div className="size-8 text-primary flex items-center justify-center">
              <Swords className="w-7 h-7" />
            </div>
            <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block">VibeBuff</h2>
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
          <Link href="/tools">
            <label className="flex w-full items-stretch rounded-lg h-10 group focus-within:ring-2 focus-within:ring-primary/50 transition-all cursor-pointer">
              <div className="text-muted-foreground flex border-none bg-card items-center justify-center pl-4 rounded-l-lg">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex w-full min-w-0 flex-1 rounded-lg rounded-l-none bg-card border-none h-full px-4 pl-2 text-sm items-center text-muted-foreground/50">
                Search tools...
              </div>
            </label>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/docs" className="hidden sm:flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border">
            <BookOpen className="w-5 h-5" />
          </Link>
          <button className="flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-foreground transition-colors border border-border relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          <button
            className="lg:hidden flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-foreground transition-colors border border-border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
