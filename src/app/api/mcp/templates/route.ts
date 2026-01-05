import { NextRequest, NextResponse } from "next/server";

const STACK_TEMPLATES: Record<string, {
  name: string;
  description: string;
  tools: Record<string, { name: string; slug: string; reason: string }>;
  estimatedCost: Record<string, string>;
}> = {
  saas: {
    name: "SaaS Application Stack",
    description: "Full-stack template for building SaaS applications with auth, payments, and real-time features",
    tools: {
      frontend: { name: "Next.js", slug: "nextjs", reason: "Best React framework for production apps" },
      backend: { name: "Convex", slug: "convex", reason: "Real-time database with serverless functions" },
      auth: { name: "Clerk", slug: "clerk", reason: "Complete auth solution with great DX" },
      payments: { name: "Stripe", slug: "stripe", reason: "Industry standard for payments" },
      hosting: { name: "Vercel", slug: "vercel", reason: "Optimized for Next.js deployment" },
      styling: { name: "Tailwind CSS", slug: "tailwindcss", reason: "Utility-first CSS framework" },
      analytics: { name: "PostHog", slug: "posthog", reason: "Product analytics with session replay" },
    },
    estimatedCost: {
      free: "$0/month (limited)",
      low: "$50-100/month",
      medium: "$100-300/month",
      high: "$300-1000/month",
    },
  },
  ecommerce: {
    name: "E-Commerce Stack",
    description: "Complete stack for building online stores with inventory, payments, and shipping",
    tools: {
      frontend: { name: "Next.js", slug: "nextjs", reason: "SEO-friendly with great performance" },
      backend: { name: "Medusa", slug: "medusa", reason: "Open-source headless commerce" },
      database: { name: "PostgreSQL", slug: "postgresql", reason: "Reliable relational database" },
      payments: { name: "Stripe", slug: "stripe", reason: "Comprehensive payment processing" },
      hosting: { name: "Vercel", slug: "vercel", reason: "Edge functions for fast checkout" },
      search: { name: "Algolia", slug: "algolia", reason: "Fast product search" },
      cdn: { name: "Cloudflare", slug: "cloudflare", reason: "Global CDN for images" },
    },
    estimatedCost: {
      free: "$0/month (very limited)",
      low: "$100-200/month",
      medium: "$200-500/month",
      high: "$500-2000/month",
    },
  },
  blog: {
    name: "Blog/Content Stack",
    description: "Stack for content-heavy sites with CMS, SEO optimization, and fast loading",
    tools: {
      frontend: { name: "Astro", slug: "astro", reason: "Best for content sites, ships zero JS" },
      cms: { name: "Sanity", slug: "sanity", reason: "Flexible headless CMS" },
      hosting: { name: "Vercel", slug: "vercel", reason: "Edge caching for fast delivery" },
      styling: { name: "Tailwind CSS", slug: "tailwindcss", reason: "Rapid styling" },
      analytics: { name: "Plausible", slug: "plausible", reason: "Privacy-friendly analytics" },
      images: { name: "Cloudinary", slug: "cloudinary", reason: "Image optimization" },
    },
    estimatedCost: {
      free: "$0/month",
      low: "$20-50/month",
      medium: "$50-150/month",
      high: "$150-500/month",
    },
  },
  portfolio: {
    name: "Portfolio Stack",
    description: "Minimal stack for personal portfolios and landing pages",
    tools: {
      frontend: { name: "Astro", slug: "astro", reason: "Fast static sites" },
      styling: { name: "Tailwind CSS", slug: "tailwindcss", reason: "Quick styling" },
      hosting: { name: "Vercel", slug: "vercel", reason: "Free tier perfect for portfolios" },
      forms: { name: "Formspree", slug: "formspree", reason: "Simple contact forms" },
      analytics: { name: "Plausible", slug: "plausible", reason: "Lightweight analytics" },
    },
    estimatedCost: {
      free: "$0/month",
      low: "$10-20/month",
      medium: "$20-50/month",
      high: "$50-100/month",
    },
  },
  api: {
    name: "API/Backend Stack",
    description: "Stack for building REST or GraphQL APIs",
    tools: {
      runtime: { name: "Node.js", slug: "nodejs", reason: "JavaScript runtime" },
      framework: { name: "Hono", slug: "hono", reason: "Fast, lightweight web framework" },
      database: { name: "PostgreSQL", slug: "postgresql", reason: "Reliable SQL database" },
      orm: { name: "Drizzle", slug: "drizzle", reason: "Type-safe ORM" },
      hosting: { name: "Railway", slug: "railway", reason: "Easy deployment" },
      cache: { name: "Upstash", slug: "upstash", reason: "Serverless Redis" },
      docs: { name: "Swagger", slug: "swagger", reason: "API documentation" },
    },
    estimatedCost: {
      free: "$0/month (limited)",
      low: "$20-50/month",
      medium: "$50-200/month",
      high: "$200-500/month",
    },
  },
  mobile: {
    name: "Mobile App Stack",
    description: "Cross-platform mobile development stack",
    tools: {
      framework: { name: "React Native", slug: "react-native", reason: "Cross-platform with React" },
      navigation: { name: "Expo Router", slug: "expo", reason: "File-based routing" },
      backend: { name: "Supabase", slug: "supabase", reason: "Backend-as-a-service" },
      auth: { name: "Clerk", slug: "clerk", reason: "Mobile-ready auth" },
      state: { name: "Zustand", slug: "zustand", reason: "Lightweight state management" },
      push: { name: "OneSignal", slug: "onesignal", reason: "Push notifications" },
    },
    estimatedCost: {
      free: "$0/month (limited)",
      low: "$50-100/month",
      medium: "$100-300/month",
      high: "$300-1000/month",
    },
  },
  "ai-app": {
    name: "AI Application Stack",
    description: "Stack for building AI-powered applications",
    tools: {
      frontend: { name: "Next.js", slug: "nextjs", reason: "Full-stack React framework" },
      ai: { name: "Vercel AI SDK", slug: "vercel-ai", reason: "Streaming AI responses" },
      llm: { name: "OpenAI", slug: "openai", reason: "GPT models" },
      vectordb: { name: "Pinecone", slug: "pinecone", reason: "Vector database for RAG" },
      backend: { name: "Convex", slug: "convex", reason: "Real-time data sync" },
      hosting: { name: "Vercel", slug: "vercel", reason: "Edge functions for AI" },
    },
    estimatedCost: {
      free: "$0/month (very limited)",
      low: "$50-150/month",
      medium: "$150-500/month",
      high: "$500-2000/month",
    },
  },
  realtime: {
    name: "Real-time Application Stack",
    description: "Stack for building real-time collaborative applications",
    tools: {
      frontend: { name: "Next.js", slug: "nextjs", reason: "React framework" },
      realtime: { name: "Convex", slug: "convex", reason: "Built-in real-time sync" },
      presence: { name: "Liveblocks", slug: "liveblocks", reason: "Presence and collaboration" },
      auth: { name: "Clerk", slug: "clerk", reason: "User authentication" },
      hosting: { name: "Vercel", slug: "vercel", reason: "WebSocket support" },
      styling: { name: "Tailwind CSS", slug: "tailwindcss", reason: "Rapid UI development" },
    },
    estimatedCost: {
      free: "$0/month (limited)",
      low: "$50-100/month",
      medium: "$100-300/month",
      high: "$300-1000/month",
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateType, budget = "medium" } = body;

    if (!templateType || !STACK_TEMPLATES[templateType]) {
      return NextResponse.json({
        availableTemplates: Object.keys(STACK_TEMPLATES).map((key) => ({
          type: key,
          name: STACK_TEMPLATES[key].name,
          description: STACK_TEMPLATES[key].description,
        })),
        error: templateType ? `Template "${templateType}" not found` : "Please specify a templateType",
      });
    }

    const template = STACK_TEMPLATES[templateType];

    return NextResponse.json({
      type: templateType,
      name: template.name,
      description: template.description,
      tools: template.tools,
      estimatedCost: template.estimatedCost[budget] || template.estimatedCost.medium,
      budgetTier: budget,
      allCostTiers: template.estimatedCost,
    });
  } catch (error) {
    console.error("MCP templates error:", error);
    return NextResponse.json(
      { error: "Failed to get template" },
      { status: 500 }
    );
  }
}
