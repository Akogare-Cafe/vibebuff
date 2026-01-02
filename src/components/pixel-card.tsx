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
    border: "border-[#e8dcc8]",
    glow: "",
    accent: "from-[#8b7355] to-[#5c4d3c]",
    shine: "",
    ring: "",
  },
  uncommon: {
    border: "border-[#7eb8b8]",
    glow: "shadow-[0_0_20px_rgba(126,184,184,0.25)]",
    accent: "from-[#7eb8b8] to-[#5a9090]",
    shine: "",
    ring: "ring-1 ring-[#7eb8b8]/30",
  },
  rare: {
    border: "border-[#b8a5d4]",
    glow: "shadow-[0_0_25px_rgba(184,165,212,0.3)]",
    accent: "from-[#b8a5d4] to-[#9080b0]",
    shine: "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent before:pointer-events-none before:rounded-xl",
    ring: "ring-1 ring-[#b8a5d4]/40",
  },
  legendary: {
    border: "border-[#d4a853]",
    glow: "shadow-[0_0_30px_rgba(212,168,83,0.4)]",
    accent: "from-[#f0d890] via-[#d4a853] to-[#b8923d]",
    shine: "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/25 before:via-transparent before:to-white/5 before:pointer-events-none before:rounded-xl shimmer",
    ring: "ring-2 ring-[#d4a853]/50",
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
          "bg-gradient-to-b from-white via-[#faf8f3] to-[#f5efe0]",
          "dark:from-[#252220] dark:via-[#1f1d1b] dark:to-[#1a1816]",
          "border-2 rounded-xl",
          styles.border,
          styles.glow,
          styles.shine,
          styles.ring,
          "hover:scale-[1.02] hover:-translate-y-1",
          "hover:shadow-[0_8px_30px_rgba(212,168,83,0.15)]",
          "transition-all duration-300 ease-out",
          "group",
          className
        )}
        style={glowColor ? { boxShadow: `0 0 25px ${glowColor}` } : undefined}
        {...props}
      >
        {/* Golden shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4a853]/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
        
        {/* Ornate corner decorations */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#d4a853]/40 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#d4a853]/40 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#d4a853]/40 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#d4a853]/40 rounded-br-lg pointer-events-none" />
        
        {/* Rarity indicator strip */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r rounded-t-xl",
          styles.accent
        )} />
        
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
      "border-b border-[#e8dcc8] dark:border-[#3d3835]",
      "bg-gradient-to-b from-[#faf8f3]/50 to-transparent dark:from-[#252220]/50",
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
      "text-[#5c4d3c] dark:text-[#f0d890] text-base tracking-wide font-semibold",
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
    className={cn("text-[#8b7355] dark:text-[#b8a080] text-sm mt-2 leading-relaxed", className)}
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
      "bg-gradient-to-b from-transparent to-[#f5efe0]/30 dark:to-[#1a1816]/30",
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
      "relative mx-3 my-2 rounded-lg overflow-hidden",
      "border border-[#e8dcc8] dark:border-[#3d3835]",
      "bg-gradient-to-br from-[#faf8f3] to-[#f0ebe0] dark:from-[#252220] dark:to-[#1a1816]",
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
      "border-t border-[#e8dcc8]/60 dark:border-[#3d3835]/60",
      "bg-[#f5efe0]/50 dark:bg-[#1a1816]/50",
      className
    )}
    {...props}
  >
    {stats.map((stat, i) => (
      <div key={i} className="text-center">
        <p className="text-[#d4a853] text-sm font-semibold font-heading">{stat.value}</p>
        <p className="text-[#8b7355] dark:text-[#b8a080] text-xs uppercase tracking-wide">{stat.label}</p>
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
    fire: "bg-gradient-to-r from-[#d4a5a5] to-[#c08080] text-[#5c3030]",
    water: "bg-gradient-to-r from-[#7eb8b8] to-[#5a9090] text-[#2d4040]",
    electric: "bg-gradient-to-r from-[#f0d890] to-[#d4a853] text-[#5c4d3c]",
    grass: "bg-gradient-to-r from-[#a5d4b8] to-[#80b090] text-[#304030]",
    dark: "bg-gradient-to-r from-[#8b7355] to-[#5c4d3c] text-[#f5efe0]",
    steel: "bg-gradient-to-r from-[#b0b0b8] to-[#8888a0] text-[#303040]",
    psychic: "bg-gradient-to-r from-[#b8a5d4] to-[#9080b0] text-[#403050]",
  };
  
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        "shadow-sm border border-white/20",
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
