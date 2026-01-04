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
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
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
        className="flex items-center gap-2 px-2 py-1 border-2 border-border bg-[#191022] hover:border-primary transition-colors"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.firstName || "User"}
            className="w-6 h-6 border-2 border-primary"
          />
        ) : (
          <div className="w-6 h-6 bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-background" />
          </div>
        )}
        <span className="text-primary text-xs hidden sm:block max-w-[80px] truncate">
          {user?.firstName || user?.username || "PLAYER"}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border-4 border-border shadow-lg z-50">
          {/* User Info Header */}
          <div className="p-3 border-b-2 border-border">
            <div className="flex items-center gap-3">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  className="w-10 h-10 border-2 border-primary"
                />
              ) : (
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <User className="w-6 h-6 text-background" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-primary text-sm font-bold truncate">
                  {user?.firstName || user?.username || "ADVENTURER"}
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            {/* XP Bar (placeholder) */}
            <div className="mt-2">
              <div className="flex justify-between text-[6px] text-muted-foreground mb-1">
                <span>LEVEL 1</span>
                <span>0 / 100 XP</span>
              </div>
              <div className="h-2 bg-[#191022] border border-border">
                <div className="h-full bg-primary w-0" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-primary hover:bg-[#191022] text-xs"
            >
              <User className="w-3 h-3" />
              MY PROFILE
            </Link>
            <Link
              href="/profile/decks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-primary hover:bg-[#191022] text-xs"
            >
              <Swords className="w-3 h-3" />
              MY DECKS
            </Link>
            <Link
              href="/profile/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-primary hover:bg-[#191022] text-xs"
            >
              <Heart className="w-3 h-3" />
              FAVORITES
            </Link>
            <Link
              href="/profile/achievements"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-primary hover:bg-[#191022] text-xs"
            >
              <Trophy className="w-3 h-3" />
              ACHIEVEMENTS
            </Link>
            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-primary hover:bg-[#191022] text-xs"
            >
              <Settings className="w-3 h-3" />
              SETTINGS
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t-2 border-border py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 text-xs w-full"
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
