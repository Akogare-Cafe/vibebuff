import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const STACK_TEMPLATES: Record<
  string,
  {
    name: string;
    description: string;
    tools: Record<string, string[]>;
    budget: string;
  }
> = {
  saas: {
    name: "SaaS Application",
    description: "Full-stack SaaS with auth, database, and deployment",
    tools: {
      framework: ["nextjs", "remix"],
      database: ["supabase", "planetscale", "neon"],
      auth: ["clerk", "auth0"],
      hosting: ["vercel", "railway"],
      styling: ["tailwindcss", "shadcn-ui"],
    },
    budget: "low-medium",
  },
  "indie-hacker": {
    name: "Indie Hacker MVP",
    description: "Fast, cheap stack for solo developers",
    tools: {
      framework: ["nextjs", "sveltekit"],
      database: ["supabase", "turso"],
      auth: ["clerk", "supabase"],
      hosting: ["vercel", "cloudflare-pages"],
      styling: ["tailwindcss"],
    },
    budget: "free-low",
  },
  enterprise: {
    name: "Enterprise Application",
    description: "Scalable, secure stack for large teams",
    tools: {
      framework: ["nextjs", "react"],
      database: ["postgresql", "mongodb"],
      auth: ["auth0", "okta"],
      hosting: ["aws", "gcp"],
      styling: ["tailwindcss", "chakra-ui"],
    },
    budget: "high",
  },
  api: {
    name: "API Backend",
    description: "High-performance API service",
    tools: {
      framework: ["hono", "fastify", "express"],
      database: ["postgresql", "redis"],
      hosting: ["railway", "fly-io", "render"],
      orm: ["prisma", "drizzle"],
    },
    budget: "low-medium",
  },
  "side-project": {
    name: "Side Project",
    description: "Minimal cost, quick to build",
    tools: {
      framework: ["sveltekit", "astro"],
      database: ["turso", "sqlite"],
      hosting: ["cloudflare-pages", "vercel"],
      styling: ["tailwindcss", "pico-css"],
    },
    budget: "free",
  },
  ecommerce: {
    name: "E-commerce Store",
    description: "Online store with payments",
    tools: {
      framework: ["nextjs", "remix"],
      database: ["supabase", "planetscale"],
      payments: ["stripe"],
      hosting: ["vercel", "shopify"],
      styling: ["tailwindcss"],
    },
    budget: "medium",
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "saas";
    const budget = searchParams.get("budget");
    const scale = searchParams.get("scale");

    const template = STACK_TEMPLATES[type] || STACK_TEMPLATES["saas"];

    const allTools = await convex.query(api.tools.list, {});
    const categories = await convex.query(api.categories.list, {});

    const categoryMap = new Map(
      categories.map((c: { _id: string; name: string }) => [c._id, c.name])
    );

    const recommendedStack: Record<
      string,
      {
        primary: {
          name: string;
          slug: string;
          tagline: string;
          pricing: string;
        } | null;
        alternatives: { name: string; slug: string }[];
      }
    > = {};

    for (const [layer, toolSlugs] of Object.entries(template.tools)) {
      const matchedTools = toolSlugs
        .map((slug) => allTools.find((t: { slug: string }) => t.slug === slug))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

      if (matchedTools.length > 0) {
        const primary = matchedTools[0];
        recommendedStack[layer] = {
          primary: {
            name: primary.name,
            slug: primary.slug,
            tagline: primary.tagline,
            pricing: primary.pricingModel,
          },
          alternatives: matchedTools.slice(1, 3).map((t) => ({
            name: t.name,
            slug: t.slug,
          })),
        };
      }
    }

    const stackSummary = Object.entries(recommendedStack)
      .filter(([, v]) => v.primary)
      .map(([layer, v]) => `${layer}: ${v.primary!.name}`)
      .join(", ");

    return NextResponse.json({
      type,
      template: {
        name: template.name,
        description: template.description,
        budget: template.budget,
      },
      stack: recommendedStack,
      summary: stackSummary,
      filters: {
        budget: budget || "any",
        scale: scale || "any",
      },
      availableTypes: Object.keys(STACK_TEMPLATES),
      questUrl: "https://vibebuff.dev/quest",
      _meta: {
        source: "VibeBuff",
        description:
          "AI-powered stack recommendation. Use /quest for personalized recommendations.",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI recommend API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
