import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let servers;
    
    if (args.featured) {
      servers = await ctx.db
        .query("mcpServers")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
    } else if (args.category) {
      servers = await ctx.db
        .query("mcpServers")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    } else {
      servers = await ctx.db.query("mcpServers").collect();
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      servers = servers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    servers.sort((a, b) => b.installCount - a.installCount);

    if (args.limit) {
      servers = servers.slice(0, args.limit);
    }

    return servers;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const server = await ctx.db
      .query("mcpServers")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!server) return null;

    const configs = await ctx.db
      .query("mcpServerConfigs")
      .withIndex("by_server", (q) => q.eq("mcpServerId", server._id))
      .collect();

    const tools = await ctx.db
      .query("mcpServerTools")
      .withIndex("by_server", (q) => q.eq("mcpServerId", server._id))
      .collect();

    return {
      ...server,
      configs,
      tools,
    };
  },
});

export const getById = query({
  args: { id: v.id("mcpServers") },
  handler: async (ctx, args) => {
    const server = await ctx.db.get(args.id);
    if (!server) return null;

    const configs = await ctx.db
      .query("mcpServerConfigs")
      .withIndex("by_server", (q) => q.eq("mcpServerId", server._id))
      .collect();

    const tools = await ctx.db
      .query("mcpServerTools")
      .withIndex("by_server", (q) => q.eq("mcpServerId", server._id))
      .collect();

    return {
      ...server,
      configs,
      tools,
    };
  },
});

export const getConfigForIde = query({
  args: {
    mcpServerId: v.id("mcpServers"),
    ide: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("mcpServerConfigs")
      .withIndex("by_server_ide", (q) =>
        q.eq("mcpServerId", args.mcpServerId).eq("ide", args.ide as any)
      )
      .first();

    return config;
  },
});

export const getCategories = query({
  handler: async (ctx) => {
    const servers = await ctx.db.query("mcpServers").collect();
    const categoryCounts: Record<string, number> = {};

    for (const server of servers) {
      categoryCounts[server.category] = (categoryCounts[server.category] || 0) + 1;
    }

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  },
});

