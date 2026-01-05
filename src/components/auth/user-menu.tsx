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
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-card border border-border">
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
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-secondary transition-all duration-200"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.firstName || "User"}
            className="w-7 h-7 rounded-md object-cover ring-2 ring-primary/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        )}
        <span className="text-foreground text-sm font-medium hidden sm:block max-w-[80px] truncate">
          {user?.firstName || user?.username || "Player"}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl shadow-black/20 z-50 overflow-hidden fade-in">
          {/* User Info Header */}
          <div className="p-4 bg-secondary/50">
            <div className="flex items-center gap-3">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  className="w-12 h-12 rounded-lg object-cover ring-2 ring-primary/40"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-bold truncate">
                  {user?.firstName || user?.username || "Adventurer"}
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            {/* XP Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary" />
                  Level 1
                </span>
                <span>0 / 100 XP</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill w-0" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              href="/profile/decks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              <Swords className="w-4 h-4" />
              My Decks
            </Link>
            <Link
              href="/profile/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Link>
            <Link
              href="/profile/achievements"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </Link>
            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-border p-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 text-sm font-medium w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
