import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ClerkClientProvider } from "@/components/providers/clerk-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OnboardingWrapper } from "@/components/onboarding-wrapper";
import { ReferralHandler } from "@/components/referral-handler";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VIBEBUFF - Find Your Perfect Tech Stack in Seconds",
    template: "%s | VIBEBUFF",
  },
  description:
    "Stop guessing. Start building. VIBEBUFF helps developers discover, compare, and choose the right tools for any project. 500+ tools. AI-powered recommendations. 100% free.",
  keywords: [
    "tech stack builder",
    "best tech stack 2025",
    "developer tools comparison",
    "AI tech stack recommendations",
    "React vs Vue",
    "Next.js vs Remix",
    "best database for startup",
    "PostgreSQL vs MongoDB",
    "Prisma vs Drizzle",
    "Tailwind vs Bootstrap",
    "Vercel vs Netlify",
    "Supabase vs Firebase",
    "web development tools",
    "software development stack",
    "full stack development",
    "frontend frameworks 2025",
    "backend frameworks comparison",
    "SaaS tech stack",
    "startup tech stack",
    "enterprise tech stack",
    "open source developer tools",
    "free developer tools",
    "technology stack builder",
    "framework comparison tool",
    "best programming tools",
    "developer resources 2025",
    "AI coding tools",
    "GitHub Copilot alternatives",
    "DevOps tools comparison",
    "cloud platform comparison",
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
    title: "VIBEBUFF - Find Your Perfect Tech Stack in Seconds",
    description:
      "Stop guessing. Start building. Compare 500+ developer tools, get AI-powered recommendations, and build the perfect stack for your project. Free forever.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VIBEBUFF - AI-Powered Tech Stack Builder for Developers",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vibebuff",
    title: "VIBEBUFF - Find Your Perfect Tech Stack in Seconds",
    description:
      "Stop guessing. Start building. Compare 500+ dev tools and get AI-powered recommendations. Free forever.",
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
    "msapplication-TileColor": "#3b82f6",
    "theme-color": "#3b82f6",
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
      </head>
      <body className={`${spaceGrotesk.variable} ${notoSans.variable} antialiased min-h-screen flex flex-col`}>
        <ClerkClientProvider>
          <ConvexClientProvider>
            <ThemeProvider>
              <Header />
              <OnboardingWrapper />
              <ReferralHandler />
              <main className="flex-1">{children}</main>
              <Footer />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
