"use client";

import Link from "next/link";
import { Gamepad2, Wrench, Scale, Compass, Layers, BookOpen, Trophy, Swords } from "lucide-react";
import { UserMenu } from "@/components/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  return (
    <header className="border-b-4 border-[#1e3a5f] p-4 bg-[#000000]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-[#3b82f6]" />
          <h1 className="text-[#60a5fa] text-sm pixel-glow">VIBEBUFF</h1>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link
            href="/play"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <Swords className="w-3 h-3" />
            <span className="hidden sm:inline">Play</span>
          </Link>
          <Link
            href="/tools"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <Wrench className="w-3 h-3" />
            <span className="hidden sm:inline">Tools</span>
          </Link>
          <Link
            href="/compare"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <Scale className="w-3 h-3" />
            <span className="hidden sm:inline">Compare</span>
          </Link>
          <Link
            href="/quest"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <Compass className="w-3 h-3" />
            <span className="hidden sm:inline">Quest</span>
          </Link>
          <Link
            href="/architecture"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Architecture</span>
          </Link>
          <Link
            href="/blog"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          <Link
            href="/leaderboard"
            className="text-[#3b82f6] hover:text-[#60a5fa] text-[10px] uppercase flex items-center gap-1"
          >
            <Trophy className="w-3 h-3" />
            <span className="hidden sm:inline">Rankings</span>
          </Link>
          <ThemeSwitcher />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
