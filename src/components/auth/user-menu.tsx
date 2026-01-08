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
  Zap,
  Sparkles,
  Shield,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const menuItems = [
  { href: "/profile", icon: User, label: "My Profile" },
  { href: "/profile/decks", icon: Swords, label: "My Decks" },
  { href: "/profile/favorites", icon: Heart, label: "Favorites" },
  { href: "/profile/achievements", icon: Trophy, label: "Achievements" },
  { href: "/profile/settings", icon: Settings, label: "Settings" },
];

export function UserMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = useQuery(api.admin.isAdmin);

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
        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
      >
        <div className="relative">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.firstName || "User"}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <span className="text-foreground text-sm font-semibold hidden sm:block max-w-[100px] truncate">
          {user?.firstName || user?.username || "Player"}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/30 z-50 overflow-hidden fade-in">
          {/* User Info Header */}
          <div className="relative p-5 bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || "User"}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary/40 shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-base font-bold truncate">
                  {user?.firstName || user?.username || "Adventurer"}
                </p>
                <p className="text-muted-foreground text-xs truncate mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            
            {/* XP Bar */}
            <div className="relative mt-4 p-3 bg-background/50 rounded-xl border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Star className="w-3.5 h-3.5" />
                  Level 1
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">0 / 100 XP</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary to-purple-500 rounded-full transition-all duration-500 relative"
                  style={{ width: '0%' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group/item flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover/item:bg-primary/20 group-hover/item:scale-110 transition-all duration-200">
                  <item.icon className="w-4 h-4" />
                </div>
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="group/item flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover/item:bg-primary/30 group-hover/item:scale-110 transition-all duration-200">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-border p-2">
            <button
              onClick={handleSignOut}
              className="group/signout flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm font-medium w-full transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover/signout:bg-destructive/20 transition-all duration-200">
                <LogOut className="w-4 h-4" />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
