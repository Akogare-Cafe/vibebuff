"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { LogoIcon } from "@/components/logo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

const footerLinks = {
  explore: [
    { name: "AI Stack Builder", href: "/quest" },
    { name: "Browse 500+ Tools", href: "/tools" },
    { name: "Compare Tools", href: "/compare" },
    { name: "Visual Stack Builder", href: "/stack-builder" },
    { name: "Stack Marketplace", href: "/stack-marketplace" },
  ],
  categories: [
    { name: "Frontend Frameworks", href: "/tools?category=frontend" },
    { name: "Backend & APIs", href: "/tools?category=backend" },
    { name: "Databases", href: "/tools?category=database" },
    { name: "DevOps & Hosting", href: "/tools?category=devops" },
    { name: "Authentication", href: "/tools?category=authentication" },
  ],
  comparisons: [
    { name: "Next.js vs Remix", href: "/compare/nextjs-vs-remix" },
    { name: "React vs Vue", href: "/compare/react-vs-vue" },
    { name: "PostgreSQL vs MongoDB", href: "/compare/postgresql-vs-mongodb" },
    { name: "Vercel vs Netlify", href: "/compare/vercel-vs-netlify" },
    { name: "Supabase vs Firebase", href: "/compare/supabase-vs-firebase" },
  ],
  resources: [
    { name: "Developer Blog", href: "/blog" },
    { name: "Documentation", href: "/docs" },
    { name: "Community", href: "/community" },
    { name: "Get Started", href: "/get-started" },
    { name: "Leaderboards", href: "/leaderboards" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 lg:py-12 mt-auto mb-20 lg:mb-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-foreground mb-4">
              <LogoIcon className="w-5 h-5" />
              <h3 className="font-bold text-lg bg-gradient-to-r from-purple-400 via-primary to-purple-600 bg-clip-text text-transparent">VIBEBUFF</h3>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">AI-powered tech stack builder. Compare 500+ developer tools and build the perfect stack for your project.</p>
            <div className="flex gap-3">
              <a href="https://twitter.com/vibebuff" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/vibebuff" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/vibebuff" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Comparisons</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.comparisons.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} VIBEBUFF. All rights reserved. Built for developers, by developers.
            </p>
            <p className="text-muted-foreground text-xs">
              Compare React, Next.js, Vue, databases, and 500+ more developer tools.
            </p>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VIBEBUFF",
            alternateName: ["VibeBuff", "Vibe Buff", "Tech Stack Builder"],
            description: "AI-powered tech stack builder and developer tool recommendations. Compare 500+ tools including React, Next.js, Vue, databases, and more.",
            url: siteUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/tools?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
            inLanguage: "en-US",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "VIBEBUFF",
            url: siteUrl,
            logo: `${siteUrl}/logo.svg`,
            description: "AI-powered tech stack recommendations for developers. Compare 500+ developer tools and build the perfect stack.",
            foundingDate: "2024",
            sameAs: [
              "https://twitter.com/vibebuff",
              "https://github.com/vibebuff",
              "https://linkedin.com/company/vibebuff",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: `${siteUrl}/contact`,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "VIBEBUFF Tech Stack Builder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "1250",
              bestRating: "5",
              worstRating: "1",
            },
            description: "Build the perfect tech stack with AI-powered recommendations. Compare 500+ developer tools.",
            url: siteUrl,
            featureList: [
              "AI-powered tech stack recommendations",
              "Compare 500+ developer tools",
              "Visual stack builder",
              "Tool synergy analysis",
              "Cost estimation",
              "Community reviews",
            ],
          }),
        }}
      />
    </footer>
  );
}
