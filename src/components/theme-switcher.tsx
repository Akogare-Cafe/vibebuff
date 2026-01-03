"use client";

import { useTheme, themes, Theme } from "@/components/providers/theme-provider";
import { Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOrder: Theme[] = ["purple", "cyan", "orange", "green", "blue"];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[10px] uppercase transition-colors"
        style={{ color: colors.primary }}
        onMouseEnter={(e) => (e.currentTarget.style.color = colors.foreground)}
        onMouseLeave={(e) => (e.currentTarget.style.color = colors.primary)}
        aria-label="Change theme"
      >
        <Palette className="w-3 h-3" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 p-2 z-50 min-w-[140px]"
          style={{
            backgroundColor: colors.card,
            border: `4px solid ${colors.border}`,
            boxShadow: `4px 4px 0 ${colors.background}`,
          }}
        >
          <p
            className="text-[8px] uppercase mb-2 pb-1"
            style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}` }}
          >
            Select Theme
          </p>
          <div className="flex flex-col gap-1">
            {themeOrder.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 p-1 text-[8px] uppercase transition-all text-left"
                style={{
                  color: theme === t ? themes[t].foreground : themes[t].primary,
                  backgroundColor: theme === t ? themes[t].border : "transparent",
                }}
              >
                <span
                  className="w-3 h-3 border-2"
                  style={{
                    backgroundColor: themes[t].primary,
                    borderColor: themes[t].foreground,
                  }}
                />
                {themes[t].name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
