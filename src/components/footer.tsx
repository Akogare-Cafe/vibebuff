"use client";

import Link from "next/link";
import { Swords, Github, Twitter, Mail } from "lucide-react";

const footerLinks = {
  explore: [
    { name: "Start Quest", href: "/quest" },
    { name: "Browse Tools", href: "/tools" },
    { name: "Compare Tools", href: "/compare" },
    { name: "Stack Builder", href: "/stack-builder" },
  ],
  community: [
    { name: "Community Hub", href: "/community" },
    { name: "Developer Blog", href: "/blog" },
    { name: "About Us", href: "/about" },
    { name: "My Decks", href: "/deck" },
  ],
  support: [
    { name: "Documentation", href: "/docs" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 lg:py-12 mt-auto mb-20 lg:mb-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-foreground mb-4">
              <Swords className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">VibeBuff</h3>
            </Link>
            <p className="text-muted-foreground text-sm">Level up your development career with gamified learning paths.</p>
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
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 uppercase text-xs tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TechQuest. All rights reserved. Start Game.
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
            description: "AI-powered tech stack recommendations for developers",
            url: "https://vibebuff.com",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://vibebuff.com/tools?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
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
            url: "https://vibebuff.com",
            logo: "https://vibebuff.com/logo.png",
            sameAs: [
              "https://twitter.com/vibebuff",
              "https://github.com/vibebuff",
            ],
          }),
        }}
      />
    </footer>
  );
}
