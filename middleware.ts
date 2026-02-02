import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const isPublicRoute = createRouteMatcher([
  "/",
  "/tools(.*)",
  "/compare(.*)",
  "/blog(.*)",
  "/companies(.*)",
  "/alternatives(.*)",
  "/best(.*)",
  "/mcp(.*)",
  "/forum(.*)",
  "/docs(.*)",
  "/api-docs(.*)",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/get-started",
  "/leaderboards(.*)",
  "/stack-marketplace",
  "/community",
  "/groups(.*)",
  "/guides(.*)",
  "/llms(.*)",
  "/advertise",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon(.*)",
  "/apple-icon(.*)",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
]);

const isSEORoute = createRouteMatcher([
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/.well-known/(.*)",
]);

const isSearchBot = (userAgent: string | null): boolean => {
  if (!userAgent) return false;
  const botPatterns = [
    /googlebot/i,
    /bingbot/i,
    /yandexbot/i,
    /duckduckbot/i,
    /slurp/i,
    /baiduspider/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
    /applebot/i,
    /gptbot/i,
    /chatgpt/i,
    /claude/i,
    /anthropic/i,
    /perplexity/i,
  ];
  return botPatterns.some((pattern) => pattern.test(userAgent));
};

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const userAgent = request.headers.get("user-agent");
  
  // Allow search bots to access SEO routes without any challenges
  if (isSEORoute(request) && isSearchBot(userAgent)) {
    const response = NextResponse.next();
    // Add headers to help with caching and bot identification
    response.headers.set("X-Robots-Tag", "all");
    return response;
  }

  // For public routes, allow access
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // For protected routes, require authentication
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
