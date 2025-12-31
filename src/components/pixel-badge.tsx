"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
  children: React.ReactNode;
}

export const PixelBadge = forwardRef<HTMLDivElement, PixelBadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={cn(
          "border-2 border-[#1e3a5f] text-[8px] uppercase tracking-wider px-2 py-1",
          variant === "default" && "bg-[#3b82f6] text-[#000000]",
          variant === "secondary" && "bg-[#0a1628] text-[#60a5fa]",
          variant === "outline" && "bg-transparent text-[#60a5fa]",
          className
        )}
        {...props}
      >
        {children}
      </Badge>
    );
  }
);

PixelBadge.displayName = "PixelBadge";
