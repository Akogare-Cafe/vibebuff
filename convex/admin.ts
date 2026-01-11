import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";
import { internal } from "./_generated/api";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "kavyrattana@gmail.com")
  .split(",")
  .map(email => email.trim())
  .filter(Boolean);

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    
    const userId = identity.subject;
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    return userProfile?.isAdmin === true;
  },
});

export const setAdminStatus = mutation({
  args: {
    targetUserId: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!currentUserProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.targetUserId))
      .first();

    if (!targetProfile) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetProfile._id, { isAdmin: args.isAdmin });
    return { success: true };
  },
});

export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("userProfiles").collect();

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchLower) ||
          u.clerkId.toLowerCase().includes(searchLower)
      );
    }

    users.sort((a, b) => b.xp - a.xp);

    return users.slice(0, args.limit || 100);
  },
});

export const getAllTools = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let tools = await ctx.db.query("tools").collect();

    if (!args.includeInactive) {
      tools = tools.filter((t) => t.isActive);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.slug.toLowerCase().includes(searchLower) ||
          t.tagline.toLowerCase().includes(searchLower)
      );
    }

    tools.sort((a, b) => a.name.localeCompare(b.name));

    const toolsWithCategories = await Promise.all(
      tools.slice(0, args.limit || 100).map(async (tool) => {
        const category = await ctx.db.get(tool.categoryId);
        return { ...tool, category };
      })
    );

    return toolsWithCategories;
  },
});

export const updateTool = mutation({
  args: {
    toolId: v.id("tools"),
    updates: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      tagline: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      githubUrl: v.optional(v.string()),
      docsUrl: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      pricingModel: v.optional(v.union(
        v.literal("free"),
        v.literal("freemium"),
        v.literal("paid"),
        v.literal("open_source"),
        v.literal("enterprise")
      )),
      isOpenSource: v.optional(v.boolean()),
      isActive: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      pros: v.optional(v.array(v.string())),
      cons: v.optional(v.array(v.string())),
      bestFor: v.optional(v.array(v.string())),
      features: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const updates: Record<string, any> = {};
    Object.entries(args.updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    await ctx.db.patch(args.toolId, updates);
    return { success: true };
  },
});

export const deleteTool = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.toolId, { isActive: false });
    return { success: true };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("userProfiles").collect();
    const tools = await ctx.db.query("tools").collect();
    const suggestions = await ctx.db.query("toolSuggestions").collect();
    const categories = await ctx.db.query("categories").collect();

    const activeTools = tools.filter((t) => t.isActive).length;
    const pendingSuggestions = suggestions.filter((s) => s.status === "pending").length;
    const totalXp = users.reduce((sum, u) => sum + u.xp, 0);
    const adminCount = users.filter((u) => u.isAdmin).length;

    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSuggestions = suggestions.filter((s) => s.createdAt > last7Days).length;

    return {
      totalUsers: users.length,
      totalTools: tools.length,
      activeTools,
      totalCategories: categories.length,
      totalSuggestions: suggestions.length,
      pendingSuggestions,
      recentSuggestions,
      totalXp,
      adminCount,
    };
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const tools = await ctx.db
          .query("tools")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();
        return { ...category, toolCount: tools.filter((t) => t.isActive).length };
      })
    );

    return categoriesWithCounts.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const setAdminByEmail = mutation({
  args: {
    email: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUserEmail = identity.email;
    if (!ADMIN_EMAILS.includes(currentUserEmail || "")) {
      const userId = identity.subject;
      const currentUserProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();

      if (!currentUserProfile?.isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
    }

    const users = await ctx.db.query("userProfiles").collect();
    
    for (const user of users) {
      const userIdentity = user.clerkId;
      if (args.email === "kavyrattana@gmail.com" && user.username === "kavyrattana") {
        await ctx.db.patch(user._id, { isAdmin: args.isAdmin });
        return { success: true, userId: user.clerkId };
      }
    }

    throw new Error("User with email not found");
  },
});

export const initializeAdminByEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const email = identity.email;
    if (!ADMIN_EMAILS.includes(email || "")) {
      throw new Error("Your email is not in the admin list");
    }

    const userId = identity.subject;
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found. Please complete onboarding first.");
    }

    await ctx.db.patch(userProfile._id, { isAdmin: true });
    return { success: true };
  },
});

