"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
] as const;

export default function CreateCompanyPage() {
  const { user } = useUser();
  const router = useRouter();
  const createCompany = useMutation(api.companies.create);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState<typeof COMPANY_SIZES[number]["value"] | "">("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!name.trim()) {
      setError("Company name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await createCompany({
        name: name.trim(),
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        industry: industry.trim() || undefined,
        size: size || undefined,
        location: location.trim() || undefined,
        userId: user.id,
      });
      router.push(`/companies/${result.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PixelCard className="p-8 text-center max-w-md">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground text-sm mb-4">
            You need to sign in to create a company.
          </p>
          <Link href="/sign-in">
            <PixelButton>Sign In</PixelButton>
          </Link>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/companies" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Companies
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">CREATE COMPANY</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Create a company profile to share your tech stack with your team.
          </p>
        </div>

        <PixelCard>
          <PixelCardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name *
                </label>
                <PixelInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Acme Inc."
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your company do?"
                  className="w-full h-24 px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Website URL
                </label>
                <PixelInput
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Industry
                  </label>
                  <PixelInput
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as typeof size)}
                    className="w-full h-10 px-4 bg-background border-2 border-border rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <PixelInput
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/companies" className="flex-1">
                  <PixelButton variant="outline" className="w-full" type="button">
                    Cancel
                  </PixelButton>
                </Link>
                <PixelButton type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Create Company
                    </>
                  )}
                </PixelButton>
              </div>
            </form>
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
