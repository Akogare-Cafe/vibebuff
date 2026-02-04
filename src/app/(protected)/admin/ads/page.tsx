"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { useState } from "react";
import {
  Megaphone,
  Users,
  BarChart3,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Settings,
  TrendingUp,
} from "lucide-react";

type Tab = "overview" | "advertisers" | "campaigns" | "ads" | "pricing";

export default function AdsAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const advertisers = useQuery(api.ads.getAllAdvertisers);
  const campaigns = useQuery(api.ads.getAllCampaigns, {});
  const ads = useQuery(api.ads.getAllAds, {});
  const pricing = useQuery(api.ads.getAdPricing);
  const initializePricing = useMutation(api.ads.initializeAdPricing);

  const updateAdvertiserStatus = useMutation(api.ads.updateAdvertiserStatus);
  const updateCampaignStatus = useMutation(api.ads.updateCampaignStatus);
  const updateAdStatus = useMutation(api.ads.updateAdStatus);

  const totalImpressions = ads?.reduce((sum, ad) => sum + ad.impressions, 0) ?? 0;
  const totalClicks = ads?.reduce((sum, ad) => sum + ad.clicks, 0) ?? 0;
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const totalSpent = campaigns?.reduce((sum, c) => sum + c.spent, 0) ?? 0;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "advertisers", label: "Advertisers", icon: <Users className="w-4 h-4" /> },
    { id: "campaigns", label: "Campaigns", icon: <Megaphone className="w-4 h-4" /> },
    { id: "ads", label: "Ads", icon: <Eye className="w-4 h-4" /> },
    { id: "pricing", label: "Pricing", icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-primary" />
              Ad Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage advertisers, campaigns, and ad placements
            </p>
          </div>
          <PixelButton onClick={() => initializePricing()}>
            <Settings className="w-4 h-4 mr-2" />
            Initialize Pricing
          </PixelButton>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Impressions"
                value={totalImpressions.toLocaleString()}
                icon={<Eye className="w-5 h-5" />}
              />
              <StatCard
                title="Total Clicks"
                value={totalClicks.toLocaleString()}
                icon={<MousePointer className="w-5 h-5" />}
              />
              <StatCard
                title="Overall CTR"
                value={`${overallCTR.toFixed(2)}%`}
                icon={<Percent className="w-5 h-5" />}
              />
              <StatCard
                title="Total Revenue"
                value={`$${totalSpent.toFixed(2)}`}
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PixelCard>
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Quick Stats
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Active Advertisers</span>
                      <span className="font-medium">
                        {advertisers?.filter((a) => a.status === "approved").length ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Active Campaigns</span>
                      <span className="font-medium">
                        {campaigns?.filter((c) => c.status === "active").length ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Approved Ads</span>
                      <span className="font-medium">
                        {ads?.filter((a) => a.status === "approved").length ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pending Review</span>
                      <span className="font-medium text-yellow-500">
                        {ads?.filter((a) => a.status === "pending_review").length ?? 0}
                      </span>
                    </div>
                  </div>
                </PixelCardContent>
              </PixelCard>

              <PixelCard>
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Top Performing Ads
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent>
                  <div className="space-y-3">
                    {ads
                      ?.sort((a, b) => b.clicks - a.clicks)
                      .slice(0, 5)
                      .map((ad) => (
                        <div
                          key={ad._id}
                          className="flex justify-between items-center py-2 border-b border-border last:border-0"
                        >
                          <span className="font-medium truncate max-w-[200px]">
                            {ad.name}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {ad.impressions} imp
                            </span>
                            <span className="text-primary">{ad.clicks} clicks</span>
                          </div>
                        </div>
                      ))}
                    {(!ads || ads.length === 0) && (
                      <p className="text-muted-foreground text-center py-4">
                        No ads yet
                      </p>
                    )}
                  </div>
                </PixelCardContent>
              </PixelCard>
            </div>
          </div>
        )}

        {activeTab === "advertisers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Advertisers</h2>
              <PixelButton variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Advertiser
              </PixelButton>
            </div>
            <div className="grid gap-4">
              {advertisers?.map((advertiser) => (
                <PixelCard key={advertiser._id}>
                  <PixelCardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{advertiser.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {advertiser.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-medium">${advertiser.balance.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="font-medium">
                            ${advertiser.totalSpent.toFixed(2)}
                          </p>
                        </div>
                        <StatusBadge status={advertiser.status} />
                        <div className="flex gap-2">
                          {advertiser.status === "pending" && (
                            <>
                              <PixelButton
                                size="sm"
                                onClick={() =>
                                  updateAdvertiserStatus({
                                    advertiserId: advertiser._id,
                                    status: "approved",
                                  })
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </PixelButton>
                              <PixelButton
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAdvertiserStatus({
                                    advertiserId: advertiser._id,
                                    status: "rejected",
                                  })
                                }
                              >
                                <XCircle className="w-4 h-4" />
                              </PixelButton>
                            </>
                          )}
                          {advertiser.status === "approved" && (
                            <PixelButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAdvertiserStatus({
                                  advertiserId: advertiser._id,
                                  status: "suspended",
                                })
                              }
                            >
                              <Pause className="w-4 h-4" />
                            </PixelButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
              {(!advertisers || advertisers.length === 0) && (
                <PixelCard>
                  <PixelCardContent className="py-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No advertisers yet</p>
                  </PixelCardContent>
                </PixelCard>
              )}
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Campaigns</h2>
            </div>
            <div className="grid gap-4">
              {campaigns?.map((campaign) => (
                <PixelCard key={campaign._id}>
                  <PixelCardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-medium">${campaign.budget.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Spent</p>
                          <p className="font-medium">${campaign.spent.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Bid Type</p>
                          <p className="font-medium uppercase">{campaign.bidType}</p>
                        </div>
                        <StatusBadge status={campaign.status} />
                        <div className="flex gap-2">
                          {campaign.status === "pending_review" && (
                            <PixelButton
                              size="sm"
                              onClick={() =>
                                updateCampaignStatus({
                                  campaignId: campaign._id,
                                  status: "active",
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4" />
                            </PixelButton>
                          )}
                          {campaign.status === "active" && (
                            <PixelButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCampaignStatus({
                                  campaignId: campaign._id,
                                  status: "paused",
                                })
                              }
                            >
                              <Pause className="w-4 h-4" />
                            </PixelButton>
                          )}
                          {campaign.status === "paused" && (
                            <PixelButton
                              size="sm"
                              onClick={() =>
                                updateCampaignStatus({
                                  campaignId: campaign._id,
                                  status: "active",
                                })
                              }
                            >
                              <Play className="w-4 h-4" />
                            </PixelButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
              {(!campaigns || campaigns.length === 0) && (
                <PixelCard>
                  <PixelCardContent className="py-8 text-center">
                    <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No campaigns yet</p>
                  </PixelCardContent>
                </PixelCard>
              )}
            </div>
          </div>
        )}

        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Ads</h2>
            </div>
            <div className="grid gap-4">
              {ads?.map((ad) => (
                <PixelCard key={ad._id}>
                  <PixelCardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{ad.name}</h3>
                          <PixelBadge variant="outline">{ad.adType}</PixelBadge>
                          <PixelBadge variant="secondary">{ad.placement}</PixelBadge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ad.content.headline}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Impressions</p>
                          <p className="font-medium">{ad.impressions.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Clicks</p>
                          <p className="font-medium">{ad.clicks.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">CTR</p>
                          <p className="font-medium">
                            {ad.impressions > 0
                              ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                              : 0}
                            %
                          </p>
                        </div>
                        <StatusBadge status={ad.status} />
                        <div className="flex gap-2">
                          {ad.status === "pending_review" && (
                            <>
                              <PixelButton
                                size="sm"
                                onClick={() =>
                                  updateAdStatus({
                                    adId: ad._id,
                                    status: "approved",
                                  })
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </PixelButton>
                              <PixelButton
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAdStatus({
                                    adId: ad._id,
                                    status: "rejected",
                                  })
                                }
                              >
                                <XCircle className="w-4 h-4" />
                              </PixelButton>
                            </>
                          )}
                          {ad.status === "approved" && (
                            <PixelButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAdStatus({
                                  adId: ad._id,
                                  status: "paused",
                                })
                              }
                            >
                              <Pause className="w-4 h-4" />
                            </PixelButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
              {(!ads || ads.length === 0) && (
                <PixelCard>
                  <PixelCardContent className="py-8 text-center">
                    <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No ads yet</p>
                  </PixelCardContent>
                </PixelCard>
              )}
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Ad Pricing</h2>
              <PixelButton onClick={() => initializePricing()}>
                <Settings className="w-4 h-4 mr-2" />
                Reset Pricing
              </PixelButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pricing?.map((price) => (
                <PixelCard key={price._id}>
                  <PixelCardHeader>
                    <PixelCardTitle className="capitalize">
                      {price.placement.replace("_", " ")}
                    </PixelCardTitle>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {price.description}
                      </p>
                      {price.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          {price.dimensions.width} x {price.dimensions.height}px
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Daily</p>
                          <p className="font-medium">${price.pricePerDay}</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Weekly</p>
                          <p className="font-medium">${price.pricePerWeek}</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="font-medium">${price.pricePerMonth}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CPC Rate</span>
                        <span className="font-medium">${price.cpcRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CPM Rate</span>
                        <span className="font-medium">${price.cpmRate}</span>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
              {(!pricing || pricing.length === 0) && (
                <PixelCard className="md:col-span-2 lg:col-span-3">
                  <PixelCardContent className="py-8 text-center">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No pricing configured yet
                    </p>
                    <PixelButton onClick={() => initializePricing()}>
                      Initialize Default Pricing
                    </PixelButton>
                  </PixelCardContent>
                </PixelCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <PixelCard>
      <PixelCardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "outline"; icon: React.ReactNode }> = {
    pending: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
    pending_review: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
    approved: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
    active: { variant: "default", icon: <Play className="w-3 h-3" /> },
    paused: { variant: "secondary", icon: <Pause className="w-3 h-3" /> },
    rejected: { variant: "outline", icon: <XCircle className="w-3 h-3" /> },
    suspended: { variant: "outline", icon: <XCircle className="w-3 h-3" /> },
    draft: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
    completed: { variant: "secondary", icon: <CheckCircle className="w-3 h-3" /> },
  };

  const config = variants[status] || { variant: "outline" as const, icon: null };

  return (
    <PixelBadge variant={config.variant} className="capitalize flex items-center gap-1">
      {config.icon}
      {status.replace("_", " ")}
    </PixelBadge>
  );
}
