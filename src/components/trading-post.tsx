"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Store, 
  Gavel,
  Tag,
  ArrowLeftRight,
  Clock,
  Star,
  Gem,
  Crown,
  TrendingUp,
  X
} from "lucide-react";

interface TradingPostProps {
  userId: string;
  className?: string;
}

const RARITY_CONFIG = {
  common: { color: "text-gray-400 border-gray-400", label: "COMMON" },
  uncommon: { color: "text-green-400 border-green-400", label: "UNCOMMON" },
  rare: { color: "text-blue-400 border-blue-400", label: "RARE" },
  legendary: { color: "text-purple-400 border-purple-400", label: "LEGENDARY" },
  mythic: { color: "text-yellow-400 border-yellow-400", label: "MYTHIC" },
};

export function TradingPost({ userId, className }: TradingPostProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "my-cards" | "my-listings">("browse");
  
  const listings = useQuery(api.trading.getActiveListings, { limit: 20 });
  const userCards = useQuery(api.trading.getUserCards, { userId });
  const marketStats = useQuery(api.trading.getMarketStats);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <Store className="w-4 h-4" /> TRADING POST
        </h2>
        {marketStats && (
          <div className="flex gap-3 text-[8px]">
            <span className="text-muted-foreground">{marketStats.activeListings} listings</span>
            <span className="text-muted-foreground">{marketStats.recentTrades} trades</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <PixelButton
          variant={activeTab === "browse" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("browse")}
        >
          <Store className="w-3 h-3 mr-1" /> BROWSE
        </PixelButton>
        <PixelButton
          variant={activeTab === "my-cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("my-cards")}
        >
          <Star className="w-3 h-3 mr-1" /> MY CARDS
        </PixelButton>
        <PixelButton
          variant={activeTab === "my-listings" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("my-listings")}
        >
          <Tag className="w-3 h-3 mr-1" /> MY LISTINGS
        </PixelButton>
      </div>

      {activeTab === "browse" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings?.map((listing: any) => (
            <ListingCard key={listing._id} listing={listing} userId={userId} />
          ))}
          {(!listings || listings.length === 0) && (
            <PixelCard className="col-span-full p-8 text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-[10px]">NO ACTIVE LISTINGS</p>
            </PixelCard>
          )}
        </div>
      )}

      {activeTab === "my-cards" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userCards?.map((card: any) => (
            <CardDisplay key={card._id} card={card} userId={userId} showListButton />
          ))}
          {(!userCards || userCards.length === 0) && (
            <PixelCard className="col-span-full p-8 text-center">
              <Gem className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-[10px]">NO CARDS YET</p>
              <p className="text-muted-foreground text-[8px]">Open packs to collect cards!</p>
            </PixelCard>
          )}
        </div>
      )}

      {activeTab === "my-listings" && (
        <MyListings userId={userId} />
      )}
    </div>
  );
}

function ListingCard({ listing, userId }: { listing: any; userId: string }) {
  const buyNow = useMutation(api.trading.buyNow);
  const placeBid = useMutation(api.trading.placeBid);
  const [bidAmount, setBidAmount] = useState("");

  const rarityConfig = RARITY_CONFIG[listing.card?.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;
  const isOwn = listing.sellerId === userId;

  const handleBuy = async () => {
    if (isOwn) return;
    await buyNow({ buyerId: userId, listingId: listing._id });
  };

  const handleBid = async () => {
    if (isOwn || !bidAmount) return;
    await placeBid({ userId, listingId: listing._id, bidAmount: parseInt(bidAmount) });
    setBidAmount("");
  };

  const timeLeft = listing.expiresAt - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <PixelCard className={cn("p-3", rarityConfig.color)}>
      <div className="text-center mb-2">
        <Star className={cn("w-8 h-8 mx-auto", rarityConfig.color.split(" ")[0])} />
        <p className="text-primary text-[10px] mt-1">{listing.tool?.name}</p>
        <PixelBadge variant="outline" className={cn("text-[6px]", rarityConfig.color)}>
          {rarityConfig.label} #{listing.card?.serialNumber}
        </PixelBadge>
      </div>

      <div className="flex items-center justify-between mb-2 text-[8px]">
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> {hoursLeft}h
        </span>
        <span className="text-muted-foreground">{listing.card?.edition}</span>
      </div>

      {listing.listingType === "fixed" && (
        <div className="text-center mb-2">
          <p className="text-primary text-lg">{listing.price} XP</p>
          {!isOwn && (
            <PixelButton size="sm" onClick={handleBuy} className="w-full mt-2">
              BUY NOW
            </PixelButton>
          )}
        </div>
      )}

      {listing.listingType === "auction" && (
        <div className="text-center mb-2">
          <p className="text-muted-foreground text-[8px]">Current Bid</p>
          <p className="text-primary text-lg">{listing.currentBid || listing.price || 0} XP</p>
          {!isOwn && (
            <div className="flex gap-1 mt-2">
              <PixelInput
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="BID"
                type="number"
                className="flex-1"
              />
              <PixelButton size="sm" onClick={handleBid}>
                <Gavel className="w-3 h-3" />
              </PixelButton>
            </div>
          )}
        </div>
      )}

      {listing.listingType === "trade" && (
        <div className="text-center">
          <p className="text-muted-foreground text-[8px]">Looking for trade</p>
          <PixelButton size="sm" className="w-full mt-2" disabled={isOwn}>
            <ArrowLeftRight className="w-3 h-3 mr-1" /> OFFER
          </PixelButton>
        </div>
      )}
    </PixelCard>
  );
}

