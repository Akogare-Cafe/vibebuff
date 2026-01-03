"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "purple" | "cyan" | "orange" | "green" | "blue";

interface ThemeColors {
  name: string;
  background: string;
  foreground: string;
  card: string;
  primary: string;
  border: string;
  accent: string;
  surface: string;
  surfaceBorder: string;
  textSubtle: string;
}

export const themes: Record<Theme, ThemeColors> = {
  purple: {
    name: "TechQuest",
    background: "#191022",
    foreground: "#ffffff",
    card: "#261933",
    primary: "#7f13ec",
    border: "#362348",
    accent: "#a855f7",
    surface: "#261933",
    surfaceBorder: "#362348",
    textSubtle: "#ad92c9",
  },
  cyan: {
    name: "DevOps Paladin",
    background: "#0f1419",
    foreground: "#ffffff",
    card: "#1a2332",
    primary: "#06b6d4",
    border: "#1e3a4c",
    accent: "#22d3ee",
    surface: "#1a2332",
    surfaceBorder: "#1e3a4c",
    textSubtle: "#7dd3fc",
  },
  orange: {
    name: "Backend Warrior",
    background: "#1a1410",
    foreground: "#ffffff",
    card: "#2d2318",
    primary: "#f97316",
    border: "#44362a",
    accent: "#fb923c",
    surface: "#2d2318",
    surfaceBorder: "#44362a",
    textSubtle: "#fdba74",
  },
  green: {
    name: "Code Ranger",
    background: "#0f1a14",
    foreground: "#ffffff",
    card: "#1a2d22",
    primary: "#22c55e",
    border: "#2d4a3a",
    accent: "#4ade80",
    surface: "#1a2d22",
    surfaceBorder: "#2d4a3a",
    textSubtle: "#86efac",
  },
  blue: {
    name: "Frontend Mage",
    background: "#0f1629",
    foreground: "#ffffff",
    card: "#1a2744",
    primary: "#7f13ec",
    border: "#2d4a6a",
    accent: "#7f13ec",
    surface: "#1a2744",
    surfaceBorder: "#2d4a6a",
    textSubtle: "#93c5fd",
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("purple");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("vibebuff-theme") as Theme | null;
    const migrated = localStorage.getItem("vibebuff-theme-migrated-v2");
    if (!migrated) {
      localStorage.setItem("vibebuff-theme", "purple");
      localStorage.setItem("vibebuff-theme-migrated-v2", "true");
      setTheme("purple");
    } else if (stored && themes[stored]) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const colors = themes[theme];
    const root = document.documentElement;
    
    // Update CSS variables
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--card-foreground", colors.foreground);
    root.style.setProperty("--popover", colors.card);
    root.style.setProperty("--popover-foreground", colors.foreground);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--secondary", colors.surface);
    root.style.setProperty("--secondary-foreground", colors.foreground);
    root.style.setProperty("--muted", colors.surface);
    root.style.setProperty("--muted-foreground", colors.textSubtle);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-foreground", "#ffffff");
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input", colors.card);
    root.style.setProperty("--ring", colors.primary);
    root.style.setProperty("--surface", colors.surface);
    root.style.setProperty("--surface-border", colors.surfaceBorder);
    root.style.setProperty("--text-subtle", colors.textSubtle);
    
    // Store preference
    localStorage.setItem("vibebuff-theme", theme);
    
    // Update data attribute for CSS selectors
    root.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme for SSR/static generation
    return {
      theme: "purple" as Theme,
      setTheme: () => {},
      colors: themes.purple,
    };
  }
  return context;
}
