import { query } from "./_generated/server";
import { v } from "convex/values";

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase().trim();
    const limit = args.limit || 10;

    if (!searchTerm || searchTerm.length < 2) {
      return {
        tools: [],
        comparisons: [],
        companies: [],
        pages: [],
      };
    }

    const [tools, comparisons, companies] = await Promise.all([
      ctx.db
        .query("tools")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect(),
      ctx.db.query("seoComparisons").collect(),
      ctx.db.query("companies").collect(),
    ]);

    const matchedTools = tools
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchTerm) ||
          tool.tagline.toLowerCase().includes(searchTerm) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit)
      .map((tool) => ({
        id: tool._id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        logoUrl: tool.logoUrl,
        type: "tool" as const,
      }));

    const matchedComparisons = comparisons
      .filter(
        (comparison) =>
          comparison.title.toLowerCase().includes(searchTerm) ||
          comparison.tool1Slug.toLowerCase().includes(searchTerm) ||
          comparison.tool2Slug.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit)
      .map((comparison) => ({
        id: comparison._id,
        title: comparison.title,
        slug: comparison.slug,
        tool1Slug: comparison.tool1Slug,
        tool2Slug: comparison.tool2Slug,
        type: "comparison" as const,
      }));

    const matchedCompanies = companies
      .filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm) ||
          (company.description &&
            company.description.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit)
      .map((company) => ({
        id: company._id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        type: "company" as const,
      }));

    const staticPages = [
      { name: "Tools", href: "/tools", description: "Browse all developer tools", keywords: ["tools", "armory", "browse"] },
      { name: "Compare", href: "/compare", description: "Compare tools side by side", keywords: ["compare", "versus", "vs"] },
      { name: "Stack Builder", href: "/stack-builder", description: "Build your tech stack", keywords: ["stack", "builder", "build"] },
      { name: "Forum", href: "/forum", description: "Community discussions", keywords: ["forum", "discuss", "community", "chat"] },
      { name: "Community", href: "/community", description: "Developer community", keywords: ["community", "developers", "users"] },
      { name: "Leaderboards", href: "/leaderboards", description: "Top contributors", keywords: ["leaderboard", "ranking", "top"] },
      { name: "Stack Marketplace", href: "/stack-marketplace", description: "Share and discover stacks", keywords: ["marketplace", "stacks", "share"] },
      { name: "Blog", href: "/blog", description: "Tech articles and guides", keywords: ["blog", "articles", "guides", "posts"] },
      { name: "Documentation", href: "/docs", description: "Help and documentation", keywords: ["docs", "help", "documentation", "guide"] },
      { name: "About", href: "/about", description: "About VIBEBUFF", keywords: ["about", "team", "mission"] },
      { name: "Contact", href: "/contact", description: "Get in touch", keywords: ["contact", "support", "help"] },
      { name: "Get Started", href: "/get-started", description: "Start using VIBEBUFF", keywords: ["start", "begin", "onboarding"] },
      { name: "Companies", href: "/companies", description: "Browse tech companies", keywords: ["companies", "organizations", "teams"] },
      { name: "Groups", href: "/groups", description: "Join developer groups", keywords: ["groups", "teams", "clubs"] },
      { name: "Profile", href: "/profile", description: "Your profile", keywords: ["profile", "account", "settings", "me"] },
      { name: "Notifications", href: "/notifications", description: "Your notifications", keywords: ["notifications", "alerts", "messages"] },
    ];

    const matchedPages = staticPages
      .filter(
        (page) =>
          page.name.toLowerCase().includes(searchTerm) ||
          page.description.toLowerCase().includes(searchTerm) ||
          page.keywords.some((kw) => kw.includes(searchTerm))
      )
      .slice(0, limit)
      .map((page) => ({
        name: page.name,
        href: page.href,
        description: page.description,
        type: "page" as const,
      }));

    return {
      tools: matchedTools,
      comparisons: matchedComparisons,
      companies: matchedCompanies,
      pages: matchedPages,
    };
  },
});