function CardDisplay({ card, userId, showListButton }: { card: any; userId: string; showListButton?: boolean }) {
  const [showListForm, setShowListForm] = useState(false);
  const rarityConfig = RARITY_CONFIG[card.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;

  return (
    <PixelCard className={cn("p-3", rarityConfig.color, card.isListed && "opacity-50")}>
      <div className="text-center mb-2">
        <Star className={cn("w-8 h-8 mx-auto", rarityConfig.color.split(" ")[0])} />
        <p className="text-primary text-[10px] mt-1">{card.tool?.name}</p>
        <PixelBadge variant="outline" className={cn("text-[6px]", rarityConfig.color)}>
          {rarityConfig.label} #{card.serialNumber}
        </PixelBadge>
      </div>

      <div className="text-[8px] text-muted-foreground mb-2">
        <p>Edition: {card.edition}</p>
        <p>From: {card.acquiredFrom}</p>
      </div>

      {showListButton && !card.isListed && (
        <PixelButton size="sm" className="w-full" onClick={() => setShowListForm(!showListForm)}>
          <Tag className="w-3 h-3 mr-1" /> LIST
        </PixelButton>
      )}

      {card.isListed && (
        <PixelBadge variant="outline" className="w-full text-center text-[8px]">
          LISTED
        </PixelBadge>
      )}

      {showListForm && (
        <ListCardForm cardId={card._id} userId={userId} onClose={() => setShowListForm(false)} />
      )}
    </PixelCard>
  );
}

function ListCardForm({ cardId, userId, onClose }: { cardId: Id<"tradableCards">; userId: string; onClose: () => void }) {
  const [listingType, setListingType] = useState<"fixed" | "auction">("fixed");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("24");
  const createListing = useMutation(api.trading.createListing);

  const handleList = async () => {
    await createListing({
      sellerId: userId,
      cardId,
      listingType,
      price: parseInt(price),
      durationHours: parseInt(duration),
    });
    onClose();
  };

  return (
    <div className="mt-3 p-2 border border-border bg-[#191022]">
      <div className="flex gap-2 mb-2">
        <PixelButton
          size="sm"
          variant={listingType === "fixed" ? "default" : "ghost"}
          onClick={() => setListingType("fixed")}
        >
          <Tag className="w-3 h-3" />
        </PixelButton>
        <PixelButton
          size="sm"
          variant={listingType === "auction" ? "default" : "ghost"}
          onClick={() => setListingType("auction")}
        >
          <Gavel className="w-3 h-3" />
        </PixelButton>
      </div>
      <PixelInput
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="PRICE (XP)"
        type="number"
        className="mb-2"
      />
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full bg-[#191022] border-2 border-border p-1 text-primary text-[10px] mb-2"
      >
        <option value="24">24 hours</option>
        <option value="48">48 hours</option>
        <option value="72">72 hours</option>
        <option value="168">1 week</option>
      </select>
      <div className="flex gap-2">
        <PixelButton size="sm" onClick={handleList} disabled={!price}>
          LIST
        </PixelButton>
        <PixelButton size="sm" variant="ghost" onClick={onClose}>
          <X className="w-3 h-3" />
        </PixelButton>
      </div>
    </div>
  );
}

function MyListings({ userId }: { userId: string }) {
  const history = useQuery(api.trading.getUserTradeHistory, { userId });
  const cancelListing = useMutation(api.trading.cancelListing);

  return (
    <div className="space-y-4">
      <h3 className="text-primary text-[10px] uppercase">TRADE HISTORY</h3>
      {history?.map((trade: any) => (
        <div key={trade._id} className="flex items-center justify-between p-3 border border-border">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-primary text-[10px]">{trade.tool?.name}</p>
              <p className="text-muted-foreground text-[8px]">
                {trade.role === "seller" ? "Sold" : "Bought"} for {trade.price} XP
              </p>
            </div>
          </div>
          <span className="text-muted-foreground text-[8px]">
            {new Date(trade.completedAt).toLocaleDateString()}
          </span>
        </div>
      ))}
      {(!history || history.length === 0) && (
        <PixelCard className="p-8 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-[10px]">NO TRADE HISTORY</p>
        </PixelCard>
      )}
    </div>
  );
}
