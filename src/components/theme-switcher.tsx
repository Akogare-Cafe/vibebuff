"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-1 text-sm uppercase transition-colors text-primary hover:text-foreground"
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{mode === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
