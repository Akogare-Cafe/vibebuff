import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/tools(.*)",
  "/compare(.*)",
  "/stack-builder(.*)",
  "/community(.*)",
  "/battles(.*)",
  "/analyze(.*)",
  "/stack-marketplace(.*)",
  "/forum(.*)",
  "/deck(.*)",
  "/profile(.*)",
  "/activity(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/blog(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/forgot-password(.*)",
  "/leaderboards(.*)",
  "/groups(.*)",
  "/companies(.*)",
  "/users(.*)",
  "/timeline(.*)",
  "/status(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/blocked",
]);

const BLACKLISTED_COUNTRIES = process.env.BLACKLISTED_COUNTRIES?.split(",").map(c => c.trim()) || [];

const BLOCKED_PATHS = [
  /\/wp-admin/i,
  /\/wp-login\.php/i,
  /\/xmlrpc\.php/i,
  /\/wordpress\//i,
  /\/wp-content\//i,
  /\/wp-includes\//i,
  /\/wp-json\//i,
  /\.php$/i,
  /\/admin\.php/i,
  /\/config\.php/i,
  /\/setup\.php/i,
  /\/install\.php/i,
  /\/phpMyAdmin/i,
  /\/phpmyadmin/i,
  /\/pma\//i,
  /\/adminer/i,
  /\/administrator\//i,
  /\/shell\.php/i,
  /\/c99\.php/i,
  /\/upload\.php/i,
  /\/fileupload\.php/i,
  /\/\.env/i,
  /\/\.git\//i,
  /\/\.aws\//i,
  /\/\.ssh\//i,
  /\/backup/i,
  /\/db\//i,
  /\/database\//i,
  /\/sql/i,
  /\/mysql/i,
  /\/cgi-bin\//i,
  /\/vendor\//i,
  /\/composer\.json/i,
  /\/package\.json/i,
  /\/\.htaccess/i,
  /\/web\.config/i,
];

function isCountryBlocked(request: NextRequest): boolean {
  if (BLACKLISTED_COUNTRIES.length === 0) {
    return false;
  }

  const country = request.headers.get("x-vercel-ip-country");
  
  if (!country) {
    return false;
  }

  return BLACKLISTED_COUNTRIES.includes(country);
}

function isSuspiciousBot(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  
  return BLOCKED_PATHS.some(pattern => pattern.test(pathname));
}

export default clerkMiddleware(async (auth, request) => {
  if (isSuspiciousBot(request)) {
    return new NextResponse(null, { status: 404 });
  }

  if (request.nextUrl.pathname !== "/blocked" && isCountryBlocked(request)) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://va.vercel-scripts.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://clerk.com https://*.clerk.accounts.dev https://api.vercel.com https://va.vercel-scripts.com; " +
    "worker-src 'self' blob:; " +
    "frame-src 'self' https://challenges.cloudflare.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none';"
  );
  
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
