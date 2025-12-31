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
          "bg-[#000000] border-4 border-[#1e3a5f] text-[#60a5fa]",
          "placeholder:text-[#1e3a5f] text-[10px]",
          "focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
          "shadow-[inset_2px_2px_0_#0a1628]",
          "h-12 px-4",
          className
        )}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";
