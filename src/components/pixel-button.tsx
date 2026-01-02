"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "fantasy-btn relative tracking-wide font-medium",
          "border-2 border-[#d4a853] rounded-lg",
          "bg-gradient-to-b from-[#f5efe0] to-[#e8dcc8]",
          "text-[#5c4d3c]",
          "hover:from-[#f0d890] hover:to-[#d4a853] hover:text-[#3d3a35]",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
          "transition-all duration-200 ease-out",
          "shadow-[0_2px_8px_rgba(212,168,83,0.2)]",
          "hover:shadow-[0_4px_16px_rgba(212,168,83,0.35)]",
          "active:shadow-[0_1px_4px_rgba(212,168,83,0.2)]",
          "dark:from-[#2d2a25] dark:to-[#252220] dark:text-[#f0d890]",
          "dark:hover:from-[#d4a853] dark:hover:to-[#b8923d] dark:hover:text-[#1a1816]",
          size === "sm" && "text-xs px-3 py-1.5",
          size === "default" && "text-sm px-5 py-2.5",
          size === "lg" && "text-base px-7 py-3",
          variant === "secondary" && "bg-gradient-to-b from-[#7eb8b8] to-[#5a9090] border-[#5a9090] text-white hover:from-[#8ec8c8] hover:to-[#6aa0a0]",
          variant === "outline" && "bg-transparent border-[#d4a853] text-[#d4a853] hover:bg-[#d4a853]/10",
          variant === "ghost" && "bg-transparent border-transparent shadow-none hover:bg-[#f5efe0] dark:hover:bg-[#2d2a25]",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

PixelButton.displayName = "PixelButton";
