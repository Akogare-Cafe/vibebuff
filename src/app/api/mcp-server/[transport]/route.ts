import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const VIBEBUFF_API_URL =
  process.env.VIBEBUFF_API_URL || "https://vibebuff.dev/api";
const VIBEBUFF_API_KEY = process.env.VIBEBUFF_API_KEY || "";

async function callVibebuffAPI(
  endpoint: string,
  data: Record<string, unknown>
): Promise<unknown> {
  const url = `${VIBEBUFF_API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(VIBEBUFF_API_KEY && { Authorization: `Bearer ${VIBEBUFF_API_KEY}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch")) {
      return getMockData(endpoint, data);
    }
    throw error;
  }
}

function getMockData(
  endpoint: string,
  data: Record<string, unknown>
): unknown {
  if (endpoint.includes("/recommend")) {
    return {
      stack: {
        frontend: {
          name: "Next.js",
          slug: "nextjs",
          reasoning: "Best for React apps with SSR",
        },
        backend: {
          name: "Convex",
          slug: "convex",
          reasoning: "Real-time database with serverless functions",
        },
        database: {
          name: "Convex",
          slug: "convex",
          reasoning: "Built-in with Convex",
        },
        auth: {
          name: "Clerk",
          slug: "clerk",
          reasoning: "Best DX for authentication",
        },
        hosting: {
          name: "Vercel",
          slug: "vercel",
          reasoning: "Optimized for Next.js",
        },
        styling: {
          name: "Tailwind CSS",
          slug: "tailwindcss",
          reasoning: "Utility-first CSS framework",
        },
      },
      estimatedMonthlyCost: "$0-50 for hobby, $50-200 for startup",
      aiReasoning: `Based on your project description: "${data.projectDescription || "web app"}", I recommend a modern full-stack approach optimized for developer experience and scalability.`,
    };
  }

  if (endpoint.includes("/search")) {
    return {
      tools: [
        {
          name: "Next.js",
          slug: "nextjs",
          category: "Frontend Framework",
          tagline: "The React Framework for the Web",
        },
        {
          name: "Remix",
          slug: "remix",
          category: "Frontend Framework",
          tagline: "Full stack web framework",
        },
        {
          name: "Nuxt",
          slug: "nuxt",
          category: "Frontend Framework",
          tagline: "The Intuitive Vue Framework",
        },
      ],
      total: 3,
    };
  }

  if (endpoint.includes("/tools/")) {
    const slug = endpoint.split("/").pop();
    return {
      name: slug === "nextjs" ? "Next.js" : slug,
      slug,
      tagline: "The React Framework for the Web",
      description:
        "Next.js is a React framework that enables server-side rendering and static site generation.",
      category: "Frontend Framework",
      pricing: "Free / Open Source",
      pros: [
        "Great DX",
        "Excellent performance",
        "Large ecosystem",
        "Vercel integration",
      ],
      cons: ["Learning curve", "Can be complex for simple apps"],
      features: [
        "SSR",
        "SSG",
        "API Routes",
        "Image Optimization",
        "Middleware",
      ],
      alternatives: ["Remix", "Nuxt", "SvelteKit"],
      website: "https://nextjs.org",
      github: "https://github.com/vercel/next.js",
    };
  }

  if (endpoint.includes("/compare")) {
    return {
      tools:
        (data.tools as string[])?.map((slug) => ({
          name: slug,
          slug,
          scores: { performance: 9, dx: 9, ecosystem: 10, learning: 7 },
        })) || [],
      recommendation:
        "Next.js is recommended for most React projects due to its mature ecosystem.",
    };
  }

  if (endpoint.includes("/templates")) {
    return {
      name: `${data.templateType || "SaaS"} Stack Template`,
      tools: {
        frontend: "Next.js",
        backend: "Convex",
        auth: "Clerk",
        payments: "Stripe",
        hosting: "Vercel",
        analytics: "PostHog",
      },
      estimatedCost: data.budget === "free" ? "$0/month" : "$50-200/month",
    };
  }

  if (endpoint.includes("/categories")) {
    return {
      categories: [
        { name: "Frontend Framework", slug: "frontend", toolCount: 25 },
        { name: "Backend/BaaS", slug: "backend", toolCount: 30 },
        { name: "Database", slug: "database", toolCount: 20 },
        { name: "Authentication", slug: "auth", toolCount: 15 },
        { name: "Hosting/Deployment", slug: "hosting", toolCount: 18 },
        { name: "Styling/CSS", slug: "styling", toolCount: 12 },
        { name: "State Management", slug: "state", toolCount: 10 },
        { name: "Testing", slug: "testing", toolCount: 15 },
        { name: "Monitoring", slug: "monitoring", toolCount: 12 },
        { name: "Payments", slug: "payments", toolCount: 8 },
      ],
    };
  }

  return { message: "Mock data - connect to VibeBuff API for real data" };
}

