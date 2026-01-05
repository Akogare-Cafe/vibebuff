"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { cn } from "@/lib/utils";
import { ExternalLink, Megaphone, X } from "lucide-react";
import { useEffect, useCallback, useState, Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

type AdPlacement =
  | "header"
  | "sidebar"
  | "footer"
  | "in_feed"
  | "tool_page"
  | "comparison_page"
  | "search_results";

interface AdDisplayProps {
  placement: AdPlacement;
  className?: string;
  limit?: number;
  showLabel?: boolean;
}

interface AdData {
  _id: Id<"ads">;
  content: {
    headline: string;
    description?: string;
    imageUrl?: string;
    ctaText?: string;
    destinationUrl: string;
    sponsoredToolId?: Id<"tools">;
  };
  adType: string;
  placement: string;
  sponsoredTool?: {
    _id: Id<"tools">;
    name: string;
    tagline: string;
    logoUrl?: string;
    slug: string;
  } | null;
  advertiser?: {
    name: string;
    logoUrl?: string;
  } | null;
}

function AdDisplayInner({
  placement,
  className,
  limit = 1,
  showLabel = true,
}: AdDisplayProps) {
  const ads = useQuery(api.ads.getActiveAdsForPlacement, { placement, limit });
  const recordImpression = useMutation(api.ads.recordImpression);
  const recordClick = useMutation(api.ads.recordClick);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const currentPage = typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    if (ads && ads.length > 0) {
      ads.forEach((ad: AdData) => {
        if (!dismissed.has(ad._id)) {
          recordImpression({
            adId: ad._id,
            page: currentPage,
          });
        }
      });
    }
  }, [ads, recordImpression, currentPage, dismissed]);

  const handleClick = useCallback(
    (adId: Id<"ads">) => {
      recordClick({
        adId,
        page: currentPage,
      });
    },
    [recordClick, currentPage]
  );

  const handleDismiss = (adId: string) => {
    setDismissed((prev) => new Set(prev).add(adId));
  };

  if (!ads || ads.length === 0) {
    return null;
  }

  const visibleAds = ads.filter((ad: AdData) => !dismissed.has(ad._id));
  if (visibleAds.length === 0) return null;

  return (
    <div className={cn("ad-container", className)}>
      {visibleAds.map((ad: AdData) => (
        <AdUnit
          key={ad._id}
          ad={ad}
          placement={placement}
          showLabel={showLabel}
          onDismiss={() => handleDismiss(ad._id)}
          onClick={() => handleClick(ad._id)}
        />
      ))}
    </div>
  );
}

interface AdUnitProps {
  ad: AdData;
  placement: AdPlacement;
  showLabel: boolean;
  onDismiss: () => void;
  onClick: () => void;
}

function AdUnit({ ad, placement, showLabel, onDismiss, onClick }: AdUnitProps) {
  const isBanner = placement === "header" || placement === "footer";
  const isSidebar = placement === "sidebar";
  const isNative = ad.adType === "native" || ad.adType === "sponsored_tool";

  if (isNative && ad.sponsoredTool) {
    return (
      <SponsoredToolAd
        ad={ad}
        showLabel={showLabel}
        onDismiss={onDismiss}
        onClick={onClick}
      />
    );
  }

  if (isBanner) {
    return (
      <BannerAd
        ad={ad}
        showLabel={showLabel}
        onDismiss={onDismiss}
        onClick={onClick}
      />
    );
  }

  if (isSidebar) {
    return (
      <SidebarAd
        ad={ad}
        showLabel={showLabel}
        onDismiss={onDismiss}
        onClick={onClick}
      />
    );
  }

  return (
    <InlineAd
      ad={ad}
      showLabel={showLabel}
      onDismiss={onDismiss}
      onClick={onClick}
    />
  );
}

