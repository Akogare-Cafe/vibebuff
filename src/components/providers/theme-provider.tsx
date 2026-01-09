"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

export type ColorMode = "light" | "dark";

interface ThemeContextType {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialMode(): ColorMode {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("vibebuff-color-mode") as ColorMode | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot(): ColorMode {
  return getInitialMode();
}

function getServerSnapshot(): ColorMode {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initialMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mode, setMode] = useState<ColorMode>(initialMode);

  useEffect(() => {
    const root = document.documentElement;
    
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("vibebuff-color-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      mode: "dark" as ColorMode,
      setMode: () => {},
      toggleMode: () => {},
    };
  }
  return context;
}
