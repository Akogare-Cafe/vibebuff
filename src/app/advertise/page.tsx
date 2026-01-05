"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
  PixelCardDescription,
} from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { useState } from "react";
import {
  Megaphone,
  Eye,
  MousePointer,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Mail,
  Building,
  Globe,
  User,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";

export default function AdvertisePage() {
  const pricing = useQuery(api.ads.getAdPricing);
  const createAdvertiser = useMutation(api.ads.createAdvertiser);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    websiteUrl: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    try {
      await createAdvertiser({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName || undefined,
        websiteUrl: formData.websiteUrl || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Targeted Reach",
      description: "Reach developers actively exploring tools for their projects",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "High Visibility",
      description: "Premium placements across tool pages, comparisons, and search",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track impressions, clicks, and CTR with detailed reporting",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Flexible Pricing",
      description: "Choose from CPC, CPM, or flat-rate pricing models",
    },
  ];

  const stats = [
    { label: "Monthly Visitors", value: "50K+" },
    { label: "Tool Pages", value: "500+" },
    { label: "Avg. Session", value: "4 min" },
    { label: "Developer Audience", value: "95%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <PixelBadge className="mb-4">
              <Megaphone className="w-4 h-4 mr-2" />
              Advertise with VibeBuff
            </PixelBadge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading mb-6">
              Reach Developers Where They Discover Tools
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with thousands of developers actively searching for the best
              development tools. Premium ad placements with transparent pricing.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#pricing">
                <PixelButton size="lg">
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </PixelButton>
              </a>
              <a href="#contact">
                <PixelButton variant="outline" size="lg">Get Started</PixelButton>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <PixelCard key={i}>
              <PixelCardContent className="text-center py-6">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 font-heading">
            Why Advertise on VibeBuff?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <PixelCard key={i}>
                <PixelCardContent className="py-6">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </PixelCardContent>
              </PixelCard>
            ))}
          </div>
        </div>

        <div id="pricing" className="mb-16 scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-8 font-heading">
            Ad Placement Pricing
          </h2>
          {pricing && pricing.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricing.map((price) => (
                <PixelCard
                  key={price._id}
                  rarity={price.placement === "header" ? "rare" : "common"}
                >
                  <PixelCardHeader>
                    <div className="flex items-center justify-between">
                      <PixelCardTitle className="capitalize">
                        {price.placement.replace("_", " ")}
                      </PixelCardTitle>
                      {price.placement === "header" && (
                        <PixelBadge>Premium</PixelBadge>
                      )}
                    </div>
                    <PixelCardDescription>{price.description}</PixelCardDescription>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="space-y-4">
                      {price.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          Dimensions: {price.dimensions.width} x {price.dimensions.height}px
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Daily</span>
                          <span className="font-bold text-lg">
                            ${price.pricePerDay}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Weekly</span>
                          <span className="font-bold text-lg">
                            ${price.pricePerWeek}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div>
                            <span className="text-sm">Monthly</span>
                            <p className="text-xs text-muted-foreground">Best value</p>
                          </div>
                          <span className="font-bold text-lg text-primary">
                            ${price.pricePerMonth}
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CPC Rate</span>
                          <span className="font-medium">${price.cpcRate}/click</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CPM Rate</span>
                          <span className="font-medium">${price.cpmRate}/1000 views</span>
                        </div>
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
            </div>
          ) : (
            <PixelCard>
              <PixelCardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Pricing information coming soon. Contact us for custom quotes.
                </p>
              </PixelCardContent>
            </PixelCard>
          )}
        </div>

        <div id="contact" className="scroll-mt-20">
          <div className="max-w-2xl mx-auto">
            <PixelCard rarity="uncommon">
              <PixelCardHeader>
                <PixelCardTitle className="text-center text-2xl">
                  {submitted ? "Application Submitted" : "Become an Advertiser"}
                </PixelCardTitle>
                <PixelCardDescription className="text-center">
                  {submitted
                    ? "We'll review your application and get back to you soon."
                    : "Fill out the form below to get started with advertising on VibeBuff."}
                </PixelCardDescription>
              </PixelCardHeader>
              <PixelCardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your advertiser application has been submitted. Our team will
                      review it and contact you within 1-2 business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                        {error}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Your Name *
                        </label>
                        <PixelInput
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </label>
                        <PixelInput
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Company Name
                        </label>
                        <PixelInput
                          placeholder="Acme Inc."
                          value={formData.companyName}
                          onChange={(e) =>
                            setFormData({ ...formData, companyName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Website URL
                        </label>
                        <PixelInput
                          type="url"
                          placeholder="https://example.com"
                          value={formData.websiteUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, websiteUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <PixelButton type="submit" className="w-full" size="lg">
                      <Megaphone className="w-4 h-4 mr-2" />
                      Submit Application
                    </PixelButton>
                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree to our advertising terms and policies.
                    </p>
                  </form>
                )}
              </PixelCardContent>
            </PixelCard>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4 font-heading">
            Questions About Advertising?
          </h2>
          <p className="text-muted-foreground mb-6">
            Contact our advertising team for custom packages and enterprise solutions.
          </p>
          <a href="mailto:ads@vibebuff.com">
            <PixelButton variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              ads@vibebuff.com
            </PixelButton>
          </a>
        </div>
      </div>
    </div>
  );
}
