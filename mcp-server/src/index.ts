#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const VIBEBUFF_API_URL = process.env.VIBEBUFF_API_URL || "https://vibebuff.com/api";
const VIBEBUFF_API_KEY = process.env.VIBEBUFF_API_KEY || "";

const server = new Server(
  {
    name: "vibebuff-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

const recommendStackSchema = z.object({
  projectDescription: z.string().describe("Description of the project you want to build"),
  budget: z.enum(["free", "low", "medium", "high", "enterprise"]).optional().describe("Budget tier for the stack"),
  scale: z.enum(["hobby", "startup", "growth", "enterprise"]).optional().describe("Expected scale of the project"),
  teamSize: z.number().optional().describe("Number of developers on the team"),
});

const searchToolsSchema = z.object({
  query: z.string().describe("Search query for finding tools"),
  category: z.string().optional().describe("Filter by category (e.g., 'frontend', 'database', 'auth')"),
  limit: z.number().optional().describe("Maximum number of results to return"),
});

const getToolDetailsSchema = z.object({
  toolSlug: z.string().describe("The slug/identifier of the tool (e.g., 'nextjs', 'supabase')"),
});

const compareToolsSchema = z.object({
  tools: z.array(z.string()).min(2).max(4).describe("Array of tool slugs to compare (2-4 tools)"),
});

const getStackTemplateSchema = z.object({
  templateType: z.enum([
    "saas",
    "ecommerce",
    "blog",
    "portfolio",
    "api",
    "mobile",
    "ai-app",
    "realtime",
  ]).describe("Type of stack template to retrieve"),
  budget: z.enum(["free", "low", "medium", "high"]).optional().describe("Budget constraint"),
});

const getCategoriesSchema = z.object({
  includeTools: z.boolean().optional().describe("Include tool count per category"),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "recommend_stack",
        description: "Get AI-powered tech stack recommendations based on your project requirements. Analyzes your needs and suggests the best combination of tools for frontend, backend, database, auth, hosting, and more.",
        inputSchema: {
          type: "object",
          properties: {
            projectDescription: {
              type: "string",
              description: "Description of the project you want to build",
            },
            budget: {
              type: "string",
              enum: ["free", "low", "medium", "high", "enterprise"],
              description: "Budget tier for the stack",
            },
            scale: {
              type: "string",
              enum: ["hobby", "startup", "growth", "enterprise"],
              description: "Expected scale of the project",
            },
            teamSize: {
              type: "number",
              description: "Number of developers on the team",
            },
          },
          required: ["projectDescription"],
        },
      },
      {
        name: "search_tools",
        description: "Search the VibeBuff database of 500+ developer tools. Find tools by name, category, or use case.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for finding tools",
            },
            category: {
              type: "string",
              description: "Filter by category (e.g., 'frontend', 'database', 'auth')",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_tool_details",
        description: "Get detailed information about a specific developer tool including features, pricing, pros/cons, and alternatives.",
        inputSchema: {
          type: "object",
          properties: {
            toolSlug: {
              type: "string",
              description: "The slug/identifier of the tool (e.g., 'nextjs', 'supabase')",
            },
          },
          required: ["toolSlug"],
        },
      },
      {
        name: "compare_tools",
        description: "Compare 2-4 developer tools side by side. Get detailed comparison of features, pricing, performance, and use cases.",
        inputSchema: {
          type: "object",
          properties: {
            tools: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 4,
              description: "Array of tool slugs to compare (2-4 tools)",
            },
          },
          required: ["tools"],
        },
      },
      {
        name: "get_stack_template",
        description: "Get a pre-built stack template for common project types like SaaS, e-commerce, blog, etc.",
        inputSchema: {
          type: "object",
          properties: {
            templateType: {
              type: "string",
              enum: ["saas", "ecommerce", "blog", "portfolio", "api", "mobile", "ai-app", "realtime"],
              description: "Type of stack template to retrieve",
            },
            budget: {
              type: "string",
              enum: ["free", "low", "medium", "high"],
              description: "Budget constraint",
            },
          },
          required: ["templateType"],
        },
      },
      {
        name: "get_categories",
        description: "List all tool categories available in VibeBuff (frontend, backend, database, auth, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            includeTools: {
              type: "boolean",
              description: "Include tool count per category",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "recommend_stack": {
        const parsed = recommendStackSchema.parse(args);
        const result = await callVibebuffAPI("/mcp/recommend", parsed);
        return {
          content: [
            {
              type: "text",
              text: formatStackRecommendation(result),
            },
          ],
        };
      }

      case "search_tools": {
        const parsed = searchToolsSchema.parse(args);
        const result = await callVibebuffAPI("/mcp/search", parsed);
        return {
          content: [
            {
              type: "text",
              text: formatToolSearch(result),
            },
          ],
        };
      }

      case "get_tool_details": {
        const parsed = getToolDetailsSchema.parse(args);
        const result = await callVibebuffAPI(`/mcp/tools/${parsed.toolSlug}`, {});
        return {
          content: [
            {
              type: "text",
              text: formatToolDetails(result),
            },
          ],
        };
      }

      case "compare_tools": {
        const parsed = compareToolsSchema.parse(args);
        const result = await callVibebuffAPI("/mcp/compare", { tools: parsed.tools });
        return {
          content: [
            {
              type: "text",
              text: formatToolComparison(result),
            },
          ],
        };
      }

      case "get_stack_template": {
        const parsed = getStackTemplateSchema.parse(args);
        const result = await callVibebuffAPI("/mcp/templates", parsed);
        return {
          content: [
            {
              type: "text",
              text: formatStackTemplate(result),
            },
          ],
        };
      }

      case "get_categories": {
        const parsed = getCategoriesSchema.parse(args || {});
        const result = await callVibebuffAPI("/mcp/categories", parsed);
        return {
          content: [
            {
              type: "text",
              text: formatCategories(result),
            },
          ],
        };
      }

      default:
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "vibebuff://tools/all",
        name: "All Developer Tools",
        description: "Complete list of all 500+ developer tools in the VibeBuff database",
        mimeType: "application/json",
      },
      {
        uri: "vibebuff://categories/all",
        name: "Tool Categories",
        description: "All tool categories with descriptions",
        mimeType: "application/json",
      },
      {
        uri: "vibebuff://templates/all",
        name: "Stack Templates",
        description: "Pre-built stack templates for common project types",
        mimeType: "application/json",
      },
      {
        uri: "vibebuff://synergies/all",
        name: "Tool Synergies",
        description: "Known synergies and integrations between tools",
        mimeType: "application/json",
      },
      {
        uri: "vibebuff://trends/current",
        name: "Current Tech Trends",
        description: "Current technology trends and popular stacks",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    let endpoint = "";
    
    if (uri === "vibebuff://tools/all") {
      endpoint = "/mcp/resources/tools";
    } else if (uri === "vibebuff://categories/all") {
      endpoint = "/mcp/resources/categories";
    } else if (uri === "vibebuff://templates/all") {
      endpoint = "/mcp/resources/templates";
    } else if (uri === "vibebuff://synergies/all") {
      endpoint = "/mcp/resources/synergies";
    } else if (uri === "vibebuff://trends/current") {
      endpoint = "/mcp/resources/trends";
    } else if (uri.startsWith("vibebuff://tools/")) {
      const slug = uri.replace("vibebuff://tools/", "");
      endpoint = `/mcp/tools/${slug}`;
    } else {
      throw new Error(`Unknown resource: ${uri}`);
    }

    const result = await callVibebuffAPI(endpoint, {});
    
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "architect_stack",
        description: "Help architect a complete tech stack for a new project",
        arguments: [
          {
            name: "projectType",
            description: "Type of project (e.g., SaaS, e-commerce, mobile app)",
            required: true,
          },
          {
            name: "requirements",
            description: "Specific requirements or constraints",
            required: false,
          },
        ],
      },
      {
        name: "migrate_stack",
        description: "Get guidance on migrating from one tech stack to another",
        arguments: [
          {
            name: "currentStack",
            description: "Current technologies being used",
            required: true,
          },
          {
            name: "targetStack",
            description: "Desired target technologies",
            required: false,
          },
        ],
      },
      {
        name: "optimize_stack",
        description: "Analyze and optimize an existing tech stack",
        arguments: [
          {
            name: "currentStack",
            description: "Current technologies being used",
            required: true,
          },
          {
            name: "painPoints",
            description: "Current issues or pain points",
            required: false,
          },
        ],
      },
      {
        name: "evaluate_tool",
        description: "Deep evaluation of a specific tool for your use case",
        arguments: [
          {
            name: "toolName",
            description: "Name of the tool to evaluate",
            required: true,
          },
          {
            name: "useCase",
            description: "Your specific use case",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "architect_stack":
      return {
        description: "Architect a complete tech stack",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need help architecting a tech stack for a ${args?.projectType || "new project"}.

${args?.requirements ? `Requirements: ${args.requirements}` : ""}

Please use the VibeBuff tools to:
1. First, search for relevant tools in each category (frontend, backend, database, auth, hosting)
2. Get detailed information on the top candidates
3. Compare the best options
4. Provide a final recommendation with reasoning

Consider factors like:
- Developer experience
- Scalability
- Cost
- Community support
- Integration compatibility`,
            },
          },
        ],
      };

    case "migrate_stack":
      return {
        description: "Guide for migrating tech stacks",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need help migrating my tech stack.

Current stack: ${args?.currentStack || "Not specified"}
${args?.targetStack ? `Target stack: ${args.targetStack}` : ""}

Please use VibeBuff tools to:
1. Get details on my current tools
2. Search for modern alternatives if target not specified
3. Compare current vs potential new tools
4. Provide a migration strategy with:
   - Risk assessment
   - Migration order
   - Potential pitfalls
   - Timeline estimates`,
            },
          },
        ],
      };

    case "optimize_stack":
      return {
        description: "Optimize an existing tech stack",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need help optimizing my current tech stack.

Current stack: ${args?.currentStack || "Not specified"}
${args?.painPoints ? `Pain points: ${args.painPoints}` : ""}

Please use VibeBuff tools to:
1. Analyze my current tools
2. Identify potential bottlenecks or issues
3. Search for better alternatives where needed
4. Provide optimization recommendations with:
   - Quick wins
   - Medium-term improvements
   - Long-term strategic changes`,
            },
          },
        ],
      };

    case "evaluate_tool":
      return {
        description: "Deep evaluation of a specific tool",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need a deep evaluation of ${args?.toolName || "a tool"} for my use case.

Use case: ${args?.useCase || "Not specified"}

Please use VibeBuff tools to:
1. Get detailed information about the tool
2. Search for alternatives in the same category
3. Compare with top 2-3 alternatives
4. Provide a recommendation with:
   - Pros and cons for my use case
   - Pricing analysis
   - Learning curve assessment
   - Community and support evaluation`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

async function callVibebuffAPI(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
  const url = `${VIBEBUFF_API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(VIBEBUFF_API_KEY && { "Authorization": `Bearer ${VIBEBUFF_API_KEY}` }),
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

function getMockData(endpoint: string, data: Record<string, unknown>): unknown {
  if (endpoint.includes("/recommend")) {
    return {
      stack: {
        frontend: { name: "Next.js", slug: "nextjs", reasoning: "Best for React apps with SSR" },
        backend: { name: "Convex", slug: "convex", reasoning: "Real-time database with serverless functions" },
        database: { name: "Convex", slug: "convex", reasoning: "Built-in with Convex" },
        auth: { name: "Clerk", slug: "clerk", reasoning: "Best DX for authentication" },
        hosting: { name: "Vercel", slug: "vercel", reasoning: "Optimized for Next.js" },
        styling: { name: "Tailwind CSS", slug: "tailwindcss", reasoning: "Utility-first CSS framework" },
      },
      estimatedMonthlyCost: "$0-50 for hobby, $50-200 for startup",
      aiReasoning: `Based on your project description: "${data.projectDescription || "web app"}", I recommend a modern full-stack approach optimized for developer experience and scalability.`,
    };
  }

  if (endpoint.includes("/search")) {
    return {
      tools: [
        { name: "Next.js", slug: "nextjs", category: "Frontend Framework", tagline: "The React Framework for the Web" },
        { name: "Remix", slug: "remix", category: "Frontend Framework", tagline: "Full stack web framework" },
        { name: "Nuxt", slug: "nuxt", category: "Frontend Framework", tagline: "The Intuitive Vue Framework" },
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
      description: "Next.js is a React framework that enables server-side rendering and static site generation.",
      category: "Frontend Framework",
      pricing: "Free / Open Source",
      pros: ["Great DX", "Excellent performance", "Large ecosystem", "Vercel integration"],
      cons: ["Learning curve", "Can be complex for simple apps"],
      features: ["SSR", "SSG", "API Routes", "Image Optimization", "Middleware"],
      alternatives: ["Remix", "Nuxt", "SvelteKit"],
      website: "https://nextjs.org",
      github: "https://github.com/vercel/next.js",
    };
  }

  if (endpoint.includes("/compare")) {
    return {
      tools: (data.tools as string[])?.map((slug) => ({
        name: slug,
        slug,
        scores: { performance: 9, dx: 9, ecosystem: 10, learning: 7 },
      })) || [],
      recommendation: "Next.js is recommended for most React projects due to its mature ecosystem.",
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
  const result = data as { tools: Array<{ name: string; slug: string; category: string; tagline: string }>; total: number };

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
  const result = data as { categories: Array<{ name: string; slug: string; toolCount: number }> };

  let output = "# Tool Categories\n\n";
  output += "| Category | Slug | Tools |\n";
  output += "|----------|------|-------|\n";

  for (const cat of result.categories) {
    output += `| ${cat.name} | ${cat.slug} | ${cat.toolCount} |\n`;
  }

  return output;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VibeBuff MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
