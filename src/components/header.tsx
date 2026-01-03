"use client";

import Link from "next/link";
import { Swords, Wrench, Scale, Compass, Bell, Search, LogIn } from "lucide-react";
import { UserMenu } from "@/components/auth";
import { useUser } from "@clerk/nextjs";

export function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border bg-background/95 backdrop-blur-sm px-4 lg:px-10 py-3">
      <div className="flex items-center gap-4 lg:gap-8">
        <Link href="/" className="flex items-center gap-3 text-foreground">
          <div className="size-8 text-primary flex items-center justify-center">
            <Swords className="w-7 h-7" />
          </div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block">VibeBuff</h2>
        </Link>
        <div className="hidden md:flex items-center gap-3 bg-card px-3 py-1.5 rounded-lg border border-border">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Lvl 1 Novice</span>
          <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-gradient-to-r from-primary to-purple-400"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg px-4 hidden sm:block">
        <label className="flex w-full items-stretch rounded-lg h-10 group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <div className="text-muted-foreground flex border-none bg-card items-center justify-center pl-4 rounded-l-lg">
            <Search className="w-5 h-5" />
          </div>
          <input
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none text-foreground focus:outline-0 bg-card border-none h-full placeholder:text-muted-foreground/50 px-4 pl-2 text-sm font-normal"
            placeholder="Cast 'Lookup' spell..."
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-foreground transition-colors border border-border relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse"></span>
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
    </header>
  );
}
