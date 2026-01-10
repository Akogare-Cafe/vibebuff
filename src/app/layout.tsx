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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibebuff.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VIBEBUFF - Build Your Perfect Tech Stack | Compare 500+ Developer Tools",
    template: "%s | VIBEBUFF",
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
  ],
  authors: [{ name: "VIBEBUFF Team", url: siteUrl }],
  creator: "VIBEBUFF",
  publisher: "VIBEBUFF",
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
  // verification: {
  //   google: "ADD_YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  // },
  other: {
    "msapplication-TileColor": "#7f13ec",
    "theme-color": "#7f13ec",
    "apple-mobile-web-app-title": "VIBEBUFF",
    "application-name": "VIBEBUFF",
    "ai:description": "VibeBuff is an AI-powered tech stack recommendation platform with 500+ developer tools. Get stack recommendations, compare tools, and discover what top startups use.",
    "ai:api": "https://vibebuff.dev/api/ai",
    "ai:llms": "https://vibebuff.dev/llms.txt",
    "ai:openapi": "https://vibebuff.dev/.well-known/openapi.yaml",
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
                <McpNotificationBanner />
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
