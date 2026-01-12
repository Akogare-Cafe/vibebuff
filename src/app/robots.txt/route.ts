const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up
Disallow: /profile

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up
Disallow: /profile

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
