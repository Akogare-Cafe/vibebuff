import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  variant?: "narrow" | "default" | "wide";
  className?: string;
}

export function PageContainer({ 
  children, 
  variant = "default", 
  className 
}: PageContainerProps) {
  const variants = {
    narrow: "max-w-4xl",
    default: "max-w-[1400px]",
    wide: "max-w-[1600px]",
  };

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}
