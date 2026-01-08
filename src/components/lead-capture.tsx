"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";
import { PixelInput } from "@/components/pixel-input";
import { Mail, CheckCircle, Zap, Gift, Bell, ArrowRight } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await subscribe({ email, source: "weekly-digest-widget" });
      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <PixelCard className="p-6 md:p-8 text-center bg-gradient-to-br from-primary/10 via-card to-primary/5 border-primary">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="font-heading text-foreground text-lg mb-2">You&apos;re In!</h3>
        <p className="text-muted-foreground text-sm">
          Check your inbox for weekly tech stack insights and exclusive tool recommendations.
        </p>
      </PixelCard>
    );
  }

  return (
    <PixelCard className="p-6 md:p-8 bg-gradient-to-br from-card via-background to-card border-primary/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-heading text-foreground text-lg">Weekly Tech Stack Digest</h3>
          <p className="text-muted-foreground text-xs">Join 5,000+ developers</p>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">
        Get the latest tool comparisons, framework updates, and AI-powered stack recommendations delivered to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
        <PixelInput
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
        />
        <PixelButton type="submit" disabled={isLoading}>
          {isLoading ? "Joining..." : "Subscribe"}
        </PixelButton>
      </form>

      {error && (
        <p className="text-destructive text-xs mt-2">{error}</p>
      )}

      <p className="text-muted-foreground text-xs mt-3">
        No spam. Unsubscribe anytime. Free forever.
      </p>
    </PixelCard>
  );
}

export function CTABanner() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-heading text-foreground text-2xl md:text-3xl mb-4">
          Ready to Build Your Perfect Stack?
        </h2>
        <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-2xl mx-auto">
          Join thousands of developers using VIBEBUFF to discover the best tools for their projects. 
          Get AI-powered recommendations in seconds.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/">
            <PixelButton size="lg">
              <Zap className="w-4 h-4 mr-2" />
              Start Free - No Signup Required
            </PixelButton>
          </a>
          <a href="/tools">
            <PixelButton size="lg" variant="outline">
              Browse 500+ Tools
            </PixelButton>
          </a>
        </div>
      </div>
    </section>
  );
}

export function FeatureHighlights() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Recommendations",
      description: "Describe your project and get instant, personalized tech stack suggestions.",
    },
    {
      icon: Gift,
      title: "100% Free Forever",
      description: "No credit card required. Access all features without any cost.",
    },
    {
      icon: Bell,
      title: "Stay Updated",
      description: "Get notified about new tools, framework updates, and trending stacks.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature) => (
        <PixelCard key={feature.title} className="p-5 text-center">
          <feature.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-heading text-foreground text-sm mb-2">{feature.title}</h3>
          <p className="text-muted-foreground text-xs">{feature.description}</p>
        </PixelCard>
      ))}
    </div>
  );
}

export function SocialProof() {
  const stats = [
    { value: "10,000+", label: "Developers" },
    { value: "500+", label: "Tools" },
    { value: "50,000+", label: "Stacks Built" },
    { value: "4.8/5", label: "Rating" },
  ];

  return (
    <div className="py-8 border-y border-border bg-card/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-primary text-2xl md:text-3xl">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-6 text-muted-foreground text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>No Credit Card Required</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>Free Forever</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>Updated Daily</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>500+ Tools</span>
      </div>
    </div>
  );
}

export function QuickStartCTA() {
  return (
    <PixelCard className="p-6 md:p-8 text-center bg-gradient-to-br from-primary/5 via-card to-primary/10">
      <h3 className="font-heading text-foreground text-xl mb-3">
        Build Your Stack in 60 Seconds
      </h3>
      <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
        No signup required. Just describe your project and get AI-powered recommendations instantly.
      </p>
      <a href="/">
        <PixelButton size="lg">
          Get Started Free
          <ArrowRight className="w-4 h-4 ml-2" />
        </PixelButton>
      </a>
    </PixelCard>
  );
}
