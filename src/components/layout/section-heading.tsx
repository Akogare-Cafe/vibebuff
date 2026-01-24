import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SectionHeadingProps {
  icon?: LucideIcon;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  iconClassName?: string;
}

export function SectionHeading({ 
  icon: Icon, 
  children, 
  size = "lg",
  className,
  iconClassName
}: SectionHeadingProps) {
  const sizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-lg sm:text-xl md:text-2xl",
    xl: "text-2xl sm:text-3xl md:text-4xl",
  };

  const iconSizes = {
    sm: "w-4 h-4 sm:w-5 sm:h-5",
    md: "w-5 h-5 sm:w-6 sm:h-6",
    lg: "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6",
    xl: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
  };

  return (
    <h2 className={cn(
      "font-heading text-foreground flex items-center gap-2 sm:gap-3",
      sizes[size],
      className
    )}>
      {Icon && (
        <Icon className={cn(
          "text-primary",
          iconSizes[size],
          iconClassName
        )} />
      )}
      {children}
    </h2>
  );
}
