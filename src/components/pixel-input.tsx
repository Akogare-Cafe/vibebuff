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
          "bg-white dark:bg-[#252220] border-2 border-[#e8dcc8] dark:border-[#3d3835] rounded-lg",
          "text-[#3d3a35] dark:text-[#f0ebe0] text-sm",
          "placeholder:text-[#8b7355] dark:placeholder:text-[#6b5b4b]",
          "focus:ring-2 focus:ring-[#d4a853]/50 focus:border-[#d4a853]",
          "shadow-sm",
          "h-12 px-4",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";
