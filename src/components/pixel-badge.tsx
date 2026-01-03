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
          "border rounded-md text-xs tracking-wide px-2.5 py-0.5 font-medium",
          variant === "default" && "bg-primary border-primary text-primary-foreground",
          variant === "secondary" && "bg-secondary border-border text-secondary-foreground",
          variant === "outline" && "bg-transparent border-primary text-primary",
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
