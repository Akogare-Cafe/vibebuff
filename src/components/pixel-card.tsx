"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rarity?: "common" | "uncommon" | "rare" | "legendary";
  glowColor?: string;
}

const rarityStyles = {
  common: {
    border: "border-border",
    glow: "",
    accent: "from-muted-foreground to-muted-foreground",
    shine: "",
    ring: "",
  },
  uncommon: {
    border: "border-primary/50",
    glow: "",
    accent: "from-primary to-primary",
    shine: "",
    ring: "",
  },
  rare: {
    border: "border-primary",
    glow: "shadow-sm",
    accent: "from-primary to-primary",
    shine: "",
    ring: "",
  },
  legendary: {
    border: "border-primary",
    glow: "shadow-[0_0_12px_rgba(201,162,39,0.25)]",
    accent: "from-primary to-primary",
    shine: "shimmer",
    ring: "ring-1 ring-primary/30",
  },
};

export const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, children, rarity = "common", glowColor, ...props }, ref) => {
    const styles = rarityStyles[rarity];
    
    return (
      <Card
        ref={ref}
        className={cn(
          "fantasy-card relative overflow-hidden",
          "bg-card",
          "border rounded-lg",
          styles.border,
          styles.glow,
          styles.shine,
          styles.ring,
          "hover:-translate-y-0.5",
          "hover:shadow-md",
          "transition-all duration-200 ease-out",
          "group",
          className
        )}
        style={glowColor ? { boxShadow: `0 0 12px ${glowColor}` } : undefined}
        {...props}
      >
        {/* Rarity indicator strip */}
        {rarity !== "common" && (
          <div className={cn(
            "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r rounded-t-lg",
            styles.accent
          )} />
        )}
        
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    );
  }
);

PixelCard.displayName = "PixelCard";

export const PixelCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn(
      "relative pb-3 pt-4",
      "border-b border-border",
      className
    )}
    {...props}
  />
));
PixelCardHeader.displayName = "PixelCardHeader";

export const PixelCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      "text-foreground text-base tracking-wide font-semibold",
      "font-heading",
      className
    )}
    {...props}
  />
));
PixelCardTitle.displayName = "PixelCardTitle";

export const PixelCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn("text-muted-foreground text-sm mt-2 leading-relaxed", className)}
    {...props}
  />
));
PixelCardDescription.displayName = "PixelCardDescription";

export const PixelCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent 
    ref={ref} 
    className={cn(
      "pt-4 pb-4",
      className
    )} 
    {...props} 
  />
));
PixelCardContent.displayName = "PixelCardContent";

// New component for card artwork area (like Pokemon card image)
export const PixelCardArtwork = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative mx-3 my-2 rounded-md overflow-hidden",
      "border border-border",
      "bg-muted",
      "aspect-[4/3]",
      "flex items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
PixelCardArtwork.displayName = "PixelCardArtwork";

// Stats bar component (like HP/attack stats on Pokemon cards)
export const PixelCardStats = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { stats?: { label: string; value: string | number }[] }
>(({ className, stats = [], ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex justify-around items-center px-3 py-2",
      "border-t border-border",
      "bg-muted/50",
      className
    )}
    {...props}
  >
    {stats.map((stat, i) => (
      <div key={i} className="text-center">
        <p className="text-primary text-sm font-semibold font-heading">{stat.value}</p>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">{stat.label}</p>
      </div>
    ))}
  </div>
));
PixelCardStats.displayName = "PixelCardStats";

// Type badge (element types with pastel fantasy colors)
export const PixelCardType = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { type?: "fire" | "water" | "electric" | "grass" | "dark" | "steel" | "psychic" }
>(({ className, type = "dark", children, ...props }, ref) => {
  const typeColors = {
    fire: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    water: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    electric: "bg-primary/10 text-primary",
    grass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dark: "bg-secondary text-secondary-foreground",
    steel: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    psychic: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
        typeColors[type],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
PixelCardType.displayName = "PixelCardType";