export const createTool = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    websiteUrl: v.string(),
    categorySlug: v.string(),
    pricingModel: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid"),
      v.literal("open_source"),
      v.literal("enterprise")
    ),
    isOpenSource: v.boolean(),
    githubUrl: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
    bestFor: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.categorySlug}`);
    }

    const existingTool = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingTool) {
      throw new Error(`Tool with slug "${args.slug}" already exists`);
    }

    const toolId = await ctx.db.insert("tools", {
      name: args.name,
      slug: args.slug,
      tagline: args.tagline,
      description: args.description,
      websiteUrl: args.websiteUrl,
      githubUrl: args.githubUrl,
      docsUrl: args.docsUrl,
      logoUrl: args.logoUrl,
      categoryId: category._id,
      pricingModel: args.pricingModel,
      isOpenSource: args.isOpenSource,
      isActive: true,
      isFeatured: false,
      pros: args.pros || [],
      cons: args.cons || [],
      bestFor: args.bestFor || [],
      features: args.features || [],
      tags: args.tags || [],
    });

    return { success: true, toolId };
  },
});

export const getFeedSources = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("feedSources").collect();
    return sources.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const updateFeedSource = mutation({
  args: {
    sourceId: v.id("feedSources"),
    updates: v.object({
      isActive: v.optional(v.boolean()),
      pollIntervalMinutes: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.sourceId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const createFeedSource = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    url: v.string(),
    feedType: v.union(
      v.literal("rss"),
      v.literal("atom"),
      v.literal("json"),
      v.literal("api")
    ),
    category: v.union(
      v.literal("ai_news"),
      v.literal("dev_tools"),
      v.literal("frameworks"),
      v.literal("releases"),
      v.literal("tutorials"),
      v.literal("blogs"),
      v.literal("podcasts"),
      v.literal("newsletters")
    ),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    pollIntervalMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const existing = await ctx.db
      .query("feedSources")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Feed source with slug "${args.slug}" already exists`);
    }

    const sourceId = await ctx.db.insert("feedSources", {
      name: args.name,
      slug: args.slug,
      url: args.url,
      feedType: args.feedType,
      category: args.category,
      description: args.description,
      logoUrl: args.logoUrl,
      websiteUrl: args.websiteUrl,
      isActive: true,
      pollIntervalMinutes: args.pollIntervalMinutes,
      itemCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, sourceId };
  },
});

export const getCronJobs = query({
  args: {},
  handler: async (ctx) => {
    const feedSources = await ctx.db
      .query("feedSources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return {
      feedFetcher: {
        name: "fetch-ai-tooling-feeds",
        interval: "30 minutes",
        lastRun: feedSources.reduce((latest, s) => 
          Math.max(latest, s.lastFetchedAt || 0), 0
        ),
        activeSources: feedSources.length,
        status: "active",
      },
    };
  },
});

export const getScrapeJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("communityToolSuggestions")
      .withIndex("by_fetch_status")
      .collect();

    return jobs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
  },
});

export const getToolScrapeQueue = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("communityToolSuggestions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pending.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createScrapeJob = mutation({
  args: {
    url: v.string(),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const isGithub = args.url.includes("github.com");
    
    const jobId = await ctx.db.insert("communityToolSuggestions", {
      userId,
      name: args.name || "Pending scrape",
      description: `Scraping from: ${args.url}`,
      websiteUrl: isGithub ? undefined : args.url,
      githubUrl: isGithub ? args.url : undefined,
      category: args.category || "other",
      tags: [],
      fetchStatus: "pending",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, jobId };
  },
});

export const internalRequireAdmin = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    return userProfile?.isAdmin === true;
  },
});

