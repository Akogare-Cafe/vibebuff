import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibebuff.dev";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/sign-in", "/sign-up", "/profile"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/sign-in", "/sign-up", "/profile"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
