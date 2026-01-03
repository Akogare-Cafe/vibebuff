"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "bg-background border border-border rounded-md",
          "text-foreground text-sm",
          "placeholder:text-muted-foreground",
          "focus:ring-1 focus:ring-primary focus:border-primary",
          "h-10 px-3",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";