export const updateScrapeJobStatus = internalMutation({
  args: {
    jobId: v.id("communityToolSuggestions"),
    fetchStatus: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("completed"),
      v.literal("failed")
    ),
    fetchedData: v.optional(v.object({
      stars: v.optional(v.number()),
      forks: v.optional(v.number()),
      description: v.optional(v.string()),
      language: v.optional(v.string()),
      topics: v.optional(v.array(v.string())),
      license: v.optional(v.string()),
      lastUpdated: v.optional(v.string()),
    })),
    fetchError: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      fetchStatus: args.fetchStatus,
      updatedAt: Date.now(),
    };

    if (args.fetchedData) updates.fetchedData = args.fetchedData;
    if (args.fetchError) updates.fetchError = args.fetchError;
    if (args.name) updates.name = args.name;
    if (args.description) updates.description = args.description;

    await ctx.db.patch(args.jobId, updates);
  },
});

const TAG_RULES: Record<string, Record<string, string[]>> = {
  "use-case": {
    "web-development": ["web", "website", "frontend", "backend", "fullstack", "html", "css", "dom"],
    "mobile-development": ["mobile", "ios", "android", "react-native", "flutter", "swift", "kotlin"],
    "api-development": ["api", "rest", "graphql", "grpc", "endpoint", "swagger", "openapi"],
    "data-science": ["data", "analytics", "visualization", "pandas", "numpy", "jupyter", "notebook"],
    "machine-learning": ["ml", "machine learning", "deep learning", "neural", "tensorflow", "pytorch", "model"],
    "devops": ["devops", "ci/cd", "pipeline", "deployment", "infrastructure", "container", "kubernetes", "docker"],
    "testing": ["test", "testing", "unit test", "e2e", "integration", "qa", "quality"],
    "documentation": ["docs", "documentation", "readme", "wiki", "markdown", "jsdoc", "typedoc"],
    "automation": ["automate", "automation", "workflow", "script", "task", "cron", "schedule"],
    "monitoring": ["monitor", "observability", "logging", "metrics", "tracing", "apm", "alerting"],
    "security": ["security", "auth", "authentication", "authorization", "encrypt", "vulnerability", "scan"],
    "database": ["database", "db", "sql", "nosql", "query", "orm", "migration"],
    "realtime": ["realtime", "real-time", "websocket", "socket", "live", "streaming", "pubsub"],
    "ai-coding": ["ai coding", "code generation", "copilot", "autocomplete", "code assist", "pair programming"],
  },
  "tech-stack": {
    "typescript": ["typescript", "ts", ".ts", "tsc"],
    "javascript": ["javascript", "js", "node", "npm", "yarn", "pnpm"],
    "python": ["python", "py", "pip", "conda", "django", "flask", "fastapi"],
    "go": ["golang", "go ", " go", "go-"],
    "rust": ["rust", "cargo", "rustc"],
    "java": ["java", "jvm", "maven", "gradle", "spring"],
    "ruby": ["ruby", "rails", "gem", "bundler"],
    "php": ["php", "laravel", "symfony", "composer"],
    "swift": ["swift", "swiftui", "xcode", "ios"],
    "kotlin": ["kotlin", "android", "jetpack"],
    "react": ["react", "jsx", "next.js", "nextjs", "gatsby", "remix"],
    "vue": ["vue", "vuejs", "nuxt", "vite"],
    "svelte": ["svelte", "sveltekit"],
    "angular": ["angular", "ng-", "rxjs"],
  },
  "platform": {
    "vscode": ["vscode", "vs code", "visual studio code"],
    "jetbrains": ["jetbrains", "intellij", "webstorm", "pycharm", "phpstorm"],
    "neovim": ["neovim", "nvim", "vim"],
    "cursor": ["cursor"],
    "windsurf": ["windsurf", "codeium"],
    "browser": ["browser", "chrome", "firefox", "safari", "extension"],
    "cli": ["cli", "terminal", "command line", "shell", "bash", "zsh"],
    "cloud": ["aws", "azure", "gcp", "google cloud", "cloudflare", "vercel", "netlify"],
    "self-hosted": ["self-hosted", "self hosted", "on-premise", "docker", "kubernetes"],
  },
  "integration": {
    "github": ["github"],
    "gitlab": ["gitlab"],
    "bitbucket": ["bitbucket"],
    "slack": ["slack"],
    "discord": ["discord"],
    "notion": ["notion"],
    "linear": ["linear"],
    "jira": ["jira", "atlassian"],
    "figma": ["figma"],
    "vercel": ["vercel"],
    "supabase": ["supabase"],
    "firebase": ["firebase"],
    "stripe": ["stripe", "payment"],
    "openai": ["openai", "gpt", "chatgpt"],
    "anthropic": ["anthropic", "claude"],
  },
  "feature": {
    "open-source": ["open source", "open-source", "oss", "mit license", "apache license", "gpl"],
    "free-tier": ["free tier", "free plan", "freemium", "free to use"],
    "enterprise": ["enterprise", "team", "organization", "sso", "saml"],
    "offline": ["offline", "local", "no internet"],
    "multi-language": ["multi-language", "multilingual", "i18n", "internationalization"],
    "collaborative": ["collaborative", "collaboration", "multiplayer", "team", "shared"],
    "ai-powered": ["ai", "artificial intelligence", "llm", "gpt", "claude", "gemini", "copilot"],
    "mcp": ["mcp", "model context protocol"],
    "agent": ["agent", "agentic", "autonomous"],
  },
};

