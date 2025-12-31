"use client";

import Link from "next/link";
import { Gamepad2, Github, Twitter, Mail, Heart } from "lucide-react";

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
  return (
    <footer className="border-t-4 border-[#1e3a5f] bg-[#0a0a0a] mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-6 h-6 text-[#3b82f6]" />
              <span className="text-[#60a5fa] text-sm pixel-glow">VIBEBUFF</span>
            </Link>
            <p className="text-[#3b82f6] text-[8px] leading-relaxed mb-4">
              AI-powered tech stack recommendations for developers. Find the perfect tools for your next project.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/vibebuff"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/vibebuff"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@vibebuff.com"
                className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#3b82f6] hover:text-[#60a5fa] text-[8px] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#3b82f6] hover:text-[#60a5fa] text-[8px] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#3b82f6] hover:text-[#60a5fa] text-[8px] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-[#60a5fa] text-[10px] uppercase mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#3b82f6] hover:text-[#60a5fa] text-[8px] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1e3a5f] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#3b82f6] text-[8px]">
              © {new Date().getFullYear()} VIBEBUFF. All rights reserved.
            </p>
            <p className="text-[#3b82f6] text-[8px] flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500" /> for developers
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
