import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  showPadding?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function PageLayout({
  children,
  className = "",
  maxWidth = "7xl",
  showPadding = true,
}: PageLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      showPadding && "px-4 sm:px-6 lg:px-8 py-8",
      className
    )}>
      <main className={cn(
        "mx-auto",
        maxWidthClasses[maxWidth]
      )}>
        {children}
      </main>
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg" | "xl";
}

const spacingClasses = {
  sm: "mb-6",
  md: "mb-8",
  lg: "mb-12",
  xl: "mb-16",
};

export function Section({
  children,
  className = "",
  spacing = "lg",
}: SectionProps) {
  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

const gridColsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

const gapClasses = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function Grid({
  children,
  cols = 3,
  className = "",
  gap = "md",
}: GridProps) {
  return (
    <div className={cn(
      "grid",
      gridColsClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