function generateTagsFromTool(tool: {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  githubUrl?: string | null;
  isOpenSource: boolean;
  pricingModel: string;
  features: string[];
  tags: string[];
  externalData?: {
    github?: { topics?: string[]; language?: string } | null;
    npm?: { keywords?: string[] } | null;
  } | null;
}): string[] {
  const tags = new Set<string>();
  
  const name = tool.name.toLowerCase();
  const description = (tool.description || "").toLowerCase();
  const tagline = (tool.tagline || "").toLowerCase();
  const websiteUrl = (tool.websiteUrl || "").toLowerCase();
  
  const githubTopics = tool.externalData?.github?.topics || [];
  const npmKeywords = tool.externalData?.npm?.keywords || [];
  const language = tool.externalData?.github?.language?.toLowerCase() || "";
  
  const searchableText = `${name} ${description} ${tagline} ${websiteUrl} ${tool.features.join(" ")} ${githubTopics.join(" ")} ${npmKeywords.join(" ")} ${language}`;
  
  for (const [, tagRules] of Object.entries(TAG_RULES)) {
    for (const [tagName, keywords] of Object.entries(tagRules)) {
      for (const keyword of keywords) {
        if (searchableText.includes(keyword.toLowerCase())) {
          tags.add(tagName);
          break;
        }
      }
    }
  }
  
  for (const topic of githubTopics) {
    const topicLower = topic.toLowerCase().replace(/_/g, "-");
    if (topicLower.length > 2 && topicLower.length < 30) {
      tags.add(topicLower);
    }
  }
  
  for (const keyword of npmKeywords) {
    const keywordLower = keyword.toLowerCase().replace(/_/g, "-");
    if (keywordLower.length > 2 && keywordLower.length < 30) {
      tags.add(keywordLower);
    }
  }
  
  if (tool.githubUrl || tool.isOpenSource) {
    tags.add("open-source");
  }
  
  if (tool.pricingModel === "free" || tool.pricingModel === "freemium" || tool.pricingModel === "open_source") {
    tags.add("free-tier");
  }
  
  if (tool.pricingModel === "enterprise") {
    tags.add("enterprise");
  }
  
  tags.add("developer-tools");
  
  const existingTags = tool.tags.filter(t => t && t.length > 0);
  for (const tag of existingTags) {
    tags.add(tag.toLowerCase().replace(/_/g, "-"));
  }
  
  return Array.from(tags).sort().slice(0, 20);
}

