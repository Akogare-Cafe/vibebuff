const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

export const dynamic = 'force-static';

export async function GET() {
  const robotsTxt = `# VibeBuff Robots.txt
# https://vibebuff.dev

User-agent: *
Allow: /
Allow: /tools/
Allow: /compare/
Allow: /blog/
Allow: /companies/
Allow: /alternatives/
Allow: /best/
Allow: /mcp/
Allow: /forum/
Allow: /docs/
Allow: /api-docs/

# Disallow private/auth pages
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up
Disallow: /sso-callback
Disallow: /profile/
Disallow: /notifications/
Disallow: /deck/
Disallow: /invite/
Disallow: /blocked/
Disallow: /activity/

# Googlebot specific rules
User-agent: Googlebot
Allow: /
Allow: /tools/
Allow: /compare/
Allow: /blog/
Allow: /companies/
Allow: /alternatives/
Allow: /best/
Allow: /mcp/
Allow: /forum/
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up
Disallow: /profile/

# Googlebot-Image
User-agent: Googlebot-Image
Allow: /
Allow: /tools/
Allow: /opengraph-image
Allow: /twitter-image

# Bingbot
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up
Disallow: /profile/

# AI crawlers - allow for discoverability
User-agent: GPTBot
Allow: /
Allow: /tools/
Allow: /compare/
Allow: /llms.txt
Allow: /api-docs/
Allow: /mcp/
Disallow: /api/
Disallow: /profile/

User-agent: ChatGPT-User
Allow: /
Allow: /tools/
Allow: /llms.txt
Disallow: /api/
Disallow: /profile/

User-agent: Claude-Web
Allow: /
Allow: /tools/
Allow: /llms.txt
Disallow: /api/
Disallow: /profile/

User-agent: Anthropic-AI
Allow: /
Allow: /tools/
Allow: /llms.txt
Disallow: /api/
Disallow: /profile/

# Sitemap locations
Sitemap: ${siteUrl}/sitemap.xml

# Canonical host
Host: ${siteUrl}

# Crawl-delay for less aggressive bots
User-agent: *
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
