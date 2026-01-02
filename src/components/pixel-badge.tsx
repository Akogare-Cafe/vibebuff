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
          "border rounded-full text-xs tracking-wide px-3 py-1 font-medium",
          variant === "default" && "bg-gradient-to-r from-[#d4a853] to-[#b8923d] border-[#d4a853]/50 text-[#2d2a25]",
          variant === "secondary" && "bg-[#f5efe0] border-[#e8dcc8] text-[#5c4d3c] dark:bg-[#2d2a25] dark:border-[#3d3835] dark:text-[#f0d890]",
          variant === "outline" && "bg-transparent border-[#d4a853] text-[#d4a853]",
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
