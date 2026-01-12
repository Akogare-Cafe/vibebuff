import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ClerkClientProvider } from "@/components/providers/clerk-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BotIdClient } from "botid/client";
import { OnboardingWrapper } from "@/components/onboarding-wrapper";
import { ReferralHandler } from "@/components/referral-handler";
import { McpNotificationBanner } from "@/components/mcp-notification-banner";
import { PageTourProvider } from "@/components/page-tour";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VIBEBUFF - Build Your Perfect Tech Stack | Compare 500+ Developer Tools",
    template: "%s | VIBEBUFF",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  description:
    "The ultimate tech stack builder for developers. Compare 500+ tools, get AI-powered recommendations, battle frameworks head-to-head, and discover what top startups use. Free forever.",
  keywords: [
    "tech stack builder",
    "best tech stack 2026",
    "developer tools comparison",
    "AI tech stack recommendations",
    "React vs Vue vs Svelte",
    "Next.js vs Remix vs Astro",
    "best database for startup",
    "PostgreSQL vs MongoDB vs PlanetScale",
    "Prisma vs Drizzle ORM",
    "Tailwind CSS vs Bootstrap",
    "Vercel vs Netlify vs Railway",
    "Supabase vs Firebase vs Convex",
    "web development tools 2026",
    "software development stack",
    "full stack development",
    "frontend frameworks 2026",
    "backend frameworks comparison",
    "SaaS tech stack",
    "startup tech stack",
    "enterprise tech stack",
    "open source developer tools",
    "free developer tools",
    "technology stack builder",
    "framework comparison tool",
    "best programming tools 2026",
    "developer resources",
    "AI coding tools",
    "Cursor vs GitHub Copilot",
    "DevOps tools comparison",
    "cloud platform comparison",
    "indie hacker tech stack",
    "vibe coding tools",
    "developer tool battles",
    "tech stack marketplace",
    "stack builder game",
    "developer tool database",
    "software engineering tools",
    "web development frameworks",
    "backend as a service",
    "authentication providers",
    "hosting platforms",
    "database comparison",
    "ORM comparison",
    "CSS frameworks",
    "state management libraries",
    "testing frameworks",
    "API development tools",
    "serverless platforms",
    "edge computing",
    "real-time databases",
    "headless CMS",
    "payment processing",
    "analytics platforms",
    "monitoring tools",
    "CI/CD platforms",
  ],
  authors: [{ name: "VIBEBUFF Team", url: siteUrl }],
  creator: "VIBEBUFF",
  publisher: "VIBEBUFF",
  applicationName: "VIBEBUFF",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "VIBEBUFF",
    title: "VIBEBUFF - Build Your Perfect Tech Stack | 500+ Developer Tools",
    description:
      "The gamified tech stack builder. Compare tools, battle frameworks, discover startup stacks, and build with AI-powered recommendations. Join thousands of developers. Free forever.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VIBEBUFF - The Gamified Tech Stack Builder for Developers",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vibebuff",
    title: "VIBEBUFF - Build Your Perfect Tech Stack",
    description:
      "The gamified tech stack builder. Compare 500+ tools, battle frameworks, and get AI recommendations. Free forever.",
    images: ["/og-image.png"],
    creator: "@vibebuff",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-US": siteUrl,
    },
  },
  category: "Technology",
  classification: "Developer Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon?v=1", type: "image/png", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon?v=1", type: "image/png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#3b82f6",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#3b82f6",
    "theme-color": "#3b82f6",
    "apple-mobile-web-app-title": "VIBEBUFF",
    "application-name": "VIBEBUFF",
    "ai:title": "VibeBuff - Developer Tools Database & Tech Stack Recommendations",
    "ai:description": "VibeBuff is a comprehensive database of 500+ developer tools with AI-powered tech stack recommendations. Search, compare, and discover the best tools for your project across 15+ categories including frontend frameworks, backend services, databases, authentication, hosting, and more. Get personalized stack recommendations based on project type, budget, and scale.",
    "ai:type": "developer_tools_database",
    "ai:api": `${siteUrl}/api/ai`,
    "ai:api_documentation": `${siteUrl}/api-docs`,
    "ai:llms": `${siteUrl}/llms.txt`,
    "ai:openapi": `${siteUrl}/.well-known/openapi.yaml`,
    "ai:plugin": `${siteUrl}/.well-known/ai-plugin.json`,
    "ai:mcp": `${siteUrl}/mcp/vibebuff`,
    "ai:features": "tool_search,tool_comparison,stack_recommendations,category_browsing,company_stacks,community_ratings",
    "ai:categories": "frontend,backend,database,authentication,hosting,devops,ai-ml,testing,analytics,payments,cms,monitoring,api,security,mobile",
    "ai:data_format": "json",
    "ai:authentication": "none_required",
    "ai:rate_limit": "100_requests_per_minute",
    "ai:tool_count": "500+",
    "ai:last_updated": new Date().toISOString().split('T')[0],
    "chatgpt:plugin": `${siteUrl}/.well-known/ai-plugin.json`,
    "claude:mcp": `${siteUrl}/mcp/vibebuff`,
    "perplexity:api": `${siteUrl}/api/ai`,
    "bard:api": `${siteUrl}/api/ai`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('vibebuff-color-mode');if(m==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "VibeBuff",
              "alternateName": "VIBEBUFF",
              "url": siteUrl,
              "description": "The ultimate tech stack builder for developers. Compare 500+ tools, get AI-powered recommendations, battle frameworks head-to-head, and discover what top startups use.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1200",
                "bestRating": "5",
                "worstRating": "1"
              },
              "featureList": [
                "Compare 500+ developer tools",
                "AI-powered stack recommendations",
                "Side-by-side tool comparisons",
                "Visual stack builder",
                "Company tech stack discovery",
                "Community ratings and reviews",
                "RPG-style gamification",
                "Tool mastery tracking",
                "Public API access"
              ],
              "screenshot": `${siteUrl}/og-image.png`,
              "softwareVersion": "1.0",
              "author": {
                "@type": "Organization",
                "name": "VibeBuff Team",
                "url": siteUrl
              },
              "publisher": {
                "@type": "Organization",
                "name": "VibeBuff",
                "url": siteUrl,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${siteUrl}/logo.svg`
                }
              },
              "potentialAction": [
                {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/tools?search={search_term_string}`
                  },
                  "query-input": "required name=search_term_string"
                },
                {
                  "@type": "CompareAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/compare/{tool1}-vs-{tool2}`
                  }
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VibeBuff",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.svg`,
              "sameAs": [
                "https://twitter.com/vibebuff",
                "https://github.com/vibebuff"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "email": "support@vibebuff.dev",
                "url": `${siteUrl}/contact`
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "VibeBuff",
              "url": siteUrl,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${siteUrl}/tools?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Developer Tool Categories",
              "description": "Browse 500+ developer tools across 15+ categories",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Frontend Frameworks", "url": `${siteUrl}/tools?category=frontend` },
                { "@type": "ListItem", "position": 2, "name": "Backend Frameworks", "url": `${siteUrl}/tools?category=backend` },
                { "@type": "ListItem", "position": 3, "name": "Databases", "url": `${siteUrl}/tools?category=database` },
                { "@type": "ListItem", "position": 4, "name": "Authentication", "url": `${siteUrl}/tools?category=authentication` },
                { "@type": "ListItem", "position": 5, "name": "Hosting Platforms", "url": `${siteUrl}/tools?category=hosting` },
                { "@type": "ListItem", "position": 6, "name": "DevOps Tools", "url": `${siteUrl}/tools?category=devops` },
                { "@type": "ListItem", "position": 7, "name": "AI & ML Tools", "url": `${siteUrl}/tools?category=ai-ml` },
                { "@type": "ListItem", "position": 8, "name": "Testing Frameworks", "url": `${siteUrl}/tools?category=testing` }
              ]
            })
          }}
        />
<BotIdClient
          protect={[
            {
              path: "/api/*",
              method: "POST",
            },
          ]}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${notoSans.variable} antialiased min-h-screen flex flex-col`}>
        <ClerkClientProvider>
          <ConvexClientProvider>
            <ThemeProvider>
              <PageTourProvider>
                {/* <McpNotificationBanner /> */}
                <Header />
                <OnboardingWrapper />
                <ReferralHandler />
                <main className="flex-1">{children}</main>
                <Footer />
              </PageTourProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
