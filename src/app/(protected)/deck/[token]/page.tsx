"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import { use } from "react";
import { 
  Package, 
  Star, 
  ChevronRight, 
  ArrowLeft,
  Copy,
  Check,
  Share2
} from "lucide-react";
import { useState } from "react";

export default function SharedDeckPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const deck = useQuery(api.decks.getDeckByShareToken, { shareToken: token });
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (deck === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm">LOADING DECK...</div>
      </div>
    );
  }

  if (deck === null) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <PixelCard className="text-center p-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-primary text-lg mb-4">DECK NOT FOUND</h1>
            <p className="text-muted-foreground text-sm mb-6">
              THIS DECK MAY HAVE BEEN DELETED OR MADE PRIVATE.
            </p>
            <Link href="/">
              <PixelButton>
                <ArrowLeft className="w-3 h-3 mr-2" /> RETURN HOME
              </PixelButton>
            </Link>
          </PixelCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-muted-foreground text-sm hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> BACK TO VIBEBUFF
          </Link>
        </div>

        <PixelCard className="mb-8 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-primary text-lg mb-2 flex items-center gap-2">
                <Package className="w-5 h-5" /> {deck.name}
              </h1>
              {deck.description && (
                <p className="text-muted-foreground text-sm">{deck.description}</p>
              )}
            </div>
            <PixelButton size="sm" variant="outline" onClick={handleCopyLink}>
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Share2 className="w-3 h-3 mr-1" />}
              {copied ? "COPIED" : "SHARE"}
            </PixelButton>
          </div>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{deck.tools?.length || 0} TOOLS</span>
            <span>CREATED {new Date(deck.createdAt).toLocaleDateString()}</span>
          </div>
        </PixelCard>

        <h2 className="text-primary text-sm mb-4 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" /> TOOLS IN THIS DECK
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deck.tools?.filter((tool): tool is NonNullable<typeof tool> => tool !== null).map((tool, index) => (
            <Link key={tool._id} href={`/tools/${tool.slug}`}>
              <PixelCard className="h-full cursor-pointer hover:border-primary">
                <PixelCardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <PixelCardTitle className="flex items-center gap-1">
                      {index === 0 && <Star className="w-3 h-3" />}
                      {tool.name}
                    </PixelCardTitle>
                    <PixelBadge variant="outline" className="text-[6px]">
                      {tool.pricingModel === "free" ? "FREE" : 
                       tool.pricingModel === "freemium" ? "FREEMIUM" : 
                       tool.pricingModel === "open_source" ? "OSS" : "PAID"}
                    </PixelBadge>
                  </div>
                </PixelCardHeader>
                <PixelCardContent>
                  <p className="text-muted-foreground text-xs mb-2">{tool.tagline}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.tags?.slice(0, 3).map((tag) => (
                      <PixelBadge key={tag} variant="outline" className="text-[6px]">
                        {tag}
                      </PixelBadge>
                    ))}
                  </div>
                </PixelCardContent>
              </PixelCard>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            WANT TO BUILD YOUR OWN TECH STACK?
          </p>
          <Link href="/">
            <PixelButton>
              AI STACK BUILDER
            </PixelButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