function BannerAd({
  ad,
  showLabel,
  onDismiss,
  onClick,
}: Omit<AdUnitProps, "placement">) {
  return (
    <div className="relative w-full bg-muted/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {showLabel && (
              <PixelBadge variant="outline" className="shrink-0 text-xs">
                <Megaphone className="w-3 h-3 mr-1" />
                Sponsored
              </PixelBadge>
            )}
            {ad.content.imageUrl && (
              <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
                <Image
                  src={ad.content.imageUrl}
                  alt={ad.content.headline}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {ad.content.headline}
              </p>
              {ad.content.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {ad.content.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={ad.content.destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={onClick}
              className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {ad.content.ctaText || "Learn More"}
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={onDismiss}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarAd({
  ad,
  showLabel,
  onDismiss,
  onClick,
}: Omit<AdUnitProps, "placement">) {
  return (
    <PixelCard className="relative overflow-hidden">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors bg-background/80 rounded"
        aria-label="Dismiss ad"
      >
        <X className="w-3 h-3" />
      </button>
      {ad.content.imageUrl && (
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={ad.content.imageUrl}
            alt={ad.content.headline}
            fill
            className="object-cover"
          />
        </div>
      )}
      <PixelCardContent className="space-y-3">
        {showLabel && (
          <PixelBadge variant="outline" className="text-xs">
            <Megaphone className="w-3 h-3 mr-1" />
            Sponsored
          </PixelBadge>
        )}
        <h4 className="font-medium text-foreground">{ad.content.headline}</h4>
        {ad.content.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {ad.content.description}
          </p>
        )}
        <Link
          href={ad.content.destinationUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={onClick}
          className="inline-flex items-center gap-1 w-full justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {ad.content.ctaText || "Learn More"}
          <ExternalLink className="w-3 h-3" />
        </Link>
      </PixelCardContent>
    </PixelCard>
  );
}

function InlineAd({
  ad,
  showLabel,
  onDismiss,
  onClick,
}: Omit<AdUnitProps, "placement">) {
  return (
    <PixelCard className="relative">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-4 h-4" />
      </button>
      <PixelCardContent>
        <div className="flex gap-4">
          {ad.content.imageUrl && (
            <div className="relative w-24 h-24 shrink-0 rounded overflow-hidden">
              <Image
                src={ad.content.imageUrl}
                alt={ad.content.headline}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            {showLabel && (
              <PixelBadge variant="outline" className="text-xs">
                <Megaphone className="w-3 h-3 mr-1" />
                Sponsored
              </PixelBadge>
            )}
            <h4 className="font-medium text-foreground">{ad.content.headline}</h4>
            {ad.content.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {ad.content.description}
              </p>
            )}
            <Link
              href={ad.content.destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={onClick}
              className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
            >
              {ad.content.ctaText || "Learn More"}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function SponsoredToolAd({
  ad,
  showLabel,
  onDismiss,
  onClick,
}: Omit<AdUnitProps, "placement">) {
  const tool = ad.sponsoredTool;
  if (!tool) return null;

  return (
    <PixelCard className="relative" rarity="uncommon">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-4 h-4" />
      </button>
      <PixelCardContent>
        <div className="flex gap-4">
          {tool.logoUrl && (
            <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
              <Image
                src={tool.logoUrl}
                alt={tool.name}
                fill
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {showLabel && (
                <PixelBadge variant="outline" className="text-xs">
                  <Megaphone className="w-3 h-3 mr-1" />
                  Sponsored
                </PixelBadge>
              )}
            </div>
            <h4 className="font-medium text-foreground">{tool.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tool.tagline}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/tools/${tool.slug}`}
                onClick={onClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                View Tool
              </Link>
              <Link
                href={ad.content.destinationUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={onClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

class AdErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.debug("AdDisplay error (Convex not connected):", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function AdDisplay(props: AdDisplayProps) {
  return (
    <AdErrorBoundary fallback={null}>
      <AdDisplayInner {...props} />
    </AdErrorBoundary>
  );
}

export function AdPlaceholder({
  placement,
  className,
}: {
  placement: AdPlacement;
  className?: string;
}) {
  const isBanner = placement === "header" || placement === "footer";

  return (
    <div
      className={cn(
        "border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground/50",
        isBanner ? "h-20" : "h-48",
        className
      )}
    >
      <div className="text-center">
        <Megaphone className="w-6 h-6 mx-auto mb-2" />
        <p className="text-sm">Ad Space: {placement}</p>
      </div>
    </div>
  );
}
