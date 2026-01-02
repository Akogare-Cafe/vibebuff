"use client";

import Link from "next/link";
import { Gamepad2, Wrench, Scale, Compass, Layers, BookOpen, Trophy, Swords } from "lucide-react";
import { UserMenu } from "@/components/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  return (
    <header className="border-b-2 border-[#e8dcc8] dark:border-[#3d3835] p-4 bg-white/80 dark:bg-[#1a1816]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a853] to-[#b8923d] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading text-[#5c4d3c] dark:text-[#f0d890] text-lg tracking-wide">VIBEBUFF</h1>
        </Link>
        <nav className="flex gap-5 items-center">
          <Link
            href="/play"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors"
          >
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">Play</span>
          </Link>
          <Link
            href="/tools"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Tools</span>
          </Link>
          <Link
            href="/compare"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </Link>
          <Link
            href="/quest"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Quest</span>
          </Link>
          <Link
            href="/architecture"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors hidden md:flex"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Architecture</span>
          </Link>
          <Link
            href="/blog"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors hidden md:flex"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          <Link
            href="/leaderboard"
            className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm flex items-center gap-1.5 transition-colors hidden lg:flex"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Rankings</span>
          </Link>
          <ThemeSwitcher />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
