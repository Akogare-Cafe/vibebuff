"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PixelButton } from "@/components/pixel-button";
import {
  User,
  LogOut,
  Settings,
  Trophy,
  Heart,
  Swords,
  ChevronDown,
  Loader2,
  Star,
  Zap
} from "lucide-react";

export function UserMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Link href="/sign-in">
        <PixelButton variant="outline" size="sm">
          <User className="w-3 h-3 mr-1" />
          LOGIN
        </PixelButton>
      </Link>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 border-2 border-[#1e3a5f] bg-[#0a1628] hover:border-[#3b82f6] transition-colors"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.firstName || "User"}
            className="w-6 h-6 border-2 border-[#3b82f6]"
          />
        ) : (
          <div className="w-6 h-6 bg-[#3b82f6] flex items-center justify-center">
            <User className="w-4 h-4 text-[#000000]" />
          </div>
        )}
        <span className="text-[#60a5fa] text-[8px] hidden sm:block max-w-[80px] truncate">
          {user?.firstName || user?.username || "PLAYER"}
        </span>
        <ChevronDown className={`w-3 h-3 text-[#3b82f6] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#000000] border-4 border-[#1e3a5f] shadow-[4px_4px_0_#000000] z-50">
          {/* User Info Header */}
          <div className="p-3 border-b-2 border-[#1e3a5f]">
            <div className="flex items-center gap-3">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  className="w-10 h-10 border-2 border-[#3b82f6]"
                />
              ) : (
                <div className="w-10 h-10 bg-[#3b82f6] flex items-center justify-center">
                  <User className="w-6 h-6 text-[#000000]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[#60a5fa] text-[10px] font-bold truncate">
                  {user?.firstName || user?.username || "ADVENTURER"}
                </p>
                <p className="text-[#3b82f6] text-[8px] truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            {/* XP Bar (placeholder) */}
            <div className="mt-2">
              <div className="flex justify-between text-[6px] text-[#3b82f6] mb-1">
                <span>LEVEL 1</span>
                <span>0 / 100 XP</span>
              </div>
              <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
                <div className="h-full bg-[#3b82f6] w-0" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[#60a5fa] hover:bg-[#0a1628] text-[8px]"
            >
              <User className="w-3 h-3" />
              MY PROFILE
            </Link>
            <Link
              href="/profile/decks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[#60a5fa] hover:bg-[#0a1628] text-[8px]"
            >
              <Swords className="w-3 h-3" />
              MY DECKS
            </Link>
            <Link
              href="/profile/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[#60a5fa] hover:bg-[#0a1628] text-[8px]"
            >
              <Heart className="w-3 h-3" />
              FAVORITES
            </Link>
            <Link
              href="/profile/achievements"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[#60a5fa] hover:bg-[#0a1628] text-[8px]"
            >
              <Trophy className="w-3 h-3" />
              ACHIEVEMENTS
            </Link>
            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[#60a5fa] hover:bg-[#0a1628] text-[8px]"
            >
              <Settings className="w-3 h-3" />
              SETTINGS
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t-2 border-[#1e3a5f] py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 text-[8px] w-full"
            >
              <LogOut className="w-3 h-3" />
              SIGN OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
