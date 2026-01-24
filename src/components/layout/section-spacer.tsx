import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionSpacerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function SectionSpacer({ 
  size = "lg", 
  className 
}: SectionSpacerProps) {
  const sizes = {
    sm: "mb-8 sm:mb-10 md:mb-12",
    md: "mb-10 sm:mb-12 md:mb-14",
    lg: "mb-12 sm:mb-16 md:mb-20",
    xl: "mb-16 sm:mb-20 md:mb-24",
  };

  return <div className={cn(sizes[size], className)} />;
}
