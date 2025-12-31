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
    border: "border-[#1e3a5f]",
    glow: "",
    accent: "from-[#1e3a5f] to-[#0a1628]",
    shine: "",
  },
  uncommon: {
    border: "border-[#3b82f6]",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    accent: "from-[#3b82f6] to-[#1e3a5f]",
    shine: "",
  },
  rare: {
    border: "border-[#60a5fa]",
    glow: "shadow-[0_0_20px_rgba(96,165,250,0.4)]",
    accent: "from-[#60a5fa] to-[#3b82f6]",
    shine: "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:pointer-events-none",
  },
  legendary: {
    border: "border-[#fbbf24]",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.5)]",
    accent: "from-[#fbbf24] via-[#f59e0b] to-[#d97706]",
    shine: "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/5 before:pointer-events-none before:animate-pulse",
  },
};

export const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, children, rarity = "common", glowColor, ...props }, ref) => {
    const styles = rarityStyles[rarity];
    
    return (
      <Card
        ref={ref}
        className={cn(
          "pokemon-card relative overflow-hidden",
          "bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628]",
          "border-[6px] rounded-xl",
          styles.border,
          styles.glow,
          styles.shine,
          "hover:scale-[1.02] hover:-translate-y-1",
          "hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]",
          "transition-all duration-300 ease-out",
          "group",
          className
        )}
        style={glowColor ? { boxShadow: `0 0 20px ${glowColor}` } : undefined}
        {...props}
      >
        {/* Holographic shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
        
        {/* Inner border frame */}
        <div className="absolute inset-[3px] border-2 border-[#1e3a5f]/50 rounded-lg pointer-events-none" />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#60a5fa]/60 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#60a5fa]/60 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#60a5fa]/60 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#60a5fa]/60 rounded-br-lg" />
        
        {/* Rarity indicator strip */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
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
      "border-b-2 border-[#1e3a5f]/60",
      "bg-gradient-to-b from-[#0d1f3c]/50 to-transparent",
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
      "text-[#60a5fa] text-sm uppercase tracking-wider font-bold",
      "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]",
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
    className={cn("text-[#3b82f6] text-[10px] mt-2 leading-relaxed", className)}
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
      "bg-gradient-to-b from-transparent to-[#0a1628]/30",
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
      "border-2 border-[#1e3a5f]",
      "bg-gradient-to-br from-[#0d1f3c] to-[#0a1628]",
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
      "border-t border-[#1e3a5f]/40",
      "bg-[#0a1628]/50",
      className
    )}
    {...props}
  >
    {stats.map((stat, i) => (
      <div key={i} className="text-center">
        <p className="text-[#60a5fa] text-xs font-bold">{stat.value}</p>
        <p className="text-[#3b82f6] text-[8px] uppercase">{stat.label}</p>
      </div>
    ))}
  </div>
));
PixelCardStats.displayName = "PixelCardStats";

// Type badge (like Pokemon type icons)
export const PixelCardType = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { type?: "fire" | "water" | "electric" | "grass" | "dark" | "steel" | "psychic" }
>(({ className, type = "dark", children, ...props }, ref) => {
  const typeColors = {
    fire: "bg-gradient-to-r from-orange-500 to-red-500",
    water: "bg-gradient-to-r from-blue-400 to-cyan-500",
    electric: "bg-gradient-to-r from-yellow-400 to-amber-500",
    grass: "bg-gradient-to-r from-green-400 to-emerald-500",
    dark: "bg-gradient-to-r from-[#3b82f6] to-[#1e3a5f]",
    steel: "bg-gradient-to-r from-slate-400 to-slate-600",
    psychic: "bg-gradient-to-r from-purple-400 to-pink-500",
  };
  
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[8px] uppercase font-bold text-white",
        "shadow-md",
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
