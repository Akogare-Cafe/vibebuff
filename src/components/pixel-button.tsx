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
          "relative tracking-wide font-semibold",
          "border-none rounded-md",
          "bg-primary text-primary-foreground",
          "hover:opacity-90",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
          "transition-all duration-200 ease-out",
          size === "sm" && "text-xs px-3 py-1.5",
          size === "default" && "text-sm px-4 py-2",
          size === "lg" && "text-base px-6 py-2.5",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
          variant === "ghost" && "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
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
