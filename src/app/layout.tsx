import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ClerkClientProvider } from "@/components/providers/clerk-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { GlobalChat } from "@/components/global-chat";
import { OnboardingWrapper } from "@/components/onboarding-wrapper";
import { Analytics } from "@vercel/analytics/react";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VIBEBUFF | AI-Powered Tech Stack Recommendations & Developer Tools",
    template: "%s | VIBEBUFF",
  },
  description:
    "Discover the perfect tech stack for your project with AI-powered recommendations. Compare 500+ developer tools, frameworks, and libraries. Find React, Next.js, databases, and more.",
  keywords: [
    "tech stack",
    "developer tools",
    "AI recommendations",
    "React",
    "Next.js",
    "Node.js",
    "database comparison",
    "framework comparison",
    "web development",
    "software development",
    "programming tools",
    "best tech stack",
    "technology stack builder",
    "developer resources",
    "open source tools",
  ],
  authors: [{ name: "VIBEBUFF Team" }],
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
    title: "VIBEBUFF | AI-Powered Tech Stack Recommendations",
    description:
      "Discover the perfect tech stack for your project. Compare 500+ developer tools with AI-powered recommendations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VIBEBUFF - AI-Powered Tech Stack Recommendations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIBEBUFF | AI-Powered Tech Stack Recommendations",
    description:
      "Discover the perfect tech stack for your project. Compare 500+ developer tools with AI-powered recommendations.",
    images: ["/og-image.png"],
    creator: "@vibebuff",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Technology",
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${pixelFont.variable} ${pixelFont.className} antialiased min-h-screen flex flex-col`}>
        <ClerkClientProvider>
          <ConvexClientProvider>
            <ThemeProvider>
              <Header />
              <GlobalChat />
              <OnboardingWrapper />
              <main className="flex-1">{children}</main>
              <Footer />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
