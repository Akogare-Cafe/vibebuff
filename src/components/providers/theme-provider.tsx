"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "blue" | "green" | "purple" | "amber" | "red";

interface ThemeColors {
  name: string;
  background: string;
  foreground: string;
  card: string;
  primary: string;
  border: string;
  accent: string;
}

export const themes: Record<Theme, ThemeColors> = {
  blue: {
    name: "Cyber Blue",
    background: "#000000",
    foreground: "#60a5fa",
    card: "#0a1628",
    primary: "#3b82f6",
    border: "#1e3a5f",
    accent: "#2563eb",
  },
  green: {
    name: "Game Boy",
    background: "#0f380f",
    foreground: "#9bbc0f",
    card: "#306230",
    primary: "#8bac0f",
    border: "#0f380f",
    accent: "#9bbc0f",
  },
  purple: {
    name: "Synthwave",
    background: "#0d0221",
    foreground: "#e879f9",
    card: "#1a0533",
    primary: "#a855f7",
    border: "#581c87",
    accent: "#c026d3",
  },
  amber: {
    name: "Terminal",
    background: "#000000",
    foreground: "#fbbf24",
    card: "#1c1a00",
    primary: "#f59e0b",
    border: "#78350f",
    accent: "#d97706",
  },
  red: {
    name: "Virtual Boy",
    background: "#000000",
    foreground: "#f87171",
    card: "#1c0a0a",
    primary: "#ef4444",
    border: "#7f1d1d",
    accent: "#dc2626",
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("blue");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("vibebuff-theme") as Theme | null;
    if (stored && themes[stored]) {
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
    root.style.setProperty("--primary-foreground", colors.background);
    root.style.setProperty("--secondary", colors.card);
    root.style.setProperty("--secondary-foreground", colors.foreground);
    root.style.setProperty("--muted", colors.card);
    root.style.setProperty("--muted-foreground", colors.primary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-foreground", colors.background);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input", colors.card);
    root.style.setProperty("--ring", colors.primary);
    
    // Update pixel colors
    root.style.setProperty("--color-pixel-black", colors.background);
    root.style.setProperty("--color-pixel-dark", colors.card);
    root.style.setProperty("--color-pixel-light", colors.primary);
    root.style.setProperty("--color-pixel-white", colors.foreground);
    
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
      theme: "blue" as Theme,
      setTheme: () => {},
      colors: themes.blue,
    };
  }
  return context;
}
