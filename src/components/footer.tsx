"use client";

import Link from "next/link";
import { Gamepad2, Github, Twitter, Mail, Heart, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const footerLinks = {
  product: [
    { name: "Tools", href: "/tools" },
    { name: "Compare", href: "/compare" },
    { name: "Quest", href: "/quest" },
    { name: "Architecture", href: "/architecture" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Documentation", href: "/docs" },
    { name: "API", href: "/api-docs" },
    { name: "Changelog", href: "/changelog" },
  ],
  categories: [
    { name: "Frontend Frameworks", href: "/tools?category=frontend" },
    { name: "Backend Frameworks", href: "/tools?category=backend" },
    { name: "Databases", href: "/tools?category=database" },
    { name: "DevOps Tools", href: "/tools?category=devops" },
    { name: "AI & ML", href: "/tools?category=ai-ml" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  const stats = useQuery(api.tools.getStats);
  
  const formatLastUpdated = (timestamp: number | null | undefined) => {
    if (!timestamp) return "Loading...";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <footer className="border-t-2 border-[#e8dcc8] dark:border-[#3d3835] bg-[#f5efe0] dark:bg-[#1a1816] mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a853] to-[#b8923d] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-[#5c4d3c] dark:text-[#f0d890] text-lg">VIBEBUFF</span>
            </Link>
            <p className="text-[#8b7355] dark:text-[#b8a080] text-sm leading-relaxed mb-4">
              AI-powered tech stack recommendations for developers. Find the perfect tools for your next project.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/vibebuff"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#252220] border border-[#e8dcc8] dark:border-[#3d3835] flex items-center justify-center text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] hover:border-[#d4a853] transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/vibebuff"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#252220] border border-[#e8dcc8] dark:border-[#3d3835] flex items-center justify-center text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] hover:border-[#d4a853] transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@vibebuff.com"
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#252220] border border-[#e8dcc8] dark:border-[#3d3835] flex items-center justify-center text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] hover:border-[#d4a853] transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-heading text-[#5c4d3c] dark:text-[#f0d890] text-sm mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-heading text-[#5c4d3c] dark:text-[#f0d890] text-sm mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h3 className="font-heading text-[#5c4d3c] dark:text-[#f0d890] text-sm mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-heading text-[#5c4d3c] dark:text-[#f0d890] text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#8b7355] dark:text-[#b8a080] hover:text-[#d4a853] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e8dcc8] dark:border-[#3d3835] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#8b7355] dark:text-[#b8a080] text-sm">
              © {new Date().getFullYear()} VIBEBUFF. All rights reserved.
            </p>
            <p className="text-[#8b7355] dark:text-[#b8a080] text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" /> Data updated: {formatLastUpdated(stats?.lastUpdated)}
            </p>
            <p className="text-[#8b7355] dark:text-[#b8a080] text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-[#d4a5a5]" /> for developers
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
