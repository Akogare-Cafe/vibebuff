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
          "pixel-btn relative uppercase tracking-wider",
          "border-4 border-[#1e3a5f] bg-[#0a1628] text-[#60a5fa]",
          "hover:bg-[#3b82f6] hover:text-[#000000]",
          "active:translate-x-1 active:translate-y-1",
          "transition-all duration-100",
          "shadow-[4px_4px_0_#000000]",
          "hover:shadow-[2px_2px_0_#000000]",
          "active:shadow-none",
          size === "sm" && "text-[8px] px-3 py-1",
          size === "default" && "text-[10px] px-6 py-3",
          size === "lg" && "text-[12px] px-8 py-4",
          variant === "secondary" && "bg-[#3b82f6] text-[#000000] hover:bg-[#60a5fa]",
          variant === "outline" && "bg-transparent border-[#3b82f6]",
          variant === "ghost" && "bg-transparent border-transparent shadow-none hover:bg-[#0a1628]",
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
