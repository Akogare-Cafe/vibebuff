"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: "w-6 h-6", text: "text-lg" },
  md: { icon: "w-8 h-8", text: "text-xl" },
  lg: { icon: "w-12 h-12", text: "text-2xl" },
  xl: { icon: "w-16 h-16", text: "text-3xl" },
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(icon, "flex-shrink-0")}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path
          d="M16 4 L9 18 L12 18 L16 10 L20 18 L23 18 L16 4Z"
          fill="url(#logoGradient)"
        />
        <rect
          x="7"
          y="20"
          width="18"
          height="3"
          rx="1"
          fill="url(#logoGradient)"
        />
        <rect
          x="9"
          y="24"
          width="14"
          height="2.5"
          rx="1"
          fill="url(#logoGradient)"
          opacity="0.85"
        />
        <rect
          x="11"
          y="27.5"
          width="10"
          height="2"
          rx="1"
          fill="url(#logoGradient)"
          opacity="0.7"
        />
      </svg>
      {showText && (
        <span
          className={cn(
            text,
            "font-bold leading-tight tracking-[-0.015em] bg-gradient-to-r from-blue-400 via-primary to-blue-600 bg-clip-text text-transparent"
          )}
        >
          VibeBuff
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
    >
      <defs>
        <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M16 4 L9 18 L12 18 L16 10 L20 18 L23 18 L16 4Z"
        fill="url(#logoIconGradient)"
      />
      <rect
        x="7"
        y="20"
        width="18"
        height="3"
        rx="1"
        fill="url(#logoIconGradient)"
      />
      <rect
        x="9"
        y="24"
        width="14"
        height="2.5"
        rx="1"
        fill="url(#logoIconGradient)"
        opacity="0.85"
      />
      <rect
        x="11"
        y="27.5"
        width="10"
        height="2"
        rx="1"
        fill="url(#logoIconGradient)"
        opacity="0.7"
      />
    </svg>
  );
}