function formatStackRecommendation(data: unknown): string {
  const result = data as {
    stack: Record<string, { name: string; reasoning: string }>;
    estimatedMonthlyCost: string;
    aiReasoning: string;
  };

  let output = "# VibeBuff Stack Recommendation\n\n";
  output += `${result.aiReasoning}\n\n`;
  output += "## Recommended Stack\n\n";

  for (const [category, tool] of Object.entries(result.stack)) {
    output += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    output += `- **${tool.name}**\n`;
    output += `  - ${tool.reasoning}\n\n`;
  }

  output += `## Estimated Cost\n${result.estimatedMonthlyCost}\n`;

  return output;
}

function formatToolSearch(data: unknown): string {
  const result = data as {
    tools: Array<{
      name: string;
      slug: string;
      category: string;
      tagline: string;
    }>;
    total: number;
  };

  let output = `# Search Results (${result.total} tools found)\n\n`;

  for (const tool of result.tools) {
    output += `## ${tool.name}\n`;
    output += `- **Category:** ${tool.category}\n`;
    output += `- **Slug:** ${tool.slug}\n`;
    output += `- ${tool.tagline}\n\n`;
  }

  return output;
}

function formatToolDetails(data: unknown): string {
  const tool = data as {
    name: string;
    tagline: string;
    description: string;
    category: string;
    pricing: string;
    pros: string[];
    cons: string[];
    features: string[];
    alternatives: string[];
    website: string;
  };

  let output = `# ${tool.name}\n\n`;
  output += `*${tool.tagline}*\n\n`;
  output += `**Category:** ${tool.category}\n`;
  output += `**Pricing:** ${tool.pricing}\n`;
  output += `**Website:** ${tool.website}\n\n`;
  output += `## Description\n${tool.description}\n\n`;
  output += `## Features\n${tool.features.map((f) => `- ${f}`).join("\n")}\n\n`;
  output += `## Pros\n${tool.pros.map((p) => `- ${p}`).join("\n")}\n\n`;
  output += `## Cons\n${tool.cons.map((c) => `- ${c}`).join("\n")}\n\n`;
  output += `## Alternatives\n${tool.alternatives.map((a) => `- ${a}`).join("\n")}\n`;

  return output;
}

function formatToolComparison(data: unknown): string {
  const result = data as {
    tools: Array<{ name: string; scores: Record<string, number> }>;
    recommendation: string;
  };

  let output = "# Tool Comparison\n\n";
  output += "| Tool | Performance | DX | Ecosystem | Learning Curve |\n";
  output += "|------|-------------|----|-----------|-----------------|\n";

  for (const tool of result.tools) {
    output += `| ${tool.name} | ${tool.scores.performance}/10 | ${tool.scores.dx}/10 | ${tool.scores.ecosystem}/10 | ${tool.scores.learning}/10 |\n`;
  }

  output += `\n## Recommendation\n${result.recommendation}\n`;

  return output;
}

function formatStackTemplate(data: unknown): string {
  const template = data as {
    name: string;
    tools: Record<string, string>;
    estimatedCost: string;
  };

  let output = `# ${template.name}\n\n`;
  output += "## Stack Components\n\n";

  for (const [category, tool] of Object.entries(template.tools)) {
    output += `- **${category.charAt(0).toUpperCase() + category.slice(1)}:** ${tool}\n`;
  }

  output += `\n## Estimated Monthly Cost\n${template.estimatedCost}\n`;

  return output;
}