export const upvote = mutation({
  args: {
    mcpServerId: v.id("mcpServers"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mcpServerUpvotes")
      .withIndex("by_user_server", (q) =>
        q.eq("userId", args.userId).eq("mcpServerId", args.mcpServerId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      const server = await ctx.db.get(args.mcpServerId);
      if (server) {
        await ctx.db.patch(args.mcpServerId, {
          upvotes: Math.max(0, server.upvotes - 1),
        });
      }
      return { action: "removed" };
    }

    await ctx.db.insert("mcpServerUpvotes", {
      mcpServerId: args.mcpServerId,
      userId: args.userId,
      votedAt: Date.now(),
    });

    const server = await ctx.db.get(args.mcpServerId);
    if (server) {
      await ctx.db.patch(args.mcpServerId, {
        upvotes: server.upvotes + 1,
      });
    }

    return { action: "added" };
  },
});

export const hasUpvoted = query({
  args: {
    mcpServerId: v.id("mcpServers"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;

    const existing = await ctx.db
      .query("mcpServerUpvotes")
      .withIndex("by_user_server", (q) =>
        q.eq("userId", args.userId!).eq("mcpServerId", args.mcpServerId)
      )
      .first();

    return !!existing;
  },
});

export const trackInstall = mutation({
  args: {
    mcpServerId: v.id("mcpServers"),
    userId: v.optional(v.string()),
    ide: v.string(),
  },
  handler: async (ctx, args) => {
    const server = await ctx.db.get(args.mcpServerId);
    if (server) {
      await ctx.db.patch(args.mcpServerId, {
        installCount: server.installCount + 1,
      });
    }

    if (args.userId) {
      const existing = await ctx.db
        .query("userMcpInstalls")
        .withIndex("by_user_server", (q) =>
          q.eq("userId", args.userId!).eq("mcpServerId", args.mcpServerId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("userMcpInstalls", {
          userId: args.userId,
          mcpServerId: args.mcpServerId,
          ide: args.ide,
          installedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const submitMcpServer = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    websiteUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    category: v.string(),
    transportTypes: v.array(v.string()),
    sampleConfig: v.optional(v.string()),
    submittedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("mcpServerSubmissions", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });

    return { id };
  },
});

export const getUserSubmissions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mcpServerSubmissions")
      .withIndex("by_user", (q) => q.eq("submittedBy", args.userId))
      .collect();
  },
});

export const seedMcpServers = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("mcpServers").first();
    if (existing) {
      return { message: "MCP servers already seeded" };
    }

    const servers = [
      {
        name: "GitHub",
        slug: "github",
        description: "Access GitHub repositories, issues, pull requests, and more. Create branches, manage PRs, and interact with your codebase directly from your AI assistant.",
        shortDescription: "GitHub repository and PR management",
        websiteUrl: "https://github.com",
        githubUrl: "https://github.com/modelcontextprotocol/servers",
        docsUrl: "https://modelcontextprotocol.io/docs",
        author: "Anthropic",
        category: "version_control" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["git", "github", "version-control", "repositories", "pull-requests"],
        installCount: 15420,
        upvotes: 892,
      },
      {
        name: "Supabase",
        slug: "supabase",
        description: "Connect to your Supabase projects. Query databases, manage authentication, and interact with storage directly from your IDE.",
        shortDescription: "Supabase database and auth integration",
        websiteUrl: "https://supabase.com",
        githubUrl: "https://github.com/supabase-community/supabase-mcp",
        docsUrl: "https://supabase.com/docs/guides/getting-started/mcp",
        author: "Supabase",
        category: "database" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["database", "postgres", "auth", "storage", "realtime"],
        installCount: 8934,
        upvotes: 567,
      },
      {
        name: "Convex",
        slug: "convex",
        description: "Interact with your Convex deployment - query tables, run functions, manage environment variables, and analyze logs.",
        shortDescription: "Convex backend integration",
        websiteUrl: "https://convex.dev",
        githubUrl: "https://github.com/get-convex/convex-backend",
        docsUrl: "https://docs.convex.dev",
        author: "Convex",
        category: "database" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["database", "backend", "realtime", "serverless", "typescript"],
        installCount: 6721,
        upvotes: 445,
      },
      {
        name: "Stripe",
        slug: "stripe",
        description: "Payment processing APIs. Create customers, manage subscriptions, handle invoices, and more.",
        shortDescription: "Stripe payment APIs",
        websiteUrl: "https://stripe.com",
        githubUrl: "https://github.com/stripe/stripe-mcp",
        docsUrl: "https://stripe.com/docs",
        author: "Stripe",
        category: "api" as const,
        transportTypes: ["stdio" as const, "sse" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["payments", "billing", "subscriptions", "invoices", "fintech"],
        installCount: 7823,
        upvotes: 534,
      },
      {
        name: "Sentry",
        slug: "sentry",
        description: "Monitor errors and performance. Access error reports, stack traces, and application metrics from your AI assistant.",
        shortDescription: "Error monitoring and performance",
        websiteUrl: "https://sentry.io",
        docsUrl: "https://docs.sentry.io",
        author: "Sentry",
        category: "analytics" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["monitoring", "errors", "performance", "debugging", "observability"],
        installCount: 5432,
        upvotes: 321,
      },
      {
        name: "Notion",
        slug: "notion",
        description: "Access and manage Notion workspaces, databases, and pages. Create, update, and query your Notion content.",
        shortDescription: "Notion workspace integration",
        websiteUrl: "https://notion.so",
        docsUrl: "https://developers.notion.com",
        author: "Notion",
        category: "productivity" as const,
        transportTypes: ["http" as const],
        supportsOAuth: true,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["productivity", "notes", "databases", "wiki", "collaboration"],
        installCount: 9234,
        upvotes: 678,
      },
      {
        name: "Linear",
        slug: "linear",
        description: "Project management integration. Create issues, manage sprints, and track project progress.",
        shortDescription: "Linear issue tracking",
        websiteUrl: "https://linear.app",
        docsUrl: "https://developers.linear.app",
        author: "Linear",
        category: "productivity" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["project-management", "issues", "sprints", "agile", "tracking"],
        installCount: 4567,
        upvotes: 289,
      },
      {
        name: "Vercel",
        slug: "vercel",
        description: "Manage deployments, domains, and projects. Deploy applications and monitor your Vercel infrastructure.",
        shortDescription: "Vercel deployment management",
        websiteUrl: "https://vercel.com",
        docsUrl: "https://vercel.com/docs",
        author: "Vercel",
        category: "deployment" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["deployment", "hosting", "serverless", "edge", "frontend"],
        installCount: 6234,
        upvotes: 412,
      },
      {
        name: "Railway",
        slug: "railway",
        description: "Deploy apps, databases, and services. Manage your Railway projects and infrastructure.",
        shortDescription: "Railway deployment platform",
        websiteUrl: "https://railway.app",
        githubUrl: "https://github.com/railwayapp/railway-mcp",
        docsUrl: "https://docs.railway.app",
        author: "Railway",
        category: "deployment" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["deployment", "hosting", "databases", "infrastructure", "paas"],
        installCount: 3456,
        upvotes: 234,
      },
      {
        name: "Prisma",
        slug: "prisma",
        description: "Manage Prisma Postgres databases, including creating new instances and running schema migrations.",
        shortDescription: "Prisma database management",
        websiteUrl: "https://prisma.io",
        docsUrl: "https://www.prisma.io/docs",
        author: "Prisma",
        category: "database" as const,
        transportTypes: ["stdio" as const, "sse" as const],
        supportsOAuth: true,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["database", "orm", "postgres", "migrations", "schema"],
        installCount: 4123,
        upvotes: 298,
      },
      {
        name: "MongoDB",
        slug: "mongodb",
        description: "Manage MongoDB data and deployments. Query collections, manage indexes, and interact with your MongoDB databases.",
        shortDescription: "MongoDB database integration",
        websiteUrl: "https://mongodb.com",
        githubUrl: "https://github.com/mongodb/mongodb-mcp",
        docsUrl: "https://www.mongodb.com/docs",
        author: "MongoDB",
        category: "database" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["database", "nosql", "mongodb", "documents", "atlas"],
        installCount: 3789,
        upvotes: 267,
      },
      {
        name: "Firecrawl",
        slug: "firecrawl",
        description: "The web crawling, scraping, and search API for AI. Extract data from any website.",
        shortDescription: "Web scraping and crawling",
        websiteUrl: "https://firecrawl.dev",
        githubUrl: "https://github.com/mendableai/firecrawl",
        docsUrl: "https://docs.firecrawl.dev",
        author: "Mendable",
        category: "api" as const,
        transportTypes: ["sse" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["scraping", "crawling", "web", "data-extraction", "search"],
        installCount: 2987,
        upvotes: 198,
      },
      {
        name: "Browserbase",
        slug: "browserbase",
        description: "Headless browser sessions for agents. Automate web interactions and browser-based tasks.",
        shortDescription: "Headless browser automation",
        websiteUrl: "https://browserbase.com",
        docsUrl: "https://docs.browserbase.com",
        author: "Browserbase",
        category: "devtools" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["browser", "automation", "headless", "testing", "scraping"],
        installCount: 2345,
        upvotes: 156,
      },
      {
        name: "Context7",
        slug: "context7",
        description: "Access up-to-date documentation and code examples for any library. Get accurate, current information for your coding tasks.",
        shortDescription: "Library documentation access",
        websiteUrl: "https://context7.com",
        docsUrl: "https://context7.com/docs",
        author: "Context7",
        category: "documentation" as const,
        transportTypes: ["http" as const],
        supportsOAuth: false,
        isOfficial: true,
        isVerified: true,
        isFeatured: true,
        tags: ["documentation", "libraries", "code-examples", "reference", "learning"],
        installCount: 5678,
        upvotes: 389,
      },
      {
        name: "Slack",
        slug: "slack",
        description: "Send messages, manage channels, and interact with your Slack workspace.",
        shortDescription: "Slack messaging integration",
        websiteUrl: "https://slack.com",
        docsUrl: "https://api.slack.com",
        author: "Slack",
        category: "communication" as const,
        transportTypes: ["stdio" as const],
        supportsOAuth: true,
        isOfficial: true,
        isVerified: true,
        isFeatured: false,
        tags: ["messaging", "communication", "team", "channels", "notifications"],
        installCount: 4321,
        upvotes: 287,
      },
    ];

    for (const server of servers) {
      const now = Date.now();
      const serverId = await ctx.db.insert("mcpServers", {
        ...server,
        createdAt: now,
        updatedAt: now,
      });

      const cursorConfig = {
        mcpServerId: serverId,
        ide: "cursor" as const,
        configType: server.transportTypes[0] as "stdio" | "http" | "sse",
        configJson: JSON.stringify(
          server.transportTypes[0] === "stdio"
            ? {
                mcpServers: {
                  [server.slug]: {
                    command: "npx",
                    args: ["-y", `@modelcontextprotocol/server-${server.slug}`],
                    env: {},
                  },
                },
              }
            : {
                mcpServers: {
                  [server.slug]: {
                    type: server.transportTypes[0],
                    url: `https://mcp.${server.slug}.com/mcp`,
                  },
                },
              },
          null,
          2
        ),
        setupInstructions: `Add to ~/.cursor/mcp.json or .cursor/mcp.json in your project`,
      };

      const windsurfConfig = {
        mcpServerId: serverId,
        ide: "windsurf" as const,
        configType: server.transportTypes[0] as "stdio" | "http" | "sse",
        configJson: JSON.stringify(
          server.transportTypes[0] === "stdio"
            ? {
                mcpServers: {
                  [server.slug]: {
                    command: "npx",
                    args: ["-y", `@modelcontextprotocol/server-${server.slug}`],
                    env: {},
                  },
                },
              }
            : {
                mcpServers: {
                  [server.slug]: {
                    serverUrl: `https://mcp.${server.slug}.com/mcp`,
                  },
                },
              },
          null,
          2
        ),
        setupInstructions: `Add to ~/.codeium/windsurf/mcp_config.json`,
      };

      const claudeCodeConfig = {
        mcpServerId: serverId,
        ide: "claude_code" as const,
        configType: server.transportTypes[0] as "stdio" | "http" | "sse",
        configJson:
          server.transportTypes[0] === "stdio"
            ? `claude mcp add --transport stdio ${server.slug} -- npx -y @modelcontextprotocol/server-${server.slug}`
            : `claude mcp add --transport ${server.transportTypes[0]} ${server.slug} https://mcp.${server.slug}.com/mcp`,
        setupInstructions: `Run the command in your terminal, or add to .mcp.json in your project root`,
      };

      const vscodeConfig = {
        mcpServerId: serverId,
        ide: "vscode" as const,
        configType: server.transportTypes[0] as "stdio" | "http" | "sse",
        configJson: JSON.stringify(
          server.transportTypes[0] === "stdio"
            ? {
                servers: {
                  [server.slug]: {
                    command: "npx",
                    args: ["-y", `@modelcontextprotocol/server-${server.slug}`],
                  },
                },
              }
            : {
                servers: {
                  [server.slug]: {
                    type: server.transportTypes[0],
                    url: `https://mcp.${server.slug}.com/mcp`,
                  },
                },
              },
          null,
          2
        ),
        setupInstructions: `Add to .vscode/mcp.json in your workspace`,
      };

      const claudeDesktopConfig = {
        mcpServerId: serverId,
        ide: "claude_desktop" as const,
        configType: server.transportTypes[0] as "stdio" | "http" | "sse",
        configJson: JSON.stringify(
          {
            mcpServers: {
              [server.slug]: {
                command: "npx",
                args: ["-y", `@modelcontextprotocol/server-${server.slug}`],
              },
            },
          },
          null,
          2
        ),
        setupInstructions: `Add to ~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or %APPDATA%\\Claude\\claude_desktop_config.json (Windows)`,
      };

      await ctx.db.insert("mcpServerConfigs", cursorConfig);
      await ctx.db.insert("mcpServerConfigs", windsurfConfig);
      await ctx.db.insert("mcpServerConfigs", claudeCodeConfig);
      await ctx.db.insert("mcpServerConfigs", vscodeConfig);
      await ctx.db.insert("mcpServerConfigs", claudeDesktopConfig);
    }

    return { message: "MCP servers seeded successfully", count: servers.length };
  },
});
