import { action, mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getToolsForMatching = internalQuery({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const categories = await ctx.db.query("categories").collect();
    
    return tools.map((tool) => {
      const category = categories.find((c) => c._id === tool.categoryId);
      return {
        id: tool._id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        category: category?.name || "Unknown",
        categorySlug: category?.slug || "unknown",
        pricingModel: tool.pricingModel,
        tags: tool.tags,
        npmPackageName: tool.slug.toLowerCase(),
      };
    });
  },
});

export const createImportJob = mutation({
  args: {
    userId: v.string(),
    packageJsonContent: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("packageImportJobs", {
      userId: args.userId,
      packageJsonContent: args.packageJsonContent,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateImportJob = internalMutation({
  args: {
    jobId: v.id("packageImportJobs"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    result: v.optional(v.object({
      detectedPackages: v.array(v.object({
        name: v.string(),
        version: v.string(),
        isDev: v.boolean(),
      })),
      matchedTools: v.array(v.object({
        packageName: v.string(),
        toolId: v.optional(v.string()),
        toolName: v.string(),
        toolSlug: v.string(),
        category: v.string(),
        confidence: v.number(),
        tagline: v.string(),
      })),
      unmatchedPackages: v.array(v.string()),
      aiAnalysis: v.string(),
      suggestedStackName: v.string(),
    })),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...updates } = args;
    await ctx.db.patch(jobId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getImportJob = query({
  args: { jobId: v.id("packageImportJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const getUserImportJobs = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("packageImportJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
  },
});

export const storeDiscoveredPackages = internalMutation({
  args: {
    packages: v.array(v.object({
      name: v.string(),
      version: v.optional(v.string()),
      isMatched: v.boolean(),
      matchedToolId: v.optional(v.string()),
      suggestedCategory: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    for (const pkg of args.packages) {
      const existing = await ctx.db
        .query("discoveredPackages")
        .withIndex("by_name", (q) => q.eq("name", pkg.name))
        .first();

      if (existing) {
        const updateData: Record<string, unknown> = {
          importCount: existing.importCount + 1,
          lastSeenAt: now,
          version: pkg.version || existing.version,
          isMatched: pkg.isMatched || existing.isMatched,
          suggestedCategory: pkg.suggestedCategory || existing.suggestedCategory,
        };
        if (pkg.matchedToolId) {
          updateData.matchedToolId = pkg.matchedToolId;
        }
        await ctx.db.patch(existing._id, updateData);
      } else {
        await ctx.db.insert("discoveredPackages", {
          name: pkg.name,
          version: pkg.version,
          importCount: 1,
          firstSeenAt: now,
          lastSeenAt: now,
          isMatched: pkg.isMatched,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          matchedToolId: pkg.matchedToolId as any,
          suggestedCategory: pkg.suggestedCategory,
          isReviewed: false,
        });
      }
    }
  },
});

export const getDiscoveredPackages = query({
  args: {
    onlyUnmatched: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let packages;
    
    if (args.onlyUnmatched) {
      packages = await ctx.db
        .query("discoveredPackages")
        .withIndex("by_matched", (q) => q.eq("isMatched", false))
        .order("desc")
        .take(args.limit || 50);
    } else {
      packages = await ctx.db
        .query("discoveredPackages")
        .order("desc")
        .take(args.limit || 50);
    }

    return packages.sort((a, b) => b.importCount - a.importCount);
  },
});

export const getTopUnmatchedPackages = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const packages = await ctx.db
      .query("discoveredPackages")
      .withIndex("by_matched", (q) => q.eq("isMatched", false))
      .collect();

    return packages
      .sort((a, b) => b.importCount - a.importCount)
      .slice(0, args.limit || 20);
  },
});

export const markPackageReviewed = mutation({
  args: {
    packageId: v.id("discoveredPackages"),
    matchedToolId: v.optional(v.id("tools")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.packageId, {
      isReviewed: true,
      isMatched: !!args.matchedToolId,
      matchedToolId: args.matchedToolId,
    });
  },
});

export const analyzePackageJson = action({
  args: {
    jobId: v.id("packageImportJobs"),
    packageJsonContent: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.packageImport.updateImportJob, {
      jobId: args.jobId,
      status: "processing",
    });

    try {
      const packageJson = JSON.parse(args.packageJsonContent);
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};

      const detectedPackages = [
        ...Object.entries(dependencies).map(([name, version]) => ({
          name,
          version: String(version),
          isDev: false,
        })),
        ...Object.entries(devDependencies).map(([name, version]) => ({
          name,
          version: String(version),
          isDev: true,
        })),
      ];

      const tools = await ctx.runQuery(internal.packageImport.getToolsForMatching);

      const packageNameMappings: Record<string, string> = {
        "react": "react",
        "next": "nextjs",
        "vue": "vue",
        "nuxt": "nuxt",
        "svelte": "svelte",
        "@sveltejs/kit": "sveltekit",
        "express": "express",
        "fastify": "fastify",
        "hono": "hono",
        "prisma": "prisma",
        "@prisma/client": "prisma",
        "drizzle-orm": "drizzle",
        "mongoose": "mongoose",
        "typeorm": "typeorm",
        "tailwindcss": "tailwind-css",
        "@clerk/nextjs": "clerk",
        "@clerk/clerk-react": "clerk",
        "convex": "convex",
        "@supabase/supabase-js": "supabase",
        "firebase": "firebase",
        "@tanstack/react-query": "tanstack-query",
        "zustand": "zustand",
        "jotai": "jotai",
        "recoil": "recoil",
        "redux": "redux",
        "@reduxjs/toolkit": "redux",
        "zod": "zod",
        "yup": "yup",
        "framer-motion": "framer-motion",
        "gsap": "gsap",
        "@radix-ui/react-dialog": "radix-ui",
        "@radix-ui/react-dropdown-menu": "radix-ui",
        "lucide-react": "lucide",
        "stripe": "stripe",
        "@stripe/stripe-js": "stripe",
        "resend": "resend",
        "nodemailer": "nodemailer",
        "openai": "openai",
        "@anthropic-ai/sdk": "anthropic",
        "langchain": "langchain",
        "vercel": "vercel",
        "@vercel/analytics": "vercel",
        "typescript": "typescript",
        "eslint": "eslint",
        "prettier": "prettier",
        "vitest": "vitest",
        "jest": "jest",
        "playwright": "playwright",
        "cypress": "cypress",
        "socket.io": "socketio",
        "trpc": "trpc",
        "@trpc/server": "trpc",
        "@trpc/client": "trpc",
        "graphql": "graphql",
        "@apollo/client": "apollo",
        "axios": "axios",
        "swr": "swr",
      };

      const matchedTools: Array<{
        packageName: string;
        toolId?: string;
        toolName: string;
        toolSlug: string;
        category: string;
        confidence: number;
        tagline: string;
      }> = [];
      const unmatchedPackages: string[] = [];
      const matchedSlugs = new Set<string>();

      for (const pkg of detectedPackages) {
        const mappedSlug = packageNameMappings[pkg.name];
        
        let matchedTool = null;
        let confidence = 0;

        if (mappedSlug) {
          matchedTool = tools.find((t) => t.slug === mappedSlug);
          confidence = 95;
        }

        if (!matchedTool) {
          const normalizedPkgName = pkg.name.toLowerCase().replace(/^@/, "").replace(/\//g, "-");
          matchedTool = tools.find((t) => 
            t.slug === normalizedPkgName ||
            t.name.toLowerCase() === pkg.name.toLowerCase() ||
            t.tags.some((tag) => tag.toLowerCase() === normalizedPkgName)
          );
          confidence = matchedTool ? 80 : 0;
        }

        if (matchedTool && !matchedSlugs.has(matchedTool.slug)) {
          matchedSlugs.add(matchedTool.slug);
          matchedTools.push({
            packageName: pkg.name,
            toolId: matchedTool.id,
            toolName: matchedTool.name,
            toolSlug: matchedTool.slug,
            category: matchedTool.category,
            confidence,
            tagline: matchedTool.tagline,
          });
        } else if (!matchedTool) {
          unmatchedPackages.push(pkg.name);
        }
      }

      let aiAnalysis = "";
      let suggestedStackName = packageJson.name || "My Stack";

      const aiGatewayKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
      
      if (aiGatewayKey && matchedTools.length > 0) {
        try {
          const prompt = `Analyze this tech stack from a package.json and provide insights:

DETECTED TOOLS:
${matchedTools.map((t) => `- ${t.toolName} (${t.category})`).join("\n")}

UNMATCHED PACKAGES (common utilities/helpers):
${unmatchedPackages.slice(0, 20).join(", ")}

PROJECT NAME: ${packageJson.name || "Unknown"}
DESCRIPTION: ${packageJson.description || "Not provided"}

Provide:
1. A brief analysis of this stack (2-3 sentences)
2. What type of project this likely is
3. A suggested creative name for this stack (e.g., "The Modern SaaS Stack", "Full-Stack Powerhouse")

Respond in JSON format:
{
  "analysis": "...",
  "projectType": "...",
  "suggestedName": "..."
}`;

          const response = await fetch("https://gateway.ai.vercel.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${aiGatewayKey}`,
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a tech stack analyst. Respond only with valid JSON.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 500,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                aiAnalysis = parsed.analysis || "";
                suggestedStackName = parsed.suggestedName || suggestedStackName;
              }
            }
          }
        } catch (aiError) {
          console.error("AI analysis error:", aiError);
        }
      }

      if (!aiAnalysis) {
        const categories = [...new Set(matchedTools.map((t) => t.category))];
        aiAnalysis = `This stack includes ${matchedTools.length} recognized tools across ${categories.length} categories: ${categories.slice(0, 4).join(", ")}${categories.length > 4 ? " and more" : ""}.`;
      }

      await ctx.runMutation(internal.packageImport.updateImportJob, {
        jobId: args.jobId,
        status: "completed",
        result: {
          detectedPackages,
          matchedTools,
          unmatchedPackages,
          aiAnalysis,
          suggestedStackName,
        },
      });

      await ctx.runMutation(internal.packageImport.storeDiscoveredPackages, {
        packages: detectedPackages.map((pkg) => {
          const matched = matchedTools.find((t) => t.packageName === pkg.name);
          return {
            name: pkg.name,
            version: pkg.version,
            isMatched: !!matched,
            matchedToolId: matched?.toolId,
            suggestedCategory: matched?.category,
          };
        }),
      });

      return { success: true };
    } catch (error) {
      await ctx.runMutation(internal.packageImport.updateImportJob, {
        jobId: args.jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
      return { success: false, error: String(error) };
    }
  },
});