function formatCategories(data: unknown): string {
  const result = data as {
    categories: Array<{ name: string; slug: string; toolCount: number }>;
  };

  let output = "# Tool Categories\n\n";
  output += "| Category | Slug | Tools |\n";
  output += "|----------|------|-------|\n";

  for (const cat of result.categories) {
    output += `| ${cat.name} | ${cat.slug} | ${cat.toolCount} |\n`;
  }

  return output;
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "recommend_stack",
      {
        title: "Recommend Stack",
        description:
          "Get AI-powered tech stack recommendations based on your project requirements. Analyzes your needs and suggests the best combination of tools for frontend, backend, database, auth, hosting, and more.",
        inputSchema: z.object({
          projectDescription: z
            .string()
            .describe("Description of the project you want to build"),
          budget: z
            .enum(["free", "low", "medium", "high", "enterprise"])
            .optional()
            .describe("Budget tier for the stack"),
          scale: z
            .enum(["hobby", "startup", "growth", "enterprise"])
            .optional()
            .describe("Expected scale of the project"),
          teamSize: z
            .number()
            .optional()
            .describe("Number of developers on the team"),
        }),
      },
      async (args: {
        projectDescription: string;
        budget?: string;
        scale?: string;
        teamSize?: number;
      }) => {
        const result = await callVibebuffAPI("/mcp/recommend", args);
        return {
          content: [{ type: "text" as const, text: formatStackRecommendation(result) }],
        };
      }
    );

    server.registerTool(
      "search_tools",
      {
        title: "Search Tools",
        description:
          "Search the VibeBuff database of 500+ developer tools. Find tools by name, category, or use case.",
        inputSchema: z.object({
          query: z.string().describe("Search query for finding tools"),
          category: z
            .string()
            .optional()
            .describe(
              "Filter by category (e.g., 'frontend', 'database', 'auth')"
            ),
          limit: z
            .number()
            .optional()
            .describe("Maximum number of results to return"),
        }),
      },
      async (args: { query: string; category?: string; limit?: number }) => {
        const result = await callVibebuffAPI("/mcp/search", args);
        return {
          content: [{ type: "text" as const, text: formatToolSearch(result) }],
        };
      }
    );

    server.registerTool(
      "get_tool_details",
      {
        title: "Get Tool Details",
        description:
          "Get detailed information about a specific developer tool including features, pricing, pros/cons, and alternatives.",
        inputSchema: z.object({
          toolSlug: z
            .string()
            .describe(
              "The slug/identifier of the tool (e.g., 'nextjs', 'supabase')"
            ),
        }),
      },
      async (args: { toolSlug: string }) => {
        const result = await callVibebuffAPI(`/mcp/tools/${args.toolSlug}`, {});
        return {
          content: [{ type: "text" as const, text: formatToolDetails(result) }],
        };
      }
    );

    server.registerTool(
      "compare_tools",
      {
        title: "Compare Tools",
        description:
          "Compare 2-4 developer tools side by side. Get detailed comparison of features, pricing, performance, and use cases.",
        inputSchema: z.object({
          tools: z
            .array(z.string())
            .min(2)
            .max(4)
            .describe("Array of tool slugs to compare (2-4 tools)"),
        }),
      },
      async (args: { tools: string[] }) => {
        const result = await callVibebuffAPI("/mcp/compare", {
          tools: args.tools,
        });
        return {
          content: [{ type: "text" as const, text: formatToolComparison(result) }],
        };
      }
    );

    server.registerTool(
      "get_stack_template",
      {
        title: "Get Stack Template",
        description:
          "Get a pre-built stack template for common project types like SaaS, e-commerce, blog, etc.",
        inputSchema: z.object({
          templateType: z
            .enum([
              "saas",
              "ecommerce",
              "blog",
              "portfolio",
              "api",
              "mobile",
              "ai-app",
              "realtime",
            ])
            .describe("Type of stack template to retrieve"),
          budget: z
            .enum(["free", "low", "medium", "high"])
            .optional()
            .describe("Budget constraint"),
        }),
      },
      async (args: { templateType: string; budget?: string }) => {
        const result = await callVibebuffAPI("/mcp/templates", args);
        return {
          content: [{ type: "text" as const, text: formatStackTemplate(result) }],
        };
      }
    );

    server.registerTool(
      "get_categories",
      {
        title: "Get Categories",
        description:
          "List all tool categories available in VibeBuff (frontend, backend, database, auth, etc.)",
        inputSchema: z.object({
          includeTools: z
            .boolean()
            .optional()
            .describe("Include tool count per category"),
        }),
      },
      async (args: { includeTools?: boolean }) => {
        const result = await callVibebuffAPI("/mcp/categories", args || {});
        return {
          content: [{ type: "text" as const, text: formatCategories(result) }],
        };
      }
    );
  },
  {
    serverInfo: {
      name: "vibebuff-mcp",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api/mcp-server",
    maxDuration: 60,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