export const regenerateToolTags = mutation({
  args: {
    toolId: v.optional(v.id("tools")),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    if (args.toolId) {
      const tool = await ctx.db.get(args.toolId);
      if (!tool) {
        throw new Error("Tool not found");
      }
      
      const newTags = generateTagsFromTool(tool);
      
      if (!args.dryRun) {
        await ctx.db.patch(args.toolId, { tags: newTags });
      }
      
      return {
        success: true,
        toolId: args.toolId,
        toolName: tool.name,
        oldTags: tool.tags,
        newTags,
        dryRun: args.dryRun || false,
      };
    }

    const tools = await ctx.db.query("tools").collect();
    const results: Array<{ toolId: string; name: string; oldTags: string[]; newTags: string[] }> = [];
    
    for (const tool of tools) {
      const newTags = generateTagsFromTool(tool);
      
      if (!args.dryRun) {
        await ctx.db.patch(tool._id, { tags: newTags });
      }
      
      results.push({
        toolId: tool._id,
        name: tool.name,
        oldTags: tool.tags,
        newTags,
      });
    }
    
    return {
      success: true,
      totalTools: results.length,
      dryRun: args.dryRun || false,
      results: results.slice(0, 20),
    };
  },
});

export const getAvailableTags = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").filter((q) => q.eq(q.field("isActive"), true)).collect();
    
    const tagCounts = new Map<string, number>();
    
    for (const tool of tools) {
      for (const tag of tool.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
    
    return {
      totalTags: sortedTags.length,
      tags: sortedTags,
    };
  },
});

export const internalRegenerateAllToolTags = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tools = await ctx.db.query("tools").collect();
    const results: Array<{ toolId: string; name: string; oldTagCount: number; newTagCount: number }> = [];
    
    for (const tool of tools) {
      const newTags = generateTagsFromTool(tool);
      
      if (!args.dryRun) {
        await ctx.db.patch(tool._id, { tags: newTags });
      }
      
      results.push({
        toolId: tool._id,
        name: tool.name,
        oldTagCount: tool.tags.length,
        newTagCount: newTags.length,
      });
    }
    
    return {
      success: true,
      totalTools: results.length,
      dryRun: args.dryRun || false,
      sampleResults: results.slice(0, 10),
    };
  },
});

export const approveScrapeJob = mutation({
  args: {
    jobId: v.id("communityToolSuggestions"),
    toolData: v.object({
      name: v.string(),
      slug: v.string(),
      tagline: v.string(),
      description: v.string(),
      websiteUrl: v.string(),
      categorySlug: v.string(),
      pricingModel: v.union(
        v.literal("free"),
        v.literal("freemium"),
        v.literal("paid"),
        v.literal("open_source"),
        v.literal("enterprise")
      ),
      isOpenSource: v.boolean(),
      githubUrl: v.optional(v.string()),
      docsUrl: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      pros: v.array(v.string()),
      cons: v.array(v.string()),
      bestFor: v.array(v.string()),
      features: v.array(v.string()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.toolData.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.toolData.categorySlug}`);
    }

    const existingTool = await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.toolData.slug))
      .first();

    if (existingTool) {
      throw new Error(`Tool with slug "${args.toolData.slug}" already exists`);
    }

    const toolId = await ctx.db.insert("tools", {
      name: args.toolData.name,
      slug: args.toolData.slug,
      tagline: args.toolData.tagline,
      description: args.toolData.description,
      websiteUrl: args.toolData.websiteUrl,
      githubUrl: args.toolData.githubUrl,
      docsUrl: args.toolData.docsUrl,
      logoUrl: args.toolData.logoUrl,
      categoryId: category._id,
      pricingModel: args.toolData.pricingModel,
      isOpenSource: args.toolData.isOpenSource,
      isActive: true,
      isFeatured: false,
      pros: args.toolData.pros,
      cons: args.toolData.cons,
      bestFor: args.toolData.bestFor,
      features: args.toolData.features,
      tags: args.toolData.tags,
    });

    await ctx.db.patch(args.jobId, {
      status: "approved",
      mergedToolId: toolId,
      updatedAt: Date.now(),
    });

    return { success: true, toolId };
  },
});
